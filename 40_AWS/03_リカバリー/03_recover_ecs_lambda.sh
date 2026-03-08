#!/bin/bash
# ============================================================
# カスミPOS AWS ECS / Lambda 復旧スクリプト
# 03_recover_ecs_lambda.sh
#
# 機能:
#   1. Lambda関数エラー確認
#   2. Lambda関数の再デプロイ（S3 JARから）
#   3. ECS サービス再起動
#   4. Step Functions 失敗実行の確認と再実行
#   5. SQS キューの滞留確認
# ============================================================

set -euo pipefail

REGION="ap-northeast-1"
LAMBDA_JAR_BUCKET="prd-ignica-com-lmd-jar"
LOG_FILE="/tmp/kasumi-ecs-lambda-recovery-$(date +%Y%m%d_%H%M%S).log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }
log_ok()  { log "${GREEN}[OK]${NC} $1"; }
log_warn(){ log "${YELLOW}[WARN]${NC} $1"; }
log_err() { log "${RED}[ERROR]${NC} $1"; }
log_info(){ log "${BLUE}[INFO]${NC} $1"; }

# ============================================
# Lambda 関数状態確認
# ============================================
check_lambda_functions() {
    log_info "=== Lambda 関数一覧 ==="
    aws lambda list-functions \
        --region "$REGION" \
        --query 'Functions[*].{
            Name:FunctionName,
            Runtime:Runtime,
            Memory:MemorySize,
            Timeout:Timeout,
            Modified:LastModified
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# Lambda エラーログ確認（過去1時間）
# ============================================
check_lambda_errors() {
    log_info "=== Lambda エラーログ確認（過去1時間）==="
    
    local start_time
    start_time=$(python3 -c "import time; print(int((time.time()-3600)*1000))")
    
    while IFS= read -r func_name; do
        local log_group="/aws/lambda/${func_name}"
        
        # ロググループの存在確認
        if ! aws logs describe-log-groups \
            --region "$REGION" \
            --log-group-name-prefix "$log_group" \
            --query 'logGroups[0].logGroupName' \
            --output text 2>/dev/null | grep -q "$log_group"; then
            continue
        fi
        
        local errors
        errors=$(aws logs filter-log-events \
            --region "$REGION" \
            --log-group-name "$log_group" \
            --start-time "$start_time" \
            --filter-pattern "ERROR" \
            --query 'events[*].message' \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$errors" ]; then
            log_warn "Lambda エラー検出: $func_name"
            echo "$errors" | head -5 | tee -a "$LOG_FILE"
        fi
    done < <(aws lambda list-functions \
        --region "$REGION" \
        --query 'Functions[*].FunctionName' \
        --output text | tr '\t' '\n' | grep "^ksm-")
}

# ============================================
# Lambda 関数の再デプロイ（S3 JARから）
# ============================================
redeploy_lambda() {
    local func_name="$1"
    
    log_warn "=== Lambda 再デプロイ: $func_name ==="
    
    # 現在のデプロイ設定確認
    local func_config
    func_config=$(aws lambda get-function \
        --region "$REGION" \
        --function-name "$func_name" \
        --query 'Configuration.{Runtime:Runtime,S3Bucket:Code.S3Bucket,S3Key:Code.S3Key}' \
        --output json 2>/dev/null || echo "{}")
    
    log_info "現在の設定: $func_config"
    
    # JARファイル一覧を表示して選択
    log_info "利用可能なJARファイル:"
    aws s3 ls "s3://${LAMBDA_JAR_BUCKET}/" | grep ".jar" | tail -10 | tee -a "$LOG_FILE"
    
    read -p "使用するJARファイル名 (空欄でスキップ): " jar_key
    
    if [ -n "$jar_key" ]; then
        aws lambda update-function-code \
            --region "$REGION" \
            --function-name "$func_name" \
            --s3-bucket "$LAMBDA_JAR_BUCKET" \
            --s3-key "$jar_key"
        
        log_info "デプロイ待機..."
        aws lambda wait function-updated \
            --region "$REGION" \
            --function-name "$func_name"
        
        log_ok "再デプロイ完了: $func_name"
    else
        log_info "スキップ: $func_name"
    fi
}

# ============================================
# Lambda 設定更新（環境変数・タイムアウト）
# ============================================
update_lambda_config() {
    local func_name="$1"
    local timeout="${2:-900}"
    local memory="${3:-}"
    
    log_info "=== Lambda 設定更新: $func_name ==="
    
    local update_args="--function-name $func_name --timeout $timeout"
    if [ -n "$memory" ]; then
        update_args="$update_args --memory-size $memory"
    fi
    
    # shellcheck disable=SC2086
    aws lambda update-function-configuration \
        --region "$REGION" \
        $update_args
    
    log_ok "Lambda 設定更新完了: $func_name (timeout=${timeout}s)"
}

# ============================================
# Step Functions 失敗実行確認
# ============================================
check_step_functions() {
    log_info "=== Step Functions 実行状態確認 ==="
    
    while IFS= read -r sm_arn; do
        local sm_name
        sm_name=$(echo "$sm_arn" | rev | cut -d: -f1 | rev)
        
        local failed_count
        failed_count=$(aws stepfunctions list-executions \
            --region "$REGION" \
            --state-machine-arn "$sm_arn" \
            --status-filter FAILED \
            --max-results 5 \
            --query 'length(executions)' \
            --output text 2>/dev/null || echo "0")
        
        if [ "$failed_count" -gt 0 ]; then
            log_warn "Step Functions 失敗あり: $sm_name (${failed_count}件)"
            
            # 失敗した実行の詳細
            aws stepfunctions list-executions \
                --region "$REGION" \
                --state-machine-arn "$sm_arn" \
                --status-filter FAILED \
                --max-results 3 \
                --query 'executions[*].{Name:name,Start:startDate,Status:status}' \
                --output table | tee -a "$LOG_FILE"
        else
            log_ok "Step Functions 正常: $sm_name"
        fi
    done < <(aws stepfunctions list-state-machines \
        --region "$REGION" \
        --query 'stateMachines[*].stateMachineArn' \
        --output text | tr '\t' '\n')
}

# ============================================
# Step Functions 手動再実行
# ============================================
retry_step_function() {
    local sm_arn="$1"
    local input="${2:-{}}"
    
    local sm_name
    sm_name=$(echo "$sm_arn" | rev | cut -d: -f1 | rev)
    log_warn "=== Step Functions 再実行: $sm_name ==="
    
    local exec_arn
    exec_arn=$(aws stepfunctions start-execution \
        --region "$REGION" \
        --state-machine-arn "$sm_arn" \
        --input "$input" \
        --query 'executionArn' \
        --output text)
    
    log_ok "実行開始: $exec_arn"
    
    # 完了を監視（最大10分）
    local max_wait=600
    local elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        local status
        status=$(aws stepfunctions describe-execution \
            --region "$REGION" \
            --execution-arn "$exec_arn" \
            --query 'status' \
            --output text)
        
        case "$status" in
            SUCCEEDED)
                log_ok "実行完了: $exec_arn"
                return 0
                ;;
            FAILED|TIMED_OUT|ABORTED)
                log_err "実行失敗: $exec_arn (Status: $status)"
                aws stepfunctions describe-execution \
                    --region "$REGION" \
                    --execution-arn "$exec_arn" \
                    --query '{Status:status,Error:cause}' \
                    --output json | tee -a "$LOG_FILE"
                return 1
                ;;
            *)
                log_info "実行中... Status: $status (${elapsed}秒経過)"
                sleep 15
                elapsed=$((elapsed + 15))
                ;;
        esac
    done
    
    log_warn "監視タイムアウト。実行は継続中の可能性があります: $exec_arn"
}

# ============================================
# SQS キュー滞留確認
# ============================================
check_sqs_queues() {
    log_info "=== SQS キュー状態確認 ==="
    
    local queues=(
        "ksm-posprd-sqs-export-queue-sg.fifo"
        "ksm-posprd-sqs-store-code-queue-sg.fifo"
    )
    
    for queue_name in "${queues[@]}"; do
        local queue_url
        queue_url=$(aws sqs get-queue-url \
            --region "$REGION" \
            --queue-name "$queue_name" \
            --query 'QueueUrl' \
            --output text 2>/dev/null || echo "")
        
        if [ -z "$queue_url" ]; then
            log_warn "キューが見つかりません: $queue_name"
            continue
        fi
        
        local attrs
        attrs=$(aws sqs get-queue-attributes \
            --region "$REGION" \
            --queue-url "$queue_url" \
            --attribute-names ApproximateNumberOfMessages,ApproximateNumberOfMessagesNotVisible,ApproximateNumberOfMessagesDelayed \
            --query 'Attributes' \
            --output json)
        
        local visible not_visible
        visible=$(echo "$attrs" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ApproximateNumberOfMessages','0'))")
        not_visible=$(echo "$attrs" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ApproximateNumberOfMessagesNotVisible','0'))")
        
        if [ "$visible" -gt 100 ] || [ "$not_visible" -gt 50 ]; then
            log_warn "SQS 滞留警告: $queue_name (visible=$visible, in-flight=$not_visible)"
        else
            log_ok "SQS 正常: $queue_name (visible=$visible, in-flight=$not_visible)"
        fi
    done
}

# ============================================
# ECS サービス確認・再起動
# ============================================
check_ecs_services() {
    log_info "=== ECS サービス確認 ==="
    
    while IFS= read -r cluster_arn; do
        local cluster_name
        cluster_name=$(echo "$cluster_arn" | rev | cut -d/ -f1 | rev)
        log_info "クラスター: $cluster_name"
        
        aws ecs list-services \
            --region "$REGION" \
            --cluster "$cluster_arn" \
            --query 'serviceArns[*]' \
            --output text | tr '\t' '\n' | while read -r svc_arn; do
            
            local svc_name
            svc_name=$(echo "$svc_arn" | rev | cut -d/ -f1 | rev)
            
            local svc_info
            svc_info=$(aws ecs describe-services \
                --region "$REGION" \
                --cluster "$cluster_arn" \
                --services "$svc_arn" \
                --query 'services[0].{Running:runningCount,Desired:desiredCount,Status:status}' \
                --output json)
            
            local running desired
            running=$(echo "$svc_info" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Running',0))")
            desired=$(echo "$svc_info" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Desired',0))")
            
            if [ "$running" -lt "$desired" ]; then
                log_warn "ECS サービス不足: $svc_name (running=$running, desired=$desired)"
                
                read -p "サービスを強制再デプロイしますか？ (yes/no): " confirm
                if [ "$confirm" = "yes" ]; then
                    aws ecs update-service \
                        --region "$REGION" \
                        --cluster "$cluster_arn" \
                        --service "$svc_arn" \
                        --force-new-deployment
                    log_ok "強制再デプロイ開始: $svc_name"
                fi
            else
                log_ok "ECS サービス正常: $svc_name (running=$running, desired=$desired)"
            fi
        done
    done < <(aws ecs list-clusters \
        --region "$REGION" \
        --query 'clusterArns[*]' \
        --output text | tr '\t' '\n')
}

# ============================================
# メイン処理
# ============================================
main() {
    log_info "============================================"
    log_info "ECS/Lambda 復旧スクリプト開始"
    log_info "Region: $REGION"
    log_info "============================================"

    check_lambda_functions
    check_lambda_errors
    check_step_functions
    check_sqs_queues
    check_ecs_services

    log_ok "ECS/Lambda 復旧スクリプト完了"
}

main "$@"

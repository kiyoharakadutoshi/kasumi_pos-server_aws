#!/bin/bash
# ============================================================
# カスミPOS AWS 全サービス ヘルスチェックスクリプト
# 06_healthcheck.sh
#
# 機能: 全AWSサービスの稼働状態を一括確認
# 出力: OK/WARN/ERROR 形式で各サービス状態を表示
# ============================================================

set -euo pipefail

REGION="ap-northeast-1"
VPC_ID="vpc-0e2d2d27b6860b7fc"
VPN_ID="vpn-0ea9b7895f78e4c7e"
LOG_FILE="/tmp/kasumi-healthcheck-$(date +%Y%m%d_%H%M%S).log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }
log_ok()  { log "${GREEN}[OK]  ${NC} $1"; }
log_warn(){ log "${YELLOW}[WARN]${NC} $1"; }
log_err() { log "${RED}[ERR] ${NC} $1"; }
log_info(){ log "${BLUE}[INFO]${NC} $1"; }

PASS=0; WARN=0; FAIL=0

pass() { log_ok "$1"; PASS=$((PASS+1)); }
warn() { log_warn "$1"; WARN=$((WARN+1)); }
fail() { log_err "$1"; FAIL=$((FAIL+1)); }

# ============================================
# RDS チェック
# ============================================
check_rds() {
    log_info "── RDS Aurora MySQL ──────────────────"
    
    local clusters
    clusters=$(aws rds describe-db-clusters \
        --region "$REGION" \
        --query 'DBClusters[*].{ID:DBClusterIdentifier,Status:Status}' \
        --output json 2>/dev/null || echo "[]")
    
    local cluster_count
    cluster_count=$(echo "$clusters" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
    
    if [ "$cluster_count" -eq 0 ]; then
        fail "RDS クラスターが見つかりません"
        return
    fi
    
    echo "$clusters" | python3 -c "
import sys, json
clusters = json.load(sys.stdin)
for c in clusters:
    status = c['Status']
    name = c['ID']
    if status == 'available':
        print(f'PASS Aurora クラスター正常: {name} ({status})')
    else:
        print(f'FAIL Aurora クラスター異常: {name} ({status})')
" | while read -r line; do
        if echo "$line" | grep -q "^PASS"; then
            pass "$(echo "$line" | cut -d' ' -f2-)"
        else
            fail "$(echo "$line" | cut -d' ' -f2-)"
        fi
    done
    
    # インスタンスチェック
    local down_instances
    down_instances=$(aws rds describe-db-instances \
        --region "$REGION" \
        --query 'DBInstances[?Engine==`aurora-mysql` && DBInstanceStatus!=`available`].DBInstanceIdentifier' \
        --output text 2>/dev/null | tr '\t' '\n' | grep -v "^$" | wc -l)
    
    if [ "$down_instances" -gt 0 ]; then
        fail "Aurora インスタンス異常: ${down_instances}台"
    else
        pass "Aurora インスタンス全台正常"
    fi
}

# ============================================
# EC2 チェック
# ============================================
check_ec2() {
    log_info "── EC2 インスタンス ──────────────────"
    
    # bastion
    local bastion_state
    bastion_state=$(aws ec2 describe-instances \
        --region "$REGION" \
        --filters "Name=private-ip-address,Values=10.238.2.39" \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text 2>/dev/null || echo "not-found")
    
    if [ "$bastion_state" = "running" ]; then
        pass "Bastion EC2 稼働中 (10.238.2.39)"
    elif [ "$bastion_state" = "not-found" ] || [ "$bastion_state" = "None" ]; then
        warn "Bastion EC2 が見つかりません"
    else
        fail "Bastion EC2 異常: $bastion_state"
    fi
    
    # giftcard
    local giftcard_state
    giftcard_state=$(aws ec2 describe-instances \
        --region "$REGION" \
        --filters "Name=private-ip-address,Values=10.238.2.198" \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text 2>/dev/null || echo "not-found")
    
    if [ "$giftcard_state" = "running" ]; then
        pass "GiftCard EC2 稼働中 (10.238.2.198)"
    elif [ "$giftcard_state" = "not-found" ] || [ "$giftcard_state" = "None" ]; then
        warn "GiftCard EC2 が見つかりません"
    else
        fail "GiftCard EC2 異常: $giftcard_state"
    fi
}

# ============================================
# VPN チェック
# ============================================
check_vpn() {
    log_info "── VPN接続 ──────────────────────────"
    
    local vpn_state
    vpn_state=$(aws ec2 describe-vpn-connections \
        --region "$REGION" \
        --vpn-connection-ids "$VPN_ID" \
        --query 'VpnConnections[0].State' \
        --output text 2>/dev/null || echo "unknown")
    
    if [ "$vpn_state" = "available" ]; then
        pass "IPSec VPN 接続状態: $vpn_state"
    else
        fail "IPSec VPN 接続異常: $vpn_state"
    fi
    
    # トンネル状態
    local up_tunnels
    up_tunnels=$(aws ec2 describe-vpn-connections \
        --region "$REGION" \
        --vpn-connection-ids "$VPN_ID" \
        --query 'VpnConnections[0].VgwTelemetry[?Status==`UP`].Status' \
        --output text 2>/dev/null | wc -w)
    
    if [ "$up_tunnels" -ge 1 ]; then
        pass "VPN トンネル UP: ${up_tunnels}本"
    else
        fail "VPN トンネル UP なし"
    fi
}

# ============================================
# NAT Gateway チェック
# ============================================
check_nat() {
    log_info "── NAT Gateway ──────────────────────"
    
    local available_count
    available_count=$(aws ec2 describe-nat-gateways \
        --region "$REGION" \
        --filter "Name=vpc-id,Values=$VPC_ID" "Name=state,Values=available" \
        --query 'length(NatGateways)' \
        --output text 2>/dev/null || echo "0")
    
    if [ "$available_count" -gt 0 ]; then
        pass "NAT Gateway 稼働中: ${available_count}台"
    else
        fail "NAT Gateway 利用不可"
    fi
}

# ============================================
# Transfer Family チェック
# ============================================
check_transfer() {
    log_info "── Transfer Family ──────────────────"
    
    local servers
    servers=$(aws transfer list-servers \
        --region "$REGION" \
        --query 'Servers[*].{ID:ServerId,State:State}' \
        --output json 2>/dev/null || echo "[]")
    
    local total online
    total=$(echo "$servers" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
    online=$(echo "$servers" | python3 -c "import sys,json; print(sum(1 for s in json.load(sys.stdin) if s['State']=='ONLINE'))")
    
    if [ "$total" -eq 0 ]; then
        warn "Transfer Family サーバーが見つかりません"
    elif [ "$online" -eq "$total" ]; then
        pass "Transfer Family 全台オンライン: ${online}/${total}"
    else
        fail "Transfer Family 一部オフライン: ${online}/${total}"
    fi
}

# ============================================
# Lambda チェック（最近のエラー）
# ============================================
check_lambda() {
    log_info "── Lambda 関数 ──────────────────────"
    
    local func_count
    func_count=$(aws lambda list-functions \
        --region "$REGION" \
        --query 'length(Functions)' \
        --output text 2>/dev/null || echo "0")
    
    pass "Lambda 関数数: ${func_count}関数"
    
    # 過去5分のエラー確認
    local start_time
    start_time=$(python3 -c "import time; print(int((time.time()-300)*1000))")
    
    local error_funcs=0
    while IFS= read -r func_name; do
        if [[ ! "$func_name" =~ ^ksm- ]]; then continue; fi
        
        local log_group="/aws/lambda/${func_name}"
        local errors
        errors=$(aws logs filter-log-events \
            --region "$REGION" \
            --log-group-name "$log_group" \
            --start-time "$start_time" \
            --filter-pattern "?ERROR ?Exception" \
            --query 'length(events)' \
            --output text 2>/dev/null || echo "0")
        
        if [ "$errors" -gt 0 ]; then
            error_funcs=$((error_funcs + 1))
        fi
    done < <(aws lambda list-functions \
        --region "$REGION" \
        --query 'Functions[*].FunctionName' \
        --output text | tr '\t' '\n' 2>/dev/null)
    
    if [ "$error_funcs" -gt 0 ]; then
        warn "Lambda 過去5分エラーあり: ${error_funcs}関数"
    else
        pass "Lambda 過去5分エラーなし"
    fi
}

# ============================================
# SQS チェック
# ============================================
check_sqs() {
    log_info "── SQS キュー ───────────────────────"
    
    local queues=(
        "ksm-posprd-sqs-export-queue-sg.fifo"
        "ksm-posprd-sqs-store-code-queue-sg.fifo"
    )
    
    for q in "${queues[@]}"; do
        local url
        url=$(aws sqs get-queue-url \
            --region "$REGION" \
            --queue-name "$q" \
            --query 'QueueUrl' \
            --output text 2>/dev/null || echo "")
        
        if [ -z "$url" ]; then
            warn "SQS キューが見つかりません: $q"
            continue
        fi
        
        local msgs
        msgs=$(aws sqs get-queue-attributes \
            --region "$REGION" \
            --queue-url "$url" \
            --attribute-names ApproximateNumberOfMessages \
            --query 'Attributes.ApproximateNumberOfMessages' \
            --output text 2>/dev/null || echo "0")
        
        if [ "$msgs" -gt 500 ]; then
            warn "SQS 滞留警告: $q (${msgs}件)"
        else
            pass "SQS 正常: $q (${msgs}件)"
        fi
    done
}

# ============================================
# S3 チェック
# ============================================
check_s3() {
    log_info "── S3 バケット ──────────────────────"
    
    local critical_buckets=("prd-ignica-ksm" "prd-ignica-com-lmd-jar" "prd-aeon-gift-card")
    
    for bucket in "${critical_buckets[@]}"; do
        if aws s3api head-bucket --bucket "$bucket" --region "$REGION" 2>/dev/null; then
            pass "S3 バケット存在確認: $bucket"
        else
            fail "S3 バケット異常: $bucket"
        fi
    done
}

# ============================================
# Secrets Manager チェック
# ============================================
check_secrets() {
    log_info "── Secrets Manager ──────────────────"
    
    local critical_secrets=(
        "ksm-posprd-sm-db"
        "ksm-posprd-sm-db-replica"
        "ksm-posprd-sm-sftp"
    )
    
    for secret in "${critical_secrets[@]}"; do
        if aws secretsmanager describe-secret \
            --region "$REGION" \
            --secret-id "$secret" \
            --query 'Name' \
            --output text 2>/dev/null | grep -q "$secret"; then
            pass "シークレット存在: $secret"
        else
            fail "シークレット異常: $secret"
        fi
    done
}

# ============================================
# URL疎通チェック
# ============================================
check_urls() {
    log_info "── URLアクセス確認 ──────────────────"
    
    local urls=(
        "https://www.ignicapos.com/login"
        "https://stg.ignicapos.com/login"
    )
    
    for url in "${urls[@]}"; do
        local http_code
        http_code=$(curl -sI --max-time 15 "$url" \
            -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
        
        if echo "$http_code" | grep -qE "^(200|301|302|303)$"; then
            pass "URL応答OK: $url (HTTP $http_code)"
        else
            fail "URL応答NG: $url (HTTP $http_code)"
        fi
    done
}

# ============================================
# EventBridge スケジュール確認
# ============================================
check_eventbridge() {
    log_info "── EventBridge スケジュール ─────────"
    
    local disabled_rules
    disabled_rules=$(aws events list-rules \
        --region "$REGION" \
        --query 'Rules[?State==`DISABLED`].Name' \
        --output text 2>/dev/null | tr '\t' '\n' | grep -v "^$" | wc -l)
    
    if [ "$disabled_rules" -gt 0 ]; then
        warn "EventBridge 無効ルールあり: ${disabled_rules}件"
    else
        pass "EventBridge 全ルール有効"
    fi
}

# ============================================
# メイン処理
# ============================================
main() {
    log_info "============================================"
    log_info "カスミPOS AWS ヘルスチェック開始"
    log_info "$(date '+%Y-%m-%d %H:%M:%S JST')"
    log_info "Region: $REGION"
    log_info "============================================"
    echo ""

    check_rds
    echo ""
    check_ec2
    echo ""
    check_vpn
    echo ""
    check_nat
    echo ""
    check_transfer
    echo ""
    check_lambda
    echo ""
    check_sqs
    echo ""
    check_s3
    echo ""
    check_secrets
    echo ""
    check_urls
    echo ""
    check_eventbridge
    echo ""

    # サマリー
    log_info "============================================"
    log_info "ヘルスチェック結果サマリー"
    log_info "============================================"
    log_ok  "PASS: $PASS"
    log_warn "WARN: $WARN"
    log_err  "FAIL: $FAIL"
    echo ""
    
    if [ $FAIL -gt 0 ]; then
        log_err "⚠️  ${FAIL}件の障害が検出されました。復旧スクリプトを実行してください。"
        log_info "実行: ./00_recover_all.sh --service <rds|ec2|ecs|network|s3>"
        exit 1
    elif [ $WARN -gt 0 ]; then
        log_warn "⚠️  ${WARN}件の警告があります。ログを確認してください: $LOG_FILE"
        exit 0
    else
        log_ok "✅  全サービス正常稼働中"
        exit 0
    fi
}

main "$@"

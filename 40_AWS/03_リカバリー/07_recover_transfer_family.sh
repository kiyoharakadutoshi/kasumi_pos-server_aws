#!/bin/bash
# =============================================================================
# Transfer Family (SFTP) リカバリースクリプト
# 対象: カスミPOS本番環境 SFTP 3サーバー (OC系 / SG系 / SH系)
# 作成: 2026-03-08
# 実行環境: AWS CloudShell (ap-northeast-1)
# =============================================================================
# 使用方法:
#   bash 07_recover_transfer_family.sh status          # 全サーバー状態確認
#   bash 07_recover_transfer_family.sh check-metrics   # 転送量メトリクス確認
#   bash 07_recover_transfer_family.sh check-s3        # S3着信ファイル確認
#   bash 07_recover_transfer_family.sh check-sqs       # SQSキュー状態確認
#   bash 07_recover_transfer_family.sh start <sid>     # サーバー起動
#   bash 07_recover_transfer_family.sh stop  <sid>     # サーバー停止
#   bash 07_recover_transfer_family.sh start-all       # 全サーバー起動
#   bash 07_recover_transfer_family.sh stop-all        # 全サーバー停止（緊急時）
#   bash 07_recover_transfer_family.sh retry-sqs       # SQSメッセージ再処理トリガー
#   bash 07_recover_transfer_family.sh check-vpn       # VPN接続状態確認
#   bash 07_recover_transfer_family.sh check-secret    # SFTP認証情報確認
#   bash 07_recover_transfer_family.sh cost-check      # 今月のTransfer Familyコスト
# =============================================================================
set -euo pipefail

REGION="ap-northeast-1"
ACCOUNT_ID="332802448674"
BUCKET_MAIN="prd-ignica-ksm"
SQS_EXPORT="https://sqs.ap-northeast-1.amazonaws.com/${ACCOUNT_ID}/ksm-posprd-sqs-export-queue-sg.fifo"
SQS_STORE="https://sqs.ap-northeast-1.amazonaws.com/${ACCOUNT_ID}/ksm-posprd-sqs-store-code-queue-sg.fifo"
SECRET_SFTP="ksm-posprd-sm-sftp"
VPN_ID="vpn-0ea9b7895f78e4c7e"

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
ok()   { echo -e "${GREEN}[OK]${NC}   $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
head_() { echo -e "\n${BOLD}=== $* ===${NC}"; }

# サーバーID一覧を取得する関数
get_server_ids() {
    aws transfer list-servers --region "$REGION" \
        --query 'Servers[*].ServerId' --output text
}

usage() {
    cat <<EOF

${BOLD}Transfer Family (SFTP) リカバリースクリプト${NC}

使用方法: $0 <コマンド> [引数]

コマンド:
  status              全サーバーの状態・設定・ユーザー一覧を表示
  check-metrics       過去30日の転送量・ファイル数メトリクスを表示
  check-s3            S3着信ファイル（oc/sg/sh）の最新状況確認
  check-sqs           SQSキュー（SG系）のメッセージ滞留状況確認
  start   <server-id> 指定サーバーを起動
  stop    <server-id> 指定サーバーを停止
  start-all           全サーバーを起動
  stop-all            全サーバーを停止（セキュリティインシデント時）
  retry-sqs           SQSのDLQ確認とメッセージ再処理トリガー
  check-vpn           VPN接続状態の確認
  check-secret        SFTP認証情報（Secrets Manager）の確認
  cost-check          今月のTransfer Familyコスト確認

例:
  $0 status
  $0 check-metrics
  $0 start s-0123456789abcdef0
  $0 stop-all   # ← 緊急時のみ。外部ベンダーへの事前連絡が必要

EOF
    exit 1
}

# =============================================================================
# status: 全サーバーの状態確認
# =============================================================================
cmd_status() {
    head_ "Transfer Family サーバー一覧"
    aws --no-cli-pager transfer list-servers --region "$REGION" \
        --query 'Servers[*].{
            ServerId:ServerId,
            State:State,
            EndpointType:EndpointType,
            Domain:Domain
        }' --output table

    SERVER_IDS=$(get_server_ids)
    for SID in $SERVER_IDS; do
        head_ "サーバー詳細: $SID"
        aws --no-cli-pager transfer describe-server \
            --region "$REGION" --server-id "$SID" \
            --query 'Server.{
                ServerId:ServerId,
                State:State,
                EndpointType:EndpointType,
                IdentityProviderType:IdentityProviderType,
                Domain:Domain,
                Tags:Tags
            }' --output table

        echo ""
        info "--- ユーザー一覧: $SID ---"
        aws --no-cli-pager transfer list-users \
            --region "$REGION" --server-id "$SID" \
            --query 'Users[*].{
                UserName:UserName,
                HomeDirectory:HomeDirectory,
                Role:Role
            }' --output table 2>/dev/null || warn "ユーザーなし or 取得失敗"
    done
}

# =============================================================================
# check-metrics: CloudWatch 転送メトリクス確認（過去30日）
# =============================================================================
cmd_check_metrics() {
    head_ "Transfer Family 転送メトリクス（過去30日）"

    START_TIME=$(date -u -d "30 days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
        || date -u -v-30d +%Y-%m-%dT%H:%M:%SZ)
    END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    SERVER_IDS=$(get_server_ids)
    for SID in $SERVER_IDS; do
        echo ""
        info "--- $SID ---"

        for METRIC in BytesIn BytesOut FilesIn FilesOut; do
            VAL=$(aws cloudwatch get-metric-statistics \
                --region "$REGION" \
                --namespace "AWS/Transfer" \
                --metric-name "$METRIC" \
                --dimensions Name=ServerId,Value="$SID" \
                --start-time "$START_TIME" --end-time "$END_TIME" \
                --period 2592000 --statistics Sum \
                --query 'Datapoints[0].Sum' --output text 2>/dev/null || echo "None")

            if [ "$VAL" = "None" ] || [ "$VAL" = "" ]; then
                warn "  $METRIC: データなし（サーバーが未使用の可能性）"
            else
                # バイト系はGB換算
                if [[ "$METRIC" == Bytes* ]]; then
                    GB=$(echo "scale=3; $VAL / 1073741824" | bc 2>/dev/null || echo "N/A")
                    ok "  $METRIC: ${VAL} bytes (≈ ${GB} GB)"
                else
                    ok "  $METRIC: ${VAL} files"
                fi
            fi
        done
    done

    echo ""
    warn "【確認ポイント】"
    warn "  FilesIn = 0 が続くサーバーは停止を検討（$216/月削減）"
    warn "  BytesIn が前月比2倍超の場合はコスト急増要因を調査"
}

# =============================================================================
# check-s3: S3着信ファイル確認
# =============================================================================
cmd_check_s3() {
    head_ "S3 着信ファイル状況"

    for PREFIX in oc sg sh; do
        echo ""
        info "--- s3://${BUCKET_MAIN}/${PREFIX}/ （最新10件）---"
        aws s3 ls "s3://${BUCKET_MAIN}/${PREFIX}/" \
            --region "$REGION" 2>/dev/null \
            | sort -k1,2 -r | head -10 \
            || warn "  ファイルなし or バケットアクセス不可"
    done

    echo ""
    head_ "S3 バケットサイズ概算"
    for BUCKET in prd-ignica-ksm prd-aeon-gift-card prd-ignica-ksm-master-backup; do
        SIZE=$(aws s3 ls "s3://${BUCKET}/" --recursive \
            --region "$REGION" 2>/dev/null \
            | awk '{sum += $3} END {printf "%.1f MB", sum/1048576}' || echo "N/A")
        info "  s3://${BUCKET}: ${SIZE}"
    done
}

# =============================================================================
# check-sqs: SQSキュー状態確認（SG系）
# =============================================================================
cmd_check_sqs() {
    head_ "SQS キュー状態（SG系）"

    for QUEUE_URL in "$SQS_EXPORT" "$SQS_STORE"; do
        QUEUE_NAME=$(echo "$QUEUE_URL" | awk -F'/' '{print $NF}')
        echo ""
        info "--- $QUEUE_NAME ---"
        ATTRS=$(aws sqs get-queue-attributes \
            --region "$REGION" \
            --queue-url "$QUEUE_URL" \
            --attribute-names All \
            --output json 2>/dev/null) || { warn "キュー取得失敗"; continue; }

        VISIBLE=$(echo "$ATTRS" | python3 -c "import sys,json; d=json.load(sys.stdin)['Attributes']; print(d.get('ApproximateNumberOfMessages','?'))")
        IN_FLIGHT=$(echo "$ATTRS" | python3 -c "import sys,json; d=json.load(sys.stdin)['Attributes']; print(d.get('ApproximateNumberOfMessagesNotVisible','?'))")
        DELAYED=$(echo "$ATTRS" | python3 -c "import sys,json; d=json.load(sys.stdin)['Attributes']; print(d.get('ApproximateNumberOfMessagesDelayed','?'))")

        if [ "$VISIBLE" -gt 0 ] 2>/dev/null; then
            warn "  待機メッセージ: ${VISIBLE}件  処理中: ${IN_FLIGHT}件  遅延: ${DELAYED}件"
            warn "  ← Lambda/Step Functionsが処理できていない可能性"
        else
            ok "  待機メッセージ: ${VISIBLE}件  処理中: ${IN_FLIGHT}件  遅延: ${DELAYED}件（正常）"
        fi
    done
}

# =============================================================================
# start: サーバー起動
# =============================================================================
cmd_start() {
    local SID="${1:-}"
    [ -z "$SID" ] && { err "サーバーIDを指定してください"; exit 1; }

    log "Transfer Family サーバーを起動します: $SID"
    aws transfer start-server --region "$REGION" --server-id "$SID"
    ok "起動コマンド送信完了。状態確認: $0 status"
}

# =============================================================================
# stop: サーバー停止
# =============================================================================
cmd_stop() {
    local SID="${1:-}"
    [ -z "$SID" ] && { err "サーバーIDを指定してください"; exit 1; }

    warn "Transfer Family サーバーを停止します: $SID"
    warn "→ 接続中のSFTPセッションが切断されます。外部ベンダーへの事前連絡を確認してください。"
    read -r -p "続行しますか？ (yes/no): " CONFIRM
    [ "$CONFIRM" != "yes" ] && { info "停止を中止しました"; exit 0; }

    aws transfer stop-server --region "$REGION" --server-id "$SID"
    ok "停止コマンド送信完了。状態確認: $0 status"
}

# =============================================================================
# start-all: 全サーバー起動
# =============================================================================
cmd_start_all() {
    head_ "全サーバー起動"
    SERVER_IDS=$(get_server_ids)
    for SID in $SERVER_IDS; do
        log "起動中: $SID"
        aws transfer start-server --region "$REGION" --server-id "$SID"
        ok "起動コマンド送信: $SID"
    done
    log "完了。10〜30秒後に $0 status で状態を確認してください"
}

# =============================================================================
# stop-all: 全サーバー停止（セキュリティインシデント時）
# =============================================================================
cmd_stop_all() {
    head_ "全サーバー緊急停止"
    err "【警告】全SFTPサーバーを停止します。"
    err "OC系・SG系・SH系すべてのファイル受信が停止します。"
    err "実行前に必ず以下を確認してください："
    err "  1. カスミ様・各外部ベンダーへの停止連絡"
    err "  2. 停止理由の記録（インシデントチケット）"
    read -r -p "本当に全停止しますか？ (STOP-ALL と入力): " CONFIRM
    [ "$CONFIRM" != "STOP-ALL" ] && { info "停止を中止しました"; exit 0; }

    SERVER_IDS=$(get_server_ids)
    for SID in $SERVER_IDS; do
        log "停止中: $SID"
        aws transfer stop-server --region "$REGION" --server-id "$SID"
        ok "停止コマンド送信: $SID"
    done
    warn "全サーバー停止完了。復旧時は: $0 start-all"
}

# =============================================================================
# retry-sqs: SQS DLQ確認と再処理
# =============================================================================
cmd_retry_sqs() {
    head_ "SQS 滞留メッセージ確認・再処理"

    info "現在のキュー状態を確認します..."
    cmd_check_sqs

    echo ""
    info "【SQSメッセージが滞留している場合の対処】"
    info "1. Lambda / Step Functions のエラーログを CloudWatch で確認:"
    info "   aws logs describe-log-groups --region $REGION | grep -i step"
    info ""
    info "2. Step Functions の実行履歴を確認:"
    aws --no-cli-pager stepfunctions list-executions \
        --region "$REGION" \
        --status-filter FAILED \
        --query 'executions[:5].{Name:name,Status:status,StartDate:startDate}' \
        --output table 2>/dev/null \
        | head -20 || warn "Step Functions 取得失敗"

    echo ""
    warn "【SQSメッセージを手動再処理するには】"
    warn "  SQSコンソールからメッセージを確認し、可視性タイムアウトをリセットするか"
    warn "  Lambda を手動でテスト実行することで再処理を試みてください。"
    warn "  参考: https://ap-northeast-1.console.aws.amazon.com/sqs/v3/home?region=ap-northeast-1"
}

# =============================================================================
# check-vpn: VPN接続状態確認
# =============================================================================
cmd_check_vpn() {
    head_ "VPN 接続状態"

    info "--- VPN接続 ---"
    aws --no-cli-pager ec2 describe-vpn-connections \
        --region "$REGION" \
        --vpn-connection-ids "$VPN_ID" \
        --query 'VpnConnections[0].{
            State:State,
            Type:Type,
            StaticRoutes:Routes[*].DestinationCidrBlock,
            Tunnels:VgwTelemetry[*].{Status:Status,IP:OutsideIpAddress,BGP:AcceptedRouteCount}
        }' --output json 2>/dev/null || warn "VPN情報取得失敗"

    echo ""
    info "--- VPN トンネル状態（簡易表示）---"
    aws --no-cli-pager ec2 describe-vpn-connections \
        --region "$REGION" \
        --vpn-connection-ids "$VPN_ID" \
        --query 'VpnConnections[0].VgwTelemetry[*].{
            OutsideIP:OutsideIpAddress,
            Status:Status,
            AcceptedRoutes:AcceptedRouteCount,
            LastChange:LastStatusChange
        }' --output table 2>/dev/null || warn "VPNトンネル情報取得失敗"

    echo ""
    warn "【VPN障害時の対処】"
    warn "  VPNがDownの場合、外部ベンダーからSFTP接続不可になります。"
    warn "  USMHネットワーク管理者（またはIX管理者）へ連絡してください。"
    warn "  VPNはUSMH側管理の可能性があります（AWSアカウント側ではDirect Connectなし）。"
}

# =============================================================================
# check-secret: SFTP認証情報確認
# =============================================================================
cmd_check_secret() {
    head_ "SFTP 認証情報確認"

    info "Secrets Manager: $SECRET_SFTP"
    echo ""

    # シークレット一覧（値は表示しない）
    META=$(aws secretsmanager describe-secret \
        --region "$REGION" \
        --secret-id "$SECRET_SFTP" \
        --query '{Name:Name,ARN:ARN,LastChanged:LastChangedDate,RotationEnabled:RotationEnabled}' \
        --output table 2>/dev/null) || { warn "シークレット取得失敗"; return; }
    echo "$META"

    echo ""
    warn "【認証情報の内容確認（緊急時のみ）】"
    warn "  下記コマンドで認証情報の内容を確認できます（パスワード等が表示されます）:"
    warn "  aws secretsmanager get-secret-value --region $REGION --secret-id $SECRET_SFTP --query SecretString --output text | jq ."
}

# =============================================================================
# cost-check: 今月のTransfer Familyコスト
# =============================================================================
cmd_cost_check() {
    head_ "Transfer Family コスト確認"

    MONTH_START=$(date +%Y-%m-01)
    NEXT_MONTH=$(date -d "next month" +%Y-%m-01 2>/dev/null || date -v+1m +%Y-%m-01)

    info "--- 今月 ($MONTH_START 〜) のコスト ---"
    aws ce get-cost-and-usage \
        --time-period "Start=${MONTH_START},End=${NEXT_MONTH}" \
        --granularity MONTHLY \
        --metrics UnblendedCost \
        --filter '{"Dimensions":{"Key":"SERVICE","Values":["AWS Transfer Family"]}}' \
        --group-by Type=DIMENSION,Key=USAGE_TYPE \
        --query 'ResultsByTime[0].Groups[*].{UsageType:Keys[0],Cost:Metrics.UnblendedCost.Amount}' \
        --output table 2>/dev/null || warn "コスト取得失敗（Cost Explorerへのアクセス権限確認）"

    echo ""
    info "--- 過去6ヶ月の月次合計 ---"
    SIX_MONTHS_AGO=$(date -d "6 months ago" +%Y-%m-01 2>/dev/null || date -v-6m +%Y-%m-01)
    aws ce get-cost-and-usage \
        --time-period "Start=${SIX_MONTHS_AGO},End=${NEXT_MONTH}" \
        --granularity MONTHLY \
        --metrics UnblendedCost \
        --filter '{"Dimensions":{"Key":"SERVICE","Values":["AWS Transfer Family"]}}' \
        --query 'ResultsByTime[*].{Month:TimePeriod.Start,Cost:Total.UnblendedCost.Amount}' \
        --output table 2>/dev/null || warn "過去コスト取得失敗"

    echo ""
    info "【料金体系（参考）】"
    info "  サーバー稼働: \$0.30 / 時間 / サーバー  (3台 × \$0.30 × 720h = \$648/月)"
    info "  転送量（受信・送信）: \$0.04 / GB"
    warn "【確認ポイント】"
    warn "  月額 \$432（9月実績）が最低ライン。\$650超は転送量の増加を意味する。"
    warn "  12月・1月は \$669 に急増 → BytesIn の増加要因を check-metrics で確認すること"
}

# =============================================================================
# メイン処理
# =============================================================================
CMD="${1:-}"
shift || true

case "$CMD" in
    status)         cmd_status ;;
    check-metrics)  cmd_check_metrics ;;
    check-s3)       cmd_check_s3 ;;
    check-sqs)      cmd_check_sqs ;;
    start)          cmd_start "${1:-}" ;;
    stop)           cmd_stop  "${1:-}" ;;
    start-all)      cmd_start_all ;;
    stop-all)       cmd_stop_all ;;
    retry-sqs)      cmd_retry_sqs ;;
    check-vpn)      cmd_check_vpn ;;
    check-secret)   cmd_check_secret ;;
    cost-check)     cmd_cost_check ;;
    *)              usage ;;
esac

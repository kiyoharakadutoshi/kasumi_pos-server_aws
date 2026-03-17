#!/bin/bash
# ============================================================
# カスミPOS AWS 本番環境 全体リカバリースクリプト
# 00_recover_all.sh
#
# 使用方法:
#   ./00_recover_all.sh [--check-only] [--service rds|ec2|ecs|network|s3]
#
# --check-only: ヘルスチェックのみ実行（復旧操作なし）
# --service: 特定サービスのみ復旧
# ============================================================

set -euo pipefail

REGION="ap-northeast-1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="/tmp/kasumi-recovery-$(date +%Y%m%d_%H%M%S).log"
CHECK_ONLY=false
TARGET_SERVICE=""

# 色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}
log_ok()   { log "${GREEN}[OK]${NC} $1"; }
log_warn() { log "${YELLOW}[WARN]${NC} $1"; }
log_err()  { log "${RED}[ERROR]${NC} $1"; }
log_info() { log "${BLUE}[INFO]${NC} $1"; }

# 引数解析
while [[ $# -gt 0 ]]; do
    case "$1" in
        --check-only) CHECK_ONLY=true; shift ;;
        --service) TARGET_SERVICE="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# AWS CLIが使えるか確認
check_aws_cli() {
    if ! command -v aws &>/dev/null; then
        log_err "AWS CLI が見つかりません。インストールしてください。"
        exit 1
    fi
    if ! aws sts get-caller-identity --region "$REGION" &>/dev/null; then
        log_err "AWS 認証情報が正しく設定されていません。"
        exit 1
    fi
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    log_ok "AWS CLI OK (Account: $ACCOUNT_ID, Region: $REGION)"
}

# ========================================
# ヘルスチェック
# ========================================
run_healthcheck() {
    log_info "=== ヘルスチェック開始 ==="
    bash "$SCRIPT_DIR/06_healthcheck.sh" 2>&1 | tee -a "$LOG_FILE"
}

# ========================================
# メイン処理
# ========================================
main() {
    log_info "============================================"
    log_info "カスミPOS AWS リカバリースクリプト開始"
    log_info "ログファイル: $LOG_FILE"
    log_info "CHECK_ONLY: $CHECK_ONLY"
    log_info "TARGET_SERVICE: ${TARGET_SERVICE:-全サービス}"
    log_info "============================================"

    check_aws_cli

    # まずヘルスチェック
    run_healthcheck

    if [ "$CHECK_ONLY" = "true" ]; then
        log_info "--check-only モード: 復旧操作をスキップ"
        exit 0
    fi

    # ユーザー確認
    echo ""
    echo -e "${RED}⚠️  警告: 本番環境への復旧操作を実行します${NC}"
    echo "対象: ${TARGET_SERVICE:-全サービス}"
    read -p "続行しますか？ (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "ユーザーによりキャンセルされました"
        exit 0
    fi

    # サービス別実行
    case "${TARGET_SERVICE}" in
        rds)
            bash "$SCRIPT_DIR/01_recover_rds.sh"
            ;;
        ec2)
            bash "$SCRIPT_DIR/02_recover_ec2.sh"
            ;;
        ecs)
            bash "$SCRIPT_DIR/03_recover_ecs_lambda.sh"
            ;;
        network)
            bash "$SCRIPT_DIR/04_recover_network.sh"
            ;;
        s3)
            bash "$SCRIPT_DIR/05_recover_s3.sh"
            ;;
        "")
            # 全サービス: 依存関係順に実行
            log_info "=== ネットワーク確認 ==="
            bash "$SCRIPT_DIR/04_recover_network.sh"

            log_info "=== RDS 復旧 ==="
            bash "$SCRIPT_DIR/01_recover_rds.sh"

            log_info "=== EC2 復旧 ==="
            bash "$SCRIPT_DIR/02_recover_ec2.sh"

            log_info "=== ECS/Lambda 復旧 ==="
            bash "$SCRIPT_DIR/03_recover_ecs_lambda.sh"

            log_info "=== S3 確認 ==="
            bash "$SCRIPT_DIR/05_recover_s3.sh"
            ;;
        *)
            log_err "不明なサービス: $TARGET_SERVICE"
            echo "有効な値: rds, ec2, ecs, network, s3"
            exit 1
            ;;
    esac

    # 最終ヘルスチェック
    log_info "=== 復旧後ヘルスチェック ==="
    run_healthcheck

    log_ok "============================================"
    log_ok "リカバリー完了"
    log_ok "ログ: $LOG_FILE"
    log_ok "============================================"
}

main "$@"

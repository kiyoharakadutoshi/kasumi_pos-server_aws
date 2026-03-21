#!/bin/bash
# ============================================================
# カスミPOS AWS S3 確認・復旧スクリプト
# 05_recover_s3.sh
#
# 機能:
#   1. S3バケット一覧・状態確認
#   2. バケットポリシー・暗号化確認
#   3. 重要ファイルのバックアップ
#   4. 削除ファイルの復元（バージョニング有効時）
#   5. バケット間のデータコピー（災害復旧）
# ============================================================

set -euo pipefail

REGION="ap-northeast-1"
LOG_FILE="/tmp/kasumi-s3-recovery-$(date +%Y%m%d_%H%M%S).log"

# 管理対象バケット
BUCKETS=(
    "prd-ignica-ksm"
    "prd-ignica-ksm-master-backup"
    "prd-ignica-ksm-pmlogs"
    "prd-ignica-com-lmd-jar"
    "prd-aeon-gift-card"
    "prd-ignica-com-configrecord"
)

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }
log_ok()  { log "${GREEN}[OK]${NC} $1"; }
log_warn(){ log "${YELLOW}[WARN]${NC} $1"; }
log_err() { log "${RED}[ERROR]${NC} $1"; }
log_info(){ log "${BLUE}[INFO]${NC} $1"; }

# ============================================
# バケット存在確認
# ============================================
check_buckets() {
    log_info "=== S3 バケット確認 ==="
    
    for bucket in "${BUCKETS[@]}"; do
        if aws s3api head-bucket --bucket "$bucket" --region "$REGION" 2>/dev/null; then
            # バケット情報取得
            local versioning
            versioning=$(aws s3api get-bucket-versioning \
                --bucket "$bucket" \
                --query 'Status' \
                --output text 2>/dev/null || echo "Disabled")
            
            local encryption
            encryption=$(aws s3api get-bucket-encryption \
                --bucket "$bucket" \
                --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm' \
                --output text 2>/dev/null || echo "None")
            
            local public_access
            public_access=$(aws s3api get-public-access-block \
                --bucket "$bucket" \
                --query 'PublicAccessBlockConfiguration.BlockPublicAcls' \
                --output text 2>/dev/null || echo "unknown")
            
            log_ok "バケット存在: $bucket (versioning=$versioning, encryption=$encryption, public_blocked=$public_access)"
        else
            log_err "バケット不存在または権限なし: $bucket"
        fi
    done
}

# ============================================
# バケット使用量確認
# ============================================
check_bucket_sizes() {
    log_info "=== バケット使用量 ==="
    
    for bucket in "${BUCKETS[@]}"; do
        local size
        size=$(aws s3 ls --summarize --human-readable --recursive "s3://${bucket}/" \
            2>/dev/null | grep "Total Size:" || echo "Total Size: -")
        
        local count
        count=$(aws s3 ls --summarize --recursive "s3://${bucket}/" \
            2>/dev/null | grep "Total Objects:" || echo "Total Objects: -")
        
        log_info "$bucket: $size | $count"
    done
}

# ============================================
# メインバケット oc/sg/sh 最新ファイル確認
# ============================================
check_latest_files() {
    log_info "=== 最新受信ファイル確認 (prd-ignica-ksm) ==="
    
    for prefix in oc sg sh; do
        log_info "--- ${prefix}/ プレフィックス ---"
        aws s3 ls "s3://prd-ignica-ksm/${prefix}/" \
            --region "$REGION" 2>/dev/null | tail -5 | tee -a "$LOG_FILE" || log_warn "${prefix}/ にファイルなし"
    done
}

# ============================================
# バックアップバケットの確認
# ============================================
check_backup_bucket() {
    log_info "=== バックアップバケット確認 (prd-ignica-ksm-master-backup) ==="
    
    local latest_backup
    latest_backup=$(aws s3 ls "s3://prd-ignica-ksm-master-backup/" \
        --region "$REGION" 2>/dev/null | tail -5 || echo "")
    
    if [ -n "$latest_backup" ]; then
        log_ok "バックアップあり:"
        echo "$latest_backup" | tee -a "$LOG_FILE"
    else
        log_warn "バックアップが見つかりません"
    fi
}

# ============================================
# 削除ファイルの復元（バージョニング有効時）
# ============================================
restore_deleted_file() {
    local bucket="$1"
    local key="$2"
    
    log_info "=== ファイル復元: s3://${bucket}/${key} ==="
    
    # バージョン一覧
    log_info "バージョン一覧:"
    aws s3api list-object-versions \
        --bucket "$bucket" \
        --region "$REGION" \
        --prefix "$key" \
        --query 'Versions[*].{VersionId:VersionId,Modified:LastModified,Size:Size}' \
        --output table | tee -a "$LOG_FILE"
    
    read -p "復元するバージョンID (空欄で最新): " version_id
    
    if [ -z "$version_id" ]; then
        # 最新バージョンID取得
        version_id=$(aws s3api list-object-versions \
            --bucket "$bucket" \
            --region "$REGION" \
            --prefix "$key" \
            --query 'sort_by(Versions, &LastModified)[-1].VersionId' \
            --output text)
    fi
    
    # 削除マーカーを削除して復元
    aws s3api delete-object \
        --bucket "$bucket" \
        --region "$REGION" \
        --key "$key" \
        --version-id "$version_id"
    
    log_ok "ファイル復元完了: $key (VersionId: $version_id)"
}

# ============================================
# 重要ファイルのバックアップコピー
# ============================================
backup_important_files() {
    local src_bucket="prd-ignica-ksm"
    local dst_bucket="prd-ignica-ksm-master-backup"
    local backup_prefix="emergency-backup-$(date +%Y%m%d%H%M)"
    
    log_warn "=== 緊急バックアップ作成 ==="
    log_info "コピー元: s3://${src_bucket}/"
    log_info "コピー先: s3://${dst_bucket}/${backup_prefix}/"
    
    read -p "バックアップを実行しますか？ (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "バックアップをキャンセルしました"
        return 0
    fi
    
    # oc/, sg/, sh/ をバックアップ
    for prefix in oc sg sh; do
        log_info "コピー中: ${prefix}/"
        aws s3 sync \
            "s3://${src_bucket}/${prefix}/" \
            "s3://${dst_bucket}/${backup_prefix}/${prefix}/" \
            --region "$REGION" \
            --sse aws:kms \
            2>&1 | tail -3 | tee -a "$LOG_FILE"
    done
    
    log_ok "バックアップ完了: s3://${dst_bucket}/${backup_prefix}/"
}

# ============================================
# Lambda JARバックアップ
# ============================================
backup_lambda_jars() {
    local src_bucket="prd-ignica-com-lmd-jar"
    local dst_bucket="prd-ignica-ksm-master-backup"
    local backup_prefix="lambda-jars-backup-$(date +%Y%m%d%H%M)"
    
    log_info "=== Lambda JAR バックアップ ==="
    
    aws s3 sync \
        "s3://${src_bucket}/" \
        "s3://${dst_bucket}/${backup_prefix}/" \
        --region "$REGION" \
        --sse aws:kms \
        2>&1 | tail -3 | tee -a "$LOG_FILE"
    
    log_ok "Lambda JAR バックアップ完了"
}

# ============================================
# S3 アクセスポリシー確認（公開設定チェック）
# ============================================
check_public_access() {
    log_info "=== S3 パブリックアクセスブロック設定確認 ==="
    
    for bucket in "${BUCKETS[@]}"; do
        local block_all
        block_all=$(aws s3api get-public-access-block \
            --bucket "$bucket" \
            --query 'PublicAccessBlockConfiguration.{
                BlockPublicAcls:BlockPublicAcls,
                IgnorePublicAcls:IgnorePublicAcls,
                BlockPublicPolicy:BlockPublicPolicy,
                RestrictPublicBuckets:RestrictPublicBuckets
            }' \
            --output text 2>/dev/null || echo "设定なし")
        
        if echo "$block_all" | grep -q "False"; then
            log_warn "⚠️  パブリックアクセスが一部許可されています: $bucket"
        else
            log_ok "パブリックアクセス全ブロック: $bucket"
        fi
    done
}

# ============================================
# メイン処理
# ============================================
main() {
    log_info "============================================"
    log_info "S3 確認・復旧スクリプト開始"
    log_info "Region: $REGION"
    log_info "============================================"

    check_buckets
    check_bucket_sizes
    check_latest_files
    check_backup_bucket
    check_public_access

    echo ""
    log_info "追加操作:"
    echo "  1) 緊急バックアップ作成"
    echo "  2) 削除ファイル復元"
    echo "  3) Lambda JAR バックアップ"
    echo "  4) スキップ（確認のみ）"
    read -p "選択 (1/2/3/4): " choice
    
    case "$choice" in
        1) backup_important_files ;;
        2)
            read -p "バケット名: " bucket_name
            read -p "ファイルキー (パス): " file_key
            restore_deleted_file "$bucket_name" "$file_key"
            ;;
        3) backup_lambda_jars ;;
        4) log_info "スキップ" ;;
        *) log_info "無効な選択。スキップ。" ;;
    esac

    log_ok "S3 確認・復旧スクリプト完了"
}

main "$@"

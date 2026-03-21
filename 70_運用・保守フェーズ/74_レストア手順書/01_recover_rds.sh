#!/bin/bash
# =============================================================================
# RDS Aurora MySQL リカバリースクリプト
# 対象: ksm-posprd-db-cluster / ksm-posprd-db-cluster-replica
# 作成: 2026-03-08 (AWS CloudShell 実測値をもとに作成)
# =============================================================================
set -euo pipefail

REGION="ap-northeast-1"
MAIN_CLUSTER="ksm-posprd-db-cluster"
REPLICA_CLUSTER="ksm-posprd-db-cluster-replica"
INSTANCE_1="ksm-posprd-db-instance-1"
INSTANCE_2="ksm-posprd-db-instance-2"
DB_SG="sg-05b58b81225f5bd93"
SUBNET_GROUP="ksm-posprd-db-sg"
PARAM_GROUP="ksm-posprd-db-cluster-pg"
KMS_KEY_ID="arn:aws:kms:ap-northeast-1:332802448674:key/f63b92c0-a810-4665-a45e-ffb926b21496"
IAM_ROLE_DB="arn:aws:iam::332802448674:role/ksm-posprd-iam-role-db-cluster"
WRITE_ENDPOINT="ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com"
READER_ENDPOINT="ksm-posprd-db-cluster.cluster-ro-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com"

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }

usage() {
  cat <<EOF
使用方法: $0 <コマンド> [オプション]

コマンド:
  status            クラスター・インスタンスの現在状態を表示
  check-backup      バックアップ・スナップショット状況を確認
  check-params      パラメーターグループの設定確認（ユーザー設定値）
  check-logs        ログファイル一覧と最新エラーログ確認
  create-snapshot   スナップショットを手動作成
  failover          手動フェイルオーバー実行
  restore-pitr      Point-in-time リカバリー（新クラスターとして復元）
  restore-snap      スナップショットから新クラスターを復元
  reboot            インスタンスを再起動
  wait-available    クラスターが available になるまで待機
  check-iam         S3連携IAMロールの確認

オプション:
  --restore-time    PITRの復元時刻 (ISO8601形式 例: 2026-03-08T12:00:00+09:00)
  --snapshot-id     復元元スナップショットID
  --new-cluster     復元先の新クラスターID
  --instance-id     対象インスタンスID (failover/reboot)
  --dry-run         実行内容の確認のみ（実際には実行しない）

例:
  $0 status
  $0 check-backup
  $0 check-params
  $0 check-logs
  $0 failover --instance-id ksm-posprd-db-instance-2
  $0 create-snapshot
  $0 restore-pitr --restore-time "2026-03-08T10:00:00+09:00" --new-cluster "ksm-posprd-db-cluster-restored"
  $0 restore-snap --snapshot-id "rds:ksm-posprd-db-cluster-2026-03-07-15-05" --new-cluster "ksm-posprd-db-cluster-restored"
EOF
  exit 1
}

# -----------------------------------------------------------------------------
# status: クラスター・インスタンスの状態確認
# -----------------------------------------------------------------------------
cmd_status() {
  log "=== RDS クラスター状態確認 ==="

  info "--- メインクラスター: $MAIN_CLUSTER ---"
  aws --no-cli-pager rds describe-db-clusters \
    --region "$REGION" \
    --db-cluster-identifier "$MAIN_CLUSTER" \
    --query 'DBClusters[0].{
      Status:Status,
      MultiAZ:MultiAZ,
      EngineVersion:EngineVersion,
      Writer:DBClusterMembers[?IsClusterWriter==`true`].DBInstanceIdentifier|[0],
      EarliestRestore:EarliestRestorableTime,
      LatestRestore:LatestRestorableTime
    }' \
    --output table

  info "--- インスタンス状態 ---"
  aws --no-cli-pager rds describe-db-instances \
    --region "$REGION" \
    --filters "Name=db-cluster-id,Values=$MAIN_CLUSTER" \
    --query 'DBInstances[*].{
      ID:DBInstanceIdentifier,
      Status:DBInstanceStatus,
      Class:DBInstanceClass,
      AZ:AvailabilityZone,
      PromotionTier:PromotionTier
    }' \
    --output table

  info "--- レプリカクラスター: $REPLICA_CLUSTER ---"
  aws --no-cli-pager rds describe-db-clusters \
    --region "$REGION" \
    --db-cluster-identifier "$REPLICA_CLUSTER" \
    --query 'DBClusters[0].{Status:Status,EngineVersion:EngineVersion}' \
    --output table 2>/dev/null || warn "レプリカクラスター情報取得失敗"
}

# -----------------------------------------------------------------------------
# check-backup: バックアップ・スナップショット確認
# -----------------------------------------------------------------------------
cmd_check_backup() {
  log "=== バックアップ状況確認 ==="

  info "--- 自動バックアップ設定 ---"
  aws --no-cli-pager rds describe-db-clusters \
    --region "$REGION" \
    --db-cluster-identifier "$MAIN_CLUSTER" \
    --query 'DBClusters[0].{
      RetentionDays:BackupRetentionPeriod,
      BackupWindow:PreferredBackupWindow,
      MaintenanceWindow:PreferredMaintenanceWindow,
      EarliestRestorableTime:EarliestRestorableTime,
      LatestRestorableTime:LatestRestorableTime
    }' \
    --output table

  # 保持期間チェック
  RETENTION=$(aws --no-cli-pager rds describe-db-clusters \
    --region "$REGION" \
    --db-cluster-identifier "$MAIN_CLUSTER" \
    --query 'DBClusters[0].BackupRetentionPeriod' \
    --output text)
  if [ "$RETENTION" -lt 7 ]; then
    warn "バックアップ保持期間 = ${RETENTION}日。7日以上を推奨（現状は前日分しか復元不可）"
  else
    ok "バックアップ保持期間: ${RETENTION}日"
  fi

  info "--- 直近スナップショット（最新5件）---"
  aws --no-cli-pager rds describe-db-cluster-snapshots \
    --region "$REGION" \
    --db-cluster-identifier "$MAIN_CLUSTER" \
    --query 'sort_by(DBClusterSnapshots, &SnapshotCreateTime)[-5:].{
      ID:DBClusterSnapshotIdentifier,
      Type:SnapshotType,
      Created:SnapshotCreateTime,
      Status:Status,
      SizeGB:AllocatedStorage,
      Encrypted:StorageEncrypted
    }' \
    --output table

  info "--- AWS Backup プラン確認 ---"
  BACKUP_PLANS=$(aws --no-cli-pager backup list-backup-plans \
    --region "$REGION" \
    --query 'length(BackupPlansList)' \
    --output text 2>/dev/null || echo "0")
  if [ "$BACKUP_PLANS" -eq 0 ]; then
    warn "AWS Backup プランが未設定です。長期バックアップは手動スナップショットのみです。"
  else
    ok "AWS Backup プラン: ${BACKUP_PLANS}件"
  fi
}

# -----------------------------------------------------------------------------
# check-params: パラメーターグループ確認
# -----------------------------------------------------------------------------
cmd_check_params() {
  log "=== パラメーターグループ確認: $PARAM_GROUP ==="

  info "--- ユーザー設定パラメーター（Source: user）---"
  aws --no-cli-pager rds describe-db-cluster-parameters \
    --region "$REGION" \
    --db-cluster-parameter-group-name "$PARAM_GROUP" \
    --source user \
    --query 'Parameters[*].{
      Name:ParameterName,
      Value:ParameterValue,
      ApplyMethod:ApplyMethod
    }' \
    --output table

  info "--- 重要パラメーター確認 ---"

  # time_zone確認
  TZ=$(aws --no-cli-pager rds describe-db-cluster-parameters \
    --region "$REGION" \
    --db-cluster-parameter-group-name "$PARAM_GROUP" \
    --source user \
    --query 'Parameters[?ParameterName==`time_zone`].ParameterValue|[0]' \
    --output text)
  if [ "$TZ" = "Asia/Tokyo" ]; then
    ok "time_zone = Asia/Tokyo (正常)"
  else
    warn "time_zone = ${TZ} (Asia/Tokyoが推奨)"
  fi

  # aws_default_s3_role確認
  S3_ROLE=$(aws --no-cli-pager rds describe-db-cluster-parameters \
    --region "$REGION" \
    --db-cluster-parameter-group-name "$PARAM_GROUP" \
    --source user \
    --query 'Parameters[?ParameterName==`aws_default_s3_role`].ParameterValue|[0]' \
    --output text)
  if [ "$S3_ROLE" = "$IAM_ROLE_DB" ]; then
    ok "aws_default_s3_role = $S3_ROLE (正常)"
  else
    warn "aws_default_s3_role = ${S3_ROLE} (期待値: $IAM_ROLE_DB)"
  fi
}

# -----------------------------------------------------------------------------
# check-logs: ログファイル確認・取得
# -----------------------------------------------------------------------------
cmd_check_logs() {
  log "=== DBログファイル確認 ==="

  info "--- ログファイル一覧（最新10件）---"
  aws --no-cli-pager rds describe-db-log-files \
    --region "$REGION" \
    --db-instance-identifier "$INSTANCE_1" \
    --query 'sort_by(DescribeDBLogFiles, &LastWritten)[-10:].{
      File:LogFileName,
      SizeKB:Size,
      LastWritten:LastWritten
    }' \
    --output table

  info "--- 現在のエラーログ取得（最新100行）---"
  aws --no-cli-pager rds download-db-log-file-portion \
    --region "$REGION" \
    --db-instance-identifier "$INSTANCE_1" \
    --log-file-name "error/mysql-error.log" \
    --query 'LogFileData' \
    --output text | tail -100

  info "--- externalログのサイズ確認 ---"
  EXT_SIZE=$(aws --no-cli-pager rds describe-db-log-files \
    --region "$REGION" \
    --db-instance-identifier "$INSTANCE_1" \
    --filename-contains "external" \
    --query 'DescribeDBLogFiles[0].Size' \
    --output text 2>/dev/null || echo "0")
  EXT_MB=$(( EXT_SIZE / 1024 ))
  if [ "$EXT_MB" -gt 10240 ]; then   # 10MB超
    warn "externalログが ${EXT_MB} KB です。内容確認を推奨します。"
  else
    info "externalログサイズ: ${EXT_MB} KB"
  fi
}

# -----------------------------------------------------------------------------
# check-iam: S3連携IAMロール確認
# -----------------------------------------------------------------------------
cmd_check_iam() {
  log "=== S3連携IAMロール確認 ==="

  info "--- DBクラスターに関連付けられたIAMロール ---"
  aws --no-cli-pager rds describe-db-clusters \
    --region "$REGION" \
    --db-cluster-identifier "$MAIN_CLUSTER" \
    --query 'DBClusters[0].AssociatedRoles[*].{RoleArn:RoleArn,Status:Status,FeatureName:FeatureName}' \
    --output table 2>/dev/null || warn "IAMロール情報取得失敗"

  info "--- パラメーターグループのaws_default_s3_role ---"
  aws --no-cli-pager rds describe-db-cluster-parameters \
    --region "$REGION" \
    --db-cluster-parameter-group-name "$PARAM_GROUP" \
    --source user \
    --query 'Parameters[?ParameterName==`aws_default_s3_role`].{Name:ParameterName,Value:ParameterValue}' \
    --output table

  info "--- IAMロールの権限確認 ---"
  ROLE_NAME="ksm-posprd-iam-role-db-cluster"
  aws --no-cli-pager iam list-attached-role-policies \
    --role-name "$ROLE_NAME" \
    --query 'AttachedPolicies[*].{Name:PolicyName,Arn:PolicyArn}' \
    --output table 2>/dev/null || warn "IAMロールのポリシー取得失敗（権限が必要）"
}

# -----------------------------------------------------------------------------
# create-snapshot: 手動スナップショット作成
# -----------------------------------------------------------------------------
cmd_create_snapshot() {
  TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
  SNAPSHOT_ID="${MAIN_CLUSTER}-manual-${TIMESTAMP}"

  log "手動スナップショットを作成します: $SNAPSHOT_ID"
  if [ "${DRY_RUN:-false}" = "true" ]; then
    warn "[DRY-RUN] aws rds create-db-cluster-snapshot --db-cluster-identifier $MAIN_CLUSTER --db-cluster-snapshot-identifier $SNAPSHOT_ID"
    return 0
  fi

  aws --no-cli-pager rds create-db-cluster-snapshot \
    --region "$REGION" \
    --db-cluster-identifier "$MAIN_CLUSTER" \
    --db-cluster-snapshot-identifier "$SNAPSHOT_ID" \
    --tags \
      Key=SystemName,Value=pos \
      Key=EnvType,Value=prd \
      Key=CreatedBy,Value=recover-script \
      Key=CreatedAt,Value="$(date '+%Y-%m-%dT%H:%M:%S+09:00')"

  ok "スナップショット作成開始: $SNAPSHOT_ID"
  log "完了確認: aws --no-cli-pager rds describe-db-cluster-snapshots --region $REGION --db-cluster-snapshot-identifier $SNAPSHOT_ID --query 'DBClusterSnapshots[0].{Status:Status,Progress:PercentProgress}'"
}

# -----------------------------------------------------------------------------
# failover: 手動フェイルオーバー
# -----------------------------------------------------------------------------
cmd_failover() {
  TARGET_INSTANCE="${OPT_INSTANCE_ID:-$INSTANCE_2}"

  log "=== 手動フェイルオーバー ==="
  warn "フェイルオーバー対象: $TARGET_INSTANCE → 新プライマリ（Writer）になります"
  warn "フェイルオーバー中は数十秒の接続断が発生します"
  echo ""
  echo -n "実行しますか？ (yes/no): "
  read -r CONFIRM
  [ "$CONFIRM" != "yes" ] && { log "キャンセルしました。"; exit 0; }

  if [ "${DRY_RUN:-false}" = "true" ]; then
    warn "[DRY-RUN] aws rds failover-db-cluster --db-cluster-identifier $MAIN_CLUSTER --target-db-instance-identifier $TARGET_INSTANCE"
    return 0
  fi

  log "フェイルオーバーを実行します..."
  aws --no-cli-pager rds failover-db-cluster \
    --region "$REGION" \
    --db-cluster-identifier "$MAIN_CLUSTER" \
    --target-db-instance-identifier "$TARGET_INSTANCE"

  log "完了待機中（最大5分）..."
  for i in $(seq 1 30); do
    sleep 10
    WRITER=$(aws --no-cli-pager rds describe-db-clusters \
      --region "$REGION" \
      --db-cluster-identifier "$MAIN_CLUSTER" \
      --query 'DBClusters[0].DBClusterMembers[?IsClusterWriter==`true`].DBInstanceIdentifier|[0]' \
      --output text)
    STATUS=$(aws --no-cli-pager rds describe-db-clusters \
      --region "$REGION" \
      --db-cluster-identifier "$MAIN_CLUSTER" \
      --query 'DBClusters[0].Status' \
      --output text)
    log "[${i}/30] Status: ${STATUS} / Writer: ${WRITER}"
    if [ "$STATUS" = "available" ] && [ "$WRITER" = "$TARGET_INSTANCE" ]; then
      ok "フェイルオーバー完了: Writer = $WRITER"
      return 0
    fi
  done
  warn "タイムアウト。状態を手動で確認してください: $0 status"
}

# -----------------------------------------------------------------------------
# restore-pitr: Point-in-time リカバリー
# -----------------------------------------------------------------------------
cmd_restore_pitr() {
  [ -z "${OPT_RESTORE_TIME:-}" ] && { err "--restore-time が必要です (例: 2026-03-08T10:00:00+09:00)"; exit 1; }
  [ -z "${OPT_NEW_CLUSTER:-}" ] && { err "--new-cluster が必要です"; exit 1; }

  log "=== Point-in-time リカバリー ==="
  info "復元元: $MAIN_CLUSTER"
  info "復元時刻: $OPT_RESTORE_TIME"
  info "復元先: $OPT_NEW_CLUSTER"
  warn "新しいクラスターとして作成されます（既存クラスターは変更されません）"

  if [ "${DRY_RUN:-false}" = "true" ]; then
    warn "[DRY-RUN] restore-db-cluster-to-point-in-time を実行します"
    return 0
  fi

  aws --no-cli-pager rds restore-db-cluster-to-point-in-time \
    --region "$REGION" \
    --db-cluster-identifier "$OPT_NEW_CLUSTER" \
    --source-db-cluster-identifier "$MAIN_CLUSTER" \
    --restore-to-time "$OPT_RESTORE_TIME" \
    --db-cluster-parameter-group-name "$PARAM_GROUP" \
    --db-subnet-group-name "$SUBNET_GROUP" \
    --vpc-security-group-ids "$DB_SG" \
    --kms-key-id "$KMS_KEY_ID" \
    --tags \
      Key=SystemName,Value=pos \
      Key=EnvType,Value=prd \
      Key=RestoredFrom,Value="$MAIN_CLUSTER" \
      Key=RestoreTime,Value="$OPT_RESTORE_TIME"

  ok "PITR開始: $OPT_NEW_CLUSTER"
  log ""
  log "クラスターが available になったら以下でインスタンスを追加："
  log "  aws rds create-db-instance \\"
  log "    --db-instance-identifier ${OPT_NEW_CLUSTER}-instance-1 \\"
  log "    --db-cluster-identifier ${OPT_NEW_CLUSTER} \\"
  log "    --engine aurora-mysql \\"
  log "    --db-instance-class db.r5.2xlarge \\  # ⚠️ ダウンサイズ検討中: db.r5.large 推奨（06_コスト調査参照）"
  log "    --region $REGION"
  log ""
  log "復元後、パラメーターグループのaws_default_s3_roleが正しく設定されているか確認："
  log "  $0 check-params"
}

# -----------------------------------------------------------------------------
# restore-snap: スナップショットから復元
# -----------------------------------------------------------------------------
cmd_restore_snap() {
  [ -z "${OPT_SNAPSHOT_ID:-}" ] && {
    err "--snapshot-id が必要です"
    info "利用可能なスナップショット一覧:"
    aws --no-cli-pager rds describe-db-cluster-snapshots \
      --region "$REGION" \
      --db-cluster-identifier "$MAIN_CLUSTER" \
      --query 'sort_by(DBClusterSnapshots,&SnapshotCreateTime)[-5:].{ID:DBClusterSnapshotIdentifier,Created:SnapshotCreateTime,Status:Status}' \
      --output table
    exit 1
  }
  [ -z "${OPT_NEW_CLUSTER:-}" ] && { err "--new-cluster が必要です"; exit 1; }

  SNAPSHOT_ARN="arn:aws:rds:${REGION}:332802448674:cluster-snapshot:${OPT_SNAPSHOT_ID}"

  log "=== スナップショットからのリストア ==="
  info "スナップショット: $OPT_SNAPSHOT_ID"
  info "復元先クラスター: $OPT_NEW_CLUSTER"

  if [ "${DRY_RUN:-false}" = "true" ]; then
    warn "[DRY-RUN] restore-db-cluster-from-snapshot を実行します"
    return 0
  fi

  aws --no-cli-pager rds restore-db-cluster-from-snapshot \
    --region "$REGION" \
    --db-cluster-identifier "$OPT_NEW_CLUSTER" \
    --snapshot-identifier "$SNAPSHOT_ARN" \
    --engine aurora-mysql \
    --engine-version "8.0.mysql_aurora.3.08.2" \
    --db-cluster-parameter-group-name "$PARAM_GROUP" \
    --db-subnet-group-name "$SUBNET_GROUP" \
    --vpc-security-group-ids "$DB_SG" \
    --kms-key-id "$KMS_KEY_ID" \
    --tags \
      Key=SystemName,Value=pos \
      Key=EnvType,Value=prd \
      Key=RestoredFrom,Value="$OPT_SNAPSHOT_ID"

  ok "スナップショットリストア開始: $OPT_NEW_CLUSTER"
  log ""
  log "インスタンス追加コマンド（クラスターがavailableになってから）:"
  log "  aws rds create-db-instance \\"
  log "    --db-instance-identifier ${OPT_NEW_CLUSTER}-instance-1 \\"
  log "    --db-cluster-identifier ${OPT_NEW_CLUSTER} \\"
  log "    --engine aurora-mysql \\"
  log "    --db-instance-class db.r5.2xlarge \\  # ⚠️ ダウンサイズ検討中: db.r5.large 推奨（06_コスト調査参照）"
  log "    --region $REGION"
  log ""
  log "復元後チェック: $0 check-params"
}

# -----------------------------------------------------------------------------
# reboot: インスタンス再起動
# -----------------------------------------------------------------------------
cmd_reboot() {
  TARGET_INSTANCE="${OPT_INSTANCE_ID:-$INSTANCE_1}"
  log "インスタンスを再起動します: $TARGET_INSTANCE"

  if [ "${DRY_RUN:-false}" = "true" ]; then
    warn "[DRY-RUN] aws rds reboot-db-instance --db-instance-identifier $TARGET_INSTANCE"
    return 0
  fi

  aws --no-cli-pager rds reboot-db-instance \
    --region "$REGION" \
    --db-instance-identifier "$TARGET_INSTANCE"
  ok "再起動を開始しました。"
}

# -----------------------------------------------------------------------------
# wait-available: available 待機
# -----------------------------------------------------------------------------
cmd_wait_available() {
  TARGET="${OPT_NEW_CLUSTER:-$MAIN_CLUSTER}"
  log "クラスター '$TARGET' が available になるまで待機します..."
  aws rds wait db-cluster-available \
    --region "$REGION" \
    --db-cluster-identifier "$TARGET"
  ok "クラスター '$TARGET' が available になりました。"
}

# -----------------------------------------------------------------------------
# メイン処理
# -----------------------------------------------------------------------------
COMMAND="${1:-}"
[ -z "$COMMAND" ] && usage

shift || true

OPT_RESTORE_TIME=""
OPT_SNAPSHOT_ID=""
OPT_NEW_CLUSTER=""
OPT_INSTANCE_ID=""
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --restore-time) OPT_RESTORE_TIME="$2"; shift 2 ;;
    --snapshot-id)  OPT_SNAPSHOT_ID="$2";  shift 2 ;;
    --new-cluster)  OPT_NEW_CLUSTER="$2";  shift 2 ;;
    --instance-id)  OPT_INSTANCE_ID="$2";  shift 2 ;;
    --dry-run)      DRY_RUN="true";        shift   ;;
    *) err "不明なオプション: $1"; usage ;;
  esac
done

case "$COMMAND" in
  status)          cmd_status ;;
  check-backup)    cmd_check_backup ;;
  check-params)    cmd_check_params ;;
  check-logs)      cmd_check_logs ;;
  check-iam)       cmd_check_iam ;;
  create-snapshot) cmd_create_snapshot ;;
  failover)        cmd_failover ;;
  restore-pitr)    cmd_restore_pitr ;;
  restore-snap)    cmd_restore_snap ;;
  reboot)          cmd_reboot ;;
  wait-available)  cmd_wait_available ;;
  *) err "不明なコマンド: $COMMAND"; usage ;;
esac

#!/bin/bash
# ============================================================
# カスミPOS AWS RDS Aurora MySQL 復旧スクリプト
# 01_recover_rds.sh
#
# 機能:
#   1. Aurora クラスター状態確認
#   2. フェイルオーバー実行 (プライマリ障害時)
#   3. スナップショットから新クラスター復元 (完全復旧時)
#   4. 接続確認
# ============================================================

set -euo pipefail

REGION="ap-northeast-1"
LOG_FILE="/tmp/kasumi-rds-recovery-$(date +%Y%m%d_%H%M%S).log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }
log_ok()  { log "${GREEN}[OK]${NC} $1"; }
log_warn(){ log "${YELLOW}[WARN]${NC} $1"; }
log_err() { log "${RED}[ERROR]${NC} $1"; }
log_info(){ log "${BLUE}[INFO]${NC} $1"; }

# ============================================
# Aurora クラスター一覧取得
# ============================================
list_clusters() {
    log_info "=== Aurora クラスター一覧 ==="
    aws rds describe-db-clusters \
        --region "$REGION" \
        --query 'DBClusters[*].{
            Cluster:DBClusterIdentifier,
            Status:Status,
            Engine:Engine,
            EngineVersion:EngineVersion,
            Endpoint:Endpoint,
            ReaderEndpoint:ReaderEndpoint
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# Aurora インスタンス状態確認
# ============================================
check_instances() {
    log_info "=== Aurora インスタンス状態確認 ==="
    aws rds describe-db-instances \
        --region "$REGION" \
        --query 'DBInstances[?Engine==`aurora-mysql`].{
            ID:DBInstanceIdentifier,
            Status:DBInstanceStatus,
            Class:DBInstanceClass,
            Role:MultiAZ,
            AZ:AvailabilityZone,
            Cluster:DBClusterIdentifier
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# フェイルオーバー実行
# ============================================
failover_cluster() {
    local cluster_id="$1"
    local target_instance="${2:-}"

    log_warn "=== フェイルオーバー実行: $cluster_id ==="

    if [ -n "$target_instance" ]; then
        log_info "ターゲットインスタンス: $target_instance"
        aws rds failover-db-cluster \
            --region "$REGION" \
            --db-cluster-identifier "$cluster_id" \
            --target-db-instance-identifier "$target_instance"
    else
        aws rds failover-db-cluster \
            --region "$REGION" \
            --db-cluster-identifier "$cluster_id"
    fi

    log_info "フェイルオーバー開始。完了まで30〜60秒待機..."
    
    # フェイルオーバー完了を待機
    local max_wait=120
    local elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        local status
        status=$(aws rds describe-db-clusters \
            --region "$REGION" \
            --db-cluster-identifier "$cluster_id" \
            --query 'DBClusters[0].Status' \
            --output text)
        
        if [ "$status" = "available" ]; then
            log_ok "フェイルオーバー完了 (${elapsed}秒)"
            return 0
        fi
        
        log_info "クラスター状態: $status (${elapsed}秒経過)"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    log_err "フェイルオーバーがタイムアウトしました (${max_wait}秒)"
    return 1
}

# ============================================
# スナップショット一覧
# ============================================
list_snapshots() {
    local cluster_id="${1:-}"
    log_info "=== スナップショット一覧 ==="
    
    if [ -n "$cluster_id" ]; then
        aws rds describe-db-cluster-snapshots \
            --region "$REGION" \
            --db-cluster-identifier "$cluster_id" \
            --query 'sort_by(DBClusterSnapshots, &SnapshotCreateTime)[-10:].{
                ID:DBClusterSnapshotIdentifier,
                Type:SnapshotType,
                Time:SnapshotCreateTime,
                Status:Status,
                Encrypted:StorageEncrypted
            }' \
            --output table | tee -a "$LOG_FILE"
    else
        aws rds describe-db-cluster-snapshots \
            --region "$REGION" \
            --query 'sort_by(DBClusterSnapshots, &SnapshotCreateTime)[-20:].{
                ID:DBClusterSnapshotIdentifier,
                Cluster:DBClusterIdentifier,
                Time:SnapshotCreateTime,
                Status:Status
            }' \
            --output table | tee -a "$LOG_FILE"
    fi
}

# ============================================
# 手動スナップショット作成
# ============================================
create_snapshot() {
    local cluster_id="$1"
    local snapshot_id="kasumi-manual-$(date +%Y%m%d%H%M)"
    
    log_info "=== スナップショット作成: $cluster_id → $snapshot_id ==="
    
    aws rds create-db-cluster-snapshot \
        --region "$REGION" \
        --db-cluster-identifier "$cluster_id" \
        --db-cluster-snapshot-identifier "$snapshot_id"
    
    log_info "スナップショット作成開始: $snapshot_id"
    
    # 完了待機
    aws rds wait db-cluster-snapshot-available \
        --region "$REGION" \
        --db-cluster-snapshot-identifier "$snapshot_id"
    
    log_ok "スナップショット作成完了: $snapshot_id"
    echo "$snapshot_id"
}

# ============================================
# スナップショットから復元
# ============================================
restore_from_snapshot() {
    local snapshot_id="$1"
    local new_cluster_id="kasumi-restored-$(date +%Y%m%d%H%M)"
    
    log_warn "=== スナップショットから復元 ==="
    log_info "スナップショット: $snapshot_id"
    log_info "新クラスターID: $new_cluster_id"
    
    # クラスター復元
    aws rds restore-db-cluster-from-snapshot \
        --region "$REGION" \
        --db-cluster-identifier "$new_cluster_id" \
        --snapshot-identifier "$snapshot_id" \
        --engine aurora-mysql \
        --engine-version "8.0.mysql_aurora.3.04.1" \
        --vpc-security-group-ids "$(get_rds_sg)" \
        --db-subnet-group-name "$(get_db_subnet_group)"
    
    log_info "クラスター作成待機中..."
    aws rds wait db-cluster-available \
        --region "$REGION" \
        --db-cluster-identifier "$new_cluster_id"
    
    # プライマリインスタンス追加
    local instance_id="${new_cluster_id}-instance-1"
    aws rds create-db-instance \
        --region "$REGION" \
        --db-instance-identifier "$instance_id" \
        --db-cluster-identifier "$new_cluster_id" \
        --db-instance-class "db.r5.2xlarge" \
        --engine aurora-mysql
    
    log_info "DBインスタンス作成待機中..."
    aws rds wait db-instance-available \
        --region "$REGION" \
        --db-instance-identifier "$instance_id"
    
    log_ok "復元完了: $new_cluster_id"
    
    # 新エンドポイント表示
    aws rds describe-db-clusters \
        --region "$REGION" \
        --db-cluster-identifier "$new_cluster_id" \
        --query 'DBClusters[0].{Endpoint:Endpoint,ReaderEndpoint:ReaderEndpoint}' \
        --output table
}

# ============================================
# 接続確認（mysql クライアントが必要）
# ============================================
test_connection() {
    local endpoint="$1"
    local secret_id="${2:-ksm-posprd-sm-db}"
    
    log_info "=== DB接続確認: $endpoint ==="
    
    # Secrets Manager から接続情報取得
    local secret
    secret=$(aws secretsmanager get-secret-value \
        --region "$REGION" \
        --secret-id "$secret_id" \
        --query SecretString \
        --output text)
    
    local username password port
    username=$(echo "$secret" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('username',''))")
    password=$(echo "$secret" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('password',''))")
    port=$(echo "$secret" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('port',3306))")
    
    if command -v mysql &>/dev/null; then
        if mysql -h "$endpoint" -u "$username" -p"$password" -P "$port" \
            -e "SELECT 'CONNECTION OK' AS status, NOW() AS current_time;" 2>&1; then
            log_ok "DB接続成功: $endpoint"
        else
            log_err "DB接続失敗: $endpoint"
            return 1
        fi
    else
        log_warn "mysql クライアントが見つかりません。ネットワーク疎通のみ確認します。"
        if nc -z -w 5 "$endpoint" "$port" 2>/dev/null; then
            log_ok "ポート $port 疎通確認: OK ($endpoint)"
        else
            log_err "ポート $port 疎通確認: NG ($endpoint)"
            return 1
        fi
    fi
}

# ============================================
# ヘルパー関数
# ============================================
get_rds_sg() {
    aws ec2 describe-security-groups \
        --region "$REGION" \
        --filters "Name=group-name,Values=*rds*" \
        --query 'SecurityGroups[0].GroupId' \
        --output text
}

get_db_subnet_group() {
    aws rds describe-db-subnet-groups \
        --region "$REGION" \
        --query 'DBSubnetGroups[0].DBSubnetGroupName' \
        --output text
}

# ============================================
# メイン処理
# ============================================
main() {
    log_info "============================================"
    log_info "RDS Aurora 復旧スクリプト開始"
    log_info "Region: $REGION"
    log_info "============================================"

    # 状態確認
    list_clusters
    check_instances

    # クラスター状態チェック
    local failed_clusters=()
    while IFS= read -r cluster_id; do
        local status
        status=$(aws rds describe-db-clusters \
            --region "$REGION" \
            --db-cluster-identifier "$cluster_id" \
            --query 'DBClusters[0].Status' \
            --output text 2>/dev/null || echo "unknown")
        
        if [ "$status" != "available" ]; then
            log_warn "クラスター異常: $cluster_id (Status: $status)"
            failed_clusters+=("$cluster_id")
        else
            log_ok "クラスター正常: $cluster_id"
        fi
    done < <(aws rds describe-db-clusters \
        --region "$REGION" \
        --query 'DBClusters[*].DBClusterIdentifier' \
        --output text | tr '\t' '\n')

    if [ ${#failed_clusters[@]} -eq 0 ]; then
        log_ok "全Aurora クラスター正常動作中"
        return 0
    fi

    # 異常クラスターの復旧
    for cluster in "${failed_clusters[@]}"; do
        log_warn "クラスター復旧を試みます: $cluster"
        echo "復旧方法を選択してください:"
        echo "  1) フェイルオーバー（レプリカ昇格）"
        echo "  2) スナップショットから復元"
        echo "  3) スキップ"
        read -p "選択 (1/2/3): " choice
        
        case "$choice" in
            1) failover_cluster "$cluster" ;;
            2)
                list_snapshots "$cluster"
                read -p "スナップショットIDを入力: " snap_id
                restore_from_snapshot "$snap_id"
                ;;
            3) log_info "スキップ: $cluster" ;;
            *) log_warn "無効な選択。スキップ: $cluster" ;;
        esac
    done

    log_ok "RDS 復旧スクリプト完了"
}

main "$@"

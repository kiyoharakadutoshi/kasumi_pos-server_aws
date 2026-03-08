# RDS Aurora MySQL 8.0 詳細設定

> コスト: 最大 $13,306 / 6ヶ月（最大コスト項目）

---

## クラスター構成

| 項目 | 系統A (instance-1) | 系統B (instance-2) |
|---|---|---|
| エンジン | Aurora MySQL 8.0 | Aurora MySQL 8.0 |
| プライマリインスタンス | db.r5.2xlarge | db.r5.2xlarge |
| リードレプリカ | db.t3.medium | db.t3.medium |
| Multi-AZ | **False** | **False** |
| 配置AZ | ap-northeast-1a | ap-northeast-1a |
| Secrets Manager | ksm-posprd-sm-db | ksm-posprd-sm-db-replica |

## インスタンスタイプ仕様

| インスタンス | vCPU | RAM | 月額概算 |
|---|---|---|---|
| db.r5.2xlarge | 8 vCPU | 64 GiB | ~$900/月 |
| db.t3.medium | 2 vCPU | 4 GiB | ~$60/月 |

## 接続情報

```
接続方法: AWS Secrets Manager から取得
シークレット名:
  - ksm-posprd-sm-db          # プライマリ接続情報
  - ksm-posprd-sm-db-replica  # レプリカ接続情報
  - prd/Replica_Kasumi        # 追加レプリカ接続

エンドポイント種別:
  - クラスターエンドポイント (Write) → ksm-posprd-sm-db に格納
  - リーダーエンドポイント  (Read)  → ksm-posprd-sm-db-replica に格納

配置サブネット: プライベートサブネット (10.238.x.x)
VPN経由接続CIDR: 172.21.10.0/24 (USMH側 DB接続セグメント)
```

## バックアップ設定

```
自動バックアップ: 有効
バックアップ保持期間: 7日
バックアップウィンドウ: 自動設定（低負荷時間帯）
Point-in-time Recovery: 有効（5分以内の任意時点に復元可能）

S3エクスポート先: s3://prd-ignica-ksm-master-backup/
マニュアルスナップショット: 必要に応じて手動取得
```

## モニタリング設定

```
CloudWatch メトリクス:
  - DatabaseConnections     # 接続数
  - FreeableMemory          # 使用可能メモリ
  - CPUUtilization          # CPU使用率
  - ReadLatency / WriteLatency # レイテンシ
  - DiskQueueDepth          # ディスクキュー
  - AuroraReplicaLag        # レプリカ遅延

Performance Insights: 有効（上位10クエリ・待機イベント分析）
Enhanced Monitoring: 有効（60秒間隔）
CloudWatch Logs: エラーログ・スロークエリログ出力
```

## メンテナンス設定

```
自動マイナーバージョンアップデート: 有効
メンテナンスウィンドウ: 自動設定（日本時間 早朝）
削除保護: 有効
```

## ⚠️ 設計上の注意点・制約

1. **Multi-AZ が無効** → AZ障害時、クラスター全体停止リスクあり
   - フェイルオーバー時はレプリカ(t3.medium)が自動昇格（約30秒）
   - 昇格後はリードレプリカが空になるため、読み取り負荷がプライマリに集中

2. **全インスタンスが 1a に集中**
   - 1c サブネットにスタンバイ追加を将来検討すべき

3. **VPN依存**
   - USMH側からのDB接続は IPSec VPN 経由（172.21.10.0/24）
   - VPN断時はUSMH側からの接続不可

## フェイルオーバー手順

```bash
# 1. 現在のプライマリを確認
aws rds describe-db-clusters \
  --region ap-northeast-1 \
  --query 'DBClusters[*].{Cluster:DBClusterIdentifier,Writer:MasterUsername}'

# 2. 手動フェイルオーバー実行（緊急時）
aws rds failover-db-cluster \
  --region ap-northeast-1 \
  --db-cluster-identifier <cluster-identifier>

# 3. フェイルオーバー状態確認
aws rds describe-db-clusters \
  --region ap-northeast-1 \
  --db-cluster-identifier <cluster-identifier> \
  --query 'DBClusters[0].Status'
```

## スナップショット操作

```bash
# 手動スナップショット作成
aws rds create-db-cluster-snapshot \
  --region ap-northeast-1 \
  --db-cluster-identifier <cluster-identifier> \
  --db-cluster-snapshot-identifier kasumi-manual-$(date +%Y%m%d%H%M)

# スナップショット一覧
aws rds describe-db-cluster-snapshots \
  --region ap-northeast-1 \
  --db-cluster-identifier <cluster-identifier> \
  --query 'DBClusterSnapshots[*].{ID:DBClusterSnapshotIdentifier,Time:SnapshotCreateTime,Status:Status}'

# スナップショットから復元
aws rds restore-db-cluster-from-snapshot \
  --region ap-northeast-1 \
  --db-cluster-identifier kasumi-restored-$(date +%Y%m%d) \
  --snapshot-identifier <snapshot-id> \
  --engine aurora-mysql \
  --engine-version 8.0
```

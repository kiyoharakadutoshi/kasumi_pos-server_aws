# RDS Aurora MySQL 8.0 詳細設定

> **取得日時**: 2026-03-08  
> **取得元**: AWS CloudShell 実測値（`aws rds describe-db-clusters` / `describe-db-instances` / `describe-db-cluster-parameters`）  
> **リージョン**: ap-northeast-1（東京）  
> **AWSアカウントID**: 332802448674

---

## 1. クラスター構成

### メインクラスター（読み書き）

| 項目 | 値 |
|---|---|
| **クラスターID** | `ksm-posprd-db-cluster` |
| **Cluster Resource ID** | `cluster-5TNW2QO4YKVBQ6Y4Y4B2HJMUGY` |
| **クラスター ARN** | `arn:aws:rds:ap-northeast-1:332802448674:cluster:ksm-posprd-db-cluster` |
| **ステータス** | available |
| **エンジン** | aurora-mysql |
| **エンジンバージョン** | **8.0.mysql_aurora.3.08.2** |
| **マスターユーザー** | admin |
| **ポート** | 3306 |
| **Multi-AZ** | **true** |
| **Writeエンドポイント** | `ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com` |
| **Readerエンドポイント** | `ksm-posprd-db-cluster.cluster-ro-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com` |
| **VPC** | `vpc-0e2d2d27b6860b7fc` |
| **サブネットグループ** | `ksm-posprd-db-sg` |
| **パラメーターグループ** | `ksm-posprd-db-cluster-pg` |
| **利用可能AZ** | ap-northeast-1a / ap-northeast-1c / ap-northeast-1d |
| **クラスター作成日** | 2025-06-20 09:24:48 UTC |
| **UpgradeRolloutOrder** | second |

### メインクラスター インスタンス

| インスタンスID | ロール | PromotionTier | 備考 |
|---|---|---|---|
| `ksm-posprd-db-instance-1` | **Writer（プライマリ）** | 1 | |
| `ksm-posprd-db-instance-2` | Reader（レプリカ） | 1 | ⚠️ Tier同値のため昇格順不定 |

### レプリカクラスター

| 項目 | 値 |
|---|---|
| **クラスターID** | `ksm-posprd-db-cluster-replica` |
| **Cluster Resource ID** | `cluster-FM47OYKAT7XJ2O7HMMP4ZUJXX4` |
| **クラスター ARN** | `arn:aws:rds:ap-northeast-1:332802448674:cluster:ksm-posprd-db-cluster-replica` |
| **エンジンバージョン** | 8.0.mysql_aurora.3.08.2 |
| **クラスター作成日** | 2025-06-20 09:43:22 UTC |
| **接続Secrets** | `prd/Replica_Kasumi` |

---

## 2. バックアップ設定

| 項目 | 値 | 備考 |
|---|---|---|
| **バックアップ保持期間** | **1日** | ⚠️ 最低設定。前日分しか自動復元不可 |
| **バックアップウィンドウ (UTC)** | 15:00–15:30 | JST 00:00–00:30 |
| **メンテナンスウィンドウ** | sat:15:30–sat:16:00 UTC | JST 土曜 00:30–01:00 |
| **最古の復元可能時刻** | 2026-03-06T15:06:14 UTC | JST 2026-03-07 00:06 |
| **最新の復元可能時刻** | 2026-03-08T08:27:12 UTC | JST 2026-03-08 17:27 |
| **Point-in-time Recovery** | 有効（保持期間内のみ） | |
| **AWS Backup** | **未設定** | ⚠️ 長期保持スナップショットなし |

### 直近自動スナップショット（2026-03-08 実測）

| スナップショットID | クラスター | 作成時刻(UTC) | ステータス | サイズ | 暗号化 |
|---|---|---|---|---|---|
| `rds:ksm-posprd-db-cluster-2026-03-07-15-05` | メイン | 2026-03-07 15:05 | available | 6 GB | SSE-KMS |
| `rds:ksm-posprd-db-cluster-replica-2026-03-07-15-12` | レプリカ | 2026-03-07 15:12 | available | 0 GB | SSE-KMS |

> スナップショット ARN:  
> `arn:aws:rds:ap-northeast-1:332802448674:cluster-snapshot:rds:ksm-posprd-db-cluster-2026-03-07-15-05`

---

## 3. 暗号化設定

| 項目 | 値 |
|---|---|
| **ストレージ暗号化** | 有効（SSE-KMS） |
| **KMSキーID** | `f63b92c0-a810-4665-a45e-ffb926b21496` |
| **KMSキーARN** | `arn:aws:kms:ap-northeast-1:332802448674:key/f63b92c0-a810-4665-a45e-ffb926b21496` |
| **IAMデータベース認証** | 無効 |

---

## 4. ネットワーク・セキュリティグループ

### SG一覧

| SG名 | SG ID | 管理 | 説明 |
|---|---|---|---|
| `ksm-posprd-vpc-sg-db` | `sg-05b58b81225f5bd93` | CloudFormation (`ksm-posprd-sg`) | RDS用メインSG |
| `rds-lambda-1` | `sg-02ceb596ed711a66c` | AWS自動生成 | Lambda→RDS接続用 |

### `ksm-posprd-vpc-sg-db` インバウンドルール（実測）

| プロトコル | ポート | 送信元 | 説明 |
|---|---|---|---|
| TCP | 3306 | `sg-053d249f0086f8733` | For ECS |
| TCP | 3306 | `sg-086a30a4f590928f9` | For EC2 Bastion |
| TCP | 3306 | `sg-0a9497c846d1be76f` | GiftCardサーバー |
| TCP | 3306 | `172.21.10.0/24` | POS network（USMH VPN経由） |

アウトバウンド: `0.0.0.0/0` 全許可

### `rds-lambda-1` インバウンドルール（実測）

| プロトコル | ポート | 送信元 SG | 説明 |
|---|---|---|---|
| TCP | 3306 | `sg-0f89711a1252355d4` | Lambda関数SG |

アウトバウンド: ルールなし（Lambda→RDS方向のみ）

### CloudFormation スタック
```
スタック名: ksm-posprd-sg
スタックARN: arn:aws:cloudformation:ap-northeast-1:332802448674:stack/ksm-posprd-sg/d9522750-4db3-11f0-94a8-0a786b8590c1
```

---

## 5. パラメーターグループ設定

**グループ名**: `ksm-posprd-db-cluster-pg`

### ユーザー設定パラメーター（`Source: user`）

| パラメーター | 値 | 適用方法 |
|---|---|---|
| `time_zone` | `Asia/Tokyo` | immediate（再起動不要） |

### 主要パラメーター（実測値）

| パラメーター | 値 | Source | IsModifiable | 説明 |
|---|---|---|---|---|
| `thread_handling` | `thread-pools` | system | false | Auroraスレッドプール方式（固定） |
| `sync_binlog` | `1` | system | false | コミット毎にbinlog fsync（安全設定・固定） |
| `relay_log_recovery` | `1` | system | false | 起動時自動リレーログ復旧（固定） |
| `skip_name_resolve` | `1` | system | false | ホスト名解決スキップ（固定）→IPで接続必須 |
| `skip-replica-start` | `1` | system | false | 起動時にレプリカスレッド自動開始しない（固定） |
| `read_only` | `0` | system | true | 書き込み許可（プライマリ） |
| `sql_mode` | `0` | system | true | SQL厳格モード無効 |
| `read_buffer_size` | `262144` (256 KB) | system | true | シーケンシャルスキャンバッファ |
| `read_rnd_buffer_size` | `524288` (512 KB) | system | true | ランダム読み取りバッファ |
| `thread_stack` | `262144` (256 KB) | engine-default | true | スレッドスタックサイズ |
| `temptable_max_mmap` | `1073741824` (1 GB) | engine-default | true | TempTable mmapメモリ上限 |
| `temptable_use_mmap` | `1` | engine-default | true | TempTable mmap利用有効 |
| `server_audit_logs_upload` | `0` | engine-default | true | CloudWatch Logs監査ログ送信: **無効** |
| `slow_query_log_file` | `/rdsdbdata/log/slowquery/mysql-slowquery.log` | system | false | スロークエリログパス |
| `relay-log` | `/rdsdbdata/log/relaylog/relaylog` | system | false | リレーログパス |
| `tmpdir` | `/rdsdbdata/tmp/` | system | false | 一時ファイルディレクトリ |
| `socket` | `/tmp/mysql.sock` | system | false | UNIXソケットパス |
| `secure_file_priv` | `/tmp` | system | false | LOAD DATA制限ディレクトリ |

### メモリ依存パラメーター（インスタンスクラス連動）

| パラメーター | 計算式 | 説明 |
|---|---|---|
| `table_definition_cache` | `LEAST({DBInstanceClassMemory/393040}, 20000)` | テーブル定義キャッシュ数 |
| `table_open_cache` | `LEAST({DBInstanceClassMemory/1179121}, 6000)` | オープンテーブルキャッシュ数 |
| `thread_cache_size` | `{DBInstanceClassMemory/1005785088}` | スレッドキャッシュ数 |

---

## 6. 接続情報

```
接続方法: AWS Secrets Manager から認証情報を取得

シークレット名                  エンドポイント種別
────────────────────────────────────────────────────────────
ksm-posprd-sm-db             Writeエンドポイント（プライマリ書き込み）
ksm-posprd-sm-db-replica     Readerエンドポイント（読み取り専用）
prd/Replica_Kasumi           レプリカクラスター

Writeエンドポイント:
  ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com:3306

Readerエンドポイント:
  ksm-posprd-db-cluster.cluster-ro-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com:3306

VPN経由（USMH側 POSネットワーク）:
  172.21.10.0/24 → TCP 3306 許可済み（sg-05b58b81225f5bd93 に定義）
```

---

## 7. タグ設定

| キー | 値 |
|---|---|
| `Name` | `ksm-posprd-db-cluster` |
| `SystemName` | `pos` |
| `EnvType` | `prd` |

---

## 8. ⚠️ リスク・改善推奨事項

| 優先度 | 項目 | 現状 | 推奨対応 |
|---|---|---|---|
| 🔴 高 | バックアップ保持期間 | **1日** | 最低7日、理想35日に変更（コスト微増） |
| 🔴 高 | AWS Backup 未設定 | `BackupPlansList: []` | 月次手動スナップショット or AWS Backupルール作成 |
| 🟡 中 | PromotionTier 同値 | 両インスタンスTier=1 | instance-2をTier=2に変更し昇格順序を明示 |
| 🟡 中 | 監査ログ未送信 | `server_audit_logs_upload=0` | CloudWatch Logs送信有効化を検討 |
| 🟢 低 | sql_mode=0 | 厳格モード無効 | アプリ要件確認後 STRICT_TRANS_TABLES 検討 |

---

## 9. 状態確認コマンド

```bash
REGION="ap-northeast-1"

# クラスター状態確認
aws --no-cli-pager rds describe-db-clusters \
  --region $REGION \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --query 'DBClusters[0].{Status:Status,MultiAZ:MultiAZ,Writer:DBClusterMembers[?IsClusterWriter==`true`].DBInstanceIdentifier|[0],LatestRestore:LatestRestorableTime}'

# インスタンス状態確認
aws --no-cli-pager rds describe-db-instances \
  --region $REGION \
  --filters "Name=db-cluster-id,Values=ksm-posprd-db-cluster" \
  --query 'DBInstances[*].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Class:DBInstanceClass,AZ:AvailabilityZone}'

# 直近スナップショット確認
aws --no-cli-pager rds describe-db-cluster-snapshots \
  --region $REGION \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --query 'sort_by(DBClusterSnapshots, &SnapshotCreateTime)[-3:].{ID:DBClusterSnapshotIdentifier,Time:SnapshotCreateTime,Status:Status,Size:AllocatedStorage}'

# Point-in-time 復元可能範囲確認
aws --no-cli-pager rds describe-db-clusters \
  --region $REGION \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --query 'DBClusters[0].{Earliest:EarliestRestorableTime,Latest:LatestRestorableTime}'
```

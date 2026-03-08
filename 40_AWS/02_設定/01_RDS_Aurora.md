# RDS Aurora MySQL 8.0 詳細設定

> **取得日時**: 2026-03-08  
> **取得元**: AWS CloudShell 実測値  
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
| **エンジンバージョン** | 8.0.mysql_aurora.3.08.2 |
| **マスターユーザー** | admin |
| **ポート** | 3306 |
| **Multi-AZ** | false |
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
| `ksm-posprd-db-instance-2` | Reader（レプリカ） | 1 | ⚠️ Tier同値のため昇格順序不定 |

### レプリカクラスター

| 項目 | 値 |
|---|---|
| **クラスターID** | `ksm-posprd-db-cluster-replica` |
| **Cluster Resource ID** | `cluster-FM47OYKAT7XJ2O7HMMP4ZUJXX4` |
| **クラスター ARN** | `arn:aws:rds:ap-northeast-1:332802448674:cluster:ksm-posprd-db-cluster-replica` |
| **エンジンバージョン** | 8.0.mysql_aurora.3.08.2 |
| **クラスター作成日** | 2025-06-20 09:43:22 UTC |
| **接続Secrets** | `prd/Replica_Kasumi`（⚠️ 名称は「レプリカ」だがWriterエンドポイント接続） |

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

---

## 3. 暗号化設定

| 項目 | 値 |
|---|---|
| **ストレージ暗号化** | 有効（SSE-KMS） |
| **KMSキーID** | `f63b92c0-a810-4665-a45e-ffb926b21496` |
| **KMSキーARN** | `arn:aws:kms:ap-northeast-1:332802448674:key/f63b92c0-a810-4665-a45e-ffb926b21496` |
| **IAMデータベース認証** | 無効 |

---

## 4. S3連携 / IAMロール設定

| 項目 | 値 |
|---|---|
| **DBからS3へのIAMロール** | `arn:aws:iam::332802448674:role/ksm-posprd-iam-role-db-cluster` |
| **パラメーター名** | `aws_default_s3_role` |
| **適用方法** | immediate（設定済み・有効） |

> DBクラスターがS3にデータをエクスポート/インポートする際に使用するIAMロール。  
> Lambda・Step Functions経由でのマスターデータ連携（oc/sg/sh系）において参照される。  
> このロールを変更・削除するとS3連携が停止するため注意。

---

## 5. ネットワーク・セキュリティグループ

### SG一覧

| SG名 | SG ID | 管理 |
|---|---|---|
| `ksm-posprd-vpc-sg-db` | `sg-05b58b81225f5bd93` | CloudFormation（`ksm-posprd-sg`スタック） |
| `rds-lambda-1` | `sg-02ceb596ed711a66c` | AWS自動生成（Lambda統合時） |

### `ksm-posprd-vpc-sg-db` インバウンドルール

| プロトコル | ポート | 送信元 | 説明 |
|---|---|---|---|
| TCP | 3306 | `sg-053d249f0086f8733` | For ECS |
| TCP | 3306 | `sg-086a30a4f590928f9` | For EC2 Bastion |
| TCP | 3306 | `sg-0a9497c846d1be76f` | GiftCardサーバー |
| TCP | 3306 | `172.21.10.0/24` | POS network（USMH VPN経由） |

アウトバウンド: `0.0.0.0/0` 全許可

### `rds-lambda-1` インバウンドルール

| プロトコル | ポート | 送信元 SG | 説明 |
|---|---|---|---|
| TCP | 3306 | `sg-0f89711a1252355d4` | Lambda関数SG |

---

## 6. パラメーターグループ設定

**グループ名**: `ksm-posprd-db-cluster-pg`

### ユーザー設定パラメーター（`Source: user`、実測値）

| パラメーター | 値 | 適用方法 | 説明 |
|---|---|---|---|
| `time_zone` | `Asia/Tokyo` | immediate | DB サーバーのタイムゾーン（JST固定） |
| `activate_all_roles_on_login` | `1` | immediate | ログイン時に付与済みロールを全自動有効化 |
| `aws_default_s3_role` | `arn:aws:iam::332802448674:role/ksm-posprd-iam-role-db-cluster` | immediate | DBからS3操作時に使用するIAMロール |

> ⚠️ `aws_default_s3_role` はマスターデータのS3連携に直結するため、変更不可。

### 主要システムパラメーター（実測値）

| パラメーター | 値 | IsModifiable | 説明 |
|---|---|---|---|
| `thread_handling` | `thread-pools` | false | Auroraスレッドプール方式（固定） |
| `sync_binlog` | `1` | false | コミット毎にbinlog fsync（安全設定・固定） |
| `relay_log_recovery` | `1` | false | 起動時自動リレーログ復旧（固定） |
| `skip_name_resolve` | `1` | false | ホスト名解決スキップ（IPで接続必須） |
| `skip-replica-start` | `1` | false | 起動時レプリカスレッド自動開始しない |
| `read_only` | `0` | true | 書き込み許可（プライマリ） |
| `sql_mode` | `0` | true | SQL厳格モード無効 |
| `read_buffer_size` | `262144` (256 KB) | true | シーケンシャルスキャンバッファ |
| `read_rnd_buffer_size` | `524288` (512 KB) | true | ランダム読み取りバッファ |
| `thread_stack` | `262144` (256 KB) | true | スレッドスタックサイズ |
| `temptable_max_mmap` | `1073741824` (1 GB) | true | TempTable mmapメモリ上限 |
| `temptable_use_mmap` | `1` | true | TempTable mmap利用有効 |
| `server_audit_logs_upload` | `0` | true | CloudWatch Logs監査ログ送信: **無効** |

### メモリ依存パラメーター（インスタンスクラス連動）

| パラメーター | 計算式 |
|---|---|
| `table_definition_cache` | `LEAST({DBInstanceClassMemory/393040}, 20000)` |
| `table_open_cache` | `LEAST({DBInstanceClassMemory/1179121}, 6000)` |
| `thread_cache_size` | `{DBInstanceClassMemory/1005785088}` |

---

## 7. ログファイル

**インスタンス**: `ksm-posprd-db-instance-1`

| ログ種別 | パス | サイクル | サイズ目安 |
|---|---|---|---|
| エラーログ（実行中） | `error/mysql-error-running.log.YYYY-MM-DD.HH` | 1時間毎にローテーション | 70–110 KB/h |
| エラーログ（カレント） | `error/mysql-error.log` | 常時書き込み | 12 KB |
| externalログ | `external/mysql-external.log` | 随時 | **35 MB**（大容量） |
| インスタンスログ | `instance/instance.log` | 随時 | 0 KB（現在空） |
| スロークエリログ | `/rdsdbdata/log/slowquery/mysql-slowquery.log` | 随時 | パラメーター設定次第 |

> **externalログ（35 MB）注意**: Aurora内部の外部接続ログ。定期的な確認を推奨。  
> エラーログは直近6日分（2026-03-03〜08）が1時間毎に存在していることを確認済み。

---

## 8. 接続情報

```
接続方法: AWS Secrets Manager から認証情報を取得

シークレット名                  エンドポイント種別          主な利用Lambda
────────────────────────────────────────────────────────────────────────────
ksm-posprd-sm-db             Writeエンドポイント（プライマリ書き込み）
ksm-posprd-sm-db-replica     Readerエンドポイント（読み取り専用）
prd/Replica_Kasumi           Writeエンドポイント ※          sg/oc/sh-import-data, create-file-end-for-night(⚠️要変更)
prd/Replica_Kasumi_RO        Readerエンドポイント            split-csv, p001-import-monitoring,
                                                             itemmaster-import-monitoring, get-sync-store
prd/Batch_Kasumi             Writeエンドポイント             バッチ履歴書き込み用（全importerで使用）

※ 注意: prd/Replica_Kasumi は「Replica_Kasumi」がAurora MySQLのDBスキーマ名（データベース名）であり、
         「レプリカ接続」の意味ではない。実際はWriterエンドポイントに接続。

Writeエンドポイント:
  ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com:3306

Readerエンドポイント:
  ksm-posprd-db-cluster.cluster-ro-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com:3306

USMHサイド POSネットワーク（VPN経由）:
  172.21.10.0/24 → TCP 3306 許可済み
```

### Lambda DB接続 Writer/Reader 使い分け（2026-03-08 調査確定）

| Lambda関数名 | DB操作 | シークレット | 評価 |
|---|---|---|---|
| `sg-import-data` | WRITE | `prd/Replica_Kasumi` + `prd/Batch_Kasumi` | ✅ |
| `oc-import-data` | WRITE | `prd/Replica_Kasumi` + `prd/Batch_Kasumi` | ✅ |
| `import-pos-master-sh` | WRITE | `prd/Replica_Kasumi` + `prd/Batch_Kasumi` | ✅ |
| `create-file-end-for-night` | **SELECT のみ** | `prd/Replica_Kasumi`（Writer） | ⚠️ `prd/Replica_Kasumi_RO` に変更推奨 |
| `split-csv` | SELECT | `prd/Replica_Kasumi_RO` | ✅ |
| `p001-import-monitoring` | SELECT | `prd/Replica_Kasumi_RO` | ✅ |
| `itemmaster-import-monitoring` | SELECT | `prd/Replica_Kasumi_RO` | ✅ |
| `get-sync-store` | SELECT | `prd/Replica_Kasumi_RO` | ✅ |

> **Read IOPS = 0 だった理由**: 読み取り系LambdaはDB接続→SELECT→即時切断のパターン。
> 常時接続でないため CloudWatch の Read IOPS に反映されなかった（Lambdaは使っている）。

---

## 9. タグ設定

| キー | 値 |
|---|---|
| `Name` | `ksm-posprd-db-cluster` |
| `SystemName` | `pos` |
| `EnvType` | `prd` |

---

## 10. ⚠️ リスク・改善推奨事項

| 優先度 | 項目 | 現状 | 推奨対応 |
|---|---|---|---|
| 🔴 高 | バックアップ保持期間 | **1日** | 最低7日、理想35日に変更 |
| 🔴 高 | AWS Backup 未設定 | `BackupPlansList: []` | 月次スナップショット自動保持ルールを作成 |
| 🟡 中 | PromotionTier 同値 | 両インスタンスTier=1 | instance-2をTier=2に変更 |
| 🟡 中 | 監査ログ未送信 | `server_audit_logs_upload=0` | CloudWatch Logs送信の有効化を検討 |
| 🟡 中 | externalログ肥大化 | 35 MB | 内容確認・ローテーション設定を検討 |
| 🟢 低 | sql_mode=0 | 厳格モード無効 | アプリ要件確認後 STRICT_TRANS_TABLES 検討 |

---

## 11. 状態確認コマンド

```bash
REGION="ap-northeast-1"
CLUSTER="ksm-posprd-db-cluster"
INSTANCE="ksm-posprd-db-instance-1"

# クラスター状態
aws --no-cli-pager rds describe-db-clusters --region $REGION \
  --db-cluster-identifier $CLUSTER \
  --query 'DBClusters[0].{Status:Status,MultiAZ:MultiAZ,Writer:DBClusterMembers[?IsClusterWriter==`true`].DBInstanceIdentifier|[0],LatestRestore:LatestRestorableTime}'

# インスタンス状態
aws --no-cli-pager rds describe-db-instances --region $REGION \
  --filters "Name=db-cluster-id,Values=$CLUSTER" \
  --query 'DBInstances[*].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Class:DBInstanceClass,AZ:AvailabilityZone}'

# ユーザー設定パラメーター一覧
aws --no-cli-pager rds describe-db-cluster-parameters --region $REGION \
  --db-cluster-parameter-group-name ksm-posprd-db-cluster-pg \
  --source user \
  --query 'Parameters[*].{Name:ParameterName,Value:ParameterValue}'

# スナップショット一覧
aws --no-cli-pager rds describe-db-cluster-snapshots --region $REGION \
  --db-cluster-identifier $CLUSTER \
  --query 'sort_by(DBClusterSnapshots,&SnapshotCreateTime)[-5:].{ID:DBClusterSnapshotIdentifier,Time:SnapshotCreateTime,Status:Status,SizeGB:AllocatedStorage}'

# ログファイル一覧
aws --no-cli-pager rds describe-db-log-files --region $REGION \
  --db-instance-identifier $INSTANCE \
  --query 'DescribeDBLogFiles[-10:].{File:LogFileName,SizeKB:Size,LastWritten:LastWritten}'
```

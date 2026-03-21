# MySQL リカバリ手順書

| 項目 | 内容 |
|---|---|
| **対象システム** | カスミPOS 本番環境 |
| **対象サービス** | Amazon RDS Aurora MySQL 8.0 |
| **対象クラスター** | `ksm-posprd-db-cluster` |
| **作成日** | 2026-03-08 |
| **前提** | AWS CloudShell または Bastion サーバーから AWS CLI 実行可能であること |

---

## 1. リカバリ方式の選択

障害内容に応じて以下の方式を選択する。

```
障害発生
  │
  ├─ データ破損・誤操作？ ────────────────────────→ [方式A] Point-in-time リカバリ（PITR）
  │    （テーブル削除、誤UPDATE/DELETE等）                または [方式B] スナップショットリストア
  │
  ├─ インスタンス障害？ ──────────────────────────→ [方式C] フェイルオーバー
  │    （プライマリが落ちた、接続不可）
  │
  ├─ クラスター全体障害？ ────────────────────────→ [方式B] スナップショットリストア
  │    （クラスターが削除された等）
  │
  └─ パラメーター誤設定？ ────────────────────────→ [方式D] パラメーターグループ修正
```

---

## 2. 事前確認

**リカバリ作業前に必ず実施する。**

```bash
REGION="ap-northeast-1"
CLUSTER="ksm-posprd-db-cluster"

# ① クラスター・インスタンスの現在状態確認
aws --no-cli-pager rds describe-db-clusters \
  --region $REGION \
  --db-cluster-identifier $CLUSTER \
  --query 'DBClusters[0].{
    Status:Status,
    Writer:DBClusterMembers[?IsClusterWriter==`true`].DBInstanceIdentifier|[0],
    EarliestRestore:EarliestRestorableTime,
    LatestRestore:LatestRestorableTime
  }'

# ② 利用可能なスナップショット一覧
aws --no-cli-pager rds describe-db-cluster-snapshots \
  --region $REGION \
  --db-cluster-identifier $CLUSTER \
  --query 'sort_by(DBClusterSnapshots, &SnapshotCreateTime)[-10:].{
    ID:DBClusterSnapshotIdentifier,
    Type:SnapshotType,
    Created:SnapshotCreateTime,
    Status:Status,
    SizeGB:AllocatedStorage
  }' \
  --output table

# ③ 直近エラーログ確認
aws --no-cli-pager rds download-db-log-file-portion \
  --region $REGION \
  --db-instance-identifier ksm-posprd-db-instance-1 \
  --log-file-name "error/mysql-error.log" \
  --query 'LogFileData' \
  --output text | tail -50
```

---

## 方式A: Point-in-time リカバリ（PITR）

**用途**: 誤操作（テーブル削除・大量UPDATE等）発生時に、誤操作直前の状態に復元したい場合。

**復元可能範囲**: `EarliestRestorableTime` 〜 `LatestRestorableTime`（上記事前確認で確認）

### 手順

#### Step 1: 復元時刻を決定する

誤操作が発生した時刻の **直前** を復元時刻とする。

```
例: 2026-03-08 14:30 に誤ってテーブルを削除した場合
→ 復元時刻 = 2026-03-08T14:25:00+09:00（5分前）
```

#### Step 2: 新クラスターへ復元する

> ⚠️ 既存クラスターは変更しない。必ず別のクラスターIDで復元すること。

```bash
REGION="ap-northeast-1"
RESTORE_TIME="2026-03-08T14:25:00+09:00"   # ← 復元時刻に変更
NEW_CLUSTER="ksm-posprd-db-cluster-restored-$(date '+%Y%m%d%H%M')"

aws --no-cli-pager rds restore-db-cluster-to-point-in-time \
  --region $REGION \
  --db-cluster-identifier $NEW_CLUSTER \
  --source-db-cluster-identifier ksm-posprd-db-cluster \
  --restore-to-time "$RESTORE_TIME" \
  --db-cluster-parameter-group-name ksm-posprd-db-cluster-pg \
  --db-subnet-group-name ksm-posprd-db-sg \
  --vpc-security-group-ids sg-05b58b81225f5bd93 \
  --kms-key-id arn:aws:kms:ap-northeast-1:332802448674:key/f63b92c0-a810-4665-a45e-ffb926b21496 \
  --tags Key=SystemName,Value=pos Key=EnvType,Value=prd Key=Purpose,Value=recovery

echo "復元先クラスターID: $NEW_CLUSTER"
```

#### Step 3: クラスターが available になるまで待機

```bash
aws rds wait db-cluster-available \
  --region $REGION \
  --db-cluster-identifier $NEW_CLUSTER
echo "クラスター起動完了"
```

#### Step 4: インスタンスを追加する

```bash
aws --no-cli-pager rds create-db-instance \
  --region $REGION \
  --db-instance-identifier ${NEW_CLUSTER}-instance-1 \
  --db-cluster-identifier $NEW_CLUSTER \
  --engine aurora-mysql \
  --db-instance-class db.r5.2xlarge

aws rds wait db-instance-available \
  --region $REGION \
  --db-instance-identifier ${NEW_CLUSTER}-instance-1
echo "インスタンス起動完了"
```

#### Step 5: 復元データを確認する

Bastionサーバー経由で復元クラスターのエンドポイントに接続し、データを確認する。

```bash
# 復元クラスターのエンドポイントを取得
aws --no-cli-pager rds describe-db-clusters \
  --region $REGION \
  --db-cluster-identifier $NEW_CLUSTER \
  --query 'DBClusters[0].Endpoint' \
  --output text
```

```sql
-- 接続後、対象テーブルのデータを確認
SHOW DATABASES;
USE <対象DB名>;
SELECT COUNT(*) FROM <対象テーブル名>;
```

#### Step 6: 本番クラスターへデータを反映する

復元データが正しければ、mysqldump等で差分データを本番クラスターへ適用する。

```bash
# 復元クラスターからダンプ取得
mysqldump -h <復元クラスターエンドポイント> \
  -u admin -p \
  --single-transaction \
  <対象DB名> <対象テーブル名> \
  > /tmp/recovery_dump.sql

# 本番クラスターへ適用
mysql -h ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com \
  -u admin -p \
  <対象DB名> < /tmp/recovery_dump.sql
```

#### Step 7: 復元クラスターを削除する

```bash
# インスタンス削除
aws --no-cli-pager rds delete-db-instance \
  --region $REGION \
  --db-instance-identifier ${NEW_CLUSTER}-instance-1 \
  --skip-final-snapshot

aws rds wait db-instance-deleted \
  --region $REGION \
  --db-instance-identifier ${NEW_CLUSTER}-instance-1

# クラスター削除
aws --no-cli-pager rds delete-db-cluster \
  --region $REGION \
  --db-cluster-identifier $NEW_CLUSTER \
  --skip-final-snapshot
echo "復元クラスター削除完了"
```

---

## 方式B: スナップショットリストア

**用途**: 特定時点のスナップショットから完全に復元したい場合。またはPITRの復元可能範囲外の場合。

### 手順

#### Step 1: 復元元スナップショットを選択する

```bash
aws --no-cli-pager rds describe-db-cluster-snapshots \
  --region ap-northeast-1 \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --query 'sort_by(DBClusterSnapshots, &SnapshotCreateTime)[-10:].{
    ID:DBClusterSnapshotIdentifier,
    Type:SnapshotType,
    Created:SnapshotCreateTime,
    Status:Status
  }' \
  --output table
```

> **AWS Backup 設定済みの場合**: AWS Backupコンソールから復旧ポイントを確認する。  
> **設定前（現状）**: 自動スナップショット `rds:ksm-posprd-db-cluster-YYYY-MM-DD-15-05` のみ利用可能。

#### Step 2: スナップショットから新クラスターを作成する

```bash
REGION="ap-northeast-1"
SNAPSHOT_ID="rds:ksm-posprd-db-cluster-2026-03-07-15-05"   # ← スナップショットIDに変更
NEW_CLUSTER="ksm-posprd-db-cluster-restored-$(date '+%Y%m%d%H%M')"
SNAPSHOT_ARN="arn:aws:rds:${REGION}:332802448674:cluster-snapshot:${SNAPSHOT_ID}"

aws --no-cli-pager rds restore-db-cluster-from-snapshot \
  --region $REGION \
  --db-cluster-identifier $NEW_CLUSTER \
  --snapshot-identifier $SNAPSHOT_ARN \
  --engine aurora-mysql \
  --engine-version "8.0.mysql_aurora.3.08.2" \
  --db-cluster-parameter-group-name ksm-posprd-db-cluster-pg \
  --db-subnet-group-name ksm-posprd-db-sg \
  --vpc-security-group-ids sg-05b58b81225f5bd93 \
  --kms-key-id arn:aws:kms:ap-northeast-1:332802448674:key/f63b92c0-a810-4665-a45e-ffb926b21496 \
  --tags Key=SystemName,Value=pos Key=EnvType,Value=prd Key=Purpose,Value=recovery
```

#### Step 3以降: 方式A の Step 3〜7 と同じ手順を実施する

---

## 方式C: フェイルオーバー（インスタンス障害）

**用途**: プライマリインスタンス（`ksm-posprd-db-instance-1`）が障害で応答しない場合。

### 手順

#### Step 1: 現在のWriter（プライマリ）を確認する

```bash
aws --no-cli-pager rds describe-db-clusters \
  --region ap-northeast-1 \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --query 'DBClusters[0].DBClusterMembers[*].{
    Instance:DBInstanceIdentifier,
    IsWriter:IsClusterWriter,
    Tier:PromotionTier
  }' \
  --output table
```

#### Step 2: 手動フェイルオーバーを実行する

> ⚠️ フェイルオーバー中は **数十秒の接続断** が発生する。  
> アプリケーションが Writeエンドポイントを使用している場合、自動的に新プライマリへ接続が切り替わる。

```bash
aws --no-cli-pager rds failover-db-cluster \
  --region ap-northeast-1 \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --target-db-instance-identifier ksm-posprd-db-instance-2
```

#### Step 3: フェイルオーバー完了を確認する

```bash
# 約30秒〜2分待機後に確認
aws --no-cli-pager rds describe-db-clusters \
  --region ap-northeast-1 \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --query 'DBClusters[0].{
    Status:Status,
    Writer:DBClusterMembers[?IsClusterWriter==`true`].DBInstanceIdentifier|[0]
  }'
```

`Writer` が `ksm-posprd-db-instance-2` に変わっていれば完了。

#### Step 4: アプリケーション接続を確認する

- Writeエンドポイント（`ksm-posprd-db-cluster.cluster-cxekgmegw02x...`）は変わらない
- Lambda・ECS・GiftCardサーバーから接続できることを確認する

---

## 方式D: パラメーターグループ修正

**用途**: パラメーター設定ミスによる障害（タイムゾーン変更・S3ロール誤設定等）の場合。

### 手順

#### 重要パラメーターの正常値

| パラメーター | 正常値 |
|---|---|
| `time_zone` | `Asia/Tokyo` |
| `activate_all_roles_on_login` | `1` |
| `aws_default_s3_role` | `arn:aws:iam::332802448674:role/ksm-posprd-iam-role-db-cluster` |

#### パラメーター修正コマンド（例: time_zone が変わってしまった場合）

```bash
aws --no-cli-pager rds modify-db-cluster-parameter-group \
  --region ap-northeast-1 \
  --db-cluster-parameter-group-name ksm-posprd-db-cluster-pg \
  --parameters \
    "ParameterName=time_zone,ParameterValue=Asia/Tokyo,ApplyMethod=immediate"
```

#### 修正後の確認

```bash
aws --no-cli-pager rds describe-db-cluster-parameters \
  --region ap-northeast-1 \
  --db-cluster-parameter-group-name ksm-posprd-db-cluster-pg \
  --source user \
  --query 'Parameters[*].{Name:ParameterName,Value:ParameterValue}' \
  --output table
```

---

## 3. リカバリ後の確認チェックリスト

リカバリ完了後、以下をすべて確認する。

```
□ クラスターStatus が available
□ Writeエンドポイントへの接続確認
□ Readerエンドポイントへの接続確認
□ Lambda から DB接続確認
□ ECS から DB接続確認
□ GiftCardサーバーから DB接続確認
□ USMH側（172.21.10.0/24）からの接続確認
□ time_zone = Asia/Tokyo 確認
□ aws_default_s3_role が正しく設定されていること確認
□ S3連携（oc/sg/sh系ファイル処理）が正常動作すること確認
□ 直近のEventBridgeスケジュール（JST 00:00 / 05:30）が正常実行されること確認
```

---

## 4. エスカレーション

リカバリが完了しない場合、または判断に迷う場合は以下に連絡する。

| 状況 | 連絡先 |
|---|---|
| RDS障害が継続 | AWSサポートケース起票（ビジネス/エンタープライズ） |
| データ確認が必要 | カスミ担当者へ連絡 |
| USMH連携が止まった | USMH側担当者へ連絡 |

---

## 5. 関連ドキュメント

| ドキュメント | パス |
|---|---|
| RDS設定書 | `40_AWS/02_設定/01_RDS_Aurora.md` |
| リカバリースクリプト | `40_AWS/03_リカバリー/01_recover_rds.sh` |
| バックアップ修正依頼書 | `40_AWS/04_修正依頼/20260308_MYSQLバックアップ設定.md` |

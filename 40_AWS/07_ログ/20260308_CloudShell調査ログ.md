# CloudShell 調査ログ

| 項目 | 内容 |
|---|---|
| **調査日** | 2026-03-08 |
| **リージョン** | ap-northeast-1（東京） |
| **AWSアカウント** | 332802448674 |
| **調査者** | LUVINA |
| **目的** | カスミPOS 本番環境 AWS構成・コスト調査 |

> このファイルは Claude との会話の中で投げたCloudShellコマンドと受信内容の記録です。

---

## [1] VPC・サブネット・EC2 調査

### コマンド

```bash
REGION="ap-northeast-1"

# VPC
aws ec2 describe-vpcs --region $REGION \
  --query 'Vpcs[*].{VpcId:VpcId,Cidr:CidrBlock,Tags:Tags}' --output table

# サブネット
aws ec2 describe-subnets --region $REGION \
  --filters "Name=vpc-id,Values=vpc-0e2d2d27b6860b7fc" \
  --query 'Subnets[*].{SubnetId:SubnetId,AZ:AvailabilityZone,Cidr:CidrBlock,Name:Tags[?Key==`Name`]|[0].Value}' \
  --output table

# EC2インスタンス
aws ec2 describe-instances --region $REGION \
  --query 'Reservations[*].Instances[*].{ID:InstanceId,Type:InstanceType,State:State.Name,IP:PrivateIpAddress,AZ:Placement.AvailabilityZone,Name:Tags[?Key==`Name`]|[0].Value}' \
  --output table
```

### 受信内容（主要結果）

```
VPC:
  VPC ID : vpc-0e2d2d27b6860b7fc
  CIDR   : 10.238.0.0/16
  AZ     : ap-northeast-1a + ap-northeast-1c

サブネット:
  public-1a / public-1c      ← Bastion, NAT GW
  private-1a / private-1c    ← Lambda, RDS, ECS, EC2(giftcard)
  protected-1a / protected-1c ← 最高セキュリティリソース
  common-1a / common-1c      ← 共通サービス

EC2インスタンス（2台のみ）:
  bastion   t3.xlarge  10.238.2.39   ap-northeast-1a  running
  giftcard  t2.large   10.238.2.198  ap-northeast-1a  running
  ※ App Server / Batch Server は存在しない（Lambda+ECS構成）
```

---

## [2] RDS Aurora MySQL 調査

### コマンド

```bash
REGION="ap-northeast-1"

# クラスター一覧
aws --no-cli-pager rds describe-db-clusters --region $REGION \
  --query 'DBClusters[*].{ClusterID:DBClusterIdentifier,Engine:Engine,Version:EngineVersion,Status:Status,MultiAZ:MultiAZ,WriteEP:Endpoint,ReadEP:ReaderEndpoint}' \
  --output table

# インスタンス詳細
aws --no-cli-pager rds describe-db-instances --region $REGION \
  --query 'DBInstances[*].{ID:DBInstanceIdentifier,Class:DBInstanceClass,AZ:AvailabilityZone,Role:ReadReplicaSourceDBInstanceIdentifier,Status:DBInstanceStatus}' \
  --output table

# クラスターパラメーター確認
aws --no-cli-pager rds describe-db-cluster-parameters \
  --region $REGION --db-cluster-parameter-group-name ksm-posprd-db-cluster-pg \
  --query 'Parameters[?ParameterValue!=`null`].{Name:ParameterName,Value:ParameterValue}' \
  --output table
```

### 受信内容（主要結果）

```
クラスター（2系統）:
  ksm-posprd-db-cluster           ← メインクラスター (aurora-mysql 8.0.mysql_aurora.3.08.2)
    WriteEP : ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com
    ReadEP  : ksm-posprd-db-cluster.cluster-ro-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com
    MultiAZ : false  ← ⚠️ シングルAZ
  
  ksm-posprd-db-cluster-replica   ← レプリカクラスター
    MultiAZ : false

インスタンス（4台）:
  ksm-posprd-db-instance-1         db.r5.2xlarge  ap-northeast-1c  Writer（プライマリ）
  ksm-posprd-db-instance-2         db.r5.2xlarge  ap-northeast-1a  Reader
  ksm-posprd-db-instance-1-replica db.t3.medium   ap-northeast-1a  Reader（レプリカ）
  ksm-posprd-db-instance-2-replica db.t3.medium   ap-northeast-1c  Reader（レプリカ）

バックアップ:
  バックアップウィンドウ  : UTC 15:00-15:30（JST 00:00-00:30）
  メンテナンスウィンドウ  : sat 15:30-16:00 UTC
  最新復元可能時刻        : 2026-03-08T08:27:12 UTC
  AWS Backup              : 未設定 ⚠️
```

---

## [3] CloudWatch メトリクス調査（RDS CPU/IOPS/接続数）

### コマンド

```bash
REGION="ap-northeast-1"
END=$(date -u +%Y-%m-%dT%H:%M:%SZ)
START=$(date -u -d "7 days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || \
        date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)

# CPU使用率（instance-1 Writer）
aws cloudwatch get-metric-statistics --region $REGION \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=ksm-posprd-db-instance-1 \
  --start-time $START --end-time $END \
  --period 3600 --statistics Average,Maximum \
  --output table

# Write IOPS（instance-1）
aws cloudwatch get-metric-statistics --region $REGION \
  --namespace AWS/RDS --metric-name WriteIOPS \
  --dimensions Name=DBInstanceIdentifier,Value=ksm-posprd-db-instance-1 \
  --start-time $START --end-time $END \
  --period 3600 --statistics Average,Maximum --output table

# DatabaseConnections（instance-2 Reader）
aws cloudwatch get-metric-statistics --region $REGION \
  --namespace AWS/RDS --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=ksm-posprd-db-instance-2 \
  --start-time $START --end-time $END \
  --period 3600 --statistics Average,Maximum --output table
```

### 受信内容（主要結果）

```
CPU使用率（instance-1, 過去7日間）:
  平均: ≒ 0%
  最大: 0.015%（UTC 12:25前後のみ、5回）
  → 7日間でほぼゼロ。日次バッチ（JST 21:25）のみスパイク

CPU使用率（instance-2, 過去7日間）:
  平均: 1.69〜1.78%（一定）
  最大: 2.12%
  → Auroraレプリカ同期・監視処理の固定オーバーヘッド

Write IOPS（instance-1）:
  通常時  : 3.5〜5 IOPS（Aurora内部書き込みのみ）
  UTC12:25: 約62 IOPS（日次バッチ期間中、約1時間）
  UTC16:25: 約7〜9 IOPS（夜間定期処理）

DatabaseConnections（instance-2）:
  168時間中 5時間のみ 接続=1（その他は0）
  → 読み取り系Lambdaの実行時のみ一時接続
```

---

## [4] Lambda 関数調査

### コマンド

```bash
REGION="ap-northeast-1"

# Lambda関数一覧
aws lambda list-functions --region $REGION \
  --query 'Functions[*].{Name:FunctionName,Runtime:Runtime,Memory:MemorySize,Timeout:Timeout}' \
  --output table

# 特定Lambdaの環境変数（Secrets Manager接続先確認）
for fn in \
  ksm-posprd-lmd-function-sg-import-data \
  ksm-posprd-lmd-function-oc-import-data \
  ksm-posprd-lmd-import-pos-master-sh \
  ksm-posprd-lmd-function-split-csv \
  ksm-posprd-lmd-function-get-sync-store; do
  echo "=== $fn ==="
  aws lambda get-function-configuration --region $REGION --function-name $fn \
    --query 'Environment.Variables' --output json
done

# Lambda デプロイパッケージ取得（クラス解析用）
aws lambda get-function --region $REGION \
  --function-name ksm-posprd-lmd-function-oc-import-data \
  --query 'Code.Location' --output text | xargs curl -s -o /tmp/oc-import.zip

cd /tmp && unzip -q oc-import.zip -d oc-import && \
  find oc-import -name "*.class" | grep "com/luvina/pos" | head -30
```

### 受信内容（主要結果）

```
Lambda関数 21本（主要）:
  ksm-posprd-lmd-function-sg-import-data          Java17  2048MB  900s
  ksm-posprd-lmd-function-oc-import-data          Java17  2048MB  900s
  ksm-posprd-lmd-import-pos-master-sh             Java17  2048MB  900s
  ksm-posprd-lmd-function-split-csv               Java17  512MB   300s
  ksm-posprd-lmd-function-get-sync-store          Java17  256MB   300s
  ksm-posprd-lmd-function-p001-import-monitoring  Java17  256MB   300s
  ksm-posprd-lmd-function-create-file-end-for-night Java17 512MB  300s
  ksm-posprd-lmd-function-sent-txt-file           Java17  512MB   300s
  ksm-posprd-lmd-function-backup-file             python3.13 128MB 300s
  ksm-posprd-lmd-function-create-file-end         python3.13 128MB 300s
  ksm-posprd-lmd-function-monthly-cost-check      python3.11 256MB 300s
  （他11本）

Secrets Manager 接続先:
  prd/Replica_Kasumi     → Writer endpoint（書き込み系Lambda使用）
  prd/Replica_Kasumi_RO  → Reader endpoint（読み取り系Lambda使用）
  prd/Batch_Kasumi       → Writer endpoint（バッチ処理用）
  prd/Mail_Kasumi        → Writer endpoint

クラス解析結果（ZIPデプロイパッケージ）:
  oc-import-data: ReplicaImporterOcMain, KasumiItemMasterImportJob
  sg-import-data: ReplicaImporterSgMain, ItemMstImportJob, SpecialPriceMstImportJob
  sh-import     : ReplicaImporterShHandler, P003ImportService, BatchService
  split-csv     : SplitCsvHandler（読み取りのみ）
  get-sync-store: GetSyncStoreHandler, StoreInformation（読み取りのみ）
```

---

## [5] Transfer Family 調査

### コマンド

```bash
REGION="ap-northeast-1"

# サーバー一覧
aws transfer list-servers --region $REGION \
  --query 'Servers[*].{ServerId:ServerId,Domain:Domain,State:State,EndpointType:EndpointType}' \
  --output table

# 各サーバーのユーザー・ホームディレクトリ
for SERVER_ID in s-2a4905e8210f48248 s-bd974a35aa994c838 s-5546031218784c4ba; do
  echo "=== Server: $SERVER_ID ==="
  aws transfer list-users --region $REGION --server-id $SERVER_ID \
    --query 'Users[*].[UserName,HomeDirectory,HomeDirectoryType]' --output table
done

# CloudWatch 転送量メトリクス（過去30日）
for SERVER_ID in s-2a4905e8210f48248 s-bd974a35aa994c838 s-5546031218784c4ba; do
  echo "=== FilesIn: $SERVER_ID ==="
  aws cloudwatch get-metric-statistics --region $REGION \
    --namespace AWS/Transfer \
    --metric-name FilesIn \
    --dimensions Name=ServerId,Value=$SERVER_ID \
    --start-time $(date -u -d "30 days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-30d +%Y-%m-%dT%H:%M:%SZ) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
    --period 2592000 --statistics Sum --output text
done
```

### 受信内容（主要結果）

```
Transfer Familyサーバー 3台:
  s-2a4905e8210f48248  OC系  VPC  ONLINE  ← BIPROGY/OpenCentral
  s-bd974a35aa994c838  SG系  VPC  ONLINE  ← VINX/PosServer
  s-5546031218784c4ba  SH系  VPC  ONLINE  ← SHARP/P003（2025/11追加）

ユーザー・ホームディレクトリ:
  OC系: ksm-posprd-tf-user-oc → /prd-ignica-ksm/oc
  SG系: ksm-posprd-tf-user-sg → /prd-ignica-ksm/sg
  SH系: ksm-posprd-tf-user-sh → /prd-ignica-ksm/pos-original/sh/receive
  ※ 認証方式: SERVICE_MANAGED

転送量メトリクス（過去30日）:
  OC系（s-2a4905...）: FilesIn=304件  BytesIn=2.01GB  (平均6.7MB/件, 10件/日)
  SH系（s-5546...）  : FilesIn=60件   BytesIn=2.22GB  (平均38MB/件,  2件/日)
  SG系（s-bd97...）  : FilesIn=3,007件 BytesIn=25MB   (平均8KB/件, 100件/日)
  BytesOut: 全サーバー 0  ← Transfer Family経由の送信は行われていない
```

---

## [6] VPN・ネットワーク調査

### コマンド

```bash
REGION="ap-northeast-1"

# VPN接続
aws ec2 describe-vpn-connections --region $REGION \
  --query 'VpnConnections[*].{VpnId:VpnConnectionId,CGW:CustomerGatewayId,State:State,Tunnels:VgwTelemetry[*].{IP:OutsideIpAddress,Status:Status}}' \
  --output json

# NAT Gateway
aws ec2 describe-nat-gateways --region $REGION \
  --query 'NatGateways[*].{ID:NatGatewayId,State:State,PublicIP:NatGatewayAddresses[0].PublicIp,SubnetId:SubnetId}' \
  --output table

# Route53 ホストゾーン
aws route53 list-hosted-zones \
  --query 'HostedZones[*].{Name:Name,ID:Id,Private:Config.PrivateZone}' \
  --output table
```

### 受信内容（主要結果）

```
VPN接続:
  VPN ID      : vpn-0ea9b7895f78e4c7e
  種別        : IPSec (Site-to-Site VPN)
  CGW         : 14.224.146.153 (BGP ASN=65000)
  Tunnel T1   : UP   ✅
  Tunnel T2   : DOWN ⚠️  ← 冗長性なし。T1障害で全連携停止リスク
  USMH側CIDR : 10.156.96.0/24 / 172.21.10.0/24 / 10.156.96.192/26

NAT Gateway:
  Public IP : 57.182.174.110
  AZ        : ap-northeast-1a（パブリックサブネット）
  用途      : Lambda/ECS/EC2のインターネット向け送信（NTT DATA CDSへのSFTPを含む）

Route53:
  ignicapos.com  ← パブリックホストゾーン
  ※ プライベートゾーンなし
```

---

## [7] S3 バケット調査

### コマンド

```bash
REGION="ap-northeast-1"

# バケット一覧
aws s3 ls --region $REGION

# メインバケット内容確認
aws s3 ls s3://prd-ignica-ksm/ --recursive --human-readable | head -30

# イベント通知設定確認
aws s3api get-bucket-notification-configuration \
  --region $REGION --bucket prd-ignica-ksm
```

### 受信内容（主要結果）

```
S3バケット（主要）:
  prd-ignica-ksm                  ← メインバケット（OC/SG/SH受信・処理データ）
  prd-ignica-ksm-master-backup    ← マスターデータバックアップ
  prd-ignica-ksm-pmlogs           ← PMログ
  prd-ignica-com-lmd-jar          ← LambdaデプロイJAR格納
  prd-aeon-gift-card              ← ギフトカード処理
  prd-ignica-com-configrecord     ← 設定記録
  ※ pos-master-prod は存在しない

メインバケット フォルダ構成:
  s3://prd-ignica-ksm/oc/          ← OC系着信（BIPROGY）
  s3://prd-ignica-ksm/sg/          ← SG系着信（VINX）
  s3://prd-ignica-ksm/pos-original/sh/receive/  ← SH系着信（SHARP）

イベント通知:
  S3→Lambda/SQS の直接連携設定なし
  ← EventBridge経由でStep Functionsが起動
```

---

## [8] EventBridge・Step Functions・SQS 調査

### コマンド

```bash
REGION="ap-northeast-1"
ACCOUNT="332802448674"

# EventBridgeルール一覧
aws events list-rules --region $REGION \
  --query 'Rules[*].{Name:Name,State:State,Schedule:ScheduleExpression}' \
  --output table

# Step Functions一覧
aws stepfunctions list-state-machines --region $REGION \
  --query 'stateMachines[*].{Name:name,ARN:stateMachineArn}' --output table

# SQS一覧
aws sqs list-queues --region $REGION --output json

# SF定義（oc受信処理）
aws stepfunctions describe-state-machine --region $REGION \
  --state-machine-arn arn:aws:states:$REGION:$ACCOUNT:stateMachine:ksm-posprd-sf-sm-receive-pos-master-oc \
  --query 'definition' --output text | head -80
```

### 受信内容（主要結果）

```
EventBridgeルール（主要）:
  P001監視   : cron(00 15 * * ? *) → JST 00:00 毎日
  ItemMaster : cron(30 20 * * ? *) → JST 05:30 毎日

Step Functions（7本）:
  OC系:
    ksm-posprd-sf-sm-receive-pos-master-oc    ← CSV分割・バックアップ・ENDIMPORTファイル生成
    ksm-posprd-sf-sm-import-pos-master-oc     ← DB取込（41_P001 UPSERT）
    ksm-posprd-sf-sm-create-txt-file-oc       ← TXTファイル生成
  SG系:
    ksm-posprd-sf-sm-receive-and-import-pos-master-sg
    ksm-posprd-sf-sm-create-txt-file-sg
  SH系:
    ksm-posprd-sf-sm-import-pos-master-sh
  共通:
    ksm-posprd-sf-sm-sent-txt-file            ← FTP送信（直接FTPClient使用）

SQS（FIFOキュー 2本、SG専用）:
  ksm-posprd-sqs-export-queue-sg.fifo
  ksm-posprd-sqs-store-code-queue-sg.fifo
```

---

## [9] Secrets Manager 調査

### コマンド

```bash
REGION="ap-northeast-1"

aws secretsmanager list-secrets --region $REGION \
  --query 'SecretList[*].{Name:Name,ARN:ARN}' --output table

# 接続エンドポイント確認（値は取得せずキーのみ）
aws secretsmanager describe-secret --region $REGION \
  --secret-id ksm-posprd-sm-db \
  --query '{Name:Name,Description:Description,Tags:Tags}' --output json
```

### 受信内容（主要結果）

```
Secrets Manager（主要）:
  ksm-posprd-sm-db          ← DB接続情報（Writer）
  ksm-posprd-sm-db-replica  ← DB接続情報（Replica）
  ksm-posprd-sm-sftp        ← SFTP接続情報
  prd/Mail_Kasumi
  prd/Batch_Kasumi
  prd/Replica_Kasumi        ← Writerエンドポイント（命名注意: 「Replica」だがWriter）
  prd/Replica_Kasumi_RO     ← Readerエンドポイント
```

---

## [10] Cost Explorer 調査（2025-09〜2026-02）

### コマンド

```bash
# Cost Explorer（AWSコンソール / CLI）
aws ce get-cost-and-usage \
  --time-period Start=2025-09-01,End=2026-03-01 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output json

# Transfer Family詳細（UsageType別）
aws ce get-cost-and-usage \
  --time-period Start=2025-09-01,End=2026-03-01 \
  --granularity MONTHLY \
  --metrics BlendedCost UsageQuantity \
  --filter '{"Dimensions":{"Key":"SERVICE","Values":["AWS Transfer Family"]}}' \
  --group-by Type=DIMENSION,Key=USAGE_TYPE \
  --output json
```

### 受信内容（主要結果）

```
月別コスト（2025-09〜2026-02）:
  2025-09: $3,316
  2025-10: $3,455
  2025-11: $3,498
  2025-12: $3,908  ← SH系追加でTransfer Family増加
  2026-01: $3,917
  2026-02: $3,587
  合計: $21,683 / 月平均 $3,614

サービス別（合計）:
  RDS (Aurora MySQL) : $13,306 (61%)
  Transfer Family    : $3,324  (15%)
  Tax                : $1,971  (9%)
  EC2                : $1,580  (7%)
  VPC (NAT GW含む)   : $803    (4%)

Transfer Family 内訳（UsageType別）:
  ProtocolHours（サーバー稼働時間）:
    2025-09: $432.00 → 2台稼働
    2025-11: $501.33 → SH系が途中追加（2.32台相当）
    2025-12: $669.60 → 3台フル稼働
    2026-02: $604.80 → 3台 × $0.30 × 672h（2月28日分）
  
  UploadBytes（転送量）:
    $0.07〜$0.16/月（微小。急増の原因ではない）
```

---

## 調査結果サマリー

| 調査項目 | 主な発見 |
|---|---|
| EC2 | 2台のみ（bastion t3.xlarge / giftcard t2.large）。App/Batch Serverなし |
| RDS | db.r5.2xlarge（プライマリ）が著しく過剰スペック。CPU最大0.015% |
| Transfer Family | SH系が2025/11追加がコスト増の真因。VPN T2がDown（冗長性なし） |
| Lambda | 21本。書き込み系3本(Java17)+読み取り系4本+その他 |
| VPN | T1=UP / T2=DOWN 。USMH接続はIPSec VPN（Direct Connectなし） |
| S3 | メインバケット prd-ignica-ksm に全ファイル集約 |
| StepFunctions | 7本（OC/SG/SH/送信）。SQSはSG専用FIFOキュー2本 |
| 送信経路 | Transfer Familyは受信専用。送信はLambda→Apache Commons Net FTPClientで直接FTP |

---

## [11] Secrets Manager DB接続先詳細確認（prd/Replica_Kasumi_RO / Batch / Mail）

**投入日時**: 2026-03-08 18:46 JST（UTC: 2026-03-08T09:46:58Z）  
**目的**: Secrets Manager の各シークレットが Writer / Reader どちらを向いているか確認

### コマンド

```bash
REGION="ap-northeast-1"

echo "=====prd/Replica_Kasumi_RO の中身=====" && \
aws --no-cli-pager secretsmanager get-secret-value \
  --region $REGION \
  --secret-id "prd/Replica_Kasumi_RO" \
  --query 'SecretString' --output text | python3 -m json.tool

echo "=====prd/Batch_Kasumi の中身=====" && \
aws --no-cli-pager secretsmanager get-secret-value \
  --region $REGION \
  --secret-id "prd/Batch_Kasumi" \
  --query 'SecretString' --output text | python3 -m json.tool

echo "=====Mail_Kasumi の中身=====" && \
aws --no-cli-pager secretsmanager get-secret-value \
  --region $REGION \
  --secret-id "prd/Mail_Kasumi" \
  --query 'SecretString' --output text | python3 -m json.tool
```

### 受信内容

```json
// prd/Replica_Kasumi_RO
{
    "HOST": "ksm-posprd-db-cluster.cluster-ro-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com",
    "PORT": "3306",
    "DB_NAME": "Replica_Kasumi",
    "USER_NAME": "admin"
}
// → Readerエンドポイント ✅

// prd/Batch_Kasumi
{
    "HOST": "ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com",
    "PORT": "3306",
    "DB_NAME": "Batch_Kasumi",
    "USER_NAME": "admin"
}
// → Writerエンドポイント

// prd/Mail_Kasumi
{
    "HOST": "ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com",
    "PORT": "3306",
    "DB_NAME": "Mail_Kasumi",
    "USER_NAME": "admin"
}
// → Writerエンドポイント
```

**確認結果**: `prd/Replica_Kasumi` シークレットが Writerエンドポイント接続であることを確認。  
`create-file-end-for-night` Lambda は `prd/Replica_Kasumi`（Writer）を参照 → Reader変更の対象。

---

## [12] Lambda create-file-end-for-night DB調査

**投入日時**: 2026-03-08 19:08〜19:10 JST（UTC: 2026-03-08T10:08〜10:10Z）  
**目的**: create-file-end-for-nightのDB接続先（環境変数）とCloudWatchログ内容を確認

### コマンド

```bash
REGION="ap-northeast-1"

# Lambda環境変数確認
aws --no-cli-pager lambda get-function-configuration \
  --region $REGION \
  --function-name ksm-posprd-lmd-function-create-file-end-for-night \
  --query 'Environment.Variables' --output table

# 最新ログストリーム取得
STREAM=$(aws --no-cli-pager logs describe-log-streams \
  --region $REGION \
  --log-group-name "/aws/lambda/ksm-posprd-lmd-function-create-file-end-for-night" \
  --order-by LastEventTime --descending --max-items 1 \
  --query 'logStreams[0].logStreamName' --output text | head -1)

echo "最新ストリーム: $STREAM"

# ログ全文取得
aws --no-cli-pager logs get-log-events \
  --region $REGION \
  --log-group-name "/aws/lambda/ksm-posprd-lmd-function-create-file-end-for-night" \
  --log-stream-name "$STREAM" \
  --limit 100 \
  --query 'events[*].message' --output text
```

### 受信内容

```
# 環境変数
| DB_BATCH          | DB_KASUMI            |
| prd/Batch_Kasumi  | prd/Replica_Kasumi   |

# 最新ストリーム
2026/03/07/[$LATEST]93e7aaf6a7b448df807064e6fff55255

# ログ（2026-03-07実行分）
INIT_START Runtime Version: java:17.v66
START RequestId: 525dfa7b-205b-44ed-b7c8-9ecefde192e9 Version: $LATEST
✅ Connected to DB!
Parent directory: /tmp/0343
  fileEnd: /tmp/0343/SG_night_export_trigger_2026-03-07T20:30:00Z.ENDEXPORT
  ✅ Uploaded: pos-original/sg/csv/0343/SG_night_export_trigger_2026-03-07T20:30:00Z.ENDEXPORT
Parent directory: /tmp/0253
  ✅ Uploaded: pos-original/sg/csv/0253/SG_night_export_trigger_2026-03-07T20:30:00Z.ENDEXPORT
Parent directory: /tmp/0218
  ✅ Uploaded: pos-original/sg/csv/0218/SG_night_export_trigger_2026-03-07T20:30:00Z.ENDEXPORT
END RequestId: 525dfa7b-205b-44ed-b7c8-9ecefde192e9
REPORT Duration: 11755.12 ms  Billed: 12133 ms  Memory: 512 MB  Used: 186 MB  Init: 377.25 ms
```

**確認結果**:  
- `DB_KASUMI=prd/Replica_Kasumi`（Writerエンドポイント）→ **Reader変更の対象**  
- `DB_BATCH=prd/Batch_Kasumi`（Writerエンドポイント）→ 書き込みあり、変更不要  
- 3店舗（0343/0253/0218）のENDEXPORTファイルをS3にアップロードする処理のみ（SELECT Onlyで読み込みアクセス）

---

## [13] Transfer Family 実態全体確認

**投入日時**: 2026-03-08 21:19 JST（UTC: 2026-03-08T12:19:13Z）  
**目的**: Transfer Family の全サーバー状態・ユーザー・CloudWatchメトリクス・VPN状態を一括確認

### コマンド（スクリプト形式）

```bash
#!/bin/bash
REGION="ap-northeast-1"
echo "====== Transfer Family 実態確認 $(date '+%Y-%m-%d %H:%M:%S') ======"

# [1] サーバー一覧
aws transfer list-servers --region $REGION \
  --query 'Servers[*].{ServerId:ServerId,State:State,EndpointType:EndpointType,Domain:Domain}' \
  --output table

# [2] 各サーバー詳細 + ユーザー
for SID in $(aws transfer list-servers --region $REGION --query 'Servers[*].ServerId' --output text); do
  aws transfer describe-server --region $REGION --server-id $SID \
    --query 'Server.{ID:ServerId,State:State,EndpointType:EndpointType}' --output table
  aws transfer list-users --region $REGION --server-id $SID \
    --query 'Users[*].{UserName:UserName,HomeDir:HomeDirectory}' --output table
done

# [3] CloudWatch 転送メトリクス（過去30日）
for SID in ...; do
  for METRIC in BytesIn BytesOut FilesIn FilesOut; do
    aws cloudwatch get-metric-statistics ...
  done
done

# [4] VPN状態
aws ec2 describe-vpn-connections --region $REGION \
  --vpn-connection-ids vpn-0ea9b7895f78e4c7e \
  --query 'VpnConnections[0].{State:State,T1:VgwTelemetry[0].Status,T2:VgwTelemetry[1].Status}' \
  --output table
```

### 受信内容（主要結果）

```
サーバー一覧:
  s-2a4905e8210f48248  ONLINE  VPC   SFTP  (OC系)
  s-bd974a35aa994c838  ONLINE  VPC   SFTP  (SG系)
  s-5546031218784c4ba  ONLINE  VPC   SFTP  (SH系)

CloudWatchメトリクス（過去30日）:
  OC系: FilesIn=304, BytesIn=2.01GB (6.7MB/件、10件/日)
  SG系: FilesIn=3,007, BytesIn=25MB (8KB/件、100件/日)
  SH系: FilesIn=60, BytesIn=2.22GB (38MB/件、2件/日)

VPN:
  State=available, T1=UP, T2=DOWN（冗長性なし）
```

**確認結果**: SH系のファイル件数は少ないが1ファイルが大きい（38MB）。VPN T2はDOWN。

---

## [14] sent-txt-file Lambda 設定確認

**投入日時**: 2026-03-08 21:48 JST（UTC: 2026-03-08T12:48:27Z）  
**目的**: USMH向け送信処理の実装方式（Lambda設定）確認

### コマンド

```bash
aws lambda get-function-configuration \
  --region ap-northeast-1 \
  --function-name ksm-posprd-lmd-function-sent-txt-file \
  --query '{Handler:Handler,Runtime:Runtime,Env:Environment.Variables,Timeout:Timeout}' \
  --output json
```

### 受信内容

```json
{
    "Handler": "com.luvina.pos.provider.SentFileHandler::handleRequest",
    "Runtime": "java17",
    "Env": null,
    "Timeout": 900
}
```

**確認結果**: Javaハンドラー確認。環境変数なし（DBからFTP接続先を取得する実装）。  
ソースコード確認により Apache Commons Net FTPClient で直接FTP送信することを後続調査で確認。

---

## [15] SSM Port Forwarding 経由 MySQL store_list 確認

**投入日時**: 2026-03-08 21:57〜21:59 JST（UTC: 2026-03-08T12:57〜12:59Z）  
**目的**: store_list テーブルの実データを確認（AwsTargetAccessKey がIAM漏洩か否か）

### コマンド

```bash
# EC2 Bastion確認
aws ec2 describe-instances --region ap-northeast-1 \
  --filters "Name=private-ip-address,Values=10.238.2.39" \
  --query 'Reservations[0].Instances[0].{ID:InstanceId,State:State.Name}' --output table

# SSM Port Forwarding でRDSにトンネル
aws ssm start-session --region ap-northeast-1 --target i-0a395d670d7a3eda3 \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters '{"host":["ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com"],
                 "portNumber":["3306"],"localPortNumber":["3307"]}' &

sleep 3

# Secrets取得
SECRET=$(aws secretsmanager get-secret-value --region ap-northeast-1 \
  --secret-id prd/Replica_Kasumi --query SecretString --output text)
DB_USER=$(echo $SECRET | python3 -c "import sys,json; print(json.load(sys.stdin)['USER_NAME'])")
DB_PASS=$(echo $SECRET | python3 -c "import sys,json; print(json.load(sys.stdin)['PASSWORD'])")
DB_NAME=$(echo $SECRET | python3 -c "import sys,json; print(json.load(sys.stdin)['DB_NAME'])")

# 集計クエリ
mysql -h 127.0.0.1 -P 3307 -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  -e "SELECT COUNT(*) AS total_stores,
             SUM(CASE WHEN AwsTargetAccessKey IS NOT NULL AND AwsTargetAccessKey != '' THEN 1 ELSE 0 END) AS has_aws_key,
             SUM(CASE WHEN SftpPassword IS NOT NULL AND SftpPassword != '' THEN 1 ELSE 0 END) AS has_ftp_password,
             SUM(CASE WHEN SyncFlag = '1' THEN 1 ELSE 0 END) AS sync_enabled
      FROM store_list;"

# 詳細クエリ（先頭マスク）
mysql -h 127.0.0.1 -P 3307 -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  -e "SELECT StoreCode, SyncFlag,
             LEFT(SftpPassword,3) AS FtpPass_先頭3字,
             LEFT(AwsTargetAccessKey,8) AS AwsKey_先頭8字,
             LEFT(AwsTargetSecretKey,4) AS AwsSecret_先頭4字,
             AwsTargetBucket
      FROM store_list;"
```

### 受信内容

```
# EC2 確認
| i-0a395d670d7a3eda3 | running |

# SSM Session開始
SessionId: kiyohara-cz5gh2xra6cdior765flkdeb5i
Port 3307 opened

# 集計クエリ結果
+--------------+-------------+------------------+--------------+
| total_stores | has_aws_key | has_ftp_password | sync_enabled |
+--------------+-------------+------------------+--------------+
|            4 |           4 |                4 |            3 |
+--------------+-------------+------------------+--------------+

# 詳細クエリ結果
+-----------+----------+--------------------+-------------------+----------------------+-----------------+
| StoreCode | SyncFlag | FtpPass_先頭3字    | AwsKey_先頭8字    | AwsSecret_先頭4字    | AwsTargetBucket |
+-----------+----------+--------------------+-------------------+----------------------+-----------------+
|       218 | 1        | ish                | ODab3pQU          | lCU0                 | HLgxShIsn6      |
|       253 | 1        | ish                | ODab3pQU          | lCU0                 | HLgxShIsn6      |
|       343 | 1        | ish                | ODab3pQU          | lCU0                 | HLgxShIsn6      |
|      9176 | 0        | Luv                | ODab3pQU          | lCU0                 | HLgxShIsn6      |
+-----------+----------+--------------------+-------------------+----------------------+-----------------+
```

**確認結果**:  
- 本番3店舗（218/253/343）、テスト店舗1件（9176 SyncFlag=0）  
- AwsTargetAccessKey先頭8字 `ODab3pQU` → **IAM実キーの形式（AKIA...）ではない** → IAM漏洩リスクなし ✅  
- SftpPassword は平文保存（`ish`=isida系パスワード）→ 中リスク（暗号化対応検討）  
- AwsTargetBucket `HLgxShIsn6` → 本物のS3バケット名ではなく内部管理コード

---

## [16] Transfer Family ユーザー・S3イベント通知・EventBridgeルール確認

**投入日時**: 2026-03-08（本日）  
**目的**: Transfer Family OFFLINE時のS3着信フロー（ケースA/B判定）調査

### コマンド

```bash
REGION="ap-northeast-1"
ACCOUNT="332802448674"

echo "=== [1] OC系ユーザー（ホームディレクトリ・S3パス） ==="
aws transfer list-users --region $REGION --server-id s-2a4905e8210f48248 \
  --query 'Users[*].[UserName,HomeDirectory,HomeDirectoryType]' --output table

echo "=== [2] SH系ユーザー ==="
aws transfer list-users --region $REGION --server-id s-5546031218784c4ba \
  --query 'Users[*].[UserName,HomeDirectory,HomeDirectoryType]' --output table

echo "=== [3] S3バケットのイベント通知設定（S3→Lambda/SQSトリガーがあるか） ==="
aws s3api get-bucket-notification-configuration \
  --region $REGION --bucket prd-ignica-ksm

echo "=== [4] EventBridgeルール一覧（名前のみ） ==="
aws events list-rules --region $REGION \
  --query 'Rules[*].Name' --output table

echo "=== [5] EventBridgeルール詳細（oc/sh/receive/import/tf含むもの） ==="
aws events list-rules --region $REGION --output json \
  --query 'Rules[?contains(Name,`oc`) || contains(Name,`sh`) || contains(Name,`receive`) || contains(Name,`import`) || contains(Name,`tf`)].{Name:Name,State:State,EventPattern:EventPattern}'
```

### 受信内容

```
# [1] OC系ユーザー
| ksm-posprd-tf-user-oc | None | LOGICAL |
→ HomeDirectory=None（LOGICALマッピング）→ ユーザーのホームパスはマッピングテーブルで定義

# [2] SH系ユーザー
| ksm-posprd-tf-user-sh | /prd-ignica-ksm/pos-original/sh/receive | PATH |
→ SH系はPATHタイプ: S3パス = prd-ignica-ksm/pos-original/sh/receive/

# [3] S3イベント通知設定
{
    "EventBridgeConfiguration": {}
}
→ S3→LambdaトリガーなしEvmentBridge連携のみ（空設定でEBに転送）

# [4] EventBridgeルール一覧
  ksm-posprd-eb-rule-check-price
  ksm-posprd-eb-rule-copy-backup-sg
  ksm-posprd-eb-rule-create-txt-file-sg
  ksm-posprd-eb-rule-itemmaster-import-monitoring
  ksm-posprd-eb-rule-night-export-sg
  ksm-posprd-eb-rule-p001-import-monitoring
  ksm-posprd-eb-rule-receive-pos-master-oc    ← OC系トリガー
  ksm-posprd-eb-rule-receive-pos-master-sg
  ksm-posprd-eb-rule-receive-pos-master-sh    ← SH系トリガー
  ksm-posprd-eb-rule-receive-splited-pos-master-oc

# [5] EventBridgeルール詳細（抜粋）
  ksm-posprd-eb-rule-receive-pos-master-oc:
    EventPattern: {
      "source": ["aws.s3"],
      "detail-type": ["Object Created"],
      "detail": {
        "bucket": {"name": ["prd-ignica-ksm"]},
        "object": {"key": [{"wildcard": "pos-original/oc/receive/*.end"},
                           {"wildcard": "pos-original/oc/receive/*.END"}]}
      }
    }

  ksm-posprd-eb-rule-receive-pos-master-sh:
    EventPattern: {
      "source": ["aws.s3"],
      "detail-type": ["Object Created"],
      "detail": {
        "bucket": {"name": ["prd-ignica-ksm"]},
        "object": {"key": [{"wildcard": "pos-original/sh/receive/*.end"},
                           {"wildcard": "pos-original/sh/receive/*.END"}]}
      }
    }
```

**確認結果（ケースA/B判定）**:

| 項目 | 結果 |
|---|---|
| S3直接トリガー（Lambda/SQS） | **なし**（EventBridgeのみ） |
| EventBridgeトリガー | S3 Object Created イベントで自動起動 ✅ |
| OC系トリガーパス | `pos-original/oc/receive/*.end` または `*.END` |
| SH系トリガーパス | `pos-original/sh/receive/*.end` または `*.END` |
| OC系ユーザーホームディレクトリ | LOGICALマッピング（別途定義） |
| SH系ユーザーホームディレクトリ | PATH: `/prd-ignica-ksm/pos-original/sh/receive/` |

**→ 結論**: ベンダーはSFTP経由でファイルを送る。Transfer Family OFFLINE中はSFTP接続が拒否され S3にファイルが届かない（**ケースA**が主シナリオ）。  
ただしEventBridge設定により、S3にファイルが置かれた場合は Step Functions が自動起動する仕組みも整っている（ケースB対応済み）。

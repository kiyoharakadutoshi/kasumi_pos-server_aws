# CloudShell 調査ログ DEV 2026-03-12

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-12 |
| 調査者 | 清原 |
| AWSアカウント | 891376952870 (DEV / posspk) |
| リージョン | ap-northeast-1 |
| 目的 | DEV環境 初回調査（STG・PRD同様の構成把握） |

> このファイルは CloudShell コマンドと受信内容の記録です。  
> DEV環境は「posspk」プレフィックスで命名されている。  
> STG(750735758916) から eb-rule-copy-backup-sg 経由でクロスアカウント参照されていることが判明済み（STG調査ログ参照）。

---

## ブロック① VPC・ネットワーク・EC2

**DEV CloudShellで実行:**

```bash
REGION="ap-northeast-1"

echo "=== [D-1] VPC 一覧 ==="
aws ec2 describe-vpcs --region $REGION \
  --query 'Vpcs[*].{VpcId:VpcId,Cidr:CidrBlock,Name:Tags[?Key==`Name`]|[0].Value}' \
  --output table

echo ""
echo "=== [D-2] サブネット 一覧 ==="
VPC_ID=$(aws ec2 describe-vpcs --region $REGION \
  --query 'Vpcs[?Tags[?Key==`Name`]].VpcId | [0]' --output text)
aws ec2 describe-subnets --region $REGION \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[*].{SubnetId:SubnetId,AZ:AvailabilityZone,Cidr:CidrBlock,Name:Tags[?Key==`Name`]|[0].Value}' \
  --output table

echo ""
echo "=== [D-3] ルートテーブル 一覧 ==="
aws ec2 describe-route-tables --region $REGION \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'RouteTables[*].{RTId:RouteTableId,Name:Tags[?Key==`Name`]|[0].Value,Routes:Routes[*].{Dest:DestinationCidrBlock,Via:GatewayId}}' \
  --output json

echo ""
echo "=== [D-4] Internet Gateway ==="
aws ec2 describe-internet-gateways --region $REGION \
  --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
  --output table

echo ""
echo "=== [D-5] NAT Gateway ==="
aws ec2 describe-nat-gateways --region $REGION \
  --filter "Name=vpc-id,Values=$VPC_ID" \
  --query 'NatGateways[*].{ID:NatGatewayId,State:State,PublicIP:NatGatewayAddresses[0].PublicIp,PrivateIP:NatGatewayAddresses[0].PrivateIp,Subnet:SubnetId}' \
  --output table

echo ""
echo "=== [D-6] EC2 インスタンス 一覧 ==="
aws ec2 describe-instances --region $REGION \
  --query 'Reservations[].Instances[].[Tags[?Key==`Name`].Value|[0],InstanceId,InstanceType,State.Name,PrivateIpAddress,Placement.AvailabilityZone,IamInstanceProfile.Arn]' \
  --output table

echo ""
echo "=== [D-7] セキュリティグループ 一覧 ==="
aws ec2 describe-security-groups --region $REGION \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[*].{Name:GroupName,ID:GroupId,InboundCount:length(IpPermissions),OutboundCount:length(IpPermissionsEgress)}' \
  --output table

echo ""
echo "=== [D-8] VPN接続 状態確認 ==="
aws ec2 describe-vpn-connections --region $REGION \
  --query 'VpnConnections[*].{ID:VpnConnectionId,State:State,CGW:CustomerGatewayId,VGW:VpnGatewayId,Tunnels:VgwTelemetry[*].{IP:OutsideIpAddress,Status:Status}}' \
  --output json

echo ""
echo "=== [D-9] Client VPN エンドポイント ==="
aws ec2 describe-client-vpn-endpoints --region $REGION \
  --query 'ClientVpnEndpoints[*].{ID:ClientVpnEndpointId,CIDR:ClientCidrBlock,Status:Status.Code,DnsName:DnsName}' \
  --output table

echo ""
echo "=== [D-10] VPC Endpoint 一覧 ==="
aws ec2 describe-vpc-endpoints --region $REGION \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'VpcEndpoints[*].{ID:VpcEndpointId,Service:ServiceName,Type:VpcEndpointType,State:State}' \
  --output table
```

**受信内容（D-1〜D-10 概要）:**

- VPC: vpc-07b182b381dc59573 / CIDR: 10.226.51.0/24
- IGW: igw-0d133a28e92c93cab
- VGW: vgw-084f9d4fbe8f80f00（USMH向け 10.156.96.192/26 ルートあり）
- S3 VPC Endpoint: vpce-01e614a43ddde10f8（Gateway型）
- ルートテーブル詳細は後段に記載
- EC2インスタンス詳細・SG詳細は未取得（追加調査推奨）

> ⚠️ **private1aのNATルート `Via: null`**: NAT GWが未設定または削除済みの可能性。要追加調査。

---

## ブロック② RDS Aurora

**DEV CloudShellで実行:**

```bash
REGION="ap-northeast-1"

echo "=== [D-11] RDS クラスター 一覧 ==="
aws rds describe-db-clusters --region $REGION \
  --query 'DBClusters[*].{Cluster:DBClusterIdentifier,Engine:Engine,Version:EngineVersion,Status:Status,MultiAZ:MultiAZ,Writer:Endpoint,Reader:ReaderEndpoint,PG:DBClusterParameterGroup}' \
  --output json

echo ""
echo "=== [D-12] RDS インスタンス 詳細 ==="
aws rds describe-db-instances --region $REGION \
  --query 'DBInstances[*].{ID:DBInstanceIdentifier,Class:DBInstanceClass,AZ:AvailabilityZone,Status:DBInstanceStatus,MultiAZ:MultiAZ,SG:VpcSecurityGroups[*].VpcSecurityGroupId,AutoMinor:AutoMinorVersionUpgrade}' \
  --output json

echo ""
echo "=== [D-13] RDS パラメータグループ 一覧 ==="
aws rds describe-db-cluster-parameter-groups --region $REGION \
  --query 'DBClusterParameterGroups[*].{Name:DBClusterParameterGroupName,Family:DBParameterGroupFamily}' \
  --output table

echo ""
echo "=== [D-14] RDS パラメータ（non-default値のみ）==="
for PG in $(aws rds describe-db-cluster-parameter-groups --region $REGION \
  --query 'DBClusterParameterGroups[].DBClusterParameterGroupName' --output text); do
  echo "--- $PG ---"
  aws rds describe-db-cluster-parameters --region $REGION \
    --db-cluster-parameter-group-name "$PG" \
    --query 'Parameters[?IsModifiable==`true` && ParameterValue!=`null`].{Name:ParameterName,Value:ParameterValue,Source:Source}' \
    --output table
done

echo ""
echo "=== [D-15] RDS スナップショット（直近5件）==="
aws rds describe-db-cluster-snapshots --region $REGION \
  --query 'sort_by(DBClusterSnapshots,&SnapshotCreateTime)[-5:].[DBClusterSnapshotIdentifier,DBClusterIdentifier,Status,SnapshotCreateTime,AllocatedStorage]' \
  --output table
```

**受信内容:**

### [D-11] RDS クラスター概要

DEV環境には複数の異なる系統のAuroraクラスターが混在している（詳細はD-12参照）。

### [D-12] RDS インスタンス詳細（7インスタンス）

| インスタンスID | クラス | AZ | SG | 評価 |
|---|---|---|---|---|
| inageya-staging | db.serverless | 1c | sg-0f4261063190195bc | ⚠️ inageyaは別案件 |
| inageya-staging-instance-2 | db.serverless | 1a | sg-0f4261063190195bc | ⚠️ 同上 |
| pos-dev-db-instance-1 | db.serverless | 1c | sg-0b1f2207fd1bf8bb2 | |
| pos-dev-db-instance-1-ap-northeast-1a | db.serverless | 1a | sg-0b1f2207fd1bf8bb2 | |
| **pos-prod-instance-1** | db.serverless | 1c | sg-0b1f2207fd1bf8bb2 | 🔴 prod命名 |
| pos-prod-instance-read | db.serverless | 1a | sg-0b1f2207fd1bf8bb2 | 🔴 prod命名 |
| **posspk-db-instance-1** | **db.r5.large** | 1a | sg-00b263c4d419eee76/sg-0127217180e56d3f1/sg-06702361d579436c5 | ✅ DEVメインDB |

> 🔴 **「inageya」「pos-prod」命名のクラスターが開発アカウントに混在**。  
> inageyaは別プロジェクト（イナゲヤ）の可能性。prod命名DBは本番データ誤投入リスクあり。  
> ⚠️ **posspk-db-instance-1のみ db.r5.large**（Serverlessでない）。費用が固定で発生している。

### [D-13〜15] RDS パラメータグループ・スナップショット

未取得（追加調査推奨）

---

## ブロック① VPC・ネットワーク・EC2（ルートテーブル部分）

**受信内容（D-3 ルートテーブル）:**

| ルートテーブル | 名前 | 主要ルート | 備考 |
|---|---|---|---|
| rtb-0a77a9bbc22a2bdf5 | posspk-vpc-rtb-public1a | 0.0.0.0/0→IGW / S3EP | ✅ |
| rtb-09cbf0908afd528a9 | posspk-vpc-rtb-public1c | 0.0.0.0/0→IGW / S3EP | ✅ |
| rtb-07ee163b7a0046d7a | posspk-vpc-rtb-private1a | 10.156.96.192/26→VGW / 0.0.0.0/0→(NAT) / S3EP | VGWあり |
| rtb-0950abdb22c14091a | posspk-vpc-rtb-private1c | 10.156.96.192/26→VGW / 0.0.0.0/0→(NAT) / S3EP | VGWあり |
| rtb-0e5064919aff8d8b0 | posspk-vpc-rtb-protect1a | ローカルのみ / S3EP | Aurora用 |
| rtb-09b9251ca249e51c9 | posspk-vpc-rtb-protect1c | ローカルのみ / S3EP | Aurora用 |
| rtb-0c61ac94c6a9d93d7 | (名前なし) | ローカルのみ | デフォルトRT |

> S3EP = vpce-01e614a43ddde10f8（S3 Gateway型 VPC Endpoint）  
> VGW = vgw-084f9d4fbe8f80f00  
> IGW = igw-0d133a28e92c93cab  
> VPC CIDR: 10.226.51.0/24

---

## ブロック② RDS Aurora（インスタンス一覧）

**受信内容（D-12 RDS インスタンス詳細）:**

| インスタンスID | クラス | AZ | 状態 | MultiAZ | SG |
|---|---|---|---|---|---|
| inageya-staging | db.serverless | 1c | available | false | sg-0f4261063190195bc |
| inageya-staging-instance-2 | db.serverless | 1a | available | false | sg-0f4261063190195bc |
| pos-dev-db-instance-1 | db.serverless | 1c | available | false | sg-0b1f2207fd1bf8bb2 |
| pos-dev-db-instance-1-ap-northeast-1a | db.serverless | 1a | available | false | sg-0b1f2207fd1bf8bb2 |
| pos-prod-instance-1 | db.serverless | 1c | available | false | sg-0b1f2207fd1bf8bb2 |
| pos-prod-instance-read | db.serverless | 1a | available | false | sg-0b1f2207fd1bf8bb2 |
| **posspk-db-instance-1** | **db.r5.large** | 1a | available | false | sg-00b263c4d419eee76 / sg-0127217180e56d3f1 / sg-06702361d579436c5 |

> ⚠️ **DEVに複数クラスター混在**: inageya-staging / pos-dev / pos-prod / posspk の4系統が確認される  
> ⚠️ **posspk-db-instance-1のみ db.r5.large**（他はすべてServerless）  
> 🔴 **「pos-prod」という命名のDBが開発アカウントに存在**（本番データ混在リスク）

---

## ブロック③ Lambda・Step Functions・EventBridge・SQS

**DEV CloudShellで実行:**

```bash
REGION="ap-northeast-1"

echo "=== [D-16] Lambda 関数 一覧 ==="
aws lambda list-functions --region $REGION \
  --query 'Functions[].[FunctionName,Runtime,MemorySize,Timeout,LastModified]' \
  --output table

echo ""
echo "=== [D-17] Lambda 環境変数 全件 ==="
for FN in $(aws lambda list-functions --region $REGION \
  --query 'Functions[].FunctionName' --output text); do
  echo "--- $FN ---"
  aws lambda get-function-configuration --region $REGION \
    --function-name "$FN" \
    --query '{ENV:Environment.Variables,VPC:VpcConfig.VpcId,SG:VpcConfig.SecurityGroupIds,Subnets:VpcConfig.SubnetIds}' \
    --output json
done

echo ""
echo "=== [D-18] Step Functions ステートマシン 一覧 ==="
aws stepfunctions list-state-machines --region $REGION \
  --query 'stateMachines[].[name,stateMachineArn,creationDate]' \
  --output table

echo ""
echo "=== [D-19] Step Functions 直近実行状態 ==="
for SM in $(aws stepfunctions list-state-machines --region $REGION \
  --query 'stateMachines[].stateMachineArn' --output text); do
  NAME=$(echo $SM | awk -F: '{print $NF}')
  RESULT=$(aws stepfunctions list-executions --region $REGION \
    --state-machine-arn "$SM" \
    --max-results 1 \
    --query 'executions[0].[status,startDate]' \
    --output text 2>/dev/null)
  echo "$NAME: $RESULT"
done

echo ""
echo "=== [D-20] EventBridge ルール 一覧 ==="
aws events list-rules --region $REGION \
  --query 'Rules[].[Name,State,ScheduleExpression]' \
  --output table

echo ""
echo "=== [D-21] EventBridge ルール ターゲット（全件）==="
for RULE in $(aws events list-rules --region $REGION \
  --query 'Rules[].Name' --output text); do
  echo "--- $RULE ---"
  aws events list-targets-by-rule --region $REGION \
    --rule "$RULE" \
    --query 'Targets[].[Id,Arn]' \
    --output table
done

echo ""
echo "=== [D-22] SQS キュー 一覧 ==="
aws sqs list-queues --region $REGION --output json | python3 -c "
import json,sys
data=json.load(sys.stdin)
for url in data.get('QueueUrls',[]):
    print(url.split('/')[-1])
"
```

**受信内容:**

### [D-16] Lambda 関数一覧（26関数）

| 関数名 | Runtime | Memory | Timeout | 最終更新 |
|---|---|---|---|---|
| ksm-posspk-lmd-function-split-txt-by-sent-time | java17 | 512 | 900 | 2026-01-19 |
| ksm-posspk-lmd-function-sent-email | java17 | 512 | 15 | **2026-03-11** |
| ksm-posspk-lmd-zipfile-polling | python3.13 | 128 | 300 | 2025-11-05 |
| ksm-posspk-lmd-function-split-csv | java17 | 1024 | 900 | **2026-03-02** |
| ksm-posspk-lmd-export-polling | python3.13 | 128 | 300 | 2025-11-05 |
| ksm-posspk-lmd-function-sg-export-data | java17 | 1024 | 900 | 2025-09-12 |
| ksm-posspk-lmd-function-sent-txt-file | java17 | 512 | 900 | 2025-09-12 |
| ksm-posspk-lmd-function-get-sync-store | java17 | 1024 | 900 | 2025-09-12 |
| ksm-posspk-lmd-function-unzip-file | java17 | 1024 | 900 | 2025-09-29 |
| ksm-posspk-lmd-function-itemmaster-import-monitoring | java17 | 512 | 900 | 2025-09-12 |
| ksm-posspk-lmd-trigger-sqs-export-sg | python3.13 | 128 | 300 | 2025-11-21 |
| ksm-posspk-lmd-function-create-file-end | java17 | 1024 | 900 | 2025-09-12 |
| **pos-health-check** | **nodejs18.x** | 128 | 3 | 2025-07-18 |
| ksm-posspk-lmd-import-pos-master-oc | java17 | 1024 | 900 | **2026-03-03** |
| ksm-posspk-lmd-function-create-report | java17 | 512 | 900 | **2026-03-11** |
| **ksm-posspk-lmd-function-for-dev-test** | java17 | 256 | 300 | 2025-11-14 |
| ksm-posspk-lmd-function-split-csv-sh | java17 | 512 | 15 | 2025-12-24 |
| ksm-posspk-lmd-function-create-file-end-for-night | java17 | 512 | 300 | 2025-11-06 |
| ksm-posspk-lmd-function-copy-backup-sg | java17 | 512 | 15 | **2026-03-06** |
| ksm-posspk-lmd-function-backup-file | java17 | 1024 | 900 | 2026-01-23 |
| ksm-posspk-lmd-function-receive-and-import-pos-master-sg | java17 | 1024 | 900 | **2026-02-24** |
| **ksm-posspk-lmd-function-store-code-sg-check-message** | **nodejs20.x** | 128 | 900 | 2025-08-08 |
| ksm-posspk-lmd-trigger-sqs-import-sg | python3.13 | 128 | 300 | 2025-11-21 |
| ksm-posspk-lmd-import-pos-master-sh | java17 | 1024 | 900 | **2026-02-24** |
| ksm-posspk-lmd-function-p001-import-monitoring | java17 | 512 | 900 | 2026-01-23 |
| ksm-posspk-lmd-function-store-code-sg-handler | nodejs20.x | 128 | 3 | 2025-08-08 |

**合計: 26関数**（STG:23関数、PRD:21関数より多い。dev-test系追加が原因）

### [D-17] Lambda 環境変数 注目点

| 関数名 | 注目環境変数 | 評価 |
|---|---|---|
| split-txt-by-sent-time | FIRST_NAME_SCHEDULE=ksm-posspk-eb-rule-sent- | ✅ |
| **sent-email** | SNS_TOPIC_ARN=**ksm-posspk-sns-topic-app-logs**（自アカウント）/ CHANNEL_CONFIG=Azure Logic Apps URL / env=**spike** | ⚠️ AzureURL有効期限不明 |
| split-csv | DB_KASUMI=**spike**/Re_Kasumi_RO | ✅（spike=開発環境識別子） |
| sg-export-data | DB_BATCH=**spike**/Batch_Kasumi / DB_KASUMI=**spike**/Re_Kasumi | ✅ |
| import-pos-master-oc | DB_BATCH=**spike**/Batch_Kasumi / DB_KASUMI=**spike**/Re_Kasumi | ✅ |
| create-report | DEST_BUCKET=**spk-ignica-ksm** / DB_KASUMI=**spike**/Re_Kasumi | ✅ |
| **store-code-sg-check-message** | **MYSQL_PASSWORD=f0H4rF2uDIpYh4SW（平文！）** / MYSQL_HOST=posspk-db.cluster-ro-c18sgiku2epk.ap-northeast-1.rds.amazonaws.com | 🔴🔴 **重大：平文パスワード** |
| copy-backup-sg | DEST_BUCKET=**spk-ignica-ksm** | ✅ |

> 🔴🔴 **重大: ksm-posspk-lmd-function-store-code-sg-check-message のENVにMYSQL_PASSWORDが平文で設定されている**  
> Secrets Managerを使わずに直接パスワードを埋め込んでいる。即時Secrets Manager化が必要。  
> （MYSQL_HOST: posspk-db.cluster-ro-c18sgiku2epk.ap-northeast-1.rds.amazonaws.com）

> ✅ **STGで問題だった sent-email の SNS参照**: DEVでは自アカウント `ksm-posspk-sns-topic-app-logs` を参照中（STGのように別アカウントSNSを参照していない）  
> ✅ **Secrets Managerのパス**: `spike/` プレフィックス統一（「スパイク環境」の識別子として機能）

### [D-18] Step Functions ステートマシン（10本）

| SM名 | 作成日 |
|---|---|
| ksm-posspk-sf-sm-create-txt-file-oc | 2025-07-16 |
| ksm-posspk-sf-sm-create-txt-file-sg | 2025-07-23 |
| **ksm-posspk-sf-sm-create-txt-file-sg-copy** | 2025-08-19 |
| ksm-posspk-sf-sm-import-pos-master-oc | 2025-07-16 |
| **ksm-posspk-sf-sm-import-pos-master-oc-copy** | 2025-08-19 |
| ksm-posspk-sf-sm-import-pos-master-sh | 2025-12-10 |
| ksm-posspk-sf-sm-receive-and-import-pos-master-sg | 2025-07-23 |
| **ksm-posspk-sf-sm-receive-and-import-pos-master-sg-copy** | 2025-08-18 |
| ksm-posspk-sf-sm-receive-pos-master-oc | 2025-07-15 |
| ksm-posspk-sf-sm-sent-txt-file | 2025-07-18 |

> ⚠️ **`-copy`サフィックスのSM**が3本存在。開発検証用のコピーが残留している可能性。

### [D-19] Step Functions 直近実行状態

| SM名 | 最新ステータス | 最終実行日 |
|---|---|---|
| create-txt-file-oc | None（未実行） | - |
| **create-txt-file-sg** | SUCCEEDED | 2026-03-12 |
| create-txt-file-sg-copy | None（未実行） | - |
| import-pos-master-oc | None（未実行） | - |
| import-pos-master-oc-copy | SUCCEEDED | 2026-03-03 |
| import-pos-master-sh | SUCCEEDED | 2026-02-24 |
| receive-and-import-pos-master-sg | None（未実行） | - |
| **receive-and-import-pos-master-sg-copy** | SUCCEEDED | 2026-03-12 |
| receive-pos-master-oc | SUCCEEDED | 2026-03-03 |
| **sent-txt-file** | **FAILED** | **2026-03-12 13:57:50 UTC** |

> 🔴 **sf-sm-sent-txt-file が本日（2026-03-12）FAILED。原因調査が必要。**

### [D-20] EventBridge ルール（13本）

| ルール名 | 状態 | スケジュール |
|---|---|---|
| ksm-posspk-eb-rule-check-price-sg | ENABLED | None（S3トリガー） |
| ksm-posspk-eb-rule-copy-backup-sg | ENABLED | None（S3トリガー） |
| ksm-posspk-eb-rule-create-txt-file-oc | **DISABLED** | - |
| ksm-posspk-eb-rule-create-txt-file-sg | ENABLED | None（S3トリガー） |
| ksm-posspk-eb-rule-for-dev-test | ENABLED | None（S3トリガー） |
| ksm-posspk-eb-rule-itemmaster-import-monitoring | ENABLED | cron(30 20 * * ? *) |
| ksm-posspk-eb-rule-night-export-trigger-sg | ENABLED | cron(15 7 * * ? *) |
| ksm-posspk-eb-rule-p001-import-monitoring | ENABLED | cron(54 7 * * ? *) |
| ksm-posspk-eb-rule-receive-pos-master-oc | ENABLED | None（S3トリガー） |
| ksm-posspk-eb-rule-receive-pos-master-sg | ENABLED | None（S3トリガー） |
| ksm-posspk-eb-rule-receive-splited-pos-master-oc | ENABLED | None（S3トリガー） |
| ksm-posspk-eb-rule-receive-splited-pos-master-sh | ENABLED | None（S3トリガー） |
| pos-health-check | ENABLED | cron(0/10 * * * ? *) |

### [D-21] EventBridge ターゲット 全件

**全ターゲットが同一アカウント（891376952870）内のLambda/SFを参照** ✅  
（STGと異なり、クロスアカウント参照ゼロ。DEV側は正しい設定）

> ✅ **DEV側 eb-rule-copy-backup-sg のターゲット = 同アカウントの copy-backup-sg Lambda（891376952870）**  
> 問題はSTG側（750735758916）から DEVのLambdaを呼んでいる点。DEV側は受け入れを許可している（リソースポリシー）。

### [D-22] SQS キュー

- ksm-posspk-sqs-export-queue-sg.fifo
- ksm-posspk-sqs-store-code-queue-sg.fifo

---

## ブロック④ S3・Transfer Family・Secrets Manager・ECR

**DEV CloudShellで実行:**

```bash
REGION="ap-northeast-1"

echo "=== [D-23] S3 バケット 一覧 ==="
aws s3api list-buckets \
  --query 'Buckets[].[Name,CreationDate]' \
  --output table

echo ""
echo "=== [D-24] Transfer Family サーバー 一覧 ==="
aws transfer list-servers --region $REGION \
  --query 'Servers[].[ServerId,State,Domain,EndpointType,IdentityProviderType]' \
  --output table

echo ""
echo "=== [D-25] Transfer Family サーバー詳細・ユーザー ==="
for SID in $(aws transfer list-servers --region $REGION \
  --query 'Servers[].ServerId' --output text); do
  echo "--- $SID ---"
  aws transfer describe-server --region $REGION --server-id $SID \
    --query 'Server.{State:State,Tags:Tags,EndpointDetails:EndpointDetails}' \
    --output json
  aws transfer list-users --region $REGION --server-id $SID \
    --query 'Users[*].UserName' --output text
done

echo ""
echo "=== [D-26] Secrets Manager シークレット 一覧 ==="
aws secretsmanager list-secrets --region $REGION \
  --query 'SecretList[].[Name,LastChangedDate,RotationEnabled,LastAccessedDate]' \
  --output table

echo ""
echo "=== [D-27] ECR リポジトリ 一覧 ==="
aws ecr describe-repositories --region $REGION \
  --query 'repositories[].[repositoryName,imageScanningConfiguration.scanOnPush,encryptionConfiguration.encryptionType,createdAt]' \
  --output table

echo ""
echo "=== [D-28] KMS カスタマーキー 一覧 ==="
aws kms list-keys --region $REGION --query 'Keys[].KeyId' --output text | \
  tr '\t' '\n' | while read KID; do
    INFO=$(aws kms describe-key --region $REGION --key-id $KID \
      --query 'KeyMetadata.{Alias:KeyId,State:KeyState,Manager:KeyManager,Desc:Description}' \
      --output json)
    ALIAS=$(aws kms list-aliases --region $REGION --key-id $KID \
      --query 'Aliases[0].AliasName' --output text 2>/dev/null)
    echo "$ALIAS: $(echo $INFO | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["State"], d["Manager"])')"
  done
```

**受信内容:**

### [D-23] S3 バケット（26本）

| バケット名 | 作成日 | 評価 |
|---|---|---|
| aeon-gift-card | 2025-12-10 | ⚠️ 命名がカスミ系と無関係 |
| aws-cloudtrail-logs-891376952870-6e1158e3 | 2024-12-10 | ✅ CloudTrail |
| bill-details-report | 2025-07-28 | 請求レポート |
| cf-templates-* / codepipeline-* / codepipelinestartertempla-* | 各種 | CFn/CI/CD |
| config-bucket-891376952870 | 2025-10-17 | Config |
| fe-develop | 2025-06-25 | FE開発 |
| **phongbt-auditor-spike** | 2026-01-08 | ⚠️ 個人名バケット |
| **pos-prod-fe** / **pos-prod-fe-public** / **pos-prod-java** | 2025-02-17 | 🔴 prod命名が開発アカウントに |
| pos-server-image-stg | 2025-02-17 | ⚠️ stg命名が開発アカウントに |
| pos-server-file / images / sftp | 2024〜2025 | 各種 |
| pos-tomcat-webapp | 2024-11-10 | |
| posspk-master-batch-source | 2025-05-29 | ✅ |
| possystem-dir / logs / web / web-internal | 2024-11-10 | |
| spk-cost-report | 2025-10-31 | ✅ |
| **spk-ignica-ksm** | 2025-12-29 | ✅ **DEVのメインS3**（STG: stg-ignica-ksm） |

> 🔴 **`pos-prod-*` 命名のバケットが開発アカウントに3本存在** → 本番データ混在リスク  
> ⚠️ **`phongbt-auditor-spike`**: 個人名バケット。用途・権限確認が必要

### [D-24〜25] Transfer Family サーバー（3台）

| サーバーID | 名前 | エンドポイント | ユーザー | 評価 |
|---|---|---|---|---|
| s-4a7aaa2ff88b48239 | ksm-posspk-tf-public | **PUBLIC** | ksm-posspk-tf-user-scango-relay-public | ⚠️ Public公開 |
| s-637e926832eb4724b | posspk-tf | VPC (vpce-09d550ebf7a8d42f8) | posspk-tf-user | ✅ |
| **s-dd96ffb7500645969** | (タグなし) | **PUBLIC** | IGPOS15 IGPOS31 IGPOS32 dev3 inageya kasumi **kiyohara** | 🔴 ユーザー多数・タグなし |

> 🔴 **s-dd96ffb7500645969**: タグ未設定、PUBLIC公開、7名ユーザー。管理が不十分。

### [D-26] Secrets Manager（8件）

| シークレット名 | 最終変更 | 最終アクセス | ローテーション |
|---|---|---|---|
| rds-db-credentials/cluster-.../pos-testing/... | 2025-04-16 | 2025-12-17 | None |
| rds!cluster-bda09044-... | 2025-08-11 | 2026-02-11 | False |
| posspk-sm-sftp | 2025-05-26 | 2025-12-30 | None |
| spike/Replica_Kasumi | 2025-07-17 | 2025-12-30 | None |
| spike/Re_Kasumi | 2025-09-04 | **2026-03-12 ✅** | None |
| spike/Batch_Kasumi | 2025-08-11 | 2025-12-30 | None |
| spike/Mail_Kasumi | 2025-08-11 | 2025-12-30 | None |
| spike/Re_Kasumi_RO | 2025-09-03 | **2026-03-12 ✅** | None |

> ✅ spike/ プレフィックスで統一。本日も Re_Kasumi / Re_Kasumi_RO がアクティブに使用中

### [D-27] ECR リポジトリ（7本）

> 🔴 **全7リポジトリで scanOnPush=False**。脆弱性スキャン未実施。

### [D-28] KMS

- AWS管理キー: rds/sns/lightsail/s3/acm/lambda/secretsmanager（7本）
- カスタマーキー: **alias/posspk-kms-sm** 1本（Enabled）

---

## ブロック⑤ ECS・IAM・CloudWatch・その他

**DEV CloudShellで実行:**

```bash
REGION="ap-northeast-1"

echo "=== [D-29] ECS クラスター 一覧 ==="
aws ecs list-clusters --region $REGION --output json
for CLUSTER in $(aws ecs list-clusters --region $REGION \
  --query 'clusterArns[]' --output text); do
  NAME=$(echo $CLUSTER | awk -F/ '{print $NF}')
  echo "--- $NAME ---"
  aws ecs describe-clusters --region $REGION --clusters $CLUSTER \
    --query 'clusters[0].{Name:clusterName,Status:status,ActiveServices:activeServicesCount,RunningTasks:runningTasksCount}' \
    --output json
done

echo ""
echo "=== [D-30] IAM ユーザー 一覧 ==="
aws iam list-users \
  --query 'Users[].[UserName,CreateDate,PasswordLastUsed]' \
  --output table

echo ""
echo "=== [D-31] IAM アクセスキー状況 ==="
for USER in $(aws iam list-users --query 'Users[].UserName' --output text); do
  KEYS=$(aws iam list-access-keys --user-name $USER \
    --query 'AccessKeyMetadata[].[AccessKeyId,Status,CreateDate]' \
    --output text)
  [ -n "$KEYS" ] && echo "$USER: $KEYS"
done

echo ""
echo "=== [D-32] CloudWatch アラーム 一覧 ==="
aws cloudwatch describe-alarms --region $REGION \
  --query 'MetricAlarms[].[AlarmName,StateValue,StateUpdatedTimestamp,Namespace]' \
  --output table

echo ""
echo "=== [D-33] SNS トピック 一覧 ==="
aws sns list-topics --region $REGION \
  --query 'Topics[].TopicArn' --output text | tr '\t' '\n'

echo ""
echo "=== [D-34] CloudFormation スタック 一覧 ==="
aws cloudformation list-stacks --region $REGION \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query 'StackSummaries[].[StackName,StackStatus,CreationTime,LastUpdatedTime]' \
  --output table

echo ""
echo "=== [D-35] GuardDuty 有効化状況 ==="
aws guardduty list-detectors --region $REGION --output json

echo ""
echo "=== [D-36] Security Hub 状況 ==="
aws securityhub describe-hub --region $REGION --output json 2>&1 | head -20

echo ""
echo "=== [D-37] Config 有効化状況 ==="
aws configservice describe-configuration-recorders --region $REGION --output json

echo ""
echo "=== [D-38] AWSアカウントID確認 ==="
aws sts get-caller-identity
```

**受信内容:**

### [D-29] ECS クラスター（3本）

| クラスター名 | 状態 | ActiveServices | RunningTasks |
|---|---|---|---|
| **ksm-posspk-ecs-cluster-web** | ACTIVE | 1 | **1** |
| AWSBatch-pos_server_batch-* | ACTIVE | 0 | 0 |
| posspk-cluster | ACTIVE | 0 | 0 |

> ✅ ksm-posspk-ecs-cluster-web で1タスク稼働中（web-beサービス）

### [D-30] IAM ユーザー（13名）

| ユーザー名 | 作成日 | 最終ログイン |
|---|---|---|
| buithephong | 2026-01-07 | 2026-01-08 |
| dattv | 2025-03-25 | 2026-03-12 |
| dattv_cli_deploy | 2026-03-09 | None（CLIのみ） |
| dev1root | 2024-07-17 | 2025-07-28 |
| **kiyohara** | **2026-03-11** | **2026-03-12** |
| locnt | 2025-08-27 | 2026-03-12 |
| locnt_cli_deploy | 2026-03-09 | None（CLIのみ） |
| **nangld_admin** | 2026-03-05 | 2026-03-12 |
| nangld_readonly | 2026-03-05 | 2026-03-12 |
| pos-server-logging | 2024-10-19 | None |
| pos-server-s3-bucket | 2024-09-17 | None |
| pos_dev_vangle_sonln | 2026-01-23 | 2026-03-12 |
| pos_dev_vangle_tuannv | 2026-01-23 | 2026-03-12 |

### [D-31] IAM アクセスキー状況

| ユーザー | アクセスキー | 状態 | 作成日 |
|---|---|---|---|
| buithephong | AKIA47CRU4YTNMBLZAG2 | **Active** | 2026-02-12 |
| buithephong | AKIA47CRU4YTOK37HME6 | Inactive | 2026-01-08 |
| dev1root | AKIA47CRU4YTBPLS63GV | Inactive | 2024-10-16 |
| dev1root | AKIA47CRU4YTH5WUNLLV | Inactive | 2024-10-17 |
| locnt | AKIA47CRU4YTHWESEEFV | **Active** | 2025-12-01 |
| **pos-server-logging** | AKIA47CRU4YTGB2G3ZU7 | **Active** | 2024-10-19 |
| **pos-server-s3-bucket** | AKIA47CRU4YTO2J7I4WV | **Active** | 2024-09-17 |

> ⚠️ **pos-server-logging / pos-server-s3-bucket**: ログイン実績なし（コンソールログインなし）のサービス用ユーザー。アクセスキーが長期間有効。定期ローテーション要確認。

### [D-32] CloudWatch アラーム（9本）

| アラーム名 | 状態 | 更新日 |
|---|---|---|
| TargetTracking-pos-asg-AlarmHigh-* | OK | 2025-04-03 |
| **TargetTracking-pos-asg-AlarmLow-*** | **ALARM** | 2025-04-03 |
| TargetTracking-pos-production-AlarmHigh-* | OK | 2025-03-26 |
| **TargetTracking-pos-production-AlarmLow-*** | **ALARM** | 2025-06-25 |
| TargetTracking-pos-stg-management-AlarmHigh-* | OK | 2025-03-13 |
| **TargetTracking-pos-stg-management-AlarmLow-*** | **ALARM** | 2025-04-16 |
| TargetTracking-prod-pos-AlarmHigh-* | OK | 2025-04-02 |
| **TargetTracking-prod-pos-AlarmLow-*** | **ALARM** | 2025-04-03 |
| **pos-health-check** | **INSUFFICIENT_DATA** | 2026-03-12 |

> ⚠️ **ALARMが4本**: すべて ASG TargetTracking の AlarmLow（スケールイン不要判定）。古い日付のため、ASGが削除済みまたは停止後の残骸アラームの可能性。
> ⚠️ **pos-health-check が INSUFFICIENT_DATA**: Lambda実行結果が届いていない。

### [D-33] SNS トピック（3本）

| トピックARN |
|---|
| arn:aws:sns:ap-northeast-1:891376952870:ksm-posspk-sns-topic-app-logs |
| arn:aws:sns:ap-northeast-1:891376952870:pos-sre |
| arn:aws:sns:ap-northeast-1:891376952870:teams-notifications |

> ✅ STGにあった `ksm-posspk-sns-topic-app-logs-dev` はSTGアカウント側の誤残留。  
> DEV本体にある `ksm-posspk-sns-topic-app-logs` は正当なDEVのSNSトピック。

### [D-34] CloudFormation スタック（4本）

- ECS-Console-V2-Service-ksm-posspk-task-definition-web-be-service-*（2025-09-23）
- Infra-ECS-Cluster-ksm-posspk-ecs-cluster-web-*（2025-09-19）
- CodePipelineStarterTemplate-PushToECR-*（2025-08-06）
- Infra-ECS-Cluster-posspk-cluster-*（2025-05-26）

### [D-35〜37] セキュリティサービス

| サービス | 状態 | 評価 |
|---|---|---|
| GuardDuty | **DetectorIds: []（未有効）** | 🔴 重大 |
| Security Hub | **未サブスクライブ** | 🔴 重大 |
| Config | 有効（ただしIAM系を除外設定） | ⚠️ 一部除外あり |

> 🔴 **GuardDuty・Security Hub いずれも未有効**。STG/PRDで有効化されているサービスが本環境では無効。脅威検出・セキュリティ評価が機能していない。

### [D-38] アカウントID確認

Account: **891376952870** ✅（kiyoharaユーザーで実行）

---

## ブロック⑥ EBSボリューム・OpenVPN・特殊確認

**DEV CloudShellで実行:**

```bash
REGION="ap-northeast-1"

echo "=== [D-39] EBS ボリューム 暗号化状況 ==="
aws ec2 describe-volumes --region $REGION \
  --query 'Volumes[].[VolumeId,Size,Encrypted,State,Attachments[0].InstanceId]' \
  --output table

echo ""
echo "=== [D-40] AMI（自作AMI）一覧 ==="
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ec2 describe-images --region $REGION \
  --owners $ACCOUNT_ID \
  --query 'Images[].[ImageId,Name,CreationDate,State]' \
  --output table

echo ""
echo "=== [D-41] Lambda リソースポリシー（copy-backup-sg）==="
aws lambda get-policy --region $REGION \
  --function-name ksm-posspk-lmd-function-copy-backup-sg \
  --output json 2>&1

echo ""
echo "=== [D-42] EventBridge copy-backup-sg ターゲット 詳細 ==="
aws events list-targets-by-rule --region $REGION \
  --rule ksm-posspk-eb-rule-copy-backup-sg \
  --output json 2>&1

echo ""
echo "=== [D-43] Route53 ホストゾーン ==="
aws route53 list-hosted-zones \
  --query 'HostedZones[].[Name,Id,Config.PrivateZone]' \
  --output table

echo ""
echo "=== [D-44] ACM 証明書 一覧 ==="
aws acm list-certificates --region $REGION \
  --query 'CertificateSummaryList[].[DomainName,CertificateArn,Status]' \
  --output table 2>&1

echo ""
echo "=== [D-45] CloudTrail トレイル 一覧 ==="
aws cloudtrail describe-trails --region $REGION --output table
```

**受信内容:**

### [D-39] EBS ボリューム暗号化状況（20本）

> 🔴🔴 **全20本が未暗号化（Encrypted=False）**  
> STGは2本未暗号化、PRDは未調査だが、DEVは全ボリュームが未暗号化という最悪の状態。

| ボリュームID | サイズ | 暗号化 | アタッチ先 |
|---|---|---|---|
| vol-0eed3120a74f1aec8 | 50GB | **False** 🔴 | i-00149f9b42e54656c |
| vol-09115eb8db91277ee | 100GB | **False** 🔴 | i-07aa32648d469e87a |
| vol-0e643edf8e8ed1f1e | 60GB | **False** 🔴 | i-0ce4bbfa56fea3b7b |
| vol-0b23d028d79f6e84e | 20GB | **False** 🔴 | i-027af978d9452d713 |
| vol-080c845c928ea272a | 100GB | **False** 🔴 | i-08359dc0f1260afef |
| 他15本 | 各種 | **False** 🔴 | 各種 |

### [D-40] 自作AMI（4本）

| AMI ID | 名前 | 作成日 |
|---|---|---|
| ami-06e7f66a5c17aa245 | prod-prod | 2024-12-10 |
| ami-036bceed18ac68b03 | pos-ec2 | 2024-09-05 |
| ami-0d7753d75484359ba | Pos-prodv1 | 2024-12-10 |
| ami-06471dd3b5523a6e3 | posserverv2 | 2024-09-06 |

> ⚠️ `prod-prod` / `Pos-prodv1` などの命名が開発アカウントに存在。

### [D-41] 🔑 copy-backup-sg Lambda リソースポリシー（クロスアカウント問題の核心）

```json
{
  "Sid": "AllowEventBridgeCallCrossAccount",
  "Effect": "Allow",
  "Principal": {"AWS": "arn:aws:iam::750735758916:root"},
  "Action": "lambda:InvokeFunction",
  "Resource": "arn:aws:lambda:ap-northeast-1:891376952870:function:ksm-posspk-lmd-function-copy-backup-sg"
}
```

> 🚨 **STGアカウント（750735758916）からのLambda呼び出しを明示的に許可している**  
> これは意図的に設定された構成（Sid名: AllowEventBridgeCallCrossAccount）。  
> DEV環境のバックアップ処理をSTGのEventBridgeが呼び出す設計のようだが、  
> STG調査では「設定ミスの可能性」とされており、この設計の意図をLuvinaチームに確認が必要。

### [D-42] DEV側 eb-rule-copy-backup-sg ターゲット

ターゲット: `arn:aws:lambda:ap-northeast-1:891376952870:function:ksm-posspk-lmd-function-copy-backup-sg`  
→ **同一アカウント（DEV）内のLambdaを参照** ✅（DEV側は正常）

### [D-43] Route53

ホストゾーン: なし（DEVはRoute53未使用）

### [D-44] ACM 証明書（5本）

| ドメイン | 状態 |
|---|---|
| luvina.net | ISSUED ✅ |
| ignicapos.com | ISSUED ✅ |
| pos-vpn-server | ISSUED ✅ |
| posclient | ISSUED ✅ |
| pos-spk | ISSUED ✅ |

### [D-45] CloudTrail

| トレイル名 | マルチリージョン | ログ検証 | S3バケット |
|---|---|---|---|
| s3-upload-trail | True ✅ | **False** 🔴 | aws-cloudtrail-logs-891376952870-6e1158e3 |

> 🔴 **LogFileValidationEnabled=False**: ログ改ざん検知が無効。

---

## ブロック⑦ CLI（AssumeRole）追加調査 — 2026-03-13

> 以下はClaude Code CLI（`kasumi-dev-readonly`プロファイル = cli-readonlyロール経由）で取得。
> 調査日: 2026-03-13、調査者: 清原（Claude Code CLI）

### [D-6] EC2 インスタンス一覧（20台: running 12 / stopped 8）

| 名前 | InstanceId | タイプ | 状態 | PrivateIP | AZ |
|---|---|---|---|---|---|
| pos-bastion | i-012d5522458eba141 | t2.micro | **running** | 10.226.50.24 | 1c |
| stg-pos | i-03d61e966336c6bac | t2.medium | **running** | 10.226.50.136 | 1a |
| stg-pos-system | i-083e64fbe8ed7f513 | t2.medium | **running** | 10.226.50.132 | 1a |
| pos-server-distribute | i-0dddc4e7087f80519 | t2.medium | stopped | 10.226.50.137 | 1a |
| prod-pos-server-distribute | i-0bbdc3958d769b652 | t2.medium | stopped | 10.226.50.133 | 1a |
| prod-pos-server | i-0ce4bbfa56fea3b7b | t2.large | **running** | 10.226.50.134 | 1a |
| (名前なし) | i-0372af0dc46e2237a | t2.medium | stopped | 10.226.50.141 | 1a |
| (名前なし) | i-07aa32648d469e87a | t2.medium | stopped | 10.226.50.140 | 1a |
| (名前なし) | i-0d744cdaec033ecd9 | t2.xlarge | stopped | 10.226.50.139 | 1a |
| stg-pos-large | i-08359dc0f1260afef | t2.large | **running** | 10.226.50.142 | 1a |
| stg-pos-server | i-0ae0fc303dc04b91b | t2.medium | **running** | 10.226.50.153 | 1c |
| prod-pos-t2.xlarge | i-0e75523fb0b24388d | t2.xlarge | **running** | 10.226.50.148 | 1c |
| (名前なし) | i-03e05b3f51a4e7130 | t2.medium | stopped | 10.226.50.149 | 1c |
| (名前なし) | i-0e60a56a426c4db27 | t2.medium | stopped | 10.226.50.155 | 1c |
| kafka | i-00149f9b42e54656c | t2.medium | **running** | 10.226.50.23 | 1c |
| (名前なし) | i-0fdac0dc4c4754d1e | t2.large | stopped | 10.226.50.154 | 1c |
| ksm-posspk-ec2-instance-web-fe | i-027af978d9452d713 | t3.medium | **running** | 10.226.51.15 | 1a |
| posspk-ec2-bastion-public | i-0375a33ee8fcf3993 | t3.micro | **running** | 10.226.51.13 | 1a |
| pos-runner | i-03e229bf2d6c3bd00 | t3.medium | **running** | 10.226.51.115 | 1a |
| ksm-posspk-ec2-instance-web-be | i-05fdf2857655d4561 | t3.medium | **running** | 10.226.51.91 | 1a |

> 🔴 **prod命名**: `prod-pos-server` / `prod-pos-server-distribute` / `prod-pos-t2.xlarge` が開発アカウントに存在
> 🔴 **stg命名**: `stg-pos` / `stg-pos-system` / `stg-pos-large` / `stg-pos-server` が混在
> ⚠️ **名前なしインスタンス5台**: 管理タグ未設定（棚卸し必要）
> ⚠️ **stopped 8台**: 長期停止インスタンスの削除検討が必要
> ✅ **ksm-posspk-系**: web-fe / web-be / bastion / runner（4台）が稼働中 = DEV新環境

### [D-7] セキュリティグループ（VPC: vpc-07b182b381dc59573 / 24個）

| SG ID | 名前 | Inbound | Outbound |
|---|---|---|---|
| sg-0b6aa5093cdfed7ca | default | 1 | 1 |
| sg-0fe8e2f364388a886 | posspk-sg-bastion | 1 | 1 |
| sg-0127217180e56d3f1 | posspk-sg-db | 1 | 1 |
| sg-0ed4fa7cbd7b57f9d | posspk-sg-lambda | 0 | 1 |
| sg-039e6f0fd1c1a1060 | posspk-sg-ecs | 0 | 1 |
| sg-0ffac159ed30ec7a0 | posspk-sg-tf | 1 | 1 |
| sg-0183508d0fd98cd83 | posspk-sg-client-vpn-endpoint | 0 | 1 |
| sg-05832e61986292ae3 | posspk-sg-gitlap-runner | 2 | 1 |
| sg-0aa807b8bbabf8e47 | posspk-ec2-sftp-test | 2 | 1 |
| sg-09002eb900fad6bcb | posspk-master-batch | 0 | 1 |
| sg-016eb443cdf00ec80 | posspk-sg-ep-cwm | 1 | 1 |
| sg-06108fb1e1e259597 | posspk-sg-ep-cwl | 1 | 1 |
| sg-0a43778eebb7bdd3e | posspk-sg-ep-sm | 1 | 1 |
| sg-0898dd1eb56056104 | posspk-sg-ep-ssm | 2 | 1 |
| sg-0d215bb6fb06cd0be | posspk-sg-ep-ecr | 1 | 1 |
| sg-06a3d65d78614acd5 | posspk-sg-ep-kms | 1 | 1 |
| sg-0a1b60facd9de3635 | posspk-vcp-sg-ep-ec2instanceconnect | 1 | 1 |
| sg-049ad86ad4d29ce37 | ec2-rds-1 | 2 | 1 |
| sg-00b263c4d419eee76 | rds-ec2-1 | 1 | 0 |
| sg-0f2004c11f94f496b | lambda-rds-1 | 0 | 1 |
| sg-06702361d579436c5 | rds-lambda-1 | 1 | 0 |
| sg-0f8846ed58853aa3f | ksm-posprd-vpc-sg-ec2-web | 3 | 1 |
| sg-0effaabe6a665297b | ksm-posstg-vpc-sg-alb-web-be | 1 | 1 |
| sg-0a48afc898cb772e1 | ksm-posprd-vpc-sg-ec2-web-be | 4 | 2 |

> ⚠️ **ksm-posprd- / ksm-posstg- 命名のSG**: prod/stg用SGが開発VPCに混在

### [D-5] NAT Gateway（1台 available）

| ID | 状態 | PublicIP | サブネット |
|---|---|---|---|
| nat-0afcb79dbd5562234 | available | 52.197.122.153 | subnet-0fc8bdab3418f855a |

> ✅ NAT Gateway稼働中。前回の「private1a Via: null」は別ルートテーブルの問題の可能性。

### [D-11] RDS クラスター詳細（4クラスター）

| クラスター | Engine | バージョン | 状態 |
|---|---|---|---|
| inageya-staging-cluster | aurora-mysql | 8.0.mysql_aurora.3.08.2 | available |
| pos-dev-db | aurora-mysql | 8.0.mysql_aurora.3.08.2 | available |
| pos-prod | aurora-mysql | 8.0.mysql_aurora.3.08.2 | available |
| posspk-db | aurora-mysql | 8.0.mysql_aurora.3.08.2 | available |

> 全クラスター Aurora MySQL 8.0（バージョン統一）

### [D-13] RDS パラメータグループ

| パラメータグループ | ファミリー |
|---|---|
| default.aurora-mysql8.0 | aurora-mysql8.0 |
| posspk-db-parameter-group | aurora-mysql8.0 |
| setting-default-timezone-group | aurora-mysql8.0 |

### [D-15] RDS スナップショット（直近5件）

| スナップショット名 | クラスター | 状態 | 作成日 |
|---|---|---|---|
| rds-posspk-db-2026-01-30 | posspk-db | available | 2026-01-30 |
| rds:posspk-db-2026-03-12 | posspk-db | available | 2026-03-12 |
| rds:inageya-staging-cluster-2026-03-12 | inageya-staging-cluster | available | 2026-03-12 |
| rds:pos-dev-db-2026-03-12 | pos-dev-db | available | 2026-03-12 |
| rds:pos-prod-2026-03-12 | pos-prod | available | 2026-03-12 |

> ✅ 自動スナップショットが本日取得済み（全4クラスター分）

### [D-8追加] Step Functions sent-txt-file 連続FAILED

| 実行ID | ステータス | 開始 | 終了 |
|---|---|---|---|
| 8169b2c6-... | **FAILED** | 2026-03-12 20:57:50 | 2026-03-12 20:58:07 |
| 0a69b2c6-... | **FAILED** | 2026-03-12 20:57:35 | 2026-03-12 20:57:52 |
| 4069b2c6-... | **FAILED** | 2026-03-12 20:57:18 | 2026-03-12 20:57:34 |

> 🔴 **直近3回連続FAILED**（約15秒間隔でリトライ→全失敗）。CloudWatch Logsでの原因調査が必要。

### ECS サービス

- クラスター: ksm-posspk-ecs-cluster-web
- サービス: ksm-posspk-task-definition-web-be-service-sg4hsjt1（1タスク稼働中）

---

## まとめ・所見

### 確認済み事項（調査前から判明していた情報）

| 情報 | ソース |
|---|---|
| AWSアカウントID: 891376952870 | STG調査ログ（eb-rule-copy-backup-sgのターゲットARNから判明） |
| 命名プレフィックス: ksm-posspk- | 複数STGリソースのARN・ENV変数から判明 |
| 用途: Luvina内部開発環境（posspk）= スパイク環境 | Secrets Manager spike/ プレフィックスで確定 |
| STGからのクロスアカウント参照: eb-rule-copy-backup-sg → DEV Lambda | DEV側リソースポリシーで明示的に許可済み（意図的設計と推定） |

### 新規確認事項

| # | カテゴリ | 内容 |
|---|---|---|
| 1 | Lambda数 | **26関数**（STG:23・PRD:21より多い） |
| 2 | Step Functions | **10SM**（-copy系3本含む） |
| 3 | S3 | **26バケット**（STG:9本より大幅に多い） |
| 4 | Transfer Family | 3台（うち1台タグ未設定・PUBLIC・7名ユーザー） |
| 5 | ECS | 3クラスター（ksm-posspk-ecs-cluster-webで1タスク稼働中） |
| 6 | IAM | 13ユーザー（本日kiyoharaでログイン確認） |
| 7 | RDS | 4系統のクラスターが混在（posspk/pos-dev/pos-prod/inageya） |
| 8 | クロスアカウント | DEV Lambda側でSTG(750735758916)からの呼び出しを明示許可済み |

### 問題点・改修候補

| # | 重要度 | カテゴリ | 問題内容 | 推奨対応 |
|---|---|---|---|---|
| DEV-1 | 🔴🔴 | Lambda ENV | **store-code-sg-check-message にMYSQL_PASSWORDが平文**（f0H4rF2uDIpYh4SW） | Secrets Manager化（spike/MySQL_Kasumi等） |
| DEV-2 | 🔴🔴 | EBS | **全20ボリュームが未暗号化** | 新規ボリュームのデフォルト暗号化有効化 |
| DEV-3 | 🔴 | セキュリティ | **GuardDuty 未有効** | 有効化（月数ドル程度） |
| DEV-4 | 🔴 | セキュリティ | **Security Hub 未サブスクライブ** | 有効化 |
| DEV-5 | 🔴 | CloudTrail | **LogFileValidationEnabled=False** | 有効化 |
| DEV-6 | 🔴 | RDS | **inageya・pos-prod命名のDBが混在** | 用途・データ確認の上で分離または削除 |
| DEV-7 | 🔴 | S3 | **pos-prod-fe/pos-prod-fe-public/pos-prod-java** バケットが開発アカウントに存在 | 用途確認・必要に応じて削除または移動 |
| DEV-8 | 🔴 | Step Functions | **sf-sm-sent-txt-file が本日（2026-03-12）FAILED** | CloudWatchログで原因調査 |
| DEV-9 | ⚠️ | Transfer Family | **s-dd96ffb7500645969**: タグなし・PUBLIC・7名ユーザー | タグ付け・ユーザー棚卸し・VPC化検討 |
| DEV-10 | ⚠️ | ECR | **全7リポジトリ scanOnPush=False** | True に変更 |
| DEV-11 | ⚠️ | CloudWatch | ALARMが4本（TargetTracking AlarmLow）→ ASG残骸の可能性 | 対象ASGの存在確認の上でアラーム削除 |
| DEV-12 | ⚠️ | Lambda ENV | **sent-email の CHANNEL_CONFIG**: Azure Logic Apps URLの有効期限不明 | URL有効期限・管理者確認 |
| DEV-13 | ⚠️ | クロスアカウント | STGの eb-rule-copy-backup-sg がDEV Lambdaを呼び出す設計の意図 | Luvinaチームへ設計意図確認・不要なら修正 |
| DEV-14 | 🟡 | S3 | **phongbt-auditor-spike**（個人名バケット） | 用途・権限確認 |
| DEV-15 | 🟡 | IAM | pos-server-logging / pos-server-s3-bucket のアクセスキーが長期間有効 | ローテーション実施 |
| DEV-16 | 🟡 | Step Functions | -copy サフィックスSM（3本）が未実行のまま残留 | 不要であれば削除 |
| DEV-17 | 🔴 | EC2 | **prod/stg命名のEC2が開発アカウントに多数混在**（prod-pos-server等） | 用途確認・分離 |
| DEV-18 | ⚠️ | EC2 | **名前なしインスタンス5台 + stopped 8台**が放置 | 棚卸し・不要なら削除 |
| DEV-19 | ⚠️ | SG | **ksm-posprd- / ksm-posstg- 命名のSG**が開発VPCに混在 | 用途確認 |
| DEV-20 | 🔴 | Step Functions | **sent-txt-file が直近3回連続FAILED**（2026-03-12） | CloudWatch Logsで原因調査 |

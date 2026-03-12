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

**受信内容:**

```
（ここに貼り付け）
```

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

```
（ここに貼り付け）
```

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

```
（ここに貼り付け）
```

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

```
（ここに貼り付け）
```

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

```
（ここに貼り付け）
```

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

```
（ここに貼り付け）
```

---

## まとめ・所見

> ※ 結果貼り付け後に記入する

### 確認済み事項（調査前から判明していた情報）

| 情報 | ソース |
|---|---|
| AWSアカウントID: 891376952870 | STG調査ログ（eb-rule-copy-backup-sgのターゲットARNから判明） |
| 命名プレフィックス: ksm-posspk- | 複数STGリソースのARN・ENV変数から判明 |
| 用途: Luvina内部開発環境（posspk） | STG調査ログ所見 |
| STGからのクロスアカウント参照: eb-rule-copy-backup-sg → ksm-posspk-lmd-function-copy-backup-sg | STGサマリー要改修項目 |

### 新規確認事項

（結果貼り付け後に記入）

### 問題点・改修候補

（結果貼り付け後に記入）

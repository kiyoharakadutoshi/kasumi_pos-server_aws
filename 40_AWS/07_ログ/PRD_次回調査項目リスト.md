# PRD 次回調査項目リスト

作成日: 2026-03-11  
目的: AWS現状サマリー_PRD.md（最終更新2026-03-10）との差分検出  
調査先AWSアカウント: 332802448674（PRD）

---

## 調査項目一覧

### 優先度 🔴 高（前回から変化している可能性が高い）

| # | カテゴリ | 確認項目 | 前回記録値 | 確認コマンド |
|---|---|---|---|---|
| 1 | VPN | T2 トンネル状態 | DOWN（2026-02-19〜） | `aws ec2 describe-vpn-connections` |
| 2 | StepFunctions | 直近の実行状態（FAILED/SUCCEEDED） | 正常稼働（推定） | `aws stepfunctions list-executions` |
| 3 | CloudWatch Alarm | 全アラーム状態 | 全19本 OK | `aws cloudwatch describe-alarms` |
| 4 | RDS | MultiAZ設定（STGで前回記録ミスの可能性あり） | False と記録 | `aws rds describe-db-clusters` |
| 5 | EC2 | bastion/giftcard の稼働状態 | 稼働中 | `aws ec2 describe-instances` |

### 優先度 🟡 中（設定変更があるかを確認したい）

| # | カテゴリ | 確認項目 | 前回記録値 |
|---|---|---|---|
| 6 | IAM | 新規ユーザー追加 / アクセスキー状況 | 15名（最終: locnt_cli_deploy / dattv_cli_deploy 2026-03-09作成） |
| 7 | Lambda | 関数追加・削除・設定変更 | 21関数 |
| 8 | EventBridge | ENABLED/DISABLED状態変化 | 正常8本 ENABLED |
| 9 | S3 | バケット追加・削除 | 9本 |
| 10 | Transfer Family | サーバー状態・ユーザー設定 | 3台 ONLINE |
| 11 | Secrets Manager | 更新日時変化（ローテーション実施有無） | 全7件ローテーションなし |
| 12 | CloudFormation | スタック状態変化 | 25本 COMPLETE |

### 優先度 🟢 低（サマリー未記載で今回初確認）

| # | カテゴリ | 確認項目 | 備考 |
|---|---|---|---|
| 13 | Aurora DB | DB別サイズ・テーブル行数 | STGで118GB判明。PRDも確認必要 |
| 14 | Aurora DB | historyテーブル肥大化状況 | 42_P003_history等 |
| 15 | Aurora DB | Secrets Manager の HOST が正しいEndpointを向いているか | STGで名称不一致判明 |
| 16 | Aurora DB | db-cluster-replica に rds-lambda-1 SG がアタッチされているか | STGで未アタッチ判明 |
| 17 | Lambda | sent-txt-file の環境変数 | STGはnull |
| 18 | EC2 | web-be の Sleep コネクション状況 | PRDはweb-be未展開のため対象外 |
| 19 | SG | 全SGルールの現状 | 未確認 |

---

## 調査コマンドセット（PRD CloudShellで実行）

### ブロック①: 優先度高（状態変化確認）

```bash
echo "=== [P-1] VPN T2状態確認 ==="
aws ec2 describe-vpn-connections \
  --filters "Name=vpn-connection-id,Values=vpn-0ea9b7895f78e4c7e" \
  --query 'VpnConnections[0].VgwTelemetry[].[OutsideIpAddress,Status,LastStatusChange]' \
  --output table

echo ""
echo "=== [P-2] RDS クラスター状態・MultiAZ確認 ==="
aws rds describe-db-clusters \
  --query 'DBClusters[].[DBClusterIdentifier,MultiAZ,Status,VpcSecurityGroups[*].VpcSecurityGroupId]' \
  --output json

echo ""
echo "=== [P-3] Aurora インスタンス状態 ==="
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,DBInstanceClass,DBInstanceStatus,MultiAZ,VpcSecurityGroups[*].VpcSecurityGroupId,AutoMinorVersionUpgrade]' \
  --output json

echo ""
echo "=== [P-4] CloudWatch アラーム状態 ==="
aws cloudwatch describe-alarms \
  --query 'MetricAlarms[].[AlarmName,StateValue,StateUpdatedTimestamp]' \
  --output table

echo ""
echo "=== [P-5] EC2 インスタンス状態 ==="
aws ec2 describe-instances \
  --query 'Reservations[].Instances[].[Tags[?Key==`Name`].Value|[0],InstanceId,InstanceType,State.Name,PrivateIpAddress,IamInstanceProfile.Arn]' \
  --output table

echo ""
echo "=== [P-6] Step Functions 直近実行状態（全7SM）==="
for SM in $(aws stepfunctions list-state-machines \
  --query 'stateMachines[].stateMachineArn' --output text); do
  NAME=$(echo $SM | awk -F: '{print $NF}')
  RESULT=$(aws stepfunctions list-executions \
    --state-machine-arn "$SM" \
    --max-results 1 \
    --query 'executions[0].[status,startDate]' \
    --output text 2>/dev/null)
  echo "$NAME: $RESULT"
done

echo ""
echo "=== [P-7] Lambda 関数数・一覧 ==="
aws lambda list-functions \
  --query 'Functions[].[FunctionName,Runtime,LastModified]' \
  --output table | sort

echo ""
echo "=== [P-8] IAM ユーザー一覧・最終ログイン ==="
aws iam list-users \
  --query 'Users[].[UserName,CreateDate,PasswordLastUsed]' \
  --output table

echo ""
echo "=== [P-9] Secrets Manager 更新日時確認 ==="
aws secretsmanager list-secrets \
  --query 'SecretList[].[Name,LastChangedDate,RotationEnabled]' \
  --output table

echo ""
echo "=== [P-10] S3 バケット一覧 ==="
aws s3api list-buckets \
  --query 'Buckets[].[Name,CreationDate]' \
  --output table

echo ""
echo "=== [P-11] EventBridge ルール状態 ==="
aws events list-rules \
  --query 'Rules[].[Name,State,ScheduleExpression]' \
  --output table
```

### ブロック②: Aurora DB詳細（Bastionから実行）

```sql
-- DB別サイズ
SELECT table_schema,
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 0) AS size_mb
FROM INFORMATION_SCHEMA.TABLES
WHERE table_schema IN ('Replica_Kasumi','Batch_Kasumi','M_KSM','T_KSM')
GROUP BY table_schema;

-- 巨大テーブル TOP10
SELECT table_name, table_rows,
       ROUND((data_length + index_length)/1024/1024, 0) AS size_mb
FROM INFORMATION_SCHEMA.TABLES
WHERE table_schema = 'Replica_Kasumi'
ORDER BY (data_length + index_length) DESC
LIMIT 10;

-- 取込状況 直近10件
SELECT * FROM 取込状況 ORDER BY 1 DESC LIMIT 10;
```


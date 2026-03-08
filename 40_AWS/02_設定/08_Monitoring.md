# 監視・運用設定（CloudWatch / CloudTrail / Systems Manager / Route53）

> CloudWatch $15 | Systems Manager $9 | Route53 $3 / 6ヶ月

---

## CloudWatch 設定

```
コスト: $15 / 6ヶ月

監視対象:
  ├── RDS Aurora MySQL
  │     DatabaseConnections, CPUUtilization, FreeableMemory,
  │     ReadLatency, WriteLatency, AuroraReplicaLag
  ├── EC2 (bastion, giftcard)
  │     CPUUtilization, NetworkIn/Out, DiskReadOps/WriteOps
  ├── Lambda
  │     Duration, Errors, Throttles, ConcurrentExecutions
  ├── Step Functions
  │     ExecutionsStarted, ExecutionsFailed, ExecutionTime
  ├── SQS
  │     ApproximateNumberOfMessagesVisible, NumberOfMessagesSent
  └── Transfer Family
        FilesIn, FilesOut, BytesIn, BytesOut
```

### 推奨アラーム設定

```bash
# RDS CPU アラーム
aws cloudwatch put-metric-alarm \
  --region ap-northeast-1 \
  --alarm-name "kasumi-rds-cpu-high" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 \
  --alarm-actions <sns-topic-arn>

# RDS 接続数アラーム
aws cloudwatch put-metric-alarm \
  --region ap-northeast-1 \
  --alarm-name "kasumi-rds-connections-high" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions <sns-topic-arn>

# Lambda エラーアラーム
aws cloudwatch put-metric-alarm \
  --region ap-northeast-1 \
  --alarm-name "kasumi-lambda-errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions <sns-topic-arn>

# SQS メッセージ滞留アラーム
aws cloudwatch put-metric-alarm \
  --region ap-northeast-1 \
  --alarm-name "kasumi-sqs-messages-stuck" \
  --metric-name ApproximateNumberOfMessagesNotVisible \
  --namespace AWS/SQS \
  --dimensions Name=QueueName,Value=ksm-posprd-sqs-export-queue-sg.fifo \
  --statistic Average \
  --period 600 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 3 \
  --alarm-actions <sns-topic-arn>
```

### ログ確認コマンド

```bash
# Lambda ログ（最新）
aws logs filter-log-events \
  --region ap-northeast-1 \
  --log-group-name /aws/lambda/<function-name> \
  --start-time $(python3 -c "import time; print(int((time.time()-3600)*1000))") \
  --filter-pattern "ERROR" \
  --query 'events[*].message'

# Step Functions ログ
aws logs filter-log-events \
  --region ap-northeast-1 \
  --log-group-name /aws/states/<state-machine-name> \
  --start-time $(python3 -c "import time; print(int((time.time()-3600)*1000))")

# RDS ログ（スロークエリ）
aws rds describe-db-log-files \
  --region ap-northeast-1 \
  --db-instance-identifier <instance-id>

# アラーム状態確認
aws cloudwatch describe-alarms \
  --region ap-northeast-1 \
  --state-value ALARM \
  --query 'MetricAlarms[*].{Name:AlarmName,State:StateValue,Reason:StateReason}'
```

---

## CloudTrail 設定

```
目的: API操作ログ記録（セキュリティ監査・コンプライアンス）

記録対象:
  - 全リージョン管理イベント (Write/Read)
  - S3データイベント (prd-ignica-ksm, prd-aeon-gift-card)
  - Lambda データイベント

ログ保存先: S3 (prd-ignica-ksm-pmlogs または専用バケット)
ログ保持: 90日（S3ライフサイクルで設定）
ログ検証: ログファイル整合性検証 有効

確認コマンド:
aws cloudtrail describe-trails --region ap-northeast-1

# 最近のAPI操作確認（直近1時間）
aws cloudtrail lookup-events \
  --region ap-northeast-1 \
  --start-time $(python3 -c "import datetime; print((datetime.datetime.utcnow()-datetime.timedelta(hours=1)).isoformat())") \
  --query 'Events[*].{Time:EventTime,Event:EventName,User:Username,IP:ClientSuppliedAgentHeader}' \
  | head -50

# 特定ユーザーの操作履歴
aws cloudtrail lookup-events \
  --region ap-northeast-1 \
  --lookup-attributes AttributeKey=Username,AttributeValue=<username>
```

---

## Systems Manager 設定

```
コスト: $9 / 6ヶ月

主要機能:
  - Session Manager: EC2へのSSH不要アクセス（ポート22不要）
  - Parameter Store: 設定値管理（Secrets Managerとの使い分け）
  - Patch Manager: EC2 OSパッチ管理
  - Run Command: EC2へのリモートコマンド実行

Session Manager (推奨):
  Bastion EC2への接続でSSHの代わりに利用
  ポートフォワーディングでRDSへの直接接続も可能

接続コマンド例:
  # EC2 Session Manager接続
  aws ssm start-session \
    --region ap-northeast-1 \
    --target <instance-id>
  
  # RDS へのポートフォワーディング（Bastionを踏み台に）
  aws ssm start-session \
    --region ap-northeast-1 \
    --target <bastion-instance-id> \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters host=<rds-endpoint>,portNumber=3306,localPortNumber=13306
```

---

## SNS 通知設定

```
通知先: prd/Mail_Kasumi (Secrets Manager に設定)
トピック: kasumi-prd-alerts (推定)

通知イベント:
  - CloudWatch アラーム ALARM状態
  - GuardDuty HIGH/CRITICAL Finding
  - RDS フェイルオーバー発生
  - Step Functions 実行失敗
  - Config コンプライアンス違反

確認コマンド:
aws sns list-topics --region ap-northeast-1
aws sns list-subscriptions-by-topic \
  --region ap-northeast-1 \
  --topic-arn <topic-arn>
```

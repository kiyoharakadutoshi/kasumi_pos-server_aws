# コンピューティング設定（ECS / Lambda / Step Functions / EventBridge / SQS）

> ECS $56 | Lambda $0.003 | Step Functions $12 | EventBridge $0.02 | SQS ≈$0 / 6ヶ月

---

## Lambda 関数（21関数）

### 関数カテゴリ

| カテゴリ | ランタイム | メモリ | タイムアウト | 用途 |
|---|---|---|---|---|
| ksm-posprd-* (OC系) | Java 17 | 512〜2048 MB | 300〜900秒 | 基幹データ処理 |
| ksm-posprd-* (SG系) | Java 17 | 512〜2048 MB | 300〜900秒 | POS売上データ処理 |
| ksm-posprd-* (SH系) | Java 17 | 512〜2048 MB | 300〜900秒 | 棚情報処理 |
| 監視・制御系 | Python 3.13 / 3.11 | 128〜256 MB | 300秒 | 在庫チェック・通知 |

### デプロイパッケージ

```
JARファイル格納先: s3://prd-ignica-com-lmd-jar/
コンテナイメージ格納先: ECR (prd-ignica-com-lmd-jar)
VPC配置: private-subnet (RDS接続のため)

環境変数管理: Secrets Manager (ksm-posprd-sm-db, ksm-posprd-sm-db-replica)
```

### Lambda 操作コマンド

```bash
# Lambda関数一覧
aws lambda list-functions \
  --region ap-northeast-1 \
  --query 'Functions[*].{Name:FunctionName,Runtime:Runtime,Memory:MemorySize,Timeout:Timeout}' \
  | sort

# 関数ログ確認 (最新100件)
aws logs filter-log-events \
  --region ap-northeast-1 \
  --log-group-name /aws/lambda/<function-name> \
  --start-time $(date -d '1 hour ago' +%s000) \
  --query 'events[*].message'

# 関数の手動実行
aws lambda invoke \
  --region ap-northeast-1 \
  --function-name <function-name> \
  --payload '{}' \
  response.json && cat response.json

# 関数更新（JARファイル）
aws lambda update-function-code \
  --region ap-northeast-1 \
  --function-name <function-name> \
  --s3-bucket prd-ignica-com-lmd-jar \
  --s3-key <jar-file-name>
```

---

## Step Functions ワークフロー（7定義）

| ワークフロー名 | カテゴリ | 起動トリガー | 処理概要 |
|---|---|---|---|
| receive-pos-master-oc | OC系 | S3イベント (oc/) | 基幹データ受信・前処理 |
| import-pos-master-oc | OC系 | 前ワークフロー完了後 | 基幹POSマスタDB取込 |
| create-txt-file-oc | OC系 | 前ワークフロー完了後 | OC向けテキストファイル生成 |
| receive-and-import-pos-master-sg | SG系 | SQS (FIFO) | POS売上データ受信→DB取込 |
| create-txt-file-sg | SG系 | 前ワークフロー完了後 | SG向けテキストファイル生成 |
| import-pos-master-sh | SH系 | S3イベント (sh/) | 棚情報マスタDB取込 |
| sent-txt-file | 共通 | 全系統共通 | USMH側へ出力ファイル送信 |

### Step Functions 操作コマンド

```bash
# ステートマシン一覧
aws stepfunctions list-state-machines \
  --region ap-northeast-1 \
  --query 'stateMachines[*].{Name:name,ARN:stateMachineArn}'

# 実行履歴確認
aws stepfunctions list-executions \
  --region ap-northeast-1 \
  --state-machine-arn <arn> \
  --status-filter FAILED \
  --query 'executions[*].{Name:name,Status:status,StartDate:startDate}'

# 失敗した実行の詳細確認
aws stepfunctions describe-execution \
  --region ap-northeast-1 \
  --execution-arn <execution-arn>

# ステートマシン手動起動
aws stepfunctions start-execution \
  --region ap-northeast-1 \
  --state-machine-arn <arn> \
  --input '{"key": "value"}'
```

---

## EventBridge スケジュール設定

| ルール名 | CRON式 (UTC) | JST換算 | 対象 | 処理内容 |
|---|---|---|---|---|
| P001監視 | cron(00 15 * * ? *) | 毎日 00:00 | Lambda/StepFunctions | POS在庫整合チェック・アラート |
| ItemMaster更新 | cron(30 20 * * ? *) | 毎日 05:30 | Lambda/StepFunctions | 商品マスタデータ取込 |

### EventBridge 操作コマンド

```bash
# ルール一覧
aws events list-rules \
  --region ap-northeast-1 \
  --query 'Rules[*].{Name:Name,State:State,Schedule:ScheduleExpression}'

# ルール一時停止 (メンテナンス時)
aws events disable-rule \
  --region ap-northeast-1 \
  --name <rule-name>

# ルール再有効化
aws events enable-rule \
  --region ap-northeast-1 \
  --name <rule-name>
```

---

## SQS キュー設定（SG系専用 / 2キュー）

| キュー名 | タイプ | 可視性タイムアウト | 用途 |
|---|---|---|---|
| ksm-posprd-sqs-export-queue-sg.fifo | FIFO | アプリ設定に依存 | SG系エクスポートデータ |
| ksm-posprd-sqs-store-code-queue-sg.fifo | FIFO | アプリ設定に依存 | 店舗コード別処理 |

```
FIFO特性:
  - メッセージ順序保証（先入れ先出し）
  - 1回のみ処理（重複排除）
  - コンテンツベース重複排除: 有効推奨

デッドレターキュー (DLQ):
  最大受信回数超過時のDLQ転送推奨
  DLQ監視: CloudWatch アラーム設定
```

### SQS 操作コマンド

```bash
# キュー一覧
aws sqs list-queues \
  --region ap-northeast-1 \
  --queue-name-prefix ksm-posprd

# キュー属性確認
aws sqs get-queue-attributes \
  --region ap-northeast-1 \
  --queue-url <queue-url> \
  --attribute-names All

# メッセージ数確認
aws sqs get-queue-attributes \
  --region ap-northeast-1 \
  --queue-url <queue-url> \
  --attribute-names ApproximateNumberOfMessages,ApproximateNumberOfMessagesNotVisible
```

---

## ECS 設定

```
コスト: $56 / 6ヶ月 (軽量利用)

用途: コンテナベースのアプリケーション実行
起動タイプ: EC2 または Fargate (確認要)
クラスター: 本番環境クラスター

確認コマンド:
aws ecs list-clusters --region ap-northeast-1
aws ecs list-services \
  --region ap-northeast-1 \
  --cluster <cluster-arn>
aws ecs list-tasks \
  --region ap-northeast-1 \
  --cluster <cluster-arn>
```

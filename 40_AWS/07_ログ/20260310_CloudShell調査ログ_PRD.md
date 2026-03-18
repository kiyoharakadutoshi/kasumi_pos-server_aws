# CloudShell調査ログ 2026-03-10（PRD）

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-10 |
| 調査者 | 清原 |
| AWSアカウント | 332802448674（PRD） |
| リージョン | ap-northeast-1 |

---

## [1] S3バケット用途調査・不要バケット削除

### 発端
S3バケット一覧に `phongbt-auditor-production` という個人名バケットが存在していたため、用途・作成経緯を調査。

---

### [1]-1 バケット内容・ポリシー確認

**コマンド:**
```bash
aws s3 ls s3://phongbt-auditor-production/ --recursive --summarize | tail -3
aws s3api get-bucket-policy --bucket phongbt-auditor-production
aws s3api get-bucket-tagging --bucket phongbt-auditor-production
```

**受信内容:**
```
Total Objects: 0
   Total Size: 0

Policy: AWSCloudTrailAclCheck / AWSCloudTrailWrite のみ許可
         → cloudtrail.amazonaws.com が PutObject 可能なポリシー
         → Resource: arn:aws:s3:::phongbt-auditor-production/AWSLogs/332802448674/*

TagSet: NoSuchTagSet（タグなし）
```

**確認結果:**
- 中身は空（オブジェクト0件・サイズ0）
- バケットポリシーは CloudTrail 専用構成
- タグなし → 管理外バケット
- PhongさんがCloudTrail設定を試みた際に作成し、そのまま放置されたと推定

---

### [1]-2 CloudTrail 稼働状況確認

**コマンド:**
```bash
aws cloudtrail describe-trails
aws cloudtrail get-trail-status --name management-events
```

**受信内容:**

| 項目 | 値 |
|---|---|
| トレイル名 | management-events |
| 出力先バケット | aws-cloudtrail-logs-332802448674-e91cb7f6 |
| マルチリージョン | true |
| グローバルサービス | true |
| ログ改ざん検知 | true（LogFileValidationEnabled） |
| IsLogging | **true**（稼働中） |
| 最終ログ配信 | 2026-03-09T18:53:37Z |
| ログ開始日 | 2025-09-29T07:45:56Z |
| 停止日 | なし |

**確認結果:**
- CloudTrail は `management-events` トレイルとして正常稼働中
- 出力先は `aws-cloudtrail-logs-332802448674-e91cb7f6`（AWS自動命名バケット）
- `phongbt-auditor-production` は実際には使われていない → **削除対象と判断**

---

### [1]-3 不要バケット削除

**コマンド:**
```bash
aws s3 rb s3://phongbt-auditor-production
```

**受信内容:**
```
remove_bucket: phongbt-auditor-production
```

**確認結果:**
- 削除成功
- S3バケット数: 11本 → 10本

---

## [2] 全サービス調査

### [2]-1 PRD 全サービス調査

**実行コマンド・結果:**

```
# Config
aws --no-cli-pager configservice describe-config-rules --query 'ConfigRules[*].ConfigRuleName' --output text | wc -l
→ 345（全てSecurityHub自動作成・ACTIVE）

# CloudFormation
→ 25スタック（AWS自動生成4 + com-posprd系6 + ksm-posprd系15）

# SNS
→ 3トピック: app-logs / app-logs-test / aws-logs

# X-Ray
→ Defaultグループのみ（InsightsEnabled: false）

# CloudWatch Alarms
→ 19本・全てOK

# CloudWatch Log Groups
→ 40本。Lambda21本・RDS・Transfer・ECS・/pos/log全て保持期間null（無期限）⚠️
→ 🚨 /aws/lambda/ksm-posstg-lmd-export-polling がPRDアカウントに混在

# ECR
→ 4リポジトリ: sg-export-data / oc-export-data / oc-import-data / sg-import-data

# Route53
→ ignicapos.com.（パブリック）1ゾーンのみ

# KMS
→ カスタムキー4本: kms-db / kms-ebs / kms-ecr / kms-sm
→ AWS管理キー実体あり: lambda / secretsmanager / sns / ssm

# Glue / Location / DirectConnect / PaymentCryptography
→ 全て空（リソースなし）

# IAM Roles（ksm系）
→ 10ロール: db-cluster / db-monitoring / eb / ec2 / ec2-web-be / ecs / lmd / sf / tf / tf-logs

# IAM Users
→ 15名（kiyohara/cfn_user/dattv/locnt_deploy/nangld系/Vangle2名/USMH用/phong等）
→ dattv_cli_deploy / locnt_cli_deploy は昨日(2026-03-09)作成

# Secrets Manager
→ 7件（ksm-posprd-sm-db/replica/sftp + prd/Mail/Batch/Replica/Replica_RO）
→ 全て2025-06-20〜2025-08-14更新（最近の更新なし）
```

**確認結果:**
- ✅ CloudFormationで全リソースがIaC管理されている
- 🚨 PRDアカウントにSTGのLambdaログ混在（/aws/lambda/ksm-posstg-lmd-export-polling）
- ⚠️ CloudWatch Logs保持期間が大量に未設定（コスト増大リスク）
- ✅ ECSクラスター存在確認（ksm-posprd-ecs-cluster・sg/ocデータ処理）
- ✅ KMSカスタムキー4本（db/ebs/ecr/sm）でリソース暗号化済み

---

### [2]-2 Lambda命名ミス調査

**問題:**
PRDアカウント（332802448674）に `ksm-posstg-lmd-export-polling` という関数名のLambdaが存在。

**調査結果:**
- SQSトリガー: `ksm-posprd-sqs-export-queue-sg.fifo`（PRDキュー） → ✅ 正常
- SF_ARN: `ksm-posprd-sf-sm-create-txt-file-sg`（PRDのStep Functions） → ✅ 正常
- IAMロール: `ksm-posprd-iam-role-lmd`（PRDロール） → ✅ 正常
- 関数名のみ `ksm-posstg-` プレフィックスのまま → ❌ 命名ミス

**結論:** 機能・接続先は全てPRD正常。2025-08-21デプロイ時の命名ミスのみ。

**対応:** 当面放置（Lambdaは関数名変更不可のため再作成が必要。リスク>メリット）
**Pending:** カスミ承認後、メンテナンスウィンドウで正式名称(ksm-posprd-lmd-export-polling)に再作成する。

---

### [2]-3 CloudWatch Logs 保持期間調査（PRD）

**PRD 未設定ロググループ一覧（保持期間null=無期限）**

| ロググループ | 種別 | 推奨設定 |
|---|---|---|
| /aws/lambda/ksm-posprd-lmd-* (17本) | Lambda | 90日 |
| /aws/lambda/ksm-posstg-lmd-export-polling | Lambda(命名ミス) | 90日 |
| /aws/lambda/baseline-overrides-a66d-3eig7 | Lambda(AWS自動) | 90日 |
| /aws/ecs/ksm-posprd-ecs-sg-export-data | ECS | 90日 |
| /aws/ecs/containerinsights/.../performance | ECS | 30日（現在1日） |
| /aws/rds/cluster/ksm-posprd-db-cluster/error | RDS | 90日 |
| /aws/rds/cluster/ksm-posprd-db-cluster-replica/error | RDS | 90日 |
| /aws/transfer/s-2a4905e8210f48248 | Transfer | 90日 |
| /aws/transfer/s-5546031218784c4ba | Transfer | 90日 |
| /aws/transfer/s-bd974a35aa994c838 | Transfer | 90日 |
| /aws/vpc/com-posprd-cw-lg-vpc-flow-log | VPC Flow | 90日 |
| /pos/log/export/all・error | POSログ | 90日 |
| /pos/log/import/all・error | POSログ | 90日 |
| /pos/log/sent/all・error | POSログ | 90日 |

**対応状況:** 調査・記録のみ。設定変更は未実施。

---

## [3] ECS稼働状況確認

```bash
aws ecs list-clusters --region ap-northeast-1
aws ecs list-tasks \
  --region ap-northeast-1 \
  --cluster arn:aws:ecs:ap-northeast-1:332802448674:cluster/ksm-posprd-ecs-cluster
```

**確認結果:**
- クラスター: `ksm-posprd-ecs-cluster` 存在
- タスク: **0件（空）**

→ **ECSは器のみ存在・何も動いていない**
→ 将来のコンテナ化（ECS移行）に向けて準備済みの状態

---

## [4] EC2全台確認

```bash
aws ec2 describe-instances \
  --region ap-northeast-1 \
  --query 'Reservations[*].Instances[*].{Name:Tags[?Key==`Name`]|[0].Value,IP:PrivateIpAddress,Type:InstanceType,State:State.Name}' \
  --output table
```

**確認結果:**

| Name | IP | Type | State |
|---|---|---|---|
| ksm-posprd-ec2-instance-bastion | 10.238.2.39 | t3.xlarge | running |
| ksm-posprd-ec2-instance-giftcard | 10.238.2.198 | t2.large | running |

→ **PRDはEC2 2台のみ（web-fe/web-beなし）**
→ pos-server（Kotlin）・frontend（React）はPRDにまだ未展開
→ カスミより「PRD本番展開する」意向確認済み（2026-03-10）

---

## チャット別索引

| セクション | 内容 | 日時 |
|---|---|---|
| [1] | S3バケット用途調査・CloudTrail稼働確認・phongbt-auditor-production 削除 | 2026-03-10 |
| [2] | PRD全サービス調査・Lambda命名ミス・CWLogs保持期間 | 2026-03-10 |
| [3] | ECS稼働状況確認（タスク0件） | 2026-03-10 |
| [4] | EC2全台確認（2台のみ・web-fe/web-beなし） | 2026-03-10 |

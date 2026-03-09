# CloudShell調査ログ 2026-03-10

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-10 |
| 調査者 | 清原 |
| PRDアカウント | 332802448674 |
| STGアカウント | 750735758916 |
| リージョン | ap-northeast-1 |

---

## [1] S3バケット用途調査・不要バケット削除（PRD）

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

## チャット別索引

| セッション | 調査内容 |
|---|---|\
| 2026-03-10 | S3バケット用途調査・CloudTrail稼働確認・phongbt-auditor-production 削除 |

---

## [2] STG S3バケット調査・不要バケット削除（STG）

### [2]-1 STG CloudTrail・S3バケット一覧確認

**コマンド:**
```bash
aws cloudtrail describe-trails
aws cloudtrail get-trail-status --name management-events 2>&1
aws s3 ls --region ap-northeast-1
```

**受信内容:**
- `trailList: []` → **CloudTrail未設定（改修依頼No.4 未実施のまま）**
- TrailNotFoundException → management-eventsトレイルは存在しない

STGバケット一覧:

| バケット名 | 作成日 |
|---|---|
| aws-quicksetup-patchpolicy-750735758916-v4t88 | 2025-08-29 |
| aws-quicksetup-patchpolicy-access-log-750735758916-a4fd-v4t88 | 2025-11-04 |
| dev-ignica-ksm | 2025-06-24 |
| do-not-delete-ssm-diagnosis-750735758916-ap-northeast-1-89e4k | 2025-11-04 |
| phongbt-auditor-staging | 2026-01-08 |
| stg-aeon-gift-card | 2025-12-19 |
| stg-ignica-com-configrecord | 2025-11-05 |
| stg-ignica-ksm | 2026-01-07 |
| stg-ignica-ksm-pmlogs | 2025-11-04 |

**確認結果:**
- PRDと同様に `phongbt-auditor-staging`（個人名バケット）が存在 → 調査対象

---

### [2]-2 phongbt-auditor-staging 確認

**コマンド:**
```bash
aws s3 ls s3://phongbt-auditor-staging/ --recursive --summarize | tail -3
aws s3api get-bucket-policy --bucket phongbt-auditor-staging
```

**受信内容:**
```
Total Objects: 0 / Total Size: 0
Policy: AWSCloudTrailAclCheck / AWSCloudTrailWrite のみ（cloudtrail.amazonaws.com専用）
        Resource: arn:aws:s3:::phongbt-auditor-staging/AWSLogs/750735758916/*
```

**確認結果:** PRDの `phongbt-auditor-production` と同一パターン。空・未使用・削除OK。

---

### [2]-3 dev-ignica-ksm 確認

**コマンド:**
```bash
aws s3 ls s3://dev-ignica-ksm/ --recursive
aws s3api get-bucket-tagging --bucket dev-ignica-ksm
aws s3api get-bucket-policy --bucket dev-ignica-ksm
```

**受信内容:** JARファイル16件・340MB（最終更新2026-03-06）

| ファイル | 最終更新 |
|---|---|
| backup-txt-handler.jar | 2025-08-28 |
| copy-file-for-auto-report-handler.jar | 2026-02-13 |
| create-file-end-for-night-handler.jar | 2025-11-07 |
| create-file-end-handler.jar | 2025-08-28 |
| daily-report-monitoring-handler.jar | 2026-03-06 |
| get-sync-store-handler.jar | 2025-11-07 |
| itemmaster-import-monitoring-handler.jar | 2025-08-28 |
| p001-import-monitoring-handler.jar | 2026-01-23 |
| replica-importer-oc.jar | 2026-02-12 |
| replica-importer-sg.jar | 2026-02-12 |
| replica-importer-sh.jar | 2026-02-12 |
| send-email-handler.jar | 2026-02-26 |
| send-file.jar | 2025-08-28 |
| split-csv-handler.jar | 2026-02-12 |
| split-txt-by-sent-time.jar | 2025-11-17 |
| unzip-handler.jar | 2025-11-07 |

タグなし・バケットポリシーなし

**確認結果:** STG Lambda JARの置き場として現役稼働中。名前が `dev-` で紛らわしいが削除不可。PRDの `prd-ignica-com-lmd-jar` に相当するバケット。

---

### [2]-4 phongbt-auditor-staging 削除

**コマンド:**
```bash
aws s3 rb s3://phongbt-auditor-staging
```

**受信内容:**
```
remove_bucket: phongbt-auditor-staging
```

**確認結果:** 削除成功。STG S3バケット数: 9本 → 8本

---

## チャット別索引

| セッション | 調査内容 |
|---|---|
| 2026-03-10 午前 | PRD S3バケット調査・CloudTrail稼働確認・phongbt-auditor-production 削除 |
| 2026-03-10 午後 | STG S3バケット調査・CloudTrail未設定確認・dev-ignica-ksm用途確認・phongbt-auditor-staging 削除 |

---

## [2] 全サービス調査（2026-03-10）

### 調査対象
CSVコスト明細に登場する32サービスの全容確認。PRD→STGの順で実施。

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

### [2]-2 STG 全サービス調査

```
# CloudFormation
→ 23スタック。PRD比: com-posstg-cloudwatchlogs / iam-analyzer / securityhub スタックなし⚠️

# SNS
→ 4トピック（PRD+1）
→ 🚨 ksm-posspk-sns-topic-app-logs-dev が存在（posspk=開発環境用残留物？）

# CloudWatch Alarms
→ 19本中 2本がALARM状態！
   🚨 ksm-posstg-cw-alarm-ec2-audit-log → ALARM
   🚨 ksm-posstg-cw-alarm-ec2-messages → ALARM

# CloudWatch Log Groups
→ 41本（PRD比+1: /pos/log/web/be がSTG独自）
→ /aws/ecs/ksm-posstg-ecs-oc-export-data もSTG独自
→ 全Lambda/RDS/Transfer/ECS保持期間null（PRD同等の課題）
→ VPCフローログなし（PRDにはあり）

# ECR
→ 8リポジトリ（PRDの2倍）
→ STG独自4本: ecr-web-fe / ecr-web-be / ecr-repository-ecs-import-db-master-sg/oc

# KMS / Secrets Manager
→ PRDと同等構成（ksm-posstg-kms-db/ebs/ecr/sm）

# IAM Users
→ 15名。STG独自: locnt（汎用）/ dev（開発用汎用アカウント要確認）

# Glue / X-Ray
→ 空（PRD同等）
```

**確認結果:**
- 🚨 EC2アラーム2本ALARM状態（audit-log / messages）→ bastionのCWエージェント停止疑い
- 🚨 ksm-posspk-*というSNSトピックが残留（posspk環境とは何か要調査）
- ⚠️ STGのECRにweb-fe/web-beリポジトリ（PRDにない）→ 用途不明
- ⚠️ PRDにあるセキュリティ系スタック3本がSTGにない（securityhub/iam-analyzer/cloudwatchlogs）


### [2]-3 STG EC2アラーム ALARM調査・リセット

**調査結果:**
- フィルターパターン: `*fail*` / `*error*` 等を含む文字列を検知
- ALARM原因: 2025-07-31 02:20 JST に `kiyohara_s3` ユーザーのSSHセッション終了時、PAMが出力する `res=failed`（正常動作）に誤反応
- 実際の障害: **なし**（bastionは正常稼働・ログも正常流入中）
- アラーム履歴が空: 保存期間（14日）超過のため

**対応:**
```
aws cloudwatch set-alarm-state --alarm-name "ksm-posstg-cw-alarm-ec2-audit-log" --state-value OK
aws cloudwatch set-alarm-state --alarm-name "ksm-posstg-cw-alarm-ec2-messages" --state-value OK
```
→ 両アラームOKに変更済み（2026-03-10）

**Pending:**
- フィルターパターンを `res=failed` 除外に修正する（根本対応）
- 例: `[message="*ERROR*" || message="*Error*" || message="*error*"]` から `res=failed` を含む行を除外するパターンに変更


### [2]-4 PRD Lambda命名ミス調査

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


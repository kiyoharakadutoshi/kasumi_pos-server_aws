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


### [2]-5 CloudWatch Logs 保持期間調査結果

**ポリシー方針（検討済み・未実施）:** 全て一律90日 / ECS containerinsights のみ30日

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

**STG 未設定ロググループ一覧（保持期間null=無期限）**

| ロググループ | 種別 | 推奨設定 |
|---|---|---|
| /aws/lambda/ksm-posstg-lmd-* (24本) | Lambda | 90日 |
| /aws/lambda/baseline-overrides-a4fd-v4t88 | Lambda(AWS自動) | 90日 |
| /aws/ecs/ksm-posstg-ecs-sg-export-data | ECS | 90日 |
| /aws/ecs/ksm-posstg-ecs-oc-export-data | ECS | 90日 |
| /aws/ecs/containerinsights/.../performance | ECS | 30日（現在1日） |
| /aws/rds/cluster/ksm-posstg-db-cluster/error | RDS | 90日 |
| /aws/rds/cluster/ksm-posstg-db-cluster-replica/error | RDS | 90日 |
| /aws/transfer/s-7c808e1040dd437da | Transfer | 90日 |
| /aws/transfer/s-a69b3df467bc43b99 | Transfer | 90日 |
| /aws/transfer/s-d5d0d941bfb04a72b | Transfer | 90日 |
| /pos/log/export/all・error | POSログ | 90日 |
| /pos/log/import/all・error | POSログ | 90日 |
| /pos/log/sent/all・error | POSログ | 90日 |
| /pos/log/web/be | POSログ(STG独自) | 90日 |

**対応状況:** 調査・記録のみ。設定変更は未実施。

### [2]-6 STG不要リソース調査結果（削除未実施）

**① ksm-posspk-sns-topic-app-logs-dev**

| 項目 | 内容 |
|---|---|
| TopicArn | arn:aws:sns:ap-northeast-1:750735758916:ksm-posspk-sns-topic-app-logs-dev |
| サブスクライバー | nguyenthanhloc@luvina.net / nguyenbaan2@luvina.net（Luvina社員のみ） |
| CloudFormation管理 | なし（手動作成・残留物） |
| 結論 | Luvina開発環境用に作成・放置。`posspk`=不明（開発環境コード名疑い） |
| 対応状況 | **調査のみ・削除未実施** |

**② ksm-posstg-ecr-web-fe / ksm-posstg-ecr-web-be**

| リポジトリ | イメージ数 | 結論 |
|---|---|---|
| ksm-posstg-ecr-web-fe | 0件 | 作成のみ・未使用 |
| ksm-posstg-ecr-web-be | 0件 | 作成のみ・未使用 |
| 対応状況 | **調査のみ・削除未実施** |

**削除保留理由:** カスミ承認待ち。削除コマンドは以下に記録済み。

```bash
# STG CloudShellで実行（承認後）
# SNS削除
aws --no-cli-pager sns delete-topic \
  --region ap-northeast-1 \
  --topic-arn "arn:aws:sns:ap-northeast-1:750735758916:ksm-posspk-sns-topic-app-logs-dev"

# ECR削除
aws --no-cli-pager ecr delete-repository \
  --region ap-northeast-1 \
  --repository-name "ksm-posstg-ecr-web-fe" --force
aws --no-cli-pager ecr delete-repository \
  --region ap-northeast-1 \
  --repository-name "ksm-posstg-ecr-web-be" --force
```

### [2]-7 STG EC2台数誤記修正

**CloudShell調査で判明したSTG EC2全台:**

| Name | InstanceId | IP | Type | Platform |
|---|---|---|---|---|
| ksm-posstg-ec2-instance-bastion  | i-0bd9a4db1b74b5a69 | 10.239.2.4   | t3.xlarge | Linux |
| ksm-posstg-ec2-instance-giftcard | i-0f8ededc7ae313cbe | 10.239.2.193 | t2.large  | Windows |
| ksm-posstg-ec2-instance-web-be   | i-06a74666e851e4d12 | 10.239.2.195 | t3.medium | Linux |
| ksm-posstg-ec2-instance-web-fe   | i-0fa4cf3cf5c1a8864 | 10.239.2.253 | t3.medium | Linux |

**修正内容:**
- 誤: STG EC2 3台（bastion/giftcard/web-be）
- 正: STG EC2 **4台**（bastion/giftcard/web-be/web-fe）
- web-feが記録から漏れていた
- giftcard: 10.239.2.193 は実在するEC2（NATアドレスではなかった）
- STG ECR web-fe/web-beは空だが、web-fe/web-be EC2が稼働中

### [2]-8 STG web-fe/web-be 詳細調査

**判明事項: POSシステム Webアプリ（STG独自・CloudFormation管理なし）**

アーキテクチャ:
Internet → ALB(ksm-posstg-alb-web-fe, internet-facing) → web-fe:80
         → ALB(ksm-posstg-alb-api-be, internet-facing) → web-be:80/8080 → RDS

| リソース | 詳細 |
|---|---|
| web-fe IAM | posstg-role-ec2-web-fe / ECRFullAccess |
| web-be IAM | posstg-role-ec2-web-be / S3FullAccess+SecretsManagerReadWrite+CWLogs+ECR |
| ALB1 | ksm-posstg-alb-web-fe / internet-facing / active |
| ALB2 | ksm-posstg-alb-api-be / internet-facing / active |
| 起動日 | 2025-09-17（手動構築・CloudFormationなし） |
| ECR | web-fe/web-beリポジトリは空（コンテナ未使用） |

セキュリティ問題:
- 🔴 web-be SG: ALL(-1)→0.0.0.0/0 / TCP:8080→0.0.0.0/0 全開放（改修依頼No.5）
- 🔴 ALB×2: internet-facing（インターネット公開中）→ カスミに用途確認要
- 🟡 web-be IAM: S3FullAccess・SecretsManagerReadWrite（権限過剰・要絞り込み）

---

## [3] ALB詳細調査（STG）

### [3]-1 ターゲットグループ確認

```bash
aws elbv2 describe-target-groups \
  --region ap-northeast-1 \
  --query 'TargetGroups[*].{Name:TargetGroupName,ARN:TargetGroupArn}'
```

**受信内容:**
```json
[
    {"Name": "alb-target-be", "ARN": "arn:aws:elasticloadbalancing:ap-northeast-1:750735758916:targetgroup/alb-target-be/e1d3c617e2a0bdfc"},
    {"Name": "alb-target-fe", "ARN": "arn:aws:elasticloadbalancing:ap-northeast-1:750735758916:targetgroup/alb-target-fe/da33aafd108d83b3"}
]
```

### [3]-2 ターゲットヘルス確認

```bash
# BE側
aws elbv2 describe-target-health \
  --region ap-northeast-1 \
  --target-group-arn arn:aws:elasticloadbalancing:ap-northeast-1:750735758916:targetgroup/alb-target-be/e1d3c617e2a0bdfc

# FE側
aws elbv2 describe-target-health \
  --region ap-northeast-1 \
  --target-group-arn arn:aws:elasticloadbalancing:ap-northeast-1:750735758916:targetgroup/alb-target-fe/da33aafd108d83b3
```

**確認結果:**

| ALB | ターゲットID | Port | 状態 |
|---|---|---|---|
| alb-target-be | i-06a74666e851e4d12 (web-be) | 80 | healthy |
| alb-target-fe | i-0fa4cf3cf5c1a8864 (web-fe) | 80 | healthy |

→ **どちらも1対1（負荷分散なし）**。ALBは現時点でSSL終端専用として機能。

### [3]-3 ALBリスナー確認

```bash
# ALB一覧
aws elbv2 describe-load-balancers \
  --region ap-northeast-1 \
  --query 'LoadBalancers[*].{Name:LoadBalancerName,ARN:LoadBalancerArn}' \
  --output table

# FE側リスナー
aws elbv2 describe-listeners \
  --region ap-northeast-1 \
  --load-balancer-arn arn:aws:elasticloadbalancing:ap-northeast-1:750735758916:loadbalancer/app/ksm-posstg-alb-web-fe/a4eb347a3cf149f9 \
  --query 'Listeners[*].{Port:Port,Protocol:Protocol,SSL:Certificates}'

# BE側リスナー
aws elbv2 describe-listeners \
  --region ap-northeast-1 \
  --load-balancer-arn arn:aws:elasticloadbalancing:ap-northeast-1:750735758916:loadbalancer/app/ksm-posstg-alb-api-be/583caa4ac9e37817 \
  --query 'Listeners[*].{Port:Port,Protocol:Protocol,SSL:Certificates}'
```

**確認結果:**

| ALB | Port 80 | Port 443 | SSL証明書 |
|---|---|---|---|
| alb-web-fe | HTTP ✅ | HTTPS ✅ | ACM (a77b0b86-ac65-4f45-93f1-8cf93957849e) |
| alb-api-be | HTTP ✅ | HTTPS ✅ | ACM (同一証明書) |

→ **ALBを使っている理由はSSL終端のため**

### [3]-4 ACM証明書確認

```bash
aws acm describe-certificate \
  --region ap-northeast-1 \
  --certificate-arn arn:aws:acm:ap-northeast-1:750735758916:certificate/a77b0b86-ac65-4f45-93f1-8cf93957849e \
  --query 'Certificate.{Domain:DomainName,SANs:SubjectAlternativeNames,Status:Status}'
```

**確認結果:**
```json
{
    "Domain": "ignicapos.com",
    "SANs": ["ignicapos.com", "*.ignicapos.com"],
    "Status": "ISSUED"
}
```

→ `*.ignicapos.com` ワイルドカード証明書1枚でFE・BE両ALBを共有

---

## [4] ECS稼働状況確認（STG・PRD）

### [4]-1 STG ECS確認

```bash
aws ecs list-clusters --region ap-northeast-1
aws ecs list-services \
  --region ap-northeast-1 \
  --cluster arn:aws:ecs:ap-northeast-1:750735758916:cluster/ksm-posstg-ecs-cluster
aws ecs list-tasks \
  --region ap-northeast-1 \
  --cluster arn:aws:ecs:ap-northeast-1:750735758916:cluster/ksm-posstg-ecs-cluster
```

**確認結果:**
- クラスター: `ksm-posstg-ecs-cluster` 存在
- サービス: **0件（空）**
- タスク: **0件（空）**

### [4]-2 PRD ECS確認

```bash
aws ecs list-clusters --region ap-northeast-1
aws ecs list-tasks \
  --region ap-northeast-1 \
  --cluster arn:aws:ecs:ap-northeast-1:332802448674:cluster/ksm-posprd-ecs-cluster
```

**確認結果:**
- クラスター: `ksm-posprd-ecs-cluster` 存在
- タスク: **0件（空）**

→ **PRD・STGともにECSは器のみ存在・何も動いていない**
→ 将来のコンテナ化（ECS移行）に向けて準備済みの状態

### [4]-3 PRD EC2全台確認

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
→ カスミより「本番展開する」意向確認済み（2026-03-10）

---

## チャット別索引

| セクション | 内容 | チャット日時 |
|---|---|---|
| [3] | STG ALB詳細調査（ターゲット・リスナー・SSL証明書） | 2026-03-10 |
| [4] | ECS稼働状況確認（STG/PRD）・PRD EC2全台確認 | 2026-03-10 |

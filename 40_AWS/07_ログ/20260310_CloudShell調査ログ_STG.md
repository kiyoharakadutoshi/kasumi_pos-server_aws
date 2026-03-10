# CloudShell調査ログ 2026-03-10（STG）

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-10 |
| 調査者 | 清原 |
| AWSアカウント | 750735758916（STG） |
| リージョン | ap-northeast-1 |

---

## [1] S3バケット調査・不要バケット削除

### [1]-1 STG CloudTrail・S3バケット一覧確認

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

**確認結果:** PRDと同様に `phongbt-auditor-staging`（個人名バケット）が存在 → 調査対象

---

### [1]-2 phongbt-auditor-staging 確認

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

### [1]-3 dev-ignica-ksm 確認

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
| daily-report-monitoring-handler.jar | 2026-03-06 |
| get-sync-store-handler.jar | 2025-11-07 |
| replica-importer-oc/sg/sh.jar | 2026-02-12 |
| send-email-handler.jar | 2026-02-26 |
| split-csv-handler.jar | 2026-02-12 |
| その他 | - |

**確認結果:** STG Lambda JARの置き場として現役稼働中。名前が `dev-` で紛らわしいが削除不可。PRDの `prd-ignica-com-lmd-jar` に相当するバケット。

---

### [1]-4 phongbt-auditor-staging 削除

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

## [2] 全サービス調査

### [2]-1 STG 全サービス調査

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

---

### [2]-2 EC2アラーム ALARM調査・リセット

**調査結果:**
- フィルターパターン: `*fail*` / `*error*` 等を含む文字列を検知
- ALARM原因: 2025-07-31 02:20 JST に `kiyohara_s3` ユーザーのSSHセッション終了時、PAMが出力する `res=failed`（正常動作）に誤反応
- 実際の障害: **なし**（bastionは正常稼働・ログも正常流入中）

**対応:**
```bash
aws cloudwatch set-alarm-state --alarm-name "ksm-posstg-cw-alarm-ec2-audit-log" --state-value OK
aws cloudwatch set-alarm-state --alarm-name "ksm-posstg-cw-alarm-ec2-messages" --state-value OK
```
→ 両アラームOKに変更済み（2026-03-10）

**Pending:** フィルターパターンを `res=failed` 除外に修正する（根本対応）→ 改修指示書No.003

---

### [2]-3 CloudWatch Logs 保持期間調査（STG）

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

---

### [2]-4 不要リソース調査（削除未実施）

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

**削除保留理由:** カスミ承認待ち。削除コマンド:

```bash
aws --no-cli-pager sns delete-topic \
  --region ap-northeast-1 \
  --topic-arn "arn:aws:sns:ap-northeast-1:750735758916:ksm-posspk-sns-topic-app-logs-dev"

aws --no-cli-pager ecr delete-repository \
  --region ap-northeast-1 \
  --repository-name "ksm-posstg-ecr-web-fe" --force
aws --no-cli-pager ecr delete-repository \
  --region ap-northeast-1 \
  --repository-name "ksm-posstg-ecr-web-be" --force
```

---

### [2]-5 EC2台数誤記修正

**CloudShell調査で判明したSTG EC2全台:**

| Name | InstanceId | IP | Type | Platform |
|---|---|---|---|---|
| ksm-posstg-ec2-instance-bastion  | i-0bd9a4db1b74b5a69 | 10.239.2.4   | t3.xlarge | Linux |
| ksm-posstg-ec2-instance-giftcard | i-0f8ededc7ae313cbe | 10.239.2.193 | t2.large  | Windows |
| ksm-posstg-ec2-instance-web-be   | i-06a74666e851e4d12 | 10.239.2.195 | t3.medium | Linux |
| ksm-posstg-ec2-instance-web-fe   | i-0fa4cf3cf5c1a8864 | 10.239.2.253 | t3.medium | Linux |

**修正:** 誤: 3台（bastion/giftcard/web-be） → 正: **4台**（+web-fe）

---

### [2]-6 web-fe/web-be 詳細調査

**アーキテクチャ:**
```
Internet → ALB(ksm-posstg-alb-web-fe, internet-facing) → web-fe:80
         → ALB(ksm-posstg-alb-api-be, internet-facing) → web-be:80/8080 → RDS
```

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
- 🔴 ALB×2: internet-facing → **改修指示書No.018でinternal化指示済み（今週中対応予定）**
- 🟡 web-be IAM: S3FullAccess・SecretsManagerReadWrite（権限過剰・要絞り込み）

---

## [3] ALB詳細調査

### [3]-1 ターゲットグループ確認

```bash
aws elbv2 describe-target-groups \
  --region ap-northeast-1 \
  --query 'TargetGroups[*].{Name:TargetGroupName,ARN:TargetGroupArn}'
```

**受信内容:**
```json
[
    {"Name": "alb-target-be", "ARN": "...targetgroup/alb-target-be/e1d3c617e2a0bdfc"},
    {"Name": "alb-target-fe", "ARN": "...targetgroup/alb-target-fe/da33aafd108d83b3"}
]
```

### [3]-2 ターゲットヘルス確認

**確認結果:**

| ALB | ターゲットID | Port | 状態 |
|---|---|---|---|
| alb-target-be | i-06a74666e851e4d12 (web-be) | 80 | healthy |
| alb-target-fe | i-0fa4cf3cf5c1a8864 (web-fe) | 80 | healthy |

→ **どちらも1対1（負荷分散なし）**。ALBは現時点でSSL終端専用として機能。

### [3]-3 ALBリスナー確認

**確認結果:**

| ALB | ARN末尾 | Port 80 | Port 443 | SSL証明書 |
|---|---|---|---|---|
| ksm-posstg-alb-web-fe | a4eb347a3cf149f9 | HTTP ✅ | HTTPS ✅ | ACM (a77b0b86-ac65-4f45-93f1-8cf93957849e) |
| ksm-posstg-alb-api-be | 583caa4ac9e37817 | HTTP ✅ | HTTPS ✅ | ACM (同一証明書) |

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

## [4] ECS稼働状況確認

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

→ **ECSは器のみ存在・何も動いていない**
→ 将来のコンテナ化（ECS移行）に向けて準備済みの状態

---

## チャット別索引

| セクション | 内容 | 日時 |
|---|---|---|
| [1] | STG S3バケット調査・CloudTrail未設定確認・dev-ignica-ksm用途確認・phongbt-auditor-staging 削除 | 2026-03-10 |
| [2] | STG全サービス調査・EC2アラームリセット・CWLogs保持期間・不要リソース・web-fe/web-be詳細 | 2026-03-10 |
| [3] | ALB詳細調査（ターゲット・リスナー・SSL証明書・ACM） | 2026-03-10 |
| [4] | ECS稼働状況確認（タスク0件） | 2026-03-10 |

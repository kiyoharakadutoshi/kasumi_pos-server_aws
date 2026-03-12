# AWS現状サマリー DEV

最終更新: 2026-03-12（初回調査）  
AWSアカウント: 891376952870  
命名プレフィックス: ksm-posspk-  
別称: スパイク環境 / 開発環境  
リージョン: ap-northeast-1（東京）  
コンソール: https://ap-northeast-1.console.aws.amazon.com/console/home?region=ap-northeast-1

> ⚠️ DEV環境はLuvina内部開発環境。STG(750735758916) / PRD(332802448674) と別AWSアカウント。  
> ⚠️ Secrets Managerの命名が `spike/` プレフィックス → 「スパイク環境」が正式呼称と判明。  
> ⚠️ STGの `eb-rule-copy-backup-sg` がこのアカウントの Lambda をクロスアカウントで呼び出し中（DEV側で許可済み）。

---

## 1. VPC・ネットワーク基本構成

| 項目 | 値 |
|---|---|
| VPC ID | vpc-07b182b381dc59573 |
| CIDR | 10.226.51.0/24 |
| AZ | ap-northeast-1a + ap-northeast-1c |
| Internet GW | igw-0d133a28e92c93cab |
| Virtual Private GW | vgw-084f9d4fbe8f80f00（10.156.96.192/26 VGWルートあり） |
| S3 VPC Endpoint | vpce-01e614a43ddde10f8（Gateway型）|

### ルートテーブル まとめ

| ルートテーブル | 名前 | 主要ルート |
|---|---|---|
| rtb-0a77a9bbc22a2bdf5 | posspk-vpc-rtb-public1a | 0.0.0.0/0→IGW / S3EP |
| rtb-09cbf0908afd528a9 | posspk-vpc-rtb-public1c | 0.0.0.0/0→IGW / S3EP |
| rtb-07ee163b7a0046d7a | posspk-vpc-rtb-private1a | 10.156.96.192/26→VGW / 0.0.0.0/0→(NAT?) / S3EP |
| rtb-0950abdb22c14091a | posspk-vpc-rtb-private1c | 10.156.96.192/26→VGW / 0.0.0.0/0→(NAT?) / S3EP |
| rtb-0e5064919aff8d8b0 | posspk-vpc-rtb-protect1a | ローカルのみ / S3EP |
| rtb-09b9251ca249e51c9 | posspk-vpc-rtb-protect1c | ローカルのみ / S3EP |

> ⚠️ private系RTの 0.0.0.0/0 の Via が null → NAT GW未設定/削除済みの可能性。要追加調査。

### サブネット（詳細未取得・追加調査推奨）

| サブネットID | 利用（推定） | 備考 |
|---|---|---|
| subnet-027bd3c83da4b6681 | private-1a | Lambda・ECS・TF VPC EP |
| subnet-0557c68a1d6ba4382 | private-1c | 同上 |

---

## 2. EC2（詳細未取得・追加調査推奨）

EBSボリューム20本が確認されており、少なくとも複数のEC2インスタンスが稼働中。  
AMI: prod-prod / pos-ec2 / Pos-prodv1 / posserverv2 の4本が自作AMIとして存在。

> 🔴 **全20本のEBSボリュームが未暗号化**（2026-03-12確認）

---

## 3. RDS（Aurora MySQL）

DEV環境に **4系統のクラスターが混在**。

| クラスター系統 | インスタンスクラス | AZ | SG |
|---|---|---|---|
| **posspk-db**（メインDEV） | **db.r5.large** | 1a | sg-00b263c4d419eee76 / sg-0127217180e56d3f1 / sg-06702361d579436c5 |
| pos-dev-db | db.serverless | 1a/1c | sg-0b1f2207fd1bf8bb2 |
| **pos-prod**（🔴prod命名） | db.serverless | 1a/1c | sg-0b1f2207fd1bf8bb2 |
| **inageya-staging**（⚠️別案件） | db.serverless | 1a/1c | sg-0f4261063190195bc |

**Secrets Manager（DB接続情報）:**  
- spike/Re_Kasumi（最終アクセス: 2026-03-12 ✅）  
- spike/Re_Kasumi_RO（最終アクセス: 2026-03-12 ✅）  
- spike/Batch_Kasumi  
- spike/Replica_Kasumi  
- spike/Mail_Kasumi  

> MYSQL_HOST: posspk-db.cluster-ro-c18sgiku2epk.ap-northeast-1.rds.amazonaws.com（Lambda ENV直書き確認）  
> 🔴 **pos-prod命名・inageya命名のクラスターが開発アカウントに混在**。用途・データ確認が必要。

---

## 4. Lambda（26関数）

| 関数名 | Runtime | Memory | Timeout | ENV注目点 |
|---|---|---|---|---|
| split-txt-by-sent-time | java17 | 512 | 900 | FIRST_NAME_SCHEDULE |
| sent-email | java17 | 512 | 15 | SNS_TOPIC_ARN=ksm-posspk-sns-topic-app-logs / Azure URL |
| zipfile-polling | python3.13 | 128 | 300 | SF_ARN |
| split-csv | java17 | 1024 | 900 | DB_KASUMI=spike/Re_Kasumi_RO |
| export-polling | python3.13 | 128 | 300 | SF_ARN |
| sg-export-data | java17 | 1024 | 900 | spike/Batch_Kasumi / spike/Re_Kasumi |
| sent-txt-file | java17 | 512 | 900 | ENV null |
| get-sync-store | java17 | 1024 | 900 | spike/Re_Kasumi_RO |
| unzip-file | java17 | 1024 | 900 | ENV null |
| itemmaster-import-monitoring | java17 | 512 | 900 | spike/Re_Kasumi_RO |
| trigger-sqs-export-sg | python3.13 | 128 | 300 | QUEUE_URL |
| create-file-end | java17 | 1024 | 900 | ENV null |
| **pos-health-check** | nodejs18.x | 128 | 3 | ENV null（命名がDEV系と別） |
| import-pos-master-oc | java17 | 1024 | 900 | spike/Batch_Kasumi / spike/Re_Kasumi |
| create-report | java17 | 512 | 900 | DEST_BUCKET=spk-ignica-ksm |
| for-dev-test | java17 | 256 | 300 | FIRST_NAME_SCHEDULE=ksm-posspk-eb-rule-test- |
| split-csv-sh | java17 | 512 | 15 | ENV null |
| create-file-end-for-night | java17 | 512 | 300 | spike/Batch_Kasumi / spike/Re_Kasumi |
| copy-backup-sg | java17 | 512 | 15 | DEST_BUCKET=spk-ignica-ksm |
| backup-file | java17 | 1024 | 900 | ENV null |
| receive-and-import-pos-master-sg | java17 | 1024 | 900 | spike/Batch_Kasumi / spike/Re_Kasumi |
| **store-code-sg-check-message** | nodejs20.x | 128 | 900 | **🔴 MYSQL_PASSWORD平文** |
| trigger-sqs-import-sg | python3.13 | 128 | 300 | QUEUE_URL |
| import-pos-master-sh | java17 | 1024 | 900 | spike/Batch_Kasumi / spike/Re_Kasumi |
| p001-import-monitoring | java17 | 512 | 900 | spike/Re_Kasumi_RO |
| store-code-sg-handler | nodejs20.x | 128 | 3 | SQS_FIFO_URL |

> 🔴🔴 **store-code-sg-check-message**: MYSQL_PASSWORD=f0H4rF2uDIpYh4SW が ENV に平文設定  
> 🔴 **sent-email**: CHANNEL_CONFIGにAzure Logic Apps署名付きURL（有効期限不明）

---

## 5. Step Functions（10SM）

| SM名 | 最新実行 | 状態 |
|---|---|---|
| create-txt-file-oc | - | 未実行 |
| **create-txt-file-sg** | 2026-03-12 | SUCCEEDED ✅ |
| create-txt-file-sg-copy | - | 未実行（削除候補） |
| import-pos-master-oc | - | 未実行 |
| import-pos-master-oc-copy | 2026-03-03 | SUCCEEDED |
| import-pos-master-sh | 2026-02-24 | SUCCEEDED |
| receive-and-import-pos-master-sg | - | 未実行 |
| **receive-and-import-pos-master-sg-copy** | 2026-03-12 | SUCCEEDED ✅ |
| receive-pos-master-oc | 2026-03-03 | SUCCEEDED |
| **sent-txt-file** | **2026-03-12** | **FAILED 🔴** |

---

## 6. EventBridge ルール（13本）

| ルール名 | 状態 | スケジュール | ターゲット |
|---|---|---|---|
| check-price-sg | ENABLED | S3トリガー | Lambda: create-report |
| **copy-backup-sg** | ENABLED | S3トリガー | Lambda: copy-backup-sg（同アカウント ✅） |
| create-txt-file-oc | **DISABLED** | - | SF: create-txt-file-oc |
| create-txt-file-sg | ENABLED | S3トリガー | Lambda: trigger-sqs-export-sg |
| for-dev-test | ENABLED | S3トリガー | Lambda: for-dev-test |
| itemmaster-import-monitoring | ENABLED | cron(30 20 **) | Lambda: itemmaster-import-monitoring |
| night-export-trigger-sg | ENABLED | cron(15 7 **) | Lambda: create-file-end-for-night |
| p001-import-monitoring | ENABLED | cron(54 7 **) | Lambda: p001-import-monitoring |
| receive-pos-master-oc | ENABLED | S3トリガー | SF: receive-pos-master-oc |
| receive-pos-master-sg | ENABLED | S3トリガー | Lambda: trigger-sqs-import-sg |
| receive-splited-pos-master-oc | ENABLED | S3トリガー | SF: import-pos-master-oc-copy |
| receive-splited-pos-master-sh | ENABLED | S3トリガー | SF: import-pos-master-sh |
| pos-health-check | ENABLED | cron(0/10 ***) | Lambda: pos-health-check |

> ✅ **全ターゲットが同一アカウント（891376952870）内を参照**（STGと異なりクロスアカウント参照ゼロ）

---

## 7. SQS

- ksm-posspk-sqs-export-queue-sg.fifo
- ksm-posspk-sqs-store-code-queue-sg.fifo

---

## 8. S3（26バケット）

| メインバケット | 用途 |
|---|---|
| **spk-ignica-ksm** | DEVメインS3（STG: stg-ignica-ksm） |
| posspk-master-batch-source | バッチソース |
| pos-server-file/images/sftp/tomcat-webapp | 各種 |
| fe-develop | FE開発 |
| spk-cost-report | コストレポート |
| aws-cloudtrail-logs-891376952870-6e1158e3 | CloudTrail |
| config-bucket-891376952870 | Config |

**問題バケット:**
- 🔴 pos-prod-fe / pos-prod-fe-public / pos-prod-java（prod命名が開発アカウントに）
- ⚠️ pos-server-image-stg（stg命名）
- ⚠️ phongbt-auditor-spike（個人名）

---

## 9. Transfer Family（3台）

| サーバーID | 名前 | タイプ | ユーザー | 評価 |
|---|---|---|---|---|
| s-4a7aaa2ff88b48239 | ksm-posspk-tf-public | PUBLIC | ksm-posspk-tf-user-scango-relay-public | ⚠️ |
| s-637e926832eb4724b | posspk-tf | VPC | posspk-tf-user | ✅ |
| **s-dd96ffb7500645969** | (タグなし) | **PUBLIC** | IGPOS15/31/32 dev3 inageya kasumi **kiyohara** | 🔴 |

---

## 10. IAM（13ユーザー）

| ユーザー | 最終ログイン | アクセスキー |
|---|---|---|
| buithephong | 2026-01-08 | Active×1 Inactive×1 |
| dattv | 2026-03-12 | なし |
| dattv_cli_deploy | None | - |
| dev1root | 2025-07-28 | Inactive×2 |
| kiyohara | 2026-03-12 | なし |
| locnt | 2026-03-12 | Active×1 |
| locnt_cli_deploy | None | - |
| nangld_admin | 2026-03-12 | なし |
| nangld_readonly | 2026-03-12 | なし |
| pos-server-logging | None | **Active×1（長期）** |
| pos-server-s3-bucket | None | **Active×1（長期）** |
| pos_dev_vangle_sonln | 2026-03-12 | なし |
| pos_dev_vangle_tuannv | 2026-03-12 | なし |

---

## 11. CloudWatch・SNS・CloudFormation

**アラーム（9本）:**
- ALARM: TargetTracking-pos-asg/production/stg-management/prod-pos AlarmLow（古い日付・ASG残骸疑い）
- INSUFFICIENT_DATA: pos-health-check

**SNS（3本）:**
- ksm-posspk-sns-topic-app-logs（Lambda sent-email が参照）
- pos-sre
- teams-notifications（Lambda sent-email の SNS_TOPIC_ARN_CHECK_PRICE が参照）

**CloudFormation（4スタック）:** ECS関連・CI/CD関連

---

## 12. ECS（3クラスター）

| クラスター | 状態 | サービス | タスク |
|---|---|---|---|
| **ksm-posspk-ecs-cluster-web** | ACTIVE | 1 | **1（稼働中）** |
| AWSBatch-pos_server_batch-* | ACTIVE | 0 | 0 |
| posspk-cluster | ACTIVE | 0 | 0 |

---

## 13. ECR（7リポジトリ）

全リポジトリ: ksm-posspk-ecr-oc-export/import-data / ksm-posspk-ecr-sg-export/import-data / ksm-posspk-ecr-web-be / posspk-repo / simple-docker-service-*  
🔴 **全7リポジトリ scanOnPush=False**（暗号化: AES256）

---

## 14. セキュリティサービス

| サービス | 状態 |
|---|---|
| GuardDuty | 🔴 **未有効** |
| Security Hub | 🔴 **未サブスクライブ** |
| Inspector | 未確認 |
| Config | ✅ 有効（IAM系除外設定あり） |
| CloudTrail | ⚠️ 有効だが **LogFileValidationEnabled=False** |

---

## 15. ACM / Route53 / KMS

- ACM: luvina.net / ignicapos.com / pos-vpn-server / posclient / pos-spk（5証明書 ISSUED）
- Route53: なし（DEVはRoute53未使用）
- KMS: AWS管理キー7本 + カスタマーキー1本（alias/posspk-kms-sm）

---

## 16. クロスアカウント関係（STGとの関係）

| 方向 | 内容 | 評価 |
|---|---|---|
| STG(750735758916) → DEV(891376952870) | eb-rule-copy-backup-sg → ksm-posspk-lmd-function-copy-backup-sg | ⚠️ DEV側で明示的に許可済み |
| STG内残留 | ksm-posspk-sns-topic-app-logs-dev（STGアカウント内に存在） | 🔴 STG側で削除要（DEVとは別物） |

> DEV Lambda のリソースポリシー（Sid: AllowEventBridgeCallCrossAccount）でSTGアカウント root からの呼び出しを許可。  
> 設計意図をLuvinaチームに確認後、不要であればSTG側のEB設定を同アカウント内Lambdaに修正。

---

## 17. 問題点サマリー

| # | 重要度 | 問題 | 対応 |
|---|---|---|---|
| DEV-1 | 🔴🔴 | Lambda store-code-sg-check-message に MYSQL_PASSWORD 平文 | Secrets Manager化 |
| DEV-2 | 🔴🔴 | EBS全20本未暗号化 | デフォルト暗号化有効化 |
| DEV-3 | 🔴 | GuardDuty 未有効 | 有効化 |
| DEV-4 | 🔴 | Security Hub 未サブスクライブ | 有効化 |
| DEV-5 | 🔴 | CloudTrail LogFileValidationEnabled=False | 有効化 |
| DEV-6 | 🔴 | inageya・pos-prod系DB/S3が開発アカウントに混在 | 用途確認・分離または削除 |
| DEV-7 | 🔴 | sf-sm-sent-txt-file 本日FAILED（2026-03-12） | CloudWatchログ調査 |
| DEV-8 | ⚠️ | Transfer Family s-dd96ffb7500645969 タグなし・PUBLIC・7名 | タグ付け・棚卸し |
| DEV-9 | ⚠️ | ECR全リポジトリ scanOnPush=False | 有効化 |
| DEV-10 | ⚠️ | TargetTracking ALARM×4（ASG残骸疑い） | ASG存在確認後削除 |
| DEV-11 | ⚠️ | STG→DEV クロスアカウント設計の意図確認 | Luvinaチームへ確認 |

---

## STG/PRDとの環境比較

| 項目 | DEV (posspk) | STG (posstg) | PRD (posprd) |
|---|---|---|---|
| AWSアカウント | 891376952870 | 750735758916 | 332802448674 |
| 別称 | スパイク環境・開発環境 | - | - |
| 命名プレフィックス | ksm-posspk- | ksm-posstg- | ksm-posprd- |
| VPC CIDR | 10.226.51.0/24 | 10.239.0.0/16 | 10.238.0.0/16 |
| EC2 | 詳細未取得（EBS 20本確認） | 4台 | 2台 |
| RDS | 4系統混在（posspk/pos-dev/pos-prod/inageya） | 2クラスター | 2クラスター |
| Lambda | **26関数** | 23関数 | 21関数 |
| Step Functions | **10SM** | 7SM | 7SM |
| S3 | **26バケット** | 9本 | 9本 |
| GuardDuty | 🔴 未有効 | ✅ | ✅ |
| Security Hub | 🔴 未サブスクライブ | ✅ | ✅ |
| EBS暗号化 | 🔴 全20本未暗号化 | 2本未暗号化 | 未調査 |
| Secrets Manager ENV | 🔴 一部平文あり | ✅ | ✅ |

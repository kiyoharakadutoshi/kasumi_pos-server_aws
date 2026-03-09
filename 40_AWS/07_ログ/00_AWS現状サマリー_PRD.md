# AWS現状サマリー PRD

最終更新: 2026-03-10  
AWSアカウント: 332802448674  
リージョン: ap-northeast-1（東京）  
コンソール: https://ap-northeast-1.console.aws.amazon.com/console/home?region=ap-northeast-1

> ⚠️ STGとの差異は **【PRD独自】** または **【PRD/STG差異】** で明示。

---

## 1. VPC・ネットワーク基本構成

| 項目 | 値 |
|---|---|
| VPC ID | vpc-0e2d2d27b6860b7fc |
| CIDR | 10.238.0.0/16 |
| AZ | ap-northeast-1a + ap-northeast-1c |
| NAT GW Public IP | **57.182.174.110** ← NTT DATA CDS送信元IPとしてCDS側に登録済み |

サブネット: public/private/protected/common × 1a/1c（計8本）

---

## 2. EC2（2台）

| 名前 | インスタンスID | タイプ | プライベートIP | AZ | OS | 用途 |
|---|---|---|---|---|---|---|
| bastion | - | t3.xlarge | 10.238.2.39 | 1a | Linux | 踏み台・OpenVPN(UDP1194) |
| giftcard | i-03d6bf91c19385cdf | t2.large | 10.238.2.198 | 1a | **Windows Server 2022** | ギフトカード決済処理 |

**giftcard EC2 詳細:**
- アプリ配置: `C:\gift\`
- SG: sg-0a9497c846d1be76f (ksm-posprd-vpc-sg-ec2-giftcard)
  - Ingress: TCP80 ← Bastion/10.156.96.0/24、TCP3389(RDP) ← Bastion
  - Egress: ALL(-1) → 0.0.0.0/0 ✅（NTT DATA CDS送信可能）
- CloudWatch Logs: **未設定（監視ゼロ）** ⚠️ → 改修依頼 No.16
- SSM: Online（AWS-QuickSetup-SSM-DefaultEC2MgmtRole）

---

## 3. RDS（Aurora MySQL 8.0 / 2クラスター）

| クラスター | プライマリ | レプリカ | Multi-AZ | エンドポイント |
|---|---|---|---|---|
| instance-1 | db.r5.2xlarge | db.t3.medium | False | ksm-posprd-db-cluster.cluster-cxekgmegw02x.ap-northeast-1.rds.amazonaws.com |
| instance-2 | db.r5.2xlarge | db.t3.medium | False | - |

**Secrets Manager（DB接続情報）:**

| シークレット名 | 用途 |
|---|---|
| ksm-posprd-sm-db | POS主DB |
| ksm-posprd-sm-db-replica | レプリカDB |
| ksm-posprd-sm-sftp | SFTP認証 ⚠️ SFTP_PRIVATE_KEY="test"（本番未設定・実際はEC2ローカルファイル） |
| prd/Mail_Kasumi | メール送信 |
| prd/Batch_Kasumi | ギフトカードDB (HOST/PORT/DB_NAME=Batch_Kasumi/USER=admin/PASS確認済) |
| prd/Replica_Kasumi | レプリカDB |

---

## 4. Lambda（21関数）

主要ランタイム: Java17 / python3.13 / python3.11  
メモリ: 128〜2048MB / タイムアウト: 300〜900秒

| 関数名 | 系統 | 役割 | 備考 |
|---|---|---|---|
| ksm-posprd-lmd-function-export-polling | SG | .ENDEXPORT検知→SF起動 | |
| ksm-posprd-lmd-function-zipfile-polling | SG | .zip検知 | |
| ksm-posprd-lmd-function-trigger-sqs-export-sg | SG | SQSトリガー | |
| ksm-posprd-lmd-function-trigger-sqs-import-sg | SG | SQSトリガー | |
| ksm-posprd-lmd-function-sent-txt-file | 送信 | USMH向け平文FTP送信 | |
| ksm-posprd-lmd-function-get-sync-store | 送信 | FTP接続先情報取得 | |
| ksm-posprd-lmd-function-create-file-end-for-night | 夜間 | 毎日JST05:30 夜間SGトリガー | |
| **ksm-posstg-lmd-export-polling** | SG | ⚠️ **【PRD独自問題】名前はSTG、中身はPRD本番** | → 改修依頼No.15 |
| その他13関数 | OC/SH/共通 | マスターデータ処理 | |

---

## 5. S3バケット（9本）

### プロジェクト管理バケット（6本）

| バケット名 | 用途 |
|---|---|
| prd-ignica-ksm | メイン（pos-original/oc・sg・sh） |
| prd-ignica-ksm-master-backup | マスターバックアップ |
| prd-ignica-ksm-pmlogs | PMログ |
| prd-ignica-com-lmd-jar | Lambda JARファイル |
| prd-aeon-gift-card | ギフトカード |
| prd-ignica-com-configrecord | 設定レコード |

### AWSサービス自動生成バケット（3本）

| バケット名 | 自動生成元 | 用途 |
|---|---|---|
| aws-cloudtrail-logs-332802448674-e91cb7f6 | CloudTrail 有効化時 | 操作ログ出力先（稼働中） |
| aws-quicksetup-patchpolicy-332802448674-3eig7 | SSM Quick Setup | パッチポリシー設定用 |
| aws-quicksetup-patchpolicy-access-log-332802448674-a66d-3eig7 | SSM Quick Setup | アクセスログ用（上記のペア） |

> **【削除済】2026-03-10** `phongbt-auditor-production`（中身空・CloudTrail未使用バケット）を削除。Phong氏がCloudTrail設定試行時に作成し放置されていたもの。

---

## 6. Transfer Family（3台・受信専用）

VPC: vpc-0e2d2d27b6860b7fc / IAMロール: ksm-posprd-iam-role-tf  
CFn: ksm-posprd-transfer（OC・SG）/ SHはタグなし手動追加

| サーバー名 | サーバーID | VPC EP ID | AZ-1a IP | AZ-1c IP | S3受信先 | 送信元 |
|---|---|---|---|---|---|---|
| ksm-posprd-tf-server-oc | s-2a4905e8210f48248 | vpce-00da0e948a06819d1 | 10.238.2.221 | 10.238.3.138 | /prd-ignica-ksm/pos-original/oc/receive | BIPROGY（OpenCentral） |
| ksm-posprd-tf-server-sg | s-bd974a35aa994c838 | vpce-0c489e9240780e92b | 10.238.2.234 | 10.238.3.215 | /prd-ignica-ksm/pos-original/sg/receive | VINX（POS Server） |
| ksm-posprd-tf-server-sh | s-5546031218784c4ba | vpce-0bb018fa328a44d12 | 10.238.2.184 | 10.238.3.139 | /prd-ignica-ksm/pos-original/sh/receive | SHARP（P003） |

**SG: sg-0d8afd91c37a78137 (ksm-posprd-vpc-sg-ep-tf)**

| TCP | 送信元 | 評価 |
|---|---|---|
| 22 | 10.156.96.192/26（USMH SFTP専用） | ✅ 正常・最小権限 |

**【PRD独自】Bastionからの許可なし ✅（STGには test for bastion ルールが残存→削除対象）**

---

## 7. Step Functions（7本）

| SF名 | 系統 |
|---|---|
| receive-pos-master-oc | OC受信 |
| import-pos-master-oc | OC投入 |
| create-txt-file-oc | OC変換・送信 |
| receive-and-import-pos-master-sg | SG受信・投入 |
| create-txt-file-sg | SG変換・送信 |
| import-pos-master-sh | SH投入 |
| sent-txt-file | USMH共通送信 |

---

## 8. SQS（2 FIFOキュー）

- ksm-posprd-sqs-export-queue-sg.fifo
- ksm-posprd-sqs-store-code-queue-sg.fifo

---

## 9. EventBridge

| ルール名 | スケジュール | JST | 状態 |
|---|---|---|---|
| eb-rule-check-p001-price | cron(00 15 * * ? *) | 00:00 | DISABLED |
| eb-rule-night-export-sg | cron(30 20 * * ? *) | 05:30 | **ENABLED** |
| eb-rule-receive-pos-master-oc | S3 | - | ENABLED |
| eb-rule-receive-pos-master-sg | S3 | - | ENABLED |
| eb-rule-receive-pos-master-sh | S3 | - | ENABLED |
| eb-rule-create-txt-file-sg | S3 | - | ENABLED |
| **DO-NOT-DELETE-AmazonInspector*（6本）** | - | - | 各種 |
| receive-splited-pos-master-oc | - | - | ENABLED |

**【PRD独自】DO-NOT-DELETE-AmazonInspector 系 6本（STGにはなし）**  
**【PRD/STG差異】check-price: PRD=DISABLED / STG=ENABLED**

---

## 10. ネットワーク接続

### Luvina → PRD（OpenVPN）
Bastion: 10.238.2.39（UDP 1194）

### USMH閉域網 ↔ PRD（IPSec Site-to-Site VPN）

| 項目 | 値 |
|---|---|
| VPN ID | vpn-0ea9b7895f78e4c7e |
| CGW IP | 14.224.146.153（Luvina TP-Link ER605） |
| T1 | 35.79.95.18 — **UP** |
| T2 | 52.192.144.197 — **DOWN**（2026-02-19から） |
| USMH CIDR | 10.156.96.0/24 / 172.21.10.0/24 / 10.156.96.192/26 |

### NATアドレス変換

| 方向 | 変換前 | 変換後 | 宛先 |
|---|---|---|---|
| Luvina → AFSオーソリ | 10.238.2.39 | 10.156.96.220 | 192.168.60.10:1501-1508 |
| Luvina → NTT DATA CDS | NAT GW 57.182.174.110 | そのまま | 210.144.93.17:22 |
| ギフト端末 → Luvina | 10.0.0.0/8 → 10.156.96.214 | 10.156.96.214 | 10.238.2.198 |

---

## 11. ギフトカード決済 / NTT DATA CDS送信フロー

```
EC2 giftcard (Windows Server 2022 / i-03d6bf91c19385cdf)
  アプリ: aeongiftcardserver-product (Spring Boot / port 8080)
  起動: @Scheduled cron(0 0 9 * * ?) / 毎日 JST 09:00

  [処理]
  1. settlement_history から前回決済時刻取得（startDateTime）
  2. TransactionJdbcSearch で Aurora MySQL(Batch_Kasumi) から
     対象トランザクション取得（500件/バッチ）
  3. EBCDICファイル生成:
     ファイル名: 6301900000_____000{XX} (XX=2桁連番)
     格納先: C:\gift\settlement\100\{yyMMdd}\
     フォーマット: 120バイト固定長
     レコード種別: ヘッダー(0xF1) / データ(0xF2) / トレーラー(0xF8) / エンド(0xF9)
     ファイル上限: 2GB（超過時自動分割）
  4. SftpService (JSch) で SFTP 送信:
     接続先: 210.144.93.17:22
     ユーザー: 80510048
     秘密鍵: C:\gift\sftp-key\key（EC2ローカル）
     StrictHostKeyChecking: no
     一時ファイル: dummy_{filename} → rename
     リモートパス: put/
  5. settlement_history に結果保存
     (STATUS: 0=成功 / 1=エラー / 2=空ファイル)
```

---

## 12. 外部連携データフロー全体

```
【OC系】BIPROGY(OpenCentral) ──SFTP──→ tf-server-oc
  → S3 oc/receive/*.end → EventBridge → SF(receive+import) → Aurora MySQL

【SH系】SHARP(P003) ──SFTP──→ tf-server-sh
  → S3 sh/receive/*.end → EventBridge → SF(import) → Aurora MySQL

【SG系 受信連鎖】VINX(POS Server) ──SFTP──→ tf-server-sg
  → S3 sg/receive/*.zip → EventBridge → SF(receive+import)
  → S3 sg/csv/*/*.ENDEXPORT → EventBridge → SF(create-txt)
  → Lambda: sent-txt-file (平文FTP) → USMH /{store}/Recv

【SG系 夜間バッチ】毎日 JST 05:30
  EventBridge cron(30 20 * * ? *)
  → Lambda: create-file-end-for-night
    (store_list WHERE SyncFlag='1' 全店舗分 .ENDEXPORT を S3 に生成)
  → EventBridge(S3) → SF(create-txt) → Lambda: sent-txt-file → USMH

【ギフト決済】毎日 JST 09:00
  EC2 giftcard → EBCDIC生成 → SFTP → NTT DATA CDS (210.144.93.17:22)
  ※NAT GW (57.182.174.110) → インターネット経由
```

---

## 13. セキュリティ状況

| サービス | 状態 |
|---|---|
| GuardDuty | ✅ 有効 |
| CloudTrail | ✅ 有効（トレイル名: management-events / マルチリージョン / 出力先: aws-cloudtrail-logs-332802448674-e91cb7f6 / 2025-09-29〜稼働中） |
| Security Hub | ✅ 有効 |
| Inspector | ✅ 有効 **【PRD独自】** |
| VPC Flow Logs | ⚠️ REJECTのみ |
| MFA | ⚠️ 未強制 → No.1 |
| rootアカウント | ⚠️ 日常使用中 |
| PowerUserAccess(lmd) | 🔴 付与中 → No.2 |
| Transfer Family SG | ✅ USMH閉域網のみ |
| giftcard CloudWatch | 🔴 未設定 → No.16 |
| VPN T2 | 🔴 DOWN（2026-02-19〜） → No.11 |

---

## 14. 改修依頼ステータス（PRD関連）

| No | 内容 | 優先度 | 状態 |
|---|---|---|---|
| 1 | MFA全ユーザー強制 | 🔴 | 未実施 |
| 2 | PowerUserAccess削除 | 🔴 | 未実施 |
| 6 | パスワードポリシー設定 | 🟡 | 未実施 |
| 7 | VPC Flow Logs整備 | 🟡 | 未実施 |
| 9 | アクセスキーローテーション | 🟡 | 未実施 |
| 10 | ECSロール権限削減 | 🟡 | 未実施 |
| 11 | VPN T2復旧 | 🟡 | マイ/木村さん依頼待ち |
| 15 | Lambda命名修正(posstg→posprd) | 🟢 | 未実施 |
| 16 | giftcard EC2 CloudWatch Logs整備 | 🟡 | 未実施 |

---

## 15. 次回調査チェックリスト（PRD）

- [ ] VPN T2 (52.192.144.197) 復旧状況
- [ ] giftcard CloudWatch Logs 設定・動作確認
- [ ] Secrets Manager ksm-posprd-sm-sftp 修正状況
- [ ] PowerUserAccess 削除後動作確認
- [ ] settlement_history テーブル最新実行確認

---

## 16. CloudFormation（25スタック）

| カテゴリ | スタック名 | 状態 |
|---|---|---|
| AWS自動生成 | StackSet-AWS-QuickSetup-PatchPolicy-LA-3eig7-* | UPDATE_COMPLETE |
| AWS自動生成 | AWS-QuickSetup-PatchPolicy-LocalDeploymentRolesStack | CREATE_COMPLETE |
| AWS自動生成 | StackSet-AWS-QuickSetup-SSM-LA-74sd4-* | CREATE_COMPLETE |
| AWS自動生成 | AWS-QuickSetup-SSM-LocalDeploymentRolesStack | CREATE_COMPLETE |
| 共通インフラ | com-posprd-cloudwatchlogs | UPDATE_COMPLETE |
| 共通インフラ | com-posprd-iam-analyzer | CREATE_COMPLETE |
| 共通インフラ | com-posprd-config | UPDATE_COMPLETE |
| 共通インフラ | com-posprd-securityhub | CREATE_COMPLETE |
| 共通インフラ | com-posprd-endpoint | UPDATE_COMPLETE |
| 共通インフラ | com-posprd-prefixlist | CREATE_COMPLETE |
| KSMアプリ | ksm-posprd-cloudwatch-alarm1/2/3 | CREATE/UPDATE_COMPLETE |
| KSMアプリ | ksm-posprd-sns | UPDATE_COMPLETE |
| KSMアプリ | ksm-posprd-ecs | CREATE_COMPLETE |
| KSMアプリ | ksm-posprd-rds / rds-replica | UPDATE_COMPLETE |
| KSMアプリ | ksm-posprd-ecr | CREATE_COMPLETE |
| KSMアプリ | ksm-posprd-secretsmanager | CREATE_COMPLETE |
| KSMアプリ | ksm-posprd-transfer | UPDATE_COMPLETE |
| KSMアプリ | ksm-posprd-ec2-bastion | UPDATE_COMPLETE |
| KSMアプリ | ksm-posprd-network | UPDATE_COMPLETE |
| KSMアプリ | ksm-posprd-kms | CREATE_COMPLETE |
| KSMアプリ | ksm-posprd-s3 | UPDATE_COMPLETE |
| KSMアプリ | ksm-posprd-sg | UPDATE_COMPLETE |

> 全リソースはCloudFormationで管理されている（IaC済み）

## 17. SNS（3トピック）

| トピック名 | 用途推定 |
|---|---|
| ksm-posprd-sns-topic-app-logs | アプリログのアラート通知先 |
| ksm-posprd-sns-topic-app-logs-test | テスト用 |
| ksm-posprd-sns-topic-aws-logs | AWSサービスログのアラート通知先 |

→ CloudWatch Alarms → SNS → メール通知 の構成

## 18. CloudWatch（アラーム19本 / ロググループ40本）

**■ アラーム一覧（全19本・現在全てOK）**

| カテゴリ | アラーム名（抜粋） | 状態 |
|---|---|---|
| RDS(cluster) | cpu, aborted-clients, acu, dml-rejected-writer, freeable-memory, serverless-capacity | OK |
| RDS(replica) | cpu, aborted-clients, dml-rejected-writer, free-local-storage, freeable-memory | OK |
| EC2(bastion) | audit-log, dnf-log, messages, secure, statuscheck-instance, statuscheck-system | OK |
| Transfer Family | tf-oc, tf-sg | OK |

**■ ロググループ（40本）保持期間まとめ**

| ロググループ | 保持期間 | 備考 |
|---|---|---|
| /aws/ecs/containerinsights/.../performance | **1日** ⚠️ | 短すぎ |
| /aws/ecs/ksm-posprd-ecs-sg-export-data | **無期限** ⚠️ | 未設定 |
| /aws/lambda/ksm-posprd-lmd-* (21本) | **無期限** ⚠️ | 全Lambda未設定 |
| /aws/rds/cluster/.../error (2本) | **無期限** ⚠️ | 未設定 |
| /aws/transfer/* (3本) | **無期限** ⚠️ | 未設定 |
| /aws/vpc/com-posprd-cw-lg-vpc-fl | 365日 | ✅ |
| /aws/vpc/com-posprd-cw-lg-vpc-flow-log | **無期限** ⚠️ | 二重登録？ |
| /aws/vpn/vpn-0ea9b7895f78e4c7e | 30日 | ✅ |
| /pos/log/export・import・sent (6本) | **無期限** ⚠️ | 未設定 |
| /var/log/* (4本) | 365日 | ✅ |
| RDSOSMetrics | 30日 | ✅ |
| **/aws/lambda/ksm-posstg-lmd-export-polling** | **無期限** | 🚨 **STGのログがPRDアカウントに混在！** |

## 19. ECR（4リポジトリ）

| リポジトリ名 | URI |
|---|---|
| ksm-posprd-ecr-sg-export-data | 332802448674.dkr.ecr.ap-northeast-1.amazonaws.com/ksm-posprd-ecr-sg-export-data |
| ksm-posprd-ecr-oc-export-data | 332802448674.dkr.ecr.ap-northeast-1.amazonaws.com/ksm-posprd-ecr-oc-export-data |
| ksm-posprd-ecr-oc-import-data | 332802448674.dkr.ecr.ap-northeast-1.amazonaws.com/ksm-posprd-ecr-oc-import-data |
| ksm-posprd-ecr-sg-import-data | 332802448674.dkr.ecr.ap-northeast-1.amazonaws.com/ksm-posprd-ecr-sg-import-data |

→ ECSタスク（ksm-posprd-ecs-sg-export-data）が使用するDockerイメージ置き場。sg/ocのexport/importデータ処理用コンテナ。

## 20. ECS（1クラスター）

- クラスター名: ksm-posprd-ecs-cluster
- タスク: ksm-posprd-ecs-sg-export-data（SG系データのエクスポート処理）
- CloudFormationスタック: ksm-posprd-ecs
- ログ: /aws/ecs/ksm-posprd-ecs-sg-export-data（保持期間未設定⚠️）

> 以前「App Server/Batch Server なし」と記録していたが、ECSクラスターは存在する。用途はSGデータのエクスポート処理コンテナ（EC2ベースのアプリサーバーとは別物）。

## 21. Route53

- ホストゾーン: ignicapos.com.（パブリック / ID: Z017481510MTQ4HID9VH2）
- ゾーン数: 1（プライベートゾーンなし）

## 22. KMS（カスタムキー4本）

| エイリアス | 用途 |
|---|---|
| alias/ksm-posprd-kms-db | Aurora MySQLクラスター暗号化 |
| alias/ksm-posprd-kms-ebs | EC2 EBS暗号化 |
| alias/ksm-posprd-kms-ecr | ECRリポジトリ暗号化 |
| alias/ksm-posprd-kms-sm | Secrets Manager暗号化 |

AWS管理キー（実キーID付き）: lambda / secretsmanager / sns / ssm

## 23. Config（345ルール）

- レコーダー名: com-posprd-config-recorder
- 記録範囲: 全リソース（CONTINUOUS）
- ルール数: **345本**（全てSecurityHubが自動作成・ACTIVE）
- 管理: com-posprd-config CloudFormationスタック

## 24. X-Ray

- グループ: Default のみ（InsightsEnabled: false）
- カスタム設定なし → **コスト発生しているが実質デフォルト状態**

## 25. IAM

**■ ロール（ksm系10本）**

| ロール名 | 用途 |
|---|---|
| ksm-posprd-iam-role-db-cluster | RDSクラスター |
| ksm-posprd-iam-role-db-monitoring | RDSモニタリング |
| ksm-posprd-iam-role-eb | EventBridge |
| ksm-posprd-iam-role-ec2 | EC2（bastion） |
| ksm-posprd-iam-role-ec2-web-be | EC2（giftcard） |
| ksm-posprd-iam-role-ecs | ECS |
| ksm-posprd-iam-role-lmd | Lambda |
| ksm-posprd-iam-role-sf | Step Functions |
| ksm-posprd-iam-role-tf | Transfer Family |
| ksm-posprd-iam-role-tf-logs | Transfer Family ログ |

**■ IAMユーザー（15名）**

| ユーザー名 | 作成日 | 種別推定 |
|---|---|---|
| kiyohara | 2025-06-23 | カスミ管理者 |
| cfn_user | 2025-07-04 | CloudFormation用サービスアカウント |
| daisuke.sasaki_s3access | 2025-07-28 | カスミ S3アクセス専用 |
| dattv | 2025-08-01 | Luvina開発者 |
| manhnd-serviceaccess | 2025-08-01 | Luvinサービスアカウント |
| posusmhprd | 2025-05-27 | USMH連携用サービスアカウント |
| kiyohara_s3access | 2025-08-14 | カスミ S3アクセス専用（2つ目） |
| pos_prd_vangle_sonln | 2026-01-23 | Vangle社 sonln |
| pos_prd_vangle_tuannv | 2026-01-23 | Vangle社 tuannv |
| buithephong | 2026-01-07 | Luvina phong（S3バケット作成者） |
| locnt_deploy | 2026-03-02 | Luvina locnt デプロイ用 |
| nangld_admin | 2026-03-02 | Luvina nangld 管理者 |
| nangld_readonly | 2026-03-02 | Luvina nangld 読み取り専用 |
| locnt_cli_deploy | 2026-03-09 | Luvina locnt CLI用（昨日作成） |
| dattv_cli_deploy | 2026-03-09 | Luvina dattv CLI用（昨日作成） |

## 26. Secrets Manager（7件）

| シークレット名 | 最終更新 | 用途 |
|---|---|---|
| ksm-posprd-sm-db | 2025-06-20 | RDS(writer)接続情報 |
| ksm-posprd-sm-db-replica | 2025-06-20 | RDS(replica)接続情報 |
| ksm-posprd-sm-sftp | 2025-06-20 | SFTP認証情報 |
| prd/Mail_Kasumi | 2025-08-01 | メール送信認証情報 |
| prd/Batch_Kasumi | 2025-08-01 | バッチ処理用認証情報 |
| prd/Replica_Kasumi | 2025-08-01 | レプリカDB認証情報 |
| prd/Replica_Kasumi_RO | 2025-08-14 | レプリカDB読み取り専用（新規発見） |

## 27. 未使用・空サービス（PRD）

| サービス | 状態 |
|---|---|
| Glue | ジョブなし（空） |
| Location Service | なし |
| Direct Connect | なし（VPN接続のみ） |
| Payment Cryptography | なし |
| X-Ray | Defaultグループのみ（実質未設定） |


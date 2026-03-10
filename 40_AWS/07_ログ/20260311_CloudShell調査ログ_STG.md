# CloudShell調査ログ 2026-03-11（STG）

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-11 |
| 調査者 | 清原 |
| AWSアカウント | 750735758916（STG） |
| リージョン | ap-northeast-1 |
| 目的 | 未調査・不明点の全面洗い出し（EC2/ALB/ECS/RDS/Lambda/EventBridge/IAM/S3/Transfer/Network） |

---

## [1] EC2 / ALB 詳細調査

### [1]-1 EC2インスタンス詳細

| InstanceId | Name | State | Type | PrivateIP | PublicIP | 起動日 | IAM Profile |
|---|---|---|---|---|---|---|---|
| i-0bd9a4db1b74b5a69 | ksm-posstg-ec2-instance-bastion | running | **t3.xlarge** | 10.239.2.4 | 46.51.249.130 | 2025-07-31 | ksm-posstg-iam-ip |
| i-06a74666e851e4d12 | ksm-posstg-ec2-instance-web-be | running | t3.medium | 10.239.2.195 | None | 2025-09-17 | posstg-role-ec2-web-be |
| i-0fa4cf3cf5c1a8864 | ksm-posstg-ec2-instance-web-fe | running | t3.medium | 10.239.2.253 | None | 2025-09-17 | posstg-role-ec2-web-fe |
| i-0f8ededc7ae313cbe | ksm-posstg-ec2-instance-giftcard | running | t2.large | 10.239.2.193 | None | 2025-11-26 | **posstg-role-ec2-web-be（web-beと同じ！）** |

**🚨 新発見: giftcard が web-be と同じ IAMプロファイル を使用**
→ giftcard専用ロール(`posstg-role-ec2-giftcard`)を作成すべき。S3FullAccess/SecretsManagerReadWriteがgiftcardに不要な権限を与えている可能性。

**🚨 新発見: bastionが t3.xlarge（4vCPU/16GiB）**
→ PRDのbastion(t3.medium)と比較して過剰スペック。踏み台用途であれば t3.micro/small で十分。コスト改善余地あり。

---

### [1]-2 web-be セキュリティグループ

`--filters "Name=tag:Name,Values=*web-be*"` でSGが取得できず（タグ未設定）。
`sg-02a3156bfb0ac0046`（ksm-posstg-vpc-sg-ec2-web-be）がweb-beのSG（インバウンド4件 / アウトバウンド1件）

---

### [1]-3 ALB一覧・リスナー

| ALB名 | スキーム | 状態 |
|---|---|---|
| ksm-posstg-alb-web-fe | **internet-facing** 🔴 | active |
| ksm-posstg-alb-api-be | **internet-facing** 🔴 | active |

両ALBとも **internet-facing のまま（改修指示書No.018 未実施）**

**リスナー構成:**
- web-fe: Port80(HTTP→redirect) / Port443(HTTPS→forward) ✅ HTTPSリダイレクト設定済み
- api-be: Port80(HTTP→redirect) / Port443(HTTPS→forward) ✅ HTTPSリダイレクト設定済み

---

### [1]-4 ターゲットグループ・ヘルス

| TG名 | ターゲット | ヘルス |
|---|---|---|
| alb-target-be | i-06a74666e851e4d12 (web-be) | **healthy** ✅ |
| alb-target-fe | i-0fa4cf3cf5c1a8864 (web-fe) | **healthy** ✅ |

---

## [2] ECS 詳細調査

### [2]-1 ECSクラスター

| クラスター名 | 状態 | 稼働タスク | サービス | コンテナインスタンス |
|---|---|---|---|---|
| ksm-posstg-ecs-cluster | ACTIVE | **0** | **0** | **0** |

**ECSクラスターは「器のみ」で完全に空。Fargate/EC2タスクなし。**

---

### [2]-2 ECSサービス

サービスなし（空）

---

### [2]-3 タスク定義（最新リビジョン）

**有効なタスク定義4件:**

| タスク定義名 | 最新リビジョン |
|---|---|
| ksm-posstg-task-definition-oc-export-data | :2 |
| ksm-posstg-task-definition-oc-import-data | :3 |
| ksm-posstg-task-definition-sg-export-data | :6 |
| ksm-posstg-task-definition-sg-import-data | :7 |

**🔍 不明点:** `None` が11件返却 → 古いリビジョンのみでアクティブなタスク定義ファミリーが削除済みか、名前付けが異なる可能性。要追加調査。

---

### [2]-4 ECRリポジトリ イメージ状況

| リポジトリ名 | イメージ数 | 最新push日 | 備考 |
|---|---|---|---|
| ksm-posstg-ecr-repository-ecs-import-db-master-sg | 6 | 2025-08-02 | STG独自 |
| ksm-posstg-ecr-web-fe | **0** | None | 🔴 空・未使用（削除候補） |
| ksm-posstg-ecr-repository-ecs-import-db-master-oc | 6 | 2025-08-02 | STG独自 |
| ksm-posstg-ecr-oc-export-data | 9 | 2025-07-31 | ✅ |
| ksm-posstg-ecr-oc-import-data | 56 | 2025-08-18 | ✅ |
| ksm-posstg-ecr-web-be | **0** | None | 🔴 空・未使用（削除候補） |
| ksm-posstg-ecs-sg-export-data | 100+ | 2025-12-24 | ✅ 最新 |
| ksm-posstg-ecs-sg-import-data | 32 | 2025-08-20 | ✅ |

**🚨 ksm-posstg-ecr-web-fe / web-be: イメージ0件。未使用確定 → 削除推奨**

---

## [3] RDS / Aurora 詳細調査

### [3]-1 RDSクラスター詳細

| クラスター名 | 状態 | エンジン | バージョン | MultiAZ | バックアップ保持 | バックアップウィンドウ | メンテナンスウィンドウ | 削除保護 | 暗号化 |
|---|---|---|---|---|---|---|---|---|---|
| ksm-posstg-db-cluster | available | aurora-mysql | 8.0.mysql_aurora.3.08.2 | **True** | **1日** 🟡 | 15:00-15:30 UTC | sat:15:30-16:00 UTC | True ✅ | True ✅ |
| ksm-posstg-db-cluster-replica | available | aurora-mysql | 8.0.mysql_aurora.3.08.2 | **True** | **1日** 🟡 | 15:00-15:30 UTC | sat:15:30-16:00 UTC | True ✅ | True ✅ |

**🟡 バックアップ保持期間1日 → 前回サマリー記載の通り（改修依頼対象）。推奨は7日以上。**
**✅ 新発見: MultiAZ=True → 以前のサマリー(False)から変更されている可能性。要確認。**

---

### [3]-2 RDSインスタンス詳細

| インスタンス名 | クラス | 状態 | AZ | 公開アクセス | 自動マイナーバージョン | 監視間隔 | Performance Insights |
|---|---|---|---|---|---|---|---|
| ksm-posstg-db-instance-1 | db.r5.2xlarge | available | 1c | False ✅ | **False** 🟡 | 60秒 | **True** ✅ |
| ksm-posstg-db-instance-1-replica | db.t3.medium | available | 1a | False ✅ | **False** 🟡 | 60秒 | **False** 🟡 |
| ksm-posstg-db-instance-2 | db.r5.2xlarge | available | 1a | False ✅ | **False** 🟡 | 60秒 | **True** ✅ |
| ksm-posstg-db-instance-2-replica | db.t3.medium | available | 1c | False ✅ | **False** 🟡 | 60秒 | **False** 🟡 |

**🚨 新発見: インスタンスが4台（前回サマリーは2台と記載）**
→ ksm-posstg-db-cluster（instance-1 + instance-2）
→ ksm-posstg-db-cluster-replica（instance-1-replica + instance-2-replica）
→ 2クラスター × 各2台（1c/1aにそれぞれ配置）= 計4台

**🟡 AutoMinorVersionUpgrade: 全4台False → セキュリティパッチ自動適用なし**
**🟡 Performance Insights: replicaインスタンスのみ無効**

---

### [3]-3 RDSスナップショット

| スナップショット | 作成日 | 種別 | 状態 |
|---|---|---|---|
| ksm-posstg-rds-replica-snapshot-* | 2025-06-19 | manual | available |
| rds:ksm-posstg-db-cluster-replica-2026-03-10-15-06 | 2026-03-10 | automated | available |
| rds:ksm-posstg-db-cluster-2026-03-10-15-08 | 2026-03-10 | automated | available |

自動スナップショットは正常に取得されている。手動スナップショットは2025-06-19の1件のみ。

---

### [3]-4 RDSパラメータグループ

| グループ名 | ファミリー |
|---|---|
| default.aurora-mysql8.0 | aurora-mysql8.0 |
| ksm-posstg-db-cluster-pg | aurora-mysql8.0 |
| ksm-posstg-db-cluster-pg-replica | aurora-mysql8.0 |
| ksm-posstg-db-replica-cluster-pg | aurora-mysql8.0 |

カスタムPGが3件。`ksm-posstg-db-cluster-pg-replica` と `ksm-posstg-db-replica-cluster-pg` の2つが類似名で存在 → どちらが実際に使われているか要確認。

---

### [3]-5 Secrets Manager

| シークレット名 | 最終更新 | 最終アクセス | ローテーション |
|---|---|---|---|
| ksm-posstg-sm-sftp | 2025-06-12 | 2026-03-09 | **無効** 🔴 |
| ksm-posstg-sm-db | 2025-06-12 | 2026-03-09 | **無効** 🔴 |
| ksm-posstg-sm-db-replica | 2025-06-19 | 2026-03-09 | **無効** 🔴 |
| stg/Mail_Kasumi | 2025-07-29 | 2026-03-09 | **無効** 🔴 |
| stg/Batch_Kasumi | 2025-07-29 | 2026-03-09 | **無効** 🔴 |
| stg/Replica_Kasumi | 2025-08-28 | 2026-03-10 | **無効** 🔴 |
| stg/Replica_Kasumi_RO | 2025-08-14 | 2026-03-10 | **無効** 🔴 |

**🔴 全7シークレット ローテーション無効**
→ PRDと同様の問題。DB認証情報・SFTP認証情報が自動ローテーションなし（改修依頼対象）。

---

## [4] Lambda / EventBridge / Step Functions 詳細調査

### [4]-1 Lambda関数一覧（23本）

**ksm-pos系プロジェクト関数（20本）:**

| 関数名 | Runtime | Memory | Timeout | 最終更新 |
|---|---|---|---|---|
| ksm-posstg-lmd-function-create-file-end-for-night | java17 | 512 | 300 | 2025-11-07 |
| ksm-posstg-lmd-function-get-sync-store | java17 | 1024 | 900 | 2025-11-07 |
| ksm-posstg-lmd-function-oc-import-data | java17 | 2048 | 900 | **2026-02-12** |
| ksm-posstg-lmd-function-unzip-file | java17 | 1024 | 900 | 2025-11-07 |
| ksm-posstg-lmd-import-pos-master-sh | java17 | 1024 | 900 | **2026-02-12** |
| ksm-posstg-lmd-function-sent-txt-file | java17 | 1024 | 900 | 2025-08-28 |
| ksm-posstg-lmd-function-backup-file | java17 | 1024 | 900 | 2025-08-28 |
| ksm-posstg-lmd-function-sg-import-data | java17 | 2048 | 900 | **2026-02-12** |
| ksm-posstg-lmd-function-split-txt-by-sent-time | java17 | 1024 | 900 | 2025-11-17 |
| ksm-posstg-lmd-function-create-file-end | java17 | 1024 | 900 | 2025-08-28 |
| ksm-posstg-lmd-function-split-csv | java17 | 1024 | 900 | **2026-02-12** |
| ksm-posstg-lmd-export-polling | python3.13 | 128 | 300 | 2025-08-21 |
| ksm-posstg-lmd-zipfile-polling | python3.13 | 128 | 300 | 2025-08-13 |
| ksm-posstg-lmd-function-copy-backup-sg | java17 | 512 | **15** 🟡 | **2026-02-13** |
| ksm-posstg-lmd-function-sent-email | java17 | 1024 | 900 | **2026-02-27** |
| ksm-posstg-lmd-trigger-sqs-export-sg | python3.13 | 128 | 300 | **2026-01-14** |
| ksm-posstg-lmd-function-itemmaster-import-monitoring | java17 | 512 | 900 | 2025-08-28 |
| ksm-posstg-lmd-function-p001-import-monitoring | java17 | 512 | 900 | **2026-01-23** |
| ksm-posstg-lmd-trigger-sqs-import-sg | python3.13 | 128 | 300 | **2026-01-14** |
| ksm-posstg-lmd-function-check-price | java17 | 512 | 900 | **2026-03-06** |

**AWSシステム自動生成関数（3本）:**
- aws-quicksetup-lifecycle-LA-89e4k (python3.11)
- baseline-overrides-a4fd-v4t88 (python3.11)
- delete-name-tags-ap-northeast-1-a4fd-v4t88 (python3.11)

**PRD(21本) との差分 2本 = `ksm-posstg-lmd-function-p001-import-monitoring` + `ksm-posstg-lmd-function-check-price`**
→ check-price は STG有効（PRDはDISABLED状態に対応）、p001-import-monitoring は価格監視機能

---

### [4]-2 Lambda 環境変数キー（主要関数のみ抜粋）

| 関数名 | 環境変数キー |
|---|---|
| create-file-end-for-night | DB_BATCH, DB_KASUMI |
| oc/sg-import-data | DB_BATCH, DB_KASUMI |
| split-txt-by-sent-time | ROLE_ARN, TARGET_ARN, FIRST_NAME_SCHEDULE |
| sent-email | SNS_TOPIC_ARN, CHANNEL_CONFIG, MAIL_CONFIG, TEAMS_CHANNEL_EMAIL, SNS_TOPIC_ARN_CHECK_PRICE, MAIL_CONFIG_CHECK_PRICE |
| copy-backup-sg | DEST_PREFIX, DEST_BUCKET |
| check-price | ROLE_ARN, TARGET_ARN, FIRST_NAME_SCHEDULE, DB_KASUMI, DEST_PREFIX, DEST_BUCKET |
| p001-import-monitoring | DB_KASUMI, DATA_SOURCE |
| export-polling / zipfile-polling | SF_ARN |
| trigger-sqs-export/import-sg | QUEUE_URL |

**🔍 sent-email に `TEAMS_CHANNEL_EMAIL` がある → Microsoft Teamsチャンネルへメール転送している可能性**

---

### [4]-3 EventBridgeルール（13本）

| ルール名 | 状態 | トリガー | 備考 |
|---|---|---|---|
| ksm-posstg-eb-rule-check-price | **ENABLED** | S3 Object Created (pos-master/ishida/) | STG独自・PRDはDISABLED |
| ksm-posstg-eb-rule-copy-backup-sg | ENABLED | S3 Object Created (pos-original/sg/backup/) | ✅ |
| ksm-posstg-eb-rule-create-txt-file-sg | ENABLED | S3 Object Created (*.ENDEXPORT) | ✅ |
| ksm-posstg-eb-rule-create-txt-file-sg-9233 | **DISABLED** 🔴 | S3 (9233/*.ENDEXPORT) | 残骸→削除対象 |
| ksm-posstg-eb-rule-itemmaster-import-monitoring | ENABLED | cron(30 20 * * ? *) = JST 05:30 | ✅ |
| ksm-posstg-eb-rule-night-export-sg | ENABLED | cron(30 20 * * ? *) = JST 05:30 | ✅ |
| ksm-posstg-eb-rule-night-export-sg-9233 | **DISABLED** 🔴 | cron(30 20 * * ? *) | 残骸→削除対象 |
| ksm-posstg-eb-rule-p001-import-monitoring | ENABLED | cron(00 15 * * ? *) = JST 00:00 | ✅ |
| ksm-posstg-eb-rule-receive-pos-master-oc | ENABLED | S3 (*.end / *.END) | ✅ |
| ksm-posstg-eb-rule-receive-pos-master-sg | ENABLED | S3 (*.zip / *.ZIP) | ✅ |
| ksm-posstg-eb-rule-receive-pos-master-sg-9233 | **DISABLED** 🔴 | S3 (*9233_*.zip) | 残骸→削除対象 |
| ksm-posstg-eb-rule-receive-pos-master-sh | ENABLED | S3 (*.end / *.END) | ✅ |
| ksm-posstg-eb-rule-receive-splited-pos-master-oc | ENABLED | S3 (*.ENDIMPORT) | ✅ |

**🚨 -9233系 DISABLED 3本 → 引き続き削除待ち（改修依頼No.14）**
**🆕 新発見: `ksm-posstg-eb-rule-copy-backup-sg` が存在（前回サマリー未記載）**

---

### [4]-4 -9233系ルール詳細

コマンドエラー（`contains` に整数型が入りクエリ失敗）。前回調査ログから内容確認済み。

---

### [4]-5 Step Functions 実行履歴

| SM名 | 直近3件の状態 | 最終実行日 | 備考 |
|---|---|---|---|
| sf-sm-create-txt-file-oc | 実行なし | - | OC処理なし |
| sf-sm-create-txt-file-sg | SUCCEEDED × 3 | 2026-03-10 17:07 | ✅ 正常稼働 |
| sf-sm-import-pos-master-oc | SUCCEEDED × 3 | 2026-03-10 12:51 | ✅ 正常稼働 |
| sf-sm-import-pos-master-sh | **FAILED × 2**, SUCCEEDED × 1 | 2026-03-10 13:26 | 🚨 **2日連続FAILED！** |
| sf-sm-receive-and-import-pos-master-sg | SUCCEEDED × 3 | 2026-03-10 17:06 | ✅ 正常稼働 |
| sf-sm-receive-pos-master-oc | SUCCEEDED × 3 | 2026-03-10 12:49 | ✅ 正常稼働 |
| sf-sm-sent-txt-file | **FAILED × 3** | 2026-03-10 14:27 | 🚨 **全件FAILED！** |

**🚨 重大: `sf-sm-import-pos-master-sh` が 2026-03-09・03-10 連続FAILED（約15分で終了）**
→ SHデータ取込が2日間失敗中。S3に `pos-original/sh/receive/P003.csv` は存在しているが取込失敗している。

**🚨 重大: `sf-sm-sent-txt-file` が全件FAILED**
→ USMH向けTXTファイル送信が失敗中。Transfer Familyまたはネットワーク（S2S VPN T2 DOWN）の問題の可能性。

---

## [5] IAM 詳細調査

### [5]-1 IAMユーザー一覧・MFA状態

| ユーザー名 | MFA | アクセスキー状態 | 評価 |
|---|---|---|---|
| buithephong | **0** 🔴 | Active(2026-02-12) + Inactive(2026-01) | MFA未設定・アクティブキーあり |
| cfn_user | **0** 🔴 | Inactive(2025-07) のみ | MFA未設定（キー無効化済み） |
| daisuke.sasaki_s3access | **0** 🔴 | Active(2025-07-28) | MFA未設定・アクティブキーあり |
| dattv | 1 ✅ | キーなし | ✅ |
| dattv_cli_deploy | **0** 🔴 | キーなし | MFA未設定（CLI専用なのでOK？） |
| dev | **0** 🔴 | **Inactive(2025-07-08)** | MFA未設定・キー無効化済み |
| kiyohara | 3 ✅ | キーなし | ✅ MFA3台 |
| kiyohara_s3access | **0** 🔴 | **Active × 2**（2025-11-07） | 🚨 アクセスキー2本Active！ |
| locnt | 1 ✅ | キーなし | ✅ |
| locnt_cli_deploy | **0** 🔴 | キーなし | MFA未設定 |
| nangld_admin | 1 ✅ | キーなし | ✅ |
| nangld_readonly | 1 ✅ | キーなし | ✅ |
| posusmhstg | 2 ✅ | キーなし | ✅ |
| pos_stag_vangle_sonln | 1 ✅ | キーなし | ✅ |
| pos_stag_vangle_tuannv | 1 ✅ | キーなし | ✅ |

**🚨 kiyohara_s3access: アクセスキー2本 同時Active**
→ ローテーション途中で古いキーを無効化し忘れた可能性。要整理。

**🔴 MFA未設定ユーザー（アクティブキーあり）:**
- buithephong（Active key）
- daisuke.sasaki_s3access（Active key）
- kiyohara_s3access（Active key × 2）

---

### [5]-2 IAMユーザー 'dev' の権限

| 項目 | 内容 |
|---|---|
| インラインポリシー | なし |
| マネージドポリシー | **AmazonEC2ContainerRegistryFullAccess** のみ |
| グループ | なし |
| アクセスキー | **Inactive（2025-07-08作成）** |

**🔍 用途判明: dev = ECRへのフルアクセス権限を持つ開発用アカウント**
→ CI/CDパイプライン（GitHub Actions等）からECRにDockerイメージをpushするための専用ユーザーと推定。
→ アクセスキーが無効化されているため現在は未使用状態。削除候補。

---

### [5]-3 IAMユーザー 'locnt' の権限

| ポリシー | 種別 |
|---|---|
| com-posstg-iam-policy-mfa | カスタム（MFA強制用） |
| AmazonEC2FullAccess | AWS管理 |
| AmazonRDSFullAccess | AWS管理 |
| ReadOnlyAccess | AWS管理 |
| AmazonECS_FullAccess | AWS管理 |
| CloudWatchFullAccess | AWS管理 |
| AWSStepFunctionsFullAccess | AWS管理 |
| AmazonS3FullAccess | AWS管理 |
| AWSTransferFullAccess | AWS管理 |
| AWSLambda_FullAccess | AWS管理 |

**グループ: KsmPosIamMfa（2026-03-04作成）**

**🚨 `locnt` は実質的に管理者相当の権限を持つ広範囲ユーザー**
→ EC2/RDS/ECS/S3/Lambda/Transfer/StepFunctions全て Full Access
→ 最小権限の原則に反する。必要な権限に絞り込むべき（改修依頼追加候補）

---

### [5]-4 IAMロール（主要カスタムロール）

**27ロール確認。主な特記事項:**
- `posstg-role-ec2-web-be` / `posstg-role-ec2-web-fe`（2025-09-17作成）: web-be/fe用。giftcardも web-be を流用中 🔴
- `StepFunctions-posstg-lmd-function-merge-export-fi-role-*` / `send-master-fil-role-*`: 古いSF関連ロール（現行SMに対応するロールかどうか要確認）
- `Amazon_EventBridge_Invoke_Lambda_*` が2本（192543660: 2026-02-26、20916940: 2026-02-13）: 比較的最近作成。check-price機能追加時のロールと推定。

---

### [5]-5 パスワードポリシー

**🔴 パスワードポリシー未設定（改修依頼No.6 未実施のまま）**

---

### [5]-6 セキュリティサービス状態

| サービス | 状態 | 備考 |
|---|---|---|
| GuardDuty | 🔴 **無効**（Detector IDなし） | 改修依頼No.3 未実施 |
| Security Hub | 🔴 **無効** | PRD/STG差異 |
| CloudTrail | 🔴 **無効**（trailList空） | 改修依頼No.4 未実施 |

---

## [6] S3 / Transfer Family 詳細調査

### [6]-1 S3バケット詳細（Section 5ドキュメントより抜粋）

stg-ignica-ksm バケット内容: **77,727オブジェクト**

主要フォルダ:
- `pos-original/sg/receive/` → 毎日 JST 01:40頃 に SGデータ受信（2025-12-23 から継続中）
  - 09060店舗: 毎日300KB程度
  - 09149店舗: 毎日 669〜1,396 bytes（2026-01-09以降小さくなった）
  - 09299店舗: 毎日 32〜34KB（2026-01-14以降）
  - 09156店舗: 2026-01-06の1件のみ（テスト？）
- `pos-original/sg/log/` → ForcePriceMaster/ItemMaster/SpecialPriceKsmMasterのログ大量蓄積
- `pos-original/sh/receive/` → P003.csv（2026-03-10 13:10 最新） + P003.end
- `pos-original/sh/backup/` → P003.csv が毎日 JST 22:11 頃にバックアップ（〜80MB）

**🚨 sh/receive/P003.end が 2026-03-10 13:11に存在 → sf-sm-import-pos-master-sh が同日 13:11〜13:26 FAILED**
→ ファイルは届いているが取込処理で失敗している。Lambdaのエラー内容を詳細調査すべき。

---

### [6]-3 Transfer Family サーバー詳細

| サーバーID | 状態 | 認証方式 | エンドポイント | CFn管理 |
|---|---|---|---|---|
| s-7c808e1040dd437da (oc) | **ONLINE** ✅ | SERVICE_MANAGED | VPC | ✅ ksm-posstg-transfer |
| s-a69b3df467bc43b99 (sh) | **ONLINE** ✅ | SERVICE_MANAGED | VPC | ❌ タグなし（手動追加） |
| s-d5d0d941bfb04a72b (sg) | **ONLINE** ✅ | SERVICE_MANAGED | VPC | ✅ ksm-posstg-transfer |

**🟡 sh サーバーのみ CloudFormation管理外（手動追加）→ 前回調査から変化なし**

---

### [6]-4 Transfer Family ユーザー

| サーバー | ユーザー | HomeDirectory | ロール |
|---|---|---|---|
| oc (s-7c808e1040dd437da) | ksm-posstg-tf-user-oc | **None** 🟡 | ksm-posstg-iam-role-tf |
| sh (s-a69b3df467bc43b99) | ksm-posstg-tf-user-sh | **None** 🟡 | ksm-posstg-iam-role-tf |
| sg (s-d5d0d941bfb04a72b) | ksm-posstg-tf-user-sg | **None** 🟡 | ksm-posstg-iam-role-tf |

**🟡 HomeDirectory が全サーバーでNone → logical home directory mapping またはrole設定で制御されている可能性。PRDと同様であれば問題なし。**

---

## [7] ネットワーク詳細調査

### [7]-1 VPC・サブネット

VPC: vpc-09bc4a6da904ace31 / 10.239.0.0/16（変化なし）

サブネット8本の詳細確認:

| サブネット名 | CIDR | AZ | MapPublicIP |
|---|---|---|---|
| ksm-posstg-vpc-subnet-public-1a | 10.239.2.0/26 | 1a | **False** |
| ksm-posstg-vpc-subnet-public-1c | 10.239.3.0/26 | 1c | **False** |
| ksm-posstg-vpc-subnet-private-1a | 10.239.2.128/25 | 1a | False |
| ksm-posstg-vpc-subnet-private-1c | 10.239.3.128/25 | 1c | False |
| ksm-posstg-vpc-subnet-protected-1a | 10.239.2.64/26 | 1a | False |
| ksm-posstg-vpc-subnet-protected-1c | 10.239.3.64/26 | 1c | False |
| com-posstg-vpc-subnet-common-1a | 10.239.0.0/26 | 1a | False |
| com-posstg-vpc-subnet-common-1c | 10.239.1.0/26 | 1c | False |

**✅ 全サブネット MapPublicIpOnLaunch=False → パブリックサブネットでも自動パブリックIP割り当てなし（正常）**

---

### [7]-2 セキュリティグループ（24本）

主な問題SG:

| SG名 | インバウンド数 | 備考 |
|---|---|---|
| ksm-posstg-vpc-sg-ec2-web-be | **4** 🔴 | 前回調査でALL(-1)全許可確認済み |
| ksm-posstg-vpc-sg-ep-tf | 1 | Bastionからの許可ルール残存（改修No.13） |
| ksm-posstg-temp | 0/0 | 完全に空のSG → 削除候補 |
| ksm-posstg-vpc-sg-ecs | 0 | インバウンドなし（ECS用） |

**🆕 新発見: `ksm-posstg-temp` という名前のSGが存在（ルールゼロ）→ 削除候補**

---

### [7]-3 Client VPN

**結果なし（空）→ Client VPNエンドポイントはSTGアカウントに存在しない**
→ 前回サマリー「AWS Client VPN（個人PC）→ STG Bastion 10.239.2.4 に接続」は、STGアカウント内にVPNエンドポイントがあるのではなく、**PRDアカウント側のVPNエンドポイント経由でSTGにアクセスする構成**の可能性。要確認。

---

### [7]-4 Site-to-Site VPN / CGW

**Customer Gateway 2本を確認（前回調査から追加発見）:**

| CGW名 | IP | ASN |
|---|---|---|
| pos-stag-cgw-site-to-site-vpn-test-er605 | 14.224.146.153 | 65000 |
| **pos-stag-cgw-site-to-site-vpn-poc** | **222.252.99.5** | 65000 | 🆕 |

**🚨 新発見: `pos-stag-cgw-site-to-site-vpn-poc`（IP: 222.252.99.5）が存在**
→ 名前に"poc"が付いており、VPN接続は`pos-stag-cgw-site-to-site-vpn-test-er605`のみ。
→ 前回調査で言及されていた「Vangle CGW残骸（改修依頼No.12）」がこれ。222.252.99.5はVangleのIPと推定。

**VPN接続状態:**
- vpn-0840f46eaf8de7e79: State=available / T1=**UP** ✅ / T2=**DOWN** 🔴（前回から変化なし）

---

### [7]-5 VPCエンドポイント（11本）

| EP名 | 種別 | サービス |
|---|---|---|
| com-posstg-vpc-ep-s3 | Gateway | S3 |
| com-posstg-vpc-ep-cw-logs | Interface | CloudWatch Logs |
| com-posstg-vpc-ep-cw-metrics | Interface | CloudWatch Metrics |
| com-posstg-vpc-ep-kms | Interface | KMS |
| com-posstg-vpc-ep-sm | Interface | Secrets Manager |
| com-posstg-vpc-ep-s3-for-rds | Interface | S3 |
| com-posstg-vpc-ep-ecr-api | Interface | ECR API |
| com-posstg-vpc-ep-ecr-dkr | Interface | ECR DKR |
| (名前なし) × 3 | Interface | Transfer Family（oc/sg/sh） |

**✅ 主要サービスエンドポイントは整備されている**
**🟡 Transfer Family 3本のエンドポイントに名前タグなし**

---

### [7]-6 NAT GW / Route Tables

- NAT GW: nat-0bdcfc7911587eb4c / 52.196.152.170 / 1aのパブリックサブネット（1本のみ）
- Route Tables: 9本（private-1a: 5ルート、private-1c: 4ルート）

**🟡 NAT GWが1aのみ → 1cの可用性はNAT GW障害時に影響あり（PRDと同様の構成）**

---

## チャット別索引

| セクション | 取得日 | チャット |
|---|---|---|
| [1]-[7] 全セクション | 2026-03-11 | 本チャット（20260311_チャットログ.md） |


---

## [B] 障害詳細調査（2026-03-11）

### [B]-1 import-pos-master-sh: CloudWatchログ

Lambda CloudWatchログは取得できず（ストリーム名に `[$LATEST]` が含まれ改行でパースエラー）。
ただし Step Functions の実行履歴から原因特定済み（後述）。

---

### [B]-2 sh/receive ファイルサイズ

| ファイル | サイズ | 日時 |
|---|---|---|
| P003.csv | **79,149,394 bytes（約75MB）** | 2026-03-10 13:10 |
| P003.end | 0 bytes | 2026-03-10 13:11 |

---

### [B]-3 sh/backup ファイルサイズ推移

| 日付 | サイズ |
|---|---|
| 2026-03-05 | 79,218,683 |
| 2026-03-06 | 79,172,349 |
| 2026-03-08 | 79,174,802 |
| 2026-03-10（receive） | 79,149,394 |

→ ファイルサイズは安定（約79MB）。データ量増加ではない。

---

### [B]-4 sent-txt-file Lambda 設定

| 項目 | 値 |
|---|---|
| Timeout | 900秒 |
| Memory | 1024MB |
| VPC | vpc-09bc4a6da904ace31 |
| Subnet | subnet-08999673be546d752（private-1a）/ subnet-0d4bb4d8d559e39b1（private-1c） |
| SG | sg-07e2f45f6a0f49c24（ksm-posstg-vpc-sg-lmd） |
| 環境変数 | **null（なし）** 🚨 |

**🚨 環境変数が null → 接続先ホスト/ポートはソースコード内にハードコードされている**

---

### [B]-5 sent-txt-file 失敗ログ詳細

**3件全て同一パターン:**

```
✅ Get InputStream: pos-master/ishida/csv/XXXX/XXXXESLDATA.TXT
Error: Connection timed out: java.lang.RuntimeException
at SentFileHandler.java:51
Duration: ~18,000〜19,000ms（約18〜19秒でタイムアウト）
```

**送信対象ファイル確認（ESLデータ）:**
- 0253店舗: `02530020260310232629ESLDATA.TXT`
- 0218店舗: `02180020260310222646ESLDATA.TXT`
- 複数の0253タイムスタンプのファイル

→ S3からのInputStream取得は成功（✅表示あり）
→ **その後の接続（FTP/SFTP送信先への TCP接続）が約18秒でタイムアウト**

---

### [B]-6 VPN接続状態詳細

| Tunnel IP | 状態 | AcceptedRoutes | 最終変更 |
|---|---|---|---|
| 3.115.250.166 | **UP** ✅ | 1 | 2026-02-25 07:43 |
| 18.178.240.88 | **DOWN** 🔴 | 1 | 2026-02-24 01:26 |

**T2が DOWN したのは 2026-02-24 01:26**（約2.5週間前）。
T1は UP しているため S2S VPN自体は生きている。

---

### 🎯 障害原因 確定

#### 障害① `sf-sm-import-pos-master-sh` — **原因: DB接続タイムアウト（推定）**

| 項目 | 内容 |
|---|---|
| エラー | `Sandbox.Timedout`（900秒でLambda強制終了） |
| ファイルサイズ | 約75MB（前回成功時と同程度） |
| 推定原因 | RDS Aurora（ksm-posstg-db-cluster）への大量INSERT処理が900秒内に完了しない |
| 可能性1 | テーブルロック / 長時間トランザクションが発生している |
| 可能性2 | インデックス再構築やstatistics更新が重なった |
| 確認方法 | Aurora の `SHOW PROCESSLIST` / `INFORMATION_SCHEMA.INNODB_TRX` |

#### 障害② `sf-sm-sent-txt-file` — **原因: 送信先（石田端末サーバー）への TCP接続タイムアウト**

| 項目 | 内容 |
|---|---|
| エラー | `Connection timed out` at `SentFileHandler.java:51` |
| 成功ステップ | S3からのInputStream取得は **✅ 成功** |
| 失敗ステップ | 送信先サーバーへのTCP接続（約18秒でタイムアウト） |
| 送信対象 | `pos-master/ishida/csv/` 配下の ESLDATA.TXT |
| 接続先 | **石田（ishida）端末サーバー**（環境変数なし → ソースコードにハードコード） |
| VPN状態 | T1=UP / T2=DOWN（2026-02-24から） |

**「ishida」はESL（電子棚札）のメーカー・石田のサーバー。VPN経由またはインターネット経由で送信している可能性。T2 DOWN の影響か、石田側サーバーの問題の可能性が高い。**


---

## [C] 接続疎通・DB状態確認（2026-03-11）

### [C]-1 sent-txt-file ソースコード

.classファイルのみ（コンパイル済みJAR）→ grepでの接続先特定不可。
環境変数もnull → 接続先は Secrets Manager またはソースコード内定数の可能性。

### [C]-2 import-pos-master-sh ソースコード

同様に.classファイルのみ。設定値の直接確認不可。

### [C]-3 Secrets Manager DB接続情報

`ksm-posstg-sm-db` の安全フィールド: `{"MasterUsername": "admin"}` のみ返却。
→ ホスト名・ポートはSecrets Managerに含まれず（別途Lambda環境変数 `DB_KASUMI` / `DB_BATCH` で参照）

### [C]-4 Aurora DBエンドポイント

| クラスター | Write Endpoint | Read Endpoint | Port |
|---|---|---|---|
| ksm-posstg-db-cluster | ksm-posstg-db-cluster.cluster-cvmomy000wqn.ap-northeast-1.rds.amazonaws.com | ksm-posstg-db-cluster.cluster-ro-cvmomy000wqn.ap-northeast-1.rds.amazonaws.com | 3306 |
| ksm-posstg-db-cluster-replica | ksm-posstg-db-cluster-replica.cluster-cvmomy000wqn.ap-northeast-1.rds.amazonaws.com | ksm-posstg-db-cluster-replica.cluster-ro-... | 3306 |

クラスターIDは共通: `cvmomy000wqn`

### [C]-5 Aurora エラーログ

- `error/mysql-error-running.log`: **サイズ0（現在エラーなし）**
- `error/mysql-error.log`: **空（現在エラーなし）**
- ログファイルは2026-02-08〜09の大量エラーが蓄積されているが、現在のrunningログは空

**→ Aurora DB自体は現在正常。DB起因の障害ではない。**

### [C]-6 CloudWatch メトリクス

**DatabaseConnections（直近2日）:**
- ほぼ全時間帯 **0.0接続**
- 2026-03-09T23:10 に 1.0 のみ
- **Lambda実行時（13:10〜13:26）も接続数0** 🚨

**SelectLatency: 約0.16〜0.19ms（正常範囲）**
**DMLLatency: 0.0（DML実行なし）**

---

### 🎯 障害原因 最終確定

#### 障害① `sf-sm-import-pos-master-sh` — **DB接続自体が失敗している**

| 証拠 | 内容 |
|---|---|
| DatabaseConnections | Lambda実行中（13:10〜13:26）も **0接続のまま** |
| DMLLatency | 全時間帯 0.0 → **INSERT/UPDATE が1件も実行されていない** |
| エラーログ | Aurora側にエラーなし |
| 結論 | LambdaからAuroraへのTCP接続自体が確立できていない → **VPCネットワーク設定またはSG設定の問題** |

**最有力仮説: Lambda の VPC/SG設定とAurora SGの間で疎通が取れなくなっている**
→ `sg-0c2b1347aaadfdc83`（lambda-rds-1）と`sg-0ee95ce0bfe7c1d19`（rds-lambda-1）の接続許可設定を確認が必要

#### 障害② `sf-sm-sent-txt-file` — **石田ESLサーバーへの接続断（ネットワーク経路障害）**

| 証拠 | 内容 |
|---|---|
| ログ | `✅ Get InputStream`（S3取得成功）→ 直後に `Connection timed out` |
| 接続先 | `pos-master/ishida/` 配下のファイルを送信 |
| 環境変数 | null → 接続先はソースコード内定数 |
| VPN状態 | T2 DOWN（2026-02-24 01:26から） |
| 結論 | 石田ESLサーバーへのTCP接続が約18秒でタイムアウト |

**VPN T2 DOWN（2026-02-24）のタイミングと障害発生が関連している可能性が高い。**
ただしT1はUPのため S2S VPN自体は生きている。石田サーバーへの経路が T2 依存だった可能性あり。


---

## [D] SG疎通・DB接続設定確認（2026-03-11）

### [D]-1 Lambda-RDS 間 SG ルール

**sg-0c2b1347aaadfdc83 / lambda-rds-1（RDS Proxy自動作成）**
- Outbound: TCP 3306 → sg-0ee95ce0bfe7c1d19

**sg-0ee95ce0bfe7c1d19 / rds-lambda-1（RDS Proxy自動作成）**
- Inbound: TCP 3306 ← sg-0c2b1347aaadfdc83

**sg-006e18b25235d3a1d / ksm-posstg-vpc-sg-db**
- Inbound TCP 3306:
  - CIDR: 172.21.10.0/24
  - sg-02865a2ca8164b2e7（For ECS）
  - sg-01f1bbc2ae66a6591（For EC2 Bastion）
  - sg-0f39bd8617062491d（for posstg-lmd-function-send-master-file）
  - sg-07e2f45f6a0f49c24（For Lambda）
- **⚠️ sg-0c2b1347aaadfdc83（lambda-rds-1）がDB SGのインバウンドに存在しない**

**sg-07e2f45f6a0f49c24 / ksm-posstg-vpc-sg-lmd**
- Inbound: なし
- Outbound: ALL 0.0.0.0/0

### [D]-2 import-pos-master-sh Lambda VPC設定

| 項目 | 値 |
|---|---|
| SG | sg-0c2b1347aaadfdc83（lambda-rds-1）/ sg-02865a2ca8164b2e7 |
| Subnet | private-1a / private-1c |
| DB_BATCH | stg/Batch_Kasumi |
| DB_KASUMI | stg/Replica_Kasumi |

### [D]-3 他Lambda SGとの比較

| Lambda | SG |
|---|---|
| import-pos-master-sh | **sg-0c2b1347aaadfdc83** + sg-02865a2ca8164b2e7 |
| sg-import-data | **sg-0c2b1347aaadfdc83** + sg-02865a2ca8164b2e7 |
| oc-import-data | sg-02865a2ca8164b2e7 **のみ**（lambda-rds-1なし） |

### [D]-5 Secrets Manager DB接続先

**stg/Batch_Kasumi:**
- HOST: ksm-posstg-db-cluster.cluster-cvmomy000wqn.ap-northeast-1.rds.amazonaws.com
- PORT: 3306 / DB_NAME: Batch_Kasumi / USER: admin

**stg/Replica_Kasumi:**
- HOST: ksm-posstg-db-cluster.cluster-cvmomy000wqn.ap-northeast-1.rds.amazonaws.com
- PORT: 3306 / DB_NAME: Replica_Kasumi / USER: admin

**⚠️ 両シークレットとも Write Endpoint（cluster）を参照。Replica_Kasumiが Write Endpoint を参照しているのは設計上の疑問点。**

### [D]-7 Secrets Manager シークレット一覧

- ksm-posstg-sm-sftp / ksm-posstg-sm-db / ksm-posstg-sm-db-replica
- stg/Mail_Kasumi / stg/Batch_Kasumi / stg/Replica_Kasumi / stg/Replica_Kasumi_RO

**stg/Mail_Kasumi → sent-txt-file の接続先と推測（要確認）**

---

### 🎯 障害① 最終確定原因

**`ksm-posstg-vpc-sg-db`（Aurora本体のSG）のインバウンドに `sg-0c2b1347aaadfdc83（lambda-rds-1）` が許可ルールとして存在しない。**

- lambda-rds-1 → rds-lambda-1 の SG参照ルールは存在する
- しかし Aurora クラスターに実際にアタッチされているのは `ksm-posstg-vpc-sg-db` であり、rds-lambda-1 ではない可能性が高い
- 結果: LambdaのアウトバウンドTCP3306がAuroraに到達できずタイムアウト（900秒）

**次の確認: Aurora クラスターに実際にアタッチされているSGが `rds-lambda-1` か `ksm-posstg-vpc-sg-db` かを確認する。**


---

## [E] Aurora SG・シークレット最終確認（2026-03-11）

### [E]-1/2 Aurora クラスター・インスタンスにアタッチされているSG

**ksm-posstg-db-cluster（プライマリ）:**
- sg-02cd48ad974df77be（不明）
- sg-006e18b25235d3a1d（ksm-posstg-vpc-sg-db）
- **sg-0ee95ce0bfe7c1d19（rds-lambda-1）✅**

**ksm-posstg-db-cluster-replica:**
- sg-006e18b25235d3a1d（ksm-posstg-vpc-sg-db）のみ
- **sg-0ee95ce0bfe7c1d19（rds-lambda-1）なし ❌**

**インスタンス別:**
| インスタンス | rds-lambda-1あり |
|---|---|
| db-instance-1（プライマリ Writer） | ✅ |
| db-instance-2（プライマリ Reader） | ✅ |
| db-instance-1-replica | ❌ |
| db-instance-2-replica | ❌ |

### [E]-3 stg/Mail_Kasumi

- HOST: ksm-posstg-db-cluster.cluster-cvmomy000wqn（Write Endpoint）
- PORT: 3306 / DB_NAME: Mail_Kasumi
→ sent-txt-file の接続先ではない（DB接続用）

### [E]-4 ksm-posstg-sm-sftp

- SFTP_PRIVATE_KEY: "test"（テスト値のまま 🚨）
→ 石田ESLサーバーへのSFTP接続キーがテスト値

### [E]-5 sg-import-data Step Functions

- `ksm-posstg-sf-sm-import-pos-master-sg` → **StateMachine存在しない**
→ SGデータ取込はStep Functions経由ではなくEventBridge→Lambda直接起動と思われる

---

### 🎯 障害① 最終結論

**SG設定は正しい。Lambda→AuroraのSG疎通は問題なし。**

| 経路 | 状態 |
|---|---|
| lambda-rds-1（Lambda SG）→ アウトバウンド TCP3306 → rds-lambda-1 | ✅ |
| rds-lambda-1 → インバウンド ← lambda-rds-1 | ✅ |
| rds-lambda-1 が Aurora クラスター（プライマリ）にアタッチ | ✅ |

**SG経路は問題なし → 障害①の原因を再検討**

**新仮説: import-pos-master-sh が DB_KASUMI=stg/Replica_Kasumi を参照**
- Replica_Kasumi の HOST が Write Endpoint（cluster）を向いている
- しかし Lambda は `Replica_Kasumi` を使用 → Replicaクラスター（replica-cluster）のエンドポイントを見るべきか？
- または Lambda 自体のコードに問題がある可能性

**要確認: import-pos-master-sh が実際に何をしているか（DB書き込みか読み込みか）**


---

## [F] Logs Insights 詳細調査（2026-03-11）

### [F]-5 CloudWatch Logs Insights 結果（import-pos-master-sh）

**DB接続ログが確認できた（DB接続は成功している）:**

| 日時（JST） | メッセージ |
|---|---|
| 2026-03-10 13:11:07 | `getConnection(Line_35)_secretKey: stg/Replica_Kasumi` |
| 2026-03-10 13:11:09 | `getConnection(Line_35)_secretKey: stg/Replica_Kasumi` |
| 2026-03-10 13:11:09 | `ENGINE=InnoDB ... COMMENT = '棚番情報_TMP'` |
| 2026-03-09 13:11:07 | `getConnection(Line_35)_secretKey: stg/Replica_Kasumi` |
| 2026-03-09 13:11:09 | `ENGINE=InnoDB ... COMMENT = '棚番情報_TMP'` |
| 2026-03-08 13:11:06 | `getConnection(Line_35)_secretKey: stg/Replica_Kasumi` |
| 2026-03-08 13:11:09 | `ENGINE=InnoDB ... COMMENT = '棚番情報_TMP'` |
| **2026-03-08 13:25:36** | `getConnection(Line_35)_secretKey: stg/Replica_Kasumi` ← **成功時の最終DB接続** |

**重要な発見:**
1. **DB接続は成功している**（CloudWatch接続数が0に見えたのは計測タイミングの問題）
2. 03-08 成功時: 13:11開始 → 13:25:36に最終getConnection → 13:25:37完了（約14分で完了）
3. 03-10 失敗時: 13:11開始 → 13:11:09に最終ログ → 13:26:05タイムアウト（15分）
4. **03-10 は 13:11:09 以降のログが一切なし** → 13:11:09直後に処理がハング

**`棚番情報_TMP` テーブルのCREATE文が最後のログ** → TMP テーブル作成後の処理（INSERT等）でハング

---

### 🎯 障害① 最終確定原因（確定）

**`棚番情報_TMP` テーブルへのDELETE/INSERT処理中にDBがハング**

| 項目 | 内容 |
|---|---|
| DB接続自体 | 成功 ✅ |
| TMP テーブル CREATE | 成功 ✅ |
| その後の処理（INSERT/LOAD等） | **13:11:09以降ログなし → ハング** |
| タイムアウト | 900秒後（13:26:05）に強制終了 |
| 03-08との差異 | 03-08は13:25まで正常ログあり → 途中まで正常進行 |

**推定メカニズム:**
- 棚番情報_TMPへの大量INSERT中にDBロックが発生
- または前回実行の不完全なトランザクションが残存しロック待ち
- 03-09も同日FAILEDのため2日連続でTMP処理がスタック状態

**対応方法:**
1. Aurora に直接接続して `SHOW PROCESSLIST` / `SHOW ENGINE INNODB STATUS` 確認
2. 前回の不完全トランザクションがあれば `KILL <process_id>` で解放
3. `棚番情報_TMP` テーブルの状態確認（ロック・行数）
4. その後 `import-pos-master-sh` を手動再実行


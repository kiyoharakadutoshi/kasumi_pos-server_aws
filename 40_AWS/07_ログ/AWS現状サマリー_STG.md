# AWS現状サマリー STG

最終更新: 2026-03-11（第3回）  
AWSアカウント: 750735758916  
リージョン: ap-northeast-1（東京）  
コンソール: https://ap-northeast-1.console.aws.amazon.com/console/home?region=ap-northeast-1

> ⚠️ PRDとの差異は **【STG独自】** または **【PRD/STG差異】** で明示。

---

## 1. VPC・ネットワーク基本構成

| 項目 | 値 |
|---|---|
| VPC ID | vpc-09bc4a6da904ace31 |
| CIDR | 10.239.0.0/16 |
| AZ | ap-northeast-1a + ap-northeast-1c |
| NAT GW | nat-0bdcfc7911587eb4c / 52.196.152.170 (Public) / 10.239.2.55 (Private) / subnet-030d02a05fcba055e |
| Internet GW | igw-0f2b7450bfe9a8798 (com-posstg-vpc-ig) |
| Virtual Private GW | vgw-03575f50ba917794a (posstg-vpc-vgw) |
| S3 VPC Endpoint | vpce-0ae36bb9b6b38c692 (Gateway型・全ルートテーブルに追加済み) |

### サブネット一覧

| サブネットID | CIDR | AZ | 名前 | 用途 |
|---|---|---|---|---|
| subnet-030d02a05fcba055e | 10.239.2.0/26 | 1a | public-1a | bastion・NAT GW配置 |
| subnet-071c68d5edb0cfb07 | 10.239.3.0/26 | 1c | public-1c | 冗長用 |
| subnet-08999673be546d752 | 10.239.2.128/25 | 1a | private-1a | Lambda・ECS・EC2(web-be/fe/giftcard) |
| subnet-0d4bb4d8d559e39b1 | 10.239.3.128/25 | 1c | private-1c | 同上（冗長） |
| subnet-0fca160c3c0af3733 | 10.239.2.64/26 | 1a | protected-1a | Aurora（インターネット不可） |
| subnet-0fabd6914bfd0f1a3 | 10.239.3.64/26 | 1c | protected-1c | Aurora（インターネット不可） |
| subnet-0735401d21249139c | 10.239.0.0/26 | 1a | common-1a | VPCエンドポイント配置 |
| subnet-0428e0814dfd61b90 | 10.239.1.0/26 | 1c | common-1c | VPCエンドポイント配置 |

### ルートテーブル まとめ

| ルートテーブル | 関連サブネット | 主要ルート | 備考 |
|---|---|---|---|
| rt-public-1a | subnet-030d02a05fcba055e | 0.0.0.0/0→IGW / 10.156.96.192/26→VGW | USMH SFTP向けVGW経由 |
| rt-public-1c | subnet-071c68d5edb0cfb07 | 0.0.0.0/0→IGW | VGWルートなし（非対称）⚠️ |
| rt-private-1a | subnet-08999673be546d752 | 0.0.0.0/0→NAT / 172.21.10.0/24→VGW / 10.156.96.192/26→VGW | Lambda・ECS |
| rt-private-1c | subnet-0d4bb4d8d559e39b1 | 0.0.0.0/0→NAT / 172.21.10.0/24→VGW / 10.156.96.192/26→VGW | 同上 |
| rt-protected-1a | subnet-0fca160c3c0af3733 | 172.21.10.0/24→VGW | NATなし（インターネット不可）Aurora用 |
| rt-protected-1c | subnet-0fabd6914bfd0f1a3 | 172.21.10.0/24→VGW | 同上 |
| rt-common-1a/1c | subnet-0735401d21249139c / 0428e0814dfd61b90 | ローカルのみ | エンドポイント配置用 |

> ⚠️ **public-1cルートテーブルにVGWルートなし**（public-1aにはあり）→ 非対称設定。意図的か要確認。  
> ✅ 全ルートテーブルにS3 Gateway Endpoint（vpce-0ae36bb9b6b38c692）追加済み

### セキュリティグループ 全件（2026-03-11確認）

| SG名 | SG ID | Inbound | Outbound | 評価 |
|---|---|---|---|---|
| ksm-posstg-vpc-sg-ec2-bastion | sg-01f1bbc2ae66a6591 | UDP1194（OpenVPN） | ALL→0.0.0.0/0 | ✅ |
| ksm-posstg-vpc-sg-ec2-web-fe | sg-05e67c2aa07685a1e | TCP80←ALB-fe SG / TCP22←bastion SG | ALL→0.0.0.0/0 | ✅ |
| **ksm-posstg-vpc-sg-ec2-web-be** | sg-02a3156bfb0ac0046 | TCP80←ALB-be SG・web-fe SG / **TCP8080←0.0.0.0/0** / **ALL←0.0.0.0/0** / TCP22←bastion SG | ALL→0.0.0.0/0 | 🔴 **ALL開放・改修No.5** |
| ksm-posstg-vpc-sg-giftcard | sg-0e4893fdcd3bfc72b | TCP80←0.0.0.0/0 / TCP3389←bastion SG | ALL→0.0.0.0/0 | ⚠️ TCP80全開 |
| ksm-posstg-vpc-sg-db | sg-006e18b25235d3a1d | TCP3306←172.21.10.0/24 / ←ECS SG / ←bastion SG / ←**sg-0f39bd8617062491d** / ←Lambda SG | ALL→0.0.0.0/0 | ⚠️ sg-0f39bd8617062491d確認要 |
| ksm-posstg-vpc-sg-ecs | sg-02865a2ca8164b2e7 | なし | ALL→0.0.0.0/0 | ✅ |
| ksm-posstg-vpc-sg-lmd | sg-07e2f45f6a0f49c24 | なし | ALL→0.0.0.0/0 | ✅ |
| lambda-rds-1 | sg-0c2b1347aaadfdc83 | なし | TCP3306→rds-lambda-1 | ✅（Lambda→RDS専用） |
| rds-lambda-1 | sg-0ee95ce0bfe7c1d19 | TCP3306←lambda-rds-1 | なし | ✅ |
| rds-ec2-1 | sg-02cd48ad974df77be | TCP3306←ec2-rds-1 | なし | ✅ |
| ec2-rds-1 | sg-0f0811b7336aaa804 | なし | TCP3306→rds-ec2-1 | ✅ |
| ksm-posstg-vpc-sg-alb-web-fe | sg-0a95f93ea132f542c | TCP80・443←0.0.0.0/0 | ALL→0.0.0.0/0 | ✅（ALB用） |
| ksm-posstg-vpc-sg-alb-web-be | sg-0c00041d6728442c6 | TCP80・443←0.0.0.0/0 | ALL→0.0.0.0/0 | ✅（ALB用） |
| ksm-posstg-vpc-sg-ep-tf | sg-06153ac3ff38765ab | TCP22←10.156.96.192/26 / **TCP22←bastion SG**（残骸） | ALL→0.0.0.0/0 | 🔴 **改修No.13** |
| ksm-posstg-vpc-sg-ep-ecr | sg-0ea38a9bf01ae9cdf | TCP443←Lambda SG / ←ECS SG | ALL→0.0.0.0/0 | ✅ |
| ksm-posstg-vpc-sg-ep-cw-logs | sg-02fbe4b65f59bd010 | TCP443←Lambda/ECS/RDS/EC2/sg-02a3156bfb0ac0046 SG | ALL→0.0.0.0/0 | ✅ |
| ksm-posstg-vpc-sg-ep-cw-metrics | sg-044c17b67ecc44b3b | TCP443←Lambda/ECS/RDS SG | ALL→0.0.0.0/0 | ✅ |
| ksm-posstg-vpc-sg-ep-sm | sg-06a78433a1adce0a9 | TCP443←Lambda/ECS SG | ALL→0.0.0.0/0 | ✅ |
| ksm-posstg-vpc-sg-ep-kms | sg-0ccbb38c45d28c70d | TCP443←Lambda/ECS/RDS SG | ALL→0.0.0.0/0 | ✅ |
| ksm-posstg-vpc-sg-s3 | sg-0066dd51f597012b2 | TCP443←0.0.0.0/0 | ALL→0.0.0.0/0 | ✅ |
| **ksm-posstg-temp** | sg-0991baa076710475a | **なし** | **なし** | 🟢 削除候補（ルールゼロ） |
| **ksm-posstg-vpc-sg-kasumi-charge** | sg-07c81567ac87d00c5 | なし | ALL→0.0.0.0/0 | 🟡 用途不明・未使用の可能性 |
| **posstg-lmd-function-send-master-file** | sg-0f39bd8617062491d | なし | ALL→0.0.0.0/0 | 🟡 対応Lambda不明（23関数に該当なし）→ 削除候補 |
| default | sg-09de3d205a615797e | ALL←self | ALL→0.0.0.0/0 | ✅（未使用） |



## 2. EC2

| 名前 | インスタンスID | タイプ | プライベートIP | AZ | 起動日 | IAMプロファイル | 備考 |
|---|---|---|---|---|---|---|---|
| bastion | i-0bd9a4db1b74b5a69 | t3.xlarge | 10.239.2.4 | 1a | 2025-07-31 | ksm-posstg-iam-ip | 踏み台・Client VPN接続先 |
| web-be | i-06a74666e851e4d12 | t3.medium | 10.239.2.195 | 1a | 2025-09-17 | posstg-role-ec2-web-be | 🔴 SG: ALL(-1)全通信許可（改修No.5） |
| web-fe | i-0fa4cf3cf5c1a8864 | t3.medium | 10.239.2.253 | 1a | 2025-09-17 | posstg-role-ec2-web-fe | 独自IAMプロファイルあり |
| giftcard | i-0f8ededc7ae313cbe | t2.large | 10.239.2.193 | 1a | 2025-11-26 | **posstg-role-ec2-web-be（web-beと共用）** ⚠️ | Windows Server / 専用ロール未作成 |

【PRD/STG差異】PRDはEC2 2台（bastion/giftcard）/ STGはEC2 4台（bastion/giftcard/web-be/web-fe）

### EBSボリューム暗号化状況（2026-03-11確認）

| ボリュームID | サイズ | 暗号化 | アタッチ先 | 評価 |
|---|---|---|---|---|
| vol-0543e2e85d267fed3 | 100GB | **False** 🔴 | bastion | 未暗号化ボリューム残存（2本目・要調査） |
| vol-083b97dc7d0eb66a4 | 100GB | True ✅ | bastion | 暗号化済み（メインボリューム） |
| vol-0a904fbe22a1466f9 | 100GB | **False** 🔴 | giftcard | 未暗号化 |
| vol-0d9f3bc937a9e9212 | 20GB | **False** 🔴 | web-fe | 未暗号化 |
| vol-05550f5152c65b611 | 20GB | **False** 🔴 | web-be | 未暗号化 |

> ⚠️ bastionに100GBボリューム2本アタッチ（1本暗号化済み・1本未暗号化）→ 古いボリュームのデタッチ漏れの可能性。要確認・整理。  
> ⚠️ giftcard/web-fe/web-beは未暗号化。KMSキー付きで再作成が理想だが、停止コストを考慮し要判断。

---

## 3. RDS（Aurora MySQL 8.0）

| クラスター | プライマリ | レプリカ | Multi-AZ |
|---|---|---|---|
| STGクラスター | db.r5.2xlarge | db.t3.medium | False |

**Secrets Manager（STG）:**
- ksm-posstg-sm-db / db-replica / sftp
- stg/Mail_Kasumi / Batch_Kasumi / Replica_Kasumi

---

## 4. Lambda（23関数）

**【PRD/STG差異】PRD=21関数 / STG=23関数（自動生成3本含む / アプリ関連20本）**

| 関数名 | Timeout | Memory | Runtime | ENV（主要） | 評価 |
|---|---|---|---|---|---|
| create-file-end-for-night | 300s | 512MB | java17 | DB_BATCH=stg/Batch_Kasumi, DB_KASUMI=stg/Replica_Kasumi | ✅ |
| get-sync-store | 900s | 1024MB | java17 | DB_KASUMI=stg/Replica_Kasumi_RO | ✅ |
| oc-import-data | 900s | 2048MB | java17 | DB_BATCH, DB_KASUMI=stg/Replica_Kasumi | ✅ |
| unzip-file | 900s | 1024MB | java17 | **ENV:none** | ✅（S3操作のみ） |
| import-pos-master-sh | 900s | 1024MB | java17 | DB_BATCH, DB_KASUMI=stg/Replica_Kasumi | 🔴 **タイムアウト障害中** |
| **sent-txt-file** | 900s | 1024MB | java17 | **ENV:none** | 🔴 **接続先ハードコード・FAILED中** |
| backup-file | 900s | 1024MB | java17 | **ENV:none** | ✅（S3操作のみ） |
| sg-import-data | 900s | 2048MB | java17 | DB_BATCH, DB_KASUMI=stg/Replica_Kasumi | ✅ |
| split-txt-by-sent-time | 900s | 1024MB | java17 | ROLE_ARN, TARGET_ARN（SF:sent-txt-file）, FIRST_NAME_SCHEDULE | ✅ |
| create-file-end | 900s | 1024MB | java17 | **ENV:none** | ✅ |
| split-csv | 900s | 1024MB | java17 | DB_KASUMI=stg/Replica_Kasumi_RO | ✅ |
| export-polling | 300s | 128MB | python3.13 | SF_ARN（create-txt-file-sg） | ✅ |
| zipfile-polling | 300s | 128MB | python3.13 | SF_ARN（receive-and-import-pos-master-sg） | ✅ |
| copy-backup-sg | 15s | 512MB | java17 | DEST_BUCKET=stg-ignica-ksm | ✅ |
| **sent-email** | 900s | 1024MB | java17 | SNS_TOPIC_ARN=**ksm-posspk**（削除候補）、CHANNEL_CONFIG=Azure Logic Apps URL（有効期限不明） | 🔴 **削除候補SNS参照中** |
| itemmaster-import-monitoring | 900s | 512MB | java17 | DB_KASUMI=stg/Replica_Kasumi_RO | ✅ |
| p001-import-monitoring | 900s | 512MB | java17 | DB_KASUMI=stg/Replica_Kasumi_RO, DATA_SOURCE=oc | ✅ |
| trigger-sqs-export-sg | 300s | 128MB | python3.13 | QUEUE_URL（export-queue-sg.fifo） | ✅ |
| trigger-sqs-import-sg | 300s | 128MB | python3.13 | QUEUE_URL（store-code-queue-sg.fifo） | ✅ |
| check-price | 900s | 512MB | java17 | FIRST_NAME_SCHEDULE=**ksm-posspk**-eb-rule-test-report-, DB_KASUMI=stg/Replica_Kasumi | 🟡 posspk命名残存 |
| aws-quicksetup-lifecycle-LA-89e4k | 900s | 128MB | python3.11 | REGION | AWS自動生成 |
| baseline-overrides-a4fd-v4t88 | 300s | 128MB | python3.11 | REGION | AWS自動生成 |
| delete-name-tags-ap-northeast-1-a4fd-v4t88 | 900s | 128MB | python3.11 | REGION | AWS自動生成 |

> ⚠️ **sent-emailはksm-posspk-sns-topic-app-logs-devを参照中。このSNSトピック削除前に必ずENV更新すること。**  
> ⚠️ **CHANNEL_CONFIGのAzure Logic Apps URLの有効期限・管理者を確認すること。**

---

## 5. S3バケット（8本）

### プロジェクト管理バケット（5本）

| バケット名 | 用途 | バージョニング | 暗号化 | パブリックブロック |
|---|---|---|---|---|
| stg-ignica-ksm | メイン（pos-original/oc・sg・sh） | ✅ Enabled | AES256 | ✅ |
| stg-ignica-ksm-pmlogs | PMログ | ✅ Enabled | AES256 | ✅ |
| stg-aeon-gift-card | ギフトカード | **⚠️ None** | AES256 | ✅ |
| stg-ignica-com-configrecord | 設定レコード | ✅ Enabled | AES256 | ✅ |
| dev-ignica-ksm | Lambda JARファイル置き場（名前はdevだが現役稼働中） | **⚠️ None** | AES256 | ✅ |

### AWSサービス自動生成バケット（3本）

| バケット名 | 自動生成元 | バージョニング |
|---|---|---|
| aws-quicksetup-patchpolicy-750735758916-v4t88 | SSM Quick Setup | ✅ Enabled |
| aws-quicksetup-patchpolicy-access-log-750735758916-a4fd-v4t88 | SSM Quick Setup | ✅ Enabled |
| do-not-delete-ssm-diagnosis-750735758916-ap-northeast-1-89e4k | SSM診断機能 | ✅ Enabled |

> **【削除済】2026-03-10** `phongbt-auditor-staging`（中身空）削除済み。  
> ⚠️ **dev-ignica-ksm と stg-aeon-gift-card はバージョニング未設定。** 誤上書き・誤削除時にロールバック不可。  
> **ACM証明書（ignicapos.com）:** 有効期限 2026-10-16 / 自動更新対象（ELIGIBLE）✅

---

## 6. Transfer Family（3台・受信専用）

VPC: vpc-09bc4a6da904ace31 / IAMロール: ksm-posstg-iam-role-tf  
CFn: ksm-posstg-transfer（OC・SG）/ SHはタグなし手動追加

| サーバー名 | サーバーID | VPC EP ID | AZ-1a IP | AZ-1c IP | S3受信先 |
|---|---|---|---|---|---|
| ksm-posstg-tf-server-oc | s-7c808e1040dd437da | vpce-003c773c1f3807562 | 10.239.2.218 | 10.239.3.228 | /stg-ignica-ksm/pos-original/oc/receive |
| ksm-posstg-tf-server-sg | s-d5d0d941bfb04a72b | vpce-0b7fe3eac68ea1d3b | 10.239.2.225 | 10.239.3.217 | /stg-ignica-ksm/pos-original/sg/receive |
| ksm-posstg-tf-server-sh | s-a69b3df467bc43b99 | vpce-00ef51cdd11a09ae1 | 10.239.2.147 | 10.239.3.253 | /stg-ignica-ksm/pos-original/sh/receive |

**SG: sg-06153ac3ff38765ab (ksm-posstg-vpc-sg-ep-tf)**

| TCP | 送信元 | 評価 |
|---|---|---|
| 22 | 10.156.96.192/26（USMH SFTP専用） | ✅ 正常 |
| 22 | sg-01f1bbc2ae66a6591（Bastion SG） | 🔴 **テスト残骸・要削除** Description: "test for bastion" |

**【STG独自問題】Bastionからの許可ルールが残存（PRDには存在しない）→ 改修依頼 No.13**

---

## 7. Step Functions（7本）

| SF名 | 主要フロー | 特記 |
|---|---|---|
| sf-sm-receive-pos-master-oc | CreateLogStreams→SplitCsv→ParallelProcessing→LogSuccess | OCデータ受信・分割 |
| sf-sm-import-pos-master-oc | CreateLogStreams→LogStart→RunImportData(oc-import-data)→LogSuccess | OC取込 |
| sf-sm-create-txt-file-oc | CreateLogStreams→GetSyncStore→LogStart→**RunExportData(ECS)**→SplitTxtBySentTime→LogSuccess | OC変換・送信 |
| sf-sm-receive-and-import-pos-master-sg | CreateLogStreams→LogStart→UnzipFile→Choice→ParallelProcessing→CreateEndFile→LogSuccess | SG受信・解凍・投入 |
| sf-sm-create-txt-file-sg | CreateLogStreams→GetSyncStore→LogStart→**RunExportData(ECS)**→SplitTxtBySentTime→LogSuccess→DeleteMessage | SG変換・送信（SQS連携あり） |
| **sf-sm-import-pos-master-sh** | CreateLogStreams→LogStart→RunImportData(import-pos-master-sh)→LogSuccess | **🔴 タイムアウト障害中** |
| **sf-sm-sent-txt-file** | CreateLogStreams→LogStart→GetSyncStore→**SendFile(sent-txt-file)**→BackupFile→LogSuccess | **🔴 FTP接続障害中** |

> ECS RunTask（waitForTaskToken）: create-txt-file-oc/sg の RunExportData ステップで使用  
> SQS DeleteMessage: create-txt-file-sg / receive-and-import-pos-master-sg でメッセージ削除ステップあり

---

## 7-b. IAMロール 詳細（2026-03-11確認）

| ロール名 | Trust Principal | アタッチポリシー | 評価 |
|---|---|---|---|
| ksm-posstg-iam-role-ec2 | ec2.amazonaws.com | CloudWatchAgentServerPolicy / AmazonSSMManagedInstanceCore / AmazonS3ReadOnlyAccess / PatchPolicy | ✅ 最小権限 |
| ksm-posstg-iam-role-db-cluster | rds.amazonaws.com | ksm-posstg-iam-policy-db-cluster | ✅ |
| ksm-posstg-iam-role-db-monitoring | monitoring.rds.amazonaws.com | CloudWatchLogsFullAccess | ✅ |
| ksm-posstg-iam-role-tf | transfer.amazonaws.com | S3FullAccess/AmazonECS_FullAccess/StepFunctionsFullAccess/AWSLambdaRole + **InlinePolicy"test"** | 🟡 Inline名が"test"（残骸命名）・権限過剰 |
| ksm-posstg-iam-role-tf-logs | transfer.amazonaws.com | AWSTransferLoggingAccess | ✅ |
| ksm-posstg-iam-role-eb | events.amazonaws.com | AWSStepFunctionsFullAccess / **AWSLambda_FullAccess** | 🟡 Lambda_FullAccess過剰（Invokeのみで十分） |
| **ksm-posstg-iam-role-lmd** | lambda/events/scheduler | 多数 + **PowerUserAccess** 🔴 | 🔴 **改修依頼No.2 未実施** |
| ksm-posstg-iam-role-ecs | ecs-tasks.amazonaws.com | ECRFullAccess / **SecretsManagerReadWrite** / **AmazonECS_FullAccess** / **S3FullAccess** / StepFunctionsFullAccess | 🟡 権限過剰 → 改修依頼No.10 |
| ksm-posstg-iam-role-sf | states/scheduler | S3FullAccess / ECS_FullAccess / CloudWatchFullAccess / LambdaRole / SQSFullAccess / StepFunctionsFullAccess | 🟡 CloudWatchFullAccess過剰 |
| posstg-role-ec2-web-be | ec2.amazonaws.com | CloudWatchLogsFullAccess / **SecretsManagerReadWrite** / **AmazonS3FullAccess** / ECR | 🟡 S3・SM Full過剰 |
| posstg-role-ec2-web-fe | ec2.amazonaws.com | **AmazonEC2ContainerRegistryFullAccess** | 🟡 FullAccess過剰（ReadOnlyで十分） |

> 🔴 **ksm-posstg-iam-role-lmd に PowerUserAccess → 改修依頼No.2（最優先）**  
> 🟡 ksm-posstg-iam-role-tf の InlinePolicy名が "test"（内容：iam:PassRole / states:StartExecution / ecs:RunTask → 機能的には問題なし・名前のみ要修正）



## 8. SQS（2 FIFOキュー）

| キュー名 | メッセージ数 | 保持期間 | Visibility | DLQ | 評価 |
|---|---|---|---|---|---|
| ksm-posstg-sqs-export-queue-sg.fifo | 0 | 4日（345600秒） | 3600秒（1時間） | **未設定** 🟡 | 処理失敗時にメッセージ消失リスク |
| ksm-posstg-sqs-store-code-queue-sg.fifo | 0 | 4日（345600秒） | 300秒（5分） | **未設定** 🟡 | 同上 |

> ⚠️ 両キューともDLQ（デッドレターキュー）未設定。Lambda処理失敗時のメッセージがリトライ上限後に消失するリスクあり。設定推奨。

---

## 9. EventBridge

| ルール名 | 状態 | ターゲット | 評価 |
|---|---|---|---|
| eb-rule-check-p001-price | **ENABLED** | Lambda: check-price | 【STG独自・PRD=DISABLED】 |
| eb-rule-night-export-sg | **ENABLED** | Lambda: create-file-end-for-night | 毎日JST05:30 |
| eb-rule-receive-pos-master-oc | ENABLED | SF: receive-pos-master-oc | S3トリガー |
| eb-rule-receive-pos-master-sg | ENABLED | Lambda: trigger-sqs-import-sg | S3トリガー |
| eb-rule-receive-pos-master-sh | ENABLED | SF: import-pos-master-sh | S3トリガー |
| eb-rule-create-txt-file-sg | ENABLED | Lambda: trigger-sqs-export-sg | S3トリガー |
| eb-rule-receive-splited-pos-master-oc | ENABLED | SF: import-pos-master-oc | S3トリガー |
| eb-rule-itemmaster-import-monitoring | ENABLED | Lambda: itemmaster-import-monitoring | - |
| eb-rule-p001-import-monitoring | ENABLED | Lambda: p001-import-monitoring | Input: {"bucketName":"stg-ignica-ksm"} |
| **eb-rule-copy-backup-sg** | ENABLED | **Lambda: arn:aws:lambda:...:891376952870:function:ksm-posspk-lmd-function-copy-backup-sg** | 🚨 **別アカウント(891376952870=posspk)のLambdaを参照！** |
| **eb-rule-receive-pos-master-sg-9233** | DISABLED | SQS: store-code-queue-sg.fifo | 🔴 残骸 → No.14 |
| **eb-rule-create-txt-file-sg-9233** | DISABLED | SQS: export-queue-sg.fifo | 🔴 残骸 → No.14 |
| **eb-rule-night-export-sg-9233** | DISABLED | Lambda: create-file-end | 🔴 残骸 → No.14 |

> 🚨 **重大問題: eb-rule-copy-backup-sgのターゲットが別アカウント(891376952870 = posspk開発環境)のLambdaを参照**  
> 現在 STG アカウントから posspk アカウントへのクロスアカウント Lambda 呼び出しが設定されている。  
> posspk 側で Lambda Resource Policy が許可されていれば動作するが、意図的な設計か不明。  
> **正しくは同一 STG アカウントの ksm-posstg-lmd-function-copy-backup-sg を参照すべき。要修正。**



## 10. ネットワーク接続

### 全体構成（構成資料スライド6）

```
① Luvina個人PC → AWS Client VPN → LuvinaAWS STG（10.239.2.4）
② Luvinaオフィス → TP-Link ER605(14.224.146.153) → Site-to-Site VPN → LuvinaAWS STG
③ LuvinaAWS → VPN gateway → Direct Connect(100Mbps) → SmartVPN → USMH閉域網
```

> ⚠️ **現状のOpenVPN（Bastion経由）は廃止予定。**
> 廃止後は①②の構成に完全移行し、BastionのOpenVPN運用をなくす。

### ① Luvina個人PC → STG（AWS Client VPN）

| 項目 | 値 |
|---|---|
| 接続方式 | AWS Client VPN（個人PC単位） |
| 接続先 | STG Bastion: 10.239.2.4 |
| 備考 | 各端末へのIP振り分けはClient VPN内のルーティングにて行う |

### ② Luvinaオフィス → STG（Site-to-Site VPN）

| 項目 | 値 |
|---|---|
| 接続方式 | IPSec Site-to-Site VPN |
| CGW | cgw-036da626e507cf685（TP-Link ER605: 14.224.146.153） |
| VGW | vgw-03575f50ba917794a |
| VPN ID | vpn-0840f46eaf8de7e79 |
| T1 | UP |
| T2 | **DOWN** |

### ③ LuvinaAWS → USMH閉域網（Direct Connect）

| 項目 | 値 |
|---|---|
| 接続方式 | AWS Direct Connect（100Mbps） |
| 経路 | VPN gateway → Direct Connect → SmartVPN → USMH閉域網 |
| USMH CIDR | 10.156.96.0/24 / 172.21.10.0/24 / 10.156.96.192/26 |

### NATアドレス変換

| 方向 | 変換前 | 変換後 | 宛先 |
|---|---|---|---|
| Luvina → AFSオーソリ（STG） | 10.239.2.4 | 10.156.96.221 | 192.168.60.100 |
| ギフト端末 → Luvina（STG） | 10.0.0.0/8 → 10.156.96.214 | 10.156.96.214 | 10.239.2.193 |

---

## 11. ギフトカード決済 / NTT DATA CDS送信（STG）

PRDと同じ処理フロー。試験接続先:

```
NTT DATA CDS 試験環境: 210.144.93.18:22 (SFTP)
application.yml デフォルト: sftp.gift.host=210.144.93.18
```

---

## 12. 外部連携データフロー全体

PRDと同等。バケット名・Lambda名のプレフィックスが stg- / posstg- に変わるのみ。

```
【SG系 夜間バッチ】STG も毎日 JST 05:30 に ENABLED で動作中
  → create-file-end-for-night → .ENDEXPORT 生成 → USMH FTP送信
```

---

## 13. セキュリティ状況（問題多数）

| サービス | 状態 | 備考 |
|---|---|---|
| GuardDuty | 🔴 **無効** | 【PRD/STG差異】PRDは有効 → 改修依頼 No.3 |
| CloudTrail | 🔴 **無効** | 【PRD/STG差異】PRDは有効（management-events / 2025-09-29〜稼働中）→ 改修依頼 No.4 |
| Security Hub | 🔴 **無効** | 【PRD/STG差異】PRDは有効 |
| Inspector | なし | 【PRD/STG差異】PRDにはあり |
| VPC Flow Logs | 不明 | |
| MFA | ⚠️ 未強制 | → 改修依頼 No.1 |
| PowerUserAccess(lmd) | 🔴 付与中 | → 改修依頼 No.2 |
| web-be SG | 🔴 **ALL(-1)全通信許可** | 【STG独自】→ 改修依頼 No.5 |
| api-be ALB | 🔴 **internet-facing** | 【PRD/STG差異】PRDはALBなし → 改修依頼 No.8 |
| Transfer Family SG | 🔴 **Bastion許可ルール残存** | 【STG独自】→ 改修依頼 No.13 |
| EventBridge -9233残骸 | 🔴 **DISABLED残存** | 【STG独自】→ 改修依頼 No.14 |
| Vangle CGW残骸 | ⚠️ 残存 | 【STG独自】→ 改修依頼 No.12 |

---

## 14. 改修依頼ステータス（STG関連）

| No | 内容 | 優先度 | 状態 |
|---|---|---|---|
| 1 | MFA全ユーザー強制 | 🔴 | 未実施 |
| 2 | PowerUserAccess削除 | 🔴 | 未実施 |
| 3 | GuardDuty有効化(STG) | 🔴 | 未実施 |
| 4 | CloudTrail有効化(STG) | 🔴 | 未実施 |
| 5 | web-be SG修正（ALL削除） | 🔴 | 未実施 |
| 6 | パスワードポリシー設定 | 🟡 | 未実施 |
| 7 | VPC Flow Logs整備 | 🟡 | 未実施 |
| 8 | api-be ALB internal化 | 🟡 | 未実施 |
| 9 | アクセスキーローテーション | 🟡 | 未実施 |
| 10 | ECSロール権限削減 | 🟡 | 未実施 |
| 11 | VPN T2復旧 | 🟡 | マイ/木村さん依頼待ち |
| 12 | Vangle CGW残骸削除 | 🟢 | 未実施 |
| 13 | Transfer Family SG Bastion許可ルール削除 | 🟡 | 未実施 |
| 14 | EventBridge -9233 残骸ルール3本削除 | 🟢 | 未実施 |

---

## 15. PRD/STG 差異一覧（次回調査時の確認ポイント）

| 項目 | PRD | STG |
|---|---|---|
| EC2台数 | 2台（bastion/giftcard） | **4台**（bastion/giftcard/web-be/web-fe） |
| web-be SG | - | 🔴 ALL(-1)全通信許可 |
| api-be ALB | ALBなし（PL制限済み） | internet-facing |
| GuardDuty | ✅ 有効 | 🔴 無効 |
| CloudTrail | ✅ 有効（management-events / マルチリージョン） | 🔴 無効 |
| Security Hub | ✅ 有効 | 🔴 無効 |
| Inspector | ✅ あり（6ルール） | なし |
| Transfer Family SG | ✅ USMH閉域網のみ | 🔴 +Bastion残骸ルール |
| EventBridge -9233系 | なし | 🔴 DISABLED 3本残存 |
| check-price ルール | DISABLED | ENABLED |
| Lambda数 | 21本 | 23本 |
| Vangle CGW | - | 残存（残骸） |

---

## 16. 次回調査チェックリスト（STG）

- [ ] web-be SG 修正状況確認
- [ ] api-be ALB internal化 実施状況
- [ ] GuardDuty / CloudTrail / Security Hub 有効化状況
- [ ] Transfer Family SG Bastion許可ルール削除状況
- [ ] EventBridge -9233 系 3本削除状況
- [ ] VPN T2 復旧状況

---

## 16. CloudFormation（23スタック）

| カテゴリ | スタック名 | PRD対応 |
|---|---|---|
| AWS自動生成 | StackSet-AWS-QuickSetup-SSM-LA-89e4k-* | ✅ 同等 |
| AWS自動生成 | AWS-QuickSetup-SSM-LocalDeploymentRolesStack | ✅ 同等 |
| AWS自動生成 | StackSet-AWS-QuickSetup-PatchPolicy-LA-v4t88-* | ✅ 同等 |
| AWS自動生成 | AWS-QuickSetup-PatchPolicy-LocalDeploymentRolesStack | ✅ 同等 |
| 共通インフラ | com-posstg-config | ✅ |
| 共通インフラ | com-posstg-prefixlist | ✅ |
| 共通インフラ | com-posstg-endpoint | ✅ |
| 共通インフラ | com-posstg-network | ✅ |
| KSMアプリ | ksm-posstg-cloudwatch-alarm1/2/3 | ✅ |
| KSMアプリ | ksm-posstg-sns | ✅ |
| KSMアプリ | ksm-posstg-ecs | ✅ |
| KSMアプリ | ksm-posstg-rds / rds-replica | ✅ |
| KSMアプリ | ksm-posstg-ecr | ✅ |
| KSMアプリ | ksm-posstg-secretsmanager | ✅ |
| KSMアプリ | ksm-posstg-transfer | ✅ |
| KSMアプリ | ksm-posstg-ec2-bastion | ✅ |
| KSMアプリ | ksm-posstg-network | ✅ |
| KSMアプリ | ksm-posstg-kms | ✅ |
| KSMアプリ | ksm-posstg-s3 | ✅ |
| KSMアプリ | ksm-posstg-sg | ✅ |

> **⚠️ STGにはない（PRD専用）スタック:** com-posprd-cloudwatchlogs / com-posprd-iam-analyzer / com-posprd-securityhub → STGはセキュリティ系スタックが未整備

## 17. SNS（4トピック）

| トピック名 | サブスクライバー | 評価 |
|---|---|---|
| **ksm-posspk-sns-topic-app-logs-dev** | nguyenthanhloc@luvina.net / nguyenbaan2@luvina.net（Luvina2名のみ） | 🔴 **削除候補**（先にsent-email LambdaのENVを更新すること） |
| ksm-posstg-sns-topic-app-logs | pos-app-log-test@luvina.net / aws-pos-alert@luvina.net / 00918f5f...（Teams） | ✅ アプリエラー通知先 |
| ksm-posstg-sns-topic-app-logs-check-price | nguyenthanhloc / kiyohara / leducnang / nguyenbaan2 / tranvandat（5名） | ✅ STG独自・価格チェック通知 |
| ksm-posstg-sns-topic-aws-logs | 00918f5f...（Teams） / pos-app-log-test@luvina.net | ✅ AWSサービス通知 |

> ⚠️ **ksm-posspk削除前にksm-posstg-lmd-function-sent-emailのENV SNS_TOPIC_ARNを更新すること**（現在このトピックを参照中）

## 18. CloudWatch（アラーム19本 / ロググループ41本）

**■ アラーム（PRDと同数19本）**

| 状態 | アラーム名 | メトリクス | しきい値 | 通知先 |
|---|---|---|---|---|
| **🔴 ALARM（再発火）** | ec2-audit-log | ksm-posstg-cw-metric-ec2-audit-log | ≥1 | sns-topic-aws-logs |
| **🔴 ALARM（再発火）** | ec2-messages | ksm-posstg-cw-metric-ec2-messages | ≥1 | sns-topic-aws-logs |
| ✅ OK | db-aborted-clients-cluster/replica | AbortedClients | ≥1 | sns-topic-aws-logs |
| ✅ OK | db-acu-cluster | ACUUtilization | ≥80% | sns-topic-aws-logs |
| ✅ OK | db-cpu-cluster/replica | CPUUtilization | ≥80% | sns-topic-aws-logs |
| ✅ OK | db-dml-rejected-writer-cluster/replica | AuroraDMLRejectedWriterFull | ≥1 | sns-topic-aws-logs |
| ✅ OK | db-free-local-storage-replica | FreeLocalStorage | ≤700MB | sns-topic-aws-logs |
| ✅ OK | db-freeable-memory-cluster/replica | FreeableMemory | ≤400MB | sns-topic-aws-logs |
| ✅ OK | db-serverless-capacity-cluster | ServerlessDatabaseCapacity | ≥80% | sns-topic-aws-logs |
| ✅ OK | ec2-dnf-log / ec2-secure | 各メトリクス | ≥1 | sns-topic-aws-logs |
| ✅ OK | ec2-statuscheck-instance/system | StatusCheckFailed_* | ≥1 | sns-topic-aws-logs |
| ✅ OK | tf-oc / tf-sg | 各メトリクス | ≥1 | sns-topic-aws-logs |

> 🔴 **2026-03-11 ec2-audit-log / ec2-messages が再ALARM**  
> 前回2026-03-10に手動リセット済みだったが再発火。bastionのPAMセッション終了時`res=failed`をフィルター`*fail*`が継続誤検知。  
> **フィルターパターンの修正が必要（`res=failed` → 正確なパターンに絞り込み）。**

**■ ロググループ（41本）保持期間まとめ**

| ロググループ | 保持期間 | PRD比較 |
|---|---|---|
| /aws/ecs/containerinsights/.../performance | 1日 ⚠️ | PRD同じ |
| /aws/ecs/ksm-posstg-ecs-sg-export-data | 無期限 ⚠️ | PRD同じ |
| /aws/ecs/ksm-posstg-ecs-oc-export-data | 無期限 ⚠️ | **STG独自** |
| /aws/lambda/ksm-posstg-lmd-* (24本) | 無期限 ⚠️ | PRD同じ |
| /aws/rds/cluster/.../error (2本) | 無期限 ⚠️ | PRD同じ |
| /aws/transfer/* (3本) | 無期限 ⚠️ | PRD同じ |
| /aws/vpn/vpn-0840f46eaf8de7e79 | 30日 | ✅ |
| /pos/log/export・import・sent (6本) | 無期限 ⚠️ | PRD同じ |
| **/pos/log/web/be** | 無期限 ⚠️ | **STG独自（giftcard EC2用？）** |
| /var/log/* (4本) | 365日 | ✅ |
| RDSOSMetrics | 30日 | ✅ |

> VPCフローログ（/aws/vpc/）はSTGに存在しない → PRDと差異あり

## 19. ECR（8リポジトリ ※PRDの2倍）

| リポジトリ名 | PRD対応 |
|---|---|
| ksm-posstg-ecr-sg-export-data → **ksm-posstg-ecs-sg-export-data** | PRD同等（命名差異あり） |
| ksm-posstg-ecr-oc-export-data | ✅ PRD同等 |
| ksm-posstg-ecr-oc-import-data | ✅ PRD同等 |
| ksm-posstg-ecs-sg-import-data | ✅ PRD同等 |
| **ksm-posstg-ecr-web-fe** | 🔍 STG独自（フロントエンドコンテナ？） |
| **ksm-posstg-ecr-web-be** | 🔍 STG独自（バックエンドコンテナ？） |
| **ksm-posstg-ecr-repository-ecs-import-db-master-sg** | 🔍 STG独自 |
| **ksm-posstg-ecr-repository-ecs-import-db-master-oc** | 🔍 STG独自 |

> STGはPRDに比べECRリポジトリが4本多い。web-fe/web-beはgiftcardまたはPOS-SERVER移行検討用の可能性。

## 20. KMS（カスタムキー4本）

| エイリアス | PRD対応 |
|---|---|
| alias/ksm-posstg-kms-db | ✅ |
| alias/ksm-posstg-kms-ebs | ✅ |
| alias/ksm-posstg-kms-ecr | ✅ |
| alias/ksm-posstg-kms-sm | ✅ |

## 21. IAMユーザー（15名）

| ユーザー名 | コンソールログイン | Activeキー数 | 評価 |
|---|---|---|---|
| kiyohara | ✅（2025-06-23作成） | 0 | - |
| daisuke.sasaki_s3access | なし | 1本（2025-07-28作成）| 🟡 約7.5ヶ月経過。ローテーション推奨 |
| kiyohara_s3access | なし | **2本（2025-11-07×2）** | 🔴 同日作成の2本が両方Active。古い方の削除要 |
| cfn_user | なし | Inactive1本のみ | 実質無効化済み |
| dattv | ✅（2025-07-28作成） | 0 | - |
| dattv_cli_deploy | ✅（2026-03-09作成） | 0 | - |
| buithephong | ✅（2026-01-07作成） | **1本Active**（2026-02-12作成） | 🟡 Activeキーあり。最終使用日要確認 |
| dev | なし | Inactive1本（2025-07-08作成） | 🟢 削除候補（実質無効化済み） |
| locnt | ✅（2025-08-27作成） | 0 | 🟡 フルアクセス権限あり→最小権限化推奨 |
| locnt_cli_deploy | ✅（2026-03-09作成） | 0 | - |
| nangld_admin | ✅（2026-03-02作成） | 0 | - |
| nangld_readonly | ✅（2026-03-02作成） | 0 | - |
| posusmhstg | ✅（2025-05-27作成） | 0 | STG用USMH連携 |
| pos_stag_vangle_sonln | ✅（2026-01-23作成） | 0 | STG用Vangle |
| pos_stag_vangle_tuannv | ✅（2026-01-23作成） | 0 | STG用Vangle |

> PRDに比べ: manhnd-serviceaccess / locnt_deploy / pos_prd_vangle_* がSTGにはない  
> **パスワードポリシー未設定**（改修依頼No.6）

## 22. Secrets Manager（7件）

| シークレット名 | HOST | DB_NAME | 評価 |
|---|---|---|---|
| ksm-posstg-sm-db | - | - | RDS(writer)接続情報 |
| ksm-posstg-sm-db-replica | - | - | RDS(replica)接続情報 |
| ksm-posstg-sm-sftp | - | - | 🚨 SFTP_PRIVATE_KEY="test"（未設定） |
| stg/Mail_Kasumi | Write Endpoint | Mail_Kasumi | ✅ |
| stg/Batch_Kasumi | Write Endpoint | Batch_Kasumi | ✅ |
| stg/Replica_Kasumi | **Write Endpoint（名前と不一致）** ⚠️ | Replica_Kasumi | 意図的か要確認 |
| stg/Replica_Kasumi_RO | **cluster-ro Endpoint（読み取り専用）** ✅ | Replica_Kasumi | get-sync-store / split-csv / monitoring系が参照 |

> stg/Replica_Kasumi_RO は正しくRead-only Endpointを参照。stg/Replica_Kasumi（通常版）のみWriteを参照している。

## 23. 未使用・空サービス（STG）

| サービス | 状態 |
|---|---|
| Glue | ジョブなし（空）|
| X-Ray | Defaultのみ（PRD同等）|
| Direct Connect | なし（VPN経由のみ）|
| Client VPN | **エンドポイントなし**（STGアカウントに未設定）→ STGへの個人PC接続経路確認要 |
| Route53 | **ホストゾーンなし**（PRDアカウントのignicapos.comで一元管理）|
| SSM Parameter Store | /ec2/keypair/key-086b7988621c86b7a（1件のみ）|

## 24. 不要リソース（削除候補・承認待ち）

| リソース | 種別 | 理由 | 注意事項 | 状態 |
|---|---|---|---|---|
| ksm-posspk-sns-topic-app-logs-dev | SNS | Luvina開発環境残留物（Luvina2名のみ購読） | **削除前にsent-email LambdaのENV更新必須** | 削除未実施 |
| ksm-posstg-ecr-web-fe | ECR | イメージ0件・未使用 | - | 削除未実施 |
| ksm-posstg-ecr-web-be | ECR | イメージ0件・未使用 | - | 削除未実施 |
| **ksm-posstg-temp** | SG | ルールゼロ・未使用 | アタッチ先がないことを確認してから削除 | 削除未実施 |
| **ksm-posstg-vpc-sg-kasumi-charge** | SG | Inboundなし・用途不明・アタッチ先不明 | アタッチ先確認後に削除 | 要調査 |
| **posstg-lmd-function-send-master-file** | SG | 対応Lambdaが現存23関数に該当なし（ksm-posstg-vpc-sg-dbのInboundに許可ルールあり） | db SGのルールも合わせて削除 | 要調査 |
| **eb-rule-copy-backup-sg** | EventBridge | **ターゲットが別アカウント(891376952870=posspk)のLambdaを参照（設定ミスの可能性）** | 同アカウントの copy-backup-sg Lambda に修正するか、不要なら削除 | 🚨 要修正 |



## 25. web-fe / web-be 詳細（STG独自Webアプリ）

**構成:**
```
Internet
  → ALB: ksm-posstg-alb-web-fe (internet-facing) ← Port80(HTTP) + Port443(HTTPS/ACM)
  → EC2: web-fe (10.239.2.253 / t3.medium / 2025-09-17起動)
  → ALB: ksm-posstg-alb-api-be (internet-facing) ← Port80(HTTP) + Port443(HTTPS/ACM)
  → EC2: web-be (10.239.2.195 / t3.medium / 2025-09-17起動)
  → Aurora MySQL
```

**ALB詳細（2026-03-10調査）:**

| ALB | ARN末尾 | ターゲット | 登録台数 | ヘルス |
|---|---|---|---|---|
| ksm-posstg-alb-web-fe | a4eb347a3cf149f9 | i-0fa4cf3cf5c1a8864 (web-fe) | **1台のみ** | healthy |
| ksm-posstg-alb-api-be | 583caa4ac9e37817 | i-06a74666e851e4d12 (web-be) | **1台のみ** | healthy |

→ 負荷分散なし（1対1）。**ALBの役割はSSL終端のみ**

**ACM証明書:**
- ARN: `arn:aws:acm:ap-northeast-1:750735758916:certificate/a77b0b86-ac65-4f45-93f1-8cf93957849e`
- ドメイン: `ignicapos.com` + `*.ignicapos.com`（ワイルドカード）
- 状態: ISSUED（有効）
- 両ALBで同一証明書を共有

**IAM:**
- web-fe: ECRFullAccess（コンテナイメージ取得用）
- web-be: S3FullAccess / SecretsManagerReadWrite / CloudWatchLogs / ECR

**特記事項:**
- CloudFormation管理なし（手動構築）
- ECRリポジトリは空（コンテナ未デプロイ）
- **カスミより「PRD本番展開する」意向確認済み（2026-03-10）**
- ECSクラスター（ksm-posstg-ecs-cluster）は存在するがサービス・タスクとも0件（器のみ）
- 🔴 web-be SG: ALL(-1)→0.0.0.0/0 全開放（改修依頼No.5）
- 🔴 ALB×2: internet-facing → **改修指示書No.018でinternal化指示済み（今週中対応予定）**
- 🟡 web-be IAM権限過剰（S3/SecretsManager Full）

---

## 26. 🚨 緊急対応要 - Step Functions 障害（2026-03-11調査）

| SM名 | 直近状態 | 発生日 | 影響 |
|---|---|---|---|
| sf-sm-import-pos-master-sh | 🔴 **FAILED（2日連続）** | 2026-03-09〜03-10 | SHデータ取込が2日間失敗 |
| sf-sm-sent-txt-file | 🔴 **FAILED（全3件）** | 2026-03-10 | USMH向けTXTファイル送信不可 |

**sf-sm-import-pos-master-sh 調査ポイント:**
- `pos-original/sh/receive/P003.end`（2026-03-10 13:11）は存在確認 → ファイル受信は正常
- 取込処理（Lambda: ksm-posstg-lmd-import-pos-master-sh）でエラー → CloudWatch Logsで詳細確認要

**sf-sm-sent-txt-file 調査ポイント:**
- USMH向けFTP送信処理（sent-txt-file Lambda）が失敗
- VPN T2 DOWN が影響している可能性

---

## 27. 2026-03-11 調査 - 新規発見・更新事項

### EC2
- bastion: `t3.xlarge`（4vCPU/16GiB）→ 踏み台用途に対して**過剰スペック**
- giftcard EC2: IAMプロファイルが `posstg-role-ec2-web-be`（web-beと共用）→ **専用ロール作成推奨**

### RDS
- インスタンス数: **4台**（db-instance-1/2 + -1-replica/-2-replica）
- MultiAZ: **True**（2クラスター両方）
- AutoMinorVersionUpgrade: **全4台 False**（セキュリティパッチ自動未適用 → 改修検討）

### IAM（新規問題）
- `kiyohara_s3access`: **Active アクセスキー 2本同時存在** → 古いキー削除要
- `locnt`: EC2/RDS/ECS/S3/Lambda/Transfer/StepFunctions Full Access → **最小権限化推奨**
- `dev` ユーザー: キー無効化済み・ECRFullAccessのみ → **削除候補**

### ネットワーク
- Client VPN: **STGアカウントにエンドポイントなし** → 接続経路確認要
- Vangle CGW残骸（改修No.12）= `pos-stag-cgw-site-to-site-vpn-poc`（IP: 222.252.99.5）正体確認

### 削除候補（新規）
- `ksm-posstg-temp` SG（ルールゼロ）
- Transfer Family EP 3本の名前タグ追加推奨

---

## 28. Aurora DB 設定・データ現状（2026-03-11調査）

### RDS クラスター・インスタンス SG アタッチ状況

| クラスター/インスタンス | アタッチSG |
|---|---|
| ksm-posstg-db-cluster（プライマリ） | sg-02cd48ad974df77be（rds-ec2-1）/ sg-006e18b25235d3a1d（ksm-posstg-vpc-sg-db）/ sg-0ee95ce0bfe7c1d19（rds-lambda-1） |
| ksm-posstg-db-cluster-replica | sg-006e18b25235d3a1d（ksm-posstg-vpc-sg-db）のみ |
| db-instance-1（Writer） | rds-ec2-1 / ksm-posstg-vpc-sg-db / rds-lambda-1 |
| db-instance-2（Reader） | rds-ec2-1 / ksm-posstg-vpc-sg-db / rds-lambda-1 |
| db-instance-1-replica | ksm-posstg-vpc-sg-db のみ |
| db-instance-2-replica | ksm-posstg-vpc-sg-db のみ |

**⚠️ db-cluster-replica（replicaクラスター）に rds-lambda-1 未アタッチ**
→ Lambda から replica クラスターへの接続が必要な場合は追加要

### Lambda → Aurora SG 接続経路

| SG名 | 役割 | ルール |
|---|---|---|
| sg-0c2b1347aaadfdc83（lambda-rds-1） | Lambda側アウトバウンド | Outbound TCP 3306 → rds-lambda-1 |
| sg-0ee95ce0bfe7c1d19（rds-lambda-1） | Aurora側インバウンド | Inbound TCP 3306 ← lambda-rds-1 |
| sg-006e18b25235d3a1d（ksm-posstg-vpc-sg-db） | Aurora汎用SG | Inbound TCP 3306 ← Bastion/ECS/Lambda/172.21.10.0 |
| sg-02cd48ad974df77be（rds-ec2-1） | EC2→Aurora | Inbound TCP 3306 ← sg-0f0811b7336aaa804 |

### Lambda 環境変数・Secrets Manager 参照設定

| Lambda | 環境変数 | 参照シークレット | 接続先DB |
|---|---|---|---|
| import-pos-master-sh | DB_KASUMI=stg/Replica_Kasumi / DB_BATCH=stg/Batch_Kasumi | HOST: Write Endpoint / PORT: 3306 | Replica_Kasumi / Batch_Kasumi |
| sent-txt-file | **null（環境変数なし）** | 接続先不明（ソースコード内定数と推定） | 石田ESLサーバー |

### Secrets Manager シークレット一覧（全7件）

| シークレット名 | HOST（パスワード除く） | PORT | DB_NAME |
|---|---|---|---|
| stg/Batch_Kasumi | ksm-posstg-db-cluster.cluster-cvmomy000wqn... | 3306 | Batch_Kasumi |
| stg/Replica_Kasumi | ksm-posstg-db-cluster.cluster-cvmomy000wqn...（Write Endpoint） | 3306 | Replica_Kasumi |
| stg/Mail_Kasumi | ksm-posstg-db-cluster.cluster-cvmomy000wqn... | 3306 | Mail_Kasumi |
| stg/Replica_Kasumi_RO | 未確認 | - | - |
| ksm-posstg-sm-sftp | SFTP_PRIVATE_KEY: **"test"（テスト値のまま）** 🚨 | - | - |
| ksm-posstg-sm-db / db-replica | MasterUsername: admin のみ確認 | - | - |

**⚠️ stg/Replica_Kasumi の HOST が Write Endpoint（cluster）を参照している**
→ 名前は Replica だが実際は Write Endpoint（意図的かどうか確認推奨）

**🚨 ksm-posstg-sm-sftp の SFTP_PRIVATE_KEY が "test" のまま**
→ sent-txt-file Lambda の石田ESLサーバーへのSFTP接続に使用される可能性あり

### Replica_Kasumi DB テーブル構成（主要テーブル）

| テーブル名 | 行数 | サイズ | 用途 |
|---|---|---|---|
| 42_P003_history | **106,764,454（約1億行）** | **32,872MB（約32GB）** 🚨 | P003取込履歴 |
| 41_P001_history | 14,875,312 | 27,982MB | P001取込履歴 |
| 41_P001 | 12,471,014 | 17,833MB | P001データ |
| 01_GHPLUM_history | 12,696,321 | 15,716MB | GHPLUM履歴 |
| 01_GHPLUM | 10,079,651 | 11,721MB | GHPLUMデータ |
| 02_GHDISCOUNTM | 14,493,212 | 6,798MB | 割引マスタ |
| 42_P003 | 2,606,064 | 459MB | P003データ（COUNT実行時間約6秒） |
| 82_ESLDATA | 2,464,479 | 1,393MB | ESLデータ |
| ESLDATA | 6,334,115 | 851MB | ESLデータ（旧？） |
| **Replica_Kasumi 合計** | - | **約120,723MB（約118GB）** 🚨 | - |

**DB別サイズ:**

| DB名 | サイズ |
|---|---|
| Replica_Kasumi | **118GB** 🚨 |
| M_KSM | 38.9MB |
| T_KSM | 19.1MB |
| Batch_Kasumi | 8.0MB |

### 取込状況テーブル（直近の取込結果）

| 日時 | StoreCode | Class | TableName | FileName |
|---|---|---|---|---|
| 2026-03-11 02:06 | 343 | POS Server | PLUマスタ・特売マスタ | ItemMaster_*.csv / SpecialPriceKsmMaster_*.csv |
| 2026-03-11 01:53 | 218 | POS Server | PLUマスタ・特売マスタ | 同上 |
| 2026-03-11 01:54 | 253 | POS Server | PLUマスタ・特売マスタ | 同上 |
| 2026-03-10 | 218 | ESL | 棚札売価情報 | ESLDATA.TXT |

**⚠️ SH（P003）の取込状況レコードは存在しない**
→ 取込状況への書き込み前にタイムアウトしていることを示す

### VPN 接続状態

| Tunnel | IP | 状態 | 最終変更 |
|---|---|---|---|
| T1 | 3.115.250.166 | **UP** ✅ | 2026-02-25 |
| T2 | 18.178.240.88 | **DOWN** 🔴 | **2026-02-24 01:26（約2.5週間）** |


---

## 28. EC2内 アプリ構成（2026-03-11 SSM調査）

### bastion (i-0bd9a4db1b74b5a69)

**OSユーザー一覧（/home/配下）:**
| ユーザー | 最終アクセス | 備考 |
|---|---|---|
| ec2-user | Feb 11 11:56 | メインユーザー |
| buithephong | Jan 7 06:37 | Luvinnaメンバー個人アカウント |
| kiyohara | Jul 17 2025 | 木原さん個人アカウント |
| kiyohara_s3 | Jul 17 2025 | S3アクセス用 |
| dev | Jun 24 2025 | ⚠️ 汎用開発ユーザー |

**OpenVPN サーバー設定（/etc/openvpn/server.conf）:**
```
port 1194
proto udp
dev tun
ca ca.crt / cert server.crt / key server.key / dh dh.pem
server 10.239.2.128 255.255.255.128   ← ⚠️ 重大問題
client-config-dir /etc/openvpn/ccd
```

> 🚨 **重大問題: OpenVPN のIPプール `10.239.2.128/25` が private-1a サブネット(10.239.2.128/25) と完全に重複**  
> VPNクライアントに払い出すIPと、Lambda・ECS・EC2が使用するプライベートIPが同一レンジ。  
> IPアドレス競合が発生する可能性があり、障害の潜在的原因になりうる。  
> **Client VPN（AWS管理）への完全移行後、このOpenVPNは廃止が急務。**

---

### web-be (i-06a74666e851e4d12)

**実行中プロセス:**
| プロセス | 実行ユーザー | 起動時期 | 詳細 |
|---|---|---|---|
| `java -jar ishida-20251217-1.jar --server.port=8081` | **root** | 2025年 | 🔴 **rootで本番Javaアプリ実行** / 215時間稼働 |
| `nginx: master process` | root/www-data | Feb 13 | リバースプロキシ（:8081→nginx） |

**ファイル構成（/home/dev/）:**
```
/home/dev/
├── ishida-20251217-1.jar          ← 実行中（Javaアプリ本体）
├── pos-ishida-api.jar             ← 旧バージョン？
├── gift##260107-01.jar            ← ⚠️ giftcard関連JAR（2026-01-07）
├── gift##260106-01.jar            ← ⚠️ giftcard関連JAR（2026-01-06）
├── ishida-api.log
├── gift-api.log
├── logo_header_kasumi.svg
├── awscliv2.zip                   ← AWS CLI インストーラ残留
└── logs/
    ├── gift-api.log
    └── giftcard/                  ← ⚠️ giftcard系ログ多数（2025-12-22〜2026-01-08）
```

**重大な問題点:**

| # | 問題 | リスク |
|---|---|---|
| 1 | **rootでJavaアプリ実行** | アプリ侵害時にサーバー全体乗っ取り可能 |
| 2 | **giftcardアプリ（JAR・ログ）がweb-beに混在** | giftcardはWindows EC2(giftcard)が別にあるはずなのに、web-be上でも動作している可能性 |
| 3 | **JARファイルが/home/dev/直下に散在** | バージョン管理・デプロイ管理なし |
| 4 | **devユーザーで本番運用** | 汎用アカウントで本番稼働（権限管理不明） |
| 5 | **awscliv2.zipが残留** | 不要ファイル（軽微） |
| 6 | **最新JARが2025-12-17** | 最終更新から約3ヶ月経過 |

> ⚠️ giftcard関連JAR（gift##260107-01.jar等）がweb-be上に存在する理由を要確認。  
> Windows EC2(giftcard, i-0f8ededc7ae313cbe)とweb-beが同じgiftcard APIを提供している二重管理の可能性。

---

### Transfer Family SSH公開鍵（2026-03-11確認）

| サーバー | ユーザー | 鍵ID | 登録日 | コメント（送信元） | 評価 |
|---|---|---|---|---|---|
| s-7c808e1040dd437da (OC用) | ksm-posstg-tf-user-oc | key-cbabc5e69f4b4db6a | 2025-06-13 | u2022096@W300000000692 | ✅ OC端末 |
| s-7c808e1040dd437da (OC用) | ksm-posstg-tf-user-oc | key-0c3826bf105040e5b | 2025-07-01 | (2本目) | 🟡 2本登録・古い方は削除検討 |
| s-7c808e1040dd437da (OC用) | ksm-posstg-tf-user-oc | key-da05fa7f2517477c8 | 2025-07-01 | (3本目) | 🟡 3本登録・整理要 |
| s-d5d0d941bfb04a72b (SG用) | ksm-posstg-tf-user-sg | key-541a9f09dd864e6c9 | 2025-06-26 | **root@ip-10-239-2-4** | 🔴 **bastionで生成したキー！外部パートナー鍵ではなく内部生成** |
| s-a69b3df467bc43b99 (SH用) | ksm-posstg-tf-user-sh | key-17e5bd1140974c418 | 2025-11-21 | (コメントなし) | 🟡 送信元不明 |

> 🔴 **重大: tf-user-sg の SSH鍵コメントが `root@ip-10-239-2-4.ap-northeast-1.compute.internal`（bastionのホスト名）**  
> これはカスミ・SGの外部システムが使う鍵ではなく、bastion上でroot権限で生成した鍵を登録している。  
> セキュリティ上、rootで生成した鍵は問題。外部パートナーが提供した公開鍵に差し替えるべき。  
> また、tf-user-oc に3本の鍵が登録されている（通常は1本）。2025-06-13の最初の鍵が不要なら削除要。


# AWS現状サマリー STG

最終更新: 2026-03-10  
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
| NAT GW Public IP | 52.196.152.170 |

サブネット: public/private/protected/common × 1a/1c（計8本）

---

## 2. EC2

| 名前 | プライベートIP | AZ | 用途 |
|---|---|---|---|
| bastion(STG) | 10.239.2.4 | 1a | 踏み台・Client VPN接続先 |
| giftcard(STG) | 10.239.2.193 | 1a | Windows t2.large | ギフトカード決済処理 |
| web-be | 10.239.2.195 | 1a | Linux t3.medium | ⚠️ 【STG独自】SG: ALL(-1)全通信許可（要修正）|
| web-fe | 10.239.2.253 | 1a | Linux t3.medium | ⚠️ 【STG独自】|

【PRD/STG差異】PRDはEC2 2台（bastion/giftcard）/ STGはEC2 4台（bastion/giftcard/web-be/web-fe）

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

**【PRD/STG差異】PRD=21関数 / STG=23関数（2関数多い）**

主要関数（PRDと同等のものに加えて）:
- PRDと同名のほぼ全関数が ksm-posstg- プレフィックスで存在
- `night-export-sg` のターゲット Lambda は PRD/STG 同じ構成で ENABLED

---

## 5. S3バケット（8本）

### プロジェクト管理バケット（5本）

| バケット名 | 用途 |
|---|---|
| stg-ignica-ksm | メイン（pos-original/oc・sg・sh） |
| stg-ignica-ksm-pmlogs | PMログ |
| stg-aeon-gift-card | ギフトカード |
| stg-ignica-com-configrecord | 設定レコード |
| dev-ignica-ksm | **Lambda JARファイル置き場**（PRDのprd-ignica-com-lmd-jarに相当）※名前がdevだが現役稼働中（16件・340MB・最終更新2026-03-06） |

### AWSサービス自動生成バケット（3本）

| バケット名 | 自動生成元 | 用途 |
|---|---|---|
| aws-quicksetup-patchpolicy-750735758916-v4t88 | SSM Quick Setup | パッチポリシー設定用 |
| aws-quicksetup-patchpolicy-access-log-750735758916-a4fd-v4t88 | SSM Quick Setup | アクセスログ用（上記のペア） |
| do-not-delete-ssm-diagnosis-750735758916-ap-northeast-1-89e4k | SSM診断機能 | 削除禁止 |

> **【削除済】2026-03-10** `phongbt-auditor-staging`（中身空・CloudTrail未使用バケット）を削除。PRDのphongbt-auditor-productionと同一パターン。

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

PRDと同等の7本（プレフィックスが ksm-posstg- に変わるのみ）

---

## 8. SQS（2 FIFOキュー）

- ksm-posstg-sqs-export-queue-sg.fifo
- ksm-posstg-sqs-store-code-queue-sg.fifo

---

## 9. EventBridge

| ルール名 | スケジュール | JST | 状態 | 備考 |
|---|---|---|---|---|
| eb-rule-check-p001-price | - | - | **ENABLED** | **【STG独自・PRD/STG差異】PRDはDISABLED** |
| eb-rule-night-export-sg | cron(30 20 * * ? *) | 05:30 | **ENABLED** | PRDと同じ |
| eb-rule-receive-pos-master-oc | S3 | - | ENABLED | - |
| eb-rule-receive-pos-master-sg | S3 | - | ENABLED | - |
| eb-rule-receive-pos-master-sh | S3 | - | ENABLED | - |
| eb-rule-create-txt-file-sg | S3 | - | ENABLED | - |
| **ksm-posstg-eb-rule-receive-pos-master-sg-9233** | - | - | **DISABLED** | 🔴 **【STG独自】店舗9233向けテスト残骸** → 改修依頼 No.14 |
| **ksm-posstg-eb-rule-create-txt-file-sg-9233** | - | - | **DISABLED** | 🔴 **【STG独自】同上** → 改修依頼 No.14 |
| **ksm-posstg-eb-rule-night-export-sg-9233** | - | - | **DISABLED** | 🔴 **【STG独自】同上** → 改修依頼 No.14 |

**【STG独自】-9233 系 DISABLED ルール 3本が残存（PRDにはなし）**  
**【PRD/STG差異】Inspector ルール: PRDにあり（6本）/ STGになし**

---

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

| トピック名 | 備考 |
|---|---|
| ksm-posstg-sns-topic-app-logs | PRD同等 |
| ksm-posstg-sns-topic-app-logs-check-price | STG独自（価格チェック専用） |
| ksm-posstg-sns-topic-aws-logs | PRD同等 |
| **ksm-posspk-sns-topic-app-logs-dev** | 🚨 **posspk とは？開発環境用の残留物？** |

## 18. CloudWatch（アラーム19本 / ロググループ41本）

**■ アラーム（PRDと同数19本）**

| 状態 | アラーム名 |
|---|---|
| ✅ OK（手動リセット済） | ksm-posstg-cw-alarm-ec2-audit-log |
| ✅ OK（手動リセット済） | ksm-posstg-cw-alarm-ec2-messages |
| OK | その他17本（RDS・EC2・Transfer系） |

> ✅ **2026-03-10 手動リセット済**。原因：2025-07-31のPAMセッション終了時 `res=failed` をフィルター `*fail*` が誤検知（False Positive）。bastionは正常稼働中。フィルターパターンの見直しはPending。

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

| ユーザー名 | PRD比較 |
|---|---|
| kiyohara / daisuke.sasaki_s3access / kiyohara_s3access | ✅ 同等 |
| cfn_user / dattv / buithephong | ✅ 同等 |
| dattv_cli_deploy / locnt_cli_deploy / nangld_admin / nangld_readonly | ✅ 同等 |
| posusmhstg | ✅ STG用USMH連携 |
| pos_stag_vangle_sonln / pos_stag_vangle_tuannv | ✅ STG用Vangle |
| **locnt** | 🔍 STG独自（PRDにはlocnt_deployのみ） |
| **dev** | 🔍 STG独自（開発用汎用アカウント？要確認） |

> PRDに比べ: manhnd-serviceaccess / locnt_deploy / pos_prd_vangle_* がSTGにはない

## 22. Secrets Manager（7件 / PRD同等）

| シークレット名 | 対応 |
|---|---|
| ksm-posstg-sm-db / db-replica / sftp | ✅ PRD同等 |
| stg/Mail_Kasumi / Batch_Kasumi / Replica_Kasumi / Replica_Kasumi_RO | ✅ PRD同等 |

## 23. 未使用・空サービス（STG）

| サービス | 状態 |
|---|---|
| Glue | ジョブなし（空）|
| X-Ray | Defaultのみ（PRD同等）|
| Location Service / Payment Cryptography / Direct Connect | 未確認だが空と推定 |


## 24. 不要リソース（削除候補・承認待ち）

| リソース | 種別 | 理由 | 状態 |
|---|---|---|---|
| ksm-posspk-sns-topic-app-logs-dev | SNS | Luvina開発環境残留物（サブスクライバー: Luvina社員のみ） | 削除未実施 |
| ksm-posstg-ecr-web-fe | ECR | イメージ0件・未使用 | 削除未実施 |
| ksm-posstg-ecr-web-be | ECR | イメージ0件・未使用 | 削除未実施 |

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

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

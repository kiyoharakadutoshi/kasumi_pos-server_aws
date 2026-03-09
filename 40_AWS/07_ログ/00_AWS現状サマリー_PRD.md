# AWS現状サマリー PRD

最終更新: 2026-03-09  
AWSアカウント: 332802448674

---

## 1. VPC・ネットワーク基本構成

| 項目 | 値 |
|---|---|
| VPC ID | vpc-0e2d2d27b6860b7fc |
| CIDR | 10.238.0.0/16 |
| AZ | ap-northeast-1a + 1c |
| NAT GW Public IP | **57.182.174.110** |

サブネット: public/private/protected/common × 1a/1c

---

## 2. EC2

| 名前 | タイプ | プライベートIP | AZ | 用途 |
|---|---|---|---|---|
| bastion | t3.xlarge | 10.238.2.39 | 1a | 踏み台・OpenVPN(UDP1194) |
| giftcard | t2.large | 10.238.2.198 | 1a | ギフトカード処理 |

---

## 3. RDS（Aurora MySQL 8.0）

| クラスター | プライマリ | レプリカ | Multi-AZ |
|---|---|---|---|
| instance-1 | db.r5.2xlarge | db.t3.medium | False |
| instance-2 | db.r5.2xlarge | db.t3.medium | False |

Secrets Manager: ksm-posprd-sm-db / db-replica / sftp / prd/Mail_Kasumi / Batch_Kasumi / Replica_Kasumi

---

## 4. Lambda（21関数）

主要ランタイム: Java17 / python3.13 / python3.11  
主要関数:
- export-polling / zipfile-polling
- trigger-sqs-export-sg / trigger-sqs-import-sg
- **sent-txt-file**（USMH向け平文FTP送信）
- get-sync-store（FTP接続先情報取得）

---

## 5. S3バケット

| バケット名 | 用途 |
|---|---|
| prd-ignica-ksm | メイン（pos-original/oc・sg・sh） |
| prd-ignica-ksm-master-backup | マスターバックアップ |
| prd-ignica-ksm-pmlogs | PMログ |
| prd-ignica-com-lmd-jar | Lambda JARファイル |
| prd-aeon-gift-card | ギフトカード |
| prd-ignica-com-configrecord | 設定レコード |

---

## 6. Transfer Family（受信専用）

| サーバー名 | サーバーID | VPC EP | S3受信先 | 送信元 |
|---|---|---|---|---|
| ksm-posprd-tf-server-oc | s-2a4905e8210f48248 | vpce-00da0e948a06819d1 | /prd-ignica-ksm/pos-original/oc/receive | BIPROGY（OpenCentral） |
| ksm-posprd-tf-server-sg | s-bd974a35aa994c838 | vpce-0c489e9240780e92b | /prd-ignica-ksm/pos-original/sg/receive | VINX（POS Server） |
| ksm-posprd-tf-server-sh | s-5546031218784c4ba | vpce-0bb018fa328a44d12 | /prd-ignica-ksm/pos-original/sh/receive | SHARP（P003） |

VPC: vpc-0e2d2d27b6860b7fc  
サブネット: subnet-0d125718b8c5c5a23 / subnet-030f7db5506682c07  
IAMロール: ksm-posprd-iam-role-tf  
CFnスタック: ksm-posprd-transfer（OC・SG）、SHはタグなし手動追加

---

## 7. Step Functions（7関数）

| 名前 | 系統 |
|---|---|
| receive-pos-master-oc | OC受信 |
| import-pos-master-oc | OC投入 |
| create-txt-file-oc | OC変換 |
| receive-and-import-pos-master-sg | SG受信・投入 |
| create-txt-file-sg | SG変換 |
| import-pos-master-sh | SH投入 |
| sent-txt-file | USMH送信 |

---

## 8. SQS（2 FIFOキュー）

- ksm-posprd-sqs-export-queue-sg.fifo
- ksm-posprd-sqs-store-code-queue-sg.fifo

---

## 9. ネットワーク接続

### Luvina → PRD（Client VPN）
- Bastion: 10.238.2.39（UDP 1194 / OpenVPN）

### USMH閉域網 ↔ PRD（Site-to-Site VPN）
- VPN ID: vpn-0ea9b7895f78e4c7e
- CGW IP: 14.224.146.153（TP-Link ER605 / Luvina固定IP）
- T1: 35.79.95.18（**UP**）
- T2: 52.192.144.197（**DOWN** ※2026-02-19から継続中）
- USMH側CIDR: 10.156.96.0/24 / 172.21.10.0/24 / 10.156.96.192/26

### NATアドレス変換
| 方向 | 変換前 | 変換後 | 宛先 |
|---|---|---|---|
| Luvina→AFSオーソリ | 10.238.2.39 | 10.156.96.220 | 192.168.60.10:1501-1508 |
| ギフト端末→Luvina | 10.0.0.0/8 | 10.156.96.214 | 10.238.2.198 |

### NTTデータ CDS（SFTP送信）
- Lambda(sent-txt-file) → NAT GW(57.182.174.110) → インターネット → **210.144.93.17:22**

---

## 10. Lambda `sent-txt-file` 詳細

| 項目 | 内容 |
|---|---|
| 関数名 | ksm-posprd-lmd-function-sent-txt-file |
| ランタイム | Java17 |
| ハンドラー | com.luvina.pos.provider.SentFileHandler::handleRequest |
| プロトコル | **平文FTP**（Apache Commons Net FTPClient） |
| 暗号化 | **なし** |
| 送信先 | USMH側FTPサーバー `/{storeCode}/Recv` |
| 接続情報取得元 | Aurora MySQL（get-sync-store Lambda経由） |
| セキュリティリスク | VPN内通信のため実害低いが、平文FTPは改善推奨 |

---

## 11. Transfer Family セキュリティグループ

全Transfer Family VPC EP（3台共通）:
- **SG ID: sg-0d8afd91c37a78137**
- SG名: ksm-posprd-vpc-sg-ep-tf

**インバウンドルール:**

| プロトコル | ポート | 許可元CIDR | 説明 |
|---|---|---|---|
| TCP | 22 (SFTP) | **10.156.96.192/26** | For SFTP Inbound（USMH SFTP専用セグメント） |

**確認結果:** ✅ 理想的な設定
- SFTP接続を**USMH閉域網内のSFTP専用セグメント（10.156.96.192/26）のみ**に制限
- インターネットからの直接アクセス完全遮断
- OC/SG/SH各送信元（BIPROGY・VINX・SHARP）はこのセグメント経由でUSMH網からSFTP接続

---

## 12. EventBridge

| ルール | Cron(UTC) | JST |
|---|---|---|
| P001監視 | cron(00 15 * * ? *) | 00:00 |
| ItemMaster | cron(30 20 * * ? *) | 05:30 |

---

## 11. セキュリティ状況

| サービス | 状態 |
|---|---|
| GuardDuty | ✅ 有効 |
| CloudTrail | ✅ 有効 |
| Security Hub | ✅ 有効 |
| VPC Flow Logs | ⚠️ REJECTのみ |
| MFA | ⚠️ 未強制 |
| rootアカウント | ⚠️ 日常使用中 |
| PowerUserAccess(lmd) | 🔴 付与中 |
| api-be ALB | ✅ internal |

---

## 12. VPN T2 復旧（未対応）

TP-Link ER605にT2（52.192.144.197）のトンネル設定追加が必要。  
担当: マイさん・木村さん（Luvina社内）  
PSK: IW0qWI7Y7NzeEJltlkehmTKo6HrtPIhP

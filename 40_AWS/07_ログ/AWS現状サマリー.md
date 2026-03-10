# AWS現状サマリー

最終更新: 2026-03-09

| 項目 | 内容 |
|---|---|
| PRDアカウント | 332802448674 |
| STGアカウント | 750735758916 |
| リージョン | ap-northeast-1 |

---

## 1. VPC・ネットワーク基本構成

| 項目 | PRD | STG |
|---|---|---|
| VPC ID | vpc-0e2d2d27b6860b7fc | vpc-09bc4a6da904ace31 |
| CIDR | 10.238.0.0/16 | 10.239.0.0/16 |
| AZ | 1a + 1c | 1a + 1c |
| NAT GW Public IP | 57.182.174.110 | - |

**サブネット構成（PRD）:**
- public × 1a/1c
- private × 1a/1c
- protected × 1a/1c
- common × 1a/1c

---

## 2. EC2

| 名前 | タイプ | プライベートIP | AZ | 用途 |
|---|---|---|---|---|
| bastion | t3.xlarge | 10.238.2.39 | 1a | 踏み台・OpenVPN(UDP1194) |
| giftcard | t2.large | 10.238.2.198 | 1a | ギフトカード処理 |

App Server / Batch Server は存在しない（Lambda/ECS Fargate で代替）

---

## 3. RDS（Aurora MySQL 8.0）

| クラスター | プライマリ | レプリカ | Multi-AZ |
|---|---|---|---|
| instance-1 | db.r5.2xlarge | db.t3.medium | False |
| instance-2 | db.r5.2xlarge | db.t3.medium | False |

Secrets Manager:
- ksm-posprd-sm-db / db-replica / sftp
- prd/Mail_Kasumi / Batch_Kasumi / Replica_Kasumi

---

## 4. Lambda（PRD: 21関数）

主要ランタイム: Java17（ksm-posprd系）、python3.13/python3.11
メモリ: 128〜2048MB、タイムアウト: 300〜900s

主要関数:
- export-polling / zipfile-polling
- trigger-sqs-export-sg / trigger-sqs-import-sg
- sent-txt-file（USMH向け平文FTP送信）
- get-sync-store（FTP接続先情報取得）

---

## 5. S3バケット（PRD）

| バケット名 | 用途 |
|---|---|
| prd-ignica-ksm | メイン（pos-original/oc・sg・sh） |
| prd-ignica-ksm-master-backup | マスターバックアップ |
| prd-ignica-ksm-pmlogs | PMログ |
| prd-ignica-com-lmd-jar | Lambda JARファイル |
| prd-aeon-gift-card | ギフトカード |
| prd-ignica-com-configrecord | 設定レコード |

---

## 6. Transfer Family

### 受信専用（外部 → AWS）

#### PRD

| サーバー名 | サーバーID | VPC EP | S3受信先 | 送信元 |
|---|---|---|---|---|
| ksm-posprd-tf-server-oc | s-2a4905e8210f48248 | vpce-00da0e948a06819d1 | /prd-ignica-ksm/pos-original/oc/receive | BIPROGY（OpenCentral） |
| ksm-posprd-tf-server-sg | s-bd974a35aa994c838 | vpce-0c489e9240780e92b | /prd-ignica-ksm/pos-original/sg/receive | VINX（POS Server） |
| ksm-posprd-tf-server-sh | s-5546031218784c4ba | vpce-0bb018fa328a44d12 | /prd-ignica-ksm/pos-original/sh/receive | SHARP（P003） |

CFnスタック: `ksm-posprd-transfer`（OC・SG）、SHはタグなし手動追加
認証: SERVICE_MANAGED / IAMロール: ksm-posprd-iam-role-tf
ログロール: ksm-posprd-iam-role-tf-logs（OC・SG）、SHはログなし

#### STG

| サーバー名 | サーバーID | VPC EP | S3受信先 | 送信元 |
|---|---|---|---|---|
| ksm-posstg-tf-server-oc | s-7c808e1040dd437da | vpce-003c773c1f3807562 | /stg-ignica-ksm/pos-original/oc/receive | BIPROGY（OpenCentral） |
| ksm-posstg-tf-server-sg | s-d5d0d941bfb04a72b | vpce-0b7fe3eac68ea1d3b | /stg-ignica-ksm/pos-original/sg/receive | VINX（POS Server） |
| ksm-posstg-tf-server-sh | s-a69b3df467bc43b99 | vpce-00ef51cdd11a09ae1 | /stg-ignica-ksm/pos-original/sh/receive | SHARP（P003） |

CFnスタック: `ksm-posstg-transfer`（OC・SG）、SHはタグなし手動追加

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

### Luvina ↔ AWS（Client VPN / OpenVPN）

- PRD接続先: Bastion 10.238.2.39（UDP 1194）
- STG接続先: 10.239.2.4（UDP 1194）
- VPN接続後にBastionを踏み台としてRDS等内部リソースにアクセス

### USMH閉域網 ↔ AWS（Site-to-Site VPN）

- VPN ID: vpn-0ea9b7895f78e4c7e
- CGW IP: 14.224.146.153（TP-Link ER605）
- T1: 35.79.95.18（**UP**）/ T2: 52.192.144.197（**DOWN** ※2026-02-19から35日間）
- USMH側CIDR: 10.156.96.0/24 / 172.21.10.0/24 / 10.156.96.192/26

### NATアドレス変換

| 方向 | 変換前 | 変換後 | 宛先 |
|---|---|---|---|
| Luvina→AFSオーソリ(PRD) | 10.238.2.39 | 10.156.96.220 | 192.168.60.10:1501-1508 |
| Luvina→AFSオーソリ(STG) | 10.239.2.4 | 10.156.96.221 | 192.168.60.100 |
| ギフト端末→Luvina(PRD) | 10.0.0.0/8 | 10.156.96.214 | 10.238.2.198 |
| ギフト端末→Luvina(STG) | 10.0.0.0/8 | 10.156.96.214 | 10.239.2.193 |

### NTTデータ CDS（SFTP送信）

- 経路: Lambda(sent-txt-file) → NAT GW(57.182.174.110) → インターネット → CDS本番 210.144.93.17:22
- 試験環境: 210.144.93.18:22
- 認証: SSH公開鍵認証

---

## 10. EventBridge

| ルール | Cron(UTC) | JST実行時刻 |
|---|---|---|
| P001監視 | cron(00 15 * * ? *) | 00:00 |
| ItemMaster | cron(30 20 * * ? *) | 05:30 |

---

## 11. Route53

- ゾーン: ignicapos.com（パブリック）

---

## 12. セキュリティ状況

| サービス | PRD | STG |
|---|---|---|
| GuardDuty | ✅ 有効 | 🔴 無効 |
| CloudTrail | ✅ 有効 | 🔴 無効 |
| Security Hub | ✅ 有効 | 🔴 無効 |
| VPC Flow Logs | ⚠️ REJECTのみ | 不明 |
| MFA | ⚠️ 未強制 | ⚠️ 未強制 |
| rootアカウント | ⚠️ 日常使用中 | - |
| web-be SG | - | 🔴 全通信許可(-1) |
| api-be ALB | ✅ internal | 🔴 internet-facing |
| PowerUserAccess(lmd) | 🔴 付与中 | 🔴 付与中 |

---

## 13. VPN T2 復旧（未対応）

TP-Link ER605にT2（52.192.144.197）のトンネル設定追加が必要。
担当: マイさん・木村さん（Luvina社内）

設定値:
- リモートGW: 52.192.144.197
- PSK: IW0qWI7Y7NzeEJltlkehmTKo6HrtPIhP
- 暗号設定: T1と同じ

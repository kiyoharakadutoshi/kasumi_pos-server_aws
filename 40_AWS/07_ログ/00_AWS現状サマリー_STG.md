# AWS現状サマリー STG

最終更新: 2026-03-09  
AWSアカウント: 750735758916

---

## 1. VPC・ネットワーク基本構成

| 項目 | 値 |
|---|---|
| VPC ID | vpc-09bc4a6da904ace31 |
| CIDR | 10.239.0.0/16 |
| AZ | ap-northeast-1a + 1c |

サブネット: public/private/protected/common × 1a/1c

---

## 2. EC2

| 名前 | タイプ | プライベートIP | AZ | 用途 |
|---|---|---|---|---|
| bastion(STG) | - | 10.239.2.4 | 1a | 踏み台・OpenVPN(UDP1194) |
| giftcard(STG) | - | 10.239.2.193 | 1a | ギフトカード処理 |

---

## 3. Transfer Family（受信専用）

| サーバー名 | サーバーID | VPC EP | S3受信先 | 送信元 |
|---|---|---|---|---|
| ksm-posstg-tf-server-oc | s-7c808e1040dd437da | vpce-003c773c1f3807562 | /stg-ignica-ksm/pos-original/oc/receive | BIPROGY（OpenCentral） |
| ksm-posstg-tf-server-sg | s-d5d0d941bfb04a72b | vpce-0b7fe3eac68ea1d3b | /stg-ignica-ksm/pos-original/sg/receive | VINX（POS Server） |
| ksm-posstg-tf-server-sh | s-a69b3df467bc43b99 | vpce-00ef51cdd11a09ae1 | /stg-ignica-ksm/pos-original/sh/receive | SHARP（P003） |

VPC: vpc-09bc4a6da904ace31  
サブネット: subnet-08999673be546d752 / subnet-0d4bb4d8d559e39b1  
IAMロール: ksm-posstg-iam-role-tf  
CFnスタック: ksm-posstg-transfer（OC・SG）、SHはタグなし手動追加

---

## 4. ネットワーク接続

### Luvina → STG（Client VPN）
- Bastion: 10.239.2.4（UDP 1194 / OpenVPN）

### NATアドレス変換
| 方向 | 変換前 | 変換後 | 宛先 |
|---|---|---|---|
| Luvina→AFSオーソリ | 10.239.2.4 | 10.156.96.221 | 192.168.60.100 |
| ギフト端末→Luvina | 10.0.0.0/8 | 10.156.96.214 | 10.239.2.193 |

---

## 5. セキュリティ状況（問題多数）

| サービス | 状態 |
|---|---|
| GuardDuty | 🔴 **無効** |
| CloudTrail | 🔴 **無効** |
| Security Hub | 🔴 **無効** |
| VPC Flow Logs | 不明 |
| MFA | ⚠️ 未強制 |
| PowerUserAccess(lmd) | 🔴 付与中 |
| web-be SG | 🔴 **全通信許可(-1)** |
| api-be ALB | 🔴 **internet-facing** |

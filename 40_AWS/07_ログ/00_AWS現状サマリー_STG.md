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
| bastion(STG) | 10.239.2.4 | 1a | 踏み台・OpenVPN(UDP1194) |
| giftcard(STG) | 10.239.2.193 | 1a | ギフトカード決済処理 |
| web-be | - | - | ⚠️ **【STG独自】SG: ALL(-1)→0.0.0.0/0 全通信許可（要即時修正）** |

**【PRD/STG差異】PRDはEC2 2台 / STGはEC2 3台（web-be追加）**

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

## 5. S3バケット

| バケット名 | 用途 |
|---|---|
| stg-ignica-ksm | メイン（pos-original/oc・sg・sh） |
| stg-ignica-ksm-master-backup | バックアップ |
| stg-ignica-ksm-pmlogs | PMログ |
| その他 | PRDと対応するバケット |

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

### Luvina → STG（OpenVPN）
Bastion: 10.239.2.4（UDP 1194）

### USMH閉域網 ↔ STG（IPSec Site-to-Site VPN）

| 項目 | 値 |
|---|---|
| T1 | UP |
| T2 | **DOWN** |
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
| EC2台数 | 2台（bastion/giftcard） | 3台（+web-be） |
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

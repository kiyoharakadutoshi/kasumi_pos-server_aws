# AWS現状サマリー（カスミPOS 本番環境）

> **このファイルは内容別の最新状態まとめです。**  
> 調査のたびに該当セクションを上書き更新してください。  
> 調査の生ログ（時系列）は `YYYYMMDD_CloudShell調査ログ.md` を参照。

| 項目 | 内容 |
|---|---|
| **AWSアカウント** | 332802448674 |
| **リージョン** | ap-northeast-1（東京） |
| **最終更新** | 2026-03-08 |

---

## 1. VPC・ネットワーク

**最終調査**: 2026-03-08 → ログ [1][6]

| 項目 | 値 |
|---|---|
| VPC ID | vpc-0e2d2d27b6860b7fc |
| CIDR | 10.238.0.0/16 |
| AZ | ap-northeast-1a / ap-northeast-1c |
| サブネット構成 | public/private/protected × 1a・1c + common × 1a・1c |
| NAT GW Public IP | 57.182.174.110 |
| Route53 | ignicapos.com（パブリックゾーン） |
| ALB | なし |
| WAF | なし |
| RDS Proxy | なし |

---

## 2. EC2

**最終調査**: 2026-03-08 → ログ [1]

| 名前 | インスタンスタイプ | プライベートIP | AZ | 用途 |
|---|---|---|---|---|
| bastion | t3.xlarge | 10.238.2.39 | 1a | 踏み台・OpenVPN |
| giftcard | t2.large | 10.238.2.198 | 1a | ギフトカード処理 |

> App Server / Batch Server は **存在しない**（Lambda で代替）

---

## 3. RDS（Aurora MySQL 8.0）

**最終調査**: 2026-03-08 → ログ [2][3][11]

| クラスター | ロール | インスタンスタイプ | エンドポイント種別 |
|---|---|---|---|
| ksm-posprd-db-cluster（instance-1） | Writer | db.r5.2xlarge | cluster-cxekgmegw02x |
| ksm-posprd-db-cluster（instance-2） | Reader | db.t3.medium | cluster-ro-cxekgmegw02x |
| ksm-posprd-db-cluster-2（instance-1） | Writer | db.r5.2xlarge | 別クラスター |
| ksm-posprd-db-cluster-2（instance-2） | Reader | db.t3.medium | 別クラスター |

- Multi-AZ: **False**
- CPU使用率: 最大 **0.015%**（著しく過剰スペック）
- Reader接続: 週5時間のみ

---

## 4. Lambda

**最終調査**: 2026-03-08 → ログ [4][12][14]

| 関数名（ksm-posprd-lmd-function-） | Runtime | Memory | Timeout | 用途 |
|---|---|---|---|---|
| oc-import-data | Java17 | 2048MB | 900s | OC系取込 |
| sg-import-data | Java17 | 2048MB | 900s | SG系取込 |
| sh-import-data | Java17 | 2048MB | 900s | SH系取込 |
| sent-txt-file | Java17 | 512MB | 900s | USMH向けFTP送信 |
| create-file-end-for-night | Java17 | 512MB | 300s | SG夜間トリガー生成 |
| get-sync-store | Java17 | 128MB | 300s | 店舗情報取得 |
| *(その他計15関数)* | Java17/Python | 128〜512MB | 300s | 補助処理 |

**Secrets Manager 参照先（主要）**:

| Lambda | Secret ID | 接続先 |
|---|---|---|
| create-file-end-for-night | prd/Replica_Kasumi | Writerエンドポイント（Reader変更対象） |
| create-file-end-for-night | prd/Batch_Kasumi | Writerエンドポイント |
| sent-txt-file | なし（DBからFTP接続先を取得） | — |

---

## 5. Transfer Family（SFTP受信）

**最終調査**: 2026-03-08 → ログ [5][13][16]

| サーバーID | 状態 | 用途 | S3パス | 認証 |
|---|---|---|---|---|
| s-2a4905e8210f48248 | ONLINE | OC系（外部連携受信） | LOGICAL マッピング | SERVICE_MANAGED |
| s-bd974a35aa994c838 | ONLINE | SG系（POSデータ受信） | — | SERVICE_MANAGED |
| s-5546031218784c4ba | ONLINE | SH系（棚情報受信） | /prd-ignica-ksm/pos-original/sh/receive/ | SERVICE_MANAGED |

- SH系は **2025-11 追加** → コスト増の真因
- **受信専用**（BytesOut = 0）
- CloudWatchメトリクス（過去30日）: OC系 FilesIn=304 / SG系 FilesIn=3,007 / SH系 FilesIn=60

---

## 6. VPN・外部接続

**最終調査**: 2026-03-08 → ログ [6][17]

### USMH閉域網との接続（Site-to-Site VPN）

| 項目 | 値 |
|---|---|
| VPN ID | vpn-0ea9b7895f78e4c7e |
| 種別 | IPSec Site-to-Site VPN |
| CGW IP | 14.224.146.153（BGP ASN=65000） |
| Tunnel T1 | **UP** ✅ |
| Tunnel T2 | **DOWN** ⚠️（冗長性なし） |
| USMH側CIDR | 10.156.96.0/24 / 172.21.10.0/24 / 10.156.96.192/26 |

### LUVINA社内 → AWS接続（Client VPN）

| 項目 | 値 |
|---|---|
| 接続方式 | AWS Client VPN（OpenVPNベース） |
| プロトコル/ポート | UDP 1194 |
| PRD接続先 | Bastion EC2（10.238.2.39）sg-ec2-bastion |
| STG接続先 | 10.239.2.4 |
| VPN後の接続先 | RDS（TCP 3306）/ Lambda / Transfer Family 等 |

---

## 7. S3 バケット

**最終調査**: 2026-03-08 → ログ [7][16]

| バケット名 | 用途 |
|---|---|
| prd-ignica-ksm | メイン（全ファイル集約） |
| prd-ignica-ksm-master-backup | マスタバックアップ |
| prd-ignica-ksm-pmlogs | PMログ |
| prd-ignica-com-lmd-jar | Lambda JARデプロイ |
| prd-aeon-gift-card | ギフトカード |
| prd-ignica-com-configrecord | 設定記録 |

- S3→Lambda/SQS 直接トリガー: **なし**（EventBridge経由のみ）
- EventBridge連携: `EventBridgeConfiguration: {}` で全イベントをEBに転送

---

## 8. EventBridge・Step Functions・SQS

**最終調査**: 2026-03-08 → ログ [8][16]

### EventBridgeルール（主要）

| ルール名 | トリガー条件 |
|---|---|
| receive-pos-master-oc | S3: pos-original/oc/receive/*.end|*.END |
| receive-pos-master-sg | S3: SG系トリガー |
| receive-pos-master-sh | S3: pos-original/sh/receive/*.end|*.END |
| receive-splited-pos-master-oc | S3: OC分割ファイル |
| night-export-sg | cron（SG夜間エクスポート） |
| p001-import-monitoring | cron(00 15 * * ? *) / JST 00:00 |
| itemmaster-import-monitoring | cron(30 20 * * ? *) / JST 05:30 |

### Step Functions（7本）

| SF名 | 系統 |
|---|---|
| receive-pos-master-oc | OC受信 |
| import-pos-master-oc | OC取込 |
| create-txt-file-oc | OC送信ファイル生成 |
| receive-and-import-pos-master-sg | SG受信・取込 |
| create-txt-file-sg | SG送信ファイル生成 |
| import-pos-master-sh | SH取込 |
| sent-txt-file | USMH向け送信（共通） |

### SQS（2本 / FIFO・SG専用）

| キュー名 |
|---|
| ksm-posprd-sqs-export-queue-sg.fifo |
| ksm-posprd-sqs-store-code-queue-sg.fifo |

---

## 9. Secrets Manager

**最終調査**: 2026-03-08 → ログ [9][11]

| Secret ID | 接続先エンドポイント | DB名 |
|---|---|---|
| prd/Replica_Kasumi | **Writer**エンドポイント ⚠️ | Replica_Kasumi |
| prd/Replica_Kasumi_RO | Readerエンドポイント ✅ | Replica_Kasumi |
| prd/Batch_Kasumi | Writerエンドポイント | Batch_Kasumi |
| prd/Mail_Kasumi | Writerエンドポイント | Mail_Kasumi |
| ksm-posprd-sm-db | — | — |
| ksm-posprd-sm-db-replica | — | — |
| ksm-posprd-sm-sftp | — | SFTP認証情報 |

> ⚠️ `prd/Replica_Kasumi` は命名に反してWriterエンドポイントを参照。`create-file-end-for-night` Lambda のReader変更対象。

---

## 10. コスト（直近6ヶ月）

**最終調査**: 2026-03-08 → ログ [10]

| 月 | 合計 | 備考 |
|---|---|---|
| 2025-09 | $3,370 | Transfer Family 2台稼働 |
| 2025-10 | $3,001 | |
| 2025-11 | $3,908 | SH系 Transfer Family 追加 |
| 2025-12 | $3,900 | |
| 2026-01 | $3,917 | |
| 2026-02 | $3,587 | |
| **合計** | **$21,683** | 月平均 $3,614 |

**サービス別（合計）**:

| サービス | 金額 | 割合 |
|---|---|---|
| RDS（Aurora MySQL） | $13,306 | 61% |
| Transfer Family | $3,324 | 15% |
| Tax | $1,971 | 9% |
| EC2 | $1,580 | 7% |
| VPC（NAT GW含む） | $803 | 4% |

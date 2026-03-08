# Transfer Family (SFTP) 詳細設定

> **取得日時**: 2026-03-08  
> **リージョン**: ap-northeast-1（東京）  
> **AWSアカウントID**: 332802448674  
> ⚠️ サーバーID・ユーザー名の実測値は CloudShell で下記コマンドを実行して取得すること  
> `bash 40_AWS/03_リカバリー/07_recover_transfer_family.sh status`

---

## 1. 全体構成図

```
【外部ベンダー（USMH網）】
  BIPROGY / OpenCentral  ─────────────────────────────────────┐
  VINX   / PosServer     ──────── IPSec VPN ──────────────────┤
  SHARP  / P003          ─────────────────────────────────────┘
                                    │
                         CGW: 14.224.146.153 (BGP ASN=65000)
                                    │ VPN: vpn-0ea9b7895f78e4c7e
                         ┌──────────▼──────────────────────────────┐
                         │  VPC: vpc-0e2d2d27b6860b7fc             │
                         │  10.238.0.0/16  /  ap-northeast-1       │
                         │                                         │
                         │  Transfer Family VPC Endpoints  ×3台    │
                         │  Protocol: SFTP (TCP 22)                │
                         │  接続元許可CIDR:                        │
                         │    10.156.96.0/24    (ファイル受信)     │
                         │    10.156.96.192/26  (SFTP接続)         │
                         │         │                               │
                         │  ┌──────▼──────────────────────────┐   │
                         │  │  S3: prd-ignica-ksm              │   │
                         │  │    /oc/  ← OC系着信              │   │
                         │  │    /sg/  ← SG系着信              │   │
                         │  │    /sh/  ← SH系着信              │   │
                         │  └──────┬──────────────────────────┘   │
                         │         │ S3イベント / SQS             │
                         │  ┌──────▼──────────────────────────┐   │
                         │  │  Step Functions / Lambda         │   │
                         │  │  （データ処理・DB取込・USMH送信）│   │
                         │  └─────────────────────────────────┘   │
                         └─────────────────────────────────────────┘
```

---

## 2. サーバー構成（3台）

| # | 系統 | 接続元 | S3着信先 | 処理トリガー |
|---|---|---|---|---|
| 1 | **OC系** | BIPROGY / OpenCentral | `prd-ignica-ksm/oc/` | S3イベント → Step Functions |
| 2 | **SG系** | VINX / PosServer | `prd-ignica-ksm/sg/` | SQS FIFO → Step Functions |
| 3 | **SH系** | SHARP / P003 | `prd-ignica-ksm/sh/` | S3イベント → Step Functions |

### 共通設定

| 項目 | 値 |
|---|---|
| エンドポイントタイプ | VPC エンドポイント |
| バックエンドストレージ | S3 |
| 接続タイプ | ONLINE |
| プロトコル | SFTP (SSH File Transfer Protocol) |
| 認証タイプ | Secrets Manager ベース (`ksm-posprd-sm-sftp`) |

---

## 3. ファイルフロー詳細

### 3-1. OC系（基幹データ / BIPROGY OpenCentral）

```
BIPROGY OpenCentral
    │ SFTP (port 22)
    ▼
Transfer Family Server #1 (OC系)
    │ S3 PUT イベント
    ▼
S3: s3://prd-ignica-ksm/oc/
    │ EventBridge / S3 Notification
    ▼
Step Functions: receive-pos-master-oc   ← ファイル検証・仕分け
    ▼
Step Functions: import-pos-master-oc   ← Lambda → Aurora MySQL (Writer) DB取込
    ▼
Step Functions: create-txt-file-oc     ← 出力ファイル生成
    ▼
Step Functions: sent-txt-file          ← USMH側へSFTP送信
```

| 項目 | 内容 |
|---|---|
| 受信頻度 | 毎日定時（EventBridge: JST 00:00 `cron(00 15 * * ? *)`） |
| DB取込先 | Aurora MySQL Write エンドポイント（シークレット: `prd/Replica_Kasumi`） |
| 障害時の影響 | 当日分マスタデータが取り込まれず、翌日のPOS処理に影響 |

### 3-2. SG系（POSデータ / VINX PosServer）

```
VINX PosServer
    │ SFTP (port 22)
    ▼
Transfer Family Server #2 (SG系)
    │ S3 PUT イベント
    ▼
S3: s3://prd-ignica-ksm/sg/
    │ SQS FIFO キューへ投入（順序保証・重複排除）
    ▼
SQS: ksm-posprd-sqs-export-queue-sg.fifo      （エクスポートデータ）
SQS: ksm-posprd-sqs-store-code-queue-sg.fifo  （店舗コード別処理）
    ▼
Step Functions: receive-and-import-pos-master-sg  ← Lambda → DB取込
    ▼
Step Functions: create-txt-file-sg
    ▼
Step Functions: sent-txt-file  ← USMH側へ送信
```

| 項目 | 内容 |
|---|---|
| 受信頻度 | 随時（POS端末からリアルタイム送信） |
| SQS利用理由 | 複数ファイルの順序保証・二重処理防止（FIFO） |
| DB取込先 | Aurora MySQL Write エンドポイント（シークレット: `prd/Replica_Kasumi`） |
| 障害時の影響 | SQSにメッセージが滞留。SFTPが復旧すれば順次再処理される |

### 3-3. SH系（棚情報 / SHARP P003）

```
SHARP P003
    │ SFTP (port 22)
    ▼
Transfer Family Server #3 (SH系)
    │ S3 PUT イベント
    ▼
S3: s3://prd-ignica-ksm/sh/
    │ S3 Notification
    ▼
Step Functions: import-pos-master-sh  ← Lambda → DB取込
    ▼
Step Functions: sent-txt-file  ← USMH側へ送信
```

| 項目 | 内容 |
|---|---|
| 受信頻度 | 定期（頻度は要SHARP確認） |
| DB取込先 | Aurora MySQL Write エンドポイント（シークレット: `prd/Replica_Kasumi`） |
| 障害時の影響 | 棚割情報が更新されない（即時影響は小さいが長期は問題） |

---

## 4. S3バケット構成

| S3パス | 連携系統 | 内容 | ライフサイクル |
|---|---|---|---|
| `s3://prd-ignica-ksm/oc/` | OC系 | 基幹POSマスタデータ | ⚠️ 未設定（要確認） |
| `s3://prd-ignica-ksm/sg/` | SG系 | POS売上・在庫データ | ⚠️ 未設定（要確認） |
| `s3://prd-ignica-ksm/sh/` | SH系 | 棚割・陳列情報 | ⚠️ 未設定（要確認） |
| `s3://prd-aeon-gift-card/` | ギフトカード系 | ギフトカード処理データ | ⚠️ 未設定（要確認） |

> ⚠️ **S3ライフサイクルポリシーが未設定の可能性あり。**  
> 処理済みファイルが削除されず蓄積するとS3コストが増加する。  
> 処理済みファイルは 30〜90日後に削除 or Glacier移行のポリシー設定を推奨。

---

## 5. ネットワーク設定

| 項目 | 値 |
|---|---|
| エンドポイント種別 | VPC エンドポイント（インターネット非経由） |
| サブネット | プライベートサブネット (1a / 1c) |
| セキュリティグループ | TCP 22 のみ。許可元: `10.156.96.0/24`, `10.156.96.192/26` |
| VPN | vpn-0ea9b7895f78e4c7e / CGW: 14.224.146.153 |

---

## 6. 認証・シークレット管理

```bash
# SFTP認証情報確認（緊急時）
aws secretsmanager get-secret-value \
  --region ap-northeast-1 \
  --secret-id ksm-posprd-sm-sftp \
  --query SecretString --output text | jq .
```

> Transfer Family は接続時に `ksm-posprd-sm-sftp` を参照して認証する（Lambda型カスタム認証）。  
> シークレットにはSFTPユーザー名・公開鍵またはパスワード・ホームディレクトリが格納されている。

---

## 7. 監視・アラート（現状と推奨）

| メトリクス | CloudWatch 名前空間 | 現状 | 推奨閾値 |
|---|---|---|---|
| 受信ファイル数 | `AWS/Transfer` `FilesIn` | ⚠️ アラート未設定 | 0件/日 × 2日連続でアラート |
| 受信バイト数 | `AWS/Transfer` `BytesIn` | ⚠️ アラート未設定 | 前月比2倍超でアラート |
| ログイン試行失敗 | `AWS/Transfer` `LoginAttempts` | ⚠️ アラート未設定 | 10回/時間超でアラート |

> 現状はファイルが届かなくても自動検知されない。Step Functions の失敗アラートで間接検知のみ。

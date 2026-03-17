# Transfer Family (SFTP) 詳細設定

> **取得日時**: 2026-03-08（CloudShell 実測値）  
> **リージョン**: ap-northeast-1（東京）  
> **AWSアカウントID**: 332802448674

---

## 1. 全体構成図

```
【外部ベンダー（USMH網）】
  BIPROGY / OpenCentral  ─────────────────────────────────────┐
  VINX   / PosServer     ──────── IPSec VPN ──────────────────┤
  SHARP  / P003          ─────────────────────────────────────┘
                                    │
                         CGW: 14.224.146.153 (BGP ASN=65000)
                         VPN: vpn-0ea9b7895f78e4c7e
                         ⚠️ T1=UP / T2=DOWN（冗長性要確認）
                                    │
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
                         │  │    /oc/            ← OC系着信    │   │
                         │  │    /sg/            ← SG系着信    │   │
                         │  │    /pos-original/sh/receive/     │   │
                         │  │                   ← SH系着信    │   │
                         │  └──────┬──────────────────────────┘   │
                         │         │ S3イベント / SQS             │
                         │  ┌──────▼──────────────────────────┐   │
                         │  │  Step Functions / Lambda         │   │
                         │  │  （データ処理・DB取込）          │   │
                         │  └──────┬──────────────────────────┘   │
                         │         │ Lambda SFTP送信               │
                         │  ┌──────▼──────────────────────────┐   │
                         │  │  ksm-posprd-lmd-function-        │   │
                         │  │  sent-txt-file                   │   │
                         │  │  → USMH側SFTPへ直接送信          │   │
                         │  │  （Transfer Family は使わない）   │   │
                         │  └─────────────────────────────────┘   │
                         └─────────────────────────────────────────┘
```

---

## 2. サーバー構成（3台）実測値

| サーバーID | 名前（Tagより） | 系統 | 接続元 | S3着信先 | 追加時期 |
|---|---|---|---|---|---|
| `s-2a4905e8210f48248` | ksm-posprd-tf-server-**oc** | **OC系** | BIPROGY / OpenCentral | `prd-ignica-ksm/oc/` | 〜2025/09以前 |
| `s-bd974a35aa994c838` | ksm-posprd-tf-server-**sg** | **SG系** | VINX / PosServer | `prd-ignica-ksm/sg/` | 〜2025/09以前 |
| `s-5546031218784c4ba` | ksm-posprd-tf-server-**sh** | **SH系** | SHARP / P003 | `prd-ignica-ksm/pos-original/sh/receive/` | **2025/11 途中追加** |

### 共通設定（実測）

| 項目 | 実測値 |
|---|---|
| エンドポイントタイプ | VPC エンドポイント |
| 認証タイプ | **SERVICE_MANAGED**（Transfer Family標準ユーザー管理） |
| State | ONLINE（3台とも） |
| BytesOut | **0**（Transfer Family経由の送信なし。USMH送信は別手段） |

> ⚠️ **認証は SERVICE_MANAGED**（サービス管理型）。Secrets Managerのカスタム認証ではない。  
> `ksm-posprd-sm-sftp` は別用途のシークレットの可能性あり（要確認）。

### SFTPユーザー（実測）

| サーバー | ユーザー名 | HomeDirectory |
|---|---|---|
| OC系 | `ksm-posprd-tf-user-oc` | None（論理ホームディレクトリ設定） |
| SG系 | `ksm-posprd-tf-user-sg` | None（論理ホームディレクトリ設定） |
| SH系 | `ksm-posprd-tf-user-sh` | `/prd-ignica-ksm/pos-original/sh/receive` |

---

## 3. ファイルフロー詳細

### 3-1. OC系（基幹データ / BIPROGY OpenCentral）

```
BIPROGY OpenCentral
    │ SFTP (port 22) → s-2a4905e8210f48248
    │ 実測: 約10件/日、平均ファイルサイズ約6.7MB
    ▼
S3: s3://prd-ignica-ksm/oc/
    │ S3イベント
    ▼
Step Functions: receive-pos-master-oc   ← ファイル検証・仕分け
    ▼
Step Functions: import-pos-master-oc   ← Lambda → Aurora MySQL (Writer)
    ▼
Step Functions: create-txt-file-oc     ← 出力ファイル生成
    ▼
Step Functions: sent-txt-file          ← USMH側へ送信（Transfer Family非経由）
```

| 項目 | 実測値 |
|---|---|
| FilesIn（過去30日） | **304件**（約10.1件/日） |
| BytesIn（過去30日） | **2.01 GB**（平均6.7 MB/件） |
| BytesOut | **0**（TF経由送信なし） |
| 受信頻度 | 毎日定時（EventBridge: JST 00:00 `cron(00 15 * * ? *)`） |

### 3-2. SG系（POSデータ / VINX PosServer）

```
VINX PosServer
    │ SFTP (port 22) → s-bd974a35aa994c838
    │ 実測: 約100件/日、平均ファイルサイズ約8KB（小さいファイルを大量に受信）
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
Step Functions: sent-txt-file  ← USMH側へ送信（Transfer Family非経由）
```

| 項目 | 実測値 |
|---|---|
| FilesIn（過去30日） | **3,007件**（約100.2件/日）← 3系統で最多 |
| BytesIn（過去30日） | **25 MB**（平均8 KB/件）← 小さいファイルを大量受信 |
| BytesOut | **0** |
| SQS状態 | 正常（待機0件、処理中0件） |

### 3-3. SH系（棚情報 / SHARP P003）

```
SHARP P003
    │ SFTP (port 22) → s-5546031218784c4ba
    │ 実測: 約2件/日、平均ファイルサイズ約38MB（大きいファイルを少数受信）
    ▼
S3: s3://prd-ignica-ksm/pos-original/sh/receive/
    │ ※ ホームディレクトリ: /prd-ignica-ksm/pos-original/sh/receive
    │ S3 Notification
    ▼
Step Functions: import-pos-master-sh  ← Lambda → DB取込
    ▼
Step Functions: sent-txt-file  ← USMH側へ送信（Transfer Family非経由）
```

| 項目 | 実測値 |
|---|---|
| FilesIn（過去30日） | **60件**（約2.0件/日） |
| BytesIn（過去30日） | **2.22 GB**（平均38 MB/件）← 大きいファイルを少数受信 |
| BytesOut | **0** |
| サーバー追加時期 | **2025年11月途中**（それ以前は2台稼働）← コスト急増の真因 |

---

## 4. S3バケット構成

| S3パス | 連携系統 | 内容 | 備考 |
|---|---|---|---|
| `s3://prd-ignica-ksm/oc/` | OC系 | 基幹POSマスタデータ | 処理後に削除されている（S3直下は空） |
| `s3://prd-ignica-ksm/sg/` | SG系 | POS売上・在庫データ | 処理後に削除されている（S3直下は空） |
| `s3://prd-ignica-ksm/pos-original/sh/receive/` | SH系 | 棚割・陳列情報 | **SH系の正確なS3パス** |
| `s3://prd-aeon-gift-card/` | ギフトカード系 | ギフトカード処理データ | — |

> ✅ S3直下が空 → 処理済みファイルは正常に削除 or 移動されている（ライフサイクル問題なし）

---

## 5. ネットワーク設定

| 項目 | 値 |
|---|---|
| エンドポイント種別 | VPC エンドポイント（インターネット非経由） |
| サブネット | プライベートサブネット (1a / 1c) |
| セキュリティグループ | TCP 22 のみ。許可元: `10.156.96.0/24`, `10.156.96.192/26` |
| VPN ID | `vpn-0ea9b7895f78e4c7e` / CGW: `14.224.146.153` |
| **VPN T1** | **UP** ✅ |
| **VPN T2** | **DOWN** ⚠️ 冗長性が失われている |

> ⚠️ **VPNトンネル2がDown**。現在はT1のみで稼働しており冗長性なし。  
> T1が障害になると **全3系統のSFTP接続が完全に停止**する。  
> USMHネットワーク管理者へトンネル2の復旧確認を依頼することを推奨。

---

## 6. 認証・ユーザー管理

| 項目 | 実測値 |
|---|---|
| 認証タイプ | **SERVICE_MANAGED**（Transfer Family 標準ユーザー管理） |
| ユーザー管理 | Transfer Family コンソール / CloudFormation で直接管理 |
| CloudFormation Stack | `ksm-posprd-transfer` |

> SERVICE_MANAGEDはSSHキー or パスワードをTransfer Family上で直接管理する方式。  
> `ksm-posprd-sm-sftp` シークレットは、このサーバーの認証に使われているわけではない（別用途）。

---

## 7. 監視・アラート（現状と推奨）

| メトリクス | 現状 | 推奨閾値 |
|---|---|---|
| FilesIn | ⚠️ アラート未設定 | 0件/日 × 2日連続でアラート |
| BytesIn | ⚠️ アラート未設定 | 前月比2倍超でアラート |
| VPN T2 Status | ⚠️ DOWN（要対応） | UP復旧後にアラート設定 |

---

## 8. 確認コマンド集（CloudShell）

```bash
# サーバー一覧と状態確認
aws transfer list-servers --region ap-northeast-1 \
  --query 'Servers[*].{ID:ServerId,State:State,Name:Tags[?Key==`Name`].Value|[0]}' \
  --output table

# 転送メトリクス確認（過去30日）
bash 40_AWS/03_リカバリー/07_recover_transfer_family.sh check-metrics

# VPN状態確認
aws ec2 describe-vpn-connections --region ap-northeast-1 \
  --vpn-connection-ids vpn-0ea9b7895f78e4c7e \
  --query 'VpnConnections[0].VgwTelemetry[*].{IP:OutsideIpAddress,Status:Status}' \
  --output table
```

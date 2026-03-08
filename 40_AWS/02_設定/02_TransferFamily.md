# Transfer Family (SFTP) / 外部連携ファイルフロー 詳細設定

> コスト: $3,324 / 6ヶ月（第2位コスト項目）

---

## SFTPサーバー構成

| 項目 | 設定値 |
|---|---|
| サーバー数 | 3台 |
| エンドポイントタイプ | VPC エンドポイント |
| バックエンドストレージ | S3 |
| 接続タイプ | ONLINE |
| 認証情報 | ksm-posprd-sm-sftp (Secrets Manager) |
| USMH側SFTP CIDR | 10.156.96.0/24 / 10.156.96.192/26 |

## 外部連携ファイルフロー

### OC系（基幹データ / BIPROGY OpenCentral）

```
BIPROGY OpenCentral
      │ SFTP
      ↓
Transfer Family (SFTP VPC Endpoint)
      │ S3イベント
      ↓
S3: s3://prd-ignica-ksm/oc/
      │ Step Functions起動
      ↓
Step Functions: receive-pos-master-oc
      ↓
Step Functions: import-pos-master-oc
      ↓
Step Functions: create-txt-file-oc
      ↓
Step Functions: sent-txt-file → USMH側送信
```

### SG系（POSデータ / VINX PosServer）

```
VINX PosServer
      │ SFTP
      ↓
Transfer Family (SFTP VPC Endpoint)
      │ SQS FIFOキュー投入
      ↓
SQS: ksm-posprd-sqs-export-queue-sg.fifo
SQS: ksm-posprd-sqs-store-code-queue-sg.fifo
      ↓
Step Functions: receive-and-import-pos-master-sg
      ↓
Step Functions: create-txt-file-sg
      ↓
Step Functions: sent-txt-file → USMH側送信
```

### SH系（棚情報 / SHARP P003）

```
SHARP P003
      │ SFTP
      ↓
Transfer Family (SFTP VPC Endpoint)
      │ S3イベント
      ↓
S3: s3://prd-ignica-ksm/sh/
      ↓
Step Functions: import-pos-master-sh
      ↓
Step Functions: sent-txt-file → USMH側送信
```

## S3バケット構成

| S3パス | 連携先 | 内容 |
|---|---|---|
| s3://prd-ignica-ksm/oc/ | BIPROGY/基幹 | 基幹POSマスタデータ |
| s3://prd-ignica-ksm/sg/ | VINX/PosServer | POS売上・在庫データ |
| s3://prd-ignica-ksm/sh/ | SHARP/P003 | 棚割・陳列情報 |
| s3://prd-aeon-gift-card/ | ギフトカード系 | ギフトカード処理データ |

## SQS設定（SG系専用）

| キュー名 | タイプ | 用途 |
|---|---|---|
| ksm-posprd-sqs-export-queue-sg.fifo | FIFO | SG系エクスポートデータキュー |
| ksm-posprd-sqs-store-code-queue-sg.fifo | FIFO | 店舗コード別処理キュー |

```
FIFOキュー特性:
  - メッセージ順序保証（先入れ先出し）
  - 重複排除: コンテンツベース重複排除
  - 可視性タイムアウト: 処理時間に合わせて設定
```

## ネットワーク設定

```
VPCエンドポイント経由でS3に接続（インターネットを経由しない）
USMH側からの接続元CIDR:
  - 10.156.96.0/24   (ファイル受信用)
  - 10.156.96.192/26 (SFTP接続用)
  
セキュリティグループ: SFTP用SG（port 22 のみ上記CIDRから許可）
```

## 認証情報管理

```bash
# SFTP認証情報取得（緊急時確認用）
aws secretsmanager get-secret-value \
  --region ap-northeast-1 \
  --secret-id ksm-posprd-sm-sftp \
  --query SecretString \
  --output text
```

## Transfer Family サーバー確認コマンド

```bash
# サーバー一覧
aws transfer list-servers --region ap-northeast-1

# サーバー詳細
aws transfer describe-server \
  --region ap-northeast-1 \
  --server-id <server-id>

# ユーザー一覧
aws transfer list-users \
  --region ap-northeast-1 \
  --server-id <server-id>
```

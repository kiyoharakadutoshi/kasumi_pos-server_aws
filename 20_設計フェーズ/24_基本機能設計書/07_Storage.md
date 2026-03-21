# ストレージ・暗号化設定（S3 / KMS / Secrets Manager / ECR）

> S3 $28 | KMS $24 | Secrets Manager $18 | ECR $3 / 6ヶ月

---

## S3 バケット一覧

| バケット名 | 用途 | 主要コンテンツ | アクセス元 |
|---|---|---|---|
| prd-ignica-ksm | メインPOSデータ | oc/, sg/, sh/ 連携ファイル | Lambda, Step Functions, Transfer Family |
| prd-ignica-ksm-master-backup | DBバックアップ | Aurora スナップショットエクスポート | RDS, AWS Backup |
| prd-ignica-ksm-pmlogs | PMログ | 処理ログ・監査ログ | Lambda, CloudWatch |
| prd-ignica-com-lmd-jar | Lambda JARファイル | Java17 Lambda デプロイパッケージ | Lambda, CI/CD |
| prd-aeon-gift-card | ギフトカード | ギフトカード処理データ | EC2(giftcard), Lambda |
| prd-ignica-com-configrecord | Config記録 | AWS Config スナップショット | AWS Config |

### バケット設定標準

```
暗号化: SSE-KMS（AWS管理キーまたはカスタマーキー）
バージョニング: prd-ignica-ksm は有効推奨
パブリックアクセス: すべてブロック
ライフサイクル設定:
  - oc/, sg/, sh/: 処理完了後 90日で Glacier 移行推奨
  - logs/: 180日後削除推奨
  - backups/: 365日後削除推奨
```

### S3 操作コマンド

```bash
# バケット一覧
aws s3 ls --region ap-northeast-1

# バケット内容確認
aws s3 ls s3://prd-ignica-ksm/ --recursive --human-readable

# 特定プレフィックスの最新ファイル
aws s3 ls s3://prd-ignica-ksm/oc/ | tail -20

# バケット暗号化設定確認
aws s3api get-bucket-encryption \
  --bucket prd-ignica-ksm

# バケットポリシー確認
aws s3api get-bucket-policy \
  --bucket prd-ignica-ksm \
  --query Policy \
  --output text | python3 -m json.tool

# S3 バージョニング確認
aws s3api get-bucket-versioning \
  --bucket prd-ignica-ksm

# ファイルのコピー・バックアップ
aws s3 cp s3://prd-ignica-ksm/oc/ s3://prd-ignica-ksm-master-backup/oc-backup-$(date +%Y%m%d)/ \
  --recursive \
  --region ap-northeast-1
```

---

## Secrets Manager シークレット一覧（6件）

| シークレット名 | 用途 | 参照元 |
|---|---|---|
| ksm-posprd-sm-db | Aurora プライマリDB接続情報 | Lambda, ECS, Step Functions |
| ksm-posprd-sm-db-replica | Aurora レプリカDB接続情報 | Lambda (読み取り専用) |
| ksm-posprd-sm-sftp | SFTP接続認証情報 | Transfer Family |
| prd/Mail_Kasumi | メール送信設定 (SMTP等) | Lambda (通知・アラートメール) |
| prd/Batch_Kasumi | バッチ処理認証情報 | EventBridge, Step Functions |
| prd/Replica_Kasumi | 追加レプリカ接続情報 | Lambda (追加読み取り) |

### Secrets Manager 操作コマンド

```bash
# シークレット一覧
aws secretsmanager list-secrets \
  --region ap-northeast-1 \
  --query 'SecretList[*].{Name:Name,LastChanged:LastChangedDate}'

# シークレット値取得（緊急時）
aws secretsmanager get-secret-value \
  --region ap-northeast-1 \
  --secret-id ksm-posprd-sm-db \
  --query SecretString \
  --output text | python3 -m json.tool

# シークレット更新
aws secretsmanager update-secret \
  --region ap-northeast-1 \
  --secret-id <secret-name> \
  --secret-string '{"username":"xxx","password":"yyy","host":"zzz","port":3306}'

# ローテーション設定確認
aws secretsmanager describe-secret \
  --region ap-northeast-1 \
  --secret-id ksm-posprd-sm-db \
  --query '{RotationEnabled:RotationEnabled,RotationRules:RotationRules}'
```

---

## KMS キー管理

```
暗号化対象:
  - Aurora MySQL データ（保存時暗号化）
  - S3 バケット (SSE-KMS)
  - Secrets Manager シークレット
  - CloudWatch Logs

キーポリシー:
  - 管理者: IAMルート + 指定IAMロール
  - 使用: Lambda実行ロール, RDS, Secrets Manager

キーローテーション: 年次自動ローテーション（推奨設定）
```

### KMS 操作コマンド

```bash
# KMSキー一覧
aws kms list-keys --region ap-northeast-1 \
  --query 'Keys[*].KeyId'

# キー詳細確認
aws kms describe-key \
  --region ap-northeast-1 \
  --key-id <key-id>

# キー使用状況確認（CloudTrail経由）
aws cloudtrail lookup-events \
  --region ap-northeast-1 \
  --lookup-attributes AttributeKey=EventName,AttributeValue=Decrypt \
  --max-results 10
```

---

## ECR リポジトリ

```
リポジトリ名: prd-ignica-com-lmd-jar
用途: Lambda コンテナイメージ格納

イメージスキャン: AWS Inspector による自動スキャン
ライフサイクルポリシー: 古いイメージの自動削除推奨（最新10世代保持等）
```

### ECR 操作コマンド

```bash
# リポジトリ一覧
aws ecr describe-repositories \
  --region ap-northeast-1 \
  --query 'repositories[*].{Name:repositoryName,URI:repositoryUri}'

# イメージ一覧（最新10件）
aws ecr describe-images \
  --region ap-northeast-1 \
  --repository-name prd-ignica-com-lmd-jar \
  --query 'sort_by(imageDetails, &imagePushedAt)[-10:].{Tag:imageTags[0],Size:imageSizeInBytes,Pushed:imagePushedAt}'

# ECR ログイン（デプロイ時）
aws ecr get-login-password --region ap-northeast-1 \
  | docker login \
    --username AWS \
    --password-stdin <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com
```

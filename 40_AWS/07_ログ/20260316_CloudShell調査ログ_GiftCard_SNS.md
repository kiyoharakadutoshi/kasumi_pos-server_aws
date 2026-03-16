# CloudShell調査ログ — ギフトカード Teams通知 SNS設定調査

調査日: 2026/03/16  
調査者: 清原一利  
目的: オーソリーサーバー接続障害のTeams通知（Ksm_gft_017）実装に向けたSNS・IAM・EC2設定の確認

---

## 調査結果サマリー

### 3環境の構成（確定）

| 項目 | DEV（スパイク） | STG（検証） | PRD（本番） |
|------|--------------|------------|------------|
| AWSアカウント | `891376952870` | `750735758916` | `332802448674` |
| IAMロール（GiftcardEC2） | `posspk-role-ec2-web-be` | `posstg-role-ec2-web-be` | `ksm-posprd-iam-role-ec2-web-be` |
| GiftcardインスタンスID | `i-05fdf2857655d4561` | `i-0f8ededc7ae313cbe` | `i-03d6bf91c19385cdf` |
| SNSトピック（通知先） | `ksm-posspk-sns-topic-app-logs` | `ksm-posstg-sns-topic-app-logs` | `ksm-posprd-sns-topic-app-logs` |
| Secrets Manager命名（追加予定） | `spike/GiftCard_Kasumi` | `stg/GiftCard_Kasumi` | `prd/GiftCard_Kasumi` |
| SNS publish権限 | ❌ 未設定 | ❌ 未設定 | ❌ 未設定 |
| SNS_TOPIC_ARN設定 | ❌ 未設定 | ❌ 未設定 | ❌ 未設定 |

### SNSサブスクリプション（通知先チャンネル）

| 環境 | Teams | メール |
|------|-------|-------|
| DEV | なし | nguyenthanhloc@luvina.net / nguyenbaan2@luvina.net |
| STG | `00918f5f.luvina.net@apac.teams.ms`（LuvinaチャンネルのみへのTeams通知） | aws-pos-alert@luvina.net |
| PRD | `3273f0a5.luvina.net@apac.teams.ms`（Luvina） / `ed18935e.kasumie.onmicrosoft.com@jp.teams.ms`（カスミ様） | aws-pos-alert@luvina.net |

### 重要な確認事項

- **電子棚札（isida）で既に同じSNS経由Teams通知の仕組みが稼働中**（流用可能）
- **Spring BootのSNS通知実装**: `SnsClient.publish()` を使用（`SendEmailHandler.java` 参照）
- **環境変数の管理方式**: Secrets Manager（`spike/` `stg/` `prd/` プレフィックス統一）
- **ユーザーデータ**: 3環境とも空（起動時スクリプトなし）
- **Parameter Store**: 3環境ともSNS関連設定なし

---

## 実施が必要な作業（Ksm_gft_017）

```
① CloudShell：IAMロールにSNS publish権限を追加
② CloudShell：Secrets ManagerにSNS_TOPIC_ARNを新規作成
③ Thanh Nam：AlertService.javaでSecrets Managerから読み込む実装＋デプロイ
```

詳細コマンドは調査ログセクション参照。

---

## 実行コマンドログ

### PRDアカウント（332802448674）

```bash
# SNSトピック一覧
aws sns list-topics --region ap-northeast-1
# 結果:
# arn:aws:sns:ap-northeast-1:332802448674:ksm-posprd-sns-topic-app-logs
# arn:aws:sns:ap-northeast-1:332802448674:ksm-posprd-sns-topic-app-logs-test
# arn:aws:sns:ap-northeast-1:332802448674:ksm-posprd-sns-topic-aws-logs

# SNSサブスクリプション一覧
aws sns list-subscriptions --region ap-northeast-1
# 結果（ksm-posprd-sns-topic-app-logs のサブスクリプション）:
# Protocol: email / Endpoint: ed18935e.kasumie.onmicrosoft.com@jp.teams.ms  ← カスミ様Teams
# Protocol: email / Endpoint: 3273f0a5.luvina.net@apac.teams.ms             ← LuvinaTeams
# Protocol: email / Endpoint: aws-pos-alert@luvina.net                      ← Luvinaメール

# EC2インスタンス一覧
aws ec2 describe-instances --region ap-northeast-1 \
  --query 'Reservations[*].Instances[*].{ID:InstanceId,Name:Tags[?Key==`Name`].Value|[0],State:State.Name}' \
  --output table
# 結果:
# i-0a395d670d7a3eda3 | ksm-posprd-ec2-instance-bastion  | running
# i-03d6bf91c19385cdf | ksm-posprd-ec2-instance-giftcard | running

# IAMロール ポリシー確認
aws iam list-attached-role-policies --role-name ksm-posprd-iam-role-ec2-web-be --region ap-northeast-1
# 結果: CloudWatchLogsFullAccess / SecretsManagerReadWrite / AmazonS3FullAccess
# ※ SNS publish権限なし → 追加必要

# Secrets Manager一覧
aws secretsmanager list-secrets --region ap-northeast-1 --query 'SecretList[*].Name' --output table
# 結果: ksm-posprd-sm-db-replica / ksm-posprd-sm-sftp / ksm-posprd-sm-db
#       prd/Mail_Kasumi / prd/Batch_Kasumi / prd/Replica_Kasumi / prd/Replica_Kasumi_RO
# ※ SNS_TOPIC_ARN未設定 → prd/GiftCard_Kasumi として新規作成必要
```

### STGアカウント（750735758916）

```bash
# SNSサブスクリプション一覧
aws sns list-subscriptions --region ap-northeast-1
# 結果（ksm-posstg-sns-topic-app-logs のサブスクリプション）:
# Protocol: email / Endpoint: 00918f5f.luvina.net@apac.teams.ms ← LuvinaTeams
# Protocol: email / Endpoint: aws-pos-alert@luvina.net

# EC2インスタンス一覧
# i-0bd9a4db1b74b5a69 | ksm-posstg-ec2-instance-bastion  | running
# i-06a74666e851e4d12 | ksm-posstg-ec2-instance-web-be   | running
# i-0fa4cf3cf5c1a8864 | ksm-posstg-ec2-instance-web-fe   | running
# i-0f8ededc7ae313cbe | ksm-posstg-ec2-instance-giftcard | running

# IAMロール確認
# ロール: posstg-role-ec2-web-be
# アタッチ済み: CloudWatchLogsFullAccess / SecretsManagerReadWrite / AmazonS3FullAccess
# ※ SNS publish権限なし → 追加必要

# Secrets Manager
# stg/Mail_Kasumi / stg/Batch_Kasumi / stg/Replica_Kasumi / stg/Replica_Kasumi_RO
# ※ SNS_TOPIC_ARN未設定 → stg/GiftCard_Kasumi として新規作成必要
```

### DEVアカウント（891376952870）

```bash
# EC2インスタンス（GiftCard）
# i-05fdf2857655d4561 | ksm-posspk-ec2-instance-web-be | running
# IAMロール: posspk-role-ec2-web-be
# ※ SNS publish権限なし → 追加必要

# Secrets Manager
# spike/Mail_Kasumi / spike/Batch_Kasumi / spike/Replica_Kasumi / spike/Re_Kasumi / spike/Re_Kasumi_RO
# ※ SNS_TOPIC_ARN未設定 → spike/GiftCard_Kasumi として新規作成必要

# Lambda sent-email に SNS_TOPIC_ARN=ksm-posspk-sns-topic-app-logs が設定済み
# （電子棚札の通知で既に使用中 → 動作実績あり）
```

---

## 次回作業コマンド（各環境で実施）

### DEVアカウント（891376952870）のCloudShell

```bash
# ①IAM権限追加
aws iam put-role-policy \
  --role-name posspk-role-ec2-web-be \
  --policy-name SNSPublishForGiftcard \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:ap-northeast-1:891376952870:ksm-posspk-sns-topic-app-logs"
    }]
  }' \
  --region ap-northeast-1

# ②Secrets Manager作成
aws secretsmanager create-secret \
  --name spike/GiftCard_Kasumi \
  --description "Gift card SNS alert config for dev(spike)" \
  --secret-string '{"SNS_TOPIC_ARN":"arn:aws:sns:ap-northeast-1:891376952870:ksm-posspk-sns-topic-app-logs"}' \
  --region ap-northeast-1
```

### STGアカウント（750735758916）のCloudShell

```bash
# ①IAM権限追加
aws iam put-role-policy \
  --role-name posstg-role-ec2-web-be \
  --policy-name SNSPublishForGiftcard \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:ap-northeast-1:750735758916:ksm-posstg-sns-topic-app-logs"
    }]
  }' \
  --region ap-northeast-1

# ②Secrets Manager作成
aws secretsmanager create-secret \
  --name stg/GiftCard_Kasumi \
  --description "Gift card SNS alert config for staging" \
  --secret-string '{"SNS_TOPIC_ARN":"arn:aws:sns:ap-northeast-1:750735758916:ksm-posstg-sns-topic-app-logs"}' \
  --region ap-northeast-1
```

### PRDアカウント（332802448674）のCloudShell

```bash
# ①IAM権限追加
aws iam put-role-policy \
  --role-name ksm-posprd-iam-role-ec2-web-be \
  --policy-name SNSPublishForGiftcard \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:ap-northeast-1:332802448674:ksm-posprd-sns-topic-app-logs"
    }]
  }' \
  --region ap-northeast-1

# ②Secrets Manager作成
aws secretsmanager create-secret \
  --name prd/GiftCard_Kasumi \
  --description "Gift card SNS alert config for production" \
  --secret-string '{"SNS_TOPIC_ARN":"arn:aws:sns:ap-northeast-1:332802448674:ksm-posprd-sns-topic-app-logs"}' \
  --region ap-northeast-1
```

# セキュリティ設定（GuardDuty / Inspector / Security Hub / Config / IAM）

> コスト: GuardDuty $127 + Inspector $104 + SecurityHub $107 + Config $146 + IAM Analyzer $46 = $530 / 6ヶ月

---

## GuardDuty

```
目的: 継続的な脅威検知・侵害検出

有効機能:
  - VPC フローログ分析
  - CloudTrail イベント分析
  - DNS クエリ分析
  - S3 保護 (S3データへの不審アクセス検出)
  - Malware Protection (EC2・ECSのマルウェアスキャン)
  - EKS 保護 (有効な場合)

Finding の重要度:
  HIGH   → 即時対応必須（Slack/メール通知設定推奨）
  MEDIUM → 24時間以内に調査
  LOW    → 週次レビュー

通知設定:
  EventBridge → SNS → メール（prd/Mail_Kasumi）

確認コマンド:
aws guardduty list-detectors --region ap-northeast-1
aws guardduty list-findings \
  --region ap-northeast-1 \
  --detector-id <detector-id> \
  --finding-criteria '{"Criterion":{"severity":{"Gte":7}}}'
```

## Inspector

```
目的: CVEベース脆弱性スキャン（EC2・Lambda・ECRイメージ）

スキャン対象:
  - EC2インスタンス (bastion, giftcard)
  - Lambda関数 (21関数 コードスキャン)
  - ECR (prd-ignica-com-lmd-jar) コンテナイメージ

スキャン頻度:
  - EC2: OSパッケージ変更時・定期
  - Lambda: デプロイ時・定期
  - ECR: イメージプッシュ時・定期

重要度分類 (CVSS):
  CRITICAL  → 即日対応
  HIGH      → 7日以内
  MEDIUM    → 30日以内
  LOW       → 計画的対応

確認コマンド:
aws inspector2 list-findings \
  --region ap-northeast-1 \
  --filter-criteria '{"severity":[{"comparison":"EQUALS","value":"CRITICAL"}]}' \
  --query 'findings[*].{Title:title,Severity:severity,Resource:resources[0].id}'
```

## Security Hub

```
目的: セキュリティコンプライアンス状態一元管理

有効標準:
  - AWS Foundational Security Best Practices (FSBP) v1.0
  - CIS AWS Foundations Benchmark v1.4.0

統合サービス:
  - GuardDuty Findings → Security Hub に自動集約
  - Inspector Findings → Security Hub に自動集約
  - Config → Security Hub (コンプライアンス連携)

コンプライアンス確認:
aws securityhub get-insights \
  --region ap-northeast-1

aws securityhub get-findings \
  --region ap-northeast-1 \
  --filters '{"SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"}]}' \
  --query 'Findings[*].{Title:Title,Severity:Severity.Label,Resource:Resources[0].Id}'
```

## Config

```
目的: AWSリソース設定変更記録・コンプライアンス追跡

記録対象: 全AWSリソース（グローバル含む）
スナップショット保存先: s3://prd-ignica-com-configrecord/

主要設定ルール:
  - restricted-ssh: SSHポート制限確認
  - vpc-flow-logs-enabled: VPCフローログ有効確認
  - rds-instance-backup-enabled: RDSバックアップ有効確認
  - s3-bucket-ssl-requests-only: S3 HTTPS強制確認
  - kms-key-rotation-enabled: KMSキーローテーション確認

変更通知: SNS → CloudWatch → アラート

確認コマンド:
aws configservice describe-compliance-by-config-rule \
  --region ap-northeast-1 \
  --compliance-types NON_COMPLIANT \
  --query 'ComplianceByConfigRules[*].{Rule:ConfigRuleName,Status:Compliance.ComplianceType}'
```

## IAM / IAM Access Analyzer

```
IAM Access Analyzer ($46/6ヶ月):
  目的: 外部アクセス可能なリソース（S3・KMS・Lambda等）を自動検出
  
  アナライザー: アカウント/リージョンレベル
  検出対象:
    - 外部アカウントからアクセス可能なS3バケット
    - 外部からアクセス可能なKMSキー
    - 外部からアクセス可能なLambda関数
  
  確認コマンド:
  aws accessanalyzer list-analyzers --region ap-northeast-1
  aws accessanalyzer list-findings \
    --region ap-northeast-1 \
    --analyzer-arn <analyzer-arn> \
    --filter '{"status":{"eq":["ACTIVE"]}}'
```

## KMS 設定

```
コスト: $24 / 6ヶ月

目的: データ暗号化キー管理

暗号化対象:
  - Aurora MySQL (保存時暗号化)
  - S3バケット (SSE-KMS)
  - Secrets Manager シークレット
  - CloudWatch Logs

キーローテーション: 年次自動ローテーション有効（推奨）

確認コマンド:
aws kms list-keys --region ap-northeast-1
aws kms describe-key \
  --region ap-northeast-1 \
  --key-id <key-id> \
  --query 'KeyMetadata.{ID:KeyId,State:KeyState,Rotation:Description}'
```

## セキュリティ対応フロー

```
1. GuardDuty HIGH Finding 発生
   ↓ EventBridge → SNS → メール通知
   ↓ Security Hub に集約
   
2. 担当者確認 (目標: 1時間以内)
   ↓ Finding詳細・影響範囲確認
   
3. 対応判断
   ├── 誤検知 → Finding を SUPPRESSED に設定
   └── 実被害 → インシデント対応手順へ
   
4. インシデント対応
   ├── 影響リソースを隔離 (SG変更・停止)
   ├── CloudTrail で操作ログ確認
   ├── 被害範囲特定・復旧
   └── 事後報告・再発防止策
```

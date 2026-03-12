# AWS現状サマリー DEV

最終更新: 2026-03-12（初版 - 調査前スケルトン）  
AWSアカウント: 891376952870  
命名プレフィックス: ksm-posspk-  
リージョン: ap-northeast-1（東京）  
コンソール: https://ap-northeast-1.console.aws.amazon.com/console/home?region=ap-northeast-1

> ⚠️ DEV環境はLuvina内部開発環境。STG(750735758916) / PRD(332802448674) と別アカウント。  
> ⚠️ STGの `eb-rule-copy-backup-sg` がこのアカウントの Lambda をクロスアカウント参照中（設定ミス確定）。  
> ⚠️ STG内に `ksm-posspk-sns-topic-app-logs-dev` というSNSトピックが残留（このアカウントとの混在の名残）。

---

## 調査前判明済み情報

| 項目 | 内容 | 情報ソース |
|---|---|---|
| AWSアカウントID | 891376952870 | STG eb-rule-copy-backup-sg ターゲットARNから判明 |
| 命名プレフィックス | ksm-posspk- | STG調査ログ（Lambda ARN・ENV変数） |
| STGからのクロスアカウント参照 | arn:aws:lambda:ap-northeast-1:**891376952870**:function:ksm-posspk-lmd-function-copy-backup-sg | STGサマリー 問題No.eb-rule |

---

## 1. VPC・ネットワーク基本構成

> ※ 調査結果貼り付け後に記入

| 項目 | 値 |
|---|---|
| VPC ID | 調査中 |
| CIDR | 調査中 |
| AZ | ap-northeast-1a + ap-northeast-1c（推定） |
| NAT GW | 調査中 |
| Internet GW | 調査中 |
| Virtual Private GW | 調査中 |

### サブネット一覧

調査中

### セキュリティグループ 全件

調査中

---

## 2. EC2

調査中

---

## 3. RDS（Aurora MySQL）

調査中

---

## 4. Lambda

調査中

---

## 5. Step Functions

調査中

---

## 6. EventBridge ルール

調査中

### 注目リソース（調査前判明）

| ルール名 | 状態 | ターゲット |
|---|---|---|
| ksm-posspk-eb-rule-copy-backup-sg（推定） | 不明 | ksm-posspk-lmd-function-copy-backup-sg |

> ⚠️ STGの `eb-rule-copy-backup-sg` がこのLambdaをクロスアカウントターゲットとしている。  
> Lambda側のリソースポリシーでSTGアカウント(750735758916)からの呼び出しを許可しているか要確認。

---

## 7. S3

調査中

---

## 8. Transfer Family

調査中

---

## 9. IAM

調査中

---

## 10. CloudWatch・監視

調査中

---

## 11. セキュリティサービス

| サービス | 状態 |
|---|---|
| GuardDuty | 調査中 |
| Security Hub | 調査中 |
| Inspector | 調査中 |
| Config | 調査中 |

---

## 12. Secrets Manager / KMS

調査中

---

## 13. 問題点・改修候補

| # | カテゴリ | 問題内容 | 重要度 | 対応方針 |
|---|---|---|---|---|
| DEV-1 | EventBridge | STG(750735758916)からのクロスアカウントLambda呼び出し受け入れ状況 | 🚨 要確認 | Lambdaリソースポリシー確認後、STG側のEB設定を同アカウント内Lambdaに修正 |

---

## STG/PRDとの環境比較

| 項目 | DEV (posspk) | STG (posstg) | PRD (posprd) |
|---|---|---|---|
| AWSアカウント | 891376952870 | 750735758916 | 332802448674 |
| 命名プレフィックス | ksm-posspk- | ksm-posstg- | ksm-posprd- |
| VPC CIDR | 調査中 | 10.239.0.0/16 | 10.238.0.0/16 |
| EC2台数 | 調査中 | 4台 | 2台 |
| RDSクラスター | 調査中 | 2クラスター | 2クラスター |
| Lambda関数数 | 調査中 | 23関数 | 21関数 |

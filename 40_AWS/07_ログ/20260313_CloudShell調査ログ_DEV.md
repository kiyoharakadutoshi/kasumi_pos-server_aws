# CloudShell 調査ログ DEV 2026-03-13

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-13 |
| 調査者 | 清原 |
| AWSアカウント | 891376952870 (DEV / posspk) |
| リージョン | ap-northeast-1 |
| 目的 | マルエツチャージのインターネット接続経路調査・セキュリティ確認 |

> このファイルは CloudShell コマンドと受信内容の記録です。
> 調査目的：①マルエツチャージのインターネット接続経路を特定、②GIFT・電子棚札データへのアクセス可否確認、③セキュリティ問題の識別

---

## ブロック① アカウント・VPC・EC2確認

**DEV CloudShellで実行:**

```bash
aws sts get-caller-identity
aws ec2 describe-instances --region ap-northeast-1 \
  --query 'Reservations[*].Instances[*].{Name:Tags[?Key==`Name`]|[0].Value,State:State.Name}' \
  --output table
```

**結果:**

- アカウント: `891376952870` / ユーザー: `kiyohara` / Tag: `Environment=Spike`
- VPC:
  - `pos-dev-vpc`（10.226.50.0/24, vpc-089e5b317578b5171）
  - `posspk-vpc`（10.226.51.0/24, vpc-07b182b381dc59573）
  - デフォルトVPC（172.31.0.0/16）

**EC2一覧（running）:**

| Name | State |
|---|---|
| pos-bastion | running |
| stg-pos | running |
| stg-pos-system | running |
| prod-pos-server | running |
| stg-pos-large | running |
| stg-pos-server | running |
| prod-pos-t2.xlarge | running |
| kafka | running |
| ksm-posspk-ec2-instance-web-fe | running |
| posspk-ec2-bastion-public | running |
| pos-runner | running |
| ksm-posspk-ec2-instance-web-be | running |

---

## ブロック② EC2詳細・ALB・VPC確認

**結果:**

| Name | PrivateIP | PublicIP | SG | VPC |
|---|---|---|---|---|
| ksm-posspk-ec2-instance-web-fe | 10.226.51.15 | 54.95.43.177 | ksm-posprd-vpc-sg-ec2-web | posspk-vpc |
| ksm-posspk-ec2-instance-web-be | 10.226.51.91 | - | ksm-posprd-vpc-sg-ec2-web-be / ec2-rds-1 | posspk-vpc |
| posspk-ec2-bastion-public | 10.226.51.13 | 3.115.68.186 | posspk-sg-bastion | posspk-vpc |
| pos-runner | 10.226.51.115 | - | posspk-sg-gitlap-runner | posspk-vpc |
| pos-bastion | 10.226.50.24 | 54.250.119.69 | pos-luvina | pos-dev-vpc |
| kafka | 10.226.50.23 | 52.194.241.236 | pos-luvina | pos-dev-vpc |

**ALB:**

| Name | Scheme | VPC |
|---|---|---|
| ksm-posspk-alb-api-be | **internet-facing** | posspk-vpc |
| pos-alb | **internet-facing** | pos-dev-vpc |

---

## ブロック③ マルエツチャージ接続経路の特定

**ALBリスナー・ターゲット確認結果:**

- リスナー: HTTPS 443 / HTTPS 8443
- ターゲット①: 10.226.51.91:80 → **unhealthy**（EC2 web-be、実際は未使用）
- ターゲット②: 10.226.51.86:8080 → **healthy**（ECSタスク）

**ECSタスク確認:**
- クラスター: `ksm-posspk-ecs-cluster-web`
- サービス: `ksm-posspk-task-definition-web-be-service-sg4hsjt1`
- タスクIP: 10.226.51.86（posspk-vpc内）

**確定した接続経路:**

```
マルエツ チャージ端末
        ↓ HTTPS 443/8443（インターネット）
ALB: ksm-posspk-alb-api-be（internet-facing）
SG: ksm-posstg-vpc-sg-alb-web-be
        ↓ port 8080（ALB SGからECSタスクへ）
ECS タスク: 10.226.51.86（ksm-posspk-task-definition-web-be）✅ healthy
        ↓
RDS: posspk-db-instance-1（Aurora MySQL / db.r5.large / posspk-vpc）
```

---

## ブロック④ セキュリティ問題の確認

### 🔴 緊急問題（即時対応必要）

| SG名 | 問題内容 |
|---|---|
| `ec2-rds-1` | TCP 0-65535 / **0.0.0.0/0** 全開放 |
| `ksm-posprd-vpc-sg-ec2-web-be` | TCP 8080 / **0.0.0.0/0** 全開放 |
| `ksm-posstg-vpc-sg-alb-web-be`（ALB SG） | 全トラフィック / **0.0.0.0/0** 全開放 |
| `posspk-sg-gitlap-runner` | 全トラフィック / **0.0.0.0/0** 全開放 |

### 改修時のチャージ影響評価

- `ec2-rds-1` の全開放削除 → **影響なし**（ALBからの8080通信はALB SG専用ルールで維持）
- `ksm-posprd-vpc-sg-ec2-web-be` の8080削除 → **影響なし**（10.226.51.91はunhealthyで未使用）

---

## ブロック⑤ GIFT・電子棚札へのアクセス可否確認

**外部接続手段の確認結果:**

| 接続手段 | 結果 |
|---|---|
| VPCピアリング（アカウント間） | **なし** |
| Transit Gateway | **なし** |
| Site-to-Site VPN | **なし** |
| Direct Connect | **なし** |

**結論（暫定）:**
- posspk-vpc → カスミPRD（332802448674）への経路: **なし** → 本番GIFTサーバー・棚札には接続不可
- ただし **同一アカウント内（891376952870）のpos-dev-vpc**に電子棚札・GIFTの開発環境DBが存在する可能性あり
- posspk-vpc ↔ pos-dev-vpc 間のVPCピアリング・ルートテーブルは**未確認**

---

## 未確認事項（次回調査項目）

- [ ] posspk-vpc ↔ pos-dev-vpc 間のVPCピアリング・ルートテーブル確認
- [ ] pos-dev-vpc内のRDS（GIFT・棚札開発環境DB）へのアクセス可否確認
- [ ] pos-dev-vpc SGルール詳細確認
- [ ] posspk-vpcからpos-dev-vpc内DBへの到達可否確認

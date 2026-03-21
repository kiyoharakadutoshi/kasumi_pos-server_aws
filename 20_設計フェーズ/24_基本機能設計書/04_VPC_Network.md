# VPC / ネットワーク / Route53 詳細設定

> コスト: VPC $802 / 6ヶ月（NAT Gateway含む）

---

## VPC 基本設定

| 項目 | 設定値 |
|---|---|
| VPC ID | vpc-0e2d2d27b6860b7fc |
| CIDR ブロック | 10.238.0.0/16 |
| アベイラビリティゾーン | ap-northeast-1a + ap-northeast-1c |
| DNS ホスト名 | 有効 |
| DNS 解決 | 有効 |

## サブネット構成

| サブネット名 | AZ | 種別 | 用途 |
|---|---|---|---|
| public-1a | 1a | パブリック | Bastion, NAT GW |
| public-1c | 1c | パブリック | 予備 |
| private-1a | 1a | プライベート | Lambda, RDS, ECS, EC2(giftcard) |
| private-1c | 1c | プライベート | Lambda, RDS レプリカ |
| protected-1a | 1a | プロテクテッド | 最高セキュリティリソース |
| protected-1c | 1c | プロテクテッド | 最高セキュリティリソース |
| common-1a | 1a | コモン | 共通サービス |
| common-1c | 1c | コモン | 共通サービス |

## NAT Gateway

```
NAT Gateway パブリックIP: 57.182.174.110
配置AZ: ap-northeast-1a (パブリックサブネット)

用途:
  - プライベートサブネットのリソースからインターネットへの送信
  - Lambda・ECS・EC2のAWS APIコール
  - パッケージダウンロード・外部API呼び出し

コスト要因:
  - データ処理量: プライベートサブネット → インターネット通信量
  - 稼働時間: 24時間365日稼働
```

## VPN 接続設定

```
VPN接続ID: vpn-0ea9b7895f78e4c7e
VPN種別: IPSec (Site-to-Site VPN)
カスタマーゲートウェイ (CGW): 14.224.146.153
BGP ASN: 65000
ルーティング: BGP動的ルーティング

USMH側CIDRルート:
  - 10.156.96.0/24    → ファイル受信・GiftCard連携
  - 172.21.10.0/24    → DB接続セグメント
  - 10.156.96.192/26  → SFTP接続セグメント

AWS側CIDRルート: 10.238.0.0/16 → USMH側に広告

注意: Direct Connect はこのAWSアカウントに存在しない
      （USMH側AWSアカウントで管理の可能性あり）
```

## セキュリティグループ 主要設定

```
[bastion-sg]
  インバウンド:
    - UDP 1194 (OpenVPN): 許可元 USMH/Luvina固定IP
    - TCP 22 (SSH): 許可元 管理者固定IP
  アウトバウンド: ALL

[giftcard-sg]
  インバウンド:
    - TCP アプリポート: 10.156.96.0/24 (USMH側)
    - TCP 22: bastion-sg のみ
  アウトバウンド: ALL

[rds-sg]
  インバウンド:
    - TCP 3306: private-subnet CIDR (10.238.0.0/16)
    - TCP 3306: 172.21.10.0/24 (USMH DB接続)
  アウトバウンド: ALL (Aurora内部通信)

[lambda-sg]
  インバウンド: なし
  アウトバウンド:
    - TCP 3306: rds-sg (DB接続)
    - TCP 443: S3/Secrets Manager VPCエンドポイント

[sftp-sg]
  インバウンド:
    - TCP 22: 10.156.96.0/24, 10.156.96.192/26
  アウトバウンド: ALL
```

## VPC エンドポイント設定

```
S3 ゲートウェイエンドポイント: プライベートサブネット → S3 (無料)
Secrets Manager インターフェースエンドポイント: Lambda → Secrets Manager
Transfer Family: VPC エンドポイント (SFTP接続)
```

## Route53 設定

```
ホストゾーン: ignicapos.com (パブリック)

主要レコード:
  www.ignicapos.com    → 本番環境 (A/CNAME)
  stg.ignicapos.com    → ステージング環境 (A/CNAME)
  api.ignicapos.com    → API エンドポイント (存在確認要)

設定確認コマンド:
aws route53 list-hosted-zones --query 'HostedZones[*].{Name:Name,ID:Id}'
aws route53 list-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --query 'ResourceRecordSets[*].{Name:Name,Type:Type,Value:ResourceRecords[0].Value}'
```

## ネットワーク確認コマンド

```bash
# VPN接続状態確認
aws ec2 describe-vpn-connections \
  --region ap-northeast-1 \
  --query 'VpnConnections[*].{ID:VpnConnectionId,State:State,CGW:CustomerGatewayId}'

# VPN トンネル状態
aws ec2 describe-vpn-connections \
  --region ap-northeast-1 \
  --vpn-connection-ids vpn-0ea9b7895f78e4c7e \
  --query 'VpnConnections[0].VgwTelemetry'

# NAT Gateway 状態
aws ec2 describe-nat-gateways \
  --region ap-northeast-1 \
  --filter "Name=state,Values=available" \
  --query 'NatGateways[*].{ID:NatGatewayId,State:State,PublicIP:NatGatewayAddresses[0].PublicIp}'

# フローログ確認
aws ec2 describe-flow-logs \
  --region ap-northeast-1 \
  --query 'FlowLogs[*].{ID:FlowLogId,Status:FlowLogStatus,Destination:LogDestination}'
```

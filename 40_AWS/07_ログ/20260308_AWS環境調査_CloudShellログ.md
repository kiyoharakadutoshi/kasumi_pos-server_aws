# AWS環境調査 CloudShell コマンドログ

- **調査日時**: 2026-03-08
- **調査者**: Claude (LUVINA)
- **対象環境**: AWS 東京リージョン（ap-northeast-1）
- **目的**: カスミPOS本番環境のインフラ全体を把握する

---

## 1. VPC / ネットワーク

### コマンド
```bash
aws ec2 describe-vpcs --region ap-northeast-1
aws ec2 describe-subnets --region ap-northeast-1
aws ec2 describe-availability-zones --region ap-northeast-1
```

### 受信内容
| 項目 | 値 |
|------|-----|
| VPC ID | vpc-0e2d2d27b6860b7fc |
| CIDRブロック | 10.238.0.0/16 |
| 使用AZ | ap-northeast-1a / ap-northeast-1c |
| サブネット種別 | public / private / protected × 1a・1c + common × 1a・1c |

---

## 2. EC2インスタンス

### コマンド
```bash
aws ec2 describe-instances --region ap-northeast-1 \
  --query 'Reservations[].Instances[].[InstanceId,InstanceType,PrivateIpAddress,Placement.AvailabilityZone,Tags[?Key==`Name`].Value|[0]]' \
  --output table
```

### 受信内容
| 名前 | インスタンスタイプ | プライベートIP | AZ |
|------|-------------------|---------------|----|
| bastionサーバー | t3.xlarge | 10.238.2.39 | ap-northeast-1a |
| giftcardサーバー | t2.large | 10.238.2.198 | ap-northeast-1a |

> **備考**: App Server / Batch Server は存在しない。処理はLambdaで実装。

---

## 3. RDS（Aurora MySQL）

### コマンド
```bash
aws rds describe-db-clusters --region ap-northeast-1
aws rds describe-db-instances --region ap-northeast-1
```

### 受信内容
- Auroraクラスター2系統（instance-1 / instance-2）
- エンジン: Aurora MySQL 8.0
- プライマリ: db.r5.2xlarge
- レプリカ: db.t3.medium
- Multi-AZ: **False**

---

## 4. Lambda関数

### コマンド
```bash
aws lambda list-functions --region ap-northeast-1 \
  --query 'Functions[].[FunctionName,Runtime,MemorySize,Timeout]' \
  --output table
```

### 受信内容
- 合計 **21関数**
- 主ランタイム: Java 17（`ksm-posprd`系）
- 一部: python3.13 / python3.11
- メモリ: 128〜2048 MB
- タイムアウト: 300〜900秒

---

## 5. S3バケット

### コマンド
```bash
aws s3 ls --region ap-northeast-1
```

### 受信内容
| バケット名 | 用途 |
|-----------|------|
| prd-ignica-ksm | メインバケット |
| prd-ignica-ksm-master-backup | マスターバックアップ |
| prd-ignica-ksm-pmlogs | PMログ |
| prd-ignica-com-lmd-jar | LambdaのJARファイル配布 |
| prd-aeon-gift-card | ギフトカード関連 |
| prd-ignica-com-configrecord | 設定記録 |

> **備考**: `pos-master-prod` は存在しない。

---

## 6. Step Functions

### コマンド
```bash
aws stepfunctions list-state-machines --region ap-northeast-1
```

### 受信内容（7ステートマシン）
| 系統 | 名前 |
|------|------|
| OC系 | receive-pos-master-oc |
| OC系 | import-pos-master-oc |
| OC系 | create-txt-file-oc |
| SG系 | receive-and-import-pos-master-sg |
| SG系 | create-txt-file-sg |
| SH系 | import-pos-master-sh |
| 共通 | sent-txt-file |

---

## 7. SQS

### コマンド
```bash
aws sqs list-queues --region ap-northeast-1
```

### 受信内容（2 FIFOキュー・SG専用）
- `ksm-posprd-sqs-export-queue-sg.fifo`
- `ksm-posprd-sqs-store-code-queue-sg.fifo`

---

## 8. AWS Transfer Family

### コマンド
```bash
aws transfer list-servers --region ap-northeast-1
aws transfer describe-server --server-id <ID> --region ap-northeast-1
```

### 受信内容（3台）
| サーバーID | 系統 | 認証方式 |
|-----------|------|---------|
| s-2a4905e8210f48248 | OC系 | SERVICE_MANAGED |
| s-bd974a35aa994c838 | SG系 | SERVICE_MANAGED |
| s-5546031218784c4ba | SH系 | SERVICE_MANAGED |

> **備考**: SH系は2025/11途中追加がコスト急増（$432→$669）の真因。転送量課金は最大$0.16/月で微小。受信専用（送信はStep Functions → Lambda → FTPClient）。

---

## 9. VPN / ネットワーク接続

### コマンド
```bash
aws ec2 describe-vpn-connections --region ap-northeast-1
aws ec2 describe-customer-gateways --region ap-northeast-1
aws ec2 describe-nat-gateways --region ap-northeast-1
```

### 受信内容
| 項目 | 値 |
|------|-----|
| VPN接続ID | vpn-0ea9b7895f78e4c7e |
| カスタマーゲートウェイIP | 14.224.146.153 |
| BGP ASN | 65000 |
| 接続方式 | IPSec VPN |
| USMH側CIDR① | 10.156.96.0/24（giftcard/SFTP） |
| USMH側CIDR② | 172.21.10.0/24（DB接続） |
| USMH側CIDR③ | 10.156.96.192/26（SFTP） |
| NAT GW パブリックIP | 57.182.174.110 |
| Direct Connect | なし（USMH側アカウント管理の可能性あり） |

---

## 10. EventBridge（スケジュール）

### コマンド
```bash
aws events list-rules --region ap-northeast-1
```

### 受信内容
| ルール | スケジュール（UTC） | JST換算 |
|--------|-------------------|---------|
| P001監視 | cron(00 15 * * ? *) | 00:00 |
| ItemMaster | cron(30 20 * * ? *) | 05:30 |

---

## 11. Route53

### コマンド
```bash
aws route53 list-hosted-zones
```

### 受信内容
- ホストゾーン: `ignicapos.com`（パブリック）

---

## 12. Secrets Manager

### コマンド
```bash
aws secretsmanager list-secrets --region ap-northeast-1
```

### 受信内容
| シークレット名 |
|--------------|
| ksm-posprd-sm-db |
| ksm-posprd-sm-db-replica |
| ksm-posprd-sm-sftp |
| prd/Mail_Kasumi |
| prd/Batch_Kasumi |
| prd/Replica_Kasumi |

---

## 13. NAT変換テーブル（通信仕様）

※ CloudShellではなく、PPTXおよびソースコード解析から判明

| 通信方向 | 送信元IP | NAT後IP | 宛先 |
|---------|---------|---------|------|
| LuvinaAWS → AFSオーソリ（PRD） | 10.238.2.39 | 10.156.96.220 | 192.168.60.10:1501-1508 |
| LuvinaAWS → AFSオーソリ（STG） | 10.239.2.4 | 10.156.96.221 | 192.168.60.100 |
| ギフト端末 → LuvinaAWS（PRD） | 10.0.0.0/8 | 10.156.96.214 | 10.238.2.198 |
| ギフト端末 → LuvinaAWS（STG） | 10.0.0.0/8 | 10.156.96.214 | 10.239.2.193 |
| LuvinaAWS → NTT DATA CDSセンタ | NAT GW | 57.182.174.110 | SFTP |

---

## 調査まとめ

| カテゴリ | 主な発見 |
|---------|---------|
| EC2 | bastion + giftcard の2台のみ（App/Batch ServerはLambdaで代替） |
| RDS | Aurora MySQL 8.0 × 2クラスター、Multi-AZ=False（冗長性なし） |
| Lambda | 21関数、Java17主体 |
| Transfer Family | 3台（OC/SG/SH系）、SH追加がコスト増加の原因 |
| VPN | IPSec VPN でUSMH閉域網と接続（Direct Connectなし） |
| Bastion接続 | LUVINA開発者はAWS Client VPN (UDP1194/OpenVPN) → Bastion経由 |


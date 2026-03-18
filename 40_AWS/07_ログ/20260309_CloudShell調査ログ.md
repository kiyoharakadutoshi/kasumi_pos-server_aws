# CloudShell調査ログ 2026-03-09

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-09 |
| 調査者 | 清原 |
| PRDアカウント | 332802448674 |
| STGアカウント | 750735758916 |
| リージョン | ap-northeast-1 |

---

## [1] Transfer Family 詳細調査（PRD・STG）

### [1]-1 PRD Transfer Family サーバー詳細

**コマンド:**
```bash
for SID in s-2a4905e8210f48248 s-bd974a35aa994c838 s-5546031218784c4ba; do
  echo "=== $SID ==="
  aws transfer describe-server --region ap-northeast-1 --server-id $SID \
    --query 'Server.{State:State,EndpointDetails:EndpointDetails,Protocols:Protocols,Tags:Tags}' \
    --output json
  echo ""
  USERS=$(aws transfer list-users --region ap-northeast-1 --server-id $SID --query 'Users[*].UserName' --output text)
  for U in $USERS; do
    aws transfer describe-user --region ap-northeast-1 --server-id $SID --user-name $U \
      --query 'User.{Name:UserName,HomeDir:HomeDirectory,HomeDirMappings:HomeDirectoryMappings,Role:Role}' \
      --output json
  done
done
```

**受信内容:**

| サーバー名 | サーバーID | VPC Endpoint ID | サブネット | ユーザー名 | S3マッピング先 |
|---|---|---|---|---|---|
| ksm-posprd-tf-server-**oc** | s-2a4905e8210f48248 | vpce-00da0e948a06819d1 | subnet-0d125718b8c5c5a23 / subnet-030f7db5506682c07 | ksm-posprd-tf-user-oc | /prd-ignica-ksm/pos-original/**oc**/receive |
| ksm-posprd-tf-server-**sg** | s-bd974a35aa994c838 | vpce-0c489e9240780e92b | 同上 | ksm-posprd-tf-user-sg | /prd-ignica-ksm/pos-original/**sg**/receive |
| ksm-posprd-tf-server-**sh** | s-5546031218784c4ba | vpce-0bb018fa328a44d12 | 同上 | ksm-posprd-tf-user-sh | /prd-ignica-ksm/pos-original/**sh**/receive |

**確認結果:**
- 全サーバー VPC=vpc-0e2d2d27b6860b7fc (PRD VPC)、プロトコル=SFTP
- 全サーバー受信専用（/receive パス）
- OC・SG は CloudFormation スタック `ksm-posprd-transfer` で管理、SH はタグなし（後日追加）
- IAMロール: 全ユーザー `ksm-posprd-iam-role-tf` 共通

---

### [1]-2 STG Transfer Family サーバー詳細

**コマンド:**
```bash
for SID in s-7c808e1040dd437da s-a69b3df467bc43b99 s-d5d0d941bfb04a72b; do
  echo "=== $SID ==="
  aws transfer describe-server --region ap-northeast-1 --server-id $SID \
    --query 'Server.{State:State,EndpointDetails:EndpointDetails,Protocols:Protocols,Tags:Tags}' \
    --output json
  echo ""
  USERS=$(aws transfer list-users --region ap-northeast-1 --server-id $SID --query 'Users[*].UserName' --output text)
  for U in $USERS; do
    aws transfer describe-user --region ap-northeast-1 --server-id $SID --user-name $U \
      --query 'User.{Name:UserName,HomeDir:HomeDirectory,HomeDirMappings:HomeDirectoryMappings,Role:Role}' \
      --output json
  done
done
```

**受信内容:**

| サーバー名 | サーバーID | VPC Endpoint ID | サブネット | ユーザー名 | S3マッピング先 |
|---|---|---|---|---|---|
| ksm-posstg-tf-server-**oc** | s-7c808e1040dd437da | vpce-003c773c1f3807562 | subnet-08999673be546d752 / subnet-0d4bb4d8d559e39b1 | ksm-posstg-tf-user-oc | /stg-ignica-ksm/pos-original/**oc**/receive |
| ksm-posstg-tf-server-**sh** | s-a69b3df467bc43b99 | vpce-00ef51cdd11a09ae1 | 同上 | ksm-posstg-tf-user-sh | /stg-ignica-ksm/pos-original/**sh**/receive |
| ksm-posstg-tf-server-**sg** | s-d5d0d941bfb04a72b | vpce-0b7fe3eac68ea1d3b | 同上 | ksm-posstg-tf-user-sg | /stg-ignica-ksm/pos-original/**sg**/receive |

**確認結果:**
- 全サーバー VPC=vpc-09bc4a6da904ace31 (STG VPC)、プロトコル=SFTP
- 全サーバー受信専用（/receive パス）
- OC・SG は CloudFormation スタック `ksm-posstg-transfer` で管理
- SH（s-a69b3df467bc43b99）はタグが Name のみ → STGでは HomeDirMappings 方式（PRDと異なりHomeDir=nullでMappings使用）
- IAMロール: 全ユーザー `ksm-posstg-iam-role-tf` 共通

---

## 確認結果サマリー

### Transfer Family 全体構成（PRD/STG共通）

```
外部システム（SFTP Client）
  ├── BIPROGY (OpenCentral)  ──SFTP PUT──→ tf-server-oc → S3: pos-original/oc/receive/
  ├── VINX   (POS Server)    ──SFTP PUT──→ tf-server-sg → S3: pos-original/sg/receive/
  └── SHARP  (P003)          ──SFTP PUT──→ tf-server-sh → S3: pos-original/sh/receive/

※全サーバーVPCエンドポイント経由（インターネット非公開）
※Transfer Familyは受信専用。外部への送信は別経路（Lambda平文FTP）
```

### PRD/STG 対比

| 項目 | PRD | STG |
|---|---|---|
| S3バケット | prd-ignica-ksm | stg-ignica-ksm |
| VPC | vpc-0e2d2d27b6860b7fc | vpc-09bc4a6da904ace31 |
| OCサーバーID | s-2a4905e8210f48248 | s-7c808e1040dd437da |
| SGサーバーID | s-bd974a35aa994c838 | s-d5d0d941bfb04a72b |
| SHサーバーID | s-5546031218784c4ba | s-a69b3df467bc43b99 |
| CFnスタック | ksm-posprd-transfer | ksm-posstg-transfer |
| SH管理 | タグなし（手動追加） | タグなし（手動追加） |

---

## チャット別索引

| セッション | 調査内容 |
|---|---|
| 2026-03-09 AM | PRD/STG セキュリティ監査・ネットワーク構成図・VPN T2調査 |
| 2026-03-09 PM | Transfer Family詳細（OC/SG/SH）PRD・STG全サーバー・ユーザー・S3マッピング確定 |

# CloudShell調査ログ PRD 2026-03-09

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-09 |
| 調査者 | 清原 |
| AWSアカウント | 332802448674 (PRD) |
| リージョン | ap-northeast-1 |

---

## [1] Transfer Family サーバー一覧

**コマンド:**
```bash
aws transfer list-servers --region ap-northeast-1 --output table
```

**受信内容:**
```
s-2a4905e8210f48248  S3  VPC  SERVICE_MANAGED  ONLINE  UserCount:1  ksm-posprd-iam-role-tf-logs
s-5546031218784c4ba  S3  VPC  SERVICE_MANAGED  ONLINE  UserCount:1  (ログロールなし)
s-bd974a35aa994c838  S3  VPC  SERVICE_MANAGED  ONLINE  UserCount:1  ksm-posprd-iam-role-tf-logs
```

**確認結果:** 3台すべてONLINE

---

## [2] Transfer Family サーバー詳細（エンドポイント・ユーザー）

**コマンド:**
```bash
for SID in s-2a4905e8210f48248 s-bd974a35aa994c838 s-5546031218784c4ba; do
  echo "=== $SID ==="
  aws transfer describe-server --region ap-northeast-1 --server-id $SID \
    --query 'Server.{State:State,EndpointDetails:EndpointDetails,Protocols:Protocols,Tags:Tags}' \
    --output json
  USERS=$(aws transfer list-users --region ap-northeast-1 --server-id $SID --query 'Users[*].UserName' --output text)
  for U in $USERS; do
    aws transfer describe-user --region ap-northeast-1 --server-id $SID --user-name $U \
      --query 'User.{Name:UserName,HomeDir:HomeDirectory,HomeDirMappings:HomeDirectoryMappings,Role:Role}' \
      --output json
  done
done
```

**受信内容:**

| サーバー名 | サーバーID | VPC EP | S3マッピング先 |
|---|---|---|---|
| ksm-posprd-tf-server-**oc** | s-2a4905e8210f48248 | vpce-00da0e948a06819d1 | /prd-ignica-ksm/pos-original/**oc**/receive |
| ksm-posprd-tf-server-**sg** | s-bd974a35aa994c838 | vpce-0c489e9240780e92b | /prd-ignica-ksm/pos-original/**sg**/receive |
| ksm-posprd-tf-server-**sh** | s-5546031218784c4ba | vpce-0bb018fa328a44d12 | /prd-ignica-ksm/pos-original/**sh**/receive |

共通:
- VPC: vpc-0e2d2d27b6860b7fc
- サブネット: subnet-0d125718b8c5c5a23 / subnet-030f7db5506682c07
- IAMロール: ksm-posprd-iam-role-tf
- CFnスタック: ksm-posprd-transfer（OC・SG）、SHはタグなし（手動追加）

**確認結果:** 全サーバー受信専用（/receive パス）。Transfer Familyへの送信機能なし。

---

---

## [3] Transfer Family セキュリティグループ確認

**コマンド:**
```bash
for VPCE in vpce-00da0e948a06819d1 vpce-0c489e9240780e92b vpce-0bb018fa328a44d12; do
  aws ec2 describe-vpc-endpoints --region ap-northeast-1 \
    --vpc-endpoint-ids $VPCE \
    --query 'VpcEndpoints[0].{Groups:Groups,SubnetIds:SubnetIds}' \
    --output json
done
```

**受信内容:**

全3サーバー共通:
- **SG: sg-0d8afd91c37a78137 (ksm-posprd-vpc-sg-ep-tf)**
- サブネット: subnet-030f7db5506682c07 / subnet-0d125718b8c5c5a23

**確認結果:** Transfer Family 3台すべてが同一SGを共有。SG名から専用SGが設定されている。ルール詳細は別途確認要。

---

## [4] Lambda `sent-txt-file` コード確認

**コマンド:**
```bash
aws lambda get-function --region ap-northeast-1 \
  --function-name ksm-posprd-lmd-function-sent-txt-file \
  --query 'Code.Location' --output text
# → 署名付きURL取得後、GitHubリポジトリ kasumi_pos-server-batch-isida のソースで確認
```

**確認対象ファイル:**
- `send-file-handler/src/main/java/com/luvina/pos/provider/SentFileHandler.java`
- `send-file-handler/src/main/java/com/luvina/pos/provider/FtpService.java`

**確認結果:**

| 項目 | 内容 |
|---|---|
| プロトコル | **平文FTP**（`org.apache.commons.net.ftp.FTPClient`） |
| 暗号化 | **なし**（FTPSClientではなくFTPClient） |
| 接続モード | Passive Mode |
| ファイルタイプ | BINARY |
| 接続先情報 | Lambda入力パラメータ `ftp_access_info.host/port/user/pass` |
| 送信先ディレクトリ | `/{storeCode}/Recv`（storeCode = "0" + パスの末尾） |
| リトライ | なし（例外スロー） |

**フロー詳細:**
```
Step Functions
  → Lambda(sent-txt-file) が受け取るパラメータ:
      bucketName: S3バケット名
      path:       S3オブジェクトパス (例: pos-master/ishida/csv/001/)
      name:       ファイル名
      ftp_access_info: {host, port, user, pass}  ← Aurora MySQLから取得
  → S3からファイルを読み込み
  → FTPClient で host:port に接続（平文）
  → /{storeCode}/Recv に PUT
  → 成功時: backupパス(csv→backup)をレスポンスに返す
```

**⚠️ セキュリティ上の問題:**
- 平文FTPのためネットワーク上でID/パスワード・ファイル内容が盗聴可能
- ただし通信経路はUSMH閉域網（VPN）内のため、インターネット露出はなし
- VPN T2がDOWNしているため、T1のみで冗長性なし

## チャット別索引

| 日時 | 内容 |
|---|---|
| 2026-03-09 AM | PRD/STG セキュリティ監査・ネットワーク構成図・VPN T2調査 |
| 2026-03-09 PM [1][2] | Transfer Family PRD全サーバー詳細・S3マッピング確定 |

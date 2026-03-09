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

**確認結果:**

| VPC EP | ENI ID | プライベートIP | SG |
|---|---|---|---|
| vpce-00da0e948a06819d1 (oc) | eni-0f824c1ac25885c8c | 10.238.3.138 | sg-0d8afd91c37a78137 |
| vpce-00da0e948a06819d1 (oc) | eni-0fba3aa261c62018f | 10.238.2.221 | sg-0d8afd91c37a78137 |
| vpce-0c489e9240780e92b (sg) | eni-02b46c90c62f3d3b0 | 10.238.3.215 | sg-0d8afd91c37a78137 |
| vpce-0c489e9240780e92b (sg) | eni-036980648a3c00dd4 | 10.238.2.234 | sg-0d8afd91c37a78137 |
| vpce-0bb018fa328a44d12 (sh) | eni-01d33a59ca70ab2e4 | 10.238.3.139 | sg-0d8afd91c37a78137 |
| vpce-0bb018fa328a44d12 (sh) | eni-0f22b1fbb8a44b889 | 10.238.2.184 | sg-0d8afd91c37a78137 |

- 各VPC EP に ENI が2つ（AZ-1a: 10.238.2.x / AZ-1c: 10.238.3.x）
- PRD全3台は **sg-0d8afd91c37a78137 (ksm-posprd-vpc-sg-ep-tf)** 1つのみ
- SGインバウンドルール: TCP22 / 許可元 **10.156.96.192/26** (For SFTP Inbound) のみ ✅
  → USMH SFTPセグメントのみ許可。インターネット完全遮断。

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

---

## [5] Transfer Family VPCエンドポイント プライベートIP

**コマンド:**
```bash
for VPCE in vpce-00da0e948a06819d1 vpce-0c489e9240780e92b vpce-0bb018fa328a44d12; do
  aws ec2 describe-network-interfaces --region ap-northeast-1 \
    --filters "Name=description,Values=VPC Endpoint Interface $VPCE" \
    --query 'NetworkInterfaces[*].{AZ:AvailabilityZone,IP:PrivateIpAddress}' \
    --output table
done
```

**受信内容:**

| サーバー | VPCE ID | AZ-1a IP | AZ-1c IP |
|---|---|---|---|
| tf-server-**oc** | vpce-00da0e948a06819d1 | 10.238.2.221 | 10.238.3.138 |
| tf-server-**sg** | vpce-0c489e9240780e92b | 10.238.2.234 | 10.238.3.215 |
| tf-server-**sh** | vpce-0bb018fa328a44d12 | 10.238.2.184 | 10.238.3.139 |

**確認結果:** 各Transfer Familyは2AZ冗長でプライベートIPが割り当てられている。外部システム（BIPROGY/VINX/SHARP）はUSMH閉域網VPN経由でこれらIPにSFTP接続。

---

## [6] S3バケット通知設定（受信トリガー確認）

**コマンド:**
```bash
aws s3api get-bucket-notification-configuration \
  --bucket prd-ignica-ksm --output json
```

**受信内容:**
```json
{ "EventBridgeConfiguration": {} }
```

**確認結果:**
- S3はすべてのイベントを**EventBridgeに転送**する設定
- Lambda/SQSへの直接通知ではない
- `EventBridgeConfiguration: {}` = EventBridge転送が有効（空オブジェクトは「全イベント転送」を意味する）
- **次の調査:** EventBridgeのルールでどのS3イベントがどのStep Functions/Lambdaを起動しているかを確認する必要あり

---

---

## [7] EventBridgeルール（S3トリガー）確認

**コマンド:**
```bash
aws events list-rules --region ap-northeast-1 \
  --query 'Rules[*].{Name:Name,State:State,Pattern:EventPattern}' \
  --output json | python3 -c "..."
```

**受信内容（S3関連ルール一覧）:**

| ルール名 | 状態 | トリガー条件（S3キー） |
|---|---|---|
| eb-rule-receive-pos-master-**oc** | ENABLED | `pos-original/oc/receive/*.end` or `*.END` |
| eb-rule-receive-pos-master-**sg** | ENABLED | `pos-original/sg/receive/*.zip` or `*.ZIP` |
| eb-rule-receive-pos-master-**sh** | ENABLED | `pos-original/sh/receive/*.end` or `*.END` |
| eb-rule-receive-splited-pos-master-**oc** | ENABLED | `pos-original/oc/csv/0253/*/`.ENDIMPORT`、`/0218/*/` 、`/0343/*/` |
| eb-rule-create-txt-file-**sg** | ENABLED | `pos-original/sg/csv/*/*.ENDEXPORT` |
| eb-rule-copy-backup-**sg** | ENABLED | `pos-original/sg/backup/*/*.zip` |
| eb-rule-check-price | **DISABLED** | `pos-master/ishida/backup/*/*ESLDATA.TXT` or `csv/*/*063000ESLDATA.TXT` |
| eb-rule-itemmaster-import-monitoring | ENABLED | （Cron/Pattern=null） |
| eb-rule-p001-import-monitoring | ENABLED | （Cron/Pattern=null） |

**確認結果・重要ポイント:**

① **トリガーファイルはフラグファイル方式**
- OC/SH: `.end` / `.END` ファイルが来たら処理開始
- SG: `.zip` / `.ZIP` ファイルが来たら処理開始（ZIPで転送）

② **OC系に店舗コード限定ルール**
- `receive-splited-pos-master-oc` は店舗コード 0253/0218/0343 専用
- 特定店舗向けに別処理（分割インポート）が存在

③ **ESL連携ルールが無効化中**
- `eb-rule-check-price` = DISABLED（ESLデータ = 電子棚札向け価格データ）
- 過去に実装されたが現在は停止中

**確定した受信フロー（OC系）:**
```
BIPROGY(OpenCentral)
  ──SFTP PUT──→ Transfer Family (tf-server-oc)
  → S3: pos-original/oc/receive/*.end
  → EventBridge: eb-rule-receive-pos-master-oc
  → Step Functions: receive-pos-master-oc
  → （import-pos-master-oc → Aurora MySQL投入）
```

**確定した受信フロー（SG系）:**
```
VINX(POS Server)
  ──SFTP PUT──→ Transfer Family (tf-server-sg)
  → S3: pos-original/sg/receive/*.zip
  → EventBridge: eb-rule-receive-pos-master-sg
  → Step Functions: receive-and-import-pos-master-sg
  → S3: pos-original/sg/csv/*/*.ENDEXPORT
  → EventBridge: eb-rule-create-txt-file-sg
  → Step Functions: create-txt-file-sg
  → S3: pos-original/sg/backup/*/*.zip
  → EventBridge: eb-rule-copy-backup-sg
  → （バックアップ処理）
```

**確定した受信フロー（SH系）:**
```
SHARP(P003)
  ──SFTP PUT──→ Transfer Family (tf-server-sh)
  → S3: pos-original/sh/receive/*.end
  → EventBridge: eb-rule-receive-pos-master-sh
  → Step Functions: import-pos-master-sh
  → （Aurora MySQL投入）
```

---

---

## [8] EventBridgeルール 全一覧

**コマンド:**
```bash
aws events list-rules --region ap-northeast-1 \
  --query 'Rules[*].{Name:Name,State:State}' --output table
```

**受信内容（PRD全ルール）:**

| ルール名 | 状態 | 備考 |
|---|---|---|
| DO-NOT-DELETE-AmazonInspectorEc2ManagedRule | ENABLED | **Amazon Inspector自動作成** |
| DO-NOT-DELETE-AmazonInspectorEc2TagManagedRule | ENABLED | 同上 |
| DO-NOT-DELETE-AmazonInspectorEcrManagedRule | ENABLED | 同上 |
| DO-NOT-DELETE-AmazonInspectorLambdaCodeManagedRule | ENABLED | 同上 |
| DO-NOT-DELETE-AmazonInspectorLambdaManagedRule | ENABLED | 同上 |
| DO-NOT-DELETE-AmazonInspectorLambdaTagManagedRule | ENABLED | 同上 |
| ksm-posprd-eb-rule-check-price | DISABLED | ESL連携（停止中） |
| ksm-posprd-eb-rule-copy-backup-sg | ENABLED | SG バックアップコピー |
| ksm-posprd-eb-rule-create-txt-file-sg | ENABLED | SG TXTファイル生成 |
| ksm-posprd-eb-rule-itemmaster-import-monitoring | ENABLED | アイテムマスター監視 |
| **ksm-posprd-eb-rule-night-export-sg** | **ENABLED** | **夜間SG出力（STGにも存在）** |
| ksm-posprd-eb-rule-p001-import-monitoring | ENABLED | P001監視 |
| ksm-posprd-eb-rule-receive-pos-master-oc | ENABLED | OC受信トリガー |
| ksm-posprd-eb-rule-receive-pos-master-sg | ENABLED | SG受信トリガー |
| ksm-posprd-eb-rule-receive-pos-master-sh | ENABLED | SH受信トリガー |
| ksm-posprd-eb-rule-receive-splited-pos-master-oc | ENABLED | OC分割インポート |

**確認結果:**

① **`night-export-sg` はPRDにも存在・ENABLED**
　→ STGのみと思っていたが、PRDにも同名ルールがある。前回の調査漏れ（フィルタ条件に`night`が含まれていなかったため）

② **Amazon Inspector が PRDで有効**
　→ `DO-NOT-DELETE-AmazonInspector*` 系6本のルールが自動作成されている
　→ EC2・ECR・Lambdaの脆弱性スキャンが動いている（STGには存在しない）

③ **STGとPRDのルール差異（確定版）**

| ルール | PRD | STG |
|---|---|---|
| `*-9233` 系（3本） | なし | あり（全DISABLED） |
| `night-export-sg` | ENABLED | ENABLED |
| `night-export-sg-9233` | なし | あり（DISABLED） |
| `check-price` | DISABLED | ENABLED |
| `DO-NOT-DELETE-AmazonInspector*` | あり（6本） | なし |

**次の調査候補:**
- `night-export-sg` のパターン・ターゲット確認（何をトリガーに何を起動するか）
- STGの `-9233` ルールの削除要否確認

---

---

## [9] EventBridgeルール `night-export-sg` 詳細

**コマンド:**
```bash
aws events describe-rule --region ap-northeast-1 \
  --name ksm-posprd-eb-rule-night-export-sg --output json

aws events list-targets-by-rule --region ap-northeast-1 \
  --rule ksm-posprd-eb-rule-night-export-sg --output json
```

**受信内容:**
```json
{
  "ScheduleExpression": "cron(30 20 * * ? *)",   // JST 05:30 毎日
  "State": "ENABLED",
  "Target": {
    "Arn": "ksm-posprd-lmd-function-create-file-end-for-night",
    "InputTemplate": {
      "bucketName": "prd-ignica-ksm",
      "path": "pos-original/sg/csv/",
      "name": "SG_night_export_trigger_<timestamp>.ENDEXPORT"
    }
  }
}
```

**確認結果:** STGと完全に同じ構成。PRD/STG両方で毎日JST05:30に夜間SGバッチが動作。

---

## チャット別索引

| 日時 | 内容 |
|---|---|
| 2026-03-09 AM | PRD/STG セキュリティ監査・ネットワーク構成図・VPN T2調査 |
| 2026-03-09 PM [1][2] | Transfer Family PRD全サーバー詳細・S3マッピング確定 |

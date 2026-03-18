# CloudShell調査ログ STG 2026-03-09

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-09 |
| 調査者 | 清原 |
| AWSアカウント | 750735758916 (STG) |
| リージョン | ap-northeast-1 |

---

## [1] Transfer Family サーバー一覧

**コマンド:**
```bash
aws transfer list-servers --region ap-northeast-1 --output table
```

**受信内容:**
```
s-7c808e1040dd437da  S3  VPC  SERVICE_MANAGED  ONLINE  UserCount:1  ksm-posstg-iam-role-tf-logs
s-a69b3df467bc43b99  S3  VPC  SERVICE_MANAGED  ONLINE  UserCount:1  (ログロールなし)
s-d5d0d941bfb04a72b  S3  VPC  SERVICE_MANAGED  ONLINE  UserCount:1  ksm-posstg-iam-role-tf-logs
```

**確認結果:** 3台すべてONLINE

---

## [2] Transfer Family サーバー詳細（エンドポイント・ユーザー）

**コマンド:**
```bash
for SID in s-7c808e1040dd437da s-a69b3df467bc43b99 s-d5d0d941bfb04a72b; do
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
| ksm-posstg-tf-server-**oc** | s-7c808e1040dd437da | vpce-003c773c1f3807562 | /stg-ignica-ksm/pos-original/**oc**/receive |
| ksm-posstg-tf-server-**sg** | s-d5d0d941bfb04a72b | vpce-0b7fe3eac68ea1d3b | /stg-ignica-ksm/pos-original/**sg**/receive |
| ksm-posstg-tf-server-**sh** | s-a69b3df467bc43b99 | vpce-00ef51cdd11a09ae1 | /stg-ignica-ksm/pos-original/**sh**/receive |

共通:
- VPC: vpc-09bc4a6da904ace31
- サブネット: subnet-08999673be546d752 / subnet-0d4bb4d8d559e39b1
- IAMロール: ksm-posstg-iam-role-tf
- CFnスタック: ksm-posstg-transfer（OC・SG）、SHはタグなし（手動追加）

**確認結果:** 全サーバー受信専用（/receive パス）。PRDと構成対称。

---

---

## [3] Transfer Family セキュリティグループ確認

**コマンド:**
```bash
for VPCE in vpce-003c773c1f3807562 vpce-0b7fe3eac68ea1d3b vpce-00ef51cdd11a09ae1; do
  aws ec2 describe-network-interfaces --region ap-northeast-1 \
    --filters "Name=vpc-id,Values=vpc-09bc4a6da904ace31" \
              "Name=description,Values=*$VPCE*" \
    --query 'NetworkInterfaces[*].{ID:NetworkInterfaceId,IP:PrivateIpAddress,SG:Groups[*].GroupId}' \
    --output json
done
```

**受信内容:**

| VPC EP | ENI ID | プライベートIP | SG |
|---|---|---|---|
| vpce-003c773c1f3807562 (oc) | eni-0e6d7d2707a080231 | 10.239.2.218 | sg-06153ac3ff38765ab |
| vpce-003c773c1f3807562 (oc) | eni-09c7dbbad288acdd0 | 10.239.3.228 | sg-06153ac3ff38765ab |
| vpce-0b7fe3eac68ea1d3b (sg) | eni-0e7d92a64bc1d4fa3 | 10.239.2.225 | sg-09de3d205a615797e **+ sg-06153ac3ff38765ab** |
| vpce-0b7fe3eac68ea1d3b (sg) | eni-099a5be535407b015 | 10.239.3.217 | sg-09de3d205a615797e **+ sg-06153ac3ff38765ab** |
| vpce-00ef51cdd11a09ae1 (sh) | eni-0af243fb279081d11 | 10.239.2.147 | sg-06153ac3ff38765ab |
| vpce-00ef51cdd11a09ae1 (sh) | eni-034ce3aaa1c514874 | 10.239.3.253 | sg-06153ac3ff38765ab |

**確認結果:**
- ⚠️ **tf-server-sg（VINX/POS系）のみ sg-09de3d205a615797e が追加で付いている**
- OC・SHは共通SG sg-06153ac3ff38765ab のみ
- sg-09de3d205a615797e の名前・ルール詳細は別途確認要
- 各VPC EP に ENI が2つ（AZ-1a: 10.239.2.x / AZ-1c: 10.239.3.x）

---

## [3] Transfer Family セキュリティグループ確認

**コマンド:**
```bash
aws ec2 describe-security-groups --region ap-northeast-1 \
  --group-ids sg-06153ac3ff38765ab \
  --query 'SecurityGroups[0].{Name:GroupName,Inbound:IpPermissions,Outbound:IpPermissionsEgress}' \
  --output json
```

**受信内容:**
```json
{
    "Name": "ksm-posstg-vpc-sg-ep-tf",
    "Inbound": [
        {
            "IpProtocol": "tcp", "FromPort": 22, "ToPort": 22,
            "UserIdGroupPairs": [
                {
                    "Description": "test for bastion",
                    "UserId": "750735758916",
                    "GroupId": "sg-01f1bbc2ae66a6591"
                }
            ],
            "IpRanges": [
                { "Description": "For SFTP Inbound", "CidrIp": "10.156.96.192/26" }
            ]
        }
    ],
    "Outbound": [ { "IpProtocol": "-1", "CidrIp": "0.0.0.0/0" } ]
}
```

**確認結果:**

| ルール | 内容 | 評価 |
|---|---|---|
| TCP 22 ← 10.156.96.192/26 | USMH閉域網からのSFTP受信 | ✅ 正常（PRDと同じ） |
| TCP 22 ← sg-01f1bbc2ae66a6591（Bastion SG） | **Bastionからの接続を許可** | 🔴 **問題あり** |

**⚠️ PRDとの重大な差異:**
- STGのみ `"test for bastion"` という説明でBastionからTCP22が許可されている
- PRDにはこのルールが存在しない
- テスト目的で追加されたまま残存していると推測
- Bastionに侵入された場合、Transfer FamilyへSFTP接続が可能になる

---

---

## [4] Transfer Family VPCエンドポイント プライベートIP

**コマンド:**
```bash
for VPCE in vpce-003c773c1f3807562 vpce-0b7fe3eac68ea1d3b vpce-00ef51cdd11a09ae1; do
  aws ec2 describe-network-interfaces --region ap-northeast-1 \
    --filters "Name=description,Values=VPC Endpoint Interface $VPCE" \
    --query 'NetworkInterfaces[*].{AZ:AvailabilityZone,IP:PrivateIpAddress}' \
    --output table
done
```

**受信内容:**

| サーバー | VPCE ID | AZ-1a IP | AZ-1c IP |
|---|---|---|---|
| tf-server-**oc** | vpce-003c773c1f3807562 | 10.239.2.218 | 10.239.3.228 |
| tf-server-**sg** | vpce-0b7fe3eac68ea1d3b | 10.239.2.225 | 10.239.3.217 |
| tf-server-**sh** | vpce-00ef51cdd11a09ae1 | 10.239.2.147 | 10.239.3.253 |

---

## [5] S3バケット通知設定

**コマンド:**
```bash
aws s3api get-bucket-notification-configuration --bucket stg-ignica-ksm --output json
```

**受信内容:** `{ "EventBridgeConfiguration": {} }`

**確認結果:** PRDと同じくS3全イベントをEventBridgeに転送する設定。

---

## [6] EventBridgeルール一覧

**コマンド:**
```bash
aws events list-rules --region ap-northeast-1 \
  --query 'Rules[*].{Name:Name,State:State}' --output table
```

**受信内容（STG全ルール）:**

| ルール名 | 状態 | PRDとの差異 |
|---|---|---|
| eb-rule-receive-pos-master-**oc** | ENABLED | 同じ |
| eb-rule-receive-pos-master-**sg** | ENABLED | 同じ |
| eb-rule-receive-pos-master-**sg-9233** | **DISABLED** | **STGのみ** |
| eb-rule-receive-pos-master-**sh** | ENABLED | 同じ |
| eb-rule-receive-splited-pos-master-oc | ENABLED | 同じ |
| eb-rule-create-txt-file-sg | ENABLED | 同じ |
| eb-rule-create-txt-file-**sg-9233** | **DISABLED** | **STGのみ** |
| eb-rule-copy-backup-sg | ENABLED | 同じ |
| eb-rule-**night-export-sg** | **ENABLED** | **STGのみ** |
| eb-rule-**night-export-sg-9233** | **DISABLED** | **STGのみ** |
| eb-rule-check-price | **ENABLED** | **PRDはDISABLED** |
| eb-rule-itemmaster-import-monitoring | ENABLED | 同じ |
| eb-rule-p001-import-monitoring | ENABLED | 同じ |

**PRDとの重要な差異:**

| 差異 | STG | PRD | 考察 |
|---|---|---|---|
| `*-9233` 系ルール | 3本（全DISABLED） | 存在しない | 店舗コード9233向けテスト用ルール。STGで開発・テスト後にDISABLEDのまま残存 |
| `night-export-sg` | ENABLED | 存在しない | 夜間SG出力ルール。STG専用か、PRDに未展開か確認要 |
| `check-price` | **ENABLED** | DISABLED | ESL（電子棚札）価格チェック。STGでは有効、PRDでは停止中 |

**要確認:**
- `night-export-sg` のターゲット・パターンを確認（PRDへの展開予定があるか）
- `-9233` ルールは削除対象か

---

---

## [7] EventBridgeルール `night-export-sg` 詳細

**コマンド:**
```bash
aws events describe-rule --region ap-northeast-1 \
  --name ksm-posstg-eb-rule-night-export-sg --output json

aws events list-targets-by-rule --region ap-northeast-1 \
  --rule ksm-posstg-eb-rule-night-export-sg --output json
```

**受信内容:**
```json
{
  "ScheduleExpression": "cron(30 20 * * ? *)",   // JST 05:30 毎日
  "State": "ENABLED",
  "Target": {
    "Arn": "ksm-posstg-lmd-function-create-file-end-for-night",
    "InputTemplate": {
      "bucketName": "stg-ignica-ksm",
      "path": "pos-original/sg/csv/",
      "name": "SG_night_export_trigger_<timestamp>.ENDEXPORT"
    }
  }
}
```

**確認結果:**

| 項目 | 内容 |
|---|---|
| 実行時刻 | **毎日 JST 05:30**（cron(30 20 * * ? *)） |
| 起動Lambda | `ksm-posstg-lmd-function-create-file-end-for-night` |
| 動作 | S3に `pos-original/sg/csv/SG_night_export_trigger_<timestamp>.ENDEXPORT` を作成 |
| 連鎖トリガー | `.ENDEXPORT` → `eb-rule-create-txt-file-sg` → Step Functions: create-txt-file-sg |

**仕組み:**
```
毎日 JST 05:30
  → EventBridge(night-export-sg) cron起動
  → Lambda(create-file-end-for-night)
  → S3に .ENDEXPORT ファイルを作成
  → EventBridge(create-txt-file-sg) がS3イベントで起動
  → Step Functions(create-txt-file-sg) が実行
  → SGデータのTXTファイル生成 → USMH向けFTP送信
```

**考察:**
- 夜間バッチとしてSGマスターデータをUSMHに送信するための定時トリガー
- `.ENDEXPORT` ファイルを「疑似フラグ」として作ることでS3イベント駆動フローを起動
- ItemMasterの EventBridge(cron 05:30)と同じ時刻 → 同時実行の可能性あり
- PRDにも同名ルールが存在するため、本番でも同様に毎朝動いている

---

## チャット別索引

| 日時 | 内容 |
|---|---|
| 2026-03-09 AM | PRD/STG セキュリティ監査・ネットワーク構成図・VPN T2調査 |
| 2026-03-09 PM [1][2] | Transfer Family STG全サーバー詳細・S3マッピング確定 |

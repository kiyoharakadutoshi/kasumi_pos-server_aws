# cli-readonly リカバリー手順書

| 項目 | 内容 |
|------|------|
| 作成日 | 2026-03-13 |
| 作成者 | 清原 |
| 対象 | kasumi_pos-server AWS環境（DEV / STG / PRD） |
| 目的 | MFA無しでCLIからReadOnly調査を行うための環境復旧 |

---

## 前提条件

- 各AWSアカウントへのコンソールログインが可能であること
- IAMロール作成権限があること（管理者権限推奨）
- ローカルPCにAWS CLI v2がインストール済みであること
- ベースプロファイル（`kasumi-dev` 等）のアクセスキーが `~/.aws/credentials` に設定済みであること

## 環境情報

| 環境 | アカウントID | ベースプロファイル | ReadOnlyプロファイル |
|------|-------------|-------------------|---------------------|
| DEV  | 891376952870 | kasumi-dev | kasumi-dev-readonly |
| STG  | 750735758916 | kasumi-stg | kasumi-stg-readonly |
| PRD  | 332802448674 | kasumi-prd | kasumi-prd-readonly |

---

## 手順概要

```
Step 1: AWS側 — cli-readonly ロール作成（CloudShell）
Step 2: AWS側 — MFA_require ポリシー確認・修正（コンソール）
Step 3: ローカル — CLIプロファイル設定
Step 4: 接続テスト
```

---

## Step 1: cli-readonly ロール作成（各アカウントで実行）

### 1-1. スクリプトで自動作成する場合

1. 対象アカウントのAWSコンソールにログイン
2. CloudShell を開く（右上の `>_` アイコン）
3. `setup-cli-readonly-role.sh` の内容を貼り付けて実行

```bash
# CloudShell上で実行
bash setup-cli-readonly-role.sh
```

スクリプトが行うこと:
- `cli-readonly` ロールの作成（既存なら SKIP）
- 信頼ポリシー: 同アカウントからの AssumeRole を許可（MFA不要）
- `ReadOnlyAccess` マネージドポリシーのアタッチ
- `MFA_require` ポリシーの確認（修正は手動案内のみ）

### 1-2. 手動で作成する場合

1. IAM コンソール → ロール → 「ロールを作成」
2. **信頼されたエンティティ**: AWS アカウント → 「このアカウント」を選択
3. **MFA**: 「MFA は不要」のままにする（チェックしない）
4. **許可ポリシー**: `ReadOnlyAccess` を検索して選択
5. **ロール名**: `cli-readonly`
6. 「ロールを作成」をクリック

信頼ポリシー（自動設定される）:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::<アカウントID>:root"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

---

## Step 2: MFA_require ポリシー修正

> **重要**: この手順を省略すると、MFA_require ポリシーが sts:AssumeRole をブロックし、ロールの引き受けに失敗します。

1. IAM コンソール → ポリシー → `MFA_require` を検索して開く
2. 「編集」→「JSON」タブ
3. `NotAction` 配列に `"sts:AssumeRole"` が含まれているか確認
4. 含まれていなければ追加:

```json
"NotAction": [
    "iam:CreateVirtualMFADevice",
    "iam:EnableMFADevice",
    "iam:ListMFADevices",
    "iam:ResyncMFADevice",
    "sts:GetSessionToken",
    "sts:AssumeRole"
]
```

5. 「変更を保存」

> **注意**: `MFA_require` ポリシーが存在しない環境では、この手順は不要です。

---

## Step 3: ローカルCLIプロファイル設定

### 3-1. スクリプトで自動設定する場合

```bash
# ローカルPC（Git Bash / WSL / Mac Terminal）で実行
bash setup-local-profiles.sh
```

### 3-2. 手動で設定する場合

`~/.aws/config` に以下を追記（環境ごと）:

```ini
[profile kasumi-dev-readonly]
role_arn = arn:aws:iam::891376952870:role/cli-readonly
source_profile = kasumi-dev
region = ap-northeast-1
output = json

[profile kasumi-stg-readonly]
role_arn = arn:aws:iam::750735758916:role/cli-readonly
source_profile = kasumi-stg
region = ap-northeast-1
output = json

[profile kasumi-prd-readonly]
role_arn = arn:aws:iam::332802448674:role/cli-readonly
source_profile = kasumi-prd
region = ap-northeast-1
output = json
```

前提: `~/.aws/credentials` に各ベースプロファイルのアクセスキーが設定済みであること:

```ini
[kasumi-dev]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

[kasumi-stg]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

[kasumi-prd]
aws_access_key_id = AKIA...
aws_secret_access_key = ...
```

---

## Step 4: 接続テスト

```bash
# Windows（aws.exe のフルパス指定が必要な場合）
AWS="C:/Program Files/Amazon/AWSCLIV2/aws.exe"

# DEV
"$AWS" sts get-caller-identity --profile kasumi-dev-readonly

# STG
"$AWS" sts get-caller-identity --profile kasumi-stg-readonly

# PRD
"$AWS" sts get-caller-identity --profile kasumi-prd-readonly
```

成功時の出力例:
```json
{
    "UserId": "AROA...:botocore-session-...",
    "Account": "891376952870",
    "Arn": "arn:aws:sts::891376952870:assumed-role/cli-readonly/botocore-session-..."
}
```

---

## トラブルシューティング

### エラー: "is not authorized to perform sts:AssumeRole"

**原因**: 以下のいずれか
1. `cli-readonly` ロールが対象アカウントに存在しない → Step 1 を実行
2. `MFA_require` ポリシーが `sts:AssumeRole` をブロックしている → Step 2 を実行
3. ベースプロファイルのアクセスキーが無効 → `~/.aws/credentials` を確認

**切り分け方法**:
- エラーメッセージに `"with an explicit deny in an identity-based policy"` が含まれる場合 → MFA_require が原因（Step 2）
- 含まれない場合 → ロール未作成の可能性が高い（Step 1）

### エラー: "The config profile (xxx-readonly) could not be found"

**原因**: `~/.aws/config` にプロファイルが未設定
**対処**: Step 3 を実行

### エラー: "The security token included in the request is invalid"

**原因**: ベースプロファイルのアクセスキーが無効または期限切れ
**対処**: `aws configure --profile kasumi-dev` 等でアクセスキーを再設定

---

## 関連ファイル

| ファイル | 用途 |
|----------|------|
| `setup-cli-readonly-role.sh` | CloudShell用ロール作成スクリプト |
| `setup-local-profiles.sh` | ローカルCLIプロファイル設定スクリプト |
| `~/.aws/config` | AWS CLIプロファイル設定 |
| `~/.aws/credentials` | AWS CLIアクセスキー |

---

## DEV環境での実績（参考）

- 2026-03-13: cli-readonly ロール作成（IAMコンソールから手動）
- 2026-03-13: MFA_require に sts:AssumeRole を NotAction 追加
- 2026-03-13: kasumi-dev-readonly プロファイル設定・接続確認完了
- 調査結果: `40_AWS/07_ログ/` 配下のログファイル参照

#!/bin/bash
#####################################################################
# ローカルAWS CLIプロファイル設定スクリプト
#
# 用途: kasumi-{env}-readonly プロファイルを ~/.aws/config に追加する
# 実行場所: ローカルPC（Git Bash / WSL / Mac Terminal）
# 前提:
#   - 各環境のベースプロファイル（kasumi-dev等）が credentials に設定済み
#   - 対象アカウントに cli-readonly ロールが作成済み
#
# 使い方:
#   bash setup-local-profiles.sh
#
# 作成日: 2026-03-13
# 作成者: 清原
#####################################################################

set -euo pipefail

AWS_CONFIG="$HOME/.aws/config"
AWS="C:/Program Files/Amazon/AWSCLIV2/aws.exe"

# 環境定義
declare -A ACCOUNTS
ACCOUNTS[kasumi-dev]="891376952870"
ACCOUNTS[kasumi-stg]="750735758916"
ACCOUNTS[kasumi-prd]="332802448674"

echo "=== AWS CLI readonly プロファイル設定 ==="
echo "設定ファイル: $AWS_CONFIG"
echo ""

for BASE_PROFILE in kasumi-dev kasumi-stg kasumi-prd; do
    READONLY_PROFILE="${BASE_PROFILE}-readonly"
    ACCOUNT_ID="${ACCOUNTS[$BASE_PROFILE]}"
    ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/cli-readonly"

    echo "--- $READONLY_PROFILE ---"

    # 既に設定済みか確認
    if grep -q "\[profile ${READONLY_PROFILE}\]" "$AWS_CONFIG" 2>/dev/null; then
        echo "  [SKIP] 既に設定済み"
    else
        # ベースプロファイルが credentials に存在するか確認
        if grep -q "\[${BASE_PROFILE}\]" "$HOME/.aws/credentials" 2>/dev/null; then
            cat >> "$AWS_CONFIG" <<EOF

[profile ${READONLY_PROFILE}]
role_arn = ${ROLE_ARN}
source_profile = ${BASE_PROFILE}
region = ap-northeast-1
output = json
EOF
            echo "  [OK] プロファイル追加完了"
        else
            echo "  [WARN] ベースプロファイル '${BASE_PROFILE}' が credentials に未設定。スキップ。"
            echo "         先に 'aws configure --profile ${BASE_PROFILE}' でアクセスキーを設定してください。"
        fi
    fi
done

echo ""
echo "=== 接続テスト ==="
for BASE_PROFILE in kasumi-dev kasumi-stg kasumi-prd; do
    READONLY_PROFILE="${BASE_PROFILE}-readonly"
    echo -n "  $READONLY_PROFILE: "

    if grep -q "\[profile ${READONLY_PROFILE}\]" "$AWS_CONFIG" 2>/dev/null; then
        RESULT=$("$AWS" sts get-caller-identity --profile "$READONLY_PROFILE" 2>&1) || true
        if echo "$RESULT" | grep -q "assumed-role"; then
            ACCOUNT=$(echo "$RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin)['Account'])" 2>/dev/null || echo "?")
            echo "OK (Account: $ACCOUNT)"
        else
            echo "FAILED - ロール未作成またはMFA_require未修正の可能性"
        fi
    else
        echo "SKIP (プロファイル未設定)"
    fi
done

echo ""
echo "=== 完了 ==="

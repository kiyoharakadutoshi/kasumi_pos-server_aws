#!/bin/bash
#####################################################################
# cli-readonly ロール作成スクリプト（CloudShell用）
#
# 用途: AWS CLIからMFA無しでReadOnly調査を行うためのIAMロールを作成する
# 実行場所: 対象AWSアカウントの CloudShell
# 前提: 実行者がIAMロール作成権限を持っていること
#
# 使い方:
#   1. 対象アカウントのAWSコンソールにログイン
#   2. CloudShellを開く
#   3. このスクリプトを貼り付けて実行
#
# 作成日: 2026-03-13
# 作成者: 清原
#####################################################################

set -euo pipefail

ROLE_NAME="cli-readonly"
POLICY_ARN="arn:aws:iam::aws:policy/ReadOnlyAccess"
MFA_POLICY_NAME="MFA_require"

# 現在のアカウントID取得
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "=== 対象アカウント: $ACCOUNT_ID ==="

# --- Step 1: cli-readonly ロールの存在確認 ---
echo ""
echo "--- Step 1: cli-readonly ロール確認 ---"
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
    echo "[OK] ロール '$ROLE_NAME' は既に存在します。スキップ。"
else
    echo "[INFO] ロール '$ROLE_NAME' を作成します..."

    # 信頼ポリシー: このアカウントからのAssumeRoleを許可（MFA不要）
    TRUST_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${ACCOUNT_ID}:root"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
)

    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document "$TRUST_POLICY" \
        --description "CLI readonly access without MFA (for Claude Code / local investigation)" \
        --output json

    # ReadOnlyAccess ポリシーをアタッチ
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn "$POLICY_ARN"

    echo "[OK] ロール '$ROLE_NAME' を作成し、ReadOnlyAccess をアタッチしました。"
fi

# --- Step 2: MFA_require ポリシーの確認・修正 ---
echo ""
echo "--- Step 2: MFA_require ポリシー確認 ---"

# MFA_require ポリシーのARN取得
MFA_POLICY_ARN=$(aws iam list-policies \
    --query "Policies[?PolicyName=='${MFA_POLICY_NAME}'].Arn | [0]" \
    --output text 2>/dev/null || echo "None")

if [ "$MFA_POLICY_ARN" = "None" ] || [ -z "$MFA_POLICY_ARN" ]; then
    echo "[WARN] MFA_require ポリシーが見つかりません。MFA制約がない環境かもしれません。"
    echo "       sts:AssumeRole のNotAction追加は不要です。"
else
    echo "[INFO] MFA_require ポリシー: $MFA_POLICY_ARN"

    # 現在のバージョン取得
    VERSION_ID=$(aws iam get-policy --policy-arn "$MFA_POLICY_ARN" \
        --query 'Policy.DefaultVersionId' --output text)

    # 現在のポリシー内容取得
    CURRENT_POLICY=$(aws iam get-policy-version \
        --policy-arn "$MFA_POLICY_ARN" \
        --version-id "$VERSION_ID" \
        --query 'PolicyVersion.Document' --output json)

    # sts:AssumeRole が NotAction に含まれているか確認
    if echo "$CURRENT_POLICY" | python3 -c "
import json, sys
doc = json.load(sys.stdin)
for stmt in doc.get('Statement', []):
    not_action = stmt.get('NotAction', [])
    if isinstance(not_action, str):
        not_action = [not_action]
    if 'sts:AssumeRole' in not_action:
        print('FOUND')
        sys.exit(0)
print('NOT_FOUND')
" | grep -q "FOUND"; then
        echo "[OK] sts:AssumeRole は既に NotAction に含まれています。修正不要。"
    else
        echo ""
        echo "[WARN] sts:AssumeRole が MFA_require の NotAction に含まれていません。"
        echo ""
        echo "以下の手順で手動修正してください:"
        echo "  1. IAM > ポリシー > MFA_require を開く"
        echo "  2. 「編集」をクリック"
        echo "  3. 「JSON」タブを開く"
        echo "  4. NotAction 配列に \"sts:AssumeRole\" を追加"
        echo "  5. 保存"
        echo ""
        echo "現在のNotAction:"
        echo "$CURRENT_POLICY" | python3 -c "
import json, sys
doc = json.load(sys.stdin)
for stmt in doc.get('Statement', []):
    na = stmt.get('NotAction', [])
    if na:
        if isinstance(na, str):
            na = [na]
        for a in na:
            print(f'  - {a}')
"
        echo ""
        echo "※ このスクリプトではMFA_requireポリシーの自動修正は行いません（安全のため）。"
        echo "   手動でコンソールから修正してください。"
    fi
fi

# --- Step 3: 結果サマリー ---
echo ""
echo "=========================================="
echo " セットアップ結果サマリー"
echo "=========================================="
echo " アカウントID:  $ACCOUNT_ID"
echo " ロール名:      $ROLE_NAME"
echo " ロールARN:     arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo " ポリシー:      ReadOnlyAccess"
echo ""
echo " ローカルCLI設定（~/.aws/config に追記）:"
echo ""
echo "   [profile <環境名>-readonly]"
echo "   role_arn = arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo "   source_profile = <環境名のベースプロファイル>"
echo "   region = ap-northeast-1"
echo "   output = json"
echo ""
echo " テストコマンド:"
echo "   aws sts get-caller-identity --profile <環境名>-readonly"
echo "=========================================="

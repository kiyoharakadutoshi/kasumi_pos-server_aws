#!/bin/bash
# ============================================================
# カスミPOS AWS 月次コスト妥当性チェック
# 実行環境: AWS CloudShell (ap-northeast-1)
# 実行タイミング: 毎月末（翌月1〜3日推奨 ※Cost Explorerの反映遅延のため）
# ============================================================

REGION="ap-northeast-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# 対象月を自動算出（前月）
YEAR=$(date -d "$(date +%Y-%m-01) -1 day" +%Y)
MONTH=$(date -d "$(date +%Y-%m-01) -1 day" +%m)
START="${YEAR}-${MONTH}-01"
END=$(date -d "${YEAR}-${MONTH}-01 +1 month" +%Y-%m-01)

echo "============================================================"
echo "  カスミPOS AWS 月次コストチェック"
echo "  対象期間: ${START} 〜 ${END}"
echo "  実行日時: $(date '+%Y-%m-%d %H:%M:%S JST')"
echo "  アカウント: ${ACCOUNT_ID}"
echo "============================================================"

# ============================================================
# 1. 合計コスト（前月）
# ============================================================
echo ""
echo "【1】月間合計コスト（前月）"
echo "------------------------------------------------------------"
aws ce get-cost-and-usage \
  --time-period Start=${START},End=${END} \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --query 'ResultsByTime[0].Total.UnblendedCost.{Amount:Amount,Unit:Unit}' \
  --output table

# ============================================================
# 2. サービス別コスト（上位10件）
# ============================================================
echo ""
echo "【2】サービス別コスト（上位10件）"
echo "------------------------------------------------------------"
aws ce get-cost-and-usage \
  --time-period Start=${START},End=${END} \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE \
  --query 'ResultsByTime[0].Groups[?Metrics.UnblendedCost.Amount>`0.01`].[Keys[0],Metrics.UnblendedCost.Amount,Metrics.UnblendedCost.Unit]' \
  --output text | sort -k2 -rn | head -10 | \
  awk '{printf "  %-45s $%8.2f %s\n", $1, $2, $3}'

# ============================================================
# 3. RDS コスト詳細
# ============================================================
echo ""
echo "【3】RDS コスト詳細"
echo "------------------------------------------------------------"
aws ce get-cost-and-usage \
  --time-period Start=${START},End=${END} \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --filter '{"Dimensions":{"Key":"SERVICE","Values":["Amazon Relational Database Service"]}}' \
  --group-by Type=DIMENSION,Key=USAGE_TYPE \
  --query 'ResultsByTime[0].Groups[?Metrics.UnblendedCost.Amount>`0.01`].[Keys[0],Metrics.UnblendedCost.Amount]' \
  --output text | sort -k2 -rn | \
  awk '{printf "  %-55s $%8.2f\n", $1, $2}'

# ============================================================
# 4. RDS インスタンス稼働状況（CPU・接続数）
# ============================================================
echo ""
echo "【4】RDS CPU使用率（前月平均）"
echo "------------------------------------------------------------"
for INSTANCE_ID in "instance-1" "instance-2"; do
  AVG_CPU=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/RDS \
    --metric-name CPUUtilization \
    --dimensions Name=DBInstanceIdentifier,Value=ksm-posprd-db-${INSTANCE_ID} \
    --start-time "${START}T00:00:00Z" \
    --end-time "${END}T00:00:00Z" \
    --period 2592000 \
    --statistics Average \
    --query 'Datapoints[0].Average' \
    --output text 2>/dev/null)
  MAX_CPU=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/RDS \
    --metric-name CPUUtilization \
    --dimensions Name=DBInstanceIdentifier,Value=ksm-posprd-db-${INSTANCE_ID} \
    --start-time "${START}T00:00:00Z" \
    --end-time "${END}T00:00:00Z" \
    --period 2592000 \
    --statistics Maximum \
    --query 'Datapoints[0].Maximum' \
    --output text 2>/dev/null)
  printf "  ksm-posprd-db-%-12s  平均CPU: %6s%%  最大CPU: %6s%%\n" \
    "${INSTANCE_ID}" "${AVG_CPU:-N/A}" "${MAX_CPU:-N/A}"
done

echo ""
echo "【5】RDS データベース接続数（前月最大）"
echo "------------------------------------------------------------"
for INSTANCE_ID in "instance-1" "instance-2"; do
  MAX_CONN=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/RDS \
    --metric-name DatabaseConnections \
    --dimensions Name=DBInstanceIdentifier,Value=ksm-posprd-db-${INSTANCE_ID} \
    --start-time "${START}T00:00:00Z" \
    --end-time "${END}T00:00:00Z" \
    --period 2592000 \
    --statistics Maximum \
    --query 'Datapoints[0].Maximum' \
    --output text 2>/dev/null)
  printf "  ksm-posprd-db-%-12s  最大接続数: %s\n" \
    "${INSTANCE_ID}" "${MAX_CONN:-N/A}"
done

# ============================================================
# 6. Lambda 実行回数・エラー率（コスト影響確認）
# ============================================================
echo ""
echo "【6】Lambda 実行回数・エラー数（前月合計）"
echo "------------------------------------------------------------"
LAMBDA_FUNCTIONS=(
  "ksm-posprd-lmd-function-sg-import-data"
  "ksm-posprd-lmd-function-oc-import-data"
  "ksm-posprd-lmd-import-pos-master-sh"
  "ksm-posprd-lmd-function-split-csv"
  "ksm-posprd-lmd-function-p001-import-monitoring"
  "ksm-posprd-lmd-function-itemmaster-import-monitoring"
  "ksm-posprd-lmd-function-get-sync-store"
  "ksm-posprd-lmd-function-create-file-end-for-night"
)
for FUNC in "${LAMBDA_FUNCTIONS[@]}"; do
  INVOCATIONS=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --dimensions Name=FunctionName,Value=${FUNC} \
    --start-time "${START}T00:00:00Z" \
    --end-time "${END}T00:00:00Z" \
    --period 2592000 \
    --statistics Sum \
    --query 'Datapoints[0].Sum' \
    --output text 2>/dev/null)
  ERRORS=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Errors \
    --dimensions Name=FunctionName,Value=${FUNC} \
    --start-time "${START}T00:00:00Z" \
    --end-time "${END}T00:00:00Z" \
    --period 2592000 \
    --statistics Sum \
    --query 'Datapoints[0].Sum' \
    --output text 2>/dev/null)
  SHORT_NAME="${FUNC#ksm-posprd-}"
  printf "  %-48s  実行: %6s回  エラー: %s回\n" \
    "${SHORT_NAME}" "${INVOCATIONS:-0}" "${ERRORS:-0}"
done

# ============================================================
# 7. S3 ストレージ使用量
# ============================================================
echo ""
echo "【7】S3 バケット別ストレージ使用量（前月末時点）"
echo "------------------------------------------------------------"
S3_BUCKETS=(
  "prd-ignica-ksm"
  "prd-ignica-ksm-master-backup"
  "prd-ignica-ksm-pmlogs"
  "prd-ignica-com-lmd-jar"
  "prd-aeon-gift-card"
)
for BUCKET in "${S3_BUCKETS[@]}"; do
  SIZE=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/S3 \
    --metric-name BucketSizeBytes \
    --dimensions Name=BucketName,Value=${BUCKET} Name=StorageType,Value=StandardStorage \
    --start-time "${START}T00:00:00Z" \
    --end-time "${END}T00:00:00Z" \
    --period 86400 \
    --statistics Maximum \
    --query 'sort_by(Datapoints,&Timestamp)[-1].Maximum' \
    --output text 2>/dev/null)
  if [ "${SIZE}" != "None" ] && [ -n "${SIZE}" ]; then
    SIZE_GB=$(echo "${SIZE}" | awk '{printf "%.2f", $1/1073741824}')
    printf "  %-38s  %s GB\n" "${BUCKET}" "${SIZE_GB}"
  else
    printf "  %-38s  データなし\n" "${BUCKET}"
  fi
done

# ============================================================
# 8. EC2 / NAT Gateway コスト
# ============================================================
echo ""
echo "【8】EC2・ネットワーク コスト詳細"
echo "------------------------------------------------------------"
aws ce get-cost-and-usage \
  --time-period Start=${START},End=${END} \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --filter '{"Dimensions":{"Key":"SERVICE","Values":["Amazon Elastic Compute Cloud - Compute","Amazon Virtual Private Cloud"]}}' \
  --group-by Type=DIMENSION,Key=SERVICE \
  --query 'ResultsByTime[0].Groups[].[Keys[0],Metrics.UnblendedCost.Amount]' \
  --output text | \
  awk '{printf "  %-50s $%8.2f\n", $1, $2}'

# ============================================================
# 9. 前月比較（先々月との比較）
# ============================================================
echo ""
echo "【9】前月比（先々月との比較）"
echo "------------------------------------------------------------"
PREV_START=$(date -d "${START} -1 month" +%Y-%m-01)
PREV_END=${START}

CURRENT_COST=$(aws ce get-cost-and-usage \
  --time-period Start=${START},End=${END} \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --query 'ResultsByTime[0].Total.UnblendedCost.Amount' \
  --output text)

PREV_COST=$(aws ce get-cost-and-usage \
  --time-period Start=${PREV_START},End=${PREV_END} \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --query 'ResultsByTime[0].Total.UnblendedCost.Amount' \
  --output text)

echo "  先々月 (${PREV_START}〜${PREV_END}): \$${PREV_COST}"
echo "  前月   (${START}〜${END}):           \$${CURRENT_COST}"
if [ -n "${PREV_COST}" ] && [ -n "${CURRENT_COST}" ]; then
  DIFF=$(echo "${CURRENT_COST} ${PREV_COST}" | awk '{diff=$1-$2; pct=($2>0)?diff/$2*100:0; printf "%+.2f (%+.1f%%)", diff, pct}')
  echo "  差分: \$${DIFF}"
fi

# ============================================================
# 10. 異常検知チェック（閾値超過アラート）
# ============================================================
echo ""
echo "【10】異常検知チェック"
echo "------------------------------------------------------------"
# 月間コスト閾値: $2,500（通常 $2,200 前後）
THRESHOLD=2500
if [ -n "${CURRENT_COST}" ]; then
  CHECK=$(echo "${CURRENT_COST} ${THRESHOLD}" | awk '{if($1>$2) print "WARNING"; else print "OK"}')
  echo "  月間コスト閾値チェック (\$${THRESHOLD}): ${CHECK} (\$${CURRENT_COST})"
fi

# RDS CPU 閾値: 50%超は要注意（通常 <5%）
echo "  ※ CPU使用率が50%超の場合はインスタンスタイプ見直しを検討"
echo "  ※ 月次コストが先月比+10%超の場合は原因調査を実施"

echo ""
echo "============================================================"
echo "  チェック完了: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  結果をコピーして 40_AWS/06_コスト調査/ に保存してください"
echo "============================================================"

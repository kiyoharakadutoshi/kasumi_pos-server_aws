# 修正依頼：create-file-end-for-night DB接続先変更

**作成日**: 2026-03-08  
**作成者**: LUVINA  
**優先度**: 中  
**対象環境**: 本番（prd）

---

## 1. 概要

Lambda関数 `ksm-posprd-lmd-function-create-file-end-for-night` のDB接続先を  
WriterエンドポイントからReaderエンドポイントに変更する。

---

## 2. 変更理由

### 調査結果

CloudWatchログ（2026-03-07実行分）より、本関数の処理内容を確認した。

```
✅ Connected to DB!
Parent directory: /tmp/0343
fileEnd: /tmp/0343/SG_night_export_trigger_2026-03-07T20:30:00Z.ENDEXPORT
✅ Uploaded: pos-original/sg/csv/0343/SG_night_export_trigger_2026-03-07T20:30:00Z.ENDEXPORT
...（全店舗分繰り返し）
```

**処理フロー**:
1. DBに接続して **店舗コード一覧をSELECT**（読み取りのみ）
2. 店舗ごとにENDファイル（`SG_night_export_trigger_*.ENDEXPORT`）を生成
3. S3バケット `prd-ignica-ksm` の `pos-original/sg/csv/{店舗コード}/` にアップロード

**DB操作**: SELECT のみ（INSERT/UPDATE/DELETE なし）

### 問題点

| 項目 | 現状 | 理想 |
|---|---|---|
| 環境変数 `DB_KASUMI` | `prd/Replica_Kasumi` | `prd/Replica_Kasumi_RO` |
| 接続エンドポイント | Writeエンドポイント | Readerエンドポイント |
| DB操作 | SELECT のみ | SELECT のみ |

読み取り専用の処理がWriterエンドポイントに接続しており、  
Auroraの読み書き分離の設計に反している。

---

## 3. 変更内容

### Lambda環境変数の変更

| 関数名 | 変数名 | 変更前 | 変更後 |
|---|---|---|---|
| `ksm-posprd-lmd-function-create-file-end-for-night` | `DB_KASUMI` | `prd/Replica_Kasumi` | `prd/Replica_Kasumi_RO` |

> **注意**: `DB_BATCH`（`prd/Batch_Kasumi`）は変更不要。  
> バッチ履歴の書き込みがある可能性があるため、Writerエンドポイントのまま維持する。

---

## 4. 変更手順

### 手順1：変更前の確認

```bash
REGION="ap-northeast-1"

# 現在の環境変数を確認
aws --no-cli-pager lambda get-function-configuration \
  --region $REGION \
  --function-name ksm-posprd-lmd-function-create-file-end-for-night \
  --query 'Environment.Variables' --output table
```

期待値:
```
DB_BATCH = prd/Batch_Kasumi
DB_KASUMI = prd/Replica_Kasumi   ← これを変更する
```

### 手順2：環境変数の変更

```bash
REGION="ap-northeast-1"

aws --no-cli-pager lambda update-function-configuration \
  --region $REGION \
  --function-name ksm-posprd-lmd-function-create-file-end-for-night \
  --environment "Variables={DB_KASUMI=prd/Replica_Kasumi_RO,DB_BATCH=prd/Batch_Kasumi}"
```

### 手順3：変更後の確認

```bash
# 変更が反映されたことを確認
aws --no-cli-pager lambda get-function-configuration \
  --region $REGION \
  --function-name ksm-posprd-lmd-function-create-file-end-for-night \
  --query 'Environment.Variables' --output table
```

期待値:
```
DB_BATCH = prd/Batch_Kasumi
DB_KASUMI = prd/Replica_Kasumi_RO   ← 変更済み
```

---

## 5. 実施タイミング

| 項目 | 内容 |
|---|---|
| 推奨時間帯 | 平日昼間（本関数はJST 05:30頃に実行されるため） |
| 実行スケジュール | EventBridge: `cron(30 20 * * ? *)` = JST 05:30 毎日 |
| 影響範囲 | 本関数のみ。他Lambda・アプリへの影響なし |
| ロールバック | 変更前の値（`prd/Replica_Kasumi`）に戻すだけで即時復旧可能 |

---

## 6. 変更後の効果

```
変更前:
  create-file-end-for-night → prd/Replica_Kasumi → Writer → instance-1

変更後:
  create-file-end-for-night → prd/Replica_Kasumi_RO → Reader → instance-2
```

### Writer/Reader 分離の完成形

| Lambda関数 | 操作 | 接続先 | 評価 |
|---|---|---|---|
| sg-import-data | WRITE | Writer | ✅ |
| oc-import-data | WRITE | Writer | ✅ |
| import-pos-master-sh | WRITE | Writer | ✅ |
| create-file-end-for-night | READ | Reader（変更後） | ✅ |
| split-csv | READ | Reader | ✅ |
| p001-import-monitoring | READ | Reader | ✅ |
| itemmaster-import-monitoring | READ | Reader | ✅ |
| get-sync-store | READ | Reader | ✅ |

この変更により、全8Lambda関数でWriter/Readerの使い分けが適切に設計された状態になる。

---

## 7. 関連資料

- `40_AWS/06_コスト調査/20260308_LambdaDB接続調査結果.md`
- `40_AWS/06_コスト調査/20260308_Reader接続調査結果.md`

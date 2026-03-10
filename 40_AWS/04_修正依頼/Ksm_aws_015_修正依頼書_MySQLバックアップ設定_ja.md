# MySQL バックアップ設定 修正依頼書

| 項目 | 内容 |
|---|---|
| **依頼番号** | 20260308-001 |
| **依頼日** | 2026-03-08 |
| **対象システム** | カスミPOS 本番環境 |
| **対象サービス** | Amazon RDS Aurora MySQL 8.0 |
| **対象クラスター** | `ksm-posprd-db-cluster` |
| **優先度** | 高 |
| **担当** | インフラ担当 |

---

## 1. 修正背景・目的

現在のバックアップ設定では **保持期間が1日のみ** であり、障害発生時に前日分のスナップショットしか復元できないリスクがある。

以下の設定に変更し、障害時の復元範囲を拡大する。

---

## 2. 現状設定

| 設定項目 | 現状値 |
|---|---|
| **自動バックアップ保持期間** | 1日 |
| **バックアップ取得頻度** | Aurora自動バックアップ（1日1回、15:00-15:30 UTC） |
| **時間単位バックアップ** | なし |
| **AWS Backup** | 未設定 |
| **長期スナップショット保持** | なし |

---

## 3. 修正後の設定（要件）

### 3-1. 時間単位バックアップ（AWS Backup）

| 設定項目 | 設定値 |
|---|---|
| **バックアップ頻度** | **1時間ごと** |
| **保持期間** | **25時間**（24時間経過分は削除、ただし午前0時分は除く） |
| **対象** | `ksm-posprd-db-cluster` |
| **バックアップウィンドウ** | 毎時0分 開始 |

> 例: 10:00, 11:00, 12:00 … と毎時取得。25時間後に自動削除。  
> ただし、毎日 **JST 00:00（UTC 15:00）** のバックアップのみ削除対象外。

---

### 3-2. 日次バックアップ（午前0時分の長期保持）

| 設定項目 | 設定値 |
|---|---|
| **保持対象** | **毎日 JST 00:00（UTC 15:00）** のバックアップ |
| **保持期間** | **7日間** |
| **対象** | `ksm-posprd-db-cluster` |

---

### 3-3. 設定後のバックアップ体系まとめ

```
【毎時バックアップ】─────────────────────────────
  取得: 毎時0分（JST）
  保持: 25時間
  削除: 25時間経過後に自動削除
        ※ ただし JST 00:00 分は削除しない

【日次バックアップ（JST 00:00）】─────────────────
  取得: 毎日 00:00（JST） = 前日 15:00（UTC）
  保持: 7日間
  削除: 7日経過後に自動削除

【復元可能範囲のイメージ（当日 15:00 時点）】
  過去7日分の 00:00 スナップショット（日次）
  直近25時間の毎時スナップショット
  ↓ 組み合わせにより、直近7日間の任意の時刻に近い状態へ復元可能
```

---

## 4. 実装方法

### 方法A: AWS Backup を使用する（推奨）

AWS Backup のバックアッププランを2本作成する。

#### プラン①: 毎時バックアップ（25時間保持）

```json
{
  "BackupPlanName": "ksm-posprd-rds-hourly",
  "Rules": [
    {
      "RuleName": "hourly-25h",
      "TargetBackupVaultName": "ksm-posprd-backup-vault",
      "ScheduleExpression": "cron(0 * * * ? *)",
      "StartWindowMinutes": 60,
      "CompletionWindowMinutes": 180,
      "Lifecycle": {
        "DeleteAfterDays": 2
      }
    }
  ]
}
```

> `DeleteAfterDays: 2` = 48時間保持（余裕を持たせた設定）。  
> 厳密な25時間削除はLifecycleの最小単位が1日のため、実用上は2日保持が最小設定となる。

#### プラン②: 日次バックアップ（7日保持）

```json
{
  "BackupPlanName": "ksm-posprd-rds-daily",
  "Rules": [
    {
      "RuleName": "daily-7d",
      "TargetBackupVaultName": "ksm-posprd-backup-vault",
      "ScheduleExpression": "cron(0 15 * * ? *)",
      "StartWindowMinutes": 60,
      "CompletionWindowMinutes": 180,
      "Lifecycle": {
        "DeleteAfterDays": 7
      }
    }
  ]
}
```

> `cron(0 15 * * ? *)` = UTC 15:00 = JST 00:00 毎日実行

#### バックアップボールト作成

```bash
aws backup create-backup-vault \
  --region ap-northeast-1 \
  --backup-vault-name ksm-posprd-backup-vault \
  --encryption-key-arn arn:aws:kms:ap-northeast-1:332802448674:key/f63b92c0-a810-4665-a45e-ffb926b21496 \
  --tags SystemName=pos,EnvType=prd
```

#### 対象リソース指定（両プラン共通）

```json
{
  "SelectionName": "ksm-posprd-rds-selection",
  "IamRoleArn": "arn:aws:iam::332802448674:role/AWSBackupDefaultServiceRole",
  "Resources": [
    "arn:aws:rds:ap-northeast-1:332802448674:cluster:ksm-posprd-db-cluster"
  ]
}
```

---

### 方法B: RDS 自動バックアップ保持期間の変更（簡易版）

AWS Backup が利用できない場合の代替案。

```bash
aws rds modify-db-cluster \
  --region ap-northeast-1 \
  --db-cluster-identifier ksm-posprd-db-cluster \
  --backup-retention-period 7 \
  --apply-immediately
```

> ⚠️ この方法では毎時バックアップは実現できない。  
> 日次自動バックアップの保持を1日→7日に延長するのみ。

---

## 5. 影響範囲

| 項目 | 影響 |
|---|---|
| **アプリケーション** | なし（バックアップはオフラインで実行） |
| **DB接続** | なし（パフォーマンスへの軽微な影響はありうる） |
| **コスト増加（概算）** | 毎時バックアップ約 +$20〜$30/月（6GBのスナップショット×時間数） |
| **メンテナンス停止** | 不要 |

---

## 6. 作業手順

1. **事前確認**: 現在のバックアップ状況を確認  
   ```bash
   ./40_AWS/03_リカバリー/01_recover_rds.sh check-backup
   ```

2. **バックアップボールト作成**（方法Aの場合）

3. **バックアッププラン①（毎時）を作成**

4. **バックアッププラン②（日次）を作成**

5. **動作確認**: 翌日以降にスナップショットが取得されていることを確認

6. **設計書更新**: `40_AWS/02_設定/01_RDS_Aurora.md` のバックアップ設定セクションを更新

---

## 7. 承認

| 役割 | 担当者 | 承認日 |
|---|---|---|
| 申請者 | | |
| 承認者 | | |
| 実施者 | | |
| 完了確認 | | |

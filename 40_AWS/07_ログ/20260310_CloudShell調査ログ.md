# CloudShell調査ログ 2026-03-10

| 項目 | 内容 |
|---|---|
| 調査日 | 2026-03-10 |
| 調査者 | 清原 |
| PRDアカウント | 332802448674 |
| STGアカウント | 750735758916 |
| リージョン | ap-northeast-1 |

---

## [1] S3バケット用途調査・不要バケット削除（PRD）

### 発端
S3バケット一覧に `phongbt-auditor-production` という個人名バケットが存在していたため、用途・作成経緯を調査。

---

### [1]-1 バケット内容・ポリシー確認

**コマンド:**
```bash
aws s3 ls s3://phongbt-auditor-production/ --recursive --summarize | tail -3
aws s3api get-bucket-policy --bucket phongbt-auditor-production
aws s3api get-bucket-tagging --bucket phongbt-auditor-production
```

**受信内容:**
```
Total Objects: 0
   Total Size: 0

Policy: AWSCloudTrailAclCheck / AWSCloudTrailWrite のみ許可
         → cloudtrail.amazonaws.com が PutObject 可能なポリシー
         → Resource: arn:aws:s3:::phongbt-auditor-production/AWSLogs/332802448674/*

TagSet: NoSuchTagSet（タグなし）
```

**確認結果:**
- 中身は空（オブジェクト0件・サイズ0）
- バケットポリシーは CloudTrail 専用構成
- タグなし → 管理外バケット
- PhongさんがCloudTrail設定を試みた際に作成し、そのまま放置されたと推定

---

### [1]-2 CloudTrail 稼働状況確認

**コマンド:**
```bash
aws cloudtrail describe-trails
aws cloudtrail get-trail-status --name management-events
```

**受信内容:**

| 項目 | 値 |
|---|---|
| トレイル名 | management-events |
| 出力先バケット | aws-cloudtrail-logs-332802448674-e91cb7f6 |
| マルチリージョン | true |
| グローバルサービス | true |
| ログ改ざん検知 | true（LogFileValidationEnabled） |
| IsLogging | **true**（稼働中） |
| 最終ログ配信 | 2026-03-09T18:53:37Z |
| ログ開始日 | 2025-09-29T07:45:56Z |
| 停止日 | なし |

**確認結果:**
- CloudTrail は `management-events` トレイルとして正常稼働中
- 出力先は `aws-cloudtrail-logs-332802448674-e91cb7f6`（AWS自動命名バケット）
- `phongbt-auditor-production` は実際には使われていない → **削除対象と判断**

---

### [1]-3 不要バケット削除

**コマンド:**
```bash
aws s3 rb s3://phongbt-auditor-production
```

**受信内容:**
```
remove_bucket: phongbt-auditor-production
```

**確認結果:**
- 削除成功
- S3バケット数: 11本 → 10本

---

## チャット別索引

| セッション | 調査内容 |
|---|---|\
| 2026-03-10 | S3バケット用途調査・CloudTrail稼働確認・phongbt-auditor-production 削除 |

---

## [2] STG S3バケット調査・不要バケット削除（STG）

### [2]-1 STG CloudTrail・S3バケット一覧確認

**コマンド:**
```bash
aws cloudtrail describe-trails
aws cloudtrail get-trail-status --name management-events 2>&1
aws s3 ls --region ap-northeast-1
```

**受信内容:**
- `trailList: []` → **CloudTrail未設定（改修依頼No.4 未実施のまま）**
- TrailNotFoundException → management-eventsトレイルは存在しない

STGバケット一覧:

| バケット名 | 作成日 |
|---|---|
| aws-quicksetup-patchpolicy-750735758916-v4t88 | 2025-08-29 |
| aws-quicksetup-patchpolicy-access-log-750735758916-a4fd-v4t88 | 2025-11-04 |
| dev-ignica-ksm | 2025-06-24 |
| do-not-delete-ssm-diagnosis-750735758916-ap-northeast-1-89e4k | 2025-11-04 |
| phongbt-auditor-staging | 2026-01-08 |
| stg-aeon-gift-card | 2025-12-19 |
| stg-ignica-com-configrecord | 2025-11-05 |
| stg-ignica-ksm | 2026-01-07 |
| stg-ignica-ksm-pmlogs | 2025-11-04 |

**確認結果:**
- PRDと同様に `phongbt-auditor-staging`（個人名バケット）が存在 → 調査対象

---

### [2]-2 phongbt-auditor-staging 確認

**コマンド:**
```bash
aws s3 ls s3://phongbt-auditor-staging/ --recursive --summarize | tail -3
aws s3api get-bucket-policy --bucket phongbt-auditor-staging
```

**受信内容:**
```
Total Objects: 0 / Total Size: 0
Policy: AWSCloudTrailAclCheck / AWSCloudTrailWrite のみ（cloudtrail.amazonaws.com専用）
        Resource: arn:aws:s3:::phongbt-auditor-staging/AWSLogs/750735758916/*
```

**確認結果:** PRDの `phongbt-auditor-production` と同一パターン。空・未使用・削除OK。

---

### [2]-3 dev-ignica-ksm 確認

**コマンド:**
```bash
aws s3 ls s3://dev-ignica-ksm/ --recursive
aws s3api get-bucket-tagging --bucket dev-ignica-ksm
aws s3api get-bucket-policy --bucket dev-ignica-ksm
```

**受信内容:** JARファイル16件・340MB（最終更新2026-03-06）

| ファイル | 最終更新 |
|---|---|
| backup-txt-handler.jar | 2025-08-28 |
| copy-file-for-auto-report-handler.jar | 2026-02-13 |
| create-file-end-for-night-handler.jar | 2025-11-07 |
| create-file-end-handler.jar | 2025-08-28 |
| daily-report-monitoring-handler.jar | 2026-03-06 |
| get-sync-store-handler.jar | 2025-11-07 |
| itemmaster-import-monitoring-handler.jar | 2025-08-28 |
| p001-import-monitoring-handler.jar | 2026-01-23 |
| replica-importer-oc.jar | 2026-02-12 |
| replica-importer-sg.jar | 2026-02-12 |
| replica-importer-sh.jar | 2026-02-12 |
| send-email-handler.jar | 2026-02-26 |
| send-file.jar | 2025-08-28 |
| split-csv-handler.jar | 2026-02-12 |
| split-txt-by-sent-time.jar | 2025-11-17 |
| unzip-handler.jar | 2025-11-07 |

タグなし・バケットポリシーなし

**確認結果:** STG Lambda JARの置き場として現役稼働中。名前が `dev-` で紛らわしいが削除不可。PRDの `prd-ignica-com-lmd-jar` に相当するバケット。

---

### [2]-4 phongbt-auditor-staging 削除

**コマンド:**
```bash
aws s3 rb s3://phongbt-auditor-staging
```

**受信内容:**
```
remove_bucket: phongbt-auditor-staging
```

**確認結果:** 削除成功。STG S3バケット数: 9本 → 8本

---

## チャット別索引

| セッション | 調査内容 |
|---|---|
| 2026-03-10 午前 | PRD S3バケット調査・CloudTrail稼働確認・phongbt-auditor-production 削除 |
| 2026-03-10 午後 | STG S3バケット調査・CloudTrail未設定確認・dev-ignica-ksm用途確認・phongbt-auditor-staging 削除 |

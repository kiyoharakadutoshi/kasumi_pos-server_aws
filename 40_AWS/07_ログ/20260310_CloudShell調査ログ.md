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

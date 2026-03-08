# USMH送信フロー（sent-txt-file）詳細設定

> **取得日時**: 2026-03-08（Step Functions定義 実測値）  
> **調査対象**: `ksm-posprd-sf-sm-sent-txt-file`

---

## 1. 結論

> **Transfer Family は受信専用。USMH側への送信はLambdaがSFTPクライアントとして直接接続して行っている。**

| 項目 | 内容 |
|---|---|
| 受信 | Transfer Family (SFTP VPC Endpoint) ← 外部ベンダーが送り込む |
| **送信** | **Lambda (`ksm-posprd-lmd-function-sent-txt-file`) がSFTP直接接続** |
| 送信先情報 | Aurora MySQL DB に店舗ごとに格納（SftpHost/Port/UserName/Password） |
| 送信先パス | `pos-master/ishida/csv/{store_code}/` |

---

## 2. sent-txt-file Step Functions フロー

```
Step Functions: ksm-posprd-sf-sm-sent-txt-file
│
├─ [1] CreateLogStreams（Parallel）
│       CloudWatch Logs ストリーム作成
│       /pos/log/sent/all/{id}
│       /pos/log/sent/error/{id}
│
├─ [2] LogStart
│       「{file_name} TXTファイル送信開始」をログ記録
│
├─ [3] GetSyncStore
│       Lambda: ksm-posprd-lmd-function-get-sync-store
│       入力: bucketName, key（S3オブジェクトキー）
│       出力: SftpHost, SftpPort, SftpUserName, SftpPassword, src, dest
│       ↑ Aurora MySQL DBから店舗コードをキーに送信先SFTP接続情報を取得
│       ※ store_code = key を "/" で分割した [3] 番目の要素
│
├─ [4] SendFile  ← 送信の本体
│       Lambda: ksm-posprd-lmd-function-sent-txt-file
│       入力:
│         bucketName   : S3バケット名
│         path         : "pos-master/ishida/csv/{store_code}/"
│         name         : ファイル名
│         ftp_access_info:
│           host : DBのSftpHost   ← USMH側SFTPサーバー
│           port : DBのSftpPort
│           user : DBのSftpUserName
│           pass : DBのSftpPassword
│       ↑ S3からファイルを取得してUSMH側SFTPサーバーへ直接送信
│       リトライ: Lambda例外時に最大3回（Backoff）
│
├─ [5] RunBackupFile
│       Lambda: ksm-posprd-lmd-function-backup-file
│       入力: bucketName, src, dest
│       ↑ 送信済みファイルをS3内でバックアップ先に移動
│
└─ [6] LogSuccess
        「{file_name} TXTファイル送信終了」をログ記録
```

---

## 3. エラーハンドリング

| エラークラス | 発生箇所 | 意味 | 対処 |
|---|---|---|---|
| `DatabaseConnectionException` | GetSyncStore | DB接続失敗 | RDS状態を確認 |
| `SendFileException` | SendFile | ファイル送信失敗 | 送信先SFTPサーバーの状態確認 |
| `FtpConnectionException` | SendFile | SFTP接続失敗 | VPN / 送信先ホストの疎通確認 |
| `States.ALL` | 各ステート | その他例外 | CloudWatch Logsでエラー詳細確認 |

> 全エラーは `FailState` に遷移し `StepFunctionFailed` エラーで終了。  
> CloudWatch Logs `/pos/log/sent/error/` にエラー詳細が記録される。

---

## 4. 関連Lambda関数

| Lambda関数名 | ハンドラー | 役割 |
|---|---|---|
| `ksm-posprd-lmd-function-get-sync-store` | `GetSyncStoreHandler` | DBから店舗別SFTP接続情報を取得 |
| `ksm-posprd-lmd-function-sent-txt-file` | `SentFileHandler` | SFTPクライアントとしてUSMH側に送信 |
| `ksm-posprd-lmd-function-backup-file` | — | 送信済みファイルをS3内でバックアップ移動 |
| `ksm-posprd-lmd-function-split-txt-by-sent-time` | `SplitTxtBySendTimeHandler` | TXTファイルを送信時刻で分割（前処理） |

---

## 5. 送信先情報の管理方式

```
Aurora MySQL DB（テーブル名未確認）
  ├─ SftpHost     : 送信先SFTPサーバーのホスト/IP
  ├─ SftpPort     : ポート番号
  ├─ SftpUserName : SFTPユーザー名
  └─ SftpPassword : SFTPパスワード ← ⚠️ DB平文保存の可能性
```

> ⚠️ **セキュリティリスク: SftpPasswordがDB平文保存の可能性**  
> Secrets Managerではなく `get-sync-store` Lambda がDBから直接取得している。  
> DBに平文パスワードが格納されている場合、DBへの不正アクセス時に認証情報が漏洩する。  
> → パスワードの暗号化 or Secrets Manager移行を検討すること。

---

## 6. 送信先パス

```
送信先: pos-master/ishida/csv/{store_code}/
                    ↑
               「ishida（石田）」= USMH側の受信システム名
               店舗コード別ディレクトリに振り分けて送信
```

---

## 7. ログ確認コマンド（CloudShell）

```bash
# 送信ログ（全件）
aws logs filter-log-events \
  --region ap-northeast-1 \
  --log-group-name /pos/log/sent/all \
  --start-time $(date -d "1 day ago" +%s000) \
  --query 'events[*].{Time:timestamp,Msg:message}' \
  --output table 2>/dev/null | head -30

# 送信エラーログ
aws logs filter-log-events \
  --region ap-northeast-1 \
  --log-group-name /pos/log/sent/error \
  --start-time $(date -d "7 days ago" +%s000) \
  --query 'events[*].{Time:timestamp,Msg:message}' \
  --output table 2>/dev/null

# Step Functions 失敗履歴（直近10件）
aws stepfunctions list-executions \
  --region ap-northeast-1 \
  --state-machine-arn arn:aws:states:ap-northeast-1:332802448674:stateMachine:ksm-posprd-sf-sm-sent-txt-file \
  --status-filter FAILED \
  --query 'executions[:10].{Name:name,Start:startDate,Stop:stopDate}' \
  --output table
```

---

## 8. トラブルシューティング

### 送信が止まっている場合

```
1. Step Functions 失敗履歴を確認
   → エラーの種別（DB接続 / SFTP接続 / ファイル送信）を特定

2. DB接続エラーの場合
   → RDS状態確認: bash 40_AWS/03_リカバリー/01_recover_rds.sh status

3. FTP接続エラーの場合
   → VPN状態確認: bash 40_AWS/03_リカバリー/07_recover_transfer_family.sh check-vpn
   → 送信先（USMH側）のSFTPサーバーの状態を確認

4. ファイル送信エラーの場合
   → /pos/log/sent/error/ でエラー詳細を確認
   → 送信先ディレクトリのパーミッション・空き容量を確認
```

---

## 9. sent-txt-file Lambda 実測値（2026-03-08）

| 項目 | 実測値 |
|---|---|
| **Handler** | `com.luvina.pos.provider.SentFileHandler::handleRequest` |
| **Runtime** | java17 |
| **環境変数** | **なし（null）** |
| **Timeout** | **900秒（15分）= Lambda最大値** |

### 環境変数なし の意味

> **SFTPの接続先情報（Host/Port/User/Password）はすべてAurora MySQL DBから動的取得。**  
> Lambda自体にハードコードされた接続先はなく、`get-sync-store` Lambda がDBから取得した値を  
> Step Functions 経由で受け取る設計。

```
【送信時のデータフロー】
Aurora MySQL
  └─ 店舗ごとのSFTP接続情報テーブル
        │ get-sync-store Lambda が取得
        ▼
Step Functions ステート変数
  └─ SftpHost / SftpPort / SftpUserName / SftpPassword
        │ sent-txt-file Lambda の引数として渡す
        ▼
Lambda が SFTP直接接続して送信
```

### タイムアウト900秒 の意味

Lambda の最大タイムアウト値（上限）に設定されている。  
SH系ファイルが最大38MB/件のため、大容量ファイルの転送時間を考慮していると推定。

### リスク: DB停止 → 送信も停止

```
RDS障害が発生すると...
  ├─ 受信処理（OC/SG/SH Lambda）: DB書き込みエラーで停止
  └─ 送信処理（sent-txt-file）  : get-sync-storeがDB接続失敗 → 送信停止
           ↑ DatabaseConnectionException → FailState
```

> **RDS単一障害点**: DBが落ちると受信・送信の両方が完全停止する。  
> バックアップ保持期間が1日（現状）では、障害時のデータ損失リスクが高い。  
> → バックアップ保持期間を7〜35日に延長することが急務（別途修正依頼書あり）

### プロトコル確認事項

| 項目 | 現状 | 確認方法 |
|---|---|---|
| FTP or SFTP | **未確定**（引数名は `ftp_access_info` だが `SftpHost` と記載） | `SentFileHandler.java` ソースコードを確認 |
| 送信ポート番号 | DBの `SftpPort` 列の値次第 | DB内の実際の値を確認 |

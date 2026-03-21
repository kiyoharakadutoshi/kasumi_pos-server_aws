# web-fe プロキシ設定調査結果

> 日付: 2026-03-21
> 調査者: きよはらさん ↔ Claude
> 対象: KS_AS_MO_1MD_009 #3「webpackプロキシの2バックエンド対応」

---

## 調査経緯

009文書の#3で「問題なし（合意）— 開発環境限定（localhost）」と判断されていたが、
STG/PRDでプロキシ設定が影響している可能性を再調査した。

---

## ソースコード調査結果

### 1. webpack devServer proxy（開発用のみ）

**ファイル:** `pos-server-frontend-ishida-staging/webpack/webpack.dev.js`（production版も同一）

```javascript
devServer: {
  port: 9060,
  proxy: [{
    context: ['/api', '/services', '/management', '/v3/api-docs', '/h2-console'],
    target: 'http://localhost:8080',
  }],
}
```

- **開発時（npm start）のみ使用**
- `/gift`, `/gift-api` ルートは**存在しない**（009文書の記載と不一致）

### 2. 本番/STGビルド時のAPI接続先

**ファイル:** `pos-server-frontend-ishida-staging/webpack/environment.js`

```javascript
SERVER_API_URL: 'https://api-spk.ignicapos.com/api/v1',          // PRD(SPK)
SERVER_API_URL_STAGING: 'https://api-stg.ignicapos.com/api/v1',  // STG
```

**ビルド時切替（webpack.common.js）:**
- `npm run build` or `npm run build-spk` → `api-spk.ignicapos.com` ハードコード
- `npm run build-stg` → `api-stg.ignicapos.com` ハードコード

**axios設定:** `axios.defaults.baseURL = SERVER_API_URL`（ビルド時に確定）

### 3. production版（いなげや/オンプレ用）

**ファイル:** `pos-server-frontend-production/webpack/environment.js`

```javascript
SERVER_API_URL: 'http://172.172.1.105:8080/pos-server/api/v1',
```

- プライベートIP直指定（オンプレ環境向け）

### 4. ビルド成果物

- 出力先: `target/classes/static/`（静的ファイル）
- Dockerfile: **なし**（フロントエンド側）
- nginx.conf: **なし**（フロントエンド側）

### 5. web-be（バックエンド — CloudShellログより）

- nginx → localhost:8081 リバースプロキシ
- `java -jar ishida-20251217-1.jar --server.port=8081`

---

## 未確認事項（要VPN接続）

| 確認項目 | コマンド | 対象 |
|---|---|---|
| web-fe EC2のプロセス一覧 | `ps aux` | i-027af978d9452d713 |
| web-fe側のnginx設定 | `cat /etc/nginx/conf.d/*.conf` | 同上 |
| web-fe静的ファイル配置場所 | `ls -la /var/www/ /home/*/` | 同上 |
| web-be nginx proxy_pass設定 | `cat /etc/nginx/conf.d/*.conf` | i-05fdf2857655d4561 |

**接続方法:** VPN接続 → bastion (10.226.51.13) → web-fe (10.226.51.15) / web-be (10.226.51.91)

---

## #3 判定の修正

### 旧判定
> 問題なし（合意）— 開発環境限定（localhost）であることを確認済み

### 新判定
> **要修正** — 以下の問題を確認

| # | 問題 | 深刻度 |
|---|---|---|
| 3-1 | 009文書の記載「`/gift`, `/gift-api` → :8080」はソースコードに存在しない（文書誤記） | 中 |
| 3-2 | API URLがビルド時にハードコード。誤ビルド（`--env input`の指定ミス）でSTGがPRDのAPIを叩く、またはその逆が発生するリスク | 高 |
| 3-3 | production版はプライベートIP直指定（172.172.1.105:8080）。環境変数化されていない | 高 |
| 3-4 | web-fe EC2で何がフロントエンドを配信しているか未確認（nginx? Node.js? 静的ファイル?） | 中 |

### 推奨対応

1. **009文書の#3を上記調査結果で更新** — 「問題なし」→「要修正」
2. **API URLの環境変数化** — ビルド時ハードコードではなく、ランタイムで`window.__ENV__`等から読み取る方式に変更
3. **production版のIP直指定を廃止** — DNS名またはALBエンドポイントに変更
4. **VPN接続時にweb-fe/web-beのEC2内部調査を実施**

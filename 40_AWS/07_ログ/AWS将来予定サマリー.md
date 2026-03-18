# AWS 将来予定サマリー

> 最終更新: 2026-03-10  
> 対象環境: PRD / STG  
> 担当: Luvina Software

---

## 概要

カスミPOSシステムのAWSインフラに関して、今後追加・改修予定の機能・構成変更をまとめたサマリー。  
各項目の詳細設計・改修指示書は順次 `40_AWS/04_修正依頼/` に追加する。

---

## 1. VPN構成刷新（Bastion廃止 / S2S VPN + Client VPN移行）

### 現状
- Luvina → AWSアクセス: OpenVPN（Bastion経由）
- Luvinaオフィス → AWS: 未整備（個人Client VPNのみ）

### 予定
| 区分 | 内容 | 優先度 |
|------|------|--------|
| S2S VPN（PRD新規追加） | TP-Link ER605（14.224.146.153）→ VGW（PRD）を正式開通 | 高 |
| Client VPN（PRD/STG/DEV） | 在宅メンバー向け個人VPN整備。同時接続数確認後に設定 | 高 |
| OpenVPN（Bastion）廃止 | S2S/Client VPN移行完了後に廃止。USMHへNAT変換元IP変更依頼が必要 | 中 |
| Bastion廃止 | OpenVPN廃止後。giftcard SGルール変更も合わせて実施 | 中 |

### 前提条件
- Luvinaオフィス内部CIDR確認（TP-Link ER605 LAN側）
- 在宅メンバー人数確認（Client VPN同時接続数・コスト試算用）
- USMH側へのNAT変換元IP変更依頼（Bastion廃止タイミングで調整）

---

## 2. STG ALB internal化（No.018）

### 現状
- STG WebサーバーのALBがinternet-facing

### 予定
- ALBをinternal化し、外部からの直接アクセスを遮断
- PRD本番展開も合わせて設計・改修指示書作成

### ステータス
- STG作業: 完了確認待ち
- PRD展開: 設計中

---

## 3. ギフト端末リモートサポート（UltraVNC / カスミAWS NLB）

### 背景
- 店舗200店 × 約10台 = 2,000台のギフト端末にLuvinaからリモート接続できない
- 端末設定変更不可・カスミ筑波センターの既存接続も維持する必要あり

### 方針（提案済 → カスミ合意待ち）
```
Luvina → LuvinaAWS → カスミAWS NLB（ポートフォワーディング）
    :15900 → 店舗001端末(固有IP):5900
    :25900 → 店舗002端末(固有IP):5900
    ・・・
```

### 必要な前提
| 項目 | 担当 | 状況 |
|------|------|------|
| カスミAWSアカウント情報共有 | カスミ / BIPROGY | 依頼待ち |
| LuvinaAWS ↔ カスミAWS クロスアカウント接続（VPC Peering or TGW） | BIPROGY + Luvina | 未着手 |
| IAMクロスアカウントロール設定（カスミAWS側） | カスミ / BIPROGY | 未着手 |
| 各店舗ギフト端末IPアドレス一覧 | カスミ | 未入手 |
| NLBポート番号↔店舗マッピング表作成 | Luvina | 端末IP入手後 |

### 概算コスト（カスミAWS月額）
- NLB: 約 $18〜$25/月
- クロスアカウント接続: $0（Peering）〜 $36（TGW）/月

### 関連資料
- `40_AWS/04_修正依頼/Ksm_aws_proposal_001_新機能提案書_カスミAWS活用v1.0_ja.pptx`

---

## 4. 電子棚札（ESL）CSV配布のカスミAWS中継ハブ化

### 現状
- LuvinaAWS → 店舗ごとNAT変換 → 各店舗ESLシステムに直接送信
- 店舗追加のたびにNAT設定が必要

### 方針（提案済 → カスミ合意待ち）
```
LuvinaAWS → カスミAWS（S3 + Lambda） → 各店舗ESLシステム
```
- LuvinaがカスミAWS内の配布ロジックをコントロール
- NAT設定不要・店舗追加も容易

### 必要な前提
| 項目 | 担当 | 状況 |
|------|------|------|
| カスミAWSアカウント情報共有 | カスミ / BIPROGY | 依頼待ち |
| クロスアカウント接続（3番と共通） | BIPROGY + Luvina | 未着手 |
| IAMクロスアカウントロール設定 | カスミ / BIPROGY | 未着手 |

### 概算コスト（カスミAWS月額）
- S3: 約 $1〜$5/月
- Lambda: 約 $1以下/月

### 関連資料
- `40_AWS/04_修正依頼/Ksm_aws_proposal_001_新機能提案書_カスミAWS活用v1.0_ja.pptx`

---

## 5. コンテナ化（ECS移行）

### 背景
- 現状: EC2ベースのLambda + バッチ構成
- モノレポ化（POS-SERVER統合）完了後にECS Fargate移行を計画

### 予定内容
- 各Lambda・バッチをコンテナ化
- ECS Fargate + ECRへ移行
- CI/CD（CodePipeline）整備

### ステータス
- モノレポ化: 完了
- ECS設計: 未着手（改修指示書作成予定）

---

## 進捗ステータス凡例

| 記号 | 意味 |
|------|------|
| ✅ | 完了 |
| 🔄 | 進行中 |
| ⏳ | 合意・確認待ち |
| 📝 | 設計中 |
| ❌ | 未着手 |

## 全体ステータス一覧

| # | 項目 | ステータス | 備考 |
|---|------|-----------|------|
| 1 | S2S VPN PRD新規追加 | ❌ | 設計待ち |
| 2 | Client VPN PRD/STG/DEV | ❌ | 人数確認待ち |
| 3 | OpenVPN / Bastion廃止 | ❌ | USMH調整必要 |
| 4 | STG ALB internal化 | 🔄 | STG完了確認待ち |
| 5 | UltraVNC リモートサポート | ⏳ | カスミ合意待ち |
| 6 | ESL CSV カスミAWS中継ハブ化 | ⏳ | カスミ合意待ち |
| 7 | ECS（コンテナ化）移行 | ❌ | モノレポ化完了後 |

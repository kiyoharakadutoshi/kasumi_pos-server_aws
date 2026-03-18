# プロジェクト指示（CLAUDE.md）

## スキル強制読み込みルール

設計書・改修指示書・仕様書・議事録・提案書・スケジュール表を作成する前に、
**必ず OneDrive 上のマスタースキルファイルを Read ツールで読み込んでから作業を開始すること。**

### スキルマスターファイル（OneDrive）

| スキル | マスターファイル | トリガー |
|---|---|---|
| luvina-sekkei-sho | `E:/OneDrive-この/OneDrive - この/〇Claude_Skill/SKILL_20260317.md` | 設計書・改修指示書・仕様書 |
| kasumi-minutes | `E:/OneDrive-この/OneDrive - この/〇Claude_Skill/kasumi-minutes.skill` | 議事録 |
| luvina-ppt | `E:/OneDrive-この/OneDrive - この/〇Claude_Skill/luvina-ppt.skill` | 提案書・プレゼン |
| luvina-schedule | `E:/OneDrive-この/OneDrive - この/〇Claude_Skill/luvina-schedule.skill` | 進捗管理表・スケジュール |

### スキル一覧・詳細

`E:/OneDrive-この/OneDrive - この/〇Claude_Skill/INDEX.md` を参照。

### 手順

1. 該当スキルのトリガーキーワードを検出
2. マスターファイルを `Read` ツールで読み込む
3. その指示に従って文書を作成する

> ローカルセッションのスキルより **OneDrive 上のマスターファイルを常に優先** する。

## 文書命名規則

```
KSM_{サブ}_{カテゴリ}_{連番}_{文書名}_{言語}.拡張子
```

- サブ: GFT（ギフトカード）、WEB（POSサーバーWeb）、AWS（AWS基盤）、POS（共通）
- カテゴリ: SYS, BD, MOD, REQ, OVR, MTG, CRV, SCR, FRM, DB, API, CFG, CST, INC, OPS, MSR, TST, SCH, RULE
- 言語: `_ja`（日本語のみ）、`_ja_vi`（日越併記）、`_VN`（ベトナム語のみ）

## プロジェクト情報

- リポジトリ: https://github.com/kiyoharakadutoshi/kasumi_pos-server.git
- 担当: きよはらかづとし（Luvina Software JSC）
- クライアント: カスミ（企業コード: 100）
- VN側: Thanh Nguyên
- システム: POSサーバー（React / Spring Boot / AWS）

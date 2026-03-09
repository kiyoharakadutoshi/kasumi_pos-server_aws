---
name: kasumi-minutes
description: |
  カスミ（Kasumi）ESLプロジェクト向けの議事録（.docx）を作成するスキル。
  LUVINA Softwareとカスミ・BIPROGY間の打ち合わせ議事録を、定まったフォーマットで日本語Wordドキュメントとして生成する。
  
  以下のキーワードや状況で必ずこのスキルを使用すること：
  - 「議事録」「議事録作成」「打ち合わせ記録」「会議録」
  - カスミ・BIPROGY・ESLプロジェクトに関する会議メモや音声文字起こし
  - 「議事録をスキルに」「フォーマット通りに作成」
  - テキストファイルやチャットログから議事録ドキュメントへの変換
---

# カスミ ESL プロジェクト 議事録スキル

## 概要

カスミESLプロジェクト（LUVINA Software × カスミ × BIPROGY）向け議事録を、
統一フォーマットで `.docx` ファイルとして生成するスキル。

入力：会議の文字起こし・要約テキスト、またはチャット内容
出力：`/mnt/user-data/outputs/議事録_<タイトル>_<YYYYMMDD>.docx`

---

## ドキュメントフォーマット仕様

### 基本設定

```
用紙サイズ : A4（11906 × 16838 DXA）
マージン   : 上下左右 1080 DXA（約1.9cm）
フォント   : Arial
本文サイズ : 22pt（11pt相当）
```

### スタイル定義

#### 大見出し（セクションヘッダー）
```javascript
// 白文字 × 青背景（#2E75B6）、全幅
{
  text: bold, size: 28, color: "FFFFFF",
  fill: "2E75B6", type: ShadingType.CLEAR,
  spacing: { before: 240, after: 120 },
  indent: { left: 120, right: 120 }
}
// 例: "　１．基本情報"（全角スペース＋番号）
```

#### 中見出し
```javascript
// 青文字（#2E75B6）＋下線ボーダー
{
  text: bold, size: 24, color: "2E75B6",
  border: { bottom: { style: SINGLE, size: 6, color: "2E75B6" } },
  spacing: { before: 200, after: 80 }
}
// 例: "２－１　不具合の内容"
```

#### 本文
```javascript
{ size: 22, font: "Arial", spacing: { before: 60, after: 60 } }
```

#### 箇条書き
```javascript
// numbering reference: "bullets", level: 0
// text: "・", indent: { left: 600, hanging: 300 }
```

### テーブルスタイル

#### 基本情報テーブル（2列：ラベル／値）
```
列幅: [2500, 6860] DXA（合計 9360）
ラベル列: 背景 #EEF4FB、太字
値列   : 背景 #FFFFFF
ボーダー: SINGLE, size:1, color:"CCCCCC"
セル内余白: top:80 bottom:80 left:120 right:120
```

#### データテーブル（ヘッダー付き）
```
ヘッダー行: 背景 #2E75B6、白文字、太字
データ行 : 背景 #FFFFFF
同上ボーダー・マージン
```

---

## 標準セクション構成

議事録は以下のセクションで構成する。内容に応じてセクションを追加・削除してよい。

```
１．基本情報          ← 開催日時・場所・形式・参加者・記録者・議題
２．議題概要          ← 主な議題や背景（必要に応じて）
３．各議題の内容      ← 議題ごとに中見出しで細分化
４．決定事項・アクションアイテム  ← 担当・期限付きの表
５．その他            ← 補足事項（任意）
６．次回打ち合わせ    ← 日時・議題
```

---

## 実装パターン（Node.js / docx ライブラリ）

### セットアップ
```javascript
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat
} = require('docx');
const fs = require('fs');
```

### ヘルパー関数

```javascript
// ボーダー定義
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

// 大見出し（青背景）
function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, font: "Arial", color: "FFFFFF" })],
    shading: { fill: "2E75B6", type: ShadingType.CLEAR },
    spacing: { before: 240, after: 120 },
    indent: { left: 120, right: 120 },
  });
}

// 中見出し（青文字＋下線）
function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: "2E75B6" })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
  });
}

// 本文
function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })],
    spacing: { before: 60, after: 60 },
  });
}

// 箇条書き（numbering config で "bullets" reference を定義済みであること）
function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22, font: "Arial", bold })],
    spacing: { before: 40, after: 40 },
  });
}

// 空白行
function spacer(before = 200) {
  return new Paragraph({ spacing: { before, after: 0 } });
}

// ラベル／値の2列行（基本情報テーブル用）
function makeTableRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 2500, type: WidthType.DXA },
        shading: { fill: "EEF4FB", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: "Arial" })] })]
      }),
      new TableCell({
        borders,
        width: { size: 6860, type: WidthType.DXA },
        shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 22, font: "Arial" })] })]
      }),
    ]
  });
}
```

### numbering 設定（Document 作成時に必須）
```javascript
numbering: {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "・",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 600, hanging: 300 } } }
      }]
    },
    {
      reference: "numbers",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 600, hanging: 300 } } }
      }]
    },
  ]
}
```

### Document ラッパー
```javascript
const doc = new Document({
  numbering: { /* 上記 */ },
  styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },   // A4
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children: [ /* コンテンツ */ ]
  }]
});
```

### アクションアイテムテーブル（3列）
```
列幅: [5000, 2500, 1860] DXA（合計 9360）
列名: アクション内容 ／ 担当 ／ 期限
ヘッダー: 背景 #2E75B6、白文字
```

---

## ファイル名規則

```
議事録_<議題の短縮名>_<YYYYMMDD>.docx
例: 議事録_特売価格不具合確認_20260306.docx
    議事録_ETL移行設計レビュー_20260310.docx
```

---

## 出力手順

1. `docx` ライブラリが利用可能か確認（`npm list -g docx`）
2. `/home/claude/minutes.js` にスクリプトを作成
3. `node /home/claude/minutes.js` で実行
4. `python scripts/office/validate.py <path>` でバリデーション
5. `cp` で `/mnt/user-data/outputs/` にコピー
6. `present_files` で共有
7. 必要に応じて Git コミット＆プッシュ（`kasumi_pos-server-batch-isida/02_議事録/` 以下）

---

## 注意事項

- `\n` は使わず、複数行は別の `Paragraph` として記述する
- テーブルの `columnWidths` の合計が `width.size` と一致すること
- `ShadingType.CLEAR` を使う（`SOLID` は黒背景になる）
- 参加者表記は `【カスミ】` `【BIPROGY】` `【LUVINA】` でグループ分けする
- 記録者は原則 LUVINA 側担当者を記載

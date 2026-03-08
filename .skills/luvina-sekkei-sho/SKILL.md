---
name: luvina-sekkei-sho
description: >
  LuvinaソフトウェアのWordフォーマット設計書（改修指示書・仕様書・設計書）を作成するスキル。
  Luvina固有のデザイン（赤ヘッダー C8102E、BIZ UDPゴシックフォント、メタ情報テーブル、改版履歴、コードdiffテーブル、テスト手順表）を忠実に再現する。
  以下のキーワードや状況で**必ず**このスキルを使用すること：
  - 「設計書」「改修指示書」「仕様書」「指示書」「作業指示」をWordで作成する
  - 「Luvinaフォーマット」「Luvinaの設計書テンプレート」
  - 「改廃履歴」「改版履歴」「対象ファイル」「改修内容」「テスト手順・報告」セクションを含む文書
  - Luvina / Kasumi / AFS / Kitamura プロジェクト向けの技術ドキュメント（Word）
---

# Luvina 設計書 Word作成スキル

## 概要

このスキルは、LuvinaソフトウェアのWordフォーマット設計書を作成するためのガイドラインです。
`docx` npm パッケージを使って JavaScript で生成します。

**必ず docx スキルも参照すること**: `/mnt/skills/public/docx/SKILL.md`

---

## 必須インポート

```javascript
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageNumberFormat, TabStopType, LevelFormat,
  HeadingLevel, PageBreak,
  SimpleField,   // ⚠️ フッターページ番号に必須。PageNumber.CURRENTはフォントが効かないため使用禁止
} = require('docx');
const fs = require('fs');
```

---

## ページ設定

- **用紙サイズ**: A4 (11906 × 16838 DXA)
- **余白**: 上1418・下1418・左1701・右1701 DXA（約25mm）
- **フォント**: `BIZ UDPゴシック`（日本語・英数字とも同じ）

```javascript
sections: [{
  properties: {
    page: {
      size: { width: 11906, height: 16838 },
      margin: { top: 1418, right: 1701, bottom: 1418, left: 1701 }
    }
  },
  headers: { default: header },
  footers: { default: footer },
  children: [/* content */]
}]
```

---

## カラーパレット

| 用途 | カラーコード |
|------|-------------|
| Luvinaレッド（ヘッダーアクセント・ヘッダー文字・H1下線） | `C8102E` |
| 見出し文字（H1〜H3） | `000000`（黒） |
| テーブル罫線 | `CCCCCC` |
| メタテーブル左列背景・ヘッダー行背景 | `F5F5F5` |
| テスト表ヘッダー行背景 | `D6E4F0` |
| フッター文字・薄グレー | `666666` |
| ヘッダー右テキスト（グレー） | `888888` |
| 未確定行・将来バージョン文字 | `AAAAAA` |

---

## スタイル定義

```javascript
styles: {
  default: {
    document: {
      run: { font: "BIZ UDPゴシック", size: 22 } // 11pt default
    }
  },
  paragraphStyles: [
    {
      id: "Title", name: "Title", basedOn: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 56, bold: true },  // 28pt
      // spacing.before は表紙タイトルを上下中央よりやや上に配置するため 4200 DXA を使用
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 4200, after: 120 } }
    },
    {
      id: "Subtitle", name: "Subtitle", basedOn: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 24 },  // 12pt
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 } }
    },
    {
      // ★ H1: 改ページ前挿入・赤下線・before=0（改ページ直後の余白なし）・文字は黒
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 32, bold: true, color: "000000" },
      paragraph: { spacing: { before: 0, after: 120 }, outlineLevel: 0 }
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 24, bold: true, color: "000000" },
      paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 }
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 22, bold: true, color: "000000" },
      paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 2 }
    },
  ]
}
```

---

## 見出し実装ルール

### Heading 1（章タイトル）
- **必ず `pageBreakBefore: true`** を指定して章の先頭で改ページ
- **`spacing.before: 0`** にする（改ページ後の余白を除去）
- **赤い下線**（`C8102E`、sz=8）をページ幅全体に入れる
- 文字色: 黒 `000000`

```javascript
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { before: 0, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "C8102E", space: 4 } },
    children: [new TextRun({ text, font: "BIZ UDPゴシック", size: 32, bold: true })]
  });
}
```

### Heading 2 / Heading 3
- 文字色: 黒 `000000`（ブルー系は使用しない）

```javascript
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "BIZ UDPゴシック", size: 24, bold: true })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text, font: "BIZ UDPゴシック", size: 22, bold: true, color: "000000" })]
  });
}
```

---

## ヘッダー

- 左側: ドキュメントタイトル（**赤字 `C8102E`、BIZ UDPゴシック、太字、26pt**）
- 右側: 日付/会議名（グレー `888888`、18pt）タブ区切り右寄せ
- 下罫線: Luvinaレッド `C8102E`、sz=8

```javascript
const header = new Header({
  children: [
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "C8102E", space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: 9026 }],
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "プロジェクト名  設計書タイトル",
          font: "BIZ UDPゴシック", bold: true, color: "C8102E", size: 26
        }),
        new TextRun({
          text: "\t日付 定例会",
          font: "BIZ UDPゴシック", color: "888888", size: 18
        })
      ]
    })
  ]
});
```

---

## フッター

- 中央: `Luvina Software JSC.  |  Confidential  |  p. [ページ番号]`
- グレー `666666`、16pt
- 上罫線: `CCCCCC`、sz=4
- **⚠️ ページ番号は必ず `SimpleField("PAGE", ...)` を使う**
  - `PageNumber.CURRENT` を `TextRun` の children に入れる方法はフォント指定が効かず、ページ番号だけ別フォントになる。**絶対に使用しないこと。**

```javascript
const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
      spacing: { before: 80 },
      children: [
        new TextRun({ text: "Luvina Software JSC.  |  Confidential  |  p.", color: "666666", size: 16, font: "BIZ UDPゴシック" }),
        // ⚠️ PageNumber.CURRENT は TextRun 内でフォントが効かない → SimpleField を使う
        new SimpleField("PAGE", { color: "666666", size: 16, font: "BIZ UDPゴシック" })
      ]
    })
  ]
});
```

---

## ドキュメント構成（標準レイアウト）

### ページ構成
```
[1ページ目] 表紙
  タイトル（上下中央よりやや上）
  サブタイトル
  メタ情報テーブル

[2ページ目] ■改版履歴（単独ページ・Heading2）
  改版履歴テーブル

[3ページ目〜] 本文（各章はH1で改ページ）
  # 0. 実施判断のご確認（顧客向け）
  # 1. 概要
  # 2. ...
```

### 1. 表紙要素

```
[タイトル行]       ← Style: Title, 28pt, 中央, spacing.before=4200（上下中央よりやや上）
                     例: 「改　修　指　示　書」（全角スペース区切り）
[サブタイトル行]   ← Style: Subtitle, 12pt, 中央
[メタ情報テーブル] ← 2列, 幅6000 DXA, 中央配置
[PageBreak]        ← 2ページ目（改版履歴）へ
```

### 2. メタ情報テーブル（表紙）

- 幅: 6000 DXA、中央配置
- 左列: 幅 2000 DXA、背景 `F5F5F5`
- 右列: 幅 4000 DXA
- 全セル罫線: `CCCCCC`
- セルマージン: **top/bottom 30, left/right 60**（極小マージン）
- セル文字サイズ: **20pt**（本文より1pt小さく）

**標準行**: プロジェクト / 依頼番号 / 対象 / 作成日 / 作成者 / バージョン / 優先度 / 承認者

```javascript
const CM = { top: 30, bottom: 30, left: 60, right: 60 };  // 標準セルマージン

function metaTable(rows) {
  return new Table({
    width: { size: 6000, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    columnWidths: [2000, 4000],
    rows: rows.map(([label, value]) =>
      new TableRow({ cantSplit: true, children: [
        new TableCell({
          width: { size: 2000, type: WidthType.DXA }, borders, margins: CM,
          shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: label, font: "BIZ UDPゴシック", size: 20 })] })]
        }),
        new TableCell({
          width: { size: 4000, type: WidthType.DXA }, borders, margins: CM,
          children: [new Paragraph({ children: [new TextRun({ text: value, font: "BIZ UDPゴシック", size: 20 })] })]
        })
      ]})
    )
  });
}
```

### 3. ■改版履歴（2ページ目・単独）

- タイトル: **`■改版履歴`**（Heading 2、スペースなし、先頭に■）
- 直前に PageBreak を挿入して単独ページにする
- 直後も PageBreak を挿入して本文を3ページ目から開始する
- **版数ルール**: `0.1` から開始 → 顧客承認で `1.0` に昇格
- **未確定行（将来バージョン）**: 文字色を `AAAAAA`（灰色）にする
- 記入用空行を複数行追加する

列構成: `版 | 改訂日 | 改訂者 | 改訂内容`  
列幅(DXA): `800 | 1600 | 2000 | 4600`（計 9000 DXA）  
ヘッダー行背景: `F5F5F5`  
セルマージン: CM（top/bottom 30, left/right 60）

```javascript
// 改版履歴テーブル（color 引数で行ごとに文字色指定可能）
function historyTable(rows) {
  const hdr = ["版", "改訂日", "改訂者", "改訂内容"];
  const widths = [800, 1600, 2000, 4600];
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ cantSplit: true, children: hdr.map((h, i) =>
        new TableCell({ width: { size: widths[i], type: WidthType.DXA }, borders, margins: CM,
          shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: h, font: "BIZ UDPゴシック", size: 20, bold: true })] })] })
      )}),
      ...rows.map(([ver, date, author, content, color]) =>
        new TableRow({ cantSplit: true, children: [ver, date, author, content].map((v, i) =>
          new TableCell({ width: { size: widths[i], type: WidthType.DXA }, borders, margins: CM,
            children: [new Paragraph({ children: [new TextRun({ text: v, font: "BIZ UDPゴシック", size: 20, color: color || "000000" })] })] })
        )})
      )
    ]
  });
}

// 使用例
historyTable([
  ["0.1", "2026-03-08", "Thanh Nguyên", "初版作成"],
  ["1.0", "",           "",             "顧客承認",  "AAAAAA"],  // 灰色（未確定）
  ["",    "",           "",             ""],                      // 記入用空行
]);
```

### 4. 本文セクション構造

```
# 0. 実施判断のご確認（顧客向け）  ← Heading 1（改ページ付き・赤下線）
  [変更内容・効果サマリーテーブル]
  [実施判断チェックリストテーブル]

# 1. 概要                           ← Heading 1
  [概要テキスト]
  [改修一覧テーブル]  列: No. / 改修タイトル / 概要 / 工数 / リスク

# No.XX タイトル                    ← Heading 1

## ■ 対象ファイル                   ← Heading 2
## ■ 改修内容                       ← Heading 2
## ■ [コードセクション名]           ← Heading 2 または Heading 3
  [コード差分テーブル]  ▼ 変更前 | ▲ 変更後

## ■ テスト手順・報告               ← Heading 2
  [テスト表]
  → 全テスト完了後、結果欄を記入して Thanh Nguyên へ提出すること。

# N. 切り戻し手順                   ← Heading 1
# N. リスクと対応策                 ← Heading 1
# N. 完了報告                       ← Heading 1
```

---

## テーブル共通ルール

- **全テーブルの全行に `cantSplit: true`** を設定する（セル途中での改ページ禁止）
- **セルマージン**: `CM = { top: 30, bottom: 30, left: 60, right: 60 }`（標準）
- **コードブロック用マージン**: `CM2 = { top: 40, bottom: 40, left: 80, right: 80 }`
- **セル文字サイズ**: **20pt**（本文 22pt より1pt小さく）
- **テーブル幅**: 必ず `WidthType.DXA` で指定（PERCENTAGE 禁止）
- **columnWidths の合計 = テーブル幅** になること
- **shadingType は必ず `ShadingType.CLEAR`**（SOLID は黒背景になるため禁止）

```javascript
const border1 = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const borders = { top: border1, bottom: border1, left: border1, right: border1 };
const CM  = { top: 30, bottom: 30, left: 60,  right: 60  };  // 標準
const CM2 = { top: 40, bottom: 40, left: 80,  right: 80  };  // コードブロック用
```

---

## コード差分テーブル（Before/After）

- 2列均等: 各 4500 DXA（合計 9000 DXA）
- ヘッダー行: `▼ 変更前 (Before)` / `▲ 変更後 (After)` を背景 `F5F5F5`・中央揃え・太字
- コードは等幅フォント（`Consolas`、18pt）で表示

```javascript
function beforeAfter(beforeLines, afterLines) {
  const colW = 4500;
  const makeCells = (lines) => new TableCell({
    width: { size: colW, type: WidthType.DXA }, borders, margins: CM2,
    children: lines.map(l => new Paragraph({
      children: [new TextRun({ text: l, font: "Consolas", size: 18 })],
      spacing: { before: 20, after: 20 }
    }))
  });
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [colW, colW],
    rows: [
      new TableRow({ cantSplit: true, children: [
        new TableCell({ width: { size: colW, type: WidthType.DXA }, borders, margins: CM2,
          shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "▼ 変更前 (Before)", bold: true, font: "BIZ UDPゴシック", size: 20 })] })] }),
        new TableCell({ width: { size: colW, type: WidthType.DXA }, borders, margins: CM2,
          shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
          children: [new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "▲ 変更後 (After)", bold: true, font: "BIZ UDPゴシック", size: 20 })] })] }),
      ]}),
      new TableRow({ cantSplit: true, children: [makeCells(beforeLines), makeCells(afterLines)] })
    ]
  });
}
```

---

## テスト手順表

列構成: `No. | テスト手順・確認内容 | 期待結果 | 結果（OK/NG）`  
列幅(DXA): `600 | 4400 | 2800 | 1200`（計 9000 DXA）  
ヘッダー行背景: `D6E4F0`（薄水色）  
結果列: 空欄（記入欄）  
セルマージン: CM

---

## 実施判断チェックリスト（顧客向け）

列構成: `No. | 確認事項 | 確認結果`  
列幅(DXA): `600 | 5400 | 3000`（計 9000 DXA）  
ヘッダー行背景: `D6E4F0`（薄水色）  
確認結果例: `□ YES　□ NO` / `□ 承認　□ 保留　□ 否認`

---

## 改修一覧テーブル（概要セクション）

列構成: `No. | 改修タイトル | 概要 | 工数 | リスク`  
列幅(DXA): `900 | 2500 | 3600 | 1000 | 1000`（計 9000 DXA）  
ヘッダー行背景: `F5F5F5`

---

## 作成者設定

**重要**: ファイル作成時・更新時の作成者・更新者は必ず **`Thanh Nguyên`** とすること。

---

## 作成手順

1. `docx` スキル (`/mnt/skills/public/docx/SKILL.md`) を読む
2. `node -e "require('docx'); console.log('OK')"` で docx インストール確認
3. 上記フォーマットに従って JavaScript で生成スクリプトを作成
4. スクリプトを実行: `node generate.js`
5. 検証: `python3 /mnt/skills/public/docx/scripts/office/validate.py output.docx`
6. `/mnt/user-data/outputs/` に配置
7. GitHub へ `git add / commit / push`（ワークフロー: clone/pull → 確認 → 修正 → push）

---

## 変更履歴（スキル自体）

| 日付 | 変更内容 |
|------|---------|
| 2026-03-08 | 初版 |
| 2026-03-09 | H1〜H3文字色を黒に統一 / H1に赤下線追加 / H1 pageBreakBefore+before=0 / 改版履歴を2ページ目単独に / タイトル上下中央やや上配置 / 版数0.1スタート・未確定行灰色 / セルcantSplit / セルマージン縮小（30/60）/ セル文字20pt / フッターページ番号をSimpleField("PAGE")に変更（フォント統一）/ 必須インポート一覧セクション追加・SimpleField使用禁止警告追記 |

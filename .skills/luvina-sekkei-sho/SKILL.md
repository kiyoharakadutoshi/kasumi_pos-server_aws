---
name: luvina-sekkei-sho
description: >
  LuvinaソフトウェアのWordフォーマット設計書（改修指示書・仕様書・設計書）を作成するスキル。
  Luvina固有のデザイン（赤ヘッダー C8102E、BIZ UDPゴシックフォント、メタ情報テーブル、改廃履歴、コードdiffテーブル、テスト手順表）を忠実に再現する。
  以下のキーワードや状況で**必ず**このスキルを使用すること：
  - 「設計書」「改修指示書」「仕様書」「指示書」「作業指示」をWordで作成する
  - 「Luvinaフォーマット」「Luvinaの設計書テンプレート」
  - 「改廃履歴」「対象ファイル」「改修内容」「テスト手順・報告」セクションを含む文書
  - Luvina / Kasumi / AFS / Kitamura プロジェクト向けの技術ドキュメント（Word）
---

# Luvina 設計書 Word作成スキル

## 概要

このスキルは、LuvinaソフトウェアのWordフォーマット設計書を作成するためのガイドラインです。
`docx` npm パッケージを使って JavaScript で生成します。

**必ず docx スキルも参照すること**: `/mnt/skills/public/docx/SKILL.md`

---

## ページ設定

- **用紙サイズ**: A4 (11906 × 16838 DXA)
- **余白**: 上1418・下1418・左1701・右1701 DXA（約25mm）
- **フォント**: `BIZ UDPゴシック`（日本語）、英数字も同じ

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
| Luvinaレッド（ヘッダーアクセント・ヘッダー文字） | `C8102E` |
| 見出しH3（ダークブルー） | `1F4D78` |
| 見出しH4/H5（ミッドブルー） | `2E74B5` |
| テーブル罫線 | `CCCCCC` |
| メタテーブル左列背景 | `F5F5F5` |
| フッター文字・薄グレー | `666666` |
| ヘッダー右テキスト（グレー） | `888888` |

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
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } }
    },
    {
      id: "Subtitle", name: "Subtitle", basedOn: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 24 },  // 12pt
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 } }
    },
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 32, bold: true },  // 16pt
      paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 }
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 24, bold: true },  // 12pt
      paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 }
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 22, bold: true, color: "1F4D78" },
      paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 2 }
    },
  ]
}
```

---

## ヘッダー

- 左側: ドキュメントタイトル（**赤字 `C8102E`、BIZ UDPゴシック、太字、26pt**）
- 右側: 日付/会議名（グレー `888888`、18pt）タブ区切り右寄せ
- 下罫線: Lubinaレッド `C8102E`、sz=8

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

```javascript
const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
      spacing: { before: 80 },
      children: [
        new TextRun({ text: "Luvina Software JSC.  |  Confidential  |  p.", color: "666666", size: 16, font: "BIZ UDPゴシック" }),
        new TextRun({ children: [new PageNumber(PageNumberFormat.DECIMAL)], color: "666666", size: 16, font: "BIZ UDPゴシック" })
      ]
    })
  ]
});
```

---

## ドキュメント構成（標準レイアウト）

### 1. タイトルページ要素

```
[タイトル行]          ← Style: Title, 28pt, 中央, スペース区切り文字列（例: 「改　修　指　示　書」）
[サブタイトル行]      ← Style: Subtitle, 12pt, 中央（例: 「2026/03/03 定例打合せ 改修内容」）
[空行 × 数行]
[メタ情報テーブル]    ← 2列, 幅6000 DXA, 中央, 詳細後述
[空行]
[改廃履歴テーブル]   ← 4列, 詳細後述
```

### 2. メタ情報テーブル（表紙）

- 幅: 6000 DXA、中央配置
- 左列: 幅 2000 DXA、背景 `F5F5F5`
- 右列: 幅 4000 DXA
- 全セル罫線: `CCCCCC`
- セルマージン: top/bottom 60, left/right 100

**標準行**: プロジェクト / 対象企業 / 作成日 / 作成者 / バージョン / 承認者

```javascript
function makeMetaTable(rows) {
  // rows: [{label: "プロジェクト", value: "KASUMI ギフトカード..."}, ...]
  const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

  return new Table({
    width: { size: 6000, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    rows: rows.map(r => new TableRow({
      children: [
        new TableCell({
          width: { size: 2000, type: WidthType.DXA }, borders,
          shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: r.label, font: "BIZ UDPゴシック", size: 22 })] })]
        }),
        new TableCell({
          width: { size: 4000, type: WidthType.DXA }, borders,
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: r.value, font: "BIZ UDPゴシック", size: 22 })] })]
        })
      ]
    }))
  });
}
```

### 3. 改廃履歴テーブル

列構成: `版 | 改訂日 | 改訂者 | 改訂内容`  
列幅(DXA): `800 | 1600 | 2000 | 4600` (計 9000 DXA = コンテンツ幅)  
ヘッダー行背景: `F5F5F5`

### 4. 本文セクション構造

```
# 1. 概要                    ← Heading 1
  [概要テキスト]
  [改修一覧テーブル]         ← 列: No. / 改修タイトル / 概要 / 工数 / リスク

# No.XX タイトル             ← Heading 1

## ■ 対象ファイル            ← Heading 2（箇条書きリスト）

## ■ 改修内容               ← Heading 2（箇条書きリスト）

## ■ [コードセクション名]   ← Heading 2 または Heading 3

  [コード差分テーブル]       ← 2列並置: ▼ 変更前 (Before) | ▲ 変更後 (After)

## ■ テスト手順・報告        ← Heading 2

  [テスト表]                 ← 列: No. / テスト手順 / 期待結果 / 結果（OK/NG）

  → 全テスト完了後、結果欄を記入して Thanh Nguyên へ提出すること。

# 2. 報告方法                ← Heading 1
  [箇条書き]
```

---

## コード差分テーブル（Before/After）

- 2列均等: 各 4500 DXA（合計 9000 DXA）
- ヘッダー行: `▼ 変更前 (Before)` / `▲ 変更後 (After)` を背景 `F5F5F5`
- コードは等幅フォント（`Consolas`）で表示、グレー罫線

```javascript
function makeCodeDiffTable(beforeCode, afterCode) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const margins = { top: 80, bottom: 80, left: 120, right: 120 };
  const colWidth = 4500;

  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA }, borders,
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, margins,
        children: [new Paragraph({ children: [new TextRun({ text: "▼ 変更前 (Before)", bold: true, font: "BIZ UDPゴシック", size: 20 })] })]
      }),
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA }, borders,
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, margins,
        children: [new Paragraph({ children: [new TextRun({ text: "▲ 変更後 (After)", bold: true, font: "BIZ UDPゴシック", size: 20 })] })]
      })
    ]
  });

  // コード行を複数パラグラフに分割
  const makeCells = (code) => {
    const lines = code.split("\n");
    return new TableCell({
      width: { size: colWidth, type: WidthType.DXA }, borders, margins,
      children: lines.map(line => new Paragraph({
        children: [new TextRun({ text: line, font: "Consolas", size: 18 })]
      }))
    });
  };

  const codeRow = new TableRow({
    children: [ makeCells(beforeCode), makeCells(afterCode) ]
  });

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [colWidth, colWidth],
    rows: [headerRow, codeRow]
  });
}
```

---

## テスト手順表

列構成: `No. | テスト手順・確認内容 | 期待結果 | 結果（OK/NG）`  
列幅(DXA): `600 | 4800 | 2400 | 1200`（計 9000 DXA）  
ヘッダー行背景: `D6E4F0`（薄水色）  
結果列: 空欄（記入欄）

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
2. `npm install -g docx` を確認
3. 上記フォーマットに従ってJavaScriptで生成スクリプトを作成
4. スクリプトを実行: `node generate.js`
5. 検証: `python scripts/office/validate.py output.docx`
6. `/mnt/user-data/outputs/` に配置

---

## サンプルテンプレート

`assets/template_sample.docx` に参考用サンプルを収録（改修指示書の実例）。
構造確認のため参照可能。


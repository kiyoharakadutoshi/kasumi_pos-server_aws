---
name: luvina-sekkei-sho
description: >
  LuvinaソフトウェアのWordフォーマット設計書（改修指示書・仕様書・設計書）を作成するスキル。
  Luvina固有のデザイン（赤ヘッダー C8102E、BIZ UDPゴシックフォント、メタ情報テーブル、■改廃履歴、コードdiffテーブル、テスト手順表）を忠実に再現する。
  以下のキーワードや状況で**必ず**このスキルを使用すること：
  - 「設計書」「改修指示書」「仕様書」「指示書」「作業指示」をWordで作成する
  - 「Luvinaフォーマット」「Luvinaの設計書テンプレート」
  - 「改廃履歴」「対象ファイル」「改修内容」「テスト手順・報告」セクションを含む文書
  - Luvina / Kasumi / AFS / Kitamura プロジェクト向けの技術ドキュメント（Word）
---

# Luvina 設計書 Word作成スキル

## 概要

`docx` npm パッケージを使って JavaScript で生成します。

**必ず docx スキルも参照すること**: `/mnt/skills/public/docx/SKILL.md`

---

## ⚠️ 重要な既知の注意点

### コンテンツ幅は 8504 DXA
A4（11906）からマージン左右（1701×2）を引いた値。**9000 DXA ではない**。
全テーブル幅・ヘッダーのタブストップ位置を必ず 8504 に合わせること。

### PageBreak は独立パラグラフに置かない
独立 `new Paragraph({ children: [new PageBreak()] })` は1行分の余白が残る。
**Heading1 スタイルに `pageBreakBefore: true` を設定**して代替すること。

### フッターのページ番号フォント
`SimpleField("PAGE")` は TextRun のフォント指定を引き継がない。
生成後に **unpack → footer XML 直接編集 → repack** してフォントを統一する。

```
python scripts/office/unpack.py output.docx unpacked/
# footer1.xml の <w:fldSimple w:instr="PAGE"/> を以下に置換:
# <w:fldSimple w:instr="PAGE">
#   <w:r><w:rPr>
#     <w:rFonts w:ascii="BIZ UDPゴシック" w:cs="BIZ UDPゴシック"
#               w:eastAsia="BIZ UDPゴシック" w:hAnsi="BIZ UDPゴシック"/>
#     <w:color w:val="666666"/><w:sz w:val="16"/><w:szCs w:val="16"/>
#   </w:rPr><w:t>1</w:t></w:r>
# </w:fldSimple>
python scripts/office/pack.py unpacked/ output.docx --original output.docx
```

### Heading1スタイルとh1()のsize値を必ず一致させる
スタイル定義の `run.size` とヘルパー関数内の TextRun `size` がずれると
セクションによってフォントサイズが異なって表示される。常に両方を同じ値にすること。

---

## ページ設定

- **用紙サイズ**: A4 (11906 × 16838 DXA)
- **余白**: 上1418・下1418・左1701・右1701 DXA
- **コンテンツ幅**: `11906 - 1701×2 = 8504 DXA`
- **フォント**: `BIZ UDPゴシック`（日本語・英数字共通）

---

## カラーパレット

| 用途 | カラーコード |
|------|-------------|
| Luvinaレッド（ヘッダー文字・下罫線） | `C8102E` |
| H1下罫線（薄赤） | `E8A0A8` |
| テーブル罫線 | `CCCCCC` |
| メタテーブル左列 / テーブルヘッダー背景 | `F5F5F5` |
| テスト手順表ヘッダー背景（薄水色） | `D6E4F0` |
| フッター文字 | `666666` |
| ヘッダー右テキスト | `888888` |
| 改廃履歴1.0注釈（未承認グレー） | `AAAAAA` |

---

## フォントサイズ一覧

| 要素 | pt | docx size値 |
|------|-----|------------|
| 表紙タイトル・サブタイトル | 16pt | 32 |
| Heading 1 | 12pt | 24 |
| Heading 2 | 9pt | 18 |
| 本文・箇条書き・テーブルセル | 9pt | 18 |
| ヘッダー左（赤字） | 13pt | 26 |
| ヘッダー右（グレー） | 9pt | 18 |
| フッター | 8pt | 16 |

---

## スタイル定義

```javascript
styles: {
  default: {
    document: { run: { font: "BIZ UDPゴシック", size: 18 } }  // 9pt
  },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 24, bold: true },  // 12pt
      paragraph: {
        spacing: { before: 0, after: 120 },
        outlineLevel: 0,
        pageBreakBefore: true,  // H1は常にページ先頭
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "E8A0A8", space: 4 } }
      }
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: "BIZ UDPゴシック", size: 18, bold: true },  // 9pt
      paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 1 }
    },
  ]
}
```

---

## ヘッダー

タブストップ position は **8504**（コンテンツ幅と一致させること）。

```javascript
const header = new Header({
  children: [
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "C8102E", space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: 8504 }],
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "プロジェクト名  設計書タイトル",
          font: "BIZ UDPゴシック", bold: true, color: "C8102E", size: 26 }),
        new TextRun({ text: "\t日付 定例会",
          font: "BIZ UDPゴシック", color: "888888", size: 18 })
      ]
    })
  ]
});
```

---

## フッター

```javascript
const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
      spacing: { before: 80 },
      children: [
        new TextRun({ text: "Luvina Software JSC.  |  Confidential  |  p. ",
          color: "666666", size: 16, font: "BIZ UDPゴシック" }),
        new SimpleField("PAGE")
        // ⚠️ PageNumberFormat.DECIMAL は docx v9.x で使用不可
        // ⚠️ フォント統一には生成後の XML 直接編集が必要（冒頭参照）
      ]
    })
  ]
});
```

---

## 表紙レイアウト

コンテンツ高 ≒ 14000 DXA として配置計算：

```
サブタイトル（日付・会議名）  spacing.before: 4800  → 上から約35%（中央よりやや上）
タイトル（改修指示書）        spacing.before: 120
スペーサー                    spacing.before: 3533  → 下1/3開始（上から約66%）
メタ情報テーブル              幅6000 DXA、中央
Luvinaロゴ                    spacing.before: 200、180×90px、中央
```

```javascript
const logoData = fs.readFileSync('/mnt/skills/user/luvina-ppt/assets/luvina_logo.png');

new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 4800, after: 120 },
  children: [new TextRun({ text: "YYYY/MM/DD 定例打合せ 改修内容",
    font: "BIZ UDPゴシック", size: 32, bold: true })]
}),
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 120 },
  children: [new TextRun({ text: "改　修　指　示　書",
    font: "BIZ UDPゴシック", size: 32, bold: true })]
}),
new Paragraph({ children: [new TextRun({ text: "", size: 18 })],
  spacing: { before: 3533, after: 0 } }),
makeMetaTable([...]),
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 0 },
  children: [new ImageRun({ data: logoData,
    transformation: { width: 180, height: 90 }, type: "png" })]
}),
```

---

## ドキュメント構成

```
[1ページ目: 表紙]
  サブタイトル（日付・会議名）
  タイトル（「改　修　指　示　書」等）
  メタ情報テーブル（下1/3）
  Luvinaロゴ（フッター直上）

[2ページ目: ■改廃履歴]  ← H1 pageBreakBefore で自動改ページ
  改廃履歴テーブル

[3ページ目〜: 本文]      ← H1 pageBreakBefore で自動改ページ
  # 1. 概要
    改修一覧テーブル
  # No.XX タイトル
    ## ■ 対象ファイル
    ## ■ 改修内容
    ## ■ [コードセクション]
      コード差分テーブル
    ## ■ テスト手順・報告
      テスト手順表
  # 2. 報告方法
```

---

## メタ情報テーブル

幅 **6000 DXA**（中央配置）、左列2000・右列4000。

```javascript
function makeMetaTable(rows) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
  return new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [2000, 4000],
    alignment: AlignmentType.CENTER,
    rows: rows.map(r => new TableRow({ children: [
      new TableCell({ width: { size: 2000, type: WidthType.DXA }, borders,
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({
          text: r.label, font: "BIZ UDPゴシック", size: 18 })] })] }),
      new TableCell({ width: { size: 4000, type: WidthType.DXA }, borders,
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({
          text: r.value, font: "BIZ UDPゴシック", size: 18 })] })] })
    ]}))
  });
}
```

---

## ■改廃履歴テーブル

- 見出し: `■改廃履歴`（Heading1）
- 版数は **0.1 スタート**
- 1.0 行は顧客承認前は**グレー（AAAAAA）＋イタリック**で「（顧客承認時に設定）」と注釈表示
- 承認後: `gray: false` にして日付・承認者を記入する
- 列幅(DXA): `756 | 1512 | 1890 | 4346`（計 **8504**）

```javascript
const dataRows_def = [
  { ver: "0.1", date: "YYYY/MM/DD", author: "Thanh Nguyên", content: "初版作成", gray: false },
  { ver: "1.0", date: "", author: "", content: "（顧客承認時に設定）", gray: true },
];
// gray:true の行 → color: "AAAAAA", italics: true
```

---

## 本文テーブル列幅（全テーブル幅 = 8504 DXA）

### 改修一覧テーブル
列幅: `851 | 2362 | 3401 | 945 | 945`、ヘッダー背景: `F5F5F5`
列構成: `No. | 改修タイトル | 概要 | 工数 | リスク`

### テスト手順表
列幅: `567 | 4536 | 2268 | 1133`、ヘッダー背景: `D6E4F0`
列構成: `No. | テスト手順・確認内容 | 期待結果 | 結果（OK/NG）`

### コード差分テーブル
列幅: `4252 | 4252`、ヘッダー背景: `F5F5F5`
列構成: `▼ 変更前 (Before) | ▲ 変更後 (After)`
コード: `Consolas` フォント、size: 18

---

## 作成者設定

**重要**: ファイル作成時・更新時の作成者・更新者は必ず **`Thanh Nguyên`** とすること。

---

## 作成手順

1. `docx` スキル (`/mnt/skills/public/docx/SKILL.md`) を読む
2. `npm list -g docx` でインストール確認（なければ `npm install -g docx`）
3. Luvinaロゴをコピー: `cp /mnt/skills/user/luvina-ppt/assets/luvina_logo.png ./`
4. 上記フォーマットに従って JavaScript 生成スクリプトを作成
5. `node generate.js` を実行
6. `python scripts/office/validate.py output.docx` でバリデーション
7. フッターページ番号フォント修正（unpack → XML編集 → repack、冒頭の注意点参照）
8. `/mnt/user-data/outputs/` に配置

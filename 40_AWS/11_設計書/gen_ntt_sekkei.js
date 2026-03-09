'use strict';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, SimpleField, HeadingLevel, TabStopType
} = require('docx');
const fs = require('fs');

const FONT = 'BIZ UDPゴシック';
const RED  = 'C8102E';
const GRAY_H = '888888';
const BORDER_COLOR = 'CCCCCC';
const HEADER_BG = 'F5F5F5';
const TEST_BG  = 'D6E4F0';

const border = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };
const BDRS = { top: border, bottom: border, left: border, right: border };
const CM = { top: 60, bottom: 60, left: 100, right: 100 };

const logoData = fs.readFileSync('/mnt/skills/user/luvina-ppt/assets/luvina_logo.png');

// ---- helpers ----
function tx(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: opts.size || 18,
    bold: opts.bold, color: opts.color, italics: opts.italics });
}
function p(children, opts = {}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [children],
    alignment: opts.align, spacing: opts.spacing || { before: 0, after: 60 } });
}
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT, size: 24, bold: true })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT, size: 18, bold: true })] });
}
function cell(text, width, opts = {}) {
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: opts.fill || 'FFFFFF', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({
      children: [new TextRun({ text: text || '', font: FONT, size: 18,
        bold: opts.bold, color: opts.color, italics: opts.italics })],
      spacing: { before: 0, after: 0 }
    })]
  });
}
function linesCell(lines, width, opts = {}) {
  const arr = typeof lines === 'string' ? lines.split('\n') : lines;
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: opts.fill || 'FFFFFF', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.TOP,
    children: arr.map(l => new Paragraph({
      children: [new TextRun({ text: l, font: FONT, size: opts.size || 18,
        bold: opts.bold, color: opts.color })],
      spacing: { before: 0, after: 0 }
    }))
  });
}
function hdrCell(text, width) {
  return cell(text, width, { fill: HEADER_BG, bold: true });
}
function testHdrCell(text, width) {
  return cell(text, width, { fill: TEST_BG, bold: true });
}
function makeMetaTable(rows) {
  return new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [2000, 4000],
    alignment: AlignmentType.CENTER,
    rows: rows.map(r => new TableRow({ children: [
      cell(r.label, 2000, { fill: HEADER_BG }),
      cell(r.value, 4000)
    ]}))
  });
}

// ---- ヘッダー/フッター ----
const header = new Header({
  children: [new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RED, space: 4 } },
    tabStops: [{ type: TabStopType.RIGHT, position: 8504 }],
    spacing: { after: 100 },
    children: [
      new TextRun({ text: 'カスミPOSプロジェクト  NTT DATA CDSギフトカード送信 設計書',
        font: FONT, bold: true, color: RED, size: 26 }),
      new TextRun({ text: '\t2026/03/10', font: FONT, color: GRAY_H, size: 18 })
    ]
  })]
});
const footer = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR, space: 4 } },
    spacing: { before: 80 },
    children: [
      new TextRun({ text: 'Luvina Software JSC.  |  Confidential  |  p. ',
        color: '666666', size: 16, font: FONT }),
      new SimpleField('PAGE')
    ]
  })]
});

// ---- 改廃履歴テーブル ----
const histRows = [
  { ver: '0.1', date: '2026/03/10', author: 'Thanh Nguyên', content: '初版作成（ソースコード調査に基づく）', gray: false },
  { ver: '1.0', date: '', author: '', content: '（顧客承認時に設定）', gray: true },
];
function histRow(r) {
  const c = r.gray ? 'AAAAAA' : '000000';
  return new TableRow({ children: [
    cell(r.ver, 756, { color: c, italics: r.gray }),
    cell(r.date, 1512, { color: c, italics: r.gray }),
    cell(r.author, 1890, { color: c, italics: r.gray }),
    cell(r.content, 4346, { color: c, italics: r.gray }),
  ]});
}

// ---- コードブロック用セル ----
function codeCell(text, width) {
  const lines = text.split('\n');
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: 'FAFAFA', type: ShadingType.CLEAR },
    children: lines.map(l => new Paragraph({
      children: [new TextRun({ text: l, font: 'Consolas', size: 16 })],
      spacing: { before: 0, after: 0 }
    }))
  });
}

// ---- 本文 ----
const sections_children = [
  // ===== 表紙 =====
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 4800, after: 80 },
    children: [tx('カスミPOSプロジェクト  設計書', { size: 32, bold: true, color: RED })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [tx('NTT DATA CDSギフトカード決済ファイル送信 設計書', { size: 32, bold: true })]
  }),
  new Paragraph({ children: [tx('')], spacing: { before: 2400, after: 0 } }),
  makeMetaTable([
    { label: 'プロジェクト名', value: 'カスミPOSシステム' },
    { label: 'ドキュメントNo', value: 'KSM-AWS-DS-001' },
    { label: '版数', value: '0.1' },
    { label: '作成者', value: 'Thanh Nguyên' },
    { label: '作成日', value: '2026/03/10' },
    { label: '承認者', value: '' },
    { label: '対象環境', value: 'PRD（AWS ap-northeast-1）' },
  ]),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1400, after: 0 },
    children: [new ImageRun({ data: logoData, transformation: { width: 90, height: 45 }, type: 'png' })]
  }),

  // ===== ■改廃履歴 =====
  h1('■改廃履歴'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [756, 1512, 1890, 4346],
    rows: [
      new TableRow({ children: [
        hdrCell('版数', 756), hdrCell('更新日', 1512),
        hdrCell('作成者', 1890), hdrCell('更新内容', 4346)
      ]}),
      ...histRows.map(histRow)
    ]
  }),

  // ===== 1. 概要 =====
  h1('1. 概要'),
  p(tx('本設計書は、カスミPOSシステムにおけるギフトカード決済データをNTT DATA CDSセンターへSFTP送信する処理の詳細設計を記述する。送信対象はEC2 giftcardサーバー（Windows Server 2022）上で動作するSpring Bootアプリケーション（aeongiftcardserver-product）が生成するEBCDICフォーマットファイルである。')),

  h2('1.1 システム構成概要'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2126, 6378],
    rows: [
      new TableRow({ children: [hdrCell('項目', 2126), hdrCell('内容', 6378)] }),
      new TableRow({ children: [cell('送信元サーバー', 2126), cell('EC2 giftcard (i-03d6bf91c19385cdf) / Windows Server 2022 Datacenter / t2.large', 6378)] }),
      new TableRow({ children: [cell('アプリ配置先', 2126), cell('C:\\gift\\', 6378)] }),
      new TableRow({ children: [cell('アプリフレームワーク', 2126), cell('Spring Boot (Java) / port 8080', 6378)] }),
      new TableRow({ children: [cell('処理方式', 2126), cell('Spring @Scheduled cron / 毎日 JST 09:00 自動実行', 6378)] }),
      new TableRow({ children: [cell('送信先', 2126), cell('NTT DATA CDSセンター / 210.144.93.17:22 (SFTP)', 6378)] }),
      new TableRow({ children: [cell('試験送信先', 2126), cell('210.144.93.18:22 (SFTP)', 6378)] }),
      new TableRow({ children: [cell('通信経路', 2126), cell('EC2 → NAT GW (57.182.174.110) → インターネット → NTT DATA CDS', 6378)] }),
      new TableRow({ children: [cell('認証方式', 2126), cell('SSH公開鍵認証 (JSch / StrictHostKeyChecking=no)', 6378)] }),
      new TableRow({ children: [cell('秘密鍵パス', 2126), cell('C:\\gift\\sftp-key\\key（EC2ローカル保存）', 6378)] }),
      new TableRow({ children: [cell('SFTPユーザー名', 2126), cell('80510048 (application.yml: sftp.gift.username)', 6378)] }),
      new TableRow({ children: [cell('リモートパス', 2126), cell('put/ (application.yml: sftp.gift.remote-path)', 6378)] }),
      new TableRow({ children: [cell('DB（決済履歴）', 2126), cell('Aurora MySQL / prd/Batch_Kasumi: Batch_Kasumiスキーマ (settlement_history)', 6378)] }),
      new TableRow({ children: [cell('DB認証情報', 2126), cell('Secrets Manager: prd/Batch_Kasumi (HOST / PORT / DB_NAME / USER_NAME / PASSWORD)', 6378)] }),
      new TableRow({ children: [cell('一時ファイル保存先', 2126), cell('C:\\gift\\settlement\\ (application.yml: settlement.batch.folder-temp)', 6378)] }),
      new TableRow({ children: [cell('ファイルサイズ上限', 2126), cell('2GB / ファイルあたり（超過時は自動分割）', 6378)] }),
      new TableRow({ children: [cell('バッファサイズ', 2126), cell('100KB（超過時に自動フラッシュ）', 6378)] }),
      new TableRow({ children: [cell('DBバッチサイズ', 2126), cell('500件 / クエリ', 6378)] }),
    ]
  }),

  // ===== 2. 処理フロー =====
  h1('2. 処理フロー詳細'),

  h2('2.1 全体フロー'),
  p(tx('以下の順序でギフトカード決済ファイルを生成・送信する。')),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [567, 6804, 1133],
    rows: [
      new TableRow({ children: [hdrCell('Step', 567), hdrCell('処理内容', 6804), hdrCell('クラス/メソッド', 1133)] }),
      new TableRow({ children: [cell('1', 567), linesCell('Spring @Scheduled cron "0 0 9 * * ?" で毎日09:00に起動\nwaitUntilExactTime() で正確な09:00まで待機（最大60秒）', 6804), cell('SettlementJobRunner\n.runSendDataSettlement()', 1133)] }),
      new TableRow({ children: [cell('2', 567), linesCell('settlement_history テーブルから前回決済日時（startDateTime）を取得\n対象期間: startDateTime ～ 当日09:00 (endDateTime)', 6804), cell('SettlementHistoryRepository\n.getLastSettlementTime()', 1133)] }),
      new TableRow({ children: [cell('3', 567), linesCell('C:\\gift\\settlement\\{companyCode}\\{yyMMdd}\\ フォルダを作成\nEBCDICファイル Context を初期化（FileOutputStream）', 6804), cell('SettlementService\n.sendFileSettlement()', 1133)] }),
      new TableRow({ children: [cell('4', 567), linesCell('DB から 500件ずつバッチ取得 (transactionJdbcRepository.getTransactionSettlement())\n各トランザクションを EBCDIC 変換して一時ファイルに書き込み\n2GBに達した場合は新ファイルに自動分割', 6804), cell('SettlementService\n.exportFile()', 1133)] }),
      new TableRow({ children: [cell('5', 567), linesCell('ファイル末尾に Trailer レコード（8） + End レコード（9）を書き込み\n100KBバッファを flush して FileOutputStream をクローズ', 6804), cell('writeTrailer()\nwriteEnd()\nflushToFile()', 1133)] }),
      new TableRow({ children: [cell('6', 567), linesCell('C:\\gift\\settlement\\{companyCode}\\{yyMMdd}\\ フォルダ内の全ファイルをイテレート\n空ファイルはスキップ (STATUS_NOT_SEND_FILE)\n非空ファイルを SftpService.upload() で送信', 6804), cell('SettlementService\n.pushFileSftp()', 1133)] }),
      new TableRow({ children: [cell('7', 567), linesCell('JSch で NTT DATA CDS (210.144.93.17:22) にSFTP接続\n一時ファイル名 "dummy_{filename}" でアップロード後、rename で正式名に変更\nStrictHostKeyChecking=no / UserKnownHostsFile=/dev/null', 6804), cell('SftpService\n.upload()', 1133)] }),
      new TableRow({ children: [cell('8', 567), linesCell('settlement_history テーブルに結果を保存\nSTATUS: 0=成功 / 1=エラー / 2=空ファイルのためスキップ', 6804), cell('saveSettlementHistory()', 1133)] }),
    ]
  }),

  // ===== 3. ファイルフォーマット =====
  h1('3. 送信ファイルフォーマット（EBCDIC）'),

  h2('3.1 ファイル命名規則'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2126, 6378],
    rows: [
      new TableRow({ children: [hdrCell('項目', 2126), hdrCell('値', 6378)] }),
      new TableRow({ children: [cell('ファイル名', 2126), cell('6301900000_____000{XX}（XXは2桁連番: 01, 02, ...）', 6378)] }),
      new TableRow({ children: [cell('格納パス', 2126), cell('C:\\gift\\settlement\\100\\{yyMMdd}\\6301900000_____000{XX}', 6378)] }),
      new TableRow({ children: [cell('エンコード', 2126), cell('EBCDIC（カスタム変換テーブル: EbcdicConverterUtils）', 6378)] }),
      new TableRow({ children: [cell('レコード長', 2126), cell('120バイト固定長', 6378)] }),
      new TableRow({ children: [cell('会社コード', 2126), cell('100（KASUMI_COMPANY_CODE）', 6378)] }),
      new TableRow({ children: [cell('与信会社コード', 2126), cell('63046（5桁EBCDIC）', 6378)] }),
    ]
  }),

  h2('3.2 レコード種別'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [1000, 1500, 6004],
    rows: [
      new TableRow({ children: [hdrCell('種別値', 1000), hdrCell('レコード種別', 1500), hdrCell('説明', 6004)] }),
      new TableRow({ children: [cell('0xF1 (1)', 1000), cell('ヘッダー', 1500), cell('サブファイル（店舗コード+取引種別）の先頭レコード。店舗名・与信日付等を含む', 6004)] }),
      new TableRow({ children: [cell('0xF2 (2)', 1000), cell('データ', 1500), cell('個別トランザクション。ギフトカードコード・売上日・金額・承認番号（末尾6桁）を含む', 6004)] }),
      new TableRow({ children: [cell('0xF8 (8)', 1000), cell('トレーラー', 1500), cell('サブファイルの末尾。件数(6桁)・合計金額(11桁)・税費用(11桁)を含む', 6004)] }),
      new TableRow({ children: [cell('0xF9 (9)', 1000), cell('エンド', 1500), cell('ファイル末尾の終端レコード。120バイトのうち1バイト種別+119バイトパディング(0x40)', 6004)] }),
    ]
  }),

  h2('3.3 ヘッダーレコード構造（120バイト）'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [800, 800, 800, 6104],
    rows: [
      new TableRow({ children: [hdrCell('位置(バイト)', 800), hdrCell('長さ', 800), hdrCell('値/型', 800), hdrCell('内容', 6104)] }),
      new TableRow({ children: [cell('1', 800), cell('1', 800), cell('0xF1', 800), cell('レコード種別 = ヘッダー', 6104)] }),
      new TableRow({ children: [cell('2', 800), cell('1', 800), cell('0xF4', 800), cell('集計レベル', 6104)] }),
      new TableRow({ children: [cell('3-4', 800), cell('2', 800), cell('0xF1 0xF0', 800), cell('取引種別 = "10"', 6104)] }),
      new TableRow({ children: [cell('5', 800), cell('1', 800), cell('EBCDIC数字', 800), cell('取引タイプ（transactionDto.getType()）', 6104)] }),
      new TableRow({ children: [cell('6-12', 800), cell('7', 800), cell('0x40×7', 800), cell('スペースパディング', 6104)] }),
      new TableRow({ children: [cell('13-27', 800), cell('15', 800), cell('EBCDIC文字', 800), cell('支払番号/AEONギフトコード（左詰め15桁）', 6104)] }),
      new TableRow({ children: [cell('28-52', 800), cell('25', 800), cell('EBCDIC文字', 800), cell('店舗名（右詰め25桁）', 6104)] }),
      new TableRow({ children: [cell('53-57', 800), cell('5', 800), cell('EBCDIC数字', 800), cell('与信会社コード = 63046', 6104)] }),
      new TableRow({ children: [cell('58-63', 800), cell('6', 800), cell('EBCDIC yyMMdd', 800), cell('引渡日（決済日）', 6104)] }),
      new TableRow({ children: [cell('64-69', 800), cell('6', 800), cell('EBCDIC yyMMdd', 800), cell('集計日（＝引渡日）', 6104)] }),
      new TableRow({ children: [cell('70-76', 800), cell('7', 800), cell('0x40×7', 800), cell('スペースパディング', 6104)] }),
      new TableRow({ children: [cell('77-82', 800), cell('6', 800), cell('EBCDIC yyMMdd', 800), cell('システム日付（＝引渡日）', 6104)] }),
      new TableRow({ children: [cell('83', 800), cell('1', 800), cell('0xF0 (REAL)', 800), cell('データ区分 = 実データ', 6104)] }),
      new TableRow({ children: [cell('84-120', 800), cell('37', 800), cell('0x40×37', 800), cell('スペースパディング（合計120バイト）', 6104)] }),
    ]
  }),

  h2('3.4 データレコード構造（120バイト）'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [800, 800, 800, 6104],
    rows: [
      new TableRow({ children: [hdrCell('位置(バイト)', 800), hdrCell('長さ', 800), hdrCell('値/型', 800), hdrCell('内容', 6104)] }),
      new TableRow({ children: [cell('1', 800), cell('1', 800), cell('0xF2', 800), cell('レコード種別 = データ', 6104)] }),
      new TableRow({ children: [cell('2', 800), cell('1', 800), cell('0xF4', 800), cell('集計レベル', 6104)] }),
      new TableRow({ children: [cell('3-4', 800), cell('2', 800), cell('0xF1 0xF0', 800), cell('取引種別 = "10"', 6104)] }),
      new TableRow({ children: [cell('5', 800), cell('1', 800), cell('EBCDIC数字', 800), cell('取引タイプ', 6104)] }),
      new TableRow({ children: [cell('6-12', 800), cell('7', 800), cell('0x40×7', 800), cell('スペースパディング', 6104)] }),
      new TableRow({ children: [cell('13-27', 800), cell('15', 800), cell('EBCDIC文字', 800), cell('支払番号/AEONギフトコード（左詰め15桁）', 6104)] }),
      new TableRow({ children: [cell('28-43', 800), cell('16', 800), cell('EBCDIC数字', 800), cell('ギフトカードコード（右詰め16桁）', 6104)] }),
      new TableRow({ children: [cell('44-49', 800), cell('6', 800), cell('EBCDIC yyMMdd', 800), cell('売上日付', 6104)] }),
      new TableRow({ children: [cell('50-56', 800), cell('7', 800), cell('EBCDIC数字', 800), cell('金額（右詰め7桁）', 6104)] }),
      new TableRow({ children: [cell('57-63', 800), cell('7', 800), cell('EBCDIC 0埋め', 800), cell('税費用（7桁）= 0', 6104)] }),
      new TableRow({ children: [cell('64-70', 800), cell('7', 800), cell('EBCDIC数字', 800), cell('合計金額（＝金額）', 6104)] }),
      new TableRow({ children: [cell('71-76', 800), cell('6', 800), cell('EBCDIC数字', 800), cell('承認番号（末尾6桁）', 6104)] }),
      new TableRow({ children: [cell('77-120', 800), cell('44', 800), cell('0x40×44', 800), cell('スペースパディング（合計120バイト）', 6104)] }),
    ]
  }),

  h2('3.5 トレーラーレコード構造（120バイト）'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [800, 800, 800, 6104],
    rows: [
      new TableRow({ children: [hdrCell('位置(バイト)', 800), hdrCell('長さ', 800), hdrCell('値/型', 800), hdrCell('内容', 6104)] }),
      new TableRow({ children: [cell('1', 800), cell('1', 800), cell('0xF8', 800), cell('レコード種別 = トレーラー', 6104)] }),
      new TableRow({ children: [cell('2', 800), cell('1', 800), cell('0xF4', 800), cell('集計レベル', 6104)] }),
      new TableRow({ children: [cell('3-4', 800), cell('2', 800), cell('0xF1 0xF0', 800), cell('取引種別 = "10"', 6104)] }),
      new TableRow({ children: [cell('5', 800), cell('1', 800), cell('EBCDIC数字', 800), cell('取引タイプ', 6104)] }),
      new TableRow({ children: [cell('6-12', 800), cell('7', 800), cell('0x40×7', 800), cell('スペースパディング', 6104)] }),
      new TableRow({ children: [cell('13-27', 800), cell('15', 800), cell('EBCDIC文字', 800), cell('支払番号/AEONギフトコード（左詰め15桁）', 6104)] }),
      new TableRow({ children: [cell('28-33', 800), cell('6', 800), cell('EBCDIC数字', 800), cell('件数（右詰め6桁）', 6104)] }),
      new TableRow({ children: [cell('34-44', 800), cell('11', 800), cell('EBCDIC数字', 800), cell('合計金額（11桁）', 6104)] }),
      new TableRow({ children: [cell('45-55', 800), cell('11', 800), cell('EBCDIC 0埋め', 800), cell('税費用（11桁）= 0', 6104)] }),
      new TableRow({ children: [cell('56-66', 800), cell('11', 800), cell('EBCDIC数字', 800), cell('最終合計金額（＝合計金額）', 6104)] }),
      new TableRow({ children: [cell('67-120', 800), cell('54', 800), cell('0x40×54', 800), cell('スペースパディング（合計120バイト）', 6104)] }),
    ]
  }),

  // ===== 4. 送信ネットワーク =====
  h1('4. ネットワーク・接続仕様'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2126, 6378],
    rows: [
      new TableRow({ children: [hdrCell('項目', 2126), hdrCell('値', 6378)] }),
      new TableRow({ children: [cell('送信元 EC2', 2126), cell('10.238.2.198 (giftcard, VPC Private Subnet 1a)', 6378)] }),
      new TableRow({ children: [cell('NAT Gateway', 2126), cell('57.182.174.110（出口固定IPとして NTT DATA CDS 側に登録）', 6378)] }),
      new TableRow({ children: [cell('送信先（本番）', 2126), cell('210.144.93.17 : TCP 22 (SFTP)', 6378)] }),
      new TableRow({ children: [cell('送信先（試験）', 2126), cell('210.144.93.18 : TCP 22 (SFTP)', 6378)] }),
      new TableRow({ children: [cell('通信プロトコル', 2126), cell('SFTP（SSH公開鍵認証）/ JSch ライブラリ使用', 6378)] }),
      new TableRow({ children: [cell('StrictHostKeyChecking', 2126), cell('no（HostKeyVerification 無効。/dev/null に known_hosts を向ける）', 6378)] }),
      new TableRow({ children: [cell('アップロード方式', 2126), cell('一時ファイル名 "dummy_{filename}" でアップロード → rename で本番ファイル名に変更（アトミック置換）', 6378)] }),
      new TableRow({ children: [cell('EC2セキュリティグループ', 2126), cell('sg-0a9497c846d1be76f (ksm-posprd-vpc-sg-ec2-giftcard)\nEgress: ALL(-1) → 0.0.0.0/0（NTT DATA CDS 送信は通過）', 6378)] }),
      new TableRow({ children: [cell('CloudWatch Logs', 2126), cell('未設定（監視なし） ⚠️ 課題: ログ監視の整備が必要（改修依頼 No.16）', 6378)] }),
    ]
  }),

  // ===== 5. 主要クラス =====
  h1('5. 主要クラス一覧'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2552, 2952, 3000],
    rows: [
      new TableRow({ children: [hdrCell('クラス名', 2552), hdrCell('役割', 2952), hdrCell('依存先', 3000)] }),
      new TableRow({ children: [cell('SettlementJobRunner', 2552), cell('Spring @Scheduled (cron 0 0 9 * * ?) のエントリーポイント', 2952), cell('SettlementService', 3000)] }),
      new TableRow({ children: [cell('SettlementService', 2552), cell('決済ファイル生成・SFTP送信オーケストレーター', 2952), cell('SftpService\nSettlementHistoryRepository\nTransactionJdbcSearch', 3000)] }),
      new TableRow({ children: [cell('SftpService', 2552), cell('JSch を使った SFTP 接続・ファイルアップロード処理', 2952), cell('JCraft JSch', 3000)] }),
      new TableRow({ children: [cell('EbcdicConverterUtils', 2552), cell('文字列・数値を EBCDIC バイト列に変換するユーティリティ', 2952), cell('なし（static）', 3000)] }),
      new TableRow({ children: [cell('SettlementService.Context', 2552), cell('ファイル書き込み状態管理（内部クラス）\nFileOutputStream・バッファ・合計金額・件数を保持', 2952), cell('FileOutputStream', 3000)] }),
      new TableRow({ children: [cell('TransactionJdbcSearch', 2552), cell('Aurora MySQL から決済トランザクションをバッチ取得', 2952), cell('Aurora MySQL (Batch_Kasumi)', 3000)] }),
      new TableRow({ children: [cell('SettlementHistoryRepository', 2552), cell('settlement_history テーブルへの CRUD', 2952), cell('Aurora MySQL (Batch_Kasumi)', 3000)] }),
    ]
  }),

  // ===== 6. 設定値 =====
  h1('6. 設定値（application.yml / 環境変数）'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2552, 2552, 3400],
    rows: [
      new TableRow({ children: [hdrCell('設定キー / 環境変数', 2552), hdrCell('デフォルト値', 2552), hdrCell('本番設定値・備考', 3400)] }),
      new TableRow({ children: [cell('sftp.gift.host\nSFTP_GIFT_HOST', 2552), cell('210.144.93.18', 2552), cell('本番: 210.144.93.17 (EC2環境変数で上書き)', 3400)] }),
      new TableRow({ children: [cell('sftp.gift.port\nSFTP_GIFT_PORT', 2552), cell('22', 2552), cell('TCP 22', 3400)] }),
      new TableRow({ children: [cell('sftp.gift.username\nSFTP_GIFT_USERNAME', 2552), cell('80510048', 2552), cell('NTT DATA CDS 割り当てユーザー', 3400)] }),
      new TableRow({ children: [cell('sftp.gift.private-key-path\nSFTP_GIFT_KEY_PATH', 2552), cell('C:\\gift\\sftp-key\\key', 2552), cell('EC2ローカル保存\n※Secrets Manager: ksm-posprd-sm-sftp の SFTP_PRIVATE_KEY は "test" のまま（未使用・要修正）', 3400)] }),
      new TableRow({ children: [cell('sftp.gift.remote-path\nSFTP_GIFT_REMOTE_PATH', 2552), cell('put/', 2552), cell('NTT DATA CDS 側受信ディレクトリ', 3400)] }),
      new TableRow({ children: [cell('settlement.batch.folder-temp\nSETTLEMENT_BATCH_FOLDER_TEMP', 2552), cell('C:\\gift\\settlement', 2552), cell('一時ファイル生成先', 3400)] }),
      new TableRow({ children: [cell('DB_MASTER_URL', 2552), cell('10.0.4.87:3306/m_ksm', 2552), cell('本番: Secrets Manager prd/Batch_Kasumi で参照', 3400)] }),
      new TableRow({ children: [cell('DB_TRANSACTION_URL', 2552), cell('10.0.4.87:3306/t_ksm', 2552), cell('本番: Secrets Manager prd/Batch_Kasumi で参照', 3400)] }),
    ]
  }),

  // ===== 7. 課題 =====
  h1('7. 現状の課題・改善事項'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [567, 851, 5753, 1333],
    rows: [
      new TableRow({ children: [hdrCell('No', 567), hdrCell('優先度', 851), hdrCell('課題内容', 5753), hdrCell('改修依頼', 1333)] }),
      new TableRow({ children: [cell('1', 567), cell('🔴 高', 851), linesCell('CloudWatch Logs 未設定。EC2 giftcard の Spring Boot アプリログ・バッチ実行ログ・SFTP送信結果が一切 CloudWatch に送信されていない。\n⇒ 障害発生時に調査が不可能な状態。/pos/log/gift/all と /pos/log/gift/error のロググループ作成を推奨。', 5753), cell('No.16', 1333)] }),
      new TableRow({ children: [cell('2', 567), cell('🟡 中', 851), linesCell('Secrets Manager の ksm-posprd-sm-sftp に登録された SFTP_PRIVATE_KEY が "test" のまま。\n実際の秘密鍵は C:\\gift\\sftp-key\\key（EC2 ローカルファイル）に格納されているが、Secrets Manager との整合性がなく、管理・ローテーションが困難。\n⇒ 秘密鍵を Secrets Manager に正式登録し、アプリからSecretsManager経由で読み込む構成への変更を推奨。', 5753), cell('追加要', 1333)] }),
      new TableRow({ children: [cell('3', 567), cell('🟡 中', 851), linesCell('StrictHostKeyChecking=no により、SFTP 接続先の公開鍵検証を行っていない。\nMITM攻撃に対して無防備な状態。\n⇒ NTT DATA CDS から正式なホスト公開鍵を取得し、known_hosts ファイルに登録する対応を推奨。', 5753), cell('追加要', 1333)] }),
      new TableRow({ children: [cell('4', 567), cell('🟢 低', 851), linesCell('エラー時のメール通知が未実装（SettlementService の TODO コメント参照）。\n⇒ Spring Mail または SNS/SES を使ったアラート通知の実装を推奨。', 5753), cell('追加要', 1333)] }),
    ]
  }),

  // ===== 8. テスト手順 =====
  h1('8. 動作確認手順'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [567, 4536, 2268, 1133],
    rows: [
      new TableRow({ children: [testHdrCell('No', 567), testHdrCell('確認内容', 4536), testHdrCell('期待結果', 2268), testHdrCell('結果', 1133)] }),
      new TableRow({ children: [cell('1', 567), linesCell('EC2 giftcard に RDP 接続し、C:\\gift\\ ディレクトリの存在を確認', 4536), linesCell('sftp-key/key ファイルが存在すること', 2268), cell('', 1133)] }),
      new TableRow({ children: [cell('2', 567), linesCell('settlement_history テーブルに直近の実行ログが存在することを確認\nSELECT * FROM settlement_history ORDER BY output_datetime DESC LIMIT 10;', 4536), linesCell('status=0（成功）の行が存在すること', 2268), cell('', 1133)] }),
      new TableRow({ children: [cell('3', 567), linesCell('試験環境 (210.144.93.18) への SFTP 接続テスト\nsftp -i C:\\gift\\sftp-key\\key 80510048@210.144.93.18', 4536), linesCell('パスワードを聞かれず、SFTP シェルに接続できること', 2268), cell('', 1133)] }),
      new TableRow({ children: [cell('4', 567), linesCell('C:\\gift\\settlement\\ 配下に当日日付のフォルダが生成されているか確認\n（例: C:\\gift\\settlement\\100\\260310\\）', 4536), linesCell('毎日 09:00 以降にフォルダが作成されていること', 2268), cell('', 1133)] }),
      new TableRow({ children: [cell('5', 567), linesCell('CloudWatch Logs で giftcard EC2 のログを確認\n（設定後）/pos/log/gift/all / /pos/log/gift/error', 4536), linesCell('"send data settlement started" と "send data settlement end" のログが09:00前後に出力されていること', 2268), cell('', 1133)] }),
    ]
  }),
];

// ---- Document ----
const doc = new Document({
  creator: 'Thanh Nguyên',
  title: 'NTT DATA CDSギフトカード決済ファイル送信 設計書',
  styles: {
    default: { document: { run: { font: FONT, size: 18 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 24, bold: true },
        paragraph: {
          spacing: { before: 0, after: 120 }, outlineLevel: 0, pageBreakBefore: true,
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E8A0A8', space: 4 } }
        }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 18, bold: true },
        paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 1 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1418, bottom: 1418, left: 1701, right: 1701 }
      }
    },
    headers: { default: header },
    footers: { default: footer },
    children: sections_children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/NTT_CDS_ギフト決済送信_設計書.docx', buf);
  console.log('✓ Generated');
});

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
const BC = 'CCCCCC';
const HDR_BG = 'F5F5F5';
const TEST_BG = 'D6E4F0';

const bdr = { style: BorderStyle.SINGLE, size: 4, color: BC };
const BDRS = { top: bdr, bottom: bdr, left: bdr, right: bdr };
const CM = { top: 60, bottom: 60, left: 100, right: 100 };
const logo = fs.readFileSync('/mnt/skills/user/luvina-ppt/assets/luvina_logo.png');

function tx(text, o={}) {
  return new TextRun({ text, font: FONT, size: o.size||18, bold: o.bold,
    color: o.color, italics: o.italics });
}
function p(children, o={}) {
  return new Paragraph({
    children: Array.isArray(children) ? children : [children],
    alignment: o.align,
    spacing: o.spacing || { before: 0, after: 60 }
  });
}
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT, size: 24, bold: true })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT, size: 18, bold: true })] });
}
function cell(text, w, o={}) {
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: o.fill||'FFFFFF', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({
      children: [new TextRun({ text: text||'', font: FONT, size: o.size||18,
        bold: o.bold, color: o.color, italics: o.italics })],
      spacing: { before:0, after:0 }
    })]
  });
}
function linesCell(lines, w, o={}) {
  const arr = typeof lines === 'string' ? lines.split('\n') : lines;
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: o.fill||'FFFFFF', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.TOP,
    children: arr.map(l => new Paragraph({
      children: [new TextRun({ text: l, font: FONT, size: o.size||18,
        bold: o.bold, color: o.color })],
      spacing: { before:0, after:0 }
    }))
  });
}
function hdr(text, w)  { return cell(text, w, { fill: HDR_BG, bold: true }); }
function thdr(text, w) { return cell(text, w, { fill: TEST_BG, bold: true }); }
function codeCell(text, w) {
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: 'F8F8F8', type: ShadingType.CLEAR },
    children: text.split('\n').map(l => new Paragraph({
      children: [new TextRun({ text: l, font: 'Consolas', size: 16 })],
      spacing: { before:0, after:0 }
    }))
  });
}
function metaTable(rows) {
  return new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [2000, 4000],
    alignment: AlignmentType.CENTER,
    rows: rows.map(r => new TableRow({ children: [
      cell(r.label, 2000, { fill: HDR_BG }),
      cell(r.value, 4000)
    ]}))
  });
}
function diffTable(before, after) {
  return new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [4252, 4252],
    rows: [
      new TableRow({ children: [hdr('▼ 変更前 (Before)', 4252), hdr('▲ 変更後 (After)', 4252)] }),
      new TableRow({ children: [codeCell(before, 4252), codeCell(after, 4252)] })
    ]
  });
}

// ---- ヘッダー・フッター ----
const header = new Header({ children: [new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RED, space: 4 } },
  tabStops: [{ type: TabStopType.RIGHT, position: 8504 }],
  spacing: { after: 100 },
  children: [
    new TextRun({ text: 'カスミPOSプロジェクト  AWS 改修指示書', font: FONT, bold: true, color: RED, size: 26 }),
    new TextRun({ text: '\t2026/03/10', font: FONT, color: GRAY_H, size: 18 })
  ]
})]});
const footer = new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: BC, space: 4 } },
  spacing: { before: 80 },
  children: [
    new TextRun({ text: 'Luvina Software JSC.  |  Confidential  |  p. ', color: '666666', size: 16, font: FONT }),
    new SimpleField('PAGE')
  ]
})]});

// ---- 改廃履歴 ----
const histData = [
  { ver:'0.1', date:'2026/03/10', author:'Thanh Nguyên',
    content:'初版作成（S3バックアップ・settlement_history s3_key保存・LOG参照API）', gray:false },
  { ver:'0.2', date:'2026/03/10', author:'Thanh Nguyên',
    content:'A案追加: S3にCSVも保存（人間可読形式）\nB案追加: 送信トランザクション詳細参照API', gray:false },
  { ver:'1.0', date:'', author:'', content:'（顧客承認時に設定）', gray:true },
];

// ============================================================
const body = [

  // ===== 表紙 =====
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 4800, after: 80 },
    children: [tx('カスミPOSプロジェクト  AWS 改修指示書', { size:32, bold:true, color:RED })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [tx('2026/03/10  ギフト決済送信 S3保存・DB取り込み・LOG参照・CSV出力', { size:32, bold:true })]
  }),
  new Paragraph({ children:[tx('')], spacing:{ before:2400, after:0 } }),
  metaTable([
    { label:'プロジェクト名',   value:'カスミPOSシステム' },
    { label:'ドキュメントNo',   value:'KSM-AWS-CR-017' },
    { label:'版数',            value:'0.2' },
    { label:'作成者',          value:'Thanh Nguyên' },
    { label:'作成日',          value:'2026/03/10' },
    { label:'承認者',          value:'' },
    { label:'対象リポジトリ',   value:'aeongiftcardserver-product' },
    { label:'対象環境',        value:'PRD / STG 共通' },
  ]),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800, after: 0 },
    children: [new ImageRun({ data: logo, transformation:{ width:90, height:45 }, type:'png' })]
  }),

  // ===== ■改廃履歴 =====
  h1('■改廃履歴'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [756, 1512, 1890, 4346],
    rows: [
      new TableRow({ children: [hdr('版数',756), hdr('更新日',1512), hdr('作成者',1890), hdr('更新内容',4346)] }),
      ...histData.map(r => new TableRow({ children: [
        cell(r.ver,  756,  { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
        cell(r.date, 1512, { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
        cell(r.author, 1890, { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
        linesCell(r.content, 4346, { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
      ]}))
    ]
  }),

  // ===== 1. 概要 =====
  h1('1. 概要'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [851, 2362, 3401, 945, 945],
    rows: [
      new TableRow({ children: [hdr('No.',851), hdr('改修タイトル',2362), hdr('概要',3401), hdr('工数',945), hdr('リスク',945)] }),
      new TableRow({ children: [
        cell('17', 851),
        linesCell('ギフト決済送信ファイル\nS3保存・DB取り込み・LOG参照\nCSV出力・詳細API', 2362),
        linesCell(
          '① SFTP送信完了後にEBCDICファイルをS3にバックアップ\n' +
          '② settlement_historyにS3キーを保存\n' +
          '③ 送信履歴一覧APIを追加（LOG参照）\n' +
          '④ 人間可読CSVをS3に同時保存（A案）\n' +
          '⑤ 送信トランザクション詳細参照APIを追加（B案）',
          3401),
        cell('3.0d', 945),
        cell('低', 945),
      ]}),
    ]
  }),
  p(tx('※ 0.1版で定義した①②③は変更なし。0.2版で④⑤を追加する。')),

  // ===== No.17 =====
  h1('No.17  ギフト決済送信ファイル S3保存・DB取り込み・LOG参照・CSV出力・詳細API'),

  h2('■ 背景・目的（0.2追記）'),
  p(tx('0.1版でS3バックアップ・LOG参照APIを実装したが、S3上のファイルはEBCDICバイナリのままであり、人間が直接内容を確認することができない。本0.2版では以下を追加する。')),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2126, 6378],
    rows: [
      new TableRow({ children: [hdr('追加項目',2126), hdr('内容',6378)] }),
      new TableRow({ children: [
        cell('④ A案: CSV同時保存', 2126),
        linesCell(
          'SFTP送信成功後、同一トランザクションデータをCSV形式でS3にも保存する。\n' +
          'ファイル名: 同名.csv（例: 6301900000_____00001.csv）\n' +
          'S3パス: settlement/{yyMMdd}/6301900000_____00001.csv\n' +
          'カラム: 支払番号, 取引種別, 店舗名, ギフトカードコード, 売上日時, 金額, 承認番号\n' +
          'エンコード: UTF-8。Excelで直接開ける形式（BOM付き）。',
          6378)
      ]}),
      new TableRow({ children: [
        cell('⑤ B案: 詳細参照API', 2126),
        linesCell(
          'GET /api/v1/app/settlement-history/records?from=xxx&to=xxx で\n' +
          '指定期間の送信トランザクションデータをJSON形式で返す。\n' +
          'DBの transaction テーブルから同期間のデータを再クエリする方式で実装する。\n' +
          '（S3のEBCDICファイルを逆変換するより確実・高速）\n' +
          'レスポンス: 店舗コード/店舗名/ギフトカードコード/売上日時/金額/種別/承認番号',
          6378)
      ]}),
    ]
  }),

  h2('■ 対象ファイル（0.2追加分）'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2126, 6378],
    rows: [
      new TableRow({ children: [hdr('種別',2126), hdr('ファイルパス',6378)] }),
      new TableRow({ children: [cell('修正',2126), linesCell('（0.1版と同じ）\nsrc/main/java/.../service/SettlementService.java', 6378)] }),
      new TableRow({ children: [cell('新規',2126), cell('src/main/java/.../dto/app/SettlementRecordDto.java', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../service/SettlementHistoryService.java', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../controller/app/SettlementHistoryController.java', 6378)] }),
    ]
  }),

  // ===== 0.1版の改修内容（既存） =====
  h2('■ 改修内容（0.1版: ①②③）'),
  p(tx('0.1版の改修内容（①S3バックアップ / ②settlement_history.s3_key保存 / ③LOG参照API）は変更なし。以下に0.2版追加分のみ記述する。')),

  // ===== 0.2版 A案 =====
  h2('■ 改修内容（0.2版 追加: ④ A案 — CSV同時保存）'),

  h2('④-a SettlementService.java — generateCsvLines() メソッド追加'),
  p(tx('transactionList（既に DB から取得済み）を CSV 行に変換するプライベートメソッドを追加する。SFTP 送信ループの外で呼び出すため、Context.finish() 後に transactionList 全体を保持するフィールドも追加する。')),
  p(tx('実装方針: pushFileSftp() の前に exportFile() 結果として得た全トランザクションリストをフィールドに保持しておき、S3アップロード時にCSVも一緒に生成する。'), { spacing:{ before:0, after:80 } }),

  diffTable(
`// (メソッド追加 — SettlementService 末尾)`,
`/**
 * トランザクションリストをCSV行に変換する。
 * エンコード: UTF-8 BOM付き（Excel直接開放対応）
 * カラム: 支払番号,種別,店舗名,ギフトカードコード,
 *         売上日時,金額,承認番号
 */
private byte[] generateCsvBytes(
        List<TransactionDataDto> list) {
    StringBuilder sb = new StringBuilder();
    // BOM
    sb.append("\uFEFF");
    // ヘッダー行
    sb.append("支払番号,取引種別,店舗名,")
      .append("ギフトカードコード,売上日時,")
      .append("金額,承認番号\n");
    // データ行
    for (TransactionDataDto t : list) {
        String type = switch (t.getType()) {
            case 1 -> "利用";
            case 2 -> "払戻";
            default -> String.valueOf(t.getType());
        };
        sb.append(csvEscape(
              t.getCodePayNoAeongift())).append(",")
          .append(type).append(",")
          .append(csvEscape(t.getStoreName()))
              .append(",")
          .append(csvEscape(t.getGiftCardCode()))
              .append(",")
          .append(t.getTransactionDt()).append(",")
          .append(t.getAmount()).append(",")
          .append(csvEscape(t.getApprovalNumber()))
          .append("\n");
    }
    return sb.toString()
             .getBytes(java.nio.charset.StandardCharsets.UTF_8);
}

private String csvEscape(String val) {
    if (val == null) return "";
    if (val.contains(",") || val.contains("\"")
            || val.contains("\n")) {
        return "\"" + val.replace("\"","\"\"") + "\"";
    }
    return val;
}`
  ),

  h2('④-b SettlementService.java — pushFileSftp() でCSV生成・S3アップロード追加'),
  p(tx('sendFileSettlement() で全トランザクションを収集し、pushFileSftp() に渡す。S3アップロード直後にCSVを生成してS3に保存する。')),

  diffTable(
`// sendFileSettlement() 内
Map<String, Integer> result;
try (Context context = new Context(pathFile, endDateTime)) {
    exportFile(startDateTime, endDateTime, context);
    result = context.finish();
}
pushFileSftp(endDateTime, result);`,
`// sendFileSettlement() 内
// ① 全トランザクションを収集
List<TransactionDataDto> allTransactions =
    new ArrayList<>();

Map<String, Integer> result;
try (Context context = new Context(pathFile, endDateTime)) {
    exportFile(startDateTime, endDateTime,
               context, allTransactions); // 引数追加
    result = context.finish();
}
pushFileSftp(endDateTime, result, allTransactions); // 追加`
  ),

  diffTable(
`private void pushFileSftp(
    LocalDateTime endDateTime,
    Map<String, Integer> result) {
    ...
    try {
        sftpService.upload(file.getName(), file);
        s3Key = s3SettlementPath + "/" + time
              + "/" + file.getName();
        s3Service.uploadFile(s3Key, file);
        saveSettlementHistory(...);
    } catch ...`,
`private void pushFileSftp(
    LocalDateTime endDateTime,
    Map<String, Integer> result,
    List<TransactionDataDto> allTransactions) { // 追加
    ...
    try {
        sftpService.upload(file.getName(), file);
        // S3: EBCDICバックアップ
        s3Key = s3SettlementPath + "/" + time
              + "/" + file.getName();
        s3Service.uploadFile(s3Key, file);
        // S3: CSV保存（A案追加）
        String csvKey = s3SettlementPath + "/" + time
              + "/" + file.getName() + ".csv";
        byte[] csvBytes =
            generateCsvBytes(allTransactions);
        s3Service.uploadBytes(csvKey, csvBytes,
            "text/csv; charset=UTF-8");
        log.info("CSV saved to S3: {}", csvKey);
        saveSettlementHistory(...);
    } catch ...`
  ),

  h2('④-c S3Service.java — uploadBytes() メソッド追加'),
  p(tx('byte[] を直接アップロードするメソッドを追加する（CSVはFileオブジェクトを作らずメモリから送信）。')),
  diffTable(
`// (追加: uploadFile の直後)`,
`/**
 * byte配列を S3 にアップロードする。
 * @param key         S3 オブジェクトキー
 * @param data        アップロードデータ
 * @param contentType Content-Type（例: "text/csv; charset=UTF-8"）
 */
public void uploadBytes(String key,
        byte[] data, String contentType) {
    try {
        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();
        s3Client.putObject(putReq,
            RequestBody.fromBytes(data));
        log.info("Uploaded bytes to S3: s3://{}/{}",
            bucketName, key);
    } catch (Exception e) {
        throw new S3OperationException(
                CommonConstants.OperationType.UPLOAD_FILE,
                "Failed to upload bytes to S3: " + key, e);
    }
}`
  ),

  // ===== 0.2版 B案 =====
  h2('■ 改修内容（0.2版 追加: ⑤ B案 — 送信トランザクション詳細参照API）'),

  h2('⑤-a SettlementRecordDto.java — 新規作成'),
  p(tx('パッケージ: com.luvina.pos.provider.dto.app')),
  diffTable(
`// (新規ファイル)`,
`package com.luvina.pos.provider.dto.app;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 送信トランザクション1件分のDTO。
 * GET /api/v1/app/settlement-history/records
 * のレスポンス要素。
 */
@Data
public class SettlementRecordDto {
    private String        codePayNoAeongift; // 支払番号
    private Integer       type;             // 取引種別コード
    private String        typeLabel;        // 利用 / 払戻
    private String        storeName;        // 店舗名
    private String        giftCardCode;     // ギフトカードコード
    private LocalDateTime transactionDt;   // 売上日時
    private Integer       amount;          // 金額
    private String        approvalNumber;  // 承認番号
}`
  ),

  h2('⑤-b SettlementHistoryService.java — getRecords() 追加'),
  diffTable(
`public List<SettlementHistoryListDto>
        listHistory(Integer limit) { ... }`,
`public List<SettlementHistoryListDto>
        listHistory(Integer limit) { ... }

/**
 * 指定期間の送信トランザクション詳細を返す。
 * from/to は ISO LocalDateTime 形式
 * 例: 2026-03-10T00:00:00 〜 2026-03-10T09:00:00
 *
 * DB の transaction テーブルを再クエリするため
 * リアルタイムかつ EBCDIC 変換不要。
 */
public List<SettlementRecordDto> getRecords(
        LocalDateTime from, LocalDateTime to,
        Integer limit)
        throws java.sql.SQLException {

    int lim = (limit != null && limit > 0) ? limit : 1000;
    List<TransactionDataDto> rows =
        transactionJdbcSearch.getTransactionSettlement(
            CommonConstants.KASUMI_COMPANY_CODE,
            from, to, lim, 0);

    return rows.stream().map(t -> {
        SettlementRecordDto dto =
            new SettlementRecordDto();
        dto.setCodePayNoAeongift(
            t.getCodePayNoAeongift());
        dto.setType(t.getType());
        dto.setTypeLabel(switch (t.getType()) {
            case 1 -> "利用";
            case 2 -> "払戻";
            default -> String.valueOf(t.getType());
        });
        dto.setStoreName(t.getStoreName());
        dto.setGiftCardCode(t.getGiftCardCode());
        dto.setTransactionDt(t.getTransactionDt());
        dto.setAmount(t.getAmount());
        dto.setApprovalNumber(t.getApprovalNumber());
        return dto;
    }).toList();
}`
  ),
  p(tx('※ transactionJdbcSearch フィールドを SettlementHistoryService に追加すること（@RequiredArgsConstructor 対象）。')),

  h2('⑤-c SettlementHistoryController.java — /records エンドポイント追加'),
  diffTable(
`@GetMapping
public List<SettlementHistoryListDto> list(
    @RequestParam(defaultValue = "100")
    Integer limit) {
    return settlementHistoryService.listHistory(limit);
}`,
`@GetMapping
public List<SettlementHistoryListDto> list(
    @RequestParam(defaultValue = "100")
    Integer limit) {
    return settlementHistoryService.listHistory(limit);
}

/**
 * 送信トランザクション詳細一覧取得
 *
 * GET /api/v1/app/settlement-history/records
 *   ?from=2026-03-10T00:00:00
 *   &to=2026-03-10T09:00:00
 *   &limit=1000（省略時1000件）
 *
 * レスポンス例:
 * [
 *   {
 *     "codePayNoAeongift": "12345678901",
 *     "type": 1,
 *     "typeLabel": "利用",
 *     "storeName": "カスミ XX店",
 *     "giftCardCode": "1234567890123456",
 *     "transactionDt": "2026-03-10T08:45:00",
 *     "amount": 1500,
 *     "approvalNumber": "000123"
 *   }, ...
 * ]
 */
@GetMapping("/records")
public List<SettlementRecordDto> getRecords(
    @RequestParam String from,
    @RequestParam String to,
    @RequestParam(defaultValue = "1000")
        Integer limit)
    throws java.sql.SQLException {

    LocalDateTime fromDt =
        LocalDateTime.parse(from);
    LocalDateTime toDt =
        LocalDateTime.parse(to);
    return settlementHistoryService
        .getRecords(fromDt, toDt, limit);
}`
  ),

  // ===== テスト手順 =====
  h2('■ テスト手順・報告'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [567, 4536, 2268, 1133],
    rows: [
      new TableRow({ children: [thdr('No',567), thdr('テスト手順・確認内容',4536), thdr('期待結果',2268), thdr('結果',1133)] }),
      // 0.1版テスト（再掲）
      new TableRow({ children: [cell('1',567),
        linesCell('DBマイグレーション確認（0.1版）\nDESC settlement_history;', 4536),
        linesCell('s3_key VARCHAR(500) カラムが存在すること', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('2',567),
        linesCell('バッチ手動実行（STG）\nPOST /api/v1/app/batch/settlement?time=2026-03-10 09:00:00', 4536),
        linesCell('200 OK / エラーログなし', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('3',567),
        linesCell('S3 EBCDICファイル確認（0.1版）\ns3://prd-aeon-gift-card/settlement/{yyMMdd}/ を確認', 4536),
        linesCell('6301900000_____000XX ファイルが存在すること', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('4',567),
        linesCell('DB取り込み確認（0.1版）\nSELECT output_datetime, s3_key, total_record, status\nFROM settlement_history ORDER BY output_datetime DESC LIMIT 5;', 4536),
        linesCell('s3_key に S3パスが記録されていること\nstatus = 0', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('5',567),
        linesCell('LOG参照API確認（0.1版）\nGET /api/v1/app/settlement-history?limit=10', 4536),
        linesCell('JSONに outputDatetime / s3Key / status / statusLabel が含まれること', 2268), cell('',1133)] }),
      // 0.2版テスト（A案）
      new TableRow({ children: [cell('6',567),
        linesCell('【A案】CSV保存確認\nS3 → settlement/{yyMMdd}/ を確認', 4536),
        linesCell('6301900000_____000XX.csv が存在すること', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('7',567),
        linesCell('【A案】CSVの中身確認\nCSVをダウンロードしてテキストエディタまたはExcelで開く', 4536),
        linesCell('UTF-8 BOM付き / ヘッダー行あり\n支払番号, 取引種別, 店舗名, ギフトカードコード, 売上日時, 金額, 承認番号 が正しく文字で読めること\n文字化けしないこと', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('8',567),
        linesCell('【A案】CSV件数確認\nCSVの行数（ヘッダー除く）= settlement_history の total_record と一致すること', 4536),
        linesCell('件数が一致すること', 2268), cell('',1133)] }),
      // 0.2版テスト（B案）
      new TableRow({ children: [cell('9',567),
        linesCell('【B案】詳細参照API確認\nGET /api/v1/app/settlement-history/records\n?from=2026-03-10T00:00:00\n&to=2026-03-10T09:00:00&limit=10', 4536),
        linesCell('JSONレスポンスが返ること\ncodePayNoAeongift / typeLabel / storeName / giftCardCode / amount が含まれること', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('10',567),
        linesCell('【B案】詳細APIの内容とCSVの内容が一致すること\nAPI結果の件数・金額をCSVと照合', 4536),
        linesCell('件数・金額・ギフトカードコードが一致すること', 2268), cell('',1133)] }),
      new TableRow({ children: [cell('11',567),
        linesCell('エラー時の記録確認（STGでSFTP先をダミーIPに変更）\nバッチ実行後 settlement_history を確認', 4536),
        linesCell('status=1 / error_message 記録あり\ns3_key が NULL（SFTP失敗でCSVも保存しない）\nCSVが S3 に存在しないこと', 2268), cell('',1133)] }),
    ]
  }),

  // ===== 2. 報告方法 =====
  h1('2. 報告方法'),
  p(tx('テスト完了後、上記テスト手順・報告欄の結果（OK/NG）を記入し、本ドキュメントを承認者に提出すること。NG が発生した場合はエラー内容を記載すること。')),
];

// ---- Document ----
const doc = new Document({
  creator: 'Thanh Nguyên',
  title: 'カスミPOS AWS 改修指示書 No.17 v0.2',
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
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/20260310_AWS_改修指示書_No17_v02.docx', buf);
  console.log('✓ Generated');
});

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

// ---- helpers ----
function tx(text, o={}) {
  return new TextRun({ text, font: FONT, size: o.size||18, bold: o.bold, color: o.color, italics: o.italics });
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
  { ver:'0.1', date:'2026/03/10', author:'Thanh Nguyên', content:'初版作成（No.17: ギフト決済送信 S3保存・DB取り込み・LOG参照）', gray:false },
  { ver:'1.0', date:'', author:'', content:'（顧客承認時に設定）', gray:true },
];

// ---- 改修一覧 ----
// No.17のみ（今回の改修）
// 前の文書の連番を引き継ぐ前提

// ---- コード diff ヘルパー ----
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

// ============================================================
// 本文コンテンツ
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
    children: [tx('2026/03/10  ギフト決済送信 S3保存・DB取り込み・LOG参照', { size:32, bold:true })]
  }),
  new Paragraph({ children:[tx('')], spacing:{ before:2400, after:0 } }),
  metaTable([
    { label:'プロジェクト名', value:'カスミPOSシステム' },
    { label:'ドキュメントNo', value:'KSM-AWS-CR-017' },
    { label:'版数',          value:'0.1' },
    { label:'作成者',        value:'Thanh Nguyên' },
    { label:'作成日',        value:'2026/03/10' },
    { label:'承認者',        value:'' },
    { label:'対象リポジトリ', value:'aeongiftcardserver-product' },
    { label:'対象環境',      value:'PRD / STG 共通' },
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
        cell(r.ver, 756, { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
        cell(r.date, 1512, { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
        cell(r.author, 1890, { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
        cell(r.content, 4346, { color:r.gray?'AAAAAA':'000000', italics:r.gray }),
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
        linesCell('ギフト決済送信ファイル\nS3保存・DB取り込み・LOG参照', 2362),
        linesCell('① SFTP送信完了後にEBCDICファイルをS3にバックアップ\n② settlement_historyにS3キーを保存\n③ 送信履歴をRESTで参照できるAPIを追加', 3401),
        cell('2.0d', 945),
        cell('低', 945),
      ]}),
    ]
  }),

  // ===== No.17 =====
  h1('No.17  ギフト決済送信ファイル S3保存・DB取り込み・LOG参照'),
  p(tx('現状、NTT DATA CDSへSFTPで送信したEBCDICファイルはEC2ローカル（C:\\gift\\settlement\\）にのみ存在し、送信後のファイル保全・追跡ができない。また送信履歴をシステム外部から参照する手段がない。本改修により以下3点を実現する。')),

  h2('■ 背景・目的'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2126, 6378],
    rows: [
      new TableRow({ children: [hdr('項目',2126), hdr('内容',6378)] }),
      new TableRow({ children: [cell('① S3バックアップ',2126), linesCell('SFTP送信成功後、同一ファイルを S3 (prd-aeon-gift-card) に保存する。\nEC2 ローカルファイルのみでは EC2 障害・再起動でファイルが失われるリスクがある。', 6378)] }),
      new TableRow({ children: [cell('② DB取り込み',2126), linesCell('settlement_history テーブルに s3_key カラムを追加し、S3 上のオブジェクトパスを記録する。\n送信結果と保存先を一元管理し、後から特定の送信ファイルを再取得・再送できるようにする。', 6378)] }),
      new TableRow({ children: [cell('③ LOG参照API',2126), linesCell('GET /api/v1/app/settlement-history エンドポイントを追加する。\n送信日時・ファイルパス・S3キー・件数・ステータス・エラーメッセージを一覧で返す。\nパラメータ limit（デフォルト 100）で取得件数を制御する。', 6378)] }),
    ]
  }),

  h2('■ 対象ファイル'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2126, 6378],
    rows: [
      new TableRow({ children: [hdr('種別',2126), hdr('ファイルパス',6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../constant/CommonConstants.java', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../domain/transaction/SettlementHistory.java', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../service/S3Service.java', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../service/SettlementService.java', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../repository/transaction/SettlementHistoryRepository.java', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/java/.../service/SettlementHistoryService.java', 6378)] }),
      new TableRow({ children: [cell('新規',2126), cell('src/main/java/.../dto/app/SettlementHistoryListDto.java', 6378)] }),
      new TableRow({ children: [cell('新規',2126), cell('src/main/java/.../controller/app/SettlementHistoryController.java', 6378)] }),
      new TableRow({ children: [cell('新規',2126), cell('src/main/resources/db/migration/transaction/V8__add_s3_key_to_settlement_history.sql', 6378)] }),
      new TableRow({ children: [cell('修正',2126), cell('src/main/resources/application.yml', 6378)] }),
    ]
  }),

  // ===== 改修内容 =====
  h2('■ 改修内容'),

  h2('① CommonConstants.java — OperationType に UPLOAD_FILE を追加'),
  diffTable(
`public enum OperationType {
    LIST_FILES,
    PRESIGN_URL,
}`,
`public enum OperationType {
    LIST_FILES,
    PRESIGN_URL,
    UPLOAD_FILE,  // 追加
}`
  ),

  h2('② SettlementHistory.java — s3Key フィールド追加'),
  diffTable(
`@Column(name = "status")
private Integer status;`,
`@Column(name = "status")
private Integer status;

@Column(name = "s3_key", length = 500)  // 追加
private String s3Key;`
  ),

  h2('③ S3Service.java — uploadFile() メソッド追加'),
  p(tx('既存クラス末尾（normalizePrefix の直前）に以下メソッドを追加する。')),
  diffTable(
`// (追加前: normalizePrefix のみ)
private String normalizePrefix(String folder) {
    ...
}`,
`/**
 * ファイルを S3 にアップロードする。
 * @param key  S3 オブジェクトキー（例: settlement/260310/6301900000_____00001）
 * @param file アップロード対象ファイル
 */
public void uploadFile(String key, File file) {
    try {
        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        s3Client.putObject(putReq, RequestBody.fromFile(file));
        log.info("Uploaded file to S3: s3://{}/{}", bucketName, key);
    } catch (Exception e) {
        throw new S3OperationException(
                CommonConstants.OperationType.UPLOAD_FILE,
                "Failed to upload to S3: " + key, e);
    }
}

private String normalizePrefix(String folder) {
    ...
}`
  ),

  h2('④ SettlementService.java — S3アップロード + saveSettlementHistory シグネチャ変更'),
  p(tx('クラスフィールドに s3Service・s3SettlementPath を追加し、pushFileSftp() と saveSettlementHistory() を修正する。')),

  p(tx('4-a. フィールド追加（@RequiredArgsConstructor 対象）'), { spacing:{ before:80, after:40 } }),
  diffTable(
`public class SettlementService {

    private final SftpService sftpService;
    private final SettlementHistoryRepository ...;
    private final TransactionJdbcSearch ...;`,
`public class SettlementService {

    private final SftpService sftpService;
    private final S3Service s3Service;             // 追加
    private final SettlementHistoryRepository ...;
    private final TransactionJdbcSearch ...;

    @Value("\${aws.s3.settlement-path}")
    private String s3SettlementPath;               // 追加`
  ),

  p(tx('4-b. pushFileSftp() 修正'), { spacing:{ before:80, after:40 } }),
  diffTable(
`log.info("start push sftp file {}", file.getAbsoluteFile());
try {
    sftpService.upload(file.getName(), file);
    saveSettlementHistory(endDateTime,
        result.get(pathFile), pathFile,
        STATUS_SUCCESS, null);
} catch (Exception e) {
    log.error(e.getMessage(), e);
    saveSettlementHistory(endDateTime,
        result.get(pathFile), pathFile,
        STATUS_ERROR, e.getMessage());
    throw new RuntimeException(e);
}`,
`log.info("start push sftp file {}", file.getAbsoluteFile());
String s3Key = null;
try {
    sftpService.upload(file.getName(), file);
    // ① S3バックアップ
    s3Key = s3SettlementPath + "/" + time
          + "/" + file.getName();
    s3Service.uploadFile(s3Key, file);
    log.info("Backed up to S3: {}", s3Key);
    // ② DB保存（s3Key込み）
    saveSettlementHistory(endDateTime,
        result.get(pathFile), pathFile,
        s3Key, STATUS_SUCCESS, null);
} catch (Exception e) {
    log.error(e.getMessage(), e);
    saveSettlementHistory(endDateTime,
        result.get(pathFile), pathFile,
        s3Key, STATUS_ERROR, e.getMessage());
    throw new RuntimeException(e);
}`
  ),

  p(tx('4-c. saveSettlementHistory() シグネチャ変更'), { spacing:{ before:80, after:40 } }),
  diffTable(
`private void saveSettlementHistory(
    LocalDateTime settlementTime,
    Integer totalRecord,
    String pathFile,
    Integer status,
    String errorMessage) {
    ...
    // s3Key の設定なし
}`,
`private void saveSettlementHistory(
    LocalDateTime settlementTime,
    Integer totalRecord,
    String pathFile,
    String s3Key,          // 追加
    Integer status,
    String errorMessage) {
    ...
    settlementHistory.setS3Key(s3Key); // 追加
}`
  ),

  p(tx('※ STATUS_NOT_SEND_FILE の呼び出し箇所も s3Key=null を渡すよう修正すること。'), { spacing:{ before:0, after:60 } }),

  h2('⑤ SettlementHistoryRepository.java — 一覧取得クエリ追加'),
  diffTable(
`@Query(value = """
    select max(output_datetime)
    from settlement_history
    ...
    """, nativeQuery = true)
LocalDateTime getLastSettlementTime(Integer companyCode);`,
`@Query(value = """
    select max(output_datetime)
    from settlement_history
    ...
    """, nativeQuery = true)
LocalDateTime getLastSettlementTime(Integer companyCode);

// 追加: 送信履歴一覧取得
@Query(value = """
    SELECT * FROM settlement_history
    WHERE company_code = :companyCode
      AND record_void_flag <> '1'
    ORDER BY output_datetime DESC
    LIMIT :lim
    """, nativeQuery = true)
List<SettlementHistory> findRecentHistory(
    Integer companyCode,
    int lim);`
  ),

  h2('⑥ SettlementHistoryListDto.java — 新規作成'),
  p(tx('パッケージ: com.luvina.pos.provider.dto.app')),
  diffTable(
`// (新規ファイル)`,
`package com.luvina.pos.provider.dto.app;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SettlementHistoryListDto {
    private LocalDateTime outputDatetime;
    private String        pathFileOutput;
    private String        s3Key;
    private Integer       totalRecord;
    private Integer       status;
    private String        statusLabel;
    private LocalDateTime fileSendingTime;
    private String        errorMessage;
}`
  ),

  h2('⑦ SettlementHistoryService.java — listHistory() 追加'),
  diffTable(
`@Service
@RequiredArgsConstructor
...
public class SettlementHistoryService {
    private final TransactionRepository ...;
    public ResCheckSettlement checkSettlement() { ... }
}`,
`@Service
@RequiredArgsConstructor
...
public class SettlementHistoryService {
    private final TransactionRepository ...;
    private final SettlementHistoryRepository  // 追加
        settlementHistoryRepository;

    public ResCheckSettlement checkSettlement() { ... }

    // 追加: 送信履歴一覧
    public List<SettlementHistoryListDto>
            listHistory(Integer limit) {
        int lim = (limit != null && limit > 0)
                  ? limit : 100;
        return settlementHistoryRepository
            .findRecentHistory(
                CommonConstants.KASUMI_COMPANY_CODE,
                lim)
            .stream()
            .map(this::toDto)
            .toList();
    }

    private SettlementHistoryListDto toDto(
            SettlementHistory h) {
        SettlementHistoryListDto dto =
            new SettlementHistoryListDto();
        dto.setOutputDatetime(
            h.getId().getOutputDatetime());
        dto.setPathFileOutput(
            h.getId().getPathFileOutput());
        dto.setS3Key(h.getS3Key());
        dto.setTotalRecord(h.getTotalRecord());
        dto.setStatus(h.getStatus());
        dto.setStatusLabel(switch(
            h.getStatus() == null ? -1 : h.getStatus()){
            case 0 -> "成功";
            case 1 -> "エラー";
            case 2 -> "送信スキップ";
            default -> "不明";
        });
        dto.setFileSendingTime(
            h.getFileSendingTime());
        dto.setErrorMessage(h.getErrorMessage());
        return dto;
    }
}`
  ),

  h2('⑧ SettlementHistoryController.java — 新規作成'),
  p(tx('パッケージ: com.luvina.pos.provider.controller.app')),
  diffTable(
`// (新規ファイル)`,
`package com.luvina.pos.provider.controller.app;

import com.luvina.pos.provider.dto.app
    .SettlementHistoryListDto;
import com.luvina.pos.provider.service
    .SettlementHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/app/settlement-history")
public class SettlementHistoryController {

    private final SettlementHistoryService
        settlementHistoryService;

    /**
     * 送信履歴一覧取得
     * GET /api/v1/app/settlement-history
     *     ?limit=100（省略時100件）
     */
    @GetMapping
    public List<SettlementHistoryListDto> list(
        @RequestParam(defaultValue = "100")
        Integer limit) {
        return settlementHistoryService
            .listHistory(limit);
    }
}`
  ),

  h2('⑨ V8__add_s3_key_to_settlement_history.sql — 新規作成'),
  diffTable(
`-- (新規ファイル)`,
`-- V8: settlement_history に s3_key カラムを追加
ALTER TABLE settlement_history
  ADD COLUMN s3_key VARCHAR(500) NULL
    COMMENT 'S3バックアップキー'
    AFTER path_file_output;`
  ),

  h2('⑩ application.yml — s3.settlement-path 追加'),
  diffTable(
`aws:
  s3:
    bucket-name: \${BUCKET_GIFT_NAME:aeon-gift-card}
    region: \${REGION_GIFT_NAME:ap-northeast-1}`,
`aws:
  s3:
    bucket-name: \${BUCKET_GIFT_NAME:aeon-gift-card}
    region: \${REGION_GIFT_NAME:ap-northeast-1}
    settlement-path:                          # 追加
      \${S3_SETTLEMENT_PATH:settlement}`
  ),

  p(tx('S3保存先フルパス: s3://prd-aeon-gift-card/settlement/{yyMMdd}/6301900000_____000{XX}'), { spacing:{ before:0, after:80 } }),

  // ===== テスト手順 =====
  h2('■ テスト手順・報告'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [567, 4536, 2268, 1133],
    rows: [
      new TableRow({ children: [thdr('No',567), thdr('テスト手順・確認内容',4536), thdr('期待結果',2268), thdr('結果',1133)] }),
      new TableRow({ children: [
        cell('1', 567),
        linesCell('DBマイグレーションの実行確認\nAurora MySQL に接続し、以下を実行:\nDESC settlement_history;', 4536),
        linesCell('s3_key VARCHAR(500) カラムが追加されていること', 2268),
        cell('', 1133)
      ]}),
      new TableRow({ children: [
        cell('2', 567),
        linesCell('バッチ手動実行（STG環境）\nPOST /api/v1/app/batch/settlement?time=2026-03-10 09:00:00', 4536),
        linesCell('HTTPレスポンスが 200 OK であること\nエラーログが出力されないこと', 2268),
        cell('', 1133)
      ]}),
      new TableRow({ children: [
        cell('3', 567),
        linesCell('S3バックアップ確認\nAWS コンソール → S3 → prd-aeon-gift-card\n/settlement/{yyMMdd}/ フォルダを確認', 4536),
        linesCell('EBCDICファイル（6301900000_____000XX）が保存されていること', 2268),
        cell('', 1133)
      ]}),
      new TableRow({ children: [
        cell('4', 567),
        linesCell('DB取り込み確認\nSELECT output_datetime, path_file_output, s3_key,\n  total_record, status\nFROM settlement_history\nORDER BY output_datetime DESC LIMIT 5;', 4536),
        linesCell('s3_key に S3 パス（settlement/260310/...）が記録されていること\nstatus = 0（成功）であること', 2268),
        cell('', 1133)
      ]}),
      new TableRow({ children: [
        cell('5', 567),
        linesCell('LOG参照 API 確認\nGET /api/v1/app/settlement-history?limit=10', 4536),
        linesCell('JSON レスポンスが返ること\noutputDatetime / s3Key / status / statusLabel が含まれること', 2268),
        cell('', 1133)
      ]}),
      new TableRow({ children: [
        cell('6', 567),
        linesCell('エラー時の記録確認（STG環境でSFTP先をダミーIPに変更してバッチ実行）\nSFTP接続失敗後に settlement_history を確認', 4536),
        linesCell('status = 1（エラー）でレコードが記録されていること\nerror_message にエラー内容が記録されていること\ns3_key が NULL であること（S3アップロード前にSFTP失敗のため）', 2268),
        cell('', 1133)
      ]}),
    ]
  }),

  // ===== 2. 報告方法 =====
  h1('2. 報告方法'),
  p(tx('テスト完了後、上記「テスト手順・報告」欄の結果（OK/NG）を記入し、本ドキュメントを承認者に提出すること。NG が発生した場合はエラー内容をエラーメッセージ欄に記載すること。')),
];

// ---- Document ----
const doc = new Document({
  creator: 'Thanh Nguyên',
  title: 'カスミPOS AWS 改修指示書 No.17',
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
  fs.writeFileSync('/home/claude/20260310_AWS_改修指示書_No17.docx', buf);
  console.log('✓ Generated');
});

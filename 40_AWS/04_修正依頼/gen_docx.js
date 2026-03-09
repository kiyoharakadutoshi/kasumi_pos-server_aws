const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, BorderStyle, WidthType,
  ShadingType, SimpleField, TabStopType, HeadingLevel
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUT = '/home/claude/40_AWS/04_修正依頼/20260309_AWS_セキュリティ改修依頼.docx';
const LOGO = fs.readFileSync('/mnt/skills/user/luvina-ppt/assets/luvina_logo.png');

// ── 定数 ──
const FONT = 'BIZ UDPゴシック';
const RED   = 'C8102E';
const PINK  = 'E8A0A8';
const GRAY  = 'F5F5F5';
const LIGHT_BLUE = 'D6E4F0';
const BR_C  = 'CCCCCC';
const FOOTER_C = '666666';
const HEAD_R  = '888888';
const MUTED = 'AAAAAA';

const border = { style: BorderStyle.SINGLE, size: 4, color: BR_C };
const BDRS   = { top: border, bottom: border, left: border, right: border };
const CM     = { top: 60, bottom: 60, left: 100, right: 100 };

// ── ヘルパー ──
// IMPORTANT: セル本文は常に9pt(size:18)固定。外部optsでsizeを上書きしない。
function t(text, opts = {}) {
  const { size: _ignored, ...safeOpts } = opts; // sizeの上書きを防ぐ
  return new TextRun({ text: String(text), font: FONT, size: 18, ...safeOpts });
}
function tBold(text) {
  return new TextRun({ text: String(text), font: FONT, size: 18, bold: true });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT, size: 24, bold: true })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT, size: 18, bold: true })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [t(text, opts)], spacing: { before: 0, after: 80 } });
}
function pEmpty() {
  return new Paragraph({ children: [t('')], spacing: { before: 0, after: 0 } });
}

// セル（テキスト）
function cell(text, width, fillColor) {
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: fillColor || 'FFFFFF', type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [t(text)], spacing: { before: 0, after: 0 } })]
  });
}
function cellB(text, width, fillColor) {
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: fillColor || 'FFFFFF', type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [tBold(text)], spacing: { before: 0, after: 0 } })]
  });
}
// 複数行セル
function linesCell(text, width, fill) {
  const lines = typeof text === 'string' ? text.split('\n') : text;
  return new TableCell({
    borders: BDRS, margins: CM,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: fill || 'FFFFFF', type: ShadingType.CLEAR },
    children: lines.map(l => new Paragraph({
      children: [new TextRun({ text: l, font: FONT, size: 18 })],
      spacing: { before: 0, after: 0 }
    }))
  });
}
// テーブルヘッダー行
function headerRow(labels, widths, fill) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => new TableCell({
      borders: BDRS, margins: CM,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: fill || GRAY, type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [tBold(l)], spacing: { before: 0, after: 0 } })]
    }))
  });
}

// メタ情報テーブル
function makeMetaTable(rows) {
  return new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [2000, 4000],
    alignment: AlignmentType.CENTER,
    rows: rows.map(r => new TableRow({ children: [
      new TableCell({ width: { size: 2000, type: WidthType.DXA }, borders: BDRS, margins: CM,
        shading: { fill: GRAY, type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [t(r.label)], spacing: { before: 0, after: 0 } })] }),
      new TableCell({ width: { size: 4000, type: WidthType.DXA }, borders: BDRS, margins: CM,
        children: [new Paragraph({ children: [t(r.value)], spacing: { before: 0, after: 0 } })] }),
    ]}))
  });
}

// ── ヘッダー ──
const header = new Header({
  children: [new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RED, space: 4 } },
    tabStops: [{ type: TabStopType.RIGHT, position: 8504 }],
    spacing: { after: 100 },
    children: [
      new TextRun({ text: 'Kasumi POS  AWS セキュリティ改修依頼', font: FONT, bold: true, color: RED, size: 26 }),
      new TextRun({ text: '\t2026/03/09', font: FONT, color: HEAD_R, size: 18 })
    ]
  })]
});

// ── フッター ──
const footer = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: BR_C, space: 4 } },
    spacing: { before: 80 },
    children: [
      new TextRun({ text: 'Luvina Software JSC.  |  Confidential  |  p. ', color: FOOTER_C, size: 16, font: FONT }),
      new SimpleField('PAGE')
    ]
  })]
});

// ── 本文 ──

// 改修一覧テーブル（VPN PSKは対応済みのため除外）
const revisionList = [
  ['1',  'MFA全ユーザー強制',        '全IAMユーザーへのMFA強制適用',                  '高', '🔴緊急'],
  ['2',  'PowerUserAccess削除',      'lmdロールの過剰権限削除',                        '高', '🔴緊急'],
  ['3',  'GuardDuty有効化(STG)',     'STG環境のGuardDuty有効化',                      '高', '🔴緊急'],
  ['4',  'CloudTrail有効化(STG)',    'STG環境のCloudTrail有効化',                     '高', '🔴緊急'],
  ['5',  'web-be SG修正',            '全トラフィック許可ルール(-1/0.0.0.0/0)の削除',  '高', '🔴緊急'],
  ['6',  'パスワードポリシー設定',   'PRD/STGのIAMパスワードポリシー設定',            '中', '⚠️近日'],
  ['7',  'VPC Flow Logs整備',        'STG有効化・PRDをALLに変更',                     '中', '⚠️近日'],
  ['8',  'api-be ALB internal化',    'STGのapi-be ALBをinternal化',                  '中', '⚠️近日'],
  ['9',  'アクセスキーローテーション', 'daisuke.sasaki/kiyohara（200日超）',          '中', '⚠️近日'],
  ['10', 'ECSロール権限削減',        'SecretsManagerReadWrite→ReadOnly',             '中', '⚠️近日'],
  ['11', 'VPN T2復旧',               'DOWN状態のVPN T2調査・復旧',                   '中', '⚠️近日'],
  ['12', 'CGW削除',                  'Vangle POC残骸CGWの削除',                       '低', '🟢任意'],
  ['13', 'Transfer Family SG修正(STG)', 'BastionからのSFTP接続許可（テスト残骸）を削除', '中', '⚠️近日'],
  ['14', 'EventBridge残骸ルール削除(STG)', '-9233系DISABLED ルール3本の削除',            '低', '🟢任意'],
  ['15', 'Lambda命名修正(PRD)',          'ksm-posstg-lmd-export-pollingをPRD名称に変更', '低', '🟢任意'],
  ['16', 'giftcard CloudWatch Logs整備', 'EC2 giftcardのバッチログをCloudWatchに送信',  '中', '⚠️近日'],
];

// リスク詳細テーブル（各改修の説明）
const riskDetails = [
  {
    no: '1', title: 'MFA 全IAMユーザー強制 / Bắt buộc MFA cho tất cả IAM user',
    target: 'STG / PRD',
    current: '両環境とも7名のIAMユーザーがMFA未設定。\nCả hai môi trường đều có 7 IAM user chưa thiết lập MFA.',
    action: '①各ユーザーに仮想MFAデバイス（Google Authenticator等）を設定させる\n②IAMポリシー DenyWithoutMFA を全ユーザーに付与\n\n①Yêu cầu từng user cài đặt thiết bị MFA ảo (Google Authenticator...)\n②Gán policy DenyWithoutMFA cho tất cả user',
    risk: '認証情報漏洩時にアカウント完全奪取リスク\nKhi thông tin xác thực bị rò rỉ, nguy cơ chiếm đoạt toàn bộ tài khoản',
    priority: '🔴 緊急（Khẩn cấp）'
  },
  {
    no: '2', title: 'PowerUserAccess削除 / Xóa PowerUserAccess',
    target: 'STG: ksm-posstg-iam-role-lmd / PRD: ksm-posprd-iam-role-lmd',
    current: 'Lambda実行ロールにPowerUserAccess（ほぼ全サービスフルアクセス）が付与。\nRole thực thi Lambda được gán PowerUserAccess (quyền truy cập đầy đủ gần như tất cả dịch vụ).',
    action: '①PowerUserAccessを削除\n②Lambda実行に必要な最小権限ポリシーを新規作成・付与\n  例: S3読み書き（特定バケットのみ）/ SQS送受信 / SNS送信 / SecretsManager読み取り\n\n①Xóa PowerUserAccess\n②Tạo và gán policy quyền tối thiểu cần thiết cho Lambda\n  Ví dụ: S3 đọc/ghi (chỉ bucket cụ thể) / SQS gửi/nhận / SNS gửi / SecretsManager đọc',
    risk: 'Lambda関数が侵害された場合、全AWSリソースへのアクセスが可能\nNếu Lambda function bị xâm phạm, có thể truy cập toàn bộ tài nguyên AWS',
    priority: '🔴 緊急（Khẩn cấp）'
  },
  {
    no: '5', title: 'web-be SG 全トラフィック許可ルール削除 / Xóa rule cho phép toàn bộ traffic trên SG web-be',
    target: 'STG: sg-02a3156bfb0ac0046 (ksm-posstg-vpc-sg-ec2-web-be)',
    current: 'Protocol: ALL(-1) / Source: 0.0.0.0/0 の許可ルールが存在。全ポート・全プロトコルへのインターネットからの接続を許可。\nTồn tại rule cho phép Protocol: ALL(-1) / Source: 0.0.0.0/0. Cho phép kết nối từ internet tới toàn bộ port và protocol.',
    action: '①当該ルールを即時削除\n②必要なポートのみ（TCP 8080等）を許可するルールをSG参照または特定IPレンジで設定\n\n①Xóa ngay rule đó\n②Chỉ cho phép các port cần thiết (TCP 8080...) bằng tham chiếu SG hoặc dải IP cụ thể',
    risk: '全ポートへのインターネット公開。スキャン・ブルートフォース・既知脆弱性攻撃の入口\nCông khai toàn bộ port ra internet. Là cổng vào cho scan, brute-force, tấn công lỗ hổng đã biết',
    priority: '🔴 緊急（Khẩn cấp）'
  },
  {
    no: '13', title: 'Transfer Family SG Bastion許可ルール削除(STG) / Xóa rule cho phép Bastion trong SG Transfer Family (STG)',
    target: 'STG: sg-06153ac3ff38765ab (ksm-posstg-vpc-sg-ep-tf)',
    current: 'Transfer Family（SFTP受信サーバー）のSGにBastionからTCP22を許可するルールが残存。\nDescription: "test for bastion" とあり、テスト目的で追加されたまま削除されていない。PRDには同ルールは存在しない。\n\nSG Transfer Family (server SFTP nhận) có rule cho phép TCP22 từ Bastion vẫn còn tồn tại.\nDescription: "test for bastion" - được thêm vào để kiểm thử nhưng chưa được xóa. PRD không có rule này.',
    action: '①STG SGルールを削除\n  対象SG: sg-06153ac3ff38765ab\n  削除ルール: TCP 22 ← sg-01f1bbc2ae66a6591（Bastion SG）\n\n①Xóa rule SG STG\n  SG mục tiêu: sg-06153ac3ff38765ab\n  Rule cần xóa: TCP 22 ← sg-01f1bbc2ae66a6591 (Bastion SG)',
    risk: 'BastionへのSSH侵入後、Transfer FamilyへのSFTP接続が可能になり、S3上のマスターデータ（OC/SG/SH）への不正アクセスが可能。\nSau khi xâm nhập Bastion qua SSH, có thể kết nối SFTP tới Transfer Family, từ đó truy cập trái phép dữ liệu master (OC/SG/SH) trên S3.',
    priority: '⚠️ 近日対応（Xử lý sớm）'
  },
  {
    no: '14', title: 'EventBridge 残骸ルール削除(STG) / Xóa rule EventBridge còn sót lại (STG)',
    target: 'STG: EventBridgeルール 3本',
    current: 'STGに店舗コード9233向けのテスト用EventBridgeルールが3本、DISABLED状態で残存。PRDには存在しない。\n対象ルール:\n  ksm-posstg-eb-rule-receive-pos-master-sg-9233 (DISABLED)\n  ksm-posstg-eb-rule-create-txt-file-sg-9233 (DISABLED)\n  ksm-posstg-eb-rule-night-export-sg-9233 (DISABLED)\n\nSTG có 3 rule EventBridge dành cho mã cửa hàng 9233 ở trạng thái DISABLED còn tồn tại. Không có trong PRD.',
    action: '①以下の3ルールをSTG EventBridgeから削除\n  ksm-posstg-eb-rule-receive-pos-master-sg-9233\n  ksm-posstg-eb-rule-create-txt-file-sg-9233\n  ksm-posstg-eb-rule-night-export-sg-9233\n\n①Xóa 3 rule sau khỏi STG EventBridge\n  ksm-posstg-eb-rule-receive-pos-master-sg-9233\n  ksm-posstg-eb-rule-create-txt-file-sg-9233\n  ksm-posstg-eb-rule-night-export-sg-9233',
    risk: '直接的なセキュリティリスクは低いが、誤って有効化された場合に意図しないSG処理が実行される可能性がある。管理コストの観点からも削除が望ましい。\nRủi ro bảo mật trực tiếp thấp, nhưng nếu vô tình được kích hoạt có thể chạy xử lý SG không mong muốn. Nên xóa để giảm chi phí quản lý.',
    priority: '🟢 任意（Tùy chọn）'
  },
  {
    no: '15', title: 'Lambda命名修正 / Đổi tên Lambda (PRD)',
    target: 'PRD: ksm-posstg-lmd-export-polling',
    current: 'PRD本番アカウント(332802448674)に「ksm-posstg」という名称のLambdaが存在し、PRD本番データを処理している。\nIAMロール=ksm-posprd-iam-role-lmd、SF_ARN=ksm-posprd-sf-sm-create-txt-file-sg とPRD本番リソースを参照。\nリポジトリ統合時のリネーム漏れと推定。毎日JST21:27・22:20頃に実際に動作中。\n\nTrong tài khoản PRD (332802448674) có Lambda tên "ksm-posstg" nhưng đang xử lý dữ liệu PRD thực tế.\nIAM role và SF ARN đều trỏ đến tài nguyên PRD. Ước tính bị bỏ sót khi tích hợp repository.',
    action: '①Lambdaを正しいPRD命名に変更\n  変更前: ksm-posstg-lmd-export-polling\n  変更後: ksm-posprd-lmd-export-polling\n②CloudWatchロググループ名も合わせて更新\n③EventBridgeルール・SQSトリガー等の参照先を確認・更新\n\n①Đổi tên Lambda sang tên PRD đúng\n  Trước: ksm-posstg-lmd-export-polling\n  Sau: ksm-posprd-lmd-export-polling\n②Cập nhật tên log group CloudWatch tương ứng\n③Kiểm tra và cập nhật các tham chiếu từ EventBridge rule, SQS trigger...',
    risk: '運用・監視時にSTG/PRDの区別がつかず、誤った環境への操作や調査ミスが発生するリスク。\nKhi vận hành và giám sát, không phân biệt được STG/PRD, dẫn đến nguy cơ thao tác nhầm môi trường.',
    priority: '🟢 任意（Tùy chọn）'
  },
  {
    no: '16', title: 'giftcard EC2 CloudWatch Logs整備 / Thiết lập CloudWatch Logs cho EC2 giftcard',
    target: 'PRD: EC2 i-03d6bf91c19385cdf (Windows Server 2022 / C:\\gift\\)',
    current: 'EC2 giftcard（Spring Boot）のアプリケーションログがCloudWatchに送信されていない。\n毎日JST09:00に決済バッチが動作しているが、実行履歴・エラー・NTT DATA CDSへのSFTP送信結果が\nCloudWatch上で確認できない状態。ログはEC2ローカル(C:\\Logs\\)にのみ存在する可能性。\n\nLog ứng dụng EC2 giftcard (Spring Boot) không được gửi đến CloudWatch.\nBatch thanh toán chạy lúc 09:00 JST hàng ngày nhưng không thể kiểm tra lịch sử thực thi,\nlỗi, kết quả gửi SFTP đến NTT DATA CDS trên CloudWatch.',
    action: '①EC2にCloudWatch Agentをインストール（Windows用）\n②Spring Bootのログ出力先をCloudWatchロググループに設定\n  推奨ロググループ名: /pos/log/gift/all、/pos/log/gift/error\n③バッチ実行結果・SFTP送信成否がログで確認できることを検証\n\n①Cài đặt CloudWatch Agent cho EC2 (phiên bản Windows)\n②Cấu hình Spring Boot xuất log đến CloudWatch log group\n  Tên log group đề xuất: /pos/log/gift/all、/pos/log/gift/error\n③Xác minh có thể kiểm tra kết quả thực thi batch và trạng thái gửi SFTP qua log',
    risk: '決済バッチの失敗・NTT DATA CDSへの送信エラーが検知できず、ギフトカード決済データの未送信が長期間気づかれないリスク。\nKhông thể phát hiện lỗi batch thanh toán hay lỗi gửi SFTP đến NTT DATA CDS, dẫn đến nguy cơ dữ liệu thanh toán Gift Card không được gửi trong thời gian dài.',
    priority: '⚠️ 近日対応（Xử lý sớm）'
  },
];

// テスト手順テーブル作成関数
function makeTestTable(steps) {
  return new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [567, 4536, 2268, 1133],
    rows: [
      headerRow(['No.', 'テスト手順・確認内容', '期待結果', '結果(OK/NG)'], [567, 4536, 2268, 1133], LIGHT_BLUE),
      ...steps.map((s, i) => new TableRow({ children: [
        cell(String(i + 1), 567),
        linesCell(s.step, 4536),
        linesCell(s.expected, 2268),
        cell('', 1133),
      ]}))
    ]
  });
}

const children = [
  // 表紙
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 4800, after: 80 },
    children: [new TextRun({ text: 'Kasumi POS  AWS セキュリティ改修依頼', font: FONT, size: 32, bold: true, color: RED })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: '2026/03/09  外部アクセスリスク調査に基づく対応依頼', font: FONT, size: 32, bold: true })]
  }),
  pEmpty(),
  new Paragraph({ spacing: { before: 2400, after: 0 }, children: [t('')] }),
  makeMetaTable([
    { label: 'プロジェクト名', value: 'Kasumi POS システム（STG / PRD）' },
    { label: 'ドキュメントNo', value: 'KSM-AWS-SEC-001' },
    { label: '版数', value: '0.1' },
    { label: '作成者', value: 'Thanh Nguyên（Luvina Software）' },
    { label: '作成日', value: '2026/03/09' },
    { label: '承認者', value: '' },
    { label: '対象バージョン', value: 'STG: 750735758916 / PRD: 332802448674' },
  ]),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1400, after: 0 },
    children: [new ImageRun({ data: LOGO, transformation: { width: 90, height: 45 }, type: 'png' })]
  }),

  // ■改廃履歴
  h1('■改廃履歴'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [756, 1512, 1890, 4346],
    rows: [
      headerRow(['版数', '日付', '作成者', '変更内容'], [756, 1512, 1890, 4346], GRAY),
      new TableRow({ children: [cell('0.1', 756), cell('2026/03/09', 1512), cell('Thanh Nguyên', 1890), cell('初版作成（外部アクセスリスク調査結果に基づく改修依頼）', 4346)] }),
      new TableRow({ children: [
        cell('1.0', 756, GRAY),
        new TableCell({ borders: BDRS, margins: CM, width: { size: 1512, type: WidthType.DXA }, shading: { fill: GRAY, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: '', font: FONT, size: 18, color: MUTED, italics: true })], spacing: { before: 0, after: 0 } })] }),
        cell('', 1890, GRAY),
        new TableCell({ borders: BDRS, margins: CM, width: { size: 4346, type: WidthType.DXA }, shading: { fill: GRAY, type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: '（顧客承認時に設定）', font: FONT, size: 18, color: MUTED, italics: true })], spacing: { before: 0, after: 0 } })] }),
      ]}),
    ]
  }),

  // 1. 概要
  h1('1. 概要'),
  p('2026年3月9日に実施したAWS外部アクセスリスク調査の結果、STG（750735758916）およびPRD（332802448674）両環境において、即時対応が必要なセキュリティリスクが複数検出されました。本書はその対応依頼事項をまとめたものです。'),
  p('Dựa trên kết quả điều tra rủi ro truy cập bên ngoài AWS thực hiện ngày 09/03/2026, đã phát hiện nhiều rủi ro bảo mật cần xử lý ngay tại cả hai môi trường STG (750735758916) và PRD (332802448674). Tài liệu này tổng hợp các yêu cầu xử lý.'),
  pEmpty(),

  // 改修一覧テーブル
  h2('■ 改修一覧 / Danh sách cải tiến'),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [500, 1800, 3200, 1500, 1504],
    rows: [
      headerRow(['No.', '改修タイトル', '概要', '優先度', 'ステータス'], [500, 1800, 3200, 1500, 1504], GRAY),
      ...revisionList.map((r, i) => {
        const bg = i % 2 === 0 ? 'FFFFFF' : 'FAFAFA';
        return new TableRow({ children: r.map((v, j) => cell(v, [500, 1800, 3200, 1500, 1504][j], bg)) });
      })
    ]
  }),

  // 個別改修詳細
  h1('2. 改修詳細 / Chi tiết cải tiến'),

  ...riskDetails.flatMap(d => [
    h2(`■ No.${d.no}  ${d.title}`),
    new Table({
      width: { size: 8504, type: WidthType.DXA },
      columnWidths: [1500, 7004],
      rows: [
        new TableRow({ children: [cellB('対象 / Đối tượng', 1500, GRAY), linesCell(d.target, 7004)] }),
        new TableRow({ children: [cellB('現状 / Hiện trạng', 1500, GRAY), linesCell(d.current, 7004)] }),
        new TableRow({ children: [cellB('対応内容 / Nội dung xử lý', 1500, GRAY), linesCell(d.action, 7004)] }),
        new TableRow({ children: [cellB('リスク / Rủi ro', 1500, GRAY), linesCell(d.risk, 7004)] }),
        new TableRow({ children: [cellB('優先度 / Ưu tiên', 1500, GRAY), cell(d.priority, 7004)] }),
      ]
    }),
    pEmpty(),
    h2('■ テスト手順・報告 / Quy trình kiểm thử'),
    makeTestTable([
      { step: `No.${d.no}の対応作業が完了したことを担当者が確認する\nXác nhận người phụ trách đã hoàn thành công việc xử lý No.${d.no}`, expected: `対応完了の記録が残っていること\nCó bản ghi xác nhận hoàn thành xử lý` },
      { step: `AWSコンソール（対象アカウント）にてセキュリティ設定が変更されていることを確認\nXác nhận trên AWS Console (tài khoản liên quan) rằng cài đặt bảo mật đã được thay đổi`, expected: `変更内容が設定に反映されていること\nNội dung thay đổi được phản ánh trong cấu hình` },
      { step: `変更後も既存機能への影響がないことを確認（疎通確認等）\nXác nhận không ảnh hưởng đến chức năng hiện có sau khi thay đổi (kiểm tra thông tin...)`, expected: `既存機能が正常動作すること\nChức năng hiện có hoạt động bình thường` },
    ]),
    pEmpty(),
  ]),

  // 3. 報告方法
  h1('3. 報告方法 / Phương thức báo cáo'),
  p('各改修完了後、以下の情報を記載の上、担当者（清原）までメールまたはSlackにて報告してください。'),
  p('Sau khi hoàn thành từng cải tiến, vui lòng báo cáo cho người phụ trách (Kiyohara) qua email hoặc Slack với các thông tin sau.'),
  pEmpty(),
  new Table({
    width: { size: 8504, type: WidthType.DXA },
    columnWidths: [2000, 6504],
    rows: [
      headerRow(['項目', '内容'], [2000, 6504], GRAY),
      new TableRow({ children: [cellB('改修No.', 2000, GRAY), cell('対応したNo.（複数可）', 6504)] }),
      new TableRow({ children: [cellB('対応日時', 2000, GRAY), cell('YYYY/MM/DD HH:MM', 6504)] }),
      new TableRow({ children: [cellB('対応者', 2000, GRAY), cell('氏名', 6504)] }),
      new TableRow({ children: [cellB('対応内容', 2000, GRAY), cell('実施した操作の概要', 6504)] }),
      new TableRow({ children: [cellB('テスト結果', 2000, GRAY), cell('全項目 OK / 一部NG（詳細記載）', 6504)] }),
      new TableRow({ children: [cellB('備考', 2000, GRAY), cell('', 6504)] }),
    ]
  }),
];

// ── ドキュメント組み立て ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 18 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 24, bold: true },
        paragraph: {
          spacing: { before: 0, after: 120 }, outlineLevel: 0,
          pageBreakBefore: true,
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
    children
  }]
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('✅ Word生成完了:', OUT);
}).catch(e => console.error('❌ エラー:', e));

'use strict';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, SimpleField, HeadingLevel, TabStopType
} = require('docx');
const fs = require('fs');

const FONT = 'BIZ UDPゴシック';
const RED  = 'C8102E';
const GH   = '888888';
const BC   = 'CCCCCC';
const HB   = 'F5F5F5';
const TB   = 'D6E4F0';

const bdr  = { style: BorderStyle.SINGLE, size: 4, color: BC };
const BDRS = { top: bdr, bottom: bdr, left: bdr, right: bdr };
const CM   = { top: 60, bottom: 60, left: 100, right: 100 };
const logo = fs.readFileSync('/mnt/skills/user/luvina-ppt/assets/luvina_logo.png');

function tx(t, o={}) {
  return new TextRun({ text:t, font:FONT, size:o.size||18,
    bold:o.bold, color:o.color, italics:o.italics });
}
function p(children, o={}) {
  return new Paragraph({
    children: Array.isArray(children)?children:[children],
    alignment:o.align, spacing:o.spacing||{before:0,after:60}
  });
}
function h1(t) {
  return new Paragraph({ heading:HeadingLevel.HEADING_1,
    children:[new TextRun({text:t,font:FONT,size:24,bold:true})] });
}
function h2(t) {
  return new Paragraph({ heading:HeadingLevel.HEADING_2,
    children:[new TextRun({text:t,font:FONT,size:18,bold:true})] });
}
function cell(t, w, o={}) {
  return new TableCell({
    borders:BDRS, margins:CM,
    width:{size:w,type:WidthType.DXA},
    shading:{fill:o.fill||'FFFFFF',type:ShadingType.CLEAR},
    verticalAlign:VerticalAlign.TOP,
    children:[new Paragraph({
      children:[new TextRun({text:t||'',font:FONT,size:o.size||18,
        bold:o.bold,color:o.color,italics:o.italics})],
      spacing:{before:0,after:0}
    })]
  });
}
function lc(lines, w, o={}) {
  const arr = typeof lines==='string'?lines.split('\n'):lines;
  return new TableCell({
    borders:BDRS, margins:CM,
    width:{size:w,type:WidthType.DXA},
    shading:{fill:o.fill||'FFFFFF',type:ShadingType.CLEAR},
    verticalAlign:VerticalAlign.TOP,
    children:arr.map(l=>new Paragraph({
      children:[new TextRun({text:l,font:FONT,size:o.size||18,
        bold:o.bold,color:o.color})],
      spacing:{before:0,after:0}
    }))
  });
}
function hdr(t,w)  { return cell(t,w,{fill:HB,bold:true}); }
function thdr(t,w) { return cell(t,w,{fill:TB,bold:true}); }
function cc(t,w) {
  return new TableCell({
    borders:BDRS, margins:CM,
    width:{size:w,type:WidthType.DXA},
    shading:{fill:'F8F8F8',type:ShadingType.CLEAR},
    children:t.split('\n').map(l=>new Paragraph({
      children:[new TextRun({text:l,font:'Consolas',size:16})],
      spacing:{before:0,after:0}
    }))
  });
}
function meta(rows) {
  return new Table({
    width:{size:6000,type:WidthType.DXA},
    columnWidths:[2000,4000], alignment:AlignmentType.CENTER,
    rows:rows.map(r=>new TableRow({children:[
      cell(r.label,2000,{fill:HB}), cell(r.value,4000)
    ]}))
  });
}
function diff(before,after) {
  return new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[4252,4252],
    rows:[
      new TableRow({children:[hdr('▼ 変更前 (Before)',4252),hdr('▲ 変更後 (After)',4252)]}),
      new TableRow({children:[cc(before,4252),cc(after,4252)]})
    ]
  });
}

// ---- ヘッダー/フッター ----
const pageHeader = new Header({children:[new Paragraph({
  border:{bottom:{style:BorderStyle.SINGLE,size:8,color:RED,space:4}},
  tabStops:[{type:TabStopType.RIGHT,position:8504}],
  spacing:{after:100},
  children:[
    new TextRun({text:'カスミPOSプロジェクト  AWS 改修指示書',font:FONT,bold:true,color:RED,size:26}),
    new TextRun({text:'\t2026/03/10',font:FONT,color:GH,size:18})
  ]
})]});
const pageFooter = new Footer({children:[new Paragraph({
  alignment:AlignmentType.CENTER,
  border:{top:{style:BorderStyle.SINGLE,size:4,color:BC,space:4}},
  spacing:{before:80},
  children:[
    new TextRun({text:'Luvina Software JSC.  |  Confidential  |  p. ',color:'666666',size:16,font:FONT}),
    new SimpleField('PAGE')
  ]
})]});

// ---- 改廃履歴 ----
const hist = [
  {ver:'0.1',date:'2026/03/10',author:'Thanh Nguyên',
   content:'初版作成（Spring Profiles による PRD/STG 環境切り替え）',gray:false},
  {ver:'1.0',date:'',author:'',content:'（顧客承認時に設定）',gray:true},
];

// ============================================================
// 本文
// ============================================================
const body = [

  // 表紙
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:4800,after:80},
    children:[tx('カスミPOSプロジェクト  AWS 改修指示書',{size:32,bold:true,color:RED})]
  }),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:80,after:80},
    children:[tx('2026/03/10  PRD / STG 環境切り替え対応',{size:32,bold:true})]
  }),
  new Paragraph({children:[tx('')],spacing:{before:2400,after:0}}),
  meta([
    {label:'プロジェクト名',  value:'カスミPOSシステム'},
    {label:'ドキュメントNo',  value:'KSM-AWS-CR-018'},
    {label:'版数',           value:'0.1'},
    {label:'作成者',         value:'Thanh Nguyên'},
    {label:'作成日',         value:'2026/03/10'},
    {label:'承認者',         value:''},
    {label:'対象リポジトリ',  value:'aeongiftcardserver-product'},
    {label:'対象環境',       value:'PRD / STG 共通'},
  ]),
  new Paragraph({
    alignment:AlignmentType.CENTER, spacing:{before:800,after:0},
    children:[new ImageRun({data:logo,transformation:{width:90,height:45},type:'png'})]
  }),

  // 改廃履歴
  h1('■改廃履歴'),
  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[756,1512,1890,4346],
    rows:[
      new TableRow({children:[hdr('版数',756),hdr('更新日',1512),hdr('作成者',1890),hdr('更新内容',4346)]}),
      ...hist.map(r=>new TableRow({children:[
        cell(r.ver,   756, {color:r.gray?'AAAAAA':'000000',italics:r.gray}),
        cell(r.date,  1512,{color:r.gray?'AAAAAA':'000000',italics:r.gray}),
        cell(r.author,1890,{color:r.gray?'AAAAAA':'000000',italics:r.gray}),
        lc(r.content, 4346,{color:r.gray?'AAAAAA':'000000',italics:r.gray}),
      ]}))
    ]
  }),

  // 1. 概要
  h1('1. 概要'),
  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[851,2362,3401,945,945],
    rows:[
      new TableRow({children:[hdr('No.',851),hdr('改修タイトル',2362),hdr('概要',3401),hdr('工数',945),hdr('リスク',945)]}),
      new TableRow({children:[
        cell('18',851),
        lc('PRD / STG\n環境切り替え対応',2362),
        lc('Spring Profiles（prd / stg）を導入し、\n環境ごとの接続先・S3バケット・ログレベルを\nymlファイルで一元管理する。\nDockerfile に SPRING_PROFILES_ACTIVE 環境変数を追加。\nEC2 の環境変数を整理して切り替えを明確化。',3401),
        cell('1.0d',945),
        cell('低',945),
      ]}),
    ]
  }),

  // No.18
  h1('No.18  PRD / STG 環境切り替え対応'),

  h2('■ 背景・目的'),
  p(tx('現状、application.yml に spring.profiles.active: local がハードコードされており、PRD と STG の設定差異が環境変数の個別設定のみで管理されている。そのため「どの環境変数がどの環境で必要か」が不明瞭で、設定漏れや誤設定のリスクがある。本改修では Spring Profiles を正式に導入し、環境ごとの設定を yml ファイルで明示的に分離する。')),

  h2('■ 改修後の環境切り替え方式'),
  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[2126,6378],
    rows:[
      new TableRow({children:[hdr('項目',2126),hdr('方式',6378)]}),
      new TableRow({children:[
        cell('切り替え方法',2126),
        lc('EC2 の環境変数 SPRING_PROFILES_ACTIVE に prd または stg を設定する。\nDockerfile の ENTRYPOINT で --spring.profiles.active=${SPRING_PROFILES_ACTIVE} を渡す。',6378)
      ]}),
      new TableRow({children:[
        cell('設定ファイル構成',2126),
        lc('application.yml         … 全環境共通のデフォルト値（変更あり）\napplication-local.yml  … ローカル開発用（新規作成）\napplication-prd.yml    … PRD本番環境用（新規作成）\napplication-stg.yml    … STG検証環境用（新規作成）',6378)
      ]}),
      new TableRow({children:[
        cell('優先度',2126),
        lc('プロファイルYML の値 > application.yml の値\n例: application-prd.yml の sftp.gift.host が最優先で適用される。',6378)
      ]}),
    ]
  }),

  h2('■ PRD / STG 設定差異一覧'),
  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[2552,2126,2126,1700],
    rows:[
      new TableRow({children:[hdr('設定キー',2552),hdr('PRD',2126),hdr('STG',2126),hdr('備考',1700)]}),
      new TableRow({children:[
        cell('sftp.gift.host',2552),
        cell('210.144.93.17',2126),
        cell('210.144.93.18',2126),
        cell('NTT DATA CDS\n本番 / 試験',1700)
      ]}),
      new TableRow({children:[
        cell('sftp.gift.username',2552),
        cell('80510048',2126),
        cell('80510048（要確認）',2126),
        cell('STGユーザーが\n異なる場合は修正',1700)
      ]}),
      new TableRow({children:[
        cell('sftp.gift.remote-path',2552),
        cell('put/',2126),
        cell('put/',2126),
        cell('同一',1700)
      ]}),
      new TableRow({children:[
        cell('sftp.gift.private-key-path',2552),
        cell('C:\\gift\\sftp-key\\key',2126),
        cell('C:\\gift\\sftp-key\\key-stg',2126),
        cell('STG用秘密鍵を\n別ファイルで管理',1700)
      ]}),
      new TableRow({children:[
        cell('aws.s3.bucket-name',2552),
        cell('prd-aeon-gift-card',2126),
        cell('stg-aeon-gift-card',2126),
        cell('S3バケット',1700)
      ]}),
      new TableRow({children:[
        cell('aws.s3.settlement-path',2552),
        cell('settlement',2126),
        cell('settlement',2126),
        cell('同一',1700)
      ]}),
      new TableRow({children:[
        cell('datasource.master.jdbcUrl',2552),
        lc('Aurora PRD\ncluster-cxekgmegw02x\n...ap-northeast-1.rds',2126),
        lc('Aurora STG\ncluster-xxxxxxxx\n...ap-northeast-1.rds',2126),
        cell('Secrets Manager\nから注入',1700)
      ]}),
      new TableRow({children:[
        cell('logging.level.root',2552),
        cell('WARN',2126),
        cell('INFO',2126),
        cell('STGは詳細ログ',1700)
      ]}),
      new TableRow({children:[
        cell('settlement.batch\n.folder-temp',2552),
        cell('C:\\gift\\settlement',2126),
        cell('C:\\gift\\settlement-stg',2126),
        cell('フォルダ分離',1700)
      ]}),
    ]
  }),

  h2('■ 対象ファイル'),
  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[2126,6378],
    rows:[
      new TableRow({children:[hdr('種別',2126),hdr('ファイルパス',6378)]}),
      new TableRow({children:[cell('修正',2126),cell('src/main/resources/application.yml',6378)]}),
      new TableRow({children:[cell('新規',2126),cell('src/main/resources/application-local.yml',6378)]}),
      new TableRow({children:[cell('新規',2126),cell('src/main/resources/application-prd.yml',6378)]}),
      new TableRow({children:[cell('新規',2126),cell('src/main/resources/application-stg.yml',6378)]}),
      new TableRow({children:[cell('修正',2126),cell('Dockerfile',6378)]}),
    ]
  }),

  h2('■ 改修内容'),

  h2('① application.yml — profile指定を環境変数化・機密情報をデフォルト値から除去'),
  diff(
`spring:
  datasource:
    master:
      jdbcUrl: jdbc:mysql://\${DB_MASTER_URL:10.0.4.87:3306/m_ksm}...
      username: \${DB_USERNAME:posuser}
      password: \${DB_PASSWORD:poslove2023}
    transaction:
      jdbcUrl: jdbc:mysql://\${DB_TRANSACTION_URL:10.0.4.87:3306/t_ksm}...
      username: \${DB_USERNAME:posuser}
      password: \${DB_PASSWORD:poslove2023}
  profiles:
    active: local   # ← ハードコード

sftp:
  gift:
    host: \${SFTP_GIFT_HOST:210.144.93.18}
    username: \${SFTP_GIFT_USERNAME:80510048}

aws:
  s3:
    bucket-name: \${BUCKET_GIFT_NAME:aeon-gift-card}`,
`spring:
  datasource:
    master:
      jdbcUrl: jdbc:mysql://\${DB_MASTER_URL}...  # デフォルト値削除
      username: \${DB_USERNAME}                   # デフォルト値削除
      password: \${DB_PASSWORD}                   # デフォルト値削除
    transaction:
      jdbcUrl: jdbc:mysql://\${DB_TRANSACTION_URL}...
      username: \${DB_USERNAME}
      password: \${DB_PASSWORD}
  profiles:
    active: \${SPRING_PROFILES_ACTIVE:local}  # 環境変数から取得

# SFTP/S3/settlement は各プロファイルYMLに移動
# application.yml には記載しない`
  ),

  h2('② application-local.yml — 新規作成（ローカル開発用）'),
  diff(
`# (新規ファイル)`,
`# ローカル開発用設定
# SPRING_PROFILES_ACTIVE=local のときに適用
spring:
  datasource:
    master:
      jdbcUrl: jdbc:mysql://10.0.4.87:3306/m_ksm\
?allowPublicKeyRetrieval=true\
&useSSL=false&serverTimezone=Asia/Tokyo
      username: posuser
      password: poslove2023
    transaction:
      jdbcUrl: jdbc:mysql://10.0.4.87:3306/t_ksm\
?allowPublicKeyRetrieval=true\
&useSSL=false&serverTimezone=Asia/Tokyo
      username: posuser
      password: poslove2023

logging:
  level:
    root: INFO
    com.luvina: DEBUG

sftp:
  gift:
    host: 210.144.93.18        # NTT CDS試験環境
    port: 22
    username: 80510048
    remote-path: put/
    private-key-path: C:\\gift\\sftp-key\\key

aws:
  s3:
    bucket-name: local-aeon-gift-card
    settlement-path: settlement

settlement:
  batch:
    folder-temp: C:\\gift\\settlement`
  ),

  h2('③ application-prd.yml — 新規作成（PRD本番用）'),
  diff(
`# (新規ファイル)`,
`# PRD本番環境設定
# SPRING_PROFILES_ACTIVE=prd のときに適用
# DB接続情報は EC2 環境変数 / Secrets Manager から注入
spring:
  datasource:
    master:
      jdbcUrl: jdbc:mysql://\${DB_MASTER_URL}\
?allowPublicKeyRetrieval=true\
&useSSL=false&serverTimezone=Asia/Tokyo
      username: \${DB_USERNAME}
      password: \${DB_PASSWORD}
    transaction:
      jdbcUrl: jdbc:mysql://\${DB_TRANSACTION_URL}\
?allowPublicKeyRetrieval=true\
&useSSL=false&serverTimezone=Asia/Tokyo
      username: \${DB_USERNAME}
      password: \${DB_PASSWORD}

logging:
  level:
    root: WARN
    com.luvina: INFO

sftp:
  gift:
    host: 210.144.93.17          # NTT CDS本番
    port: 22
    username: 80510048
    remote-path: put/
    private-key-path: C:\\gift\\sftp-key\\key

aws:
  s3:
    bucket-name: prd-aeon-gift-card
    settlement-path: settlement

settlement:
  batch:
    folder-temp: C:\\gift\\settlement`
  ),

  h2('④ application-stg.yml — 新規作成（STG検証用）'),
  diff(
`# (新規ファイル)`,
`# STG検証環境設定
# SPRING_PROFILES_ACTIVE=stg のときに適用
spring:
  datasource:
    master:
      jdbcUrl: jdbc:mysql://\${DB_MASTER_URL}\
?allowPublicKeyRetrieval=true\
&useSSL=false&serverTimezone=Asia/Tokyo
      username: \${DB_USERNAME}
      password: \${DB_PASSWORD}
    transaction:
      jdbcUrl: jdbc:mysql://\${DB_TRANSACTION_URL}\
?allowPublicKeyRetrieval=true\
&useSSL=false&serverTimezone=Asia/Tokyo
      username: \${DB_USERNAME}
      password: \${DB_PASSWORD}

logging:
  level:
    root: INFO               # STGは詳細ログ
    com.luvina: DEBUG

sftp:
  gift:
    host: 210.144.93.18      # NTT CDS試験環境
    port: 22
    username: 80510048
    remote-path: put/
    private-key-path: C:\\gift\\sftp-key\\key-stg  # STG用秘密鍵

aws:
  s3:
    bucket-name: stg-aeon-gift-card
    settlement-path: settlement

settlement:
  batch:
    folder-temp: C:\\gift\\settlement-stg  # STG用フォルダ`
  ),

  h2('⑤ Dockerfile — SPRING_PROFILES_ACTIVE 引数追加'),
  diff(
`FROM amazoncorretto:17
WORKDIR /app
COPY target/Aeon-gift-card-server.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]`,
`FROM amazoncorretto:17
WORKDIR /app
COPY target/Aeon-gift-card-server.jar app.jar

# 環境変数 SPRING_PROFILES_ACTIVE で
# prd / stg / local を切り替える
# EC2起動時に環境変数として設定すること
ENV SPRING_PROFILES_ACTIVE=local

ENTRYPOINT ["java", \\
  "-Dspring.profiles.active=\${SPRING_PROFILES_ACTIVE}", \\
  "-jar", "app.jar"]`
  ),

  h2('■ EC2 環境変数設定手順'),
  p(tx('改修デプロイ後、各EC2インスタンスで以下の環境変数を設定すること。設定方法: Windowsサービス / 起動バッチファイル / Systems Manager Parameter Store のいずれかで管理する。')),

  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[567,2552,2552,2833],
    rows:[
      new TableRow({children:[hdr('',567),hdr('環境変数名',2552),hdr('PRD値',2552),hdr('STG値',2833)]}),
      new TableRow({children:[cell('必須',567,{fill:'FFF0F0'}),
        cell('SPRING_PROFILES_ACTIVE',2552),cell('prd',2552),cell('stg',2833)]}),
      new TableRow({children:[cell('必須',567,{fill:'FFF0F0'}),
        cell('DB_MASTER_URL',2552),
        lc('Aurora PRDエンドポイント:3306\n/Batch_Kasumi',2552),
        lc('Aurora STGエンドポイント:3306\n/Batch_Kasumi',2833)]}),
      new TableRow({children:[cell('必須',567,{fill:'FFF0F0'}),
        cell('DB_TRANSACTION_URL',2552),
        lc('Aurora PRDエンドポイント:3306\n/T_KSM',2552),
        lc('Aurora STGエンドポイント:3306\n/T_KSM',2833)]}),
      new TableRow({children:[cell('必須',567,{fill:'FFF0F0'}),
        cell('DB_USERNAME',2552),cell('（Secrets Managerから取得）',2552),cell('（Secrets Managerから取得）',2833)]}),
      new TableRow({children:[cell('必須',567,{fill:'FFF0F0'}),
        cell('DB_PASSWORD',2552),cell('（Secrets Managerから取得）',2552),cell('（Secrets Managerから取得）',2833)]}),
      new TableRow({children:[cell('任意',567),
        cell('BUCKET_GIFT_NAME',2552),
        lc('設定不要\n（application-prd.yml\n に固定値あり）',2552),
        lc('設定不要\n（application-stg.yml\n に固定値あり）',2833)]}),
      new TableRow({children:[cell('任意',567),
        cell('SFTP_GIFT_HOST',2552),
        lc('設定不要\n（application-prd.yml\n に固定値あり）',2552),
        lc('設定不要\n（application-stg.yml\n に固定値あり）',2833)]}),
    ]
  }),

  p(tx('※ SFTP_GIFT_HOST / BUCKET_GIFT_NAME など従来の環境変数は、プロファイルYMLに固定値として記載したため今後は不要。ただし移行期間中は既存設定を残しても問題ない（プロファイルYMLの固定値が優先される）。'), {spacing:{before:40,after:80}}),

  h2('■ 起動確認コマンド（デプロイ後確認）'),
  p(tx('アプリ起動後、以下のログでプロファイルが正しく適用されていることを確認する。')),
  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[2126,6378],
    rows:[
      new TableRow({children:[hdr('確認方法',2126),hdr('期待するログ / 値',6378)]}),
      new TableRow({children:[
        cell('起動ログ確認',2126),
        lc('The following 1 profile is active: "prd"\nまたは\nThe following 1 profile is active: "stg"',6378)
      ]}),
      new TableRow({children:[
        cell('SFTP接続先確認\n（STG）',2126),
        lc('バッチ実行後のログに\nConnected to SFTP server (host:210.144.93.18, port:22)\nが出力されること',6378)
      ]}),
      new TableRow({children:[
        cell('SFTP接続先確認\n（PRD）',2126),
        lc('バッチ実行後のログに\nConnected to SFTP server (host:210.144.93.17, port:22)\nが出力されること',6378)
      ]}),
      new TableRow({children:[
        cell('S3バケット確認',2126),
        lc('settlement_history の s3_key が\nprd: s3://prd-aeon-gift-card/settlement/...\nstg: s3://stg-aeon-gift-card/settlement/...\nであること',6378)
      ]}),
    ]
  }),

  // テスト手順
  h2('■ テスト手順・報告'),
  new Table({
    width:{size:8504,type:WidthType.DXA},
    columnWidths:[567,4536,2268,1133],
    rows:[
      new TableRow({children:[thdr('No',567),thdr('テスト手順・確認内容',4536),thdr('期待結果',2268),thdr('結果',1133)]}),
      new TableRow({children:[cell('1',567),
        lc('STG EC2 で SPRING_PROFILES_ACTIVE=stg を設定してアプリを再起動\nログに起動プロファイルを確認',4536),
        lc('The following 1 profile is active: "stg" が出力されること',2268),
        cell('',1133)]}),
      new TableRow({children:[cell('2',567),
        lc('STGでバッチ手動実行\nPOST /api/v1/app/batch/settlement?time=2026-03-10 09:00:00',4536),
        lc('SFTP接続先ログに 210.144.93.18 が出力されること',2268),
        cell('',1133)]}),
      new TableRow({children:[cell('3',567),
        lc('STGでS3保存先確認\nSettlement_history の s3_key を確認',4536),
        lc('s3_key が stg-aeon-gift-card/settlement/... であること',2268),
        cell('',1133)]}),
      new TableRow({children:[cell('4',567),
        lc('STGで一時フォルダ確認\nバッチ実行後に C:\\gift\\settlement-stg\\ が生成されていること',4536),
        lc('settlement-stg フォルダが存在し、EBCDICファイルが生成されていること',2268),
        cell('',1133)]}),
      new TableRow({children:[cell('5',567),
        lc('PRD EC2 で SPRING_PROFILES_ACTIVE=prd を設定してアプリを再起動\nログに起動プロファイルを確認',4536),
        lc('The following 1 profile is active: "prd" が出力されること',2268),
        cell('',1133)]}),
      new TableRow({children:[cell('6',567),
        lc('PRDでバッチ手動実行（業務時間外に実施）\nPOST /api/v1/app/batch/settlement',4536),
        lc('SFTP接続先ログに 210.144.93.17 が出力されること\nS3に prd-aeon-gift-card/settlement/... が保存されること',2268),
        cell('',1133)]}),
      new TableRow({children:[cell('7',567),
        lc('誤プロファイル確認\nSPRING_PROFILES_ACTIVE を空にしてアプリ起動',4536),
        lc('The following 1 profile is active: "local" が出力されること\n（デフォルト: local にフォールバック）',2268),
        cell('',1133)]}),
    ]
  }),

  h1('2. 報告方法'),
  p(tx('テスト完了後、上記テスト手順・報告欄の結果（OK/NG）を記入し、本ドキュメントを承認者に提出すること。')),
];

// ---- Document ----
const doc = new Document({
  creator:'Thanh Nguyên',
  title:'カスミPOS AWS 改修指示書 No.18',
  styles:{
    default:{document:{run:{font:FONT,size:18}}},
    paragraphStyles:[
      {
        id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,
        run:{font:FONT,size:24,bold:true},
        paragraph:{
          spacing:{before:0,after:120},outlineLevel:0,pageBreakBefore:true,
          border:{bottom:{style:BorderStyle.SINGLE,size:2,color:'E8A0A8',space:4}}
        }
      },
      {
        id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,
        run:{font:FONT,size:18,bold:true},
        paragraph:{spacing:{before:160,after:60},outlineLevel:1}
      },
    ]
  },
  sections:[{
    properties:{
      page:{
        size:{width:11906,height:16838},
        margin:{top:1418,bottom:1418,left:1701,right:1701}
      }
    },
    headers:{default:pageHeader},
    footers:{default:pageFooter},
    children:body
  }]
});

Packer.toBuffer(doc).then(buf=>{
  fs.writeFileSync('/home/claude/20260310_AWS_改修指示書_No18.docx',buf);
  console.log('✓ Generated');
});

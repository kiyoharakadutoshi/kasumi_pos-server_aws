# Claude メモリ情報ログ

出力日時: 2026-03-11  
メモリ件数: 25件

---

## 1. カスミPOSプロジェクト: 基本情報

統合後のリポジトリ名・ディレクトリ名は「POS-SERVER」

## 2. カスミPOSプロジェクト URL

ステージング=https://stg.ignicapos.com/login　本番=https://www.ignicapos.com/login

## 3. カスミPOSプロジェクト インフラ

AWS東京リージョン(ap-northeast-1) https://ap-northeast-1.console.aws.amazon.com/console/home?region=ap-northeast-1#

## 4. カスミPOSプロジェクト GitHubワークフロー

ファイルを作成・更新するときは必ず ① git clone/pull で最新取得 → ② ファイル確認 → ③ 修正・追加 → ④ git add/commit/push の順で行う。  
リポジトリ: https://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@github.com/kiyoharakadutoshi/kasumi_pos-server.git

## 5. カスミPOSプロジェクト DBエンジン

Aurora MySQL 8.0 (PostgreSQL 14ではない)。プライマリ: db.r5.2xlarge, レプリカ: db.t3.medium, Multi-AZ: False

## 6. カスミPOS AWS調査結果: VPC

VPC=vpc-0e2d2d27b6860b7fc(10.238.0.0/16), AZ=1a+1c, サブネット=public/private/protected×1a/1c+common×1a/1c。ALBなし、WAFなし、RDS Proxyなし。

## 7. カスミPOS AWS調査結果 EC2

bastionサーバー(t3.xlarge, 10.238.2.39, 1a), giftcardサーバー(t2.large, 10.238.2.198, 1a)の2台。App Server/Batch Serverはなし。

## 8. カスミPOS AWS調査結果 RDS

Aurora MySQL 8.0クラスター2系統(instance-1/instance-2)。各プライマリdb.r5.2xlarge+レプリカdb.t3.medium。Multi-AZ=False。

## 9. カスミPOS AWS調査結果 Lambda

21関数。主ランタイムはJava17(ksm-posprd系)、一部python3.13/python3.11。メモリ128〜2048MB、タイムアウト300〜900s。

## 10. カスミPOS AWS調査結果 S3バケット

prd-ignica-ksm(メイン), prd-ignica-ksm-master-backup, prd-ignica-ksm-pmlogs, prd-ignica-com-lmd-jar, prd-aeon-gift-card, prd-ignica-com-configrecord等。pos-master-prodは存在しない。

## 11. カスミPOS AWS調査結果 ネットワーク

USMH網との接続はIPSec VPN(vpn-0ea9b7895f78e4c7e, CGW=14.224.146.153, BGP ASN=65000)。Direct ConnectはこのAWSアカウントに存在しない(USMH側アカウント管理の可能性あり)。USMH側CIDR: 10.156.96.0/24(giftcard/SFTP), 172.21.10.0/24(DB接続), 10.156.96.192/26(SFTP)。NAT GW Public IP=57.182.174.110。Bastion: UDP1194(OpenVPN)。

## 12. カスミPOS AWS調査結果 その他

Transfer Family 3サーバー(VPCエンドポイント/S3/ONLINE)。EventBridge: P001監視=cron(00 15 * * ? *)/JST00:00, ItemMaster=cron(30 20 * * ? *)/JST05:30。Route53=ignicapos.com(パブリック)。Secrets Manager: ksm-posprd-sm-db/db-replica/sftp, prd/Mail_Kasumi/Batch_Kasumi/Replica_Kasumi。

## 13. カスミPOS 外部連携ファイルフロー

oc/=基幹データ(BIPROGY/OpenCentral), sg/=POSデータ(VINX/PosSserver), sh/=棚情報(SHARP/P003)。システム概要では「BIPROGY」でなく「外部連携」と記載する。

## 14. カスミPOS AWS調査結果 StepFunctions

7本: oc系=receive-pos-master-oc/import-pos-master-oc/create-txt-file-oc, sg系=receive-and-import-pos-master-sg/create-txt-file-sg, sh系=import-pos-master-sh, 共通=sent-txt-file。SQS(2 FIFOキュー): ksm-posprd-sqs-export-queue-sg.fifo / ksm-posprd-sqs-store-code-queue-sg.fifo (SG専用)。

## 15. カスミPOS LUVINA社内→AWS接続

AWS Client VPN(OpenVPNベース, UDP1194)。PRD接続先=Bastion 10.238.2.39(sg-ec2-bastion), STG接続先=10.239.2.4。VPN接続後にBastionを踏み台としてRDS等内部リソースにアクセス。

## 16. カスミPOS 通信仕様(NAT変換)

①LuvinaAWS→AFSオーソリ: PRD=10.238.2.39→NAT後10.156.96.220→192.168.60.10:1501-1508, STG=10.239.2.4→10.156.96.221→192.168.60.100。②ギフト端末→LuvinaAWS: 10.0.0.0/8→10.156.96.214→PRD:10.238.2.198/STG:10.239.2.193。③LuvinaAWS→NTT DATA CDSセンタ: NAT GW(57.182.174.110)経由でSFTP。

## 17. カスミPOS Transfer Family調査結果

3台(OC:s-2a4905e8210f48248/SG:s-bd974a35aa994c838/SH:s-5546031218784c4ba)。SH系は2025/11途中追加がコスト急増($432→$669)の真因。転送量課金は最大$0.16/月で微小。VPN T2=DOWN(冗長性なし)。認証はSERVICE_MANAGED。SH系S3パスは/pos-original/sh/receive/

## 18. カスミPOS USMH送信フロー確定

Transfer Familyは受信専用。送信はStep Functions(ksm-posprd-sf-sm-sent-txt-file)→Lambda(ksm-posprd-lmd-function-sent-txt-file)が平文FTP(Apache Commons Net FTPClient)でUSMH側FTPサーバーに直接送信。送信先情報(FtpHost/Port/User/Password)はAurora MySQLに格納しget-sync-store Lambdaが取得。送信先パス:/{storeCode}/Recv。S3バックアップ:pos-master/ishida/backup/{storeCode}/。リポジトリ:kasumi_pos-server-batch-isida

## 19. カスミPOS CloudShellログ命名規則

40_AWS/07_ログ/ に以下2種のファイルを管理。  
①YYYYMMDD_CloudShell調査ログ.md = 調査の生ログ（時系列）。同日に同内容を再調査した場合は同セクションに枝番で追記（例: [1]→[1]-2）。  
②00_AWS現状サマリー.md = 内容別の最新状態まとめ（調査のたびに該当セクションを上書き更新）。  
形式は既存の20260308_CloudShell調査ログ.mdに準拠（ヘッダー表、セクション番号[N]、コマンド・受信内容・確認結果、末尾にチャット別索引）。

## 20. Luvina設計書フォーマット(luvina-sekkei-sho)

A4(11906×16838DXA)/余白上下1418・左右1701/コンテンツ幅8504DXA/フォントBIZ UDPゴシック。ヘッダー:赤(C8102E)太字左+グレー(888888)右タブ8504。H1:size:24・pageBreakBefore:true・下罫線E8A0A8。H2:size:18・bold。本文:size:18。フッター:Consolas不可・BIZ UDPゴシック・size:16・666666。テーブル罫線CCCCCC・ShadingType.CLEAR。独立PageBreakは1行余白が出るので使用禁止。

## 21. Luvina設計書 表紙レイアウト

タイトル(赤C8102E・size:32・spacing.before:4800→上から35%) → サブタイトル(黒・size:32・spacing.before:80) → スペーサー(spacing.before:2400) → メタテーブル(幅6000DXA中央・左列2000/右列4000) → ロゴ(spacing.before:1400・90×45px・下ベタ付け)。作成者は必ずThanh Nguyên。

## 22. Luvina設計書 テーブル列幅(全幅8504DXA)

改修一覧=851|2362|3401|945|945/ヘッダーF5F5F5。テスト手順=567|4536|2268|1133/ヘッダーD6E4F0。コード差分=4252|4252/ConsolasフォントSize18。改廃履歴=756|1512|1890|4346。メタ情報=2000|4000(幅6000中央)。対象ファイル=2126|6378。改廃履歴1.0未承認行はcolor:AAAAAA+italic。

## 23. GitHubへのpush後の報告ルール

GitHubへのpush後は必ず「GitHubにアップしました（commit: XXXXXXX）」と明示的に報告すること。

## 24. カスミPOS ファイル命名規則

{Project}_{System}_{No}_{DocType}_{Title}_{lang}.拡張子。バージョン情報はファイル名に含めず、ドキュメント内の改廃履歴セクションで管理する。  
例: Ksm_aws_001_改修指示書_S3バケット名整理_ja_vi.docx。  
Project=Ksm / System=aws・web・gft等 / No=3桁連番 / lang=ja・vi・ja_vi

## 25. カスミPOS ネットワーク接続構成（構成資料スライド6確定）

①Luvina個人PC→AWS Client VPN→LuvinaAWS(PRD:10.238.2.39/STG:10.239.2.4)。②Luvinaオフィス→TP-Link ER605(14.224.146.153)→Site-to-Site VPN→LuvinaAWS。③LuvinaAWS→VPN gateway→Direct Connect(100Mbps)→SmartVPN→USMH閉域網。TP-Link ER605はオフィスS2S用であり個人Client VPNとは別。

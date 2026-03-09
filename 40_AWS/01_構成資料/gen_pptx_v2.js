const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const ASSETS = "/mnt/skills/user/luvina-ppt/assets";
const OUT = "/home/claude/40_AWS/01_構成資料/カスミPOS_AWS構成資料.pptx";

let pres = new pptxgen();
pres.defineLayout({ name: 'LUVINA_A4', width: 10.83, height: 7.50 });
pres.layout = 'LUVINA_A4';
pres.author = 'Thanh Nguyên';
pres.title = 'カスミPOS AWS構成資料';

const C = {
  RED: "D0232A", WHITE: "FFFFFF", BLACK: "000000",
  TEXT_H: "2D2D2D", TEXT_B: "333333", TEXT_SUB: "666666",
  TEXT_MUTED: "555555", TEXT_NOTE: "888888",
  BORDER: "CCCCCC", BG: "F5F5F5",
  GREEN: "228844", ORANGE: "E8A040", BLUE: "2266AA",
};
const LAYERS = {
  client:  { bg: "FFF0F0", border: "D0232A", label: "D0232A", box: "DDDDDD" },
  edge:    { bg: "FFF5EB", border: "E8A040", label: "B07020", box: "E8C080" },
  app:     { bg: "EBF5FF", border: "4488CC", label: "2266AA", box: "AACCEE" },
  data:    { bg: "F0FFF0", border: "44AA66", label: "228844", box: "88CC99" },
  ops:     { bg: "F5F0FF", border: "8866BB", label: "6644AA", box: "BB99DD" },
  ext:     { bg: "FFF8F0", border: "CC8844", label: "AA6622", box: "DDBB88" },
};
const W = 10.83, H = 7.50;
const FOOTER_Y = 7.09, FOOTER_H = 0.43;

function addHeader(s) {
  s.addImage({ path: ASSETS + "/decoration_dots.png", x: 0, y: 0, w: 4.27, h: 3.15 });
  s.addImage({ path: ASSETS + "/luvina_badge.png", x: 0.12, y: 0.12, w: 2.05, h: 0.51 });
  s.addText("LUVINA", { x: 0.48, y: 0.19, w: 1.33, h: 0.36, fontSize: 16, fontFace: "Arial Black", color: C.WHITE, bold: true, margin: 0 });
  s.addImage({ path: ASSETS + "/luvina_logo.png", x: 9.76, y: 0.12, w: 1.02, h: 0.51 });
}
function addFooter(s, num) {
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: FOOTER_Y, w: W, h: FOOTER_H, fill: { color: C.RED } });
  s.addText(String(num), { x: 0.12, y: 7.20, w: 0.50, h: 0.24, fontSize: 10, color: C.WHITE, margin: 0 });
  s.addText("KASUMI POS  AWS構成資料　|　Confidential　|　2026-03-09", {
    x: 0.80, y: 7.18, w: 9.00, h: 0.24, fontSize: 9, color: C.WHITE, margin: 0, align: "right"
  });
}
function addTitleBar(s, title, subtitle) {
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.70, w: W, h: 0.60, fill: { color: C.RED } });
  s.addText(title, { x: 0.33, y: 0.86, w: 10.00, h: 0.39, fontSize: 18, fontFace: "Meiryo", color: C.WHITE, bold: true, margin: 0 });
  if (subtitle) s.addText(subtitle, { x: 0.54, y: 1.43, w: 9.75, h: 0.20, fontSize: 11, fontFace: "Meiryo", color: C.TEXT_MUTED, margin: 0 });
}

// ノードボックス描画
function addNode(s, { x, y, w, h, title, titleColor, bgColor, borderColor, lines, lineColor }) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: bgColor || "FFFFFF" }, line: { color: borderColor || C.BORDER, width: 2 } });
  s.addText(title, { x: x+0.05, y: y+0.05, w: w-0.10, h: 0.38, fontSize: 10, fontFace: "Meiryo", color: titleColor || C.TEXT_H, bold: true, align: "center", margin: 0 });
  if (lines) {
    lines.forEach((l, i) => {
      s.addText(l, { x: x+0.05, y: y+0.48+i*0.26, w: w-0.10, h: 0.24, fontSize: 8, fontFace: "Meiryo", color: lineColor || C.TEXT_B, align: "center", margin: 0 });
    });
  }
}

// コンポーネントボックス（小）
function addBox(s, x, y, w, h, text, bgColor, borderColor, textColor, fontSize) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: bgColor || "FFFFFF" }, line: { color: borderColor || C.BORDER, width: 1 } });
  s.addText(text, { x: x+0.02, y, w: w-0.04, h, fontSize: fontSize || 7.5, fontFace: "Meiryo", color: textColor || C.TEXT_B, align: "center", valign: "middle", margin: 0 });
}

// 矢印ライン（横）
function arrowH(s, x1, y, x2, color, label, labelY) {
  s.addShape(pres.shapes.LINE, { x: x1, y, w: x2-x1, h: 0, line: { color: color || C.RED, width: 2 } });
  s.addText("▶", { x: x2-0.18, y: y-0.13, w: 0.22, h: 0.22, fontSize: 10, color: color || C.RED, margin: 0 });
  if (label) s.addText(label, { x: x1, y: labelY || y-0.32, w: x2-x1, h: 0.24, fontSize: 7.5, fontFace: "Meiryo", color: color || C.RED, align: "center", bold: true, margin: 0 });
}
// 矢印ライン（縦）
function arrowV(s, x, y1, y2, color, label) {
  s.addShape(pres.shapes.LINE, { x, y: y1, w: 0, h: y2-y1, line: { color: color || C.RED, width: 2 } });
  s.addText("▼", { x: x-0.11, y: y2-0.18, w: 0.22, h: 0.22, fontSize: 10, color: color || C.RED, margin: 0 });
  if (label) s.addText(label, { x: x+0.05, y: (y1+y2)/2-0.12, w: 1.40, h: 0.24, fontSize: 7, fontFace: "Meiryo", color: color || C.RED, margin: 0 });
}

// ─────────────────────────────────────
// SLIDE 1: 表紙
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addFooter(s, 1);
  s.addText("カスミ POS / Hệ thống POS KASUMI", { x: 0.50, y: 1.70, w: 9.5, h: 0.70, fontSize: 28, fontFace: "Meiryo", color: C.TEXT_H, bold: true, margin: 0 });
  s.addText("AWS 構成資料 / Tài liệu cấu hình AWS", { x: 0.50, y: 2.50, w: 9.5, h: 0.50, fontSize: 18, fontFace: "Meiryo", color: C.RED, bold: true, margin: 0 });
  s.addText("セキュリティ調査レポート / Báo cáo điều tra bảo mật", { x: 0.50, y: 3.10, w: 9.5, h: 0.35, fontSize: 14, fontFace: "Meiryo", color: C.TEXT_SUB, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 0.50, y: 3.65, w: 9.0, h: 0, line: { color: C.BORDER, width: 1 } });
  const meta = [
    ["対象環境 / Môi trường", "STG (750735758916) / PRD (332802448674)"],
    ["調査日 / Ngày điều tra", "2026年3月9日 / Ngày 09 tháng 03 năm 2026"],
    ["作成者 / Người tạo", "Thanh Nguyên (Luvina Software)"],
    ["次回レビュー / Lần xem xét tiếp theo", "2026年3月16日（毎週月曜日 / Thứ Hai hàng tuần）"],
  ];
  meta.forEach(([label, val], i) => {
    const ry = 3.85 + i * 0.42;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.50, y: ry, w: 3.20, h: 0.34, fill: { color: C.BG }, line: { color: C.BORDER, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.72, y: ry, w: 6.30, h: 0.34, fill: { color: C.WHITE }, line: { color: C.BORDER, width: 0.5 } });
    s.addText(label, { x: 0.56, y: ry+0.04, w: 3.08, h: 0.26, fontSize: 9, fontFace: "Meiryo", color: C.TEXT_B, margin: 0 });
    s.addText(val,   { x: 3.78, y: ry+0.04, w: 6.18, h: 0.26, fontSize: 9, fontFace: "Meiryo", color: C.TEXT_H, margin: 0 });
  });
  s.addImage({ path: ASSETS + "/luvina_logo.png", x: 4.80, y: 6.20, w: 1.10, h: 0.55 });
}

// ─────────────────────────────────────
// SLIDE 2: 目次
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addTitleBar(s, "目次 / Mục lục", null);
  addFooter(s, 2);
  const items = [
    ["01", "ネットワーク構成概要（外部→AWS）", "Tổng quan cấu hình mạng (Ngoài → AWS)"],
    ["02", "AWS内部構成図（STG / PRD VPC）", "Sơ đồ cấu hình nội bộ AWS (STG / PRD VPC)"],
    ["03", "STG環境 — セキュリティ現状と問題影響", "Môi trường STG — Trạng thái bảo mật & Tác động"],
    ["04", "PRD環境 — セキュリティ現状と問題影響", "Môi trường PRD — Trạng thái bảo mật & Tác động"],
    ["05", "外部連携データフロー全体図（OC / SG / SH）", "Sơ đồ luồng dữ liệu liên kết ngoài (OC / SG / SH)"],
    ["06", "リスク一覧・対応ロードマップ", "Danh sách rủi ro & Lộ trình ứng phó"],
  ];
  items.forEach(([num, ja, vi], i) => {
    const y = 1.80 + i * 0.90;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.50, y, w: 0.54, h: 0.54, fill: { color: C.RED } });
    s.addText(num, { x: 0.50, y, w: 0.54, h: 0.54, fontSize: 14, fontFace: "Arial Black", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(ja, { x: 1.20, y: y+0.02, w: 8.50, h: 0.25, fontSize: 14, fontFace: "Meiryo", color: C.TEXT_H, bold: true, margin: 0 });
    s.addText(vi, { x: 1.20, y: y+0.28, w: 8.50, h: 0.22, fontSize: 10, fontFace: "Meiryo", color: C.TEXT_SUB, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 0.50, y: y+0.58, w: 9.80, h: 0, line: { color: C.BORDER, width: 0.5 } });
  });
}

// ─────────────────────────────────────
// SLIDE 3: 【修正版】ネットワーク構成概要（外部→AWS→USMH）
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addTitleBar(s,
    "01 ネットワーク構成概要（外部 → AWS） / Tổng quan cấu hình mạng",
    "Luvina → AWS Site-to-Site VPN + OpenVPN（Bastion）→ STG/PRD VPC → USMH閉域網"
  );
  addFooter(s, 3);

  // ─── Luvinaオフィスボックス ───
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 1.70, w: 2.50, h: 2.60, fill: { color: "EBF5FF" }, line: { color: "4488CC", width: 2 } });
  s.addText("Luvinaオフィス\nVăn phòng Luvina", { x: 0.20, y: 1.72, w: 2.50, h: 0.44, fontSize: 10, fontFace: "Meiryo", color: "2266AA", bold: true, align: "center", margin: 0 });
  s.addText("TP-Link ER605", { x: 0.30, y: 2.20, w: 2.30, h: 0.22, fontSize: 8.5, fontFace: "Meiryo", color: C.TEXT_H, align: "center", bold: true, margin: 0 });
  s.addText("WAN: 14.224.146.153", { x: 0.30, y: 2.42, w: 2.30, h: 0.20, fontSize: 8, fontFace: "Meiryo", color: C.TEXT_B, align: "center", margin: 0 });
  s.addText("LuvinaNet: 118.70.128.3", { x: 0.30, y: 2.62, w: 2.30, h: 0.20, fontSize: 8, fontFace: "Meiryo", color: C.TEXT_B, align: "center", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 0.40, y: 2.85, w: 2.10, h: 0, line: { color: C.BORDER, width: 0.5 } });
  s.addText("Bastion許可: 9IP\n(プレフィックスリスト)", { x: 0.30, y: 2.90, w: 2.30, h: 0.36, fontSize: 7.5, fontFace: "Meiryo", color: C.TEXT_SUB, align: "center", margin: 0 });

  // ─── 矢印①：Site-to-Site VPN ───
  s.addShape(pres.shapes.LINE, { x: 2.72, y: 2.60, w: 1.10, h: 0, line: { color: C.RED, width: 2.5 } });
  s.addText("▶", { x: 3.65, y: 2.52, w: 0.20, h: 0.20, fontSize: 10, color: C.RED, margin: 0 });
  s.addText("① Site-to-Site VPN\nT1: UP / T2: ⚠DOWN", { x: 2.72, y: 2.28, w: 1.12, h: 0.32, fontSize: 7.5, fontFace: "Meiryo", color: C.RED, align: "center", bold: true, margin: 0 });

  // ─── 矢印②：OpenVPN（Bastion UDP 1194）───
  s.addShape(pres.shapes.LINE, { x: 2.72, y: 3.00, w: 1.10, h: 0, line: { color: "E8A040", width: 2, dashType: "dash" } });
  s.addText("▶", { x: 3.65, y: 2.92, w: 0.20, h: 0.20, fontSize: 10, color: "B07020", margin: 0 });
  s.addText("② OpenVPN\nBastion UDP 1194", { x: 2.72, y: 3.10, w: 1.12, h: 0.32, fontSize: 7.5, fontFace: "Meiryo", color: "B07020", align: "center", margin: 0 });

  // ─── AWS外枠 ───
  s.addShape(pres.shapes.RECTANGLE, { x: 3.85, y: 1.60, w: 6.70, h: 3.30, fill: { color: "FAFAFA" }, line: { color: "AAAAAA", width: 1, dashType: "dash" } });
  s.addText("AWS (ap-northeast-1)", { x: 3.90, y: 1.62, w: 3.00, h: 0.22, fontSize: 8, fontFace: "Meiryo", color: "888888", bold: true, margin: 0 });

  // ─── STG VPCボックス ───
  s.addShape(pres.shapes.RECTANGLE, { x: 4.00, y: 1.90, w: 2.80, h: 2.70, fill: { color: "FFF5F5" }, line: { color: C.RED, width: 2 } });
  s.addText("STG VPC\n10.239.0.0/16", { x: 4.00, y: 1.92, w: 2.80, h: 0.40, fontSize: 9, fontFace: "Meiryo", color: C.RED, bold: true, align: "center", margin: 0 });
  s.addText("ALB: web-fe / api-be\n(internet-facing) ⚠️", { x: 4.10, y: 2.36, w: 2.60, h: 0.36, fontSize: 7.5, fontFace: "Meiryo", color: "B07020", align: "center", margin: 0 });
  s.addText("ECS Fargate / EC2 / RDS\nTransfer Family (VPC EP)\nNAT GW / VPC Endpoints", { x: 4.10, y: 2.75, w: 2.60, h: 0.54, fontSize: 7.5, fontFace: "Meiryo", color: C.TEXT_B, align: "center", margin: 0 });
  s.addText("アカウント: 750735758916", { x: 4.10, y: 3.34, w: 2.60, h: 0.20, fontSize: 7, fontFace: "Meiryo", color: C.TEXT_SUB, align: "center", margin: 0 });
  // web-be SG警告バッジ
  s.addShape(pres.shapes.RECTANGLE, { x: 4.08, y: 3.56, w: 2.64, h: 0.26, fill: { color: "FFE0E0" }, line: { color: C.RED, width: 0.8 } });
  s.addText("🔴 web-be SG: ALL 0.0.0.0/0", { x: 4.08, y: 3.56, w: 2.64, h: 0.26, fontSize: 7, fontFace: "Meiryo", color: C.RED, align: "center", valign: "middle", margin: 0 });

  // ─── PRD VPCボックス ───
  s.addShape(pres.shapes.RECTANGLE, { x: 7.20, y: 1.90, w: 3.10, h: 2.70, fill: { color: "F0FFF5" }, line: { color: "44AA66", width: 2 } });
  s.addText("PRD VPC\n10.238.0.0/16", { x: 7.20, y: 1.92, w: 3.10, h: 0.40, fontSize: 9, fontFace: "Meiryo", color: "228844", bold: true, align: "center", margin: 0 });
  s.addText("ALB: なし ✅\nBastion (PL制限済み)", { x: 7.30, y: 2.36, w: 2.90, h: 0.36, fontSize: 7.5, fontFace: "Meiryo", color: C.TEXT_B, align: "center", margin: 0 });
  s.addText("ECS Fargate / EC2 / RDS\nTransfer Family (VPC EP)\nNAT GW / VPC Endpoints", { x: 7.30, y: 2.75, w: 2.90, h: 0.54, fontSize: 7.5, fontFace: "Meiryo", color: C.TEXT_B, align: "center", margin: 0 });
  s.addText("アカウント: 332802448674", { x: 7.30, y: 3.34, w: 2.90, h: 0.20, fontSize: 7, fontFace: "Meiryo", color: C.TEXT_SUB, align: "center", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.28, y: 3.56, w: 2.94, h: 0.26, fill: { color: "E8FFE8" }, line: { color: "44AA66", width: 0.8 } });
  s.addText("✅ GuardDuty / CloudTrail 有効", { x: 7.28, y: 3.56, w: 2.94, h: 0.26, fontSize: 7, fontFace: "Meiryo", color: "228844", align: "center", valign: "middle", margin: 0 });

  // ─── VPN矢印（AWS内STG→PRD、破線）───
  s.addShape(pres.shapes.LINE, { x: 6.82, y: 2.80, w: 0.36, h: 0, line: { color: "AAAAAA", width: 1, dashType: "dash" } });

  // ─── VPNルート矢印 STG→USMH ───
  s.addShape(pres.shapes.LINE, { x: 5.40, y: 4.88, w: 0, h: 0.55, line: { color: "8866BB", width: 2 } });
  s.addText("▼", { x: 5.30, y: 5.30, w: 0.22, h: 0.20, fontSize: 10, color: "8866BB", margin: 0 });
  s.addText("VPNルート\n172.21.10.0/24\nRDS TCP3306", { x: 5.46, y: 4.88, w: 1.30, h: 0.54, fontSize: 7, fontFace: "Meiryo", color: "6644AA", margin: 0 });

  // ─── USMH閉域網ボックス ───
  s.addShape(pres.shapes.RECTANGLE, { x: 3.85, y: 5.52, w: 3.00, h: 0.80, fill: { color: "F5F0FF" }, line: { color: "8866BB", width: 2 } });
  s.addText("USMH 閉域網 / Mạng kín USMH\n172.21.10.0/24", { x: 3.85, y: 5.52, w: 3.00, h: 0.80, fontSize: 9, fontFace: "Meiryo", color: "6644AA", bold: true, align: "center", valign: "middle", margin: 0 });

  // ─── AWS外枠の「外」ラベル ───
  s.addText("← AWS内部経由でアクセス（Truy cập qua nội bộ AWS）", { x: 3.85, y: 6.38, w: 6.70, h: 0.22, fontSize: 7.5, fontFace: "Meiryo", color: "888888", align: "center", margin: 0 });

  // ─── 凡例 ───
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 5.35, w: 3.50, h: 1.40, fill: { color: C.BG }, line: { color: C.BORDER, width: 0.5 } });
  s.addText("凡例 / Chú giải:", { x: 0.32, y: 5.40, w: 3.20, h: 0.22, fontSize: 9, fontFace: "Meiryo", color: C.TEXT_H, bold: true, margin: 0 });
  [
    ["─── 赤実線", "Site-to-Site VPN（実経路）"],
    ["- - 橙破線", "OpenVPN / Bastion (UDP1194)"],
    ["─── 紫", "VPNルート → USMH閉域網"],
    ["⚠️ 橙", "要是正項目"],
    ["🔴 赤", "即時対応必要"],
    ["✅ 緑", "安全確認済み"],
  ].forEach(([k, v], i) => {
    s.addText(`${k}: ${v}`, { x: 0.32, y: 5.64+i*0.17, w: 3.30, h: 0.17, fontSize: 7.5, fontFace: "Meiryo", color: C.TEXT_B, margin: 0 });
  });
}

// ─────────────────────────────────────
// SLIDE 4: AWS内部構成図（STG/PRD VPC詳細）
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addTitleBar(s,
    "02 AWS内部構成図（STG / PRD VPC） / Sơ đồ cấu hình nội bộ AWS",
    "各VPC内のサービス配置・通信フロー　|　Bố trí dịch vụ và luồng giao tiếp trong từng VPC"
  );
  addFooter(s, 4);

  // ── Internet（上部）──
  s.addShape(pres.shapes.RECTANGLE, { x: 3.50, y: 1.72, w: 3.80, h: 0.34, fill: { color: "EEEEEE" }, line: { color: "AAAAAA", width: 1 } });
  s.addText("Internet / インターネット（STGのみ公開 / Chỉ STG công khai）", { x: 3.50, y: 1.72, w: 3.80, h: 0.34, fontSize: 8, fontFace: "Meiryo", color: "666666", align: "center", valign: "middle", margin: 0 });

  // ── Internet Gateway（STG）──
  arrowV(s, 5.40, 2.08, 2.44, C.RED, "");
  s.addShape(pres.shapes.RECTANGLE, { x: 4.20, y: 2.44, w: 2.40, h: 0.28, fill: { color: "FFE0E0" }, line: { color: C.RED, width: 1 } });
  s.addText("Internet Gateway (STG) / ⚠️ api-be ALB: internet-facing", { x: 4.20, y: 2.44, w: 2.40, h: 0.28, fontSize: 7, fontFace: "Meiryo", color: C.RED, align: "center", valign: "middle", bold: true, margin: 0 });

  // ── Public Subnet（Bastion + NAT GW）──
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 2.78, w: 10.40, h: 0.76, fill: { color: "FFFDE0" }, line: { color: "CCAA00", width: 1, dashType: "dash" } });
  s.addText("パブリックサブネット / Public Subnet", { x: 0.25, y: 2.79, w: 2.20, h: 0.18, fontSize: 7, fontFace: "Meiryo", color: "998800", bold: true, margin: 0 });
  // Bastion
  addBox(s, 0.30, 2.98, 1.60, 0.48, "EC2 Bastion\n46.51.249.130(STG)\n3.115.168.92(PRD)", "FFFFFF", "CCAA00", C.TEXT_B, 6.5);
  // NAT GW
  addBox(s, 2.10, 2.98, 1.40, 0.48, "NAT Gateway\n52.196.152.170(STG)", "FFFFFF", "CCAA00", C.TEXT_B, 6.5);
  // ALB web-fe
  addBox(s, 3.70, 2.98, 2.20, 0.48, "ALB web-fe (STG)\ninternet-facing\n80→443 redirect", "FFE0E0", C.RED, C.RED, 6.5);
  // ALB api-be（警告）
  addBox(s, 6.10, 2.98, 2.20, 0.48, "ALB api-be (STG) ⚠️\ninternet-facing\n→ internal化推奨", "FFEECC", "E8A040", "B07020", 6.5);
  // PRD: ALBなし
  addBox(s, 8.50, 2.98, 2.00, 0.48, "PRD: ALBなし ✅\nBastion経由のみ\n(PL制限済み)", "E8FFE8", "44AA66", "228844", 6.5);

  // ── Private Subnet（App層）──
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 3.60, w: 10.40, h: 0.82, fill: { color: "EBF5FF" }, line: { color: "4488CC", width: 1, dashType: "dash" } });
  s.addText("プライベートサブネット（App層）/ Private Subnet (App)", { x: 0.25, y: 3.61, w: 3.20, h: 0.18, fontSize: 7, fontFace: "Meiryo", color: "2266AA", bold: true, margin: 0 });
  // ECS web-fe
  addBox(s, 0.30, 3.82, 1.60, 0.48, "ECS Fargate\nweb-fe\n(React Frontend)", "FFFFFF", "AACCEE", C.TEXT_B, 6.5);
  // ECS api-be
  addBox(s, 2.10, 3.82, 1.60, 0.48, "ECS Fargate\napi-be\n(Spring Boot API)", "FFFFFF", "AACCEE", C.TEXT_B, 6.5);
  // EC2 web-be
  addBox(s, 3.90, 3.82, 1.60, 0.48, "EC2 web-be\n🔴 SG: ALL\n0.0.0.0/0 要削除", "FFE0E0", C.RED, C.RED, 6.5);
  // EC2 giftcard
  addBox(s, 5.70, 3.82, 1.50, 0.48, "EC2\ngiftcard\n(Gift Card SVC)", "FFFFFF", "AACCEE", C.TEXT_B, 6.5);
  // Lambda
  addBox(s, 7.40, 3.82, 1.50, 0.48, "Lambda\n23本(STG)/21本(PRD)\n一部VPC外 ⚠️", "FFFBF0", "E8A040", "B07020", 6.5);
  // Transfer Family
  addBox(s, 9.10, 3.82, 1.45, 0.48, "Transfer Family\nSFTP×3\n(VPC EP) ✅", "E8FFE8", "44AA66", "228844", 6.5);

  // ── Private Subnet（Data層）──
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 4.48, w: 10.40, h: 0.82, fill: { color: "F0FFF0" }, line: { color: "44AA66", width: 1, dashType: "dash" } });
  s.addText("プライベートサブネット（Data層）/ Private Subnet (Data)", { x: 0.25, y: 4.49, w: 3.20, h: 0.18, fontSize: 7, fontFace: "Meiryo", color: "228844", bold: true, margin: 0 });
  // RDS Aurora
  addBox(s, 0.30, 4.70, 2.10, 0.48, "RDS Aurora MySQL\n×4インスタンス\nPubliclyAccessible=False ✅", "FFFFFF", "88CC99", C.TEXT_B, 6.5);
  // Secrets Manager
  addBox(s, 2.60, 4.70, 1.50, 0.48, "Secrets\nManager\n(VPC EP) ✅", "FFFFFF", "88CC99", C.TEXT_B, 6.5);
  // S3
  addBox(s, 4.30, 4.70, 1.60, 0.48, "S3\n全バケット\nPublicBlock ✅", "FFFFFF", "88CC99", C.TEXT_B, 6.5);
  // SQS/SNS
  addBox(s, 6.10, 4.70, 1.40, 0.48, "SQS / SNS\n(EventBridge)\n非同期連携", "FFFFFF", "88CC99", C.TEXT_B, 6.5);
  // KMS
  addBox(s, 7.70, 4.70, 1.00, 0.48, "KMS\n(VPC EP)\n暗号化 ✅", "FFFFFF", "88CC99", C.TEXT_B, 6.5);
  // ECR
  addBox(s, 8.90, 4.70, 1.65, 0.48, "ECR\n(VPC EP) ✅\nコンテナ管理", "FFFFFF", "88CC99", C.TEXT_B, 6.5);

  // ── 監視・運用層 ──
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 5.36, w: 10.40, h: 0.60, fill: { color: "F5F0FF" }, line: { color: "8866BB", width: 1, dashType: "dash" } });
  s.addText("監視・運用 / Giám sát & Vận hành", { x: 0.25, y: 5.37, w: 2.20, h: 0.18, fontSize: 7, fontFace: "Meiryo", color: "6644AA", bold: true, margin: 0 });
  const opsItems = [
    ["CloudWatch\n(STG/PRD)", "BB99DD"],
    ["CloudTrail\n✅PRD\n🔴STGなし", "BB99DD"],
    ["GuardDuty\n✅PRD\n🔴STG無効", "BB99DD"],
    ["Security Hub\n✅PRD\n🔴STG無効", "BB99DD"],
    ["VPC\nFlow Logs\n⚠️PRD REJECT", "BB99DD"],
    ["SSM\nSession Mgr\n(Bastion代替)", "BB99DD"],
  ];
  opsItems.forEach(([text, brd], i) => {
    addBox(s, 0.30 + i*1.72, 5.58, 1.62, 0.30, text, "FFFFFF", brd, "6644AA", 6.5);
  });

  // ── USMH ──
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 6.02, w: 3.50, h: 0.50, fill: { color: "F5F0FF" }, line: { color: "8866BB", width: 1.5 } });
  s.addText("USMH 閉域網 172.21.10.0/24  ─  RDS TCP 3306へVPNルート経由でアクセス / Truy cập RDS qua VPN Route", { x: 0.22, y: 6.02, w: 3.46, h: 0.50, fontSize: 7, fontFace: "Meiryo", color: "6644AA", align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 1.35, y: 5.36, w: 0, h: 0.66, line: { color: "8866BB", width: 1.5, dashType: "dash" } });
}

// ─────────────────────────────────────
// SLIDE 5: STG セキュリティ現状 + 問題が発生した場合
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addTitleBar(s,
    "03 STG環境 — セキュリティ現状と問題影響 / Môi trường STG — Trạng thái & Tác động",
    "アカウント: 750735758916　|　🔴 = 対応しないと発生するリスク"
  );
  addFooter(s, 5);

  const rows = [
    {
      item: "GuardDuty\n無効 🔴",
      status: "無効\nVô hiệu",
      bad: "不正アクセス・マルウェア活動を検知できず\n侵害発生後に気づかない",
      sev: "🔴"
    },
    {
      item: "CloudTrail\nなし 🔴",
      status: "証跡なし\nKhông có log",
      bad: "誰がいつ何をしたか追跡不可\nインシデント調査・監査が不可能",
      sev: "🔴"
    },
    {
      item: "web-be SG\nALL許可 🔴",
      status: "0.0.0.0/0\n全ポート開放",
      bad: "全ポート・全プロトコルへの外部接続が可能\nスキャン・ブルートフォース・RCE攻撃の直接入口",
      sev: "🔴"
    },
    {
      item: "api-be ALB\ninternet-facing ⚠️",
      status: "BE直接公開\nCông khai trực tiếp",
      bad: "APIが認証なしで外部スキャン可能\nレート制限なければDoS攻撃のリスク",
      sev: "⚠️"
    },
    {
      item: "MFA未設定\n7名 🔴",
      status: "全員未設定\n7 người chưa MFA",
      bad: "パスワード漏洩1件でAWSアカウント乗っ取り\nIAM操作ログを消去・バックドア設置が可能",
      sev: "🔴"
    },
    {
      item: "PowerUserAccess\nlmd ロール 🔴",
      status: "ほぼ全サービス\nフルアクセス",
      bad: "Lambda侵害時にEC2/RDS/S3/IAM等\n全リソースへの横展開が可能",
      sev: "🔴"
    },
    {
      item: "VPC Flow Logs\nなし 🔴",
      status: "ログなし\nKhông có log",
      bad: "不審な通信パターンを検知・事後分析できず\nサイバー攻撃の痕跡が消える",
      sev: "🔴"
    },
    {
      item: "VPN PSK\nログ露出 🔴",
      status: "チャット\nに平文露出",
      bad: "第三者がVPNトンネルに侵入し\n内部RDS・ECSへの不正アクセスが可能",
      sev: "🔴"
    },
  ];

  const hdr = [
    { text: "項目\nHạng mục", options: { fill: { color: C.RED }, color: C.WHITE, bold: true, fontSize: 8.5, fontFace: "Meiryo", align: "center", valign: "middle" } },
    { text: "現状\nTrạng thái", options: { fill: { color: C.RED }, color: C.WHITE, bold: true, fontSize: 8.5, fontFace: "Meiryo", align: "center", valign: "middle" } },
    { text: "対応しないと発生する問題\nVấn đề nếu không xử lý", options: { fill: { color: "8B0000" }, color: C.WHITE, bold: true, fontSize: 8.5, fontFace: "Meiryo", align: "center", valign: "middle" } },
  ];
  const tbl = [hdr];
  rows.forEach((r, i) => {
    const bg1 = i % 2 === 0 ? "FFFFFF" : "FFF9F9";
    const bg2 = r.sev === "🔴" ? "FFF0F0" : "FFFBF0";
    tbl.push([
      { text: r.item, options: { fill: { color: bg1 }, color: C.TEXT_H, fontSize: 8, fontFace: "Meiryo", valign: "middle" } },
      { text: r.status, options: { fill: { color: bg2 }, color: r.sev === "🔴" ? C.RED : "B07020", fontSize: 8, fontFace: "Meiryo", align: "center", valign: "middle", bold: true } },
      { text: r.bad, options: { fill: { color: bg1 }, color: C.TEXT_H, fontSize: 7.5, fontFace: "Meiryo", valign: "middle" } },
    ]);
  });
  s.addTable(tbl, {
    x: 0.25, y: 1.76, w: 10.30,
    colW: [2.00, 2.10, 6.20],
    border: { pt: 0.5, color: C.BORDER }, rowH: 0.60
  });
  s.addText("✅ 安全確認: S3パブリックブロック / RDS非公開 / Transfer Family VPC EP / Root MFA有効 / SSMセッション本人のみ / NAT通信量正常", {
    x: 0.25, y: 6.75, w: 10.30, h: 0.22, fontSize: 7, fontFace: "Meiryo", color: "228844", margin: 0
  });
}

// ─────────────────────────────────────
// SLIDE 6: PRD セキュリティ現状 + 問題影響
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addTitleBar(s,
    "04 PRD環境 — セキュリティ現状と問題影響 / Môi trường PRD — Trạng thái & Tác động",
    "アカウント: 332802448674　|　本番環境のため影響が特に大きい"
  );
  addFooter(s, 6);

  const rows = [
    { item: "MFA未設定\n7名 🔴", status: "全員未設定\n7 người", bad: "パスワード漏洩1件で本番DBへの\nフルアクセス権限を持つアカウント乗っ取り", sev: "🔴" },
    { item: "PowerUserAccess\nlmd 🔴", status: "ほぼ全サービス\nフルアクセス", bad: "Lambda侵害→本番RDS/顧客データ/\nS3全データへの横展開・削除が可能", sev: "🔴" },
    { item: "Root使用\n(GuardDuty検知) ⚠️", status: "2件 / 2026-02-04\nLuvina IP", bad: "rootが習慣化すると誤操作でアカウント削除等\nの重大インシデントが発生するリスク", sev: "⚠️" },
    { item: "VPN PSK\nログ露出 🔴", status: "チャット\nに平文露出", bad: "本番VPNへの不正侵入→\n本番RDS・機密データへの直接アクセス", sev: "🔴" },
    { item: "VPC Flow Logs\nREJECTのみ ⚠️", status: "REJECT\nのみ記録", bad: "許可された通信が記録されず\n内部からのデータ持ち出しを検知できない", sev: "⚠️" },
    { item: "アクセスキー\n200日超 ⚠️", status: "daisuke: 225日\nkiyohara: 207日", bad: "長期未ローテーションキーは漏洩リスクが高く\n漏洩時の影響期間が長くなる", sev: "⚠️" },
    { item: "ECSロール\nSM ReadWrite ⚠️", status: "書き込み権限\nが過剰", bad: "ECSタスク侵害時にシークレット値を\n書き換えられサービス全体が停止するリスク", sev: "⚠️" },
    { item: "パスワード\nポリシーなし 🔴", status: "未設定\nChưa thiết lập", bad: "短いパスワード・使いまわしが許容され\nブルートフォース攻撃に対して脆弱", sev: "🔴" },
  ];

  const hdr = [
    { text: "項目\nHạng mục", options: { fill: { color: C.RED }, color: C.WHITE, bold: true, fontSize: 8.5, fontFace: "Meiryo", align: "center", valign: "middle" } },
    { text: "現状\nTrạng thái", options: { fill: { color: C.RED }, color: C.WHITE, bold: true, fontSize: 8.5, fontFace: "Meiryo", align: "center", valign: "middle" } },
    { text: "対応しないと発生する問題\nVấn đề nếu không xử lý", options: { fill: { color: "8B0000" }, color: C.WHITE, bold: true, fontSize: 8.5, fontFace: "Meiryo", align: "center", valign: "middle" } },
  ];
  const tbl = [hdr];
  rows.forEach((r, i) => {
    const bg1 = i % 2 === 0 ? "FFFFFF" : "F9F9F9";
    const bg2 = r.sev === "🔴" ? "FFF0F0" : "FFFBF0";
    tbl.push([
      { text: r.item, options: { fill: { color: bg1 }, color: C.TEXT_H, fontSize: 8, fontFace: "Meiryo", valign: "middle" } },
      { text: r.status, options: { fill: { color: bg2 }, color: r.sev === "🔴" ? C.RED : "B07020", fontSize: 8, fontFace: "Meiryo", align: "center", valign: "middle", bold: true } },
      { text: r.bad, options: { fill: { color: bg1 }, color: C.TEXT_H, fontSize: 7.5, fontFace: "Meiryo", valign: "middle" } },
    ]);
  });
  s.addTable(tbl, {
    x: 0.25, y: 1.76, w: 10.30,
    colW: [2.00, 2.10, 6.20],
    border: { pt: 0.5, color: C.BORDER }, rowH: 0.60
  });
  s.addText("✅ 安全確認: ALBなし(内部のみ) / S3パブリックブロック / RDS非公開 / Bastion PLリスト / CloudTrail有効 / GuardDuty有効 / Root MFA有効", {
    x: 0.25, y: 6.75, w: 10.30, h: 0.22, fontSize: 7, fontFace: "Meiryo", color: "228844", margin: 0
  });
}

// ─────────────────────────────────────
// SLIDE 7: 外部連携データフロー全体図
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addTitleBar(s,
    "05 外部連携データフロー全体図（OC / SG / SH） / Sơ đồ luồng dữ liệu liên kết ngoài",
    "受信: Transfer Family SFTP → S3 → EventBridge → Step Functions / Lambda　|　送信: Lambda FTP → USMH"
  );
  addFooter(s, 7);

  // ─ 凡例 ─
  const legendItems = [["OC系 (BIPROGY)", "4472C4"], ["SG系 (VINX)", "70AD47"], ["SH系 (SHARP)", "ED7D31"], ["夜間バッチ", "9966BB"], ["送信フロー", "C8102E"]];
  legendItems.forEach(([lbl, col], i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.30 + i * 2.06, y: 1.72, w: 0.16, h: 0.16, fill: { color: col } });
    s.addText(lbl, { x: 0.50 + i * 2.06, y: 1.70, w: 1.80, h: 0.20, fontSize: 7.5, fontFace: "Meiryo", color: C.TEXT_B, margin: 0 });
  });

  // ─ ゾーンヘッダー ─
  const zones = [
    { label: "外部送信元\nNguồn bên ngoài", x: 0.20, w: 1.70, col: "EEEEEE" },
    { label: "Transfer Family\n(SFTP受信 / VPC EP)", x: 2.00, w: 1.70, col: "E8F5E9" },
    { label: "S3\n(prd/stg-ignica-ksm)", x: 3.80, w: 1.70, col: "E3F2FD" },
    { label: "EventBridge →\nStep Functions", x: 5.60, w: 1.70, col: "FFF3E0" },
    { label: "Lambda /\nAurora MySQL", x: 7.40, w: 1.70, col: "FCE4EC" },
    { label: "出力先\nĐích đến", x: 9.20, w: 1.40, col: "F3E5F5" },
  ];
  zones.forEach(z => {
    s.addShape(pres.shapes.RECTANGLE, { x: z.x, y: 1.96, w: z.w, h: 0.40, fill: { color: z.col }, line: { color: C.BORDER, width: 0.5 } });
    s.addText(z.label, { x: z.x, y: 1.96, w: z.w, h: 0.40, fontSize: 7, fontFace: "Meiryo", color: C.TEXT_B, align: "center", valign: "middle", bold: true, margin: 0 });
  });

  // ─ ヘルパー: フローボックス ─
  function fb(s, x, y, w, h, text, bgHex, bdHex, txHex, fs) {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: bgHex }, line: { color: bdHex, width: 1 } });
    s.addText(text, { x: x+0.03, y, w: w-0.06, h, fontSize: fs||7.5, fontFace: "Meiryo", color: txHex||C.TEXT_B, align: "center", valign: "middle", margin: 0 });
  }
  function arr(s, x1, y, x2, col) {
    s.addShape(pres.shapes.LINE, { x: x1, y, w: x2-x1-0.14, h: 0, line: { color: col, width: 1.5 } });
    s.addText("▶", { x: x2-0.18, y: y-0.11, w: 0.18, h: 0.20, fontSize: 9, color: col, margin: 0 });
  }

  // ── OC系（行1: y=2.46）──
  const yOC = 2.46; const hR = 0.44; const COC = "4472C4";
  fb(s, 0.22, yOC, 1.66, hR, "BIPROGY\n(OpenCentral)", "EBF3FB", COC, COC, 7);
  arr(s, 1.88, yOC+hR/2, 2.02, COC);
  fb(s, 2.02, yOC, 1.66, hR, "tf-server-oc\n10.238.2.221/3.138", "E8F5E9", COC, COC, 7);
  arr(s, 3.68, yOC+hR/2, 3.82, COC);
  fb(s, 3.82, yOC, 1.66, hR, "oc/receive/\n*.end / *.END", "E3F2FD", COC, COC, 7);
  arr(s, 5.48, yOC+hR/2, 5.62, COC);
  fb(s, 5.62, yOC, 1.66, hR, "eb-rule-receive-\npos-master-oc\n→ SF: receive-oc", "FFF3E0", COC, COC, 7);
  arr(s, 7.28, yOC+hR/2, 7.42, COC);
  fb(s, 7.42, yOC, 1.66, hR, "Lambda:\nimport-oc\n→ Aurora MySQL", "FCE4EC", COC, COC, 7);
  arr(s, 9.08, yOC+hR/2, 9.22, COC);
  fb(s, 9.22, yOC, 1.36, hR, "Aurora\nMySQL\n✅", "EBF3FB", COC, COC, 7);

  // ── SH系（行2: y=3.02）──
  const ySH = 3.02; const CSH = "ED7D31";
  fb(s, 0.22, ySH, 1.66, hR, "SHARP\n(P003)", "FFF3E0", CSH, CSH, 7);
  arr(s, 1.88, ySH+hR/2, 2.02, CSH);
  fb(s, 2.02, ySH, 1.66, hR, "tf-server-sh\n10.238.2.184/3.139", "E8F5E9", CSH, CSH, 7);
  arr(s, 3.68, ySH+hR/2, 3.82, CSH);
  fb(s, 3.82, ySH, 1.66, hR, "sh/receive/\n*.end / *.END", "E3F2FD", CSH, CSH, 7);
  arr(s, 5.48, ySH+hR/2, 5.62, CSH);
  fb(s, 5.62, ySH, 1.66, hR, "eb-rule-receive-\npos-master-sh\n→ SF: import-sh", "FFF3E0", CSH, CSH, 7);
  arr(s, 7.28, ySH+hR/2, 7.42, CSH);
  fb(s, 7.42, ySH, 1.66, hR, "Lambda:\nimport-sh\n→ Aurora MySQL", "FCE4EC", CSH, CSH, 7);
  arr(s, 9.08, ySH+hR/2, 9.22, CSH);
  fb(s, 9.22, ySH, 1.36, hR, "Aurora\nMySQL\n✅", "FFF3E0", CSH, CSH, 7);

  // ── SG系（行3〜4: 受信＋送信）──
  const ySG1 = 3.58; const CSG = "70AD47";
  fb(s, 0.22, ySG1, 1.66, hR, "VINX\n(POS Server)", "F1F8E9", CSG, CSG, 7);
  arr(s, 1.88, ySG1+hR/2, 2.02, CSG);
  fb(s, 2.02, ySG1, 1.66, hR, "tf-server-sg\n10.238.2.234/3.215", "E8F5E9", CSG, CSG, 7);
  arr(s, 3.68, ySG1+hR/2, 3.82, CSG);
  fb(s, 3.82, ySG1, 1.66, hR, "sg/receive/\n*.zip / *.ZIP", "E3F2FD", CSG, CSG, 7);
  arr(s, 5.48, ySG1+hR/2, 5.62, CSG);
  fb(s, 5.62, ySG1, 1.66, hR, "eb-rule-receive-\npos-master-sg\n→ SF: receive-sg", "FFF3E0", CSG, CSG, 7);
  arr(s, 7.28, ySG1+hR/2, 7.42, CSG);
  fb(s, 7.42, ySG1, 1.66, hR, "S3:\nsg/csv/\n*/*.ENDEXPORT", "F1F8E9", CSG, CSG, 7);
  // ENDEXPORT→次段へ縦矢印
  s.addShape(pres.shapes.LINE, { x: 8.25, y: 4.02, w: 0, h: 0.22, line: { color: CSG, width: 1.5 } });
  s.addText("▼", { x: 8.16, y: 4.18, w: 0.18, h: 0.18, fontSize: 9, color: CSG, margin: 0 });

  const ySG2 = 4.24; // SG送信段
  // 夜間バッチ トリガー
  const CNIGHT = "9966BB";
  fb(s, 0.22, ySG2, 1.66, hR, "EventBridge cron\nJST 05:30毎日\n(night-export-sg)", "F5F0FF", CNIGHT, CNIGHT, 6.5);
  arr(s, 1.88, ySG2+hR/2, 2.02, CNIGHT);
  fb(s, 2.02, ySG2, 1.66, hR, "Lambda:\ncreate-file-end-\nfor-night", "F5F0FF", CNIGHT, CNIGHT, 6.5);
  arr(s, 3.68, ySG2+hR/2, 3.82, CNIGHT);
  fb(s, 3.82, ySG2, 1.66, hR, "sg/csv/\nSG_night_export_\n*.ENDEXPORT", "E3F2FD", CNIGHT, CNIGHT, 6.5);
  arr(s, 5.48, ySG2+hR/2, 5.62, CSG);
  fb(s, 5.62, ySG2, 1.66, hR, "eb-rule-create-\ntxt-file-sg\n→ SF: create-txt", "FFF3E0", CSG, CSG, 6.5);
  arr(s, 7.28, ySG2+hR/2, 7.42, CSG);
  fb(s, 7.42, ySG2, 1.66, hR, "Lambda:\nsent-txt-file\n平文FTP (Commons)", "FCE4EC", "C8102E", "C8102E", 6.5);
  arr(s, 9.08, ySG2+hR/2, 9.22, "C8102E");
  fb(s, 9.22, ySG2, 1.36, hR, "USMH\nFTP Server\n/{store}/Recv", "FCE4EC", "C8102E", "C8102E", 6.5);

  // SG2への合流線（store_list取得の注釈）
  s.addText("store_list(SyncFlag=1)\n→ DB(Secrets Manager)", { x: 2.02, y: ySG2+hR+0.02, w: 1.66, h: 0.30, fontSize: 6.5, fontFace: "Meiryo", color: "888888", align: "center", margin: 0 });

  // ─ 注釈 ─
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 5.06, w: 10.40, h: 0.30, fill: { color: "FFF8E1" }, line: { color: "E8A040", width: 0.5 } });
  s.addText(
    "⚠️ sent-txt-file Lambda は平文FTP（Apache Commons Net）を使用。VPN内通信のため実害は低いが、将来的なFTPS化を推奨。",
    { x: 0.26, y: 5.06, w: 10.28, h: 0.30, fontSize: 7.5, fontFace: "Meiryo", color: "B07020", valign: "middle", margin: 0 }
  );
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 5.40, w: 10.40, h: 0.28, fill: { color: "F1F8E9" }, line: { color: CSG, width: 0.5 } });
  s.addText(
    "✅ SG受信フロー: VINX→SFTP PUT→tf-server-sg→S3→EB→SF(import) → S3(.ENDEXPORT) → EB → SF(create-txt) → Lambda FTP送信",
    { x: 0.26, y: 5.40, w: 10.28, h: 0.28, fontSize: 7.5, fontFace: "Meiryo", color: "228844", valign: "middle", margin: 0 }
  );
  s.addShape(pres.shapes.RECTANGLE, { x: 0.20, y: 5.72, w: 10.40, h: 0.28, fill: { color: "F5F0FF" }, line: { color: CNIGHT, width: 0.5 } });
  s.addText(
    "🌙 夜間バッチ: EventBridge cron(05:30) → Lambda(create-file-end-for-night) → DB(store_list取得) → 各店舗分.ENDEXPORTをS3に生成 → 送信フローに合流",
    { x: 0.26, y: 5.72, w: 10.28, h: 0.28, fontSize: 7.5, fontFace: "Meiryo", color: CNIGHT, valign: "middle", margin: 0 }
  );
}

// ─────────────────────────────────────
// SLIDE 8: リスク一覧 + ロードマップ
// ─────────────────────────────────────
{
  let s = pres.addSlide();
  s.background = { color: C.WHITE };
  addHeader(s);
  addTitleBar(s, "06 対応ロードマップ / Lộ trình ứng phó", "2026年3月〜4月 / Tháng 3〜4 năm 2026");
  addFooter(s, 8);

  const phases = [
    {
      label: "PHASE 1\n今週中", sub: "Tuần này", color: C.RED,
      items: [
        "VPN PSK ローテーション\n→ 放置: VPN不正侵入",
        "MFA 全ユーザー強制\n→ 放置: アカウント乗っ取り",
        "web-be SG (-1) 削除\n→ 放置: 全ポート外部公開",
        "GuardDuty 有効化(STG)\n→ 放置: 攻撃に気づかない",
        "CloudTrail 有効化(STG)\n→ 放置: 証跡ゼロ",
        "PowerUserAccess 削除\n→ 放置: 全リソース横展開可",
      ]
    },
    {
      label: "PHASE 2\n3月中", sub: "Tháng 3", color: "E8A040",
      items: [
        "パスワードポリシー設定\n→ 放置: 弱パスワード許容",
        "VPC Flow Logs 整備\n→ 放置: 通信の証跡なし",
        "api-be ALB → internal\n→ 放置: BE直接スキャン",
        "アクセスキーローテーション\n→ 放置: 漏洩リスク増大",
        "Security Hub 有効化(STG)\n→ 放置: 設定ミス検知不可",
        "ECSロール ReadOnly化\n→ 放置: シークレット書換可",
      ]
    },
    {
      label: "PHASE 3\n4月中", sub: "Tháng 4", color: "228844",
      items: [
        "VPN T2 復旧\n→ 放置: 冗長性ゼロ",
        "CGW Vangle残骸 削除\n→ 放置: 不審リソース残存",
        "S3ポリシー最小権限化\n→ 放置: 過剰なアクセス許可",
        "Lambda VPC配置検討\n→ 放置: VPC外通信が残る",
        "週次チェック運用開始\n→ 設定変化を継続監視",
        "STG/PRD定期レビュー\n→ 月1回現状確認",
      ]
    }
  ];

  phases.forEach((p, i) => {
    const px = 0.30 + i * 3.50;
    const pw = 3.30;
    s.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.72, w: pw, h: 0.58, fill: { color: p.color } });
    s.addText(p.label, { x: px, y: 1.72, w: pw, h: 0.40, fontSize: 13, fontFace: "Arial Black", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(p.sub,   { x: px, y: 2.12, w: pw, h: 0.18, fontSize: 9, fontFace: "Meiryo", color: C.WHITE, align: "center", margin: 0 });

    p.items.forEach((item, j) => {
      const iy = 2.42 + j * 0.74;
      const lines = item.split("\n");
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: iy, w: pw, h: 0.66, fill: { color: C.BG }, line: { color: C.BORDER, width: 0.5 } });
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: iy, w: 0.06, h: 0.66, fill: { color: p.color } });
      s.addText(lines[0], { x: px+0.12, y: iy+0.04, w: pw-0.18, h: 0.26, fontSize: 8.5, fontFace: "Meiryo", color: C.TEXT_H, bold: true, margin: 0 });
      s.addText(lines[1] || "", { x: px+0.12, y: iy+0.34, w: pw-0.18, h: 0.28, fontSize: 7.5, fontFace: "Meiryo", color: C.RED, margin: 0 });
    });
  });
}

// ── 出力 ──
const dir = path.dirname(OUT);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
pres.writeFile({ fileName: OUT }).then(() => {
  console.log("✅ PPTX生成完了:", OUT);
}).catch(e => console.error("❌", e));

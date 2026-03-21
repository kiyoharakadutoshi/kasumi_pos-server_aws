#!/bin/bash
# =============================================================
# web-fe / web-be プロセス・設定確認スクリプト
# 実行: AWS CloudShell (DEV: 891376952870)
# 対象: ksm-posspk-ec2-instance-web-fe (i-027af978d9452d713)
#       ksm-posspk-ec2-instance-web-be (i-05fdf2857655d4561)
# 日付: 2026-03-21
# =============================================================

echo "============================================"
echo "  [1/2] web-fe (i-027af978d9452d713) 調査"
echo "============================================"

aws ssm send-command \
  --instance-ids "i-027af978d9452d713" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo === HOSTNAME ===",
    "hostname",
    "echo",
    "echo === PS AUX (top 30 by memory) ===",
    "ps aux --sort=-%mem | head -30",
    "echo",
    "echo === LISTENING PORTS ===",
    "ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null",
    "echo",
    "echo === NGINX MAIN CONF ===",
    "cat /etc/nginx/nginx.conf 2>/dev/null || echo NGINX_NOT_FOUND",
    "echo",
    "echo === NGINX CONF.D ===",
    "ls -la /etc/nginx/conf.d/ 2>/dev/null && cat /etc/nginx/conf.d/*.conf 2>/dev/null || echo NO_CONFD",
    "echo",
    "echo === NGINX SITES-ENABLED ===",
    "ls -la /etc/nginx/sites-enabled/ 2>/dev/null && cat /etc/nginx/sites-enabled/* 2>/dev/null || echo NO_SITES",
    "echo",
    "echo === NODE / NPM VERSION ===",
    "node --version 2>/dev/null || echo NO_NODE",
    "npm --version 2>/dev/null || echo NO_NPM",
    "echo",
    "echo === HTTPD / APACHE ===",
    "httpd -v 2>/dev/null || apache2 -v 2>/dev/null || echo NO_HTTPD",
    "echo",
    "echo === HOME DIRECTORY FILES ===",
    "ls -la /home/ 2>/dev/null",
    "for d in /home/*/; do echo \"--- $d ---\"; ls -la \"$d\" 2>/dev/null | head -20; done",
    "echo",
    "echo === /var/www/ ===",
    "ls -laR /var/www/ 2>/dev/null | head -40 || echo NO_VAR_WWW",
    "echo",
    "echo === /opt/ app files ===",
    "ls -la /opt/ 2>/dev/null | head -20",
    "echo",
    "echo === SYSTEMD SERVICES (custom) ===",
    "ls /etc/systemd/system/*.service 2>/dev/null | grep -v wants",
    "cat /etc/systemd/system/*.service 2>/dev/null | head -60 || echo NO_CUSTOM_SERVICES",
    "echo",
    "echo === DOCKER ===",
    "docker ps -a 2>/dev/null || echo NO_DOCKER",
    "echo",
    "echo === CRONTAB ===",
    "crontab -l 2>/dev/null || echo NO_CRONTAB",
    "echo",
    "echo === ENV VARS (filtered) ===",
    "env | grep -iE \"API|URL|PORT|PROXY|SERVER|NODE|NPM|REACT\" 2>/dev/null || echo NONE"
  ]' \
  --output json > /tmp/webfe_cmd.json 2>&1

WEBFE_CMD_ID=$(cat /tmp/webfe_cmd.json | python3 -c "import sys,json;print(json.load(sys.stdin)['Command']['CommandId'])" 2>/dev/null)
echo "web-fe CommandId: $WEBFE_CMD_ID"
echo "Waiting 10 seconds..."
sleep 10

echo ""
echo "========== web-fe RESULT =========="
aws ssm get-command-invocation \
  --command-id "$WEBFE_CMD_ID" \
  --instance-id "i-027af978d9452d713" \
  --query '[Status, StandardOutputContent, StandardErrorContent]' \
  --output text 2>&1

echo ""
echo "============================================"
echo "  [2/2] web-be (i-05fdf2857655d4561) 調査"
echo "============================================"

aws ssm send-command \
  --instance-ids "i-05fdf2857655d4561" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "echo === HOSTNAME ===",
    "hostname",
    "echo",
    "echo === PS AUX (top 30 by memory) ===",
    "ps aux --sort=-%mem | head -30",
    "echo",
    "echo === LISTENING PORTS ===",
    "ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null",
    "echo",
    "echo === NGINX MAIN CONF ===",
    "cat /etc/nginx/nginx.conf 2>/dev/null || echo NGINX_NOT_FOUND",
    "echo",
    "echo === NGINX CONF.D ===",
    "cat /etc/nginx/conf.d/*.conf 2>/dev/null || echo NO_CONFD",
    "echo",
    "echo === JAVA PROCESSES ===",
    "ps aux | grep java | grep -v grep",
    "echo",
    "echo === HOME/DEV FILES ===",
    "ls -la /home/dev/ 2>/dev/null | head -20",
    "echo",
    "echo === SYSTEMD SERVICES ===",
    "ls /etc/systemd/system/*.service 2>/dev/null | grep -v wants",
    "cat /etc/systemd/system/*.service 2>/dev/null | head -60 || echo NO_CUSTOM_SERVICES",
    "echo",
    "echo === ENV VARS (filtered) ===",
    "env | grep -iE \"API|URL|PORT|PROXY|SERVER|DB\" 2>/dev/null || echo NONE"
  ]' \
  --output json > /tmp/webbe_cmd.json 2>&1

WEBBE_CMD_ID=$(cat /tmp/webbe_cmd.json | python3 -c "import sys,json;print(json.load(sys.stdin)['Command']['CommandId'])" 2>/dev/null)
echo "web-be CommandId: $WEBBE_CMD_ID"
echo "Waiting 10 seconds..."
sleep 10

echo ""
echo "========== web-be RESULT =========="
aws ssm get-command-invocation \
  --command-id "$WEBBE_CMD_ID" \
  --instance-id "i-05fdf2857655d4561" \
  --query '[Status, StandardOutputContent, StandardErrorContent]' \
  --output text 2>&1

echo ""
echo "============================================"
echo "  DONE - 結果をClaudeに貼り付けてください"
echo "============================================"

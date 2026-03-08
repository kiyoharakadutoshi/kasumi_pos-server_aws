#!/bin/bash
# ============================================================
# カスミPOS AWS ネットワーク確認・復旧スクリプト
# 04_recover_network.sh
#
# 機能:
#   1. VPN接続状態確認
#   2. NAT Gateway状態確認
#   3. Route53 レコード確認
#   4. VPC・サブネット確認
#   5. セキュリティグループ確認
# ============================================================

set -euo pipefail

REGION="ap-northeast-1"
VPN_CONNECTION_ID="vpn-0ea9b7895f78e4c7e"
VPC_ID="vpc-0e2d2d27b6860b7fc"
NAT_GW_PUBLIC_IP="57.182.174.110"
LOG_FILE="/tmp/kasumi-network-recovery-$(date +%Y%m%d_%H%M%S).log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }
log_ok()  { log "${GREEN}[OK]${NC} $1"; }
log_warn(){ log "${YELLOW}[WARN]${NC} $1"; }
log_err() { log "${RED}[ERROR]${NC} $1"; }
log_info(){ log "${BLUE}[INFO]${NC} $1"; }

# ============================================
# VPN接続状態確認
# ============================================
check_vpn() {
    log_info "=== VPN接続状態確認 ==="
    
    local vpn_state
    vpn_state=$(aws ec2 describe-vpn-connections \
        --region "$REGION" \
        --vpn-connection-ids "$VPN_CONNECTION_ID" \
        --query 'VpnConnections[0].State' \
        --output text 2>/dev/null || echo "unknown")
    
    if [ "$vpn_state" = "available" ]; then
        log_ok "VPN接続状態: $vpn_state"
    else
        log_err "VPN接続状態異常: $vpn_state"
    fi
    
    # トンネル詳細
    log_info "VPN トンネル状態:"
    aws ec2 describe-vpn-connections \
        --region "$REGION" \
        --vpn-connection-ids "$VPN_CONNECTION_ID" \
        --query 'VpnConnections[0].VgwTelemetry[*].{IP:OutsideIpAddress,Status:Status,BGP:AcceptedRouteCount,Reason:StatusMessage}' \
        --output table | tee -a "$LOG_FILE"
    
    # BGP ルート確認
    log_info "VPN BGP ルート:"
    aws ec2 describe-vpn-connections \
        --region "$REGION" \
        --vpn-connection-ids "$VPN_CONNECTION_ID" \
        --query 'VpnConnections[0].Routes[*].{CIDR:DestinationCidrBlock,State:State,Source:Source}' \
        --output table 2>/dev/null | tee -a "$LOG_FILE"
}

# ============================================
# NAT Gateway確認
# ============================================
check_nat_gateway() {
    log_info "=== NAT Gateway確認 ==="
    
    aws ec2 describe-nat-gateways \
        --region "$REGION" \
        --filter "Name=vpc-id,Values=$VPC_ID" \
        --query 'NatGateways[*].{
            ID:NatGatewayId,
            State:State,
            PublicIP:NatGatewayAddresses[0].PublicIp,
            PrivateIP:NatGatewayAddresses[0].PrivateIp,
            AZ:SubnetId
        }' \
        --output table | tee -a "$LOG_FILE"
    
    # NAT GW状態チェック
    local nat_state
    nat_state=$(aws ec2 describe-nat-gateways \
        --region "$REGION" \
        --filter "Name=vpc-id,Values=$VPC_ID" "Name=state,Values=available" \
        --query 'length(NatGateways)' \
        --output text)
    
    if [ "$nat_state" -gt 0 ]; then
        log_ok "NAT Gateway 稼働中 ($nat_state 台)"
    else
        log_err "NAT Gateway が利用不可の状態"
        log_warn "⚠️  NAT Gateway 障害はプライベートサブネットからのインターネット通信に影響します"
    fi
}

# ============================================
# VPC・サブネット確認
# ============================================
check_vpc() {
    log_info "=== VPC・サブネット確認 ==="
    
    # VPC状態
    local vpc_state
    vpc_state=$(aws ec2 describe-vpcs \
        --region "$REGION" \
        --vpc-ids "$VPC_ID" \
        --query 'Vpcs[0].State' \
        --output text 2>/dev/null || echo "unknown")
    
    if [ "$vpc_state" = "available" ]; then
        log_ok "VPC状態: $vpc_state ($VPC_ID)"
    else
        log_err "VPC状態異常: $vpc_state ($VPC_ID)"
    fi
    
    # サブネット確認
    log_info "サブネット一覧:"
    aws ec2 describe-subnets \
        --region "$REGION" \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query 'Subnets[*].{
            Name:Tags[?Key==`Name`]|[0].Value,
            ID:SubnetId,
            AZ:AvailabilityZone,
            CIDR:CidrBlock,
            AvailableIPs:AvailableIpAddressCount
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# セキュリティグループ確認
# ============================================
check_security_groups() {
    log_info "=== セキュリティグループ確認 ==="
    
    aws ec2 describe-security-groups \
        --region "$REGION" \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query 'SecurityGroups[*].{
            Name:GroupName,
            ID:GroupId,
            Description:Description
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# Route53 レコード確認
# ============================================
check_route53() {
    log_info "=== Route53 ignicapos.com 確認 ==="
    
    # ホストゾーンID取得
    local zone_id
    zone_id=$(aws route53 list-hosted-zones \
        --query 'HostedZones[?Name==`ignicapos.com.`].Id' \
        --output text | tr -d '/hostedzone/')
    
    if [ -z "$zone_id" ]; then
        log_err "Route53 ホストゾーンが見つかりません: ignicapos.com"
        return 1
    fi
    
    log_ok "Route53 ホストゾーン: $zone_id"
    
    # 主要レコード確認
    aws route53 list-resource-record-sets \
        --hosted-zone-id "$zone_id" \
        --query 'ResourceRecordSets[?Type==`A` || Type==`CNAME`].{
            Name:Name,
            Type:Type,
            Value:ResourceRecords[0].Value,
            TTL:TTL
        }' \
        --output table | tee -a "$LOG_FILE"
    
    # 本番URL疎通確認
    log_info "本番URL疎通確認:"
    if curl -sI --max-time 10 "https://www.ignicapos.com/login" | head -1 | grep -qE "200|301|302"; then
        log_ok "本番URL応答OK: https://www.ignicapos.com/login"
    else
        log_err "本番URL応答NG: https://www.ignicapos.com/login"
    fi
    
    if curl -sI --max-time 10 "https://stg.ignicapos.com/login" | head -1 | grep -qE "200|301|302"; then
        log_ok "STG URL応答OK: https://stg.ignicapos.com/login"
    else
        log_warn "STG URL応答NG: https://stg.ignicapos.com/login"
    fi
}

# ============================================
# VPC フローログ確認
# ============================================
check_flow_logs() {
    log_info "=== VPC フローログ確認 ==="
    aws ec2 describe-flow-logs \
        --region "$REGION" \
        --filter "Name=resource-id,Values=$VPC_ID" \
        --query 'FlowLogs[*].{
            ID:FlowLogId,
            Status:FlowLogStatus,
            Destination:LogDestination,
            TrafficType:TrafficType
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# インターネット接続確認（Lambda/EC2から）
# ============================================
check_internet_connectivity() {
    log_info "=== インターネット接続確認 ==="
    
    # NAT GW IPへのping（参考）
    if ping -c 3 -W 5 8.8.8.8 &>/dev/null 2>&1; then
        log_ok "インターネット接続OK（制御サーバーから）"
    else
        log_warn "インターネット接続確認できず（このサーバーからのpingが制限されている可能性あり）"
    fi
}

# ============================================
# メイン処理
# ============================================
main() {
    log_info "============================================"
    log_info "ネットワーク確認・復旧スクリプト開始"
    log_info "Region: $REGION | VPC: $VPC_ID"
    log_info "============================================"

    check_vpc
    check_vpn
    check_nat_gateway
    check_security_groups
    check_route53
    check_flow_logs

    log_ok "ネットワーク確認完了"
    
    echo ""
    log_info "VPN 接続が DOWN の場合の対応:"
    log_info "  1. USMH側ネットワーク管理者に連絡"
    log_info "  2. CGW (14.224.146.153) への疎通確認"
    log_info "  3. AWS VPN コンソールでトンネル詳細確認"
    log_info "  4. VPN設定の再初期化（最終手段）:"
    log_info "     aws ec2 reset-vpn-connection-id \\"
    log_info "       --region $REGION \\"
    log_info "       --vpn-connection-id $VPN_CONNECTION_ID"
}

main "$@"

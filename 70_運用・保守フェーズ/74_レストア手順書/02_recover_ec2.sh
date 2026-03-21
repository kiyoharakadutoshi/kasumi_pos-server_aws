#!/bin/bash
# ============================================================
# カスミPOS AWS EC2 インスタンス復旧スクリプト
# 02_recover_ec2.sh
#
# 機能:
#   1. EC2インスタンス状態確認
#   2. 停止インスタンスの起動
#   3. AMIバックアップ作成
#   4. AMIからインスタンス復元
# ============================================================

set -euo pipefail

REGION="ap-northeast-1"
LOG_FILE="/tmp/kasumi-ec2-recovery-$(date +%Y%m%d_%H%M%S).log"

# 既知のインスタンス情報
BASTION_IP="10.238.2.39"
GIFTCARD_IP="10.238.2.198"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }
log_ok()  { log "${GREEN}[OK]${NC} $1"; }
log_warn(){ log "${YELLOW}[WARN]${NC} $1"; }
log_err() { log "${RED}[ERROR]${NC} $1"; }
log_info(){ log "${BLUE}[INFO]${NC} $1"; }

# ============================================
# インスタンス一覧・状態確認
# ============================================
list_instances() {
    log_info "=== EC2 インスタンス一覧 ==="
    aws ec2 describe-instances \
        --region "$REGION" \
        --filters "Name=instance-state-name,Values=running,stopped,stopping,pending" \
        --query 'Reservations[*].Instances[*].{
            Name:Tags[?Key==`Name`]|[0].Value,
            ID:InstanceId,
            State:State.Name,
            Type:InstanceType,
            PrivateIP:PrivateIpAddress,
            PublicIP:PublicIpAddress,
            AZ:Placement.AvailabilityZone
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# インスタンスIDを名前で取得
# ============================================
get_instance_id() {
    local name="$1"
    aws ec2 describe-instances \
        --region "$REGION" \
        --filters "Name=tag:Name,Values=$name" "Name=instance-state-name,Values=running,stopped" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text
}

# ============================================
# インスタンス起動
# ============================================
start_instance() {
    local instance_id="$1"
    local name="${2:-unknown}"
    
    log_info "=== インスタンス起動: $instance_id ($name) ==="
    
    local current_state
    current_state=$(aws ec2 describe-instances \
        --region "$REGION" \
        --instance-ids "$instance_id" \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text)
    
    if [ "$current_state" = "running" ]; then
        log_ok "既に起動中: $instance_id"
        return 0
    fi
    
    aws ec2 start-instances \
        --region "$REGION" \
        --instance-ids "$instance_id"
    
    log_info "起動待機中..."
    aws ec2 wait instance-running \
        --region "$REGION" \
        --instance-ids "$instance_id"
    
    log_ok "起動完了: $instance_id"
}

# ============================================
# インスタンス再起動
# ============================================
reboot_instance() {
    local instance_id="$1"
    local name="${2:-unknown}"
    
    log_warn "=== インスタンス再起動: $instance_id ($name) ==="
    
    aws ec2 reboot-instances \
        --region "$REGION" \
        --instance-ids "$instance_id"
    
    sleep 15
    aws ec2 wait instance-running \
        --region "$REGION" \
        --instance-ids "$instance_id"
    
    log_ok "再起動完了: $instance_id"
}

# ============================================
# AMI（スナップショット）作成
# ============================================
create_ami() {
    local instance_id="$1"
    local name="${2:-instance}"
    local ami_name="kasumi-${name}-$(date +%Y%m%d%H%M)"
    
    log_info "=== AMI作成: $instance_id → $ami_name ==="
    
    local ami_id
    ami_id=$(aws ec2 create-image \
        --region "$REGION" \
        --instance-id "$instance_id" \
        --name "$ami_name" \
        --description "Kasumi POS backup $(date)" \
        --no-reboot \
        --query 'ImageId' \
        --output text)
    
    log_info "AMI作成中: $ami_id"
    aws ec2 wait image-available \
        --region "$REGION" \
        --image-ids "$ami_id"
    
    log_ok "AMI作成完了: $ami_id ($ami_name)"
    echo "$ami_id"
}

# ============================================
# AMI一覧
# ============================================
list_amis() {
    log_info "=== Kasumi AMI一覧 ==="
    aws ec2 describe-images \
        --region "$REGION" \
        --owners self \
        --filters "Name=name,Values=kasumi-*" \
        --query 'sort_by(Images, &CreationDate)[-10:].{
            ID:ImageId,
            Name:Name,
            Created:CreationDate,
            State:State
        }' \
        --output table | tee -a "$LOG_FILE"
}

# ============================================
# AMIからインスタンス復元
# ============================================
restore_from_ami() {
    local ami_id="$1"
    local name="${2:-restored}"
    local instance_type="${3:-t3.xlarge}"
    
    log_warn "=== AMIからインスタンス復元 ==="
    log_info "AMI: $ami_id, Name: $name, Type: $instance_type"
    
    # サブネット取得（パブリック1a）
    local subnet_id
    subnet_id=$(aws ec2 describe-subnets \
        --region "$REGION" \
        --filters "Name=tag:Name,Values=*public*1a*" \
        --query 'Subnets[0].SubnetId' \
        --output text)
    
    # セキュリティグループ（bastion用）
    local sg_id
    sg_id=$(aws ec2 describe-security-groups \
        --region "$REGION" \
        --filters "Name=group-name,Values=*bastion*" \
        --query 'SecurityGroups[0].GroupId' \
        --output text)
    
    local instance_id
    instance_id=$(aws ec2 run-instances \
        --region "$REGION" \
        --image-id "$ami_id" \
        --instance-type "$instance_type" \
        --subnet-id "$subnet_id" \
        --security-group-ids "$sg_id" \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${name}-restored},{Key=Env,Value=prd}]" \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    log_info "インスタンス起動待機: $instance_id"
    aws ec2 wait instance-running \
        --region "$REGION" \
        --instance-ids "$instance_id"
    
    # インスタンス情報表示
    aws ec2 describe-instances \
        --region "$REGION" \
        --instance-ids "$instance_id" \
        --query 'Reservations[0].Instances[0].{ID:InstanceId,IP:PrivateIpAddress,PublicIP:PublicIpAddress,State:State.Name}' \
        --output table
    
    log_ok "インスタンス復元完了: $instance_id"
    log_warn "⚠️  必要に応じてElastic IP・Route53・セキュリティグループを更新してください"
}

# ============================================
# Bastionへの疎通確認
# ============================================
check_bastion_connectivity() {
    local bastion_public_ip
    bastion_public_ip=$(aws ec2 describe-instances \
        --region "$REGION" \
        --filters "Name=private-ip-address,Values=$BASTION_IP" \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$bastion_public_ip" ] || [ "$bastion_public_ip" = "None" ]; then
        log_warn "Bastion パブリックIPが取得できません"
        return 1
    fi
    
    if nc -z -w 10 "$bastion_public_ip" 1194 2>/dev/null; then
        log_ok "Bastion VPN (UDP 1194) 疎通OK: $bastion_public_ip"
    else
        log_warn "Bastion VPN (UDP 1194) 疎通NG: $bastion_public_ip"
    fi
}

# ============================================
# Systems Manager Session Manager 接続確認
# ============================================
check_ssm_connection() {
    local instance_id="$1"
    log_info "SSM接続可否確認: $instance_id"
    
    local ssm_status
    ssm_status=$(aws ssm describe-instance-information \
        --region "$REGION" \
        --filters "Key=InstanceIds,Values=$instance_id" \
        --query 'InstanceInformationList[0].PingStatus' \
        --output text 2>/dev/null || echo "NotFound")
    
    if [ "$ssm_status" = "Online" ]; then
        log_ok "SSM接続可能: $instance_id"
    else
        log_warn "SSM接続不可: $instance_id (Status: $ssm_status)"
    fi
}

# ============================================
# メイン処理
# ============================================
main() {
    log_info "============================================"
    log_info "EC2 復旧スクリプト開始"
    log_info "Region: $REGION"
    log_info "============================================"

    list_instances
    list_amis

    # bastion確認・復旧
    local bastion_id
    bastion_id=$(get_instance_id "bastion" 2>/dev/null || echo "")
    
    if [ -n "$bastion_id" ] && [ "$bastion_id" != "None" ]; then
        local bastion_state
        bastion_state=$(aws ec2 describe-instances \
            --region "$REGION" \
            --instance-ids "$bastion_id" \
            --query 'Reservations[0].Instances[0].State.Name' \
            --output text)
        
        if [ "$bastion_state" = "running" ]; then
            log_ok "Bastion 正常稼働中: $bastion_id"
            check_ssm_connection "$bastion_id"
        elif [ "$bastion_state" = "stopped" ]; then
            log_warn "Bastion 停止中。起動します: $bastion_id"
            start_instance "$bastion_id" "bastion"
        else
            log_err "Bastion 異常状態: $bastion_state"
        fi
    else
        log_err "Bastionインスタンスが見つかりません"
    fi

    # giftcard確認・復旧
    local giftcard_id
    giftcard_id=$(get_instance_id "giftcard" 2>/dev/null || echo "")
    
    if [ -n "$giftcard_id" ] && [ "$giftcard_id" != "None" ]; then
        local giftcard_state
        giftcard_state=$(aws ec2 describe-instances \
            --region "$REGION" \
            --instance-ids "$giftcard_id" \
            --query 'Reservations[0].Instances[0].State.Name' \
            --output text)
        
        if [ "$giftcard_state" = "running" ]; then
            log_ok "GiftCard サーバー正常稼働中: $giftcard_id"
        elif [ "$giftcard_state" = "stopped" ]; then
            log_warn "GiftCard サーバー停止中。起動します: $giftcard_id"
            start_instance "$giftcard_id" "giftcard"
        else
            log_err "GiftCard サーバー異常状態: $giftcard_state"
        fi
    else
        log_warn "GiftCardインスタンスが見つかりません"
    fi

    log_ok "EC2 復旧スクリプト完了"
}

main "$@"

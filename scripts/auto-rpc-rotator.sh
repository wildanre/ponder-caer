#!/bin/bash

# RPC Auto-Rotator dengan PM2 untuk True Auto-Rotation
# Script ini akan restart Ponder setiap 90 detik dengan RPC yang berbeda

set -e

# Configuration
RPC_PRIMARY="https://rpc.ankr.com/etherlink_testnet"
RPC_BACKUP="https://node.ghostnet.etherlink.com"
ROTATION_INTERVAL=90  # seconds
ENV_FILE=".env"
PONDER_COMMAND="pnpm dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to rotate RPC in .env file
rotate_rpc() {
    local current_primary=$(grep "ETHERLINK_TESTNET_RPC_URL=" "$ENV_FILE" | cut -d'"' -f2)
    
    if [[ "$current_primary" == "$RPC_PRIMARY" ]]; then
        # Switch to backup
        sed -i.bak "s|ETHERLINK_TESTNET_RPC_URL=\".*\"|ETHERLINK_TESTNET_RPC_URL=\"$RPC_BACKUP\"|" "$ENV_FILE"
        sed -i.bak "s|ETHERLINK_TESTNET_RPC_URL_BACKUP=\".*\"|ETHERLINK_TESTNET_RPC_URL_BACKUP=\"$RPC_PRIMARY\"|" "$ENV_FILE"
        log "${GREEN}🔄 Rotated to: $RPC_BACKUP${NC}"
    else
        # Switch to primary
        sed -i.bak "s|ETHERLINK_TESTNET_RPC_URL=\".*\"|ETHERLINK_TESTNET_RPC_URL=\"$RPC_PRIMARY\"|" "$ENV_FILE"
        sed -i.bak "s|ETHERLINK_TESTNET_RPC_URL_BACKUP=\".*\"|ETHERLINK_TESTNET_RPC_URL_BACKUP=\"$RPC_BACKUP\"|" "$ENV_FILE"
        log "${GREEN}🔄 Rotated to: $RPC_PRIMARY${NC}"
    fi
    
    # Clean up backup file
    rm -f "$ENV_FILE.bak"
}

# Function to check if Ponder is running
is_ponder_running() {
    pgrep -f "ponder" > /dev/null 2>&1
}

# Function to start Ponder
start_ponder() {
    log "${YELLOW}🚀 Starting Ponder...${NC}"
    nohup $PONDER_COMMAND > ponder.log 2>&1 &
    PONDER_PID=$!
    sleep 5
    
    if is_ponder_running; then
        log "${GREEN}✅ Ponder started successfully (PID: $PONDER_PID)${NC}"
        return 0
    else
        log "${RED}❌ Failed to start Ponder${NC}"
        return 1
    fi
}

# Function to stop Ponder
stop_ponder() {
    if is_ponder_running; then
        log "${YELLOW}🛑 Stopping Ponder...${NC}"
        pkill -f "ponder" || true
        sleep 3
        
        if is_ponder_running; then
            log "${YELLOW}⚠️ Force killing Ponder...${NC}"
            pkill -9 -f "ponder" || true
            sleep 2
        fi
        
        log "${GREEN}✅ Ponder stopped${NC}"
    fi
}

# Function to restart Ponder with RPC rotation
restart_with_rotation() {
    stop_ponder
    rotate_rpc
    start_ponder
}

# Cleanup function
cleanup() {
    log "${YELLOW}🧹 Cleaning up...${NC}"
    stop_ponder
    exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    log "${BLUE}🌟 RPC Auto-Rotator Started${NC}"
    log "${BLUE}📡 Primary RPC: $RPC_PRIMARY${NC}"
    log "${BLUE}📡 Backup RPC: $RPC_BACKUP${NC}"
    log "${BLUE}⏰ Rotation Interval: ${ROTATION_INTERVAL}s${NC}"
    log "${BLUE}🔄 Press Ctrl+C to stop${NC}"
    
    # Initial start
    start_ponder
    
    local rotation_count=0
    
    # Main rotation loop
    while true; do
        sleep $ROTATION_INTERVAL
        
        rotation_count=$((rotation_count + 1))
        log "${BLUE}🔄 Rotation #${rotation_count} - Starting RPC switch...${NC}"
        
        if restart_with_rotation; then
            log "${GREEN}✅ Rotation #${rotation_count} completed successfully${NC}"
        else
            log "${RED}❌ Rotation #${rotation_count} failed, retrying in 10s...${NC}"
            sleep 10
            if ! restart_with_rotation; then
                log "${RED}❌ Critical failure, stopping rotator${NC}"
                exit 1
            fi
        fi
        
        # Show current status
        local current_rpc=$(grep "ETHERLINK_TESTNET_RPC_URL=" "$ENV_FILE" | cut -d'"' -f2)
        log "${GREEN}📊 Current RPC: ${current_rpc##*/}${NC}"
        log "${BLUE}⏰ Next rotation in ${ROTATION_INTERVAL}s...${NC}"
    done
}

# Check if .env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    log "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Check if required commands exist
for cmd in pnpm sed grep; do
    if ! command -v $cmd &> /dev/null; then
        log "${RED}❌ Required command '$cmd' not found!${NC}"
        exit 1
    fi
done

# Run main function
main

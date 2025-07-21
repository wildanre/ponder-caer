#!/bin/bash

# Quick Deploy - Fastest way to deploy from local to EC2
# This script syncs files and restarts the application on EC2
# Usage: ./scripts/quick-deploy.sh
# Prerequisites: SSH key at /Users/danuste/Downloads/ec2key.pem

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⚡ Quick Deploy to EC2${NC}"
echo "====================="
echo ""

# Auto-detect SSH key
KEY_PATH=""
for key in "$HOME/.ssh/"*.pem "$HOME/Downloads/"*.pem "$HOME/Desktop/"*.pem; do
    if [[ -f "$key" ]]; then
        KEY_PATH="$key"
        break
    fi
done

if [[ -z "$KEY_PATH" ]]; then
    echo -e "${RED}❌ No .pem key found${NC}"
    echo "Please specify your key path:"
    read -p "Enter .pem file path: " KEY_PATH
fi

chmod 600 "$KEY_PATH"

# Try different usernames
EC2_HOST="52.65.212.6"
EC2_USER=""

for user in "ec2-user" "ubuntu"; do
    if ssh -i "$KEY_PATH" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$user@$EC2_HOST" "echo 'test'" &>/dev/null; then
        EC2_USER="$user"
        break
    fi
done

if [[ -z "$EC2_USER" ]]; then
    echo -e "${RED}❌ Cannot connect to EC2${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using: $EC2_USER@$EC2_HOST${NC}"
echo -e "${GREEN}✅ Key: $KEY_PATH${NC}"
echo ""

# Quick sync
echo -e "${BLUE}📤 Syncing files...${NC}"
rsync -avz --exclude node_modules --exclude .git \
    -e "ssh -i '$KEY_PATH' -o StrictHostKeyChecking=no" \
    . "$EC2_USER@$EC2_HOST:~/ponder-app/"

echo ""
echo -e "${BLUE}🚀 Deploying...${NC}"
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'EOF'
cd ~/ponder-app/

# Quick install
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Install deps and start
pnpm install --prod
pnpm codegen

# Restart app
pm2 stop ponder-caer || true
pm2 start ecosystem.config.js --env production --name ponder-caer
pm2 save

echo ""
echo "✅ Quick deploy completed!"
pm2 status

echo ""
echo "🌐 App URL: http://$(curl -s ifconfig.me):3000"
EOF

echo ""
echo -e "${GREEN}⚡ Quick deploy completed!${NC}"

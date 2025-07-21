#!/bin/bash

# GitHub Secrets Setup Helper
# This script helps you prepare values for GitHub Secrets

set -e

echo "🔐 GitHub Secrets Setup Helper"
echo "==============================="
echo ""

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 You need to add these secrets to GitHub:${NC}"
echo ""
echo "Repository → Settings → Secrets and variables → Actions → New repository secret"
echo ""

# EC2_HOST
echo -e "${GREEN}Secret 1: EC2_HOST${NC}"
echo "Value: 52.65.212.6"
echo ""

# EC2_USERNAME  
echo -e "${GREEN}Secret 2: EC2_USERNAME${NC}"
echo "Value: ec2-user"
echo -e "${YELLOW}Note: Might be 'ubuntu' depending on your AMI${NC}"
echo ""

# EC2_PRIVATE_KEY
echo -e "${GREEN}Secret 3: EC2_PRIVATE_KEY${NC}"
echo -e "${RED}⚠️  IMPORTANT: Paste the ENTIRE content of your .pem file${NC}"
echo ""
echo "Steps:"
echo "1. Open your .pem file in a text editor"
echo "2. Copy EVERYTHING from '-----BEGIN RSA PRIVATE KEY-----' to '-----END RSA PRIVATE KEY-----'"
echo "3. Paste into GitHub Secret value"
echo ""

# Check if .pem file exists in common locations
PEM_LOCATIONS=(
    "~/.ssh/*.pem"
    "~/Downloads/*.pem"
    "~/Desktop/*.pem"
    "./*.pem"
)

echo -e "${BLUE}🔍 Looking for .pem files...${NC}"
FOUND_PEM=false

for location in "${PEM_LOCATIONS[@]}"; do
    if ls $location 2>/dev/null | head -1; then
        FOUND_PEM=true
        PEM_FILE=$(ls $location 2>/dev/null | head -1)
        echo -e "${GREEN}Found: $PEM_FILE${NC}"
        
        echo ""
        echo -e "${YELLOW}🔑 Content of $PEM_FILE:${NC}"
        echo "==============================="
        cat "$PEM_FILE" 2>/dev/null || echo "Cannot read file"
        echo "==============================="
        echo ""
        echo -e "${RED}⚠️  COPY THE ABOVE CONTENT TO EC2_PRIVATE_KEY SECRET${NC}"
        break
    fi
done

if [ "$FOUND_PEM" = false ]; then
    echo -e "${RED}❌ No .pem files found in common locations${NC}"
    echo ""
    echo "Please locate your EC2 private key file and:"
    echo "1. Open it with: cat /path/to/your-key.pem"
    echo "2. Copy the entire content"
    echo "3. Paste it as EC2_PRIVATE_KEY secret in GitHub"
fi

echo ""
echo -e "${BLUE}🌍 Optional Environment Variables (as secrets):${NC}"
echo ""
echo -e "${GREEN}DATABASE_URL (if you want to override):${NC}"
echo "postgresql://postgres.xanvchnjbfuavmxmvpnf:vNAqdr1pt8rBVdja@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
echo ""
echo -e "${GREEN}ARB_SEPOLIA_RPC_URL (optional):${NC}"
echo "https://sepolia-rollup.arbitrum.io/rpc"
echo ""

echo -e "${BLUE}📝 After adding secrets:${NC}"
echo "1. Go to Actions tab in GitHub"  
echo "2. Push to 'use-cloud-db' branch to trigger deployment"
echo "3. Monitor deployment progress in Actions"
echo ""

echo -e "${BLUE}🔧 Quick test deployment:${NC}"
echo "git add ."
echo "git commit -m 'Test CI/CD deployment'"
echo "git push origin use-cloud-db"
echo ""

# Test SSH connection
echo -e "${BLUE}🧪 Test SSH Connection:${NC}"
echo "Before setting up CI/CD, test your connection:"
echo ""
if [ "$FOUND_PEM" = true ]; then
    echo "ssh -i \"$PEM_FILE\" ec2-user@52.65.212.6"
else
    echo "ssh -i /path/to/your-key.pem ec2-user@52.65.212.6"
fi
echo ""

# GitHub URL
echo -e "${BLUE}🔗 GitHub Secrets URL:${NC}"
echo "https://github.com/wildanre/ponder-caer/settings/secrets/actions"
echo ""

echo -e "${GREEN}✅ Setup complete! Add the secrets above to GitHub and test deployment.${NC}"

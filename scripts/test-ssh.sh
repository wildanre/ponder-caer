#!/bin/bash

# Test SSH Connection to EC2
# This script helps test SSH connection before running CI/CD

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing SSH Connection to EC2${NC}"
echo "=================================="
echo ""

# Configuration
EC2_HOST="52.65.212.6"
EC2_USERNAME="ec2-user"

# Find .pem file
echo -e "${BLUE}🔍 Looking for .pem files...${NC}"
PEM_LOCATIONS=(
    "$HOME/.ssh/*.pem"
    "$HOME/Downloads/*.pem"
    "$HOME/Desktop/*.pem"
    "./*.pem"
)

PEM_FILE=""
for location in "${PEM_LOCATIONS[@]}"; do
    for file in $location; do
        if [[ -f "$file" ]]; then
            PEM_FILE="$file"
            echo -e "${GREEN}✅ Found: $PEM_FILE${NC}"
            break 2
        fi
    done
done

if [[ -z "$PEM_FILE" ]]; then
    echo -e "${RED}❌ No .pem file found automatically${NC}"
    echo ""
    echo "Please specify your .pem file path:"
    read -p "Enter .pem file path: " PEM_FILE
    
    if [[ ! -f "$PEM_FILE" ]]; then
        echo -e "${RED}❌ File not found: $PEM_FILE${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📋 Connection Details:${NC}"
echo "Host: $EC2_HOST"
echo "Username: $EC2_USERNAME"
echo "Key file: $PEM_FILE"
echo ""

# Set correct permissions
echo -e "${YELLOW}🔒 Setting key permissions...${NC}"
chmod 600 "$PEM_FILE"

# Test SSH key validity
echo -e "${BLUE}🔑 Testing SSH key format...${NC}"
if ssh-keygen -l -f "$PEM_FILE" &>/dev/null; then
    echo -e "${GREEN}✅ SSH key format is valid${NC}"
else
    echo -e "${RED}❌ SSH key format is invalid${NC}"
    echo "Make sure this is a valid private key file"
    exit 1
fi

# Test SSH connection
echo ""
echo -e "${BLUE}🌐 Testing SSH connection...${NC}"
echo "Attempting to connect to $EC2_USERNAME@$EC2_HOST..."
echo ""

if ssh -i "$PEM_FILE" \
    -o ConnectTimeout=10 \
    -o StrictHostKeyChecking=no \
    -o BatchMode=yes \
    "$EC2_USERNAME@$EC2_HOST" \
    "echo 'SSH connection successful!' && whoami && pwd && uptime" 2>/dev/null; then
    
    echo ""
    echo -e "${GREEN}✅ SSH connection successful!${NC}"
    echo ""
    
    # Test alternative username if first one works
    echo -e "${BLUE}🧪 Testing alternative username 'ubuntu'...${NC}"
    if ssh -i "$PEM_FILE" \
        -o ConnectTimeout=5 \
        -o StrictHostKeyChecking=no \
        -o BatchMode=yes \
        "ubuntu@$EC2_HOST" \
        "whoami" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Both 'ec2-user' and 'ubuntu' work. Use 'ubuntu' for better compatibility.${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📝 For GitHub Secrets, copy this EXACT key content:${NC}"
    echo "=================================================================="
    cat "$PEM_FILE"
    echo "=================================================================="
    echo ""
    echo -e "${YELLOW}📋 GitHub Secrets Setup:${NC}"
    echo "EC2_HOST = 52.65.212.6"
    echo "EC2_USERNAME = $EC2_USERNAME"
    echo "EC2_PRIVATE_KEY = [Copy the content above, including BEGIN/END lines]"
    
else
    echo ""
    echo -e "${RED}❌ SSH connection failed with 'ec2-user'!${NC}"
    echo ""
    echo -e "${BLUE}🔄 Trying with 'ubuntu' username...${NC}"
    
    if ssh -i "$PEM_FILE" \
        -o ConnectTimeout=10 \
        -o StrictHostKeyChecking=no \
        -o BatchMode=yes \
        "ubuntu@$EC2_HOST" \
        "echo 'SSH connection successful with ubuntu!' && whoami && pwd" 2>/dev/null; then
        
        echo -e "${GREEN}✅ SSH connection successful with 'ubuntu'!${NC}"
        echo ""
        echo -e "${YELLOW}📋 Use these values for GitHub Secrets:${NC}"
        echo "EC2_HOST = 52.65.212.6"
        echo "EC2_USERNAME = ubuntu"
        echo "EC2_PRIVATE_KEY = [Copy your .pem file content]"
        
    else
        echo -e "${RED}❌ SSH connection failed with both usernames!${NC}"
        echo ""
        echo -e "${YELLOW}Possible issues:${NC}"
        echo "1. Security group doesn't allow SSH from your IP"
        echo "2. EC2 instance is not running"
        echo "3. Wrong key file for this instance"
        echo "4. Key permissions issue"
        echo ""
        echo "Manual debug commands:"
        echo "ssh -i \"$PEM_FILE\" -v ec2-user@$EC2_HOST"
        echo "ssh -i \"$PEM_FILE\" -v ubuntu@$EC2_HOST"
        exit 1
    fi
fi

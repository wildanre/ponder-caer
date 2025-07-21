#!/bin/bash

# Environment Variables Validation Script
# Run this on your EC2 instance to validate environment setup

set -e

echo "🔍 Validating Environment Setup for Ponder Application..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
echo -e "${BLUE}📁 Checking environment file...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}💡 Create .env file with required variables${NC}"
    
    cat << 'EOF'
Create .env file with:
DATABASE_URL=postgresql://postgres.xanvchnjbfuavmxmvpnf:vNAqdr1pt8rBVdja@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
PORT=3000
NODE_ENV=production
EOF
    exit 1
fi

# Load .env file
export $(grep -v '^#' .env | xargs)

echo ""
echo -e "${BLUE}🔐 Checking required environment variables...${NC}"

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is not set${NC}"
    ENV_ERROR=1
else
    echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
    # Test database connection
    echo -e "${BLUE}🗄️  Testing database connection...${NC}"
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            echo -e "${GREEN}✅ Database connection successful${NC}"
        else
            echo -e "${RED}❌ Database connection failed${NC}"
            ENV_ERROR=1
        fi
    else
        echo -e "${YELLOW}⚠️  psql not installed, skipping database test${NC}"
    fi
fi

# Check ARB_SEPOLIA_RPC_URL (optional)
if [ -z "$ARB_SEPOLIA_RPC_URL" ]; then
    echo -e "${YELLOW}⚠️  ARB_SEPOLIA_RPC_URL not set (using default)${NC}"
else
    echo -e "${GREEN}✅ ARB_SEPOLIA_RPC_URL is set${NC}"
fi

# Check PORT
if [ -z "$PORT" ]; then
    echo -e "${YELLOW}⚠️  PORT not set (will use default)${NC}"
else
    echo -e "${GREEN}✅ PORT is set to $PORT${NC}"
fi

# Check NODE_ENV
if [ -z "$NODE_ENV" ]; then
    echo -e "${YELLOW}⚠️  NODE_ENV not set${NC}"
else
    echo -e "${GREEN}✅ NODE_ENV is set to $NODE_ENV${NC}"
fi

echo ""
echo -e "${BLUE}🛠️  Checking system dependencies...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
    
    # Check if version is >= 18
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js version is compatible (>= 18)${NC}"
    else
        echo -e "${RED}❌ Node.js version is too old (need >= 18)${NC}"
        ENV_ERROR=1
    fi
else
    echo -e "${RED}❌ Node.js not installed${NC}"
    ENV_ERROR=1
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✅ pnpm installed: $PNPM_VERSION${NC}"
else
    echo -e "${RED}❌ pnpm not installed${NC}"
    ENV_ERROR=1
fi

# Check PM2
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}✅ PM2 installed: $PM2_VERSION${NC}"
    
    # Check PM2 processes
    echo -e "${BLUE}📊 PM2 Status:${NC}"
    pm2 list
else
    echo -e "${RED}❌ PM2 not installed${NC}"
    ENV_ERROR=1
fi

echo ""
echo -e "${BLUE}📁 Checking project files...${NC}"

# Check important files
FILES_TO_CHECK=(
    "package.json"
    "ponder.config.ts"
    "src/index.ts"
    "ecosystem.config.js"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        ENV_ERROR=1
    fi
done

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo -e "${BLUE}💡 Run: pnpm install${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Checking network connectivity...${NC}"

# Check if port is available
if [ ! -z "$PORT" ]; then
    if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
        echo -e "${YELLOW}⚠️  Port $PORT is already in use${NC}"
        echo -e "${BLUE}📊 Processes using port $PORT:${NC}"
        lsof -ti:$PORT 2>/dev/null || echo "Cannot determine process"
    else
        echo -e "${GREEN}✅ Port $PORT is available${NC}"
    fi
fi

# Check internet connectivity
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}✅ Internet connectivity OK${NC}"
else
    echo -e "${RED}❌ No internet connectivity${NC}"
    ENV_ERROR=1
fi

echo ""
echo -e "${BLUE}📋 Validation Summary:${NC}"

if [ -z "$ENV_ERROR" ]; then
    echo -e "${GREEN}🎉 All checks passed! Environment is ready for deployment.${NC}"
    echo ""
    echo -e "${BLUE}🚀 To start the application:${NC}"
    echo "  pm2 start ecosystem.config.js --env production"
    echo ""
    echo -e "${BLUE}🔍 To monitor:${NC}"
    echo "  pm2 status"
    echo "  pm2 logs ponder-caer"
    echo ""
    echo -e "${BLUE}🌐 Application will be available at:${NC}"
    echo "  http://$(curl -s ifconfig.me):${PORT:-3000}"
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo -e "${YELLOW}📝 Quick fixes:${NC}"
    echo "  1. Install missing dependencies: ./scripts/setup-ec2.sh"
    echo "  2. Create/update .env file with required variables"
    echo "  3. Install Node.js dependencies: pnpm install"
    echo "  4. Check network/firewall settings"
    exit 1
fi

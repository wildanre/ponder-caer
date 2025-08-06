#!/bin/bash

# EC2 Instance Setup Script for Ponder Application
# Run this script once on your EC2 instance to prepare it for deployments

set -e

echo "🚀 Setting up EC2 instance for Ponder deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js (using NodeSource repository)
echo "📦 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install pnpm globally (specific version for compatibility)
echo "📦 Installing pnpm v9..."
npm install -g pnpm@9.15.0

# Install PM2 globally for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Install git if not already installed
echo "📦 Installing Git..."
sudo yum install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/ponder-caer
cd ~/ponder-caer

# Setup PM2 to start on boot
echo "🔧 Configuring PM2 startup..."
pm2 startup
echo "⚠️  Please run the command that PM2 startup printed above with sudo"

# Create environment file template
echo "📝 Creating environment template..."
cat > ~/.env.template << 'EOF'
# Copy this file to .env and fill in your actual values

# Database Configuration
DATABASE_URL=postgresql://postgres.xanvchnjbfuavmxmvpnf:vNAqdr1pt8rBVdja@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Ponder Configuration
# Add any other environment variables your Ponder app needs

# Optional: Port configuration
PORT=3000

EOF

echo "✅ EC2 instance setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run the PM2 startup command that was printed above (with sudo)"
echo "2. Copy ~/.env.template to ~/.env and configure your environment variables"
echo "3. Set up GitHub secrets for CI/CD deployment"
echo ""
echo "🔧 GitHub Secrets needed:"
echo "- EC2_HOST: 52.65.212.6"
echo "- EC2_USERNAME: ec2-user (or ubuntu depending on your AMI)"
echo "- EC2_PRIVATE_KEY: Your EC2 private key content"
echo ""
echo "💡 To test your setup, you can manually deploy by running:"
echo "   cd ~/ponder-caer && ./deploy.sh"

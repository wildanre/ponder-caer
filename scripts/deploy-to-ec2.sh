#!/bin/bash

# Local deployment script to EC2
# Usage: ./scripts/deploy-to-ec2.sh

set -e

EC2_HOST="${EC2_HOST:-52.65.212.6}"
EC2_USER="${EC2_USER:-ec2-user}"
SSH_KEY_PATH="${SSH_KEY_PATH:-~/.ssh/your-ec2-key.pem}"

echo "🚀 Deploying to EC2: $EC2_HOST"

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ SSH key not found at $SSH_KEY_PATH"
    echo "Please set SSH_KEY_PATH environment variable or place your key at the default location"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment-temp
cp -r src deployment-temp/
cp -r abis deployment-temp/
cp -r generated deployment-temp/ 2>/dev/null || echo "Generated folder not found, skipping..."
cp package.json deployment-temp/
cp pnpm-lock.yaml deployment-temp/
cp ponder.config.ts deployment-temp/
cp ponder.schema.ts deployment-temp/
cp ponder-env.d.ts deployment-temp/
cp tsconfig.json deployment-temp/
cp drizzle.config.ts deployment-temp/
cp -r drizzle deployment-temp/ 2>/dev/null || echo "Drizzle folder not found, skipping..."

# Create deployment script
cat > deployment-temp/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Install pnpm if not exists
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --prod

# Stop existing process
echo "⏹️ Stopping existing application..."
pkill -f "ponder" || echo "No existing ponder process found"

# Run database operations if needed
if [ -f "drizzle.config.ts" ]; then
    echo "🗄️ Running database operations..."
    pnpm db || echo "Database operations completed"
fi

# Generate code
echo "🔧 Generating code..."
pnpm codegen || echo "Code generation completed"

# Start the application using PM2
echo "🚀 Starting application with PM2..."

# Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Start or restart the application
pm2 stop ponder-caer || echo "No existing PM2 process to stop"
pm2 start --name "ponder-caer" --interpreter node -- node_modules/.bin/ponder start
pm2 save

echo "✅ Deployment completed successfully!"
echo "📊 Application status:"
pm2 status
EOF

chmod +x deployment-temp/deploy.sh

# Create archive
echo "📁 Creating archive..."
tar -czf deployment.tar.gz -C deployment-temp .

# Copy to EC2
echo "📤 Copying files to EC2..."
scp -i "$SSH_KEY_PATH" deployment.tar.gz "$EC2_USER@$EC2_HOST":~/

# Execute deployment on EC2
echo "🔧 Executing deployment on EC2..."
ssh -i "$SSH_KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd ~

# Create backup of current deployment
if [ -d "ponder-caer" ]; then
    echo "📦 Creating backup..."
    mv ponder-caer ponder-caer-backup-$(date +%Y%m%d-%H%M%S) || true
fi

# Extract new deployment
echo "📦 Extracting new deployment..."
mkdir -p ponder-caer
tar -xzf deployment.tar.gz -C ponder-caer
cd ponder-caer

# Make deploy script executable and run it
chmod +x deploy.sh
./deploy.sh

echo "🎉 Deployment completed!"
ENDSSH

# Cleanup
echo "🧹 Cleaning up..."
rm -rf deployment-temp deployment.tar.gz

echo "✅ Deployment to EC2 completed successfully!"
echo "🌐 Your application should be accessible at:"
echo "   http://$EC2_HOST:3000"

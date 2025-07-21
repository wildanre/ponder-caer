# EC2 Deployment Guide for Ponder Application

This guide covers the complete setup for deploying your Ponder application to Amazon EC2 with automated CI/CD using GitHub Actions.

## 📋 Prerequisites

- Amazon EC2 instance (you already have: `52.65.212.6`)
- GitHub repository with your code
- SSH access to your EC2 instance
- Your EC2 private key file

## 🚀 Initial EC2 Setup

### Step 1: Connect to your EC2 instance

```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
```

### Step 2: Run the setup script

Copy the setup script to your EC2 instance and run it:

```bash
# On your local machine
scp -i /path/to/your-key.pem scripts/setup-ec2.sh ec2-user@52.65.212.6:~/
```

```bash
# On your EC2 instance
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### Step 3: Configure PM2 startup (important!)

After running the setup script, you'll see a command like:
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

Run that command with `sudo` to enable PM2 to start your application on boot.

### Step 4: Configure environment variables

```bash
# Copy the template and edit it
cp ~/.env.template ~/.env
nano ~/.env
```

Add your environment variables:
```env
DATABASE_URL=your_supabase_connection_string
PORT=3000
# Add other variables as needed
```

## 🔧 GitHub Actions CI/CD Setup

### Step 1: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_HOST` | `52.65.212.6` | Your EC2 public IP |
| `EC2_USERNAME` | `ec2-user` | SSH username (might be `ubuntu` depending on your AMI) |
| `EC2_PRIVATE_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Your EC2 private key content |

### Step 2: Push your code

The CI/CD pipeline will trigger automatically when you push to `main` or `use-cloud-db` branches.

```bash
git add .
git commit -m "Add CI/CD pipeline for EC2 deployment"
git push origin use-cloud-db
```

## 🛠️ Manual Deployment (Testing)

If you want to deploy manually for testing:

### Option 1: Using the deployment script

```bash
# Set your SSH key path
export SSH_KEY_PATH="/path/to/your-key.pem"

# Run the deployment script
chmod +x scripts/deploy-to-ec2.sh
./scripts/deploy-to-ec2.sh
```

### Option 2: Direct deployment

```bash
# Copy files to EC2
scp -i /path/to/your-key.pem -r src package.json ponder.config.ts ec2-user@52.65.212.6:~/ponder-caer/

# SSH to EC2 and deploy
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
cd ~/ponder-caer
pnpm install
pm2 restart ponder-caer || pm2 start --name "ponder-caer" --interpreter node -- node_modules/.bin/ponder start
```

## 📊 Monitoring and Management

### Check application status

```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
pm2 status
pm2 logs ponder-caer
```

### View application logs

```bash
# Real-time logs
pm2 logs ponder-caer --lines 100

# Error logs only
pm2 logs ponder-caer --err

# Follow logs
pm2 logs ponder-caer -f
```

### Restart application

```bash
pm2 restart ponder-caer
```

### Stop application

```bash
pm2 stop ponder-caer
```

## 🌐 Access Your Application

Once deployed, your Ponder application will be accessible at:
- **HTTP**: `http://52.65.212.6:3000`
- **Public DNS**: `http://ec2-52-65-212-6.ap-southeast-2.compute.amazonaws.com:3000`

## 🔒 Security Considerations

### 1. Security Group Settings

Make sure your EC2 security group allows:
- **SSH (Port 22)**: For deployment access
- **HTTP (Port 3000)**: For application access
- **HTTPS (Port 443)**: If you plan to use SSL

### 2. Environment Variables

Never commit sensitive data like database passwords. Always use:
- GitHub Secrets for CI/CD
- `.env` files on the server (not committed to git)

### 3. SSL Certificate (Recommended)

Consider setting up SSL with Let's Encrypt:

```bash
# Install certbot
sudo yum install -y certbot

# Get certificate (you'll need a domain name)
sudo certbot certonly --standalone -d yourdomain.com
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission denied (publickey)**
   - Check your SSH key path
   - Ensure the key has correct permissions: `chmod 400 /path/to/key.pem`

2. **Application not starting**
   - Check logs: `pm2 logs ponder-caer`
   - Verify environment variables: `cat ~/.env`
   - Check Node.js version: `node --version`

3. **Port already in use**
   - Kill existing processes: `pkill -f ponder`
   - Or change the port in your environment variables

4. **Database connection issues**
   - Verify DATABASE_URL in `.env`
   - Test connection from EC2: `ping your-db-host`

### Deployment Fails

1. Check GitHub Actions logs in your repository
2. Verify all secrets are set correctly
3. Ensure EC2 instance is running and accessible

## 📝 Maintenance

### Update Dependencies

```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
cd ~/ponder-caer
pnpm update
pm2 restart ponder-caer
```

### Backup

```bash
# Create backup before deployment
tar -czf ponder-caer-backup-$(date +%Y%m%d).tar.gz ponder-caer/
```

### Log Rotation

PM2 handles log rotation automatically, but you can configure it:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔄 Updating the Pipeline

If you need to modify the deployment process:

1. Edit `.github/workflows/deploy.yml`
2. Test changes on a development branch
3. Merge to main when ready

The pipeline includes:
- ✅ Code quality checks (linting, type checking)
- ✅ Dependency installation
- ✅ Application building
- ✅ Deployment to EC2
- ✅ Health checks
- ✅ Automatic rollback on failure

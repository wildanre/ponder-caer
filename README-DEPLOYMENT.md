# 🚀 Quick Start: Deploy to Your EC2

Your Ponder application is now ready for automated deployment to your Amazon EC2 instance!

## 📋 What's Included

✅ **GitHub Actions CI/CD Pipeline** (`.github/workflows/deploy.yml`)
✅ **EC2 Setup Script** (`scripts/setup-ec2.sh`)
✅ **Manual Deployment Script** (`scripts/deploy-to-ec2.sh`)
✅ **PM2 Process Management** (`ecosystem.config.js`)
✅ **Complete Documentation** (`DEPLOYMENT.md`)

## 🚀 Quick Setup (3 Steps)

### 1. Prepare Your EC2 Instance

SSH to your EC2 and run the setup:
```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6

# Copy and run setup script
wget https://raw.githubusercontent.com/your-username/ponder-caer/main/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets → Actions and add:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | `52.65.212.6` |
| `EC2_USERNAME` | `ec2-user` |
| `EC2_PRIVATE_KEY` | Your EC2 private key content |

### 3. Deploy!

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin use-cloud-db
```

That's it! Your app will auto-deploy and be available at:
**http://52.65.212.6:3000**

## 🔧 Alternative: Manual Deployment

If you prefer manual deployment:

```bash
export SSH_KEY_PATH="/path/to/your-key.pem"
chmod +x scripts/deploy-to-ec2.sh
./scripts/deploy-to-ec2.sh
```

## 📊 Monitor Your App

```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
pm2 status
pm2 logs ponder-caer
```

## 🆘 Need Help?

Check the complete guide: [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

**Your EC2 Instance Details:**
- **IP**: 52.65.212.6
- **DNS**: ec2-52-65-212-6.ap-southeast-2.compute.amazonaws.com
- **Private IP**: 172.31.15.75
- **Application URL**: http://52.65.212.6:3000
- **Health Check**: http://52.65.212.6:3000/api/health

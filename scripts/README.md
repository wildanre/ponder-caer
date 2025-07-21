# Deployment Scripts

This folder contains utility scripts for deploying the Ponder blockchain indexer application.

## Available Scripts

### 🚀 quick-deploy.sh
**Purpose**: Fast deployment from local machine to EC2  
**Usage**: `./scripts/quick-deploy.sh`  
**What it does**:
- Syncs local files to EC2 instance
- Installs dependencies with pnpm
- Runs codegen
- Starts application with PM2
- Tests the deployment

**Prerequisites**:
- SSH key at `/Users/danuste/Downloads/ec2key.pem`
- EC2 instance accessible at `52.65.212.6`

### 🔐 github-secrets-helper.sh
**Purpose**: Helper for setting up GitHub Actions secrets  
**Usage**: `./scripts/github-secrets-helper.sh`  
**What it does**:
- Guides you through setting up GitHub repository secrets
- Shows how to encode SSH keys for GitHub Actions
- Provides commands for setting up automated CI/CD

**Needed for**: Automated deployments via GitHub Actions

### 🧪 test-ssh.sh
**Purpose**: Test SSH connection to EC2 instance  
**Usage**: `./scripts/test-ssh.sh`  
**What it does**:
- Tests SSH connectivity to EC2
- Verifies server status and requirements
- Helpful for debugging connection issues

**Use when**: Troubleshooting deployment connection problems

## Deployment Status

✅ **Current Status**: Application successfully deployed and running  
🌐 **Live URL**: http://52.65.212.6:3000  
📊 **Health Check**: http://52.65.212.6:3000/api/health

## Quick Start

1. **Fast Deploy**: `./scripts/quick-deploy.sh`
2. **Test Connection**: `./scripts/test-ssh.sh`
3. **Setup CI/CD**: `./scripts/github-secrets-helper.sh`

## Cleanup

Previously removed unused scripts:
- `debug-deployment.sh` - debugging deployment issues (obsolete)
- `fix-ubuntu-deployment.sh` - Ubuntu-specific fixes (completed)
- `test-deploy.sh` - deployment testing (replaced by quick-deploy)
- `test-workflow.sh` - workflow validation (obsolete)
- `deploy-to-ec2.sh` - basic deployment (replaced by quick-deploy)
- `manual-deploy.sh` - manual deployment steps (replaced by quick-deploy)
- `setup-ec2.sh` - EC2 setup (completed)
- `validate-env.sh` - environment validation (obsolete)

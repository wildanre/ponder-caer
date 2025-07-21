# 🧪 Test Deployment dari Terminal Lokal

Saya sudah buatkan 3 script untuk test deployment workflow dari terminal lokal sebelum menjalankan GitHub Actions.

## 📋 Script yang Tersedia:

### 1. **Test SSH Connection** 
```bash
./scripts/test-ssh.sh
```
**Fungsi:**
- ✅ Mencari file .pem otomatis
- ✅ Test validitas SSH key
- ✅ Test koneksi ke EC2 dengan username `ec2-user` dan `ubuntu`
- ✅ Menampilkan konten .pem untuk GitHub Secrets
- ✅ Memberikan hasil yang perlu di-copy ke GitHub Secrets

### 2. **Test GitHub Actions Workflow**
```bash
./scripts/test-workflow.sh
```
**Fungsi:**
- ✅ Simulasi steps GitHub Actions di local
- ✅ Check Node.js dan pnpm version
- ✅ Install dependencies (`pnpm install`)
- ✅ Run type checking (`pnpm typecheck`)
- ✅ Run linting (`pnpm lint`)
- ✅ Build project (`pnpm codegen`)
- ✅ Test deployment package creation
- ✅ Validasi file-file yang dibutuhkan

### 3. **Test Full Deployment**
```bash
./scripts/test-deploy.sh
```
**Fungsi:**
- ✅ Test SSH connection ke EC2
- ✅ Build deployment package (sama seperti GitHub Actions)
- ✅ Upload file ke EC2 via SCP
- ✅ Execute deployment script di EC2
- ✅ Install dependencies di EC2
- ✅ Start aplikasi dengan PM2
- ✅ Health check
- ✅ Cleanup

## 🚀 **Cara Penggunaan:**

### **Step 1: Test SSH Connection**
```bash
./scripts/test-ssh.sh
```

**Output yang diharapkan:**
```
✅ SSH connection successful!
📝 For GitHub Secrets, copy this EXACT key content:
==================================================================
-----BEGIN RSA PRIVATE KEY-----
[Your key content here]
-----END RSA PRIVATE KEY-----
==================================================================

📋 GitHub Secrets Setup:
EC2_HOST = 52.65.212.6
EC2_USERNAME = ec2-user (or ubuntu)
EC2_PRIVATE_KEY = [Copy the content above]
```

### **Step 2: Test Workflow (Optional)**
```bash
./scripts/test-workflow.sh
```

### **Step 3: Test Full Deployment**
```bash
./scripts/test-deploy.sh
```

**Jika berhasil:**
```
✅ SSH connection working
✅ File upload successful
✅ Deployment script executed
✅ Application started with PM2

🌐 Your app should be available at:
http://52.65.212.6:3000
http://52.65.212.6:3000/api/health
```

## 🔧 **Troubleshooting:**

### **Error: Permission denied (publickey)**
```bash
# Jalankan script SSH test
./scripts/test-ssh.sh

# Script akan otomatis:
# 1. Cari file .pem
# 2. Set permission 600
# 3. Test kedua username (ec2-user dan ubuntu)
# 4. Tampilkan konten .pem untuk GitHub Secrets
```

### **Error: SSH connection failed**
Kemungkinan masalah:
1. **Security Group EC2** tidak allow SSH (port 22)
2. **EC2 instance** tidak running
3. **File .pem salah** untuk instance ini
4. **IP changed** (cek current public IP di AWS Console)

### **Error: pnpm command not found**
```bash
npm install -g pnpm
```

## 📋 **Setelah Test Berhasil:**

### **1. Set GitHub Secrets:**
Dari hasil `./scripts/test-ssh.sh`:
- `EC2_HOST` = `52.65.212.6`
- `EC2_USERNAME` = `ec2-user` atau `ubuntu` (lihat hasil test)
- `EC2_PRIVATE_KEY` = Konten .pem file lengkap

### **2. Push untuk Trigger CI/CD:**
```bash
git add .
git commit -m "Ready for CI/CD deployment"
git push origin use-cloud-db
```

### **3. Monitor GitHub Actions:**
- Buka GitHub → Actions tab
- Lihat workflow "Deploy to EC2"
- Seharusnya tidak ada error SSH lagi

## 🎯 **Expected Results:**

Setelah semua test berhasil:
- ✅ SSH connection working
- ✅ Deployment package builds successfully  
- ✅ Files upload to EC2
- ✅ Application starts with PM2
- ✅ Health check passes
- ✅ App accessible at http://52.65.212.6:3000

## 🛠️ **Debug Commands:**

```bash
# Quick SSH test
ssh -i /path/to/key.pem ec2-user@52.65.212.6

# Check EC2 status after deployment
ssh -i /path/to/key.pem ec2-user@52.65.212.6 "pm2 status"

# Check application logs
ssh -i /path/to/key.pem ec2-user@52.65.212.6 "pm2 logs ponder-caer"

# Check if port 3000 is open
curl http://52.65.212.6:3000/api/health
```

---

**Mulai dengan menjalankan `./scripts/test-ssh.sh` terlebih dahulu!** 🚀

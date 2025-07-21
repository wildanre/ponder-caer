# 🔐 Environment Variables & CI/CD Setup

## 📋 Environment Variables yang Dibutuhkan

Berdasarkan analisis kode aplikasi Anda, berikut adalah env vars yang diperlukan:

### **1. Database Configuration (WAJIB)**
```env
DATABASE_URL=postgresql://postgres.xanvchnjbfuavmxmvpnf:vNAqdr1pt8rBVdja@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### **2. Blockchain RPC (OPSIONAL)**
```env
ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

### **3. Application Port (OPSIONAL)**
```env
PORT=3000
NODE_ENV=production
```

## 🔧 Setup Environment Variables

### **Di EC2 Instance:**

1. **SSH ke EC2 dan buat file .env:**
```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
cd ~/ponder-caer
nano .env
```

2. **Isi dengan values Anda:**
```env
# Database - WAJIB
DATABASE_URL=postgresql://postgres.xanvchnjbfuavmxmvpnf:vNAqdr1pt8rBVdja@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# RPC - Optional (sudah ada default)
ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Application Settings
PORT=3000
NODE_ENV=production
```

### **Di GitHub Secrets (untuk CI/CD):**

**Repository Settings → Secrets and variables → Actions:**

#### **🔐 Secrets yang WAJIB:**
| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_HOST` | `52.65.212.6` | IP address EC2 Anda |
| `EC2_USERNAME` | `ec2-user` | Username SSH (bisa juga `ubuntu`) |
| `EC2_PRIVATE_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | **SELURUH KONTEN .pem FILE** |

#### **🌍 Environment Variables (Optional):**
| Variable Name | Value | Description |
|---------------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Jika ingin override database |
| `ARB_SEPOLIA_RPC_URL` | `https://...` | RPC endpoint custom |

## ❓ **Apakah Perlu .pem File untuk CI/CD?**

### **JAWABAN: TIDAK perlu upload file .pem, tapi PERLU konten .pem**

### ✅ **Yang BENAR:**
- **Buka file .pem dengan text editor**
- **Copy SELURUH konten** (dari `-----BEGIN RSA PRIVATE KEY-----` sampai `-----END RSA PRIVATE KEY-----`)
- **Paste ke GitHub Secret `EC2_PRIVATE_KEY`**

### ❌ **Yang SALAH:**
- Upload file .pem ke repository
- Commit file .pem ke git
- Share file .pem di mana pun

### **Contoh konten .pem yang di-copy:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END RSA PRIVATE KEY-----
```

## 🔧 **Cara Setup GitHub Secrets:**

### **1. Buka Repository di GitHub**
- Go to: `https://github.com/wildanre/ponder-caer`

### **2. Navigate ke Settings**
- Settings → Secrets and variables → Actions

### **3. Add Secrets:**

#### **EC2_HOST:**
```
52.65.212.6
```

#### **EC2_USERNAME:**
```
ec2-user
```
*Note: Bisa jadi `ubuntu` tergantung AMI yang Anda pakai*

#### **EC2_PRIVATE_KEY:**
```
-----BEGIN RSA PRIVATE KEY-----
[PASTE SELURUH KONTEN FILE .PEM ANDA DI SINI]
-----END RSA PRIVATE KEY-----
```

## 🚀 **Proses Deploy:**

1. **GitHub Actions menggunakan secrets untuk SSH ke EC2**
2. **Upload deployment package ke EC2**
3. **SSH ke EC2 dan jalankan deployment script**
4. **Aplikasi membaca .env file dari EC2**

## 🔐 **Security Best Practices:**

### ✅ **DO:**
- Simpan .pem file di local machine dengan permission 400
- Copy konten .pem ke GitHub Secrets
- Gunakan .env file di EC2 untuk app config
- Regular rotation SSH keys

### ❌ **DON'T:**
- Commit .pem file ke git
- Share .pem file via email/chat
- Hardcode sensitive data dalam code
- Upload .pem ke cloud storage

## 🛠️ **Testing Connection:**

### **Test SSH connection dari local:**
```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
```

### **Test GitHub Actions secrets:**
- Push ke branch `use-cloud-db`
- Check Actions tab di GitHub
- Lihat logs untuk error

## 📝 **Environment File Template:**

Saya sudah buatkan template `.env` di EC2 setup script:

```bash
# File: ~/.env.template (sudah ada di EC2 setelah setup)
DATABASE_URL=postgresql://postgres.xanvchnjbfuavmxmvpnf:vNAqdr1pt8rBVdja@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
PORT=3000
NODE_ENV=production
```

## 🔍 **Troubleshooting:**

### **Error: Permission denied (publickey)**
- Check EC2_PRIVATE_KEY secret format
- Pastikan complete dari BEGIN sampai END
- Check EC2_USERNAME (ec2-user vs ubuntu)

### **Error: Database connection failed**
- Check DATABASE_URL di .env file EC2
- Test koneksi database dari EC2
- Verify Supabase firewall settings

### **Error: Application not starting**
```bash
ssh -i /path/to/your-key.pem ec2-user@52.65.212.6
pm2 logs ponder-caer
```

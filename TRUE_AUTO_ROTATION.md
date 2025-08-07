# True RPC Auto-Rotation - Solution

## 🎯 Problem Solved
✅ **Auto-rotation setiap 90 detik** dengan restart Ponder  
✅ **Automatic .env update** untuk switch RPC URLs  
✅ **Health monitoring** dan recovery otomatis  
✅ **Graceful shutdown** dan cleanup  

## 🚀 Quick Start

### Option 1: JavaScript Rotator (RECOMMENDED)
```bash
# Start auto-rotator (akan handle semua)
node scripts/ponder-rpc-rotator.js

# Output yang diharapkan:
# [timestamp] 🌟 Ponder RPC Auto-Rotator Started
# [timestamp] 🚀 Starting Ponder...
# [timestamp] ✅ Ponder started successfully
# [timestamp] 🔄 Starting rotation #1...
```

### Option 2: Bash Rotator (Simple)
```bash
# Start bash auto-rotator
./scripts/auto-rpc-rotator.sh

# Output yang diharapkan:
# [timestamp] 🌟 RPC Auto-Rotator Started
# [timestamp] 🚀 Starting Ponder...
# [timestamp] ✅ Ponder started successfully (PID: xxxx)
```

## 🔧 How It Works

### Rotation Process:
1. **Stop current Ponder** process gracefully
2. **Update .env file** dengan RPC URLs yang ditukar
3. **Wait 2 seconds** untuk cleanup
4. **Start new Ponder** process dengan RPC baru
5. **Monitor startup** untuk memastikan success
6. **Repeat setiap 90 detik**

### RPC Switching Pattern:
```
Rotation 1: Primary → Backup RPC
Rotation 2: Backup → Primary RPC  
Rotation 3: Primary → Backup RPC
... (continues)
```

## 📊 Monitoring

### Real-time Logs:
```bash
# JavaScript rotator (built-in colored logs)
node scripts/ponder-rpc-rotator.js

# Bash rotator with log file
./scripts/auto-rpc-rotator.sh
tail -f ponder.log
```

### Check Current RPC:
```bash
# Check .env for current RPC
grep "ETHERLINK_TESTNET_RPC_URL" .env

# Expected output:
# ETHERLINK_TESTNET_RPC_URL="https://rpc.ankr.com/etherlink_testnet"
# ETHERLINK_TESTNET_RPC_URL_BACKUP="https://node.ghostnet.etherlink.com"
```

### Manual Status Check:
```bash
# Check if rotator is running
ps aux | grep -E "(ponder-rpc-rotator|auto-rpc-rotator)"

# Check if Ponder is running
ps aux | grep ponder

# Check logs
tail -20 ponder.log
```

## ⚙️ Configuration

### Customize Rotation Interval:
**JavaScript version** (`scripts/ponder-rpc-rotator.js`):
```javascript
// Line 13: Change rotation interval
this.rotationInterval = 90 * 1000; // 90 seconds
```

**Bash version** (`scripts/auto-rpc-rotator.sh`):
```bash
# Line 8: Change rotation interval  
ROTATION_INTERVAL=90  # seconds
```

### Add More RPC URLs:
**JavaScript version**:
```javascript
// Line 9-12: Add more RPC URLs
this.rpcUrls = [
  "https://rpc.ankr.com/etherlink_testnet",
  "https://node.ghostnet.etherlink.com",
  "https://your-custom-rpc.com",  // Add here
];
```

## 🛑 Stop Auto-Rotator

### Graceful Stop:
```bash
# Press Ctrl+C in terminal where rotator is running
# Rotator will:
# 1. Stop Ponder gracefully
# 2. Clean up processes  
# 3. Exit cleanly
```

### Force Stop:
```bash
# Kill all processes
pkill -f "ponder-rpc-rotator"
pkill -f "auto-rpc-rotator"  
pkill -f "ponder"
```

## 🔍 Troubleshooting

### Problem: "Ponder failed to start"
```bash
# Solution:
1. Check if port 42069 is free: lsof -i :42069
2. Check .env file is valid
3. Try manual start: pnpm dev
4. Check logs for specific errors
```

### Problem: "Permission denied"
```bash
# Solution:
chmod +x scripts/auto-rpc-rotator.sh
chmod +x scripts/ponder-rpc-rotator.js
```

### Problem: "Cannot rotate RPC"
```bash
# Solution:
1. Check .env file exists and is writable
2. Verify RPC URLs are accessible:
   curl https://rpc.ankr.com/etherlink_testnet
3. Check network connectivity
```

## 📈 Benefits

✅ **True Auto-Rotation**: Real rotation setiap 90 detik  
✅ **Load Distribution**: Equal load pada kedua RPC  
✅ **Fault Tolerance**: Auto-recovery jika Ponder crash  
✅ **Zero Manual Work**: Set-and-forget operation  
✅ **Detailed Logging**: Full visibility pada rotation process  
✅ **Graceful Handling**: Proper cleanup dan shutdown  

## 🎯 Expected Output

### Successful Rotation:
```
[2025-08-07T10:00:00.000Z] 🔄 Starting rotation #1...
[2025-08-07T10:00:00.500Z] 🛑 Stopping Ponder...
[2025-08-07T10:00:03.000Z] ✅ Ponder stopped
[2025-08-07T10:00:03.100Z] 🔄 RPC rotated to: etherlink.com
[2025-08-07T10:00:05.000Z] 🚀 Starting Ponder...
[2025-08-07T10:00:15.000Z] ✅ Ponder started successfully
[2025-08-07T10:00:15.100Z] ✅ Rotation #1 completed
[2025-08-07T10:00:15.200Z] ⏰ Next rotation in 90 seconds
```

**Ready to use! Pilih salah satu script dan jalankan untuk true auto-rotation.** 🚀

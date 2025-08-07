# Quick Fix untuk "Cannot request logs over more than 1000 blocks"

## 🚨 Masalah
- Error: "Cannot request logs over more than 1000 blocks"
- RPC rotation belum berfungsi otomatis karena keterbatasan Ponder

## ✅ Solusi Langsung

### 1. Gunakan Multiple RPC URLs (Sudah Dikonfigurasi)
Ponder config Anda sudah diupdate dengan multiple RPC untuk automatic failover:

```typescript
// ponder.config.ts sudah dikonfigurasi dengan:
rpc: [
  "https://rpc.ankr.com/etherlink_testnet",
  "https://node.ghostnet.etherlink.com"
]
```

### 2. Manual RPC Switch (Recommended untuk sekarang)

**Cara 1: Update .env secara manual**
```bash
# Edit .env file, tukar primary dan backup:
ETHERLINK_TESTNET_RPC_URL="https://node.ghostnet.etherlink.com"
ETHERLINK_TESTNET_RPC_URL_BACKUP="https://rpc.ankr.com/etherlink_testnet"

# Restart Ponder
pnpm dev
```

**Cara 2: Gunakan True Auto-Rotator (RECOMMENDED)**
```bash
# Method 1: JavaScript Rotator (Robust)
node scripts/ponder-rpc-rotator.js

# Method 2: Bash Rotator (Simple)
./scripts/auto-rpc-rotator.sh

# Kedua script akan:
# 1. Auto-restart Ponder setiap 90 detik
# 2. Switch RPC URLs di .env file
# 3. Monitor Ponder health
# 4. Handle recovery jika error
```

### 3. Monitoring RPC Status

```bash
# Cek RPC yang sedang aktif
curl -X POST https://rpc.ankr.com/etherlink_testnet \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

curl -X POST https://node.ghostnet.etherlink.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## 🔧 Langkah Troubleshooting

1. **Jika masih error 1000 blocks:**
   - Switch manual ke RPC backup
   - Restart Ponder
   - Monitor logs untuk error pattern

2. **Jika ingin rotation otomatis:**
   - Gunakan `node scripts/ponder-rpc-rotator.js` (RECOMMENDED)
   - Atau gunakan `./scripts/auto-rpc-rotator.sh`  
   - Script akan auto-restart Ponder setiap 90 detik
   - Monitor dengan `tail -f ponder.log`

3. **Alternative: Reduce block range**
   - Mulai dari startBlock yang lebih recent
   - Update `startBlock: 20856651` ke block number yang lebih baru

## 📝 Commands untuk Testing

```bash
# Test current setup
pnpm dev

# Check logs for RPC activity
pnpm dev 2>&1 | grep -E "(RPC|error|Block)"

# Manual RPC switch test
# Edit .env, swap URLs, then:
pnpm dev
```

## 🎯 Expected Behavior

Dengan konfigurasi current:
- Ponder akan coba primary RPC first
- Jika error/timeout, auto-switch ke backup
- Log akan show failover activity
- RPC manager akan track dan log status

**Note**: True rotation (every 90 blocks) memerlukan restart Ponder karena limitasi arsitektur Ponder.

## 🔍 Testing GraphQL API

### 1. Start Ponder & Check GraphQL
```bash
# Start Ponder
pnpm dev

# Tunggu message:
# ✅ GraphQL API ready at http://localhost:42069/api/graphql

# Buka browser ke:
http://localhost:42069/api/graphql
```

### 2. Test Queries di GraphQL Playground
```graphql
# Health check
query {
  health {
    success
    message
    timestamp
  }
}

# Cek data pools
query {
  pools {
    id
    collateralToken
    borrowToken
    ltv
  }
}
```

### 3. Alternative: cURL Test
```bash
# Quick health check
curl -X POST http://localhost:42069/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health { success message } }"}'
```

📚 **Panduan lengkap**: Lihat `HOW_TO_CHECK_GRAPHQL.md` untuk detail testing GraphQL.

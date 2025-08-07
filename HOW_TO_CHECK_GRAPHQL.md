# Cara Cek GraphQL API - Panduan Lengkap

## 🚀 Menjalankan Ponder dengan GraphQL

### 1. Start Ponder Server
```bash
# Di terminal, jalankan:
pnpm dev

# Atau jika menggunakan npm:
npm run dev

# Tunggu sampai muncul log:
# ✅ GraphQL API ready at http://localhost:42069/api/graphql
```

### 2. Akses GraphQL Playground
Buka browser dan kunjungi:
```
http://localhost:42069/api/graphql
```

## 🔍 Testing GraphQL Queries

### 1. Health Check (Test Koneksi)
```graphql
query HealthCheck {
  health {
    success
    message
    timestamp
    version
  }
}
```

### 2. Cek Data Pools
```graphql
query GetAllPools {
  pools {
    id
    collateralToken
    borrowToken
    ltv
    createdAt
    blockNumber
    transactionHash
  }
}
```

### 3. Cek Positions
```graphql
query GetAllPositions {
  positions {
    id
    user
    positionAddress
    poolAddress
    blockNumber
    timestamp
  }
}
```

### 4. Cek Global Stats
```graphql
query GetGlobalStats {
  globalStats {
    totalPools
    totalPositions
    totalLiquiditySupplies
    totalCollateralSupplies
    totalBorrowDebts
  }
}
```

## 🛠️ Alternative Testing Methods

### 1. Using cURL
```bash
# Health check
curl -X POST http://localhost:42069/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health { success message timestamp } }"}'

# Get pools
curl -X POST http://localhost:42069/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ pools { id collateralToken borrowToken ltv } }"}'
```

### 2. Using Postman/Insomnia
- **Method**: POST
- **URL**: `http://localhost:42069/api/graphql`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "query": "{ health { success message timestamp } }"
}
```

### 3. Using JavaScript/Fetch
```javascript
// Test dalam browser console atau script
fetch('http://localhost:42069/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      query {
        health {
          success
          message
          timestamp
        }
        pools {
          id
          collateralToken
          borrowToken
        }
      }
    `
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 📊 Monitoring dan Debugging

### 1. Cek Port dan Status
```bash
# Cek apakah port 42069 terbuka
lsof -i :42069

# Atau di Windows:
netstat -an | findstr 42069
```

### 2. Cek Logs Ponder
```bash
# Jalankan dengan verbose logging
pnpm dev | tee ponder.log

# Atau filter logs GraphQL
pnpm dev 2>&1 | grep -E "(GraphQL|API|error)"
```

### 3. Test Schema Introspection
```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
    }
  }
}
```

## 🔧 Troubleshooting

### Problem 1: "Cannot connect to GraphQL"
```bash
# Solusi:
1. Pastikan Ponder running: pnpm dev
2. Cek port: lsof -i :42069  
3. Restart Ponder: Ctrl+C, then pnpm dev
```

### Problem 2: "No data returned"
```bash
# Cek apakah data sudah di-sync:
1. Monitor logs untuk event processing
2. Cek database: queries database langsung
3. Verify startBlock di ponder.config.ts
```

### Problem 3: "GraphQL syntax error"
```bash
# Pastikan query syntax benar:
1. Gunakan GraphQL Playground untuk validation
2. Cek field names di schema
3. Pastikan brackets dan quotes benar
```

## 📚 Available Queries (Quick Reference)

### Pools & Factory Data
- `pools` - All lending pools
- `pool(address)` - Specific pool
- `poolStats(address)` - Pool statistics
- `basicTokenSenders` - Cross-chain senders
- `priceDataStreams` - Price oracle data

### Positions & Users
- `positions` - All positions
- `position(address)` - Specific position
- `userPositions(userAddress)` - User's positions
- `userStats(userAddress)` - User statistics
- `users` - All users

### Activities & Transactions
- `liquiditySupplies` - Supply events
- `liquidityWithdrawals` - Withdrawal events
- `collateralSupplies` - Collateral deposits
- `borrowDebts` - Borrowing events
- `repayWithCollaterals` - Repayment events

### Analytics
- `globalStats` - Platform statistics
- `health` - API health check

## 🎯 Example Test Flow

```bash
# 1. Start Ponder
pnpm dev

# 2. Wait for ready message
# ✅ GraphQL API ready at http://localhost:42069/api/graphql

# 3. Open browser
open http://localhost:42069/api/graphql

# 4. Test health check
# Paste health query in playground

# 5. Check data
# Try pools, positions, etc.

# 6. Monitor logs
# Check terminal for sync progress
```

## 📝 Pro Tips

1. **GraphQL Playground** - Best for interactive testing
2. **cURL** - Good for quick checks and scripts  
3. **Postman/Insomnia** - Great for API documentation
4. **Browser DevTools** - Perfect for debugging client-side

Gunakan GraphQL Playground di browser untuk testing interaktif - ini adalah cara termudah!

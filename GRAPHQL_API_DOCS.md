# GraphQL API Documentation

API ini telah **sepenuhnya** diubah dari REST ke GraphQL. **Hanya** GraphQL endpoint yang tersedia di `/api/graphql`.

## Endpoint GraphQL

- **URL**: `/api/graphql`
- **Method**: POST (untuk queries/mutations), GET (untuk queries dengan query string)
- **Content-Type**: `application/json`

## GraphQL Playground

Anda dapat mengakses GraphQL Playground di browser pada endpoint `/api/graphql` untuk menguji queries secara interaktif.

## Contoh Queries

### 1. Health Check

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

### 2. Get All Pools

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

### 3. Get Specific Pool with Related Data

```graphql
query GetPoolWithDetails($address: String!) {
  pool(address: $address) {
    id
    collateralToken
    borrowToken
    ltv
    createdAt
    liquiditySupplies {
      id
      user
      amount
      shares
      timestamp
    }
    positions {
      id
      user
      positionAddress
      timestamp
    }
    collateralSupplies {
      id
      user
      amount
      timestamp
    }
  }
}
```

Variables:
```json
{
  "address": "0x123..."
}
```

### 4. Get User Positions

```graphql
query GetUserPositions($userAddress: String!) {
  userPositions(userAddress: $userAddress) {
    id
    user
    positionAddress
    poolAddress
    timestamp
    pool {
      collateralToken
      borrowToken
      ltv
    }
  }
}
```

### 5. Get User Statistics

```graphql
query GetUserStats($userAddress: String!) {
  userStats(userAddress: $userAddress) {
    userAddress
    totalPositions
    totalLiquiditySupplied
    totalCollateralSupplied
    totalBorrowed
    activePositions
  }
}
```

### 6. Get Pool Statistics

```graphql
query GetPoolStats($address: String!) {
  poolStats(address: $address) {
    poolAddress
    totalLiquidity
    totalCollateral
    totalBorrowed
    totalPositions
    totalTransactions
  }
}
```

### 7. Get Global Statistics

```graphql
query GetGlobalStats {
  globalStats {
    totalPools
    totalPositions
    totalUsers
    totalTransactions
    totalLiquidity
    totalCollateral
    totalBorrowed
  }
}
```

### 8. Get Activities with Filters

```graphql
query GetActivities($poolAddress: String, $userAddress: String, $limit: Int) {
  liquiditySupplies(poolAddress: $poolAddress, userAddress: $userAddress, limit: $limit) {
    id
    user
    poolAddress
    amount
    shares
    timestamp
    transactionHash
  }
  
  collateralSupplies(poolAddress: $poolAddress, userAddress: $userAddress, limit: $limit) {
    id
    user
    poolAddress
    amount
    timestamp
    transactionHash
  }
  
  borrowDebtsCrosschain(poolAddress: $poolAddress, userAddress: $userAddress, limit: $limit) {
    id
    user
    poolAddress
    amount
    shares
    chainId
    bridgeTokenSender
    timestamp
    transactionHash
  }
}
```

### 9. Get All Users

```graphql
query GetAllUsers {
  users {
    address
    totalPositions
    totalTransactions
    firstInteraction
    lastInteraction
  }
}
```

### 10. Get Price Data Streams

```graphql
query GetPriceDataStreams {
  priceDataStreams {
    id
    token
    dataStream
    blockNumber
    transactionHash
  }
}
```

### 11. Complex Query with Multiple Relations

```graphql
query ComplexQuery {
  pools {
    id
    collateralToken
    borrowToken
    ltv
    createdAt
    liquiditySupplies(limit: 5) {
      id
      user
      amount
      timestamp
    }
    positions(limit: 3) {
      id
      user
      positionAddress
    }
  }
  
  globalStats {
    totalPools
    totalUsers
    totalTransactions
  }
}
```

## Keuntungan GraphQL

1. **Single Endpoint**: Semua data dapat diakses melalui satu endpoint `/api/graphql`
2. **Flexible Queries**: Client dapat meminta data yang spesifik sesuai kebutuhan
3. **Nested Data**: Dapat mengambil data relasi dalam satu query
4. **Type Safety**: Schema yang kuat dengan validasi otomatis
5. **Introspection**: API self-documenting
6. **Real-time**: Mudah ditingkatkan dengan subscriptions
7. **Simplified Architecture**: Tidak ada kompleksitas multiple REST endpoints

## Perubahan dari REST

- ✅ **Sebelumnya**: Multiple REST endpoints (`/api/pools`, `/api/positions`, dll.)
- ✅ **Sekarang**: Single GraphQL endpoint (`/api/graphql`)
- ✅ **Health Check**: Masih tersedia di `/api/health`
- ❌ **REST Routes**: Sudah dihapus sepenuhnya

## Performance Tips

1. Gunakan field selection yang spesifik untuk mengurangi payload
2. Gunakan parameter `limit` untuk pagination
3. Hindari nested queries yang terlalu dalam
4. Cache queries yang sering digunakan

## Error Handling

GraphQL akan mengembalikan response dengan struktur:
```json
{
  "data": { ... },
  "errors": [
    {
      "message": "Error message",
      "locations": [{"line": 2, "column": 3}],
      "path": ["fieldName"]
    }
  ]
}
```

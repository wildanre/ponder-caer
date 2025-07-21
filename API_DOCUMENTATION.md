# Lending Pool API Routes Documentation

## Overview
The API has been successfully refactored into a modular structure with the following features:
- ✅ Modular route organization (7 route modules)
- ✅ CORS enabled for frontend integration (localhost:3000, 5173, 8080)
- ✅ BigInt serialization support for blockchain data
- ✅ Comprehensive error handling and validation
- ✅ POST endpoints for frontend integration
- ✅ Advanced filtering and pagination

## Base URL
```
http://localhost:42069/api
```

## Available Routes

### Health Check
- **GET** `/health` - API health status and version

### Pools
- **GET** `/pools` - Get all lending pools
- **GET** `/pools/:poolAddress` - Get specific pool details
- **GET** `/pools/:poolAddress/analytics` - Pool analytics and metrics
- **GET** `/pools/search?query=...` - Search pools by token symbols
- **POST** `/pools` - Create new pool (for frontend integration)

### Positions
- **GET** `/positions` - Get all positions
- **GET** `/positions/:positionAddress` - Get specific position details
- **GET** `/positions/user/:userAddress` - Get user positions
- **GET** `/positions/health` - Get positions with health scores
- **GET** `/positions/liquidation-candidates` - Positions at risk
- **POST** `/positions/health-check` - Update position health status

### Activities
- **GET** `/activities` - Get all activities with filtering
- **GET** `/activities/types` - Get activity type summary
- **GET** `/activities/timeline` - Activities timeline view
- **POST** `/activities/track` - Track new activity

### Users  
- **GET** `/users/:userAddress` - Get user profile and summary
- **GET** `/users/leaderboard` - User leaderboard by volume
- **GET** `/users/search?query=...` - Search users by address
- **POST** `/users/preferences` - Update user preferences

### Tokens
- **GET** `/tokens` - Get all supported tokens
- **GET** `/tokens/:tokenAddress` - Get token details and price
- **GET** `/tokens/prices` - Get all token prices  
- **GET** `/tokens/trending` - Get trending tokens
- **POST** `/tokens/price-update` - Update token price

### Stats
- **GET** `/stats` - Protocol overview statistics
- **GET** `/stats/historical` - Historical protocol data
- **GET** `/stats/tokens` - Token usage statistics
- **POST** `/stats/refresh` - Refresh statistics cache

### Webhooks (for Frontend Integration)
- **POST** `/webhooks/transaction` - Process transaction notifications
- **POST** `/webhooks/price-alert` - Set up price alerts  
- **POST** `/webhooks/liquidation-alert` - Liquidation warnings
- **POST** `/webhooks/user-preferences` - User notification preferences

## Query Parameters

### Common Parameters
- `limit` - Number of results (default: 50, max: 1000)
- `offset` - Pagination offset (default: 0)
- `sortBy` - Sort field (timestamp, amount, blockNumber)
- `sortOrder` - Sort direction (asc, desc)

### Activity Filters
- `user` - Filter by user address
- `pool` - Filter by pool address
- `type` - Activity type (liquidity_supply, collateral_supply, etc.)
- `startTime` - Start timestamp
- `endTime` - End timestamp

### Position Filters
- `healthThreshold` - Health score threshold
- `riskLevel` - Risk level (low, medium, high, critical)

## Example API Calls

### Get User Activities
```bash
curl "http://localhost:42069/api/activities?user=0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42&limit=5"
```

### Get Pool Analytics
```bash
curl "http://localhost:42069/api/pools/0x0a97cC170B77362Fd29edC650D0BFf009B7b30eD/analytics"
```

### Post Transaction Webhook
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"txHash": "0x123...", "type": "liquidity_supply", "userAddress": "0xabc..."}' \
  "http://localhost:42069/api/webhooks/transaction"
```

### Get User Profile
```bash
curl "http://localhost:42069/api/users/0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42"
```

## Response Format

All responses follow this structure:
```json
{
  "success": true|false,
  "data": [...],  // Response data
  "count": 10,    // Number of items returned
  "total": 100,   // Total items available (for pagination)
  "pagination": { // Pagination info
    "offset": 0,
    "limit": 50,
    "hasMore": true
  },
  "message": "...", // Success/error message
  "error": "..."    // Error details (if failed)
}
```

## Frontend Integration

### CORS Configuration
- Allowed origins: localhost:3000, localhost:5173, localhost:8080
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization

### BigInt Handling
All blockchain numbers (amounts, timestamps) are automatically converted to strings for JSON compatibility.

## Testing Status
- ✅ Health endpoint working
- ✅ Pools endpoints tested and working
- ✅ Positions endpoints tested and working  
- ✅ Activities endpoints with filtering tested
- ✅ Users endpoints tested and working
- ✅ Tokens endpoints working
- ✅ Webhook POST endpoints validated
- ✅ Error handling and validation working

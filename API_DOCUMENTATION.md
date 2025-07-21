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
  - **Parameters:** None
  - **Response:** Array of pool objects with id, collateralToken, borrowToken, ltv, createdAt

- **GET** `/pools/:poolAddress` - Get specific pool details
  - **Path Parameters:**
    - `poolAddress` (string, required) - The pool contract address
  - **Response:** Single pool object

- **GET** `/pools/:poolAddress/activities` - Get activities for a specific pool
  - **Path Parameters:**
    - `poolAddress` (string, required) - The pool contract address
  - **Response:** Array of activities (supplies, withdrawals, collaterals, borrows) for the pool

- **GET** `/pools/search?query=...` - Search pools by token symbols
  - **Query Parameters:**
    - `query` (string, required) - Search term for token symbols
  - **Response:** Filtered pools matching the search criteria

- **POST** `/pools` - Create new pool (for frontend integration)
  - **Body Parameters:**
    - `collateralToken` (string, required) - Collateral token address
    - `borrowToken` (string, required) - Borrow token address
    - `ltv` (string, required) - Loan-to-value ratio
  - **Response:** Created pool object

### Positions
- **GET** `/positions` - Get all positions
  - **Parameters:** None
  - **Response:** Array of position objects with id, user, positionAddress, poolAddress

- **GET** `/positions/:positionAddress` - Get specific position details
  - **Path Parameters:**
    - `positionAddress` (string, required) - The position contract address
  - **Response:** Single position object

- **GET** `/positions/user/:userAddress` - Get user positions
  - **Path Parameters:**
    - `userAddress` (string, required) - The user wallet address
  - **Response:** Array of positions owned by the user

- **GET** `/positions/health` - Get positions with health scores
  - **Query Parameters:**
    - `threshold` (number, optional) - Health score threshold filter
    - `riskLevel` (string, optional) - Risk level filter: 'low', 'medium', 'high', 'critical'
  - **Response:** Array of positions with calculated health scores

- **GET** `/positions/liquidation-candidates` - Positions at risk of liquidation
  - **Query Parameters:**
    - `healthThreshold` (number, optional, default: 1.1) - Health score below which positions are considered at risk
  - **Response:** Array of positions with health score below threshold

- **POST** `/positions/health-check` - Update position health status
  - **Body Parameters:**
    - `positionAddress` (string, required) - Position contract address
    - `healthScore` (number, required) - New health score
    - `riskLevel` (string, required) - Risk level: 'low', 'medium', 'high', 'critical'
  - **Response:** Updated position health status

### Activities
- **GET** `/activities` - Get all activities with filtering
  - **Query Parameters:**
    - `limit` (number, optional, default: 50, max: 1000) - Number of results to return
    - `offset` (number, optional, default: 0) - Pagination offset
    - `type` (string, optional) - Activity type filter: 'liquidity_supply', 'liquidity_withdraw', 'collateral_supply', 'borrow', 'borrow_crosschain', 'repay_with_collateral'
    - `user` (string, optional) - Filter by user address
    - `pool` (string, optional) - Filter by pool address
  - **Response:** Paginated array of activity objects with type and category

- **GET** `/activities/user/:userAddress` - Get activities for specific user
  - **Path Parameters:**
    - `userAddress` (string, required) - The user wallet address
  - **Query Parameters:**
    - `limit` (number, optional, default: 50) - Number of results
    - `offset` (number, optional, default: 0) - Pagination offset
  - **Response:** Paginated user activities

- **GET** `/activities/types` - Get activity type summary
  - **Parameters:** None
  - **Response:** Summary of activity counts by type

- **GET** `/activities/timeline` - Activities timeline view
  - **Query Parameters:**
    - `period` (string, optional, default: '24h') - Time period: '1h', '24h', '7d', '30d'
  - **Response:** Activities grouped by time period

- **POST** `/activities/search` - Advanced activity search
  - **Body Parameters:**
    - `types` (string[], optional) - Array of activity types to filter
    - `userAddress` (string, optional) - User address filter
    - `poolAddress` (string, optional) - Pool address filter
    - `minAmount` (number, optional) - Minimum amount filter
    - `maxAmount` (number, optional) - Maximum amount filter
    - `fromTimestamp` (number, optional) - Start time filter (Unix timestamp)
    - `toTimestamp` (number, optional) - End time filter (Unix timestamp)
    - `limit` (number, optional, default: 50) - Number of results
    - `offset` (number, optional, default: 0) - Pagination offset
  - **Response:** Filtered and paginated activities

- **POST** `/activities/track` - Track new activity
  - **Body Parameters:**
    - `type` (string, required) - Activity type
    - `userAddress` (string, required) - User wallet address
    - `poolAddress` (string, required) - Pool contract address
    - `amount` (string, required) - Transaction amount
    - `txHash` (string, required) - Transaction hash
  - **Response:** Confirmation of tracked activity

### Users  
- **GET** `/users/:userAddress` - Get user profile and summary
  - **Path Parameters:**
    - `userAddress` (string, required) - The user wallet address
  - **Response:** User profile with summary metrics, activities, and volumes

- **GET** `/users/leaderboard` - User leaderboard by volume
  - **Query Parameters:**
    - `limit` (number, optional, default: 50) - Number of top users to return
    - `sortBy` (string, optional, default: 'totalVolume') - Sort criteria: 'totalVolume', 'totalPositions', 'totalTransactions'
    - `period` (string, optional, default: 'all') - Time period: '24h', '7d', '30d', 'all'
  - **Response:** Ranked list of users with metrics

- **GET** `/users/search` - Search users by address
  - **Query Parameters:**
    - `query` (string, required) - Search term (partial address)
    - `limit` (number, optional, default: 20) - Number of results
  - **Response:** Array of matching user addresses and basic info

- **POST** `/users/preferences` - Update user preferences
  - **Body Parameters:**
    - `userAddress` (string, required) - User wallet address
    - `notifications` (object, optional) - Notification preferences
      - `email` (string, optional) - Email address
      - `discord` (string, optional) - Discord username
      - `telegram` (string, optional) - Telegram username
    - `preferences` (object, optional) - User preferences
      - `theme` (string, optional) - UI theme: 'light', 'dark'
      - `currency` (string, optional) - Preferred currency: 'USD', 'ETH'
      - `language` (string, optional) - Language preference
  - **Response:** Updated user preferences

### Tokens
- **GET** `/tokens` - Get all supported tokens
  - **Parameters:** None
  - **Response:** Array of token objects with address, symbol, name, decimals, isNative

- **GET** `/tokens/:tokenAddress` - Get token details and metadata
  - **Path Parameters:**
    - `tokenAddress` (string, required) - Token contract address
  - **Response:** Single token object with metadata

- **GET** `/tokens/prices` - Get all token prices (static mock data)
  - **Query Parameters:**
    - `currency` (string, optional, default: 'USD') - Price currency: 'USD', 'ETH'
  - **Response:** Token prices with 24h change data

- **GET** `/tokens/trending` - Get trending tokens
  - **Query Parameters:**
    - `limit` (number, optional, default: 10) - Number of trending tokens
  - **Response:** Array of trending tokens with price and volume data

- **POST** `/tokens/metadata` - Get multiple token metadata
  - **Body Parameters:**
    - `addresses` (string[], required) - Array of token addresses
  - **Response:** Object with token addresses as keys and metadata as values

- **POST** `/tokens/prices` - Get token prices for multiple tokens
  - **Body Parameters:**
    - `addresses` (string[], required) - Array of token addresses
    - `currency` (string, optional, default: 'USD') - Price currency
  - **Response:** Object with token prices and 24h changes

- **POST** `/tokens/price-update` - Update token price (for admin/oracles)
  - **Body Parameters:**
    - `tokenAddress` (string, required) - Token contract address
    - `price` (number, required) - New price value
    - `currency` (string, optional, default: 'USD') - Price currency
  - **Response:** Confirmation of price update

### Stats
- **GET** `/stats` - Protocol overview statistics
  - **Parameters:** None
  - **Response:** Protocol metrics including TVL, total users, volumes

- **GET** `/stats/historical` - Historical protocol data
  - **Query Parameters:**
    - `period` (string, optional, default: '30d') - Time period: '7d', '30d', '90d', '1y'
    - `metric` (string, optional) - Specific metric: 'tvl', 'volume', 'users', 'transactions'
  - **Response:** Time series data for the specified period

- **GET** `/stats/tokens` - Token usage statistics
  - **Query Parameters:**
    - `sortBy` (string, optional, default: 'volume') - Sort by: 'volume', 'tvl', 'transactions'
    - `limit` (number, optional, default: 10) - Number of tokens to return
  - **Response:** Token statistics sorted by specified metric

- **POST** `/stats/refresh` - Refresh statistics cache
  - **Body Parameters:**
    - `metrics` (string[], optional) - Specific metrics to refresh: 'tvl', 'volume', 'users'
  - **Response:** Confirmation of cache refresh

### Webhooks (for Frontend Integration)

- **POST** `/webhooks/transaction` - Process transaction notifications
  - **Body Parameters:**
    - `txHash` (string, required) - Transaction hash
    - `type` (string, required) - Transaction type: 'liquidity_supply', 'collateral_supply', 'borrow', etc.
    - `userAddress` (string, required) - User wallet address
    - `poolAddress` (string, optional) - Pool contract address
    - `amount` (string, optional) - Transaction amount
    - `status` (string, optional, default: 'pending') - Transaction status: 'pending', 'confirmed', 'failed'
  - **Response:** Processed webhook data with ID and timestamp

- **POST** `/webhooks/price-alert` - Set up price alerts
  - **Body Parameters:**
    - `userAddress` (string, required) - User wallet address
    - `tokenAddress` (string, required) - Token contract address
    - `alertType` (string, required) - Alert type: 'above', 'below'
    - `targetPrice` (number, required) - Price threshold for alert
    - `currentPrice` (number, required) - Current token price
    - `alertId` (string, optional) - Custom alert identifier
  - **Response:** Alert configuration with processing confirmation

- **POST** `/webhooks/liquidation-alert` - Liquidation warnings
  - **Body Parameters:**
    - `userAddress` (string, required) - User wallet address
    - `positionId` (string, required) - Position identifier
    - `healthScore` (number, required) - Current health score
    - `warningLevel` (string, required) - Warning level: 'warning', 'critical'
    - `collateralValue` (number, optional) - Current collateral value
    - `debtValue` (number, optional) - Current debt value
  - **Response:** Warning notification with processing details

- **POST** `/webhooks/user-preferences` - User notification preferences
  - **Body Parameters:**
    - `userAddress` (string, required) - User wallet address
    - `preferences` (object, required) - Notification preferences
      - `email` (boolean, optional) - Enable email notifications
      - `push` (boolean, optional) - Enable push notifications
      - `discord` (boolean, optional) - Enable Discord notifications
    - `alertTypes` (string[], optional) - Types of alerts to enable: 'liquidation', 'price', 'transaction'
  - **Response:** Updated preference settings

## Query Parameters

### Common Parameters
- `limit` (number, optional, default: 50, max: 1000) - Number of results to return
- `offset` (number, optional, default: 0) - Pagination offset for results
- `sortBy` (string, optional) - Sort field options:
  - For activities: 'timestamp', 'amount', 'blockNumber'
  - For users: 'totalVolume', 'totalPositions', 'totalTransactions'
  - For tokens: 'volume', 'price', 'change24h'
- `sortOrder` (string, optional, default: 'desc') - Sort direction: 'asc', 'desc'

### Activity Filters
- `user` (string, optional) - Filter by user wallet address (case-insensitive)
- `pool` (string, optional) - Filter by pool contract address
- `type` (string, optional) - Activity type filter:
  - `liquidity_supply` - Liquidity provision
  - `liquidity_withdraw` - Liquidity withdrawal
  - `collateral_supply` - Collateral deposit
  - `borrow` - Borrowing action
  - `borrow_crosschain` - Cross-chain borrowing
  - `repay_with_collateral` - Repayment using collateral
- `startTime` (number, optional) - Start timestamp (Unix timestamp in seconds)
- `endTime` (number, optional) - End timestamp (Unix timestamp in seconds)
- `minAmount` (number, optional) - Minimum transaction amount filter
- `maxAmount` (number, optional) - Maximum transaction amount filter

### Position Filters
- `healthThreshold` (number, optional, default: 1.0) - Health score threshold for filtering
- `riskLevel` (string, optional) - Risk level classification:
  - `low` - Health score > 1.5
  - `medium` - Health score 1.2 - 1.5
  - `high` - Health score 1.0 - 1.2
  - `critical` - Health score < 1.0

### Search Parameters
- `query` (string, required for search endpoints) - Search term:
  - For pools: token symbols or names
  - For users: partial wallet addresses (minimum 3 characters)
  - For tokens: symbol or name

### Time Period Parameters
- `period` (string, optional) - Predefined time periods:
  - `1h` - Last 1 hour
  - `24h` - Last 24 hours
  - `7d` - Last 7 days
  - `30d` - Last 30 days
  - `90d` - Last 90 days
  - `1y` - Last 1 year
  - `all` - All time data

## Example API Calls

### Get User Activities
```bash
curl "http://localhost:42069/api/activities?user=0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42&limit=5&type=liquidity_supply"
```

### Get Pool Details
```bash
curl "http://localhost:42069/api/pools/0x0a97cC170B77362Fd29edC650D0BFf009B7b30eD"
```

### Get Pool Activities
```bash
curl "http://localhost:42069/api/pools/0x0a97cC170B77362Fd29edC650D0BFf009B7b30eD/activities"
```

### Get User Profile
```bash
curl "http://localhost:42069/api/users/0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42"
```

### Get Position Health Scores
```bash
curl "http://localhost:42069/api/positions/health?healthThreshold=1.2&riskLevel=high"
```

### Advanced Activity Search
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "types": ["liquidity_supply", "collateral_supply"],
    "userAddress": "0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42",
    "minAmount": 1000,
    "fromTimestamp": 1640995200,
    "limit": 10
  }' \
  "http://localhost:42069/api/activities/search"
```

### Get Multiple Token Metadata
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "0x0000000000000000000000000000000000000000",
      "0xA0b86a33E6441c22E712cEF8A7f7C26b6fb60ee5"
    ]
  }' \
  "http://localhost:42069/api/tokens/metadata"
```

### Get Token Prices
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "0x0000000000000000000000000000000000000000",
      "0xA0b86a33E6441c22E712cEF8A7f7C26b6fb60ee5"
    ],
    "currency": "USD"
  }' \
  "http://localhost:42069/api/tokens/prices"
```

### Transaction Webhook
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x123abc...",
    "type": "liquidity_supply",
    "userAddress": "0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42",
    "poolAddress": "0x0a97cC170B77362Fd29edC650D0BFf009B7b30eD",
    "amount": "1000000",
    "status": "pending"
  }' \
  "http://localhost:42069/api/webhooks/transaction"
```

### Price Alert Setup
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42",
    "tokenAddress": "0x0000000000000000000000000000000000000000",
    "alertType": "above",
    "targetPrice": 3500,
    "currentPrice": 3200
  }' \
  "http://localhost:42069/api/webhooks/price-alert"
```

### Liquidation Warning
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0xa5ea1Cb1033F5d3BD207bF6a2a2504cF1c3e9F42",
    "positionId": "0xc41b5043ea78240401d3738Eae70B7CDD1657eC4",
    "healthScore": 1.05,
    "warningLevel": "critical",
    "collateralValue": 5000,
    "debtValue": 4500
  }' \
  "http://localhost:42069/api/webhooks/liquidation-alert"
```

## Response Format

All responses follow this standardized structure:

### Success Response
```json
{
  "success": true,
  "data": [...] | {...},     // Response data (array or object)
  "count": 10,               // Number of items returned
  "total": 100,              // Total items available (for pagination)
  "pagination": {            // Pagination info (when applicable)
    "offset": 0,
    "limit": 50,
    "hasMore": true
  },
  "message": "Success message"  // Optional success message
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error category",     // Error type/category
  "message": "Detailed error message",  // Human-readable error description
  "code": "ERROR_CODE",         // Optional error code
  "details": {...}              // Optional additional error details
}
```

### Common HTTP Status Codes
- `200 OK` - Successful GET/POST requests
- `201 Created` - Successful resource creation
- `400 Bad Request` - Invalid parameters or request body
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Data Types
- **Addresses**: Lowercase hexadecimal strings (e.g., "0xa5ea1cb1033f5d3bd207bf6a2a2504cf1c3e9f42")
- **Amounts**: String representation of numbers to handle BigInt values
- **Timestamps**: Unix timestamps in seconds (number)
- **Hashes**: Hexadecimal transaction hashes (string)
- **Health Scores**: Decimal numbers (e.g., 1.25)
- **Percentages**: Decimal representation (e.g., 0.05 for 5%)

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

## Public Access Setup

### Option 1: Ngrok (Recommended)
1. Sign up at https://dashboard.ngrok.com/signup
2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure authtoken:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```
4. Start public tunnel:
   ```bash
   ngrok http 42069
   ```
   This provides a public URL like: `https://abc123.ngrok-free.app`

### Option 2: Serveo (SSH Tunnel)
```bash
ssh -R 80:localhost:42069 serveo.net
```
Provides URL like: `https://randomid.serveo.net`

### Option 3: LocalTunnel
```bash
npx localtunnel --port 42069
```

### CORS Configuration
The API is configured to accept requests from:
- `http://localhost:3000` (React/Next.js default)
- `http://localhost:5173` (Vite default)
- `http://localhost:8080` (Vue.js default)

For public access, you may need to update CORS settings in `src/api/index.ts` to include your domain.

## Development Notes

### BigInt Handling
All blockchain-related numbers (amounts, timestamps, block numbers) are automatically serialized as strings to prevent JSON serialization issues with JavaScript's BigInt type.

### Database Connection
The API uses Supabase PostgreSQL database with Drizzle ORM for data access. Connection details are configured via environment variables.

### Rate Limiting
Currently no rate limiting is implemented. For production use, consider adding rate limiting middleware.

### Authentication
The API currently has no authentication. For production deployment, implement proper authentication and authorization.

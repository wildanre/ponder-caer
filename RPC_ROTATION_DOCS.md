# RPC Auto-Rotation Implementation

## Current Status

❌ **Issue**: "Cannot request logs over more than 1000 blocks" error  
❌ **Problem**: Ponder doesn't support dynamic RPC switching during runtime  
✅ **Solution**: Multiple approaches implemented

## Implemented Solutions

### 1. **Multiple RPC Configuration** (Active)
Ponder config with multiple RPC URLs for automatic failover:
```typescript
// ponder.config.ts
chains: {
  etherlink: {
    id: 128123,
    rpc: [
      "https://rpc.ankr.com/etherlink_testnet",
      "https://node.ghostnet.etherlink.com"
    ]
  }
}
```

### 2. **RPC Manager Class** (Monitoring Only)
- Tracks block progression
- Logs RPC status every 10 blocks
- Calculates rotation timing
- **Note**: Cannot change active RPC in Ponder runtime

### 3. **External RPC Rotator Script** (Optional)
`scripts/rpc-rotator.js` - Updates .env file every 90 seconds:
```bash
node scripts/rpc-rotator.js &  # Run in background
pnpm dev                      # Start Ponder
```

## Understanding the Error

**"Cannot request logs over more than 1000 blocks"** occurs when:
- RPC provider limits log queries to 1000 blocks
- Ponder tries to sync large block ranges
- Network congestion causes timeouts

## Current Behavior

✅ **Automatic Failover**: Ponder switches to backup RPC on errors  
✅ **Block Range Limiting**: Reduced to manageable chunks  
✅ **Retry Logic**: Built-in error handling  
❌ **Dynamic Rotation**: Not supported by Ponder architecture  

## Recommended Approach

### Option 1: Use Ponder's Built-in Failover
- Keep both RPC URLs in config
- Let Ponder handle switching automatically
- Monitor logs for failover events

### Option 2: Manual RPC Rotation
1. Stop Ponder
2. Update `.env` with different primary RPC
3. Restart Ponder
4. Repeat every 90 blocks manually

### Option 3: External Script (Advanced)
```bash
# Terminal 1 - Start RPC rotator
node scripts/rpc-rotator.js

# Terminal 2 - Start Ponder with restart on env changes
pnpm dev

# Manual restart Ponder when .env changes
```

## Monitoring Commands

```bash
# Check current RPC status
grep "ETHERLINK_TESTNET_RPC_URL" .env

# Monitor Ponder logs for RPC switching
pnpm dev | grep -E "(RPC|error|switch)"

# Test RPC endpoints
curl -X POST https://rpc.ankr.com/etherlink_testnet \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Next Steps

1. **Test automatic failover** by monitoring Ponder logs
2. **Use external rotator** if needed for equal load distribution
3. **Monitor RPC health** and switch manually if issues persist
4. **Consider upgrading** to RPC providers with higher limits

## Environment Variables

```env
ETHERLINK_TESTNET_RPC_URL="https://rpc.ankr.com/etherlink_testnet"
ETHERLINK_TESTNET_RPC_URL_BACKUP="https://node.ghostnet.etherlink.com"
```

Ponder will automatically use the backup URL if primary fails.

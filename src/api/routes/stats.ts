import { Hono } from "hono";
import { db, lendingPoolTable, positionTable, liquiditySupplyTable, liquidityWithdrawTable, collateralSupplyTable, borrowDebtTable } from "../../db";
import { serializeBigInt } from '../index';

export const statsRoutes = new Hono();

// GET /stats/overview - Get overall protocol statistics
statsRoutes.get("/stats/overview", async (c) => {
  try {
    // Get all data
    const pools = await db.select().from(lendingPoolTable);
    const positions = await db.select().from(positionTable);
    const supplies = await db.select().from(liquiditySupplyTable);
    const withdrawals = await db.select().from(liquidityWithdrawTable);
    const collaterals = await db.select().from(collateralSupplyTable);
    const borrows = await db.select().from(borrowDebtTable);

    // Calculate metrics
    const totalLiquiditySupplied = supplies.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalLiquidityWithdrawn = withdrawals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalCollateralSupplied = collaterals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalBorrowed = borrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    // Count unique users
    const uniqueUsers = new Set([
      ...supplies.map((item: any) => item.user),
      ...withdrawals.map((item: any) => item.user),
      ...collaterals.map((item: any) => item.user),
      ...borrows.map((item: any) => item.user)
    ].filter(Boolean));

    const overview = {
      protocol: {
        totalPools: pools.length,
        totalPositions: positions.length,
        totalUsers: uniqueUsers.size,
        totalTransactions: supplies.length + withdrawals.length + collaterals.length + borrows.length
      },
      liquidity: {
        totalSupplied: totalLiquiditySupplied,
        totalWithdrawn: totalLiquidityWithdrawn,
        netLiquidity: totalLiquiditySupplied - totalLiquidityWithdrawn,
        utilizationRate: totalLiquiditySupplied > 0 ? (totalBorrowed / totalLiquiditySupplied) * 100 : 0
      },
      lending: {
        totalCollateralSupplied,
        totalBorrowed,
        healthRatio: totalCollateralSupplied > 0 ? (totalCollateralSupplied / totalBorrowed) : 0
      },
      volume24h: {
        supplies: supplies.filter((item: any) => {
          const dayAgo = Math.floor(Date.now() / 1000) - 86400;
          return Number(item.timestamp) >= dayAgo;
        }).reduce((sum: number, item: any) => sum + Number(item.amount), 0),
        borrows: borrows.filter((item: any) => {
          const dayAgo = Math.floor(Date.now() / 1000) - 86400;
          return Number(item.timestamp) >= dayAgo;
        }).reduce((sum: number, item: any) => sum + Number(item.amount), 0)
      }
    };

    return c.json({
      success: true,
      data: serializeBigInt(overview),
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch overview stats",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /stats/pools - Get pool statistics
statsRoutes.get("/stats/pools", async (c) => {
  try {
    const pools = await db.select().from(lendingPoolTable);
    const supplies = await db.select().from(liquiditySupplyTable);
    const withdrawals = await db.select().from(liquidityWithdrawTable);
    const collaterals = await db.select().from(collateralSupplyTable);
    const borrows = await db.select().from(borrowDebtTable);

    const poolStats = pools.map((pool: any) => {
      // Filter activities by pool
      const poolSupplies = supplies.filter((s: any) => s.poolAddress === pool.id);
      const poolWithdrawals = withdrawals.filter((w: any) => w.poolAddress === pool.id);
      const poolCollaterals = collaterals.filter((c: any) => c.poolAddress === pool.id);
      const poolBorrows = borrows.filter((b: any) => b.poolAddress === pool.id);

      // Calculate metrics
      const totalSupplied = poolSupplies.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
      const totalWithdrawn = poolWithdrawals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
      const totalCollateral = poolCollaterals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
      const totalBorrowed = poolBorrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

      // Count unique users
      const uniqueUsers = new Set([
        ...poolSupplies.map((item: any) => item.user),
        ...poolWithdrawals.map((item: any) => item.user),
        ...poolCollaterals.map((item: any) => item.user),
        ...poolBorrows.map((item: any) => item.user)
      ].filter(Boolean));

      return {
        poolAddress: pool.id,
        collateralToken: pool.collateralToken,
        borrowToken: pool.borrowToken,
        ltv: Number(pool.ltv),
        metrics: {
          totalSupplied,
          totalWithdrawn,
          netLiquidity: totalSupplied - totalWithdrawn,
          totalCollateral,
          totalBorrowed,
          utilizationRate: totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0,
          uniqueUsers: uniqueUsers.size,
          totalTransactions: poolSupplies.length + poolWithdrawals.length + poolCollaterals.length + poolBorrows.length
        }
      };
    });

    return c.json({
      success: true,
      data: serializeBigInt(poolStats),
      count: poolStats.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pool stats",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /stats/historical - Get historical statistics
statsRoutes.post("/stats/historical", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      timeframe = '7d', 
      interval = '1d',
      metrics = ['volume', 'users', 'transactions']
    } = body;

    // Calculate timeframe in seconds
    let timeframeSeconds = 7 * 24 * 3600; // default 7d
    if (timeframe === '1d') timeframeSeconds = 24 * 3600;
    else if (timeframe === '30d') timeframeSeconds = 30 * 24 * 3600;
    else if (timeframe === '90d') timeframeSeconds = 90 * 24 * 3600;

    // Calculate interval in seconds
    let intervalSeconds = 24 * 3600; // default 1d
    if (interval === '1h') intervalSeconds = 3600;
    else if (interval === '4h') intervalSeconds = 4 * 3600;
    else if (interval === '12h') intervalSeconds = 12 * 3600;

    const now = Math.floor(Date.now() / 1000);
    const startTime = now - timeframeSeconds;

    // Get all activities within timeframe
    const supplies = await db.select().from(liquiditySupplyTable);
    const withdrawals = await db.select().from(liquidityWithdrawTable);
    const collaterals = await db.select().from(collateralSupplyTable);
    const borrows = await db.select().from(borrowDebtTable);

    const allActivities = [
      ...supplies.map((item: any) => ({ ...item, type: 'supply' })),
      ...withdrawals.map((item: any) => ({ ...item, type: 'withdraw' })),
      ...collaterals.map((item: any) => ({ ...item, type: 'collateral' })),
      ...borrows.map((item: any) => ({ ...item, type: 'borrow' }))
    ].filter((item: any) => Number(item.timestamp) >= startTime);

    // Group data by time intervals
    const intervals: { [key: number]: any } = {};
    
    for (let time = startTime; time <= now; time += intervalSeconds) {
      const intervalEnd = time + intervalSeconds;
      const intervalActivities = allActivities.filter((item: any) => {
        const timestamp = Number(item.timestamp);
        return timestamp >= time && timestamp < intervalEnd;
      });

      intervals[time] = {
        timestamp: time,
        volume: intervalActivities.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0),
        transactions: intervalActivities.length,
        users: new Set(intervalActivities.map((item: any) => item.user).filter(Boolean)).size,
        supplies: intervalActivities.filter((item: any) => item.type === 'supply').length,
        withdrawals: intervalActivities.filter((item: any) => item.type === 'withdraw').length,
        collaterals: intervalActivities.filter((item: any) => item.type === 'collateral').length,
        borrows: intervalActivities.filter((item: any) => item.type === 'borrow').length
      };
    }

    const historicalData = Object.values(intervals);

    return c.json({
      success: true,
      data: serializeBigInt(historicalData),
      timeframe,
      interval,
      metrics
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch historical stats",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /stats/tokens - Get token usage statistics
statsRoutes.get("/stats/tokens", async (c) => {
  try {
    const pools = await db.select().from(lendingPoolTable);
    const supplies = await db.select().from(liquiditySupplyTable);
    const collaterals = await db.select().from(collateralSupplyTable);
    const borrows = await db.select().from(borrowDebtTable);

    // Count token usage
    const tokenStats: { [key: string]: any } = {};

    pools.forEach((pool: any) => {
      // Collateral token stats
      if (!tokenStats[pool.collateralToken]) {
        tokenStats[pool.collateralToken] = {
          address: pool.collateralToken,
          poolsAsCollateral: 0,
          poolsAsBorrow: 0,
          totalCollateralVolume: 0,
          totalBorrowVolume: 0,
          totalSupplyVolume: 0
        };
      }
      tokenStats[pool.collateralToken].poolsAsCollateral += 1;

      // Borrow token stats
      if (!tokenStats[pool.borrowToken]) {
        tokenStats[pool.borrowToken] = {
          address: pool.borrowToken,
          poolsAsCollateral: 0,
          poolsAsBorrow: 0,
          totalCollateralVolume: 0,
          totalBorrowVolume: 0,
          totalSupplyVolume: 0
        };
      }
      tokenStats[pool.borrowToken].poolsAsBorrow += 1;
    });

    // Add volume data
    supplies.forEach((supply: any) => {
      const poolData = pools.find((p: any) => p.id === supply.poolAddress);
      if (poolData && tokenStats[poolData.borrowToken]) {
        tokenStats[poolData.borrowToken].totalSupplyVolume += Number(supply.amount);
      }
    });

    collaterals.forEach((collateral: any) => {
      const poolData = pools.find((p: any) => p.id === collateral.poolAddress);
      if (poolData && tokenStats[poolData.collateralToken]) {
        tokenStats[poolData.collateralToken].totalCollateralVolume += Number(collateral.amount);
      }
    });

    borrows.forEach((borrow: any) => {
      const poolData = pools.find((p: any) => p.id === borrow.poolAddress);
      if (poolData && tokenStats[poolData.borrowToken]) {
        tokenStats[poolData.borrowToken].totalBorrowVolume += Number(borrow.amount);
      }
    });

    return c.json({
      success: true,
      data: serializeBigInt(Object.values(tokenStats))
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch token stats",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

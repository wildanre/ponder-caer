import { Hono } from "hono";
import { db, lendingPoolTable, basicTokenSenderTable, priceDataStreamTable, positionTable, liquiditySupplyTable, liquidityWithdrawTable, collateralSupplyTable, borrowDebtTable, borrowDebtCrosschainTable, repayWithCollateralTable } from "../db";

const app = new Hono();

// Helper function to convert BigInt to string for JSON serialization
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }
  return obj;
};

// Add global BigInt serialization support
(BigInt.prototype as any).toJSON = function() { return this.toString(); };


// GET /api/pools - Get all lending pools
app.get("/api/pools", async (c) => {
  try {
    const pools = await db
      .select()
      .from(lendingPoolTable);
    
    return c.json({
      success: true,
      data: serializeBigInt(pools),
      count: pools.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pools",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/pools/:poolAddress - Get specific pool details
app.get("/api/pools/:poolAddress", async (c) => {
  try {
    const poolAddress = c.req.param("poolAddress");
    
    const pools = await db
      .select()
      .from(lendingPoolTable);
    
    const pool = pools.find((p: any) => p.id === poolAddress);
    
    if (!pool) {
      return c.json({
        success: false,
        error: "Pool not found"
      }, 404);
    }

    return c.json({
      success: true,
      data: serializeBigInt(pool)
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pool",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/pools/:poolAddress/activities - Get pool activities
app.get("/api/pools/:poolAddress/activities", async (c) => {
  try {
    const poolAddress = c.req.param("poolAddress");
    
    // Get liquidity supplies for this pool
    const supplies = await db
      .select()
      .from(liquiditySupplyTable);
    const poolSupplies = supplies.filter((s: any) => s.poolAddress === poolAddress);

    // Get liquidity withdrawals for this pool
    const withdrawals = await db
      .select()
      .from(liquidityWithdrawTable);
    const poolWithdrawals = withdrawals.filter((w: any) => w.poolAddress === poolAddress);

    // Get collateral supplies for this pool
    const collaterals = await db
      .select()
      .from(collateralSupplyTable);
    const poolCollaterals = collaterals.filter((c: any) => c.poolAddress === poolAddress);

    // Get borrows for this pool
    const borrows = await db
      .select()
      .from(borrowDebtTable);
    const poolBorrows = borrows.filter((b: any) => b.poolAddress === poolAddress);

    // Combine all activities with type labels
    const activities = [
      ...poolSupplies.map((item: any) => ({ ...item, type: 'liquidity_supply' })),
      ...poolWithdrawals.map((item: any) => ({ ...item, type: 'liquidity_withdraw' })),
      ...poolCollaterals.map((item: any) => ({ ...item, type: 'collateral_supply' })),
      ...poolBorrows.map((item: any) => ({ ...item, type: 'borrow' }))
    ];

    // Sort by timestamp (newest first)
    activities.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));

    return c.json({
      success: true,
      data: {
        supplies: poolSupplies,
        withdrawals: poolWithdrawals,
        collaterals: poolCollaterals,
        borrows: poolBorrows,
        allActivities: activities.slice(0, 50) // Limit to 50 recent activities
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pool activities",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/pools/:poolAddress/positions - Get pool positions
app.get("/api/pools/:poolAddress/positions", async (c) => {
  try {
    const poolAddress = c.req.param("poolAddress");
    
    const allPositions = await db
      .select()
      .from(positionTable);
    
    const poolPositions = allPositions.filter((p: any) => p.poolAddress === poolAddress);

    return c.json({
      success: true,
      data: poolPositions
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pool positions",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/users/:userAddress - Get user's positions and activities
app.get("/api/users/:userAddress", async (c) => {
  try {
    const userAddress = c.req.param("userAddress").toLowerCase();
    
    // Get user positions
    const allPositions = await db
      .select()
      .from(positionTable);
    const userPositions = allPositions.filter((p: any) => p.user.toLowerCase() === userAddress);

    // Get user liquidity supplies
    const allSupplies = await db
      .select()
      .from(liquiditySupplyTable);
    const userSupplies = allSupplies.filter((s: any) => s.user.toLowerCase() === userAddress);

    // Get user liquidity withdrawals
    const allWithdrawals = await db
      .select()
      .from(liquidityWithdrawTable);
    const userWithdrawals = allWithdrawals.filter((w: any) => w.user.toLowerCase() === userAddress);

    // Get user collateral supplies
    const allCollaterals = await db
      .select()
      .from(collateralSupplyTable);
    const userCollaterals = allCollaterals.filter((c: any) => c.user.toLowerCase() === userAddress);

    // Get user borrows
    const allBorrows = await db
      .select()
      .from(borrowDebtTable);
    const userBorrows = allBorrows.filter((b: any) => b.user.toLowerCase() === userAddress);

    // Get user crosschain borrows
    const allCrosschainBorrows = await db
      .select()
      .from(borrowDebtCrosschainTable);
    const userCrosschainBorrows = allCrosschainBorrows.filter((b: any) => b.user.toLowerCase() === userAddress);

    // Get user repayments
    const allRepayments = await db
      .select()
      .from(repayWithCollateralTable);
    const userRepayments = allRepayments.filter((r: any) => r.user.toLowerCase() === userAddress);

    return c.json({
      success: true,
      data: {
        positions: userPositions,
        activities: {
          liquiditySupplies: userSupplies.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          liquidityWithdrawals: userWithdrawals.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          collateralSupplies: userCollaterals.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          borrows: userBorrows.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          crosschainBorrows: userCrosschainBorrows.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          repayments: userRepayments.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20)
        }
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch user data",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/users/:userAddress/summary - Get user summary stats
app.get("/api/users/:userAddress/summary", async (c) => {
  try {
    const userAddress = c.req.param("userAddress").toLowerCase();
    
    // Get all user activities
    const allSupplies = await db.select().from(liquiditySupplyTable);
    const userSupplies = allSupplies.filter((s: any) => s.user.toLowerCase() === userAddress);
    
    const allWithdrawals = await db.select().from(liquidityWithdrawTable);
    const userWithdrawals = allWithdrawals.filter((w: any) => w.user.toLowerCase() === userAddress);
    
    const allCollaterals = await db.select().from(collateralSupplyTable);
    const userCollaterals = allCollaterals.filter((c: any) => c.user.toLowerCase() === userAddress);
    
    const allBorrows = await db.select().from(borrowDebtTable);
    const userBorrows = allBorrows.filter((b: any) => b.user.toLowerCase() === userAddress);
    
    const allPositions = await db.select().from(positionTable);
    const userPositions = allPositions.filter((p: any) => p.user.toLowerCase() === userAddress);

    // Calculate totals
    const totalLiquiditySupplied = userSupplies.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalLiquidityWithdrawn = userWithdrawals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalCollateralSupplied = userCollaterals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalBorrowed = userBorrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    return c.json({
      success: true,
      data: {
        totalLiquiditySupplied,
        totalLiquidityWithdrawn,
        netLiquidity: totalLiquiditySupplied - totalLiquidityWithdrawn,
        totalCollateralSupplied,
        totalBorrowed,
        positionsCount: userPositions.length,
        transactions: {
          supplies: userSupplies.length,
          withdrawals: userWithdrawals.length,
          collaterals: userCollaterals.length,
          borrows: userBorrows.length
        }
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch user summary",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/activities - Get recent activities across all pools
app.get("/api/activities", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "20");
    const activityType = c.req.query("type"); // 'supply', 'withdraw', 'borrow', 'collateral'

    let activities = [];

    if (!activityType || activityType === "supply") {
      const supplies = await db.select().from(liquiditySupplyTable);
      activities.push(...supplies.map((item: any) => ({ ...item, type: 'liquidity_supply' })));
    }

    if (!activityType || activityType === "withdraw") {
      const withdrawals = await db.select().from(liquidityWithdrawTable);
      activities.push(...withdrawals.map((item: any) => ({ ...item, type: 'liquidity_withdraw' })));
    }

    if (!activityType || activityType === "borrow") {
      const borrows = await db.select().from(borrowDebtTable);
      activities.push(...borrows.map((item: any) => ({ ...item, type: 'borrow' })));
    }

    if (!activityType || activityType === "collateral") {
      const collaterals = await db.select().from(collateralSupplyTable);
      activities.push(...collaterals.map((item: any) => ({ ...item, type: 'collateral_supply' })));
    }

    // Sort by timestamp and limit results
    activities.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));
    activities = activities.slice(0, limit);

    return c.json({
      success: true,
      data: activities,
      count: activities.length,
      params: {
        limit,
        type: activityType || "all"
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch activities",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/positions - Get all positions with optional filtering
app.get("/api/positions", async (c) => {
  try {
    const userAddress = c.req.query("user");
    const poolAddress = c.req.query("pool");
    const limit = parseInt(c.req.query("limit") || "50");

    let positions = await db.select().from(positionTable);

    // Apply filters
    if (userAddress) {
      positions = positions.filter((p: any) => p.user.toLowerCase() === userAddress.toLowerCase());
    }

    if (poolAddress) {
      positions = positions.filter((p: any) => p.poolAddress === poolAddress);
    }

    // Sort by timestamp and limit
    positions.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));
    positions = positions.slice(0, limit);

    return c.json({
      success: true,
      data: positions,
      count: positions.length,
      params: {
        user: userAddress,
        pool: poolAddress,
        limit
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch positions",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/tokens - Get basic token senders and price data streams
app.get("/api/tokens", async (c) => {
  try {
    const basicTokenSenders = await db.select().from(basicTokenSenderTable);
    const priceDataStreams = await db.select().from(priceDataStreamTable);

    return c.json({
      success: true,
      data: {
        basicTokenSenders: basicTokenSenders.sort((a: any, b: any) => Number(b.blockNumber) - Number(a.blockNumber)),
        priceDataStreams: priceDataStreams.sort((a: any, b: any) => Number(b.blockNumber) - Number(a.blockNumber))
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch token data",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/stats - Get protocol-wide statistics
app.get("/api/stats", async (c) => {
  try {
    // Get all data to calculate stats
    const pools = await db.select().from(lendingPoolTable);
    const positions = await db.select().from(positionTable);
    const supplies = await db.select().from(liquiditySupplyTable);
    const withdrawals = await db.select().from(liquidityWithdrawTable);
    const borrows = await db.select().from(borrowDebtTable);

    // Calculate unique users
    const allUsers = new Set([
      ...positions.map((p: any) => p.user.toLowerCase()),
      ...supplies.map((s: any) => s.user.toLowerCase()),
      ...withdrawals.map((w: any) => w.user.toLowerCase()),
      ...borrows.map((b: any) => b.user.toLowerCase())
    ]);

    // Calculate totals
    const totalLiquiditySupplied = supplies.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalLiquidityWithdrawn = withdrawals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalBorrowed = borrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    return c.json({
      success: true,
      data: {
        totalPools: pools.length,
        totalPositions: positions.length,
        totalUsers: allUsers.size,
        totalTransactions: supplies.length + withdrawals.length + borrows.length,
        liquidity: {
          totalSupplied: totalLiquiditySupplied,
          totalWithdrawn: totalLiquidityWithdrawn,
          netLiquidity: totalLiquiditySupplied - totalLiquidityWithdrawn
        },
        totalBorrowed,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch stats",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /api/health - Health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    success: true,
    message: "Lending Pool API is healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

export default app;

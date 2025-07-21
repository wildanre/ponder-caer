import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";

const app = new Hono();

// Built-in endpoints
app.use("/sql/*", client({ db, schema }));
app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

// Custom REST API endpoints

// GET /api/pools - Get all lending pools
app.get("/api/pools", async (c) => {
  try {
    const pools = await db
      .select()
      .from(schema.lendingPool);
    
    return c.json({
      success: true,
      data: pools,
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
      .from(schema.lendingPool);
    
    const pool = pools.find(p => p.id === poolAddress);
    
    if (!pool) {
      return c.json({
        success: false,
        error: "Pool not found"
      }, 404);
    }

    return c.json({
      success: true,
      data: pool
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
      .from(schema.liquiditySupply);
    const poolSupplies = supplies.filter(s => s.poolAddress === poolAddress);

    // Get liquidity withdrawals for this pool
    const withdrawals = await db
      .select()
      .from(schema.liquidityWithdraw);
    const poolWithdrawals = withdrawals.filter(w => w.poolAddress === poolAddress);

    // Get collateral supplies for this pool
    const collaterals = await db
      .select()
      .from(schema.collateralSupply);
    const poolCollaterals = collaterals.filter(c => c.poolAddress === poolAddress);

    // Get borrows for this pool
    const borrows = await db
      .select()
      .from(schema.borrowDebt);
    const poolBorrows = borrows.filter(b => b.poolAddress === poolAddress);

    // Combine all activities with type labels
    const activities = [
      ...poolSupplies.map(item => ({ ...item, type: 'liquidity_supply' })),
      ...poolWithdrawals.map(item => ({ ...item, type: 'liquidity_withdraw' })),
      ...poolCollaterals.map(item => ({ ...item, type: 'collateral_supply' })),
      ...poolBorrows.map(item => ({ ...item, type: 'borrow' }))
    ];

    // Sort by timestamp (newest first)
    activities.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

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
      .from(schema.position);
    
    const poolPositions = allPositions.filter(p => p.poolAddress === poolAddress);

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
      .from(schema.position);
    const userPositions = allPositions.filter(p => p.user.toLowerCase() === userAddress);

    // Get user liquidity supplies
    const allSupplies = await db
      .select()
      .from(schema.liquiditySupply);
    const userSupplies = allSupplies.filter(s => s.user.toLowerCase() === userAddress);

    // Get user liquidity withdrawals
    const allWithdrawals = await db
      .select()
      .from(schema.liquidityWithdraw);
    const userWithdrawals = allWithdrawals.filter(w => w.user.toLowerCase() === userAddress);

    // Get user collateral supplies
    const allCollaterals = await db
      .select()
      .from(schema.collateralSupply);
    const userCollaterals = allCollaterals.filter(c => c.user.toLowerCase() === userAddress);

    // Get user borrows
    const allBorrows = await db
      .select()
      .from(schema.borrowDebt);
    const userBorrows = allBorrows.filter(b => b.user.toLowerCase() === userAddress);

    // Get user crosschain borrows
    const allCrosschainBorrows = await db
      .select()
      .from(schema.borrowDebtCrosschain);
    const userCrosschainBorrows = allCrosschainBorrows.filter(b => b.user.toLowerCase() === userAddress);

    // Get user repayments
    const allRepayments = await db
      .select()
      .from(schema.repayWithCollateral);
    const userRepayments = allRepayments.filter(r => r.user.toLowerCase() === userAddress);

    return c.json({
      success: true,
      data: {
        positions: userPositions,
        activities: {
          liquiditySupplies: userSupplies.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          liquidityWithdrawals: userWithdrawals.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          collateralSupplies: userCollaterals.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          borrows: userBorrows.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          crosschainBorrows: userCrosschainBorrows.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20),
          repayments: userRepayments.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 20)
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
    const allSupplies = await db.select().from(schema.liquiditySupply);
    const userSupplies = allSupplies.filter(s => s.user.toLowerCase() === userAddress);
    
    const allWithdrawals = await db.select().from(schema.liquidityWithdraw);
    const userWithdrawals = allWithdrawals.filter(w => w.user.toLowerCase() === userAddress);
    
    const allCollaterals = await db.select().from(schema.collateralSupply);
    const userCollaterals = allCollaterals.filter(c => c.user.toLowerCase() === userAddress);
    
    const allBorrows = await db.select().from(schema.borrowDebt);
    const userBorrows = allBorrows.filter(b => b.user.toLowerCase() === userAddress);
    
    const allPositions = await db.select().from(schema.position);
    const userPositions = allPositions.filter(p => p.user.toLowerCase() === userAddress);

    // Calculate totals
    const totalLiquiditySupplied = userSupplies.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalLiquidityWithdrawn = userWithdrawals.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalCollateralSupplied = userCollaterals.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalBorrowed = userBorrows.reduce((sum, item) => sum + Number(item.amount), 0);

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
      const supplies = await db.select().from(schema.liquiditySupply);
      activities.push(...supplies.map(item => ({ ...item, type: 'liquidity_supply' })));
    }

    if (!activityType || activityType === "withdraw") {
      const withdrawals = await db.select().from(schema.liquidityWithdraw);
      activities.push(...withdrawals.map(item => ({ ...item, type: 'liquidity_withdraw' })));
    }

    if (!activityType || activityType === "borrow") {
      const borrows = await db.select().from(schema.borrowDebt);
      activities.push(...borrows.map(item => ({ ...item, type: 'borrow' })));
    }

    if (!activityType || activityType === "collateral") {
      const collaterals = await db.select().from(schema.collateralSupply);
      activities.push(...collaterals.map(item => ({ ...item, type: 'collateral_supply' })));
    }

    // Sort by timestamp and limit results
    activities.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
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

    let positions = await db.select().from(schema.position);

    // Apply filters
    if (userAddress) {
      positions = positions.filter(p => p.user.toLowerCase() === userAddress.toLowerCase());
    }

    if (poolAddress) {
      positions = positions.filter(p => p.poolAddress === poolAddress);
    }

    // Sort by timestamp and limit
    positions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
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
    const basicTokenSenders = await db.select().from(schema.basicTokenSender);
    const priceDataStreams = await db.select().from(schema.priceDataStream);

    return c.json({
      success: true,
      data: {
        basicTokenSenders: basicTokenSenders.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber)),
        priceDataStreams: priceDataStreams.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
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
    const pools = await db.select().from(schema.lendingPool);
    const positions = await db.select().from(schema.position);
    const supplies = await db.select().from(schema.liquiditySupply);
    const withdrawals = await db.select().from(schema.liquidityWithdraw);
    const borrows = await db.select().from(schema.borrowDebt);

    // Calculate unique users
    const allUsers = new Set([
      ...positions.map(p => p.user.toLowerCase()),
      ...supplies.map(s => s.user.toLowerCase()),
      ...withdrawals.map(w => w.user.toLowerCase()),
      ...borrows.map(b => b.user.toLowerCase())
    ]);

    // Calculate totals
    const totalLiquiditySupplied = supplies.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalLiquidityWithdrawn = withdrawals.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalBorrowed = borrows.reduce((sum, item) => sum + Number(item.amount), 0);

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

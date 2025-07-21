import { Hono } from "hono";
import { db, lendingPoolTable, liquiditySupplyTable, liquidityWithdrawTable, collateralSupplyTable, borrowDebtTable, positionTable } from "../../db";
import { serializeBigInt } from '../index';

export const poolRoutes = new Hono();

// GET /pools - Get all lending pools
poolRoutes.get("/pools", async (c) => {
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

// GET /pools/:poolAddress - Get specific pool details
poolRoutes.get("/pools/:poolAddress", async (c) => {
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

// GET /pools/:poolAddress/activities - Get pool activities
poolRoutes.get("/pools/:poolAddress/activities", async (c) => {
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
      data: serializeBigInt({
        supplies: poolSupplies,
        withdrawals: poolWithdrawals,
        collaterals: poolCollaterals,
        borrows: poolBorrows,
        allActivities: activities.slice(0, 50) // Limit to 50 recent activities
      })
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pool activities",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /pools/:poolAddress/positions - Get pool positions
poolRoutes.get("/pools/:poolAddress/positions", async (c) => {
  try {
    const poolAddress = c.req.param("poolAddress");
    
    const allPositions = await db
      .select()
      .from(positionTable);
    
    const poolPositions = allPositions.filter((p: any) => p.poolAddress === poolAddress);

    return c.json({
      success: true,
      data: serializeBigInt(poolPositions)
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pool positions",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /pools/search - Search pools with advanced filters
poolRoutes.post("/pools/search", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      collateralToken, 
      borrowToken, 
      minLtv, 
      maxLtv,
      limit = 50,
      offset = 0 
    } = body;

    let pools = await db.select().from(lendingPoolTable);

    // Apply filters
    if (collateralToken) {
      pools = pools.filter((p: any) => p.collateralToken.toLowerCase() === collateralToken.toLowerCase());
    }
    
    if (borrowToken) {
      pools = pools.filter((p: any) => p.borrowToken.toLowerCase() === borrowToken.toLowerCase());
    }
    
    if (minLtv !== undefined) {
      pools = pools.filter((p: any) => Number(p.ltv) >= minLtv);
    }
    
    if (maxLtv !== undefined) {
      pools = pools.filter((p: any) => Number(p.ltv) <= maxLtv);
    }

    // Pagination
    const paginatedPools = pools.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: serializeBigInt(paginatedPools),
      count: paginatedPools.length,
      total: pools.length,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < pools.length
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to search pools",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /pools/analytics - Get pool analytics data
poolRoutes.post("/pools/analytics", async (c) => {
  try {
    const body = await c.req.json();
    const { poolAddresses, timeframe = '24h' } = body;

    if (!poolAddresses || !Array.isArray(poolAddresses)) {
      return c.json({
        success: false,
        error: "Pool addresses array is required"
      }, 400);
    }

    const analytics: any = {};

    for (const poolAddress of poolAddresses) {
      // Get all activities for this pool
      const supplies = await db.select().from(liquiditySupplyTable);
      const withdrawals = await db.select().from(liquidityWithdrawTable);
      const collaterals = await db.select().from(collateralSupplyTable);
      const borrows = await db.select().from(borrowDebtTable);

      const poolSupplies = supplies.filter((s: any) => s.poolAddress === poolAddress);
      const poolWithdrawals = withdrawals.filter((w: any) => w.poolAddress === poolAddress);
      const poolCollaterals = collaterals.filter((c: any) => c.poolAddress === poolAddress);
      const poolBorrows = borrows.filter((b: any) => b.poolAddress === poolAddress);

      // Calculate metrics
      const totalLiquidity = poolSupplies.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
      const totalWithdrawn = poolWithdrawals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
      const totalCollateral = poolCollaterals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
      const totalBorrowed = poolBorrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

      analytics[poolAddress] = {
        totalLiquidity,
        totalWithdrawn,
        netLiquidity: totalLiquidity - totalWithdrawn,
        totalCollateral,
        totalBorrowed,
        utilizationRate: totalLiquidity > 0 ? (totalBorrowed / totalLiquidity) * 100 : 0,
        transactionCounts: {
          supplies: poolSupplies.length,
          withdrawals: poolWithdrawals.length,
          collaterals: poolCollaterals.length,
          borrows: poolBorrows.length
        }
      };
    }

    return c.json({
      success: true,
      data: analytics,
      timeframe
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch pool analytics",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

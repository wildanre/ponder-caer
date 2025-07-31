import { Hono } from "hono";
import { db } from "../../db";
import { liquiditySupply, liquidityWithdraw, collateralSupply, borrowDebt, borrowDebtCrosschain, repayWithCollateral } from "../../../ponder.schema";
import { serializeBigInt } from '../index';

export const activityRoutes = new Hono();

// GET /activities - Get all activities (paginated)
activityRoutes.get("/activities", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");
    const type = c.req.query("type"); // Filter by activity type

    // Get all activities
    const supplies = await db.select().from(liquiditySupply);
    const withdrawals = await db.select().from(liquidityWithdraw);
    const collaterals = await db.select().from(collateralSupply);
    const borrows = await db.select().from(borrowDebt);
    const crosschainBorrows = await db.select().from(borrowDebtCrosschain);
    const repayments = await db.select().from(repayWithCollateral);

    // Combine all activities with type labels
    let allActivities = [
      ...supplies.map((item: any) => ({ ...item, type: 'liquidity_supply', category: 'lending' })),
      ...withdrawals.map((item: any) => ({ ...item, type: 'liquidity_withdraw', category: 'lending' })),
      ...collaterals.map((item: any) => ({ ...item, type: 'collateral_supply', category: 'lending' })),
      ...borrows.map((item: any) => ({ ...item, type: 'borrow', category: 'lending' })),
      ...crosschainBorrows.map((item: any) => ({ ...item, type: 'borrow_crosschain', category: 'lending' })),
      ...repayments.map((item: any) => ({ ...item, type: 'repay_with_collateral', category: 'lending' }))
    ];

    // Filter by type if specified
    if (type) {
      allActivities = allActivities.filter((activity: any) => activity.type === type);
    }

    // Sort by timestamp (newest first)
    allActivities.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));

    // Paginate
    const paginatedActivities = allActivities.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: serializeBigInt(paginatedActivities),
      count: paginatedActivities.length,
      total: allActivities.length,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < allActivities.length
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

// GET /activities/user/:userAddress - Get activities for specific user
activityRoutes.get("/activities/user/:userAddress", async (c) => {
  try {
    const userAddress = c.req.param("userAddress").toLowerCase();
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    // Get all activities for user
    const supplies = await db.select().from(liquiditySupply);
    const withdrawals = await db.select().from(liquidityWithdraw);
    const collaterals = await db.select().from(collateralSupply);
    const borrows = await db.select().from(borrowDebt);
    const crosschainBorrows = await db.select().from(borrowDebtCrosschain);
    const repayments = await db.select().from(repayWithCollateral);

    // Filter by user address and combine
    const userActivities = [
      ...supplies.filter((item: any) => item.user?.toLowerCase() === userAddress).map((item: any) => ({ ...item, type: 'liquidity_supply', category: 'lending' })),
      ...withdrawals.filter((item: any) => item.user?.toLowerCase() === userAddress).map((item: any) => ({ ...item, type: 'liquidity_withdraw', category: 'lending' })),
      ...collaterals.filter((item: any) => item.user?.toLowerCase() === userAddress).map((item: any) => ({ ...item, type: 'collateral_supply', category: 'lending' })),
      ...borrows.filter((item: any) => item.user?.toLowerCase() === userAddress).map((item: any) => ({ ...item, type: 'borrow', category: 'lending' })),
      ...crosschainBorrows.filter((item: any) => item.user?.toLowerCase() === userAddress).map((item: any) => ({ ...item, type: 'borrow_crosschain', category: 'lending' })),
      ...repayments.filter((item: any) => item.user?.toLowerCase() === userAddress).map((item: any) => ({ ...item, type: 'repay_with_collateral', category: 'lending' }))
    ];

    // Sort by timestamp (newest first)
    userActivities.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));

    // Paginate
    const paginatedActivities = userActivities.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: serializeBigInt(paginatedActivities),
      count: paginatedActivities.length,
      total: userActivities.length,
      userAddress,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < userActivities.length
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch user activities",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /activities/search - Advanced activity search
activityRoutes.post("/activities/search", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      types = [], 
      userAddress, 
      poolAddress,
      minAmount,
      maxAmount,
      fromTimestamp,
      toTimestamp,
      limit = 50,
      offset = 0 
    } = body;

    // Get all activities
    const supplies = await db.select().from(liquiditySupply);
    const withdrawals = await db.select().from(liquidityWithdraw);
    const collaterals = await db.select().from(collateralSupply);
    const borrows = await db.select().from(borrowDebt);
    const crosschainBorrows = await db.select().from(borrowDebtCrosschain);
    const repayments = await db.select().from(repayWithCollateral);

    // Combine all activities with type labels
    let allActivities = [
      ...supplies.map((item: any) => ({ ...item, type: 'liquidity_supply', category: 'lending' })),
      ...withdrawals.map((item: any) => ({ ...item, type: 'liquidity_withdraw', category: 'lending' })),
      ...collaterals.map((item: any) => ({ ...item, type: 'collateral_supply', category: 'lending' })),
      ...borrows.map((item: any) => ({ ...item, type: 'borrow', category: 'lending' })),
      ...crosschainBorrows.map((item: any) => ({ ...item, type: 'borrow_crosschain', category: 'lending' })),
      ...repayments.map((item: any) => ({ ...item, type: 'repay_with_collateral', category: 'lending' }))
    ];

    // Apply filters
    if (types.length > 0) {
      allActivities = allActivities.filter((activity: any) => types.includes(activity.type));
    }

    if (userAddress) {
      const userAddr = userAddress.toLowerCase();
      allActivities = allActivities.filter((activity: any) => 
        activity.user?.toLowerCase() === userAddr
      );
    }

    if (poolAddress) {
      allActivities = allActivities.filter((activity: any) => 
        activity.poolAddress?.toLowerCase() === poolAddress.toLowerCase()
      );
    }

    if (minAmount !== undefined) {
      allActivities = allActivities.filter((activity: any) => 
        Number(activity.amount || 0) >= minAmount
      );
    }

    if (maxAmount !== undefined) {
      allActivities = allActivities.filter((activity: any) => 
        Number(activity.amount || 0) <= maxAmount
      );
    }

    if (fromTimestamp !== undefined) {
      allActivities = allActivities.filter((activity: any) => 
        Number(activity.timestamp) >= fromTimestamp
      );
    }

    if (toTimestamp !== undefined) {
      allActivities = allActivities.filter((activity: any) => 
        Number(activity.timestamp) <= toTimestamp
      );
    }

    // Sort by timestamp (newest first)
    allActivities.sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));

    // Paginate
    const paginatedActivities = allActivities.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: serializeBigInt(paginatedActivities),
      count: paginatedActivities.length,
      total: allActivities.length,
      filters: {
        types,
        userAddress,
        poolAddress,
        minAmount,
        maxAmount,
        fromTimestamp,
        toTimestamp
      },
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < allActivities.length
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to search activities",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /activities/analytics - Get activity analytics
activityRoutes.post("/activities/analytics", async (c) => {
  try {
    const body = await c.req.json();
    const { timeframe = '24h', groupBy = 'hour' } = body;

    // Get all activities
    const supplies = await db.select().from(liquiditySupply);
    const withdrawals = await db.select().from(liquidityWithdraw);
    const collaterals = await db.select().from(collateralSupply);
    const borrows = await db.select().from(borrowDebt);
    const crosschainBorrows = await db.select().from(borrowDebtCrosschain);
    const repayments = await db.select().from(repayWithCollateral);

    // Calculate timeframe in seconds
    let timeframeSeconds = 24 * 3600; // default 24h
    if (timeframe === '1h') timeframeSeconds = 3600;
    else if (timeframe === '7d') timeframeSeconds = 7 * 24 * 3600;
    else if (timeframe === '30d') timeframeSeconds = 30 * 24 * 3600;

    const now = Math.floor(Date.now() / 1000);
    const startTime = now - timeframeSeconds;

    // Filter activities by timeframe
    const filteredSupplies = supplies.filter((item: any) => Number(item.timestamp) >= startTime);
    const filteredWithdrawals = withdrawals.filter((item: any) => Number(item.timestamp) >= startTime);
    const filteredCollaterals = collaterals.filter((item: any) => Number(item.timestamp) >= startTime);
    const filteredBorrows = borrows.filter((item: any) => Number(item.timestamp) >= startTime);
    const filteredCrosschainBorrows = crosschainBorrows.filter((item: any) => Number(item.timestamp) >= startTime);
    const filteredRepayments = repayments.filter((item: any) => Number(item.timestamp) >= startTime);

    // Calculate metrics
    const analytics = {
      summary: {
        totalActivities: filteredSupplies.length + filteredWithdrawals.length + filteredCollaterals.length + filteredBorrows.length + filteredCrosschainBorrows.length + filteredRepayments.length,
        liquiditySupplies: filteredSupplies.length,
        liquidityWithdrawals: filteredWithdrawals.length,
        collateralSupplies: filteredCollaterals.length,
        borrows: filteredBorrows.length,
        crosschainBorrows: filteredCrosschainBorrows.length,
        repayments: filteredRepayments.length
      },
      volumes: {
        totalLiquiditySupplied: filteredSupplies.reduce((sum: number, item: any) => sum + Number(item.amount), 0),
        totalLiquidityWithdrawn: filteredWithdrawals.reduce((sum: number, item: any) => sum + Number(item.amount), 0),
        totalCollateralSupplied: filteredCollaterals.reduce((sum: number, item: any) => sum + Number(item.amount), 0),
        totalBorrowed: filteredBorrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0),
        totalCrosschainBorrowed: filteredCrosschainBorrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0),
        totalRepaid: filteredRepayments.reduce((sum: number, item: any) => sum + Number(item.amount), 0)
      },
      timeframe,
      groupBy,
      timestamp: now
    };

    return c.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch activity analytics",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

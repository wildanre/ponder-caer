import { Hono } from "hono";
import { db, liquiditySupplyTable, liquidityWithdrawTable, collateralSupplyTable, borrowDebtTable, borrowDebtCrosschainTable, repayWithCollateralTable, positionTable } from "../../db";
import { serializeBigInt } from '../index';

export const userRoutes = new Hono();

// GET /users/:userAddress - Get user profile and summary
userRoutes.get("/users/:userAddress", async (c) => {
  try {
    const userAddress = c.req.param("userAddress").toLowerCase();

    // Get user activities
    const supplies = await db.select().from(liquiditySupplyTable);
    const withdrawals = await db.select().from(liquidityWithdrawTable);
    const collaterals = await db.select().from(collateralSupplyTable);
    const borrows = await db.select().from(borrowDebtTable);
    const crosschainBorrows = await db.select().from(borrowDebtCrosschainTable);
    const repayments = await db.select().from(repayWithCollateralTable);
    const positions = await db.select().from(positionTable);

    // Filter by user address
    const userSupplies = supplies.filter((item: any) => item.user?.toLowerCase() === userAddress);
    const userWithdrawals = withdrawals.filter((item: any) => item.user?.toLowerCase() === userAddress);
    const userCollaterals = collaterals.filter((item: any) => item.user?.toLowerCase() === userAddress);
    const userBorrows = borrows.filter((item: any) => item.user?.toLowerCase() === userAddress);
    const userCrosschainBorrows = crosschainBorrows.filter((item: any) => item.user?.toLowerCase() === userAddress);
    const userRepayments = repayments.filter((item: any) => item.user?.toLowerCase() === userAddress);
    const userPositions = positions.filter((item: any) => item.user?.toLowerCase() === userAddress);

    // Calculate user metrics
    const totalLiquiditySupplied = userSupplies.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalLiquidityWithdrawn = userWithdrawals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalCollateralSupplied = userCollaterals.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalBorrowed = userBorrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalCrosschainBorrowed = userCrosschainBorrows.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalRepaid = userRepayments.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    const userProfile = {
      address: userAddress,
      summary: {
        totalPositions: userPositions.length,
        totalTransactions: userSupplies.length + userWithdrawals.length + userCollaterals.length + userBorrows.length + userCrosschainBorrows.length + userRepayments.length,
        netLiquidityProvided: totalLiquiditySupplied - totalLiquidityWithdrawn,
        totalCollateralSupplied,
        totalBorrowed: totalBorrowed + totalCrosschainBorrowed,
        totalRepaid
      },
      activities: {
        liquiditySupplies: userSupplies.length,
        liquidityWithdrawals: userWithdrawals.length,
        collateralSupplies: userCollaterals.length,
        borrows: userBorrows.length,
        crosschainBorrows: userCrosschainBorrows.length,
        repayments: userRepayments.length
      },
      volumes: {
        totalLiquiditySupplied,
        totalLiquidityWithdrawn,
        totalCollateralSupplied,
        totalBorrowed,
        totalCrosschainBorrowed,
        totalRepaid
      }
    };

    return c.json({
      success: true,
      data: serializeBigInt(userProfile)
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch user profile",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /users/:userAddress/positions - Get user positions
userRoutes.get("/users/:userAddress/positions", async (c) => {
  try {
    const userAddress = c.req.param("userAddress").toLowerCase();
    
    const allPositions = await db.select().from(positionTable);
    const userPositions = allPositions.filter((p: any) => p.user?.toLowerCase() === userAddress);

    return c.json({
      success: true,
      data: serializeBigInt(userPositions),
      count: userPositions.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch user positions",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /users/leaderboard - Get user leaderboard
userRoutes.post("/users/leaderboard", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      sortBy = 'totalVolume', 
      timeframe = '30d',
      limit = 100 
    } = body;

    // Get all user activities
    const supplies = await db.select().from(liquiditySupplyTable);
    const withdrawals = await db.select().from(liquidityWithdrawTable);
    const collaterals = await db.select().from(collateralSupplyTable);
    const borrows = await db.select().from(borrowDebtTable);
    const crosschainBorrows = await db.select().from(borrowDebtCrosschainTable);
    const repayments = await db.select().from(repayWithCollateralTable);
    const positions = await db.select().from(positionTable);

    // Calculate timeframe filter
    let timeframeSeconds = 30 * 24 * 3600; // default 30d
    if (timeframe === '7d') timeframeSeconds = 7 * 24 * 3600;
    else if (timeframe === '24h') timeframeSeconds = 24 * 3600;
    else if (timeframe === '1h') timeframeSeconds = 3600;

    const now = Math.floor(Date.now() / 1000);
    const startTime = now - timeframeSeconds;

    // Group activities by user
    const userStats: { [key: string]: any } = {};

    // Process supplies
    supplies.filter((item: any) => timeframe === 'all' || Number(item.timestamp) >= startTime)
      .forEach((item: any) => {
        const user = item.user?.toLowerCase();
        if (!user) return;
        
        if (!userStats[user]) {
          userStats[user] = {
            address: user,
            totalVolume: 0,
            liquiditySupplied: 0,
            liquidityWithdrawn: 0,
            collateralSupplied: 0,
            borrowed: 0,
            repaid: 0,
            transactionCount: 0,
            positions: 0
          };
        }
        
        const amount = Number(item.amount);
        userStats[user].liquiditySupplied += amount;
        userStats[user].totalVolume += amount;
        userStats[user].transactionCount += 1;
      });

    // Process withdrawals
    withdrawals.filter((item: any) => timeframe === 'all' || Number(item.timestamp) >= startTime)
      .forEach((item: any) => {
        const user = item.user?.toLowerCase();
        if (!user) return;
        
        if (!userStats[user]) {
          userStats[user] = {
            address: user,
            totalVolume: 0,
            liquiditySupplied: 0,
            liquidityWithdrawn: 0,
            collateralSupplied: 0,
            borrowed: 0,
            repaid: 0,
            transactionCount: 0,
            positions: 0
          };
        }
        
        const amount = Number(item.amount);
        userStats[user].liquidityWithdrawn += amount;
        userStats[user].totalVolume += amount;
        userStats[user].transactionCount += 1;
      });

    // Process collaterals, borrows, repayments similarly...
    collaterals.filter((item: any) => timeframe === 'all' || Number(item.timestamp) >= startTime)
      .forEach((item: any) => {
        const user = item.user?.toLowerCase();
        if (!user) return;
        
        if (!userStats[user]) {
          userStats[user] = {
            address: user,
            totalVolume: 0,
            liquiditySupplied: 0,
            liquidityWithdrawn: 0,
            collateralSupplied: 0,
            borrowed: 0,
            repaid: 0,
            transactionCount: 0,
            positions: 0
          };
        }
        
        const amount = Number(item.amount);
        userStats[user].collateralSupplied += amount;
        userStats[user].totalVolume += amount;
        userStats[user].transactionCount += 1;
      });

    // Count positions per user
    positions.forEach((position: any) => {
      const user = position.user?.toLowerCase();
      if (!user) return;
      
      if (!userStats[user]) {
        userStats[user] = {
          address: user,
          totalVolume: 0,
          liquiditySupplied: 0,
          liquidityWithdrawn: 0,
          collateralSupplied: 0,
          borrowed: 0,
          repaid: 0,
          transactionCount: 0,
          positions: 0
        };
      }
      
      userStats[user].positions += 1;
    });

    // Convert to array and sort
    let leaderboard = Object.values(userStats);

    // Sort based on criteria
    if (sortBy === 'totalVolume') {
      leaderboard.sort((a: any, b: any) => b.totalVolume - a.totalVolume);
    } else if (sortBy === 'transactionCount') {
      leaderboard.sort((a: any, b: any) => b.transactionCount - a.transactionCount);
    } else if (sortBy === 'positions') {
      leaderboard.sort((a: any, b: any) => b.positions - a.positions);
    } else if (sortBy === 'liquiditySupplied') {
      leaderboard.sort((a: any, b: any) => b.liquiditySupplied - a.liquiditySupplied);
    }

    // Limit results
    leaderboard = leaderboard.slice(0, limit);

    // Add rankings
    leaderboard = leaderboard.map((user: any, index: number) => ({
      ...user,
      rank: index + 1
    }));

    return c.json({
      success: true,
      data: serializeBigInt(leaderboard),
      count: leaderboard.length,
      sortBy,
      timeframe
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch user leaderboard",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /users/search - Search users with filters
userRoutes.post("/users/search", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      addressPrefix,
      minTransactions = 0,
      minPositions = 0,
      hasActivePositions,
      limit = 50,
      offset = 0
    } = body;

    // Get all activities to build user profiles
    const supplies = await db.select().from(liquiditySupplyTable);
    const withdrawals = await db.select().from(liquidityWithdrawTable);
    const collaterals = await db.select().from(collateralSupplyTable);
    const borrows = await db.select().from(borrowDebtTable);
    const positions = await db.select().from(positionTable);

    // Group by user
    const userProfiles: { [key: string]: any } = {};
    
    [...supplies, ...withdrawals, ...collaterals, ...borrows].forEach((item: any) => {
      const user = item.user?.toLowerCase();
      if (!user) return;
      
      if (!userProfiles[user]) {
        userProfiles[user] = {
          address: user,
          transactionCount: 0,
          positions: 0,
          hasActivePositions: false
        };
      }
      userProfiles[user].transactionCount += 1;
    });

    // Add position data
    positions.forEach((position: any) => {
      const user = position.user?.toLowerCase();
      if (!user) return;
      
      if (!userProfiles[user]) {
        userProfiles[user] = {
          address: user,
          transactionCount: 0,
          positions: 0,
          hasActivePositions: false
        };
      }
      userProfiles[user].positions += 1;
      userProfiles[user].hasActivePositions = true;
    });

    // Convert to array and apply filters
    let users = Object.values(userProfiles);

    if (addressPrefix) {
      users = users.filter((user: any) => 
        user.address.startsWith(addressPrefix.toLowerCase())
      );
    }

    if (minTransactions > 0) {
      users = users.filter((user: any) => user.transactionCount >= minTransactions);
    }

    if (minPositions > 0) {
      users = users.filter((user: any) => user.positions >= minPositions);
    }

    if (hasActivePositions !== undefined) {
      users = users.filter((user: any) => user.hasActivePositions === hasActivePositions);
    }

    // Sort by transaction count desc
    users.sort((a: any, b: any) => b.transactionCount - a.transactionCount);

    // Paginate
    const paginatedUsers = users.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: serializeBigInt(paginatedUsers),
      count: paginatedUsers.length,
      total: users.length,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < users.length
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to search users",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

import { Hono } from "hono";
import { db } from "../../db";
import { position as positionTable, collateralSupply, borrowDebt, liquiditySupply } from "../../../ponder.schema";
import { serializeBigInt } from '../index';

export const positionRoutes = new Hono();

// GET /positions - Get all positions
positionRoutes.get("/positions", async (c) => {
  try {
    const positions = await db
      .select()
      .from(positionTable);
    return c.json({
      success: true,
      data: serializeBigInt(positions),
      count: positions.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch positions",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /positions/user/:userAddress - Get positions for a specific user
positionRoutes.get("/positions/user/:userAddress", async (c) => {
  try {
    const userAddress = c.req.param("userAddress");
    
    const allPositions = await db
      .select()
      .from(positionTable);
    
    const userPositions = allPositions.filter((p: any) => 
      p.borrower.toLowerCase() === userAddress.toLowerCase()
    );

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

// GET /positions/:positionId - Get specific position details
positionRoutes.get("/positions/:positionId", async (c) => {
  try {
    const positionId = c.req.param("positionId");
    
    const allPositions = await db
      .select()
      .from(positionTable);
    
    const position = allPositions.find((p: any) => p.id === positionId);
    
    if (!position) {
      return c.json({
        success: false,
        error: "Position not found"
      }, 404);
    }

    return c.json({
      success: true,
      data: serializeBigInt(position)
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch position",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /positions/:positionId/history - Get position transaction history
positionRoutes.get("/positions/:positionId/history", async (c) => {
  try {
    const positionId = c.req.param("positionId");
    
    // Get all related transactions
    const collaterals = await db.select().from(collateralSupply);
    const borrows = await db.select().from(borrowDebt);
    
    const positionCollaterals = collaterals.filter((c: any) => 
      c.id.includes(positionId) || c.borrower === positionId
    );
    
    const positionBorrows = borrows.filter((b: any) => 
      b.id.includes(positionId) || b.borrower === positionId
    );

    // Combine and sort by timestamp
    const history = [
      ...positionCollaterals.map((item: any) => ({ ...item, type: 'collateral_supply' })),
      ...positionBorrows.map((item: any) => ({ ...item, type: 'borrow' }))
    ].sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp));

    return c.json({
      success: true,
      data: serializeBigInt(history)
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch position history",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /positions/health-check - Check position health scores
positionRoutes.post("/positions/health-check", async (c) => {
  try {
    const body = await c.req.json();
    const { positionIds } = body;

    if (!positionIds || !Array.isArray(positionIds)) {
      return c.json({
        success: false,
        error: "Position IDs array is required"
      }, 400);
    }

    const healthScores: any = {};
    const allPositions = await db.select().from(positionTable);

    for (const positionId of positionIds) {
      const position = allPositions.find((p: any) => p.id === positionId);
      
      if (position) {
        // Calculate health score based on collateral vs debt
        const collateralValue = Number(position.collateralAmount || 0);
        const debtValue = Number(position.debtAmount || 0);
        const ltv = Number(position.ltv || 0);
        
        let healthScore = 0;
        if (debtValue > 0 && collateralValue > 0) {
          const currentLtv = (debtValue / collateralValue) * 100;
          healthScore = Math.max(0, ((ltv - currentLtv) / ltv) * 100);
        } else if (debtValue === 0) {
          healthScore = 100; // No debt = healthy
        }

        healthScores[positionId] = {
          healthScore: Math.round(healthScore * 100) / 100,
          status: healthScore > 50 ? 'healthy' : healthScore > 20 ? 'warning' : 'liquidation_risk',
          collateralValue,
          debtValue,
          ltv,
          currentLtv: debtValue > 0 && collateralValue > 0 ? (debtValue / collateralValue) * 100 : 0
        };
      } else {
        healthScores[positionId] = {
          error: 'Position not found'
        };
      }
    }

    return c.json({
      success: true,
      data: healthScores
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to check position health",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /positions/search - Search positions with filters
positionRoutes.post("/positions/search", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      borrower, 
      poolAddress, 
      status,
      minCollateral,
      maxDebt,
      limit = 50,
      offset = 0 
    } = body;

    let positions = await db.select().from(positionTable);

    // Apply filters
    if (borrower) {
      positions = positions.filter((p: any) => 
        p.borrower.toLowerCase() === borrower.toLowerCase()
      );
    }
    
    if (poolAddress) {
      positions = positions.filter((p: any) => 
        p.poolAddress.toLowerCase() === poolAddress.toLowerCase()
      );
    }
    
    if (minCollateral !== undefined) {
      positions = positions.filter((p: any) => 
        Number(p.collateralAmount) >= minCollateral
      );
    }
    
    if (maxDebt !== undefined) {
      positions = positions.filter((p: any) => 
        Number(p.debtAmount) <= maxDebt
      );
    }

    // Pagination
    const paginatedPositions = positions.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: serializeBigInt(paginatedPositions),
      count: paginatedPositions.length,
      total: positions.length,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < positions.length
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to search positions",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// GET /liquidity-supplies - Get all liquidity supplies
positionRoutes.get("/liquidity-supplies", async (c) => {
  try {
    const supplies = await db.select().from(liquiditySupply);
    return c.json({
      success: true,
      data: serializeBigInt(supplies),
      count: supplies.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to fetch liquidity supplies",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// POST /positions/liquidation-candidates - Find positions at risk of liquidation
positionRoutes.post("/positions/liquidation-candidates", async (c) => {
  try {
    const body = await c.req.json();
    const { healthThreshold = 20, limit = 100 } = body;

    const positions = await db.select().from(positionTable);
    
    const candidates = positions
      .filter((position: any) => {
        const collateralValue = Number(position.collateralAmount || 0);
        const debtValue = Number(position.debtAmount || 0);
        const ltv = Number(position.ltv || 0);
        
        if (debtValue === 0 || collateralValue === 0) return false;
        
        const currentLtv = (debtValue / collateralValue) * 100;
        const healthScore = ((ltv - currentLtv) / ltv) * 100;
        
        return healthScore <= healthThreshold;
      })
      .slice(0, limit)
      .map((position: any) => {
        const collateralValue = Number(position.collateralAmount || 0);
        const debtValue = Number(position.debtAmount || 0);
        const ltv = Number(position.ltv || 0);
        const currentLtv = (debtValue / collateralValue) * 100;
        const healthScore = ((ltv - currentLtv) / ltv) * 100;
        
        return {
          ...position,
          healthScore: Math.round(healthScore * 100) / 100,
          currentLtv: Math.round(currentLtv * 100) / 100,
          liquidationRisk: healthScore <= 5 ? 'critical' : healthScore <= 20 ? 'high' : 'medium'
        };
      });

    return c.json({
      success: true,
      data: serializeBigInt(candidates),
      count: candidates.length,
      threshold: healthThreshold
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Failed to find liquidation candidates",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

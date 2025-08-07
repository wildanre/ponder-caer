import { createSchema } from 'graphql-yoga';
import { 
  db, 
  lendingPoolTable, 
  basicTokenSenderTable, 
  priceDataStreamTable, 
  positionTable, 
  liquiditySupplyTable, 
  liquidityWithdrawTable, 
  collateralSupplyTable, 
  borrowDebtTable, 
  borrowDebtCrosschainTable, 
  repayWithCollateralTable 
} from '../db';
import { eq, desc, sql } from 'drizzle-orm';

// Helper function to serialize BigInt
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

const typeDefs = `
  type Query {
    # Health check
    health: Health!
    
    # Pools
    pools: [LendingPool!]!
    pool(address: String!): LendingPool
    poolStats(address: String!): PoolStats
    
    # Positions
    positions: [Position!]!
    position(address: String!): Position
    userPositions(userAddress: String!): [Position!]!
    
    # Activities
    liquiditySupplies(poolAddress: String, userAddress: String, limit: Int = 100): [LiquiditySupply!]!
    liquidityWithdrawals(poolAddress: String, userAddress: String, limit: Int = 100): [LiquidityWithdrawal!]!
    collateralSupplies(poolAddress: String, userAddress: String, limit: Int = 100): [CollateralSupply!]!
    borrowDebts(poolAddress: String, userAddress: String, limit: Int = 100): [BorrowDebt!]!
    borrowDebtsCrosschain(poolAddress: String, userAddress: String, limit: Int = 100): [BorrowDebtCrosschain!]!
    repayWithCollaterals(poolAddress: String, userAddress: String, limit: Int = 100): [RepayWithCollateral!]!
    
    # Users
    userStats(userAddress: String!): UserStats
    users: [User!]!
    
    # Global stats
    globalStats: GlobalStats!
    
    # Token data streams
    priceDataStreams: [PriceDataStream!]!
    tokenDataStream(token: String!): PriceDataStream
    
    # Basic token senders
    basicTokenSenders: [BasicTokenSender!]!
  }

  type Health {
    success: Boolean!
    message: String!
    timestamp: String!
    version: String!
  }

  type LendingPool {
    id: String!
    collateralToken: String!
    borrowToken: String!
    ltv: String!
    createdAt: String!
    blockNumber: String!
    transactionHash: String!
    
    # Related data
    liquiditySupplies: [LiquiditySupply!]!
    liquidityWithdrawals: [LiquidityWithdrawal!]!
    collateralSupplies: [CollateralSupply!]!
    borrowDebts: [BorrowDebt!]!
    borrowDebtsCrosschain: [BorrowDebtCrosschain!]!
    repayWithCollaterals: [RepayWithCollateral!]!
    positions: [Position!]!
  }

  type Position {
    id: String!
    user: String!
    positionAddress: String!
    poolAddress: String!
    blockNumber: String!
    transactionHash: String!
    timestamp: String!
    
    # Related pool
    pool: LendingPool
  }

  type LiquiditySupply {
    id: String!
    user: String!
    poolAddress: String!
    amount: String!
    shares: String!
    blockNumber: String!
    transactionHash: String!
    timestamp: String!
    
    # Related pool
    pool: LendingPool
  }

  type LiquidityWithdrawal {
    id: String!
    user: String!
    poolAddress: String!
    amount: String!
    shares: String!
    blockNumber: String!
    transactionHash: String!
    timestamp: String!
    
    # Related pool
    pool: LendingPool
  }

  type CollateralSupply {
    id: String!
    user: String!
    poolAddress: String!
    amount: String!
    blockNumber: String!
    transactionHash: String!
    timestamp: String!
    
    # Related pool
    pool: LendingPool
  }

  type BorrowDebt {
    id: String!
    user: String!
    poolAddress: String!
    amount: String!
    blockNumber: String!
    transactionHash: String!
    timestamp: String!
    
    # Related pool
    pool: LendingPool
  }

  type BorrowDebtCrosschain {
    id: String!
    user: String!
    poolAddress: String!
    amount: String!
    shares: String!
    chainId: String!
    bridgeTokenSender: String!
    blockNumber: String!
    transactionHash: String!
    timestamp: String!
    
    # Related pool
    pool: LendingPool
  }

  type RepayWithCollateral {
    id: String!
    user: String!
    poolAddress: String!
    amount: String!
    shares: String!
    blockNumber: String!
    transactionHash: String!
    timestamp: String!
    
    # Related pool
    pool: LendingPool
  }

  type PriceDataStream {
    id: String!
    token: String!
    dataStream: String!
    blockNumber: String!
    transactionHash: String!
  }

  type BasicTokenSender {
    id: String!
    chainId: String!
    basicTokenSender: String!
    blockNumber: String!
    transactionHash: String!
  }

  type PoolStats {
    poolAddress: String!
    totalLiquidity: String!
    totalCollateral: String!
    totalBorrowed: String!
    totalPositions: Int!
    totalTransactions: Int!
  }

  type UserStats {
    userAddress: String!
    totalPositions: Int!
    totalLiquiditySupplied: String!
    totalCollateralSupplied: String!
    totalBorrowed: String!
    activePositions: Int!
  }

  type User {
    address: String!
    totalPositions: Int!
    totalTransactions: Int!
    firstInteraction: String!
    lastInteraction: String!
  }

  type GlobalStats {
    totalPools: Int!
    totalPositions: Int!
    totalUsers: Int!
    totalTransactions: Int!
    totalLiquidity: String!
    totalCollateral: String!
    totalBorrowed: String!
  }
`;

const resolvers = {
  Query: {
    health: () => ({
      success: true,
      message: 'Lending Pool GraphQL API is healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    }),

    pools: async () => {
      const pools = await db.select().from(lendingPoolTable);
      return serializeBigInt(pools);
    },

    pool: async (_: any, { address }: { address: string }) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === address);
      return pool ? serializeBigInt(pool) : null;
    },

    positions: async () => {
      const positions = await db.select().from(positionTable);
      return serializeBigInt(positions);
    },

    position: async (_: any, { address }: { address: string }) => {
      const positions = await db.select().from(positionTable);
      const position = positions.find((p: any) => p.id === address);
      return position ? serializeBigInt(position) : null;
    },

    userPositions: async (_: any, { userAddress }: { userAddress: string }) => {
      const positions = await db.select().from(positionTable);
      const userPositions = positions.filter((p: any) => p.user === userAddress);
      return serializeBigInt(userPositions);
    },

    liquiditySupplies: async (_: any, { poolAddress, userAddress, limit }: { poolAddress?: string, userAddress?: string, limit: number }) => {
      let query = db.select().from(liquiditySupplyTable);
      
      if (poolAddress || userAddress) {
        // Note: Drizzle filtering would be applied here based on the actual schema
        const supplies = await query;
        let filtered = supplies;
        
        if (poolAddress) {
          filtered = filtered.filter((s: any) => s.poolAddress === poolAddress);
        }
        if (userAddress) {
          filtered = filtered.filter((s: any) => s.user === userAddress);
        }
        
        return serializeBigInt(filtered.slice(0, limit));
      }
      
      const supplies = await query;
      return serializeBigInt(supplies.slice(0, limit));
    },

    liquidityWithdrawals: async (_: any, { poolAddress, userAddress, limit }: { poolAddress?: string, userAddress?: string, limit: number }) => {
      let query = db.select().from(liquidityWithdrawTable);
      
      if (poolAddress || userAddress) {
        const withdrawals = await query;
        let filtered = withdrawals;
        
        if (poolAddress) {
          filtered = filtered.filter((w: any) => w.poolAddress === poolAddress);
        }
        if (userAddress) {
          filtered = filtered.filter((w: any) => w.user === userAddress);
        }
        
        return serializeBigInt(filtered.slice(0, limit));
      }
      
      const withdrawals = await query;
      return serializeBigInt(withdrawals.slice(0, limit));
    },

    collateralSupplies: async (_: any, { poolAddress, userAddress, limit }: { poolAddress?: string, userAddress?: string, limit: number }) => {
      let query = db.select().from(collateralSupplyTable);
      
      if (poolAddress || userAddress) {
        const supplies = await query;
        let filtered = supplies;
        
        if (poolAddress) {
          filtered = filtered.filter((s: any) => s.poolAddress === poolAddress);
        }
        if (userAddress) {
          filtered = filtered.filter((s: any) => s.user === userAddress);
        }
        
        return serializeBigInt(filtered.slice(0, limit));
      }
      
      const supplies = await query;
      return serializeBigInt(supplies.slice(0, limit));
    },

    borrowDebts: async (_: any, { poolAddress, userAddress, limit }: { poolAddress?: string, userAddress?: string, limit: number }) => {
      let query = db.select().from(borrowDebtTable);
      
      if (poolAddress || userAddress) {
        const debts = await query;
        let filtered = debts;
        
        if (poolAddress) {
          filtered = filtered.filter((d: any) => d.poolAddress === poolAddress);
        }
        if (userAddress) {
          filtered = filtered.filter((d: any) => d.user === userAddress);
        }
        
        return serializeBigInt(filtered.slice(0, limit));
      }
      
      const debts = await query;
      return serializeBigInt(debts.slice(0, limit));
    },

    borrowDebtsCrosschain: async (_: any, { poolAddress, userAddress, limit }: { poolAddress?: string, userAddress?: string, limit: number }) => {
      let query = db.select().from(borrowDebtCrosschainTable);
      
      if (poolAddress || userAddress) {
        const debts = await query;
        let filtered = debts;
        
        if (poolAddress) {
          filtered = filtered.filter((d: any) => d.poolAddress === poolAddress);
        }
        if (userAddress) {
          filtered = filtered.filter((d: any) => d.user === userAddress);
        }
        
        return serializeBigInt(filtered.slice(0, limit));
      }
      
      const debts = await query;
      return serializeBigInt(debts.slice(0, limit));
    },

    repayWithCollaterals: async (_: any, { poolAddress, userAddress, limit }: { poolAddress?: string, userAddress?: string, limit: number }) => {
      let query = db.select().from(repayWithCollateralTable);
      
      if (poolAddress || userAddress) {
        const repays = await query;
        let filtered = repays;
        
        if (poolAddress) {
          filtered = filtered.filter((r: any) => r.poolAddress === poolAddress);
        }
        if (userAddress) {
          filtered = filtered.filter((r: any) => r.user === userAddress);
        }
        
        return serializeBigInt(filtered.slice(0, limit));
      }
      
      const repays = await query;
      return serializeBigInt(repays.slice(0, limit));
    },

    priceDataStreams: async () => {
      const streams = await db.select().from(priceDataStreamTable);
      return serializeBigInt(streams);
    },

    tokenDataStream: async (_: any, { token }: { token: string }) => {
      const streams = await db.select().from(priceDataStreamTable);
      const stream = streams.find((s: any) => s.token === token);
      return stream ? serializeBigInt(stream) : null;
    },

    basicTokenSenders: async () => {
      const senders = await db.select().from(basicTokenSenderTable);
      return serializeBigInt(senders);
    },

    // Stats resolvers
    poolStats: async (_: any, { address }: { address: string }) => {
      // Calculate pool statistics
      const liquiditySupplies = await db.select().from(liquiditySupplyTable);
      const collateralSupplies = await db.select().from(collateralSupplyTable);
      const borrowDebts = await db.select().from(borrowDebtTable);
      const positions = await db.select().from(positionTable);

      const poolLiquiditySupplies = liquiditySupplies.filter((s: any) => s.poolAddress === address);
      const poolCollateralSupplies = collateralSupplies.filter((s: any) => s.poolAddress === address);
      const poolBorrowDebts = borrowDebts.filter((d: any) => d.poolAddress === address);
      const poolPositions = positions.filter((p: any) => p.poolAddress === address);

      const totalLiquidity = poolLiquiditySupplies.reduce((sum: bigint, s: any) => sum + BigInt(s.amount || 0), BigInt(0));
      const totalCollateral = poolCollateralSupplies.reduce((sum: bigint, s: any) => sum + BigInt(s.amount || 0), BigInt(0));
      const totalBorrowed = poolBorrowDebts.reduce((sum: bigint, d: any) => sum + BigInt(d.amount || 0), BigInt(0));

      return {
        poolAddress: address,
        totalLiquidity: totalLiquidity.toString(),
        totalCollateral: totalCollateral.toString(),
        totalBorrowed: totalBorrowed.toString(),
        totalPositions: poolPositions.length,
        totalTransactions: poolLiquiditySupplies.length + poolCollateralSupplies.length + poolBorrowDebts.length
      };
    },

    userStats: async (_: any, { userAddress }: { userAddress: string }) => {
      // Calculate user statistics
      const positions = await db.select().from(positionTable);
      const liquiditySupplies = await db.select().from(liquiditySupplyTable);
      const collateralSupplies = await db.select().from(collateralSupplyTable);
      const borrowDebts = await db.select().from(borrowDebtTable);

      const userPositions = positions.filter((p: any) => p.user === userAddress);
      const userLiquiditySupplies = liquiditySupplies.filter((s: any) => s.user === userAddress);
      const userCollateralSupplies = collateralSupplies.filter((s: any) => s.user === userAddress);
      const userBorrowDebts = borrowDebts.filter((d: any) => d.user === userAddress);

      const totalLiquiditySupplied = userLiquiditySupplies.reduce((sum: bigint, s: any) => sum + BigInt(s.amount || 0), BigInt(0));
      const totalCollateralSupplied = userCollateralSupplies.reduce((sum: bigint, s: any) => sum + BigInt(s.amount || 0), BigInt(0));
      const totalBorrowed = userBorrowDebts.reduce((sum: bigint, d: any) => sum + BigInt(d.amount || 0), BigInt(0));

      return {
        userAddress,
        totalPositions: userPositions.length,
        totalLiquiditySupplied: totalLiquiditySupplied.toString(),
        totalCollateralSupplied: totalCollateralSupplied.toString(),
        totalBorrowed: totalBorrowed.toString(),
        activePositions: userPositions.length // Simplified - in real app, check if position is still active
      };
    },

    users: async () => {
      // Get unique users from various tables
      const positions = await db.select().from(positionTable);
      const liquiditySupplies = await db.select().from(liquiditySupplyTable);
      const collateralSupplies = await db.select().from(collateralSupplyTable);
      const borrowDebts = await db.select().from(borrowDebtTable);

      const allUsers = new Set([
        ...positions.map((p: any) => p.user),
        ...liquiditySupplies.map((s: any) => s.user),
        ...collateralSupplies.map((s: any) => s.user),
        ...borrowDebts.map((d: any) => d.user)
      ]);

      return Array.from(allUsers).map(userAddress => {
        const userPositions = positions.filter((p: any) => p.user === userAddress);
        const userTransactions = [
          ...liquiditySupplies.filter((s: any) => s.user === userAddress),
          ...collateralSupplies.filter((s: any) => s.user === userAddress),
          ...borrowDebts.filter((d: any) => d.user === userAddress)
        ];

        const timestamps = userTransactions.map((t: any) => parseInt(t.timestamp || '0'));
        const firstInteraction = timestamps.length > 0 ? Math.min(...timestamps) : 0;
        const lastInteraction = timestamps.length > 0 ? Math.max(...timestamps) : 0;

        return {
          address: userAddress,
          totalPositions: userPositions.length,
          totalTransactions: userTransactions.length,
          firstInteraction: new Date(firstInteraction * 1000).toISOString(),
          lastInteraction: new Date(lastInteraction * 1000).toISOString()
        };
      });
    },

    globalStats: async () => {
      const pools = await db.select().from(lendingPoolTable);
      const positions = await db.select().from(positionTable);
      const liquiditySupplies = await db.select().from(liquiditySupplyTable);
      const collateralSupplies = await db.select().from(collateralSupplyTable);
      const borrowDebts = await db.select().from(borrowDebtTable);

      const allUsers = new Set([
        ...positions.map((p: any) => p.user),
        ...liquiditySupplies.map((s: any) => s.user),
        ...collateralSupplies.map((s: any) => s.user),
        ...borrowDebts.map((d: any) => d.user)
      ]);

      const totalLiquidity = liquiditySupplies.reduce((sum: bigint, s: any) => sum + BigInt(s.amount || 0), BigInt(0));
      const totalCollateral = collateralSupplies.reduce((sum: bigint, s: any) => sum + BigInt(s.amount || 0), BigInt(0));
      const totalBorrowed = borrowDebts.reduce((sum: bigint, d: any) => sum + BigInt(d.amount || 0), BigInt(0));

      return {
        totalPools: pools.length,
        totalPositions: positions.length,
        totalUsers: allUsers.size,
        totalTransactions: liquiditySupplies.length + collateralSupplies.length + borrowDebts.length,
        totalLiquidity: totalLiquidity.toString(),
        totalCollateral: totalCollateral.toString(),
        totalBorrowed: totalBorrowed.toString()
      };
    }
  },

  // Nested resolvers for relationships
  LendingPool: {
    liquiditySupplies: async (parent: any) => {
      const supplies = await db.select().from(liquiditySupplyTable);
      const poolSupplies = supplies.filter((s: any) => s.poolAddress === parent.id);
      return serializeBigInt(poolSupplies);
    },

    liquidityWithdrawals: async (parent: any) => {
      const withdrawals = await db.select().from(liquidityWithdrawTable);
      const poolWithdrawals = withdrawals.filter((w: any) => w.poolAddress === parent.id);
      return serializeBigInt(poolWithdrawals);
    },

    collateralSupplies: async (parent: any) => {
      const supplies = await db.select().from(collateralSupplyTable);
      const poolSupplies = supplies.filter((s: any) => s.poolAddress === parent.id);
      return serializeBigInt(poolSupplies);
    },

    borrowDebts: async (parent: any) => {
      const debts = await db.select().from(borrowDebtTable);
      const poolDebts = debts.filter((d: any) => d.poolAddress === parent.id);
      return serializeBigInt(poolDebts);
    },

    borrowDebtsCrosschain: async (parent: any) => {
      const debts = await db.select().from(borrowDebtCrosschainTable);
      const poolDebts = debts.filter((d: any) => d.poolAddress === parent.id);
      return serializeBigInt(poolDebts);
    },

    repayWithCollaterals: async (parent: any) => {
      const repays = await db.select().from(repayWithCollateralTable);
      const poolRepays = repays.filter((r: any) => r.poolAddress === parent.id);
      return serializeBigInt(poolRepays);
    },

    positions: async (parent: any) => {
      const positions = await db.select().from(positionTable);
      const poolPositions = positions.filter((p: any) => p.poolAddress === parent.id);
      return serializeBigInt(poolPositions);
    }
  },

  Position: {
    pool: async (parent: any) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === parent.poolAddress);
      return pool ? serializeBigInt(pool) : null;
    }
  },

  LiquiditySupply: {
    pool: async (parent: any) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === parent.poolAddress);
      return pool ? serializeBigInt(pool) : null;
    }
  },

  LiquidityWithdrawal: {
    pool: async (parent: any) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === parent.poolAddress);
      return pool ? serializeBigInt(pool) : null;
    }
  },

  CollateralSupply: {
    pool: async (parent: any) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === parent.poolAddress);
      return pool ? serializeBigInt(pool) : null;
    }
  },

  BorrowDebt: {
    pool: async (parent: any) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === parent.poolAddress);
      return pool ? serializeBigInt(pool) : null;
    }
  },

  BorrowDebtCrosschain: {
    pool: async (parent: any) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === parent.poolAddress);
      return pool ? serializeBigInt(pool) : null;
    }
  },

  RepayWithCollateral: {
    pool: async (parent: any) => {
      const pools = await db.select().from(lendingPoolTable);
      const pool = pools.find((p: any) => p.id === parent.poolAddress);
      return pool ? serializeBigInt(pool) : null;
    }
  }
};

export const schema = createSchema({
  typeDefs,
  resolvers
});

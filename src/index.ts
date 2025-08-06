import { ponder } from "ponder:registry";

// Import Supabase database client only
import { db, lendingPoolTable, basicTokenSenderTable, priceDataStreamTable, positionTable, liquiditySupplyTable, liquidityWithdrawTable, collateralSupplyTable, borrowDebtTable, borrowDebtCrosschainTable, repayWithCollateralTable } from "./db";

// Factory Events
ponder.on("factory:LendingPoolCreated" as any, async ({ event, context }: any) => {
  const poolData = {
    id: event.args.lendingPool,
    collateralToken: event.args.collateralToken,
    borrowToken: event.args.borrowToken,
    ltv: event.args.ltv,
    createdAt: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  };

  // Write to Supabase only
  try {
    await db.insert(lendingPoolTable).values({
      ...poolData,
      ltv: BigInt(poolData.ltv.toString()),
      createdAt: BigInt(poolData.createdAt.toString()),
      blockNumber: BigInt(poolData.blockNumber.toString()),
    }).onConflictDoNothing();
    console.log("✅ LendingPool synced to Supabase:", poolData.id);
  } catch (error) {
    console.error("❌ Failed to sync LendingPool to Supabase:", error);
  }
});

ponder.on("factory:BasicTokenSenderAdded" as any, async ({ event, context }: any) => {
  const senderData = {
    id: `${event.args.chainId}-${event.args.basicTokenSender}`,
    chainId: event.args.chainId,
    basicTokenSender: event.args.basicTokenSender,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  };

  // Write to Supabase only
  try {
    await db.insert(basicTokenSenderTable).values({
      ...senderData,
      chainId: BigInt(senderData.chainId.toString()),
      blockNumber: BigInt(senderData.blockNumber.toString()),
    }).onConflictDoNothing();
    console.log("✅ BasicTokenSender synced to Supabase:", senderData.id);
  } catch (error) {
    console.error("❌ Failed to sync BasicTokenSender to Supabase:", error);
  }
});

ponder.on("factory:TokenDataStreamAdded" as any, async ({ event, context }: any) => {
  const streamData = {
    id: `${event.args.token}-${event.args.dataStream}-${event.transaction.hash}-${event.log.logIndex}`,
    token: event.args.token,
    dataStream: event.args.dataStream,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  };

  // Write to Supabase only
  try {
    await db.insert(priceDataStreamTable).values({
      ...streamData,
      blockNumber: BigInt(streamData.blockNumber.toString()),
    }).onConflictDoNothing();
    console.log("✅ PriceDataStream synced to Supabase:", streamData.id);
  } catch (error) {
    console.error("❌ Failed to sync PriceDataStream to Supabase:", error);
  }
});

// Pool Events
ponder.on("pool:CreatePosition" as any, async ({ event, context }: any) => {
  const positionData = {
    id: event.args.positionAddress,
    user: event.args.user,
    positionAddress: event.args.positionAddress,
    poolAddress: event.log.address,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
  };

  // Write to Supabase only
  try {
    await db.insert(positionTable).values({
      ...positionData,
      blockNumber: BigInt(positionData.blockNumber.toString()),
      timestamp: BigInt(positionData.timestamp.toString()),
    }).onConflictDoNothing();
    console.log("✅ Position synced to Supabase:", positionData.id);
  } catch (error) {
    console.error("❌ Failed to sync Position to Supabase:", error);
  }
});

ponder.on("pool:SupplyLiquidity" as any, async ({ event, context }: any) => {
  const liquidityData = {
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    poolAddress: event.log.address,
    amount: event.args.amount,
    shares: event.args.shares,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
  };

  // Write to Supabase only
  try {
    await db.insert(liquiditySupplyTable).values({
      ...liquidityData,
      amount: BigInt(liquidityData.amount.toString()),
      shares: BigInt(liquidityData.shares.toString()),
      blockNumber: BigInt(liquidityData.blockNumber.toString()),
      timestamp: BigInt(liquidityData.timestamp.toString()),
    }).onConflictDoNothing();
    console.log("✅ LiquiditySupply synced to Supabase:", liquidityData.id);
  } catch (error) {
    console.error("❌ Failed to sync LiquiditySupply to Supabase:", error);
  }
});

ponder.on("pool:WithdrawLiquidity" as any, async ({ event, context }: any) => {
  const withdrawData = {
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    poolAddress: event.log.address,
    amount: event.args.amount,
    shares: event.args.shares,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
  };

  // Write to Supabase only
  try {
    await db.insert(liquidityWithdrawTable).values({
      ...withdrawData,
      amount: BigInt(withdrawData.amount.toString()),
      shares: BigInt(withdrawData.shares.toString()),
      blockNumber: BigInt(withdrawData.blockNumber.toString()),
      timestamp: BigInt(withdrawData.timestamp.toString()),
    }).onConflictDoNothing();
    console.log("✅ LiquidityWithdraw synced to Supabase:", withdrawData.id);
  } catch (error) {
    console.error("❌ Failed to sync LiquidityWithdraw to Supabase:", error);
  }
});

ponder.on("pool:SupplyCollateral" as any, async ({ event, context }: any) => {
  const collateralData = {
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    poolAddress: event.log.address,
    amount: event.args.amount,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
  };

  // Write to Supabase only
  try {
    await db.insert(collateralSupplyTable).values({
      ...collateralData,
      amount: BigInt(collateralData.amount.toString()),
      blockNumber: BigInt(collateralData.blockNumber.toString()),
      timestamp: BigInt(collateralData.timestamp.toString()),
    }).onConflictDoNothing();
    console.log("✅ CollateralSupply synced to Supabase:", collateralData.id);
  } catch (error) {
    console.error("❌ Failed to sync CollateralSupply to Supabase:", error);
  }
});

ponder.on("pool:BorrowDebtCrosschain" as any, async ({ event, context }: any) => {
  const borrowData = {
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    poolAddress: event.log.address,
    amount: event.args.amount,
    shares: event.args.shares,
    chainId: event.args.chainId,
    bridgeTokenSender: event.args.bridgeTokenSender,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
  };

  // Write to Supabase only
  try {
    await db.insert(borrowDebtCrosschainTable).values({
      ...borrowData,
      amount: BigInt(borrowData.amount.toString()),
      shares: BigInt(borrowData.shares.toString()),
      chainId: BigInt(borrowData.chainId.toString()),
      bridgeTokenSender: BigInt(borrowData.bridgeTokenSender.toString()),
      blockNumber: BigInt(borrowData.blockNumber.toString()),
      timestamp: BigInt(borrowData.timestamp.toString()),
    }).onConflictDoNothing();
    console.log("✅ BorrowDebtCrosschain synced to Supabase:", borrowData.id);
  } catch (error) {
    console.error("❌ Failed to sync BorrowDebtCrosschain to Supabase:", error);
  }
});

ponder.on("pool:RepayWithCollateralByPosition" as any, async ({ event, context }: any) => {
  const repayData = {
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    user: event.args.user,
    poolAddress: event.log.address,
    amount: event.args.amount,
    shares: event.args.shares,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
    timestamp: event.block.timestamp,
  };

  // Write to Supabase only
  try {
    await db.insert(repayWithCollateralTable).values({
      ...repayData,
      amount: BigInt(repayData.amount.toString()),
      shares: BigInt(repayData.shares.toString()),
      blockNumber: BigInt(repayData.blockNumber.toString()),
      timestamp: BigInt(repayData.timestamp.toString()),
    }).onConflictDoNothing();
    console.log("✅ RepayWithCollateral synced to Supabase:", repayData.id);
  } catch (error) {
    console.error("❌ Failed to sync RepayWithCollateral to Supabase:", error);
  }
});

// Position Contract Events
// Note: Position events might need additional schema tables if they track different data
// For now, adding basic logging for position-related events

ponder.on("position:Liquidate" as any, async ({ event, context }: any) => {
  // This might need a separate liquidation table in schema
  console.log("Liquidation event:", {
    user: event.args.user,
    positionAddress: event.log.address,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

ponder.on("position:SwapToken" as any, async ({ event, context }: any) => {
  // This might need a separate swap table in schema
  console.log("Token swap event:", {
    user: event.args.user,
    token: event.args.token,
    amount: event.args.amount,
    positionAddress: event.log.address,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

ponder.on("position:SwapTokenByPosition" as any, async ({ event, context }: any) => {
  // This might need a separate swap table in schema
  console.log("Token swap by position event:", {
    user: event.args.user,
    tokenIn: event.args.tokenIn,
    tokenOut: event.args.tokenOut,
    amountIn: event.args.amountIn,
    amountOut: event.args.amountOut,
    positionAddress: event.log.address,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

ponder.on("position:WithdrawCollateral" as any, async ({ event, context }: any) => {
  // This might need a separate withdrawal table in schema
  console.log("Withdraw collateral from position event:", {
    user: event.args.user,
    amount: event.args.amount,
    positionAddress: event.log.address,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});
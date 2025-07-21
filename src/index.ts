import { ponder } from "ponder:registry";
import { 
  lendingPool,
  basicTokenSender,
  priceDataStream,
  position,
  liquiditySupply,
  liquidityWithdraw,
  collateralSupply,
  borrowDebt,
  borrowDebtCrosschain,
  repayWithCollateral
} from "../ponder.schema";

// Factory Events
ponder.on("factory:LendingPoolCreated" as any, async ({ event, context }: any) => {
  await context.db
    .insert(lendingPool)
    .values({
      id: event.args.lendingPool,
      collateralToken: event.args.collateralToken,
      borrowToken: event.args.borrowToken,
      ltv: event.args.ltv,
      createdAt: event.block.timestamp,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    });
});

ponder.on("factory:BasicTokenSenderAdded" as any, async ({ event, context }: any) => {
  await context.db
    .insert(basicTokenSender)
    .values({
      id: `${event.args.chainId}-${event.args.basicTokenSender}`,
      chainId: event.args.chainId,
      basicTokenSender: event.args.basicTokenSender,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    });
});

ponder.on("factory:TokenDataStreamAdded" as any, async ({ event, context }: any) => {
  await context.db
    .insert(priceDataStream)
    .values({
      id: `${event.args.token}-${event.args.dataStream}`,
      token: event.args.token,
      dataStream: event.args.dataStream,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    });
});

// Pool Events
ponder.on("pool:CreatePosition" as any, async ({ event, context }: any) => {
  await context.db
    .insert(position)
    .values({
      id: event.args.positionAddress,
      user: event.args.user,
      positionAddress: event.args.positionAddress,
      poolAddress: event.log.address,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
      timestamp: event.block.timestamp,
    });
});

ponder.on("pool:SupplyLiquidity" as any, async ({ event, context }: any) => {
  await context.db
    .insert(liquiditySupply)
    .values({
      id: `${event.transaction.hash}-${event.log.logIndex}`,
      user: event.args.user,
      poolAddress: event.log.address,
      amount: event.args.amount,
      shares: event.args.shares,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
      timestamp: event.block.timestamp,
    });
});

ponder.on("pool:WithdrawLiquidity" as any, async ({ event, context }: any) => {
  await context.db
    .insert(liquidityWithdraw)
    .values({
      id: `${event.transaction.hash}-${event.log.logIndex}`,
      user: event.args.user,
      poolAddress: event.log.address,
      amount: event.args.amount,
      shares: event.args.shares,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
      timestamp: event.block.timestamp,
    });
});

ponder.on("pool:SupplyCollateral" as any, async ({ event, context }: any) => {
  await context.db
    .insert(collateralSupply)
    .values({
      id: `${event.transaction.hash}-${event.log.logIndex}`,
      user: event.args.user,
      poolAddress: event.log.address,
      amount: event.args.amount,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
      timestamp: event.block.timestamp,
    });
});

ponder.on("pool:BorrowDebtCrosschain" as any, async ({ event, context }: any) => {
  await context.db
    .insert(borrowDebtCrosschain)
    .values({
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
    });
});

ponder.on("pool:RepayWithCollateralByPosition" as any, async ({ event, context }: any) => {
  await context.db
    .insert(repayWithCollateral)
    .values({
      id: `${event.transaction.hash}-${event.log.logIndex}`,
      user: event.args.user,
      poolAddress: event.log.address,
      amount: event.args.amount,
      shares: event.args.shares,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
      timestamp: event.block.timestamp,
    });
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
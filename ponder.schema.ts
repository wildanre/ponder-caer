import { onchainTable, index } from "ponder";

// Lending Pool Factory Events
export const lendingPool = onchainTable("lending_pool", (t) => ({
  id: t.text().primaryKey(), // Pool address
  collateralToken: t.text().notNull(),
  borrowToken: t.text().notNull(),
  ltv: t.bigint().notNull(),
  createdAt: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
}));

export const basicTokenSender = onchainTable("basic_token_sender", (t) => ({
  id: t.text().primaryKey(), // chainId-sender
  chainId: t.bigint().notNull(),
  basicTokenSender: t.text().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
}));

export const priceDataStream = onchainTable("price_data_stream", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  token: t.text().notNull(),
  dataStream: t.text().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
}));

// Lending Pool Events
export const position = onchainTable("position", (t) => ({
  id: t.text().primaryKey(), // positionAddress
  user: t.text().notNull(),
  positionAddress: t.text().notNull(),
  poolAddress: t.text().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const liquiditySupply = onchainTable("liquidity_supply", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  user: t.text().notNull(),
  poolAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  shares: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const liquidityWithdraw = onchainTable("liquidity_withdraw", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  user: t.text().notNull(),
  poolAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  shares: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const collateralSupply = onchainTable("collateral_supply", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  user: t.text().notNull(),
  poolAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const borrowDebt = onchainTable("borrow_debt", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  user: t.text().notNull(),
  poolAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  shares: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const borrowDebtCrosschain = onchainTable("borrow_debt_crosschain", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  user: t.text().notNull(),
  poolAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  shares: t.bigint().notNull(),
  chainId: t.bigint().notNull(),
  bridgeTokenSender: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const repayWithCollateral = onchainTable("repay_with_collateral", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  user: t.text().notNull(),
  poolAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  shares: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.text().notNull(),
  timestamp: t.bigint().notNull(),
}));

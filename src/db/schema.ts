import { bigint, pgTable, text, index } from "drizzle-orm/pg-core";

// Lending Pool Factory Events
export const lendingPoolTable = pgTable("lending_pool", {
  id: text("id").primaryKey(), // Pool address
  collateralToken: text("collateral_token").notNull(),
  borrowToken: text("borrow_token").notNull(),
  ltv: bigint("ltv", { mode: "bigint" }).notNull(),
  createdAt: bigint("created_at", { mode: "bigint" }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
}, (table) => ({
  blockNumberIdx: index("lending_pool_block_number_idx").on(table.blockNumber),
  createdAtIdx: index("lending_pool_created_at_idx").on(table.createdAt),
}));

export const basicTokenSenderTable = pgTable("basic_token_sender", {
  id: text("id").primaryKey(), // chainId-sender
  chainId: bigint("chain_id", { mode: "bigint" }).notNull(),
  basicTokenSender: text("basic_token_sender").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
});

export const priceDataStreamTable = pgTable("price_data_stream", {
  id: text("id").primaryKey(), // token-dataStream
  token: text("token").notNull(),
  dataStream: text("data_stream").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
});

// Lending Pool Events
export const positionTable = pgTable("position", {
  id: text("id").primaryKey(), // positionAddress
  user: text("user").notNull(),
  positionAddress: text("position_address").notNull(),
  poolAddress: text("pool_address").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
}, (table) => ({
  userIdx: index("position_user_idx").on(table.user),
  poolIdx: index("position_pool_idx").on(table.poolAddress),
  timestampIdx: index("position_timestamp_idx").on(table.timestamp),
}));

export const liquiditySupplyTable = pgTable("liquidity_supply", {
  id: text("id").primaryKey(), // txHash-logIndex
  user: text("user").notNull(),
  poolAddress: text("pool_address").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  shares: bigint("shares", { mode: "bigint" }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
}, (table) => ({
  userIdx: index("liquidity_supply_user_idx").on(table.user),
  poolIdx: index("liquidity_supply_pool_idx").on(table.poolAddress),
  timestampIdx: index("liquidity_supply_timestamp_idx").on(table.timestamp),
}));

export const liquidityWithdrawTable = pgTable("liquidity_withdraw", {
  id: text("id").primaryKey(), // txHash-logIndex
  user: text("user").notNull(),
  poolAddress: text("pool_address").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  shares: bigint("shares", { mode: "bigint" }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
}, (table) => ({
  userIdx: index("liquidity_withdraw_user_idx").on(table.user),
  poolIdx: index("liquidity_withdraw_pool_idx").on(table.poolAddress),
  timestampIdx: index("liquidity_withdraw_timestamp_idx").on(table.timestamp),
}));

export const collateralSupplyTable = pgTable("collateral_supply", {
  id: text("id").primaryKey(), // txHash-logIndex
  user: text("user").notNull(),
  poolAddress: text("pool_address").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
}, (table) => ({
  userIdx: index("collateral_supply_user_idx").on(table.user),
  poolIdx: index("collateral_supply_pool_idx").on(table.poolAddress),
  timestampIdx: index("collateral_supply_timestamp_idx").on(table.timestamp),
}));

export const borrowDebtTable = pgTable("borrow_debt", {
  id: text("id").primaryKey(), // txHash-logIndex
  user: text("user").notNull(),
  poolAddress: text("pool_address").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  shares: bigint("shares", { mode: "bigint" }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
}, (table) => ({
  userIdx: index("borrow_debt_user_idx").on(table.user),
  poolIdx: index("borrow_debt_pool_idx").on(table.poolAddress),
  timestampIdx: index("borrow_debt_timestamp_idx").on(table.timestamp),
}));

export const borrowDebtCrosschainTable = pgTable("borrow_debt_crosschain", {
  id: text("id").primaryKey(), // txHash-logIndex
  user: text("user").notNull(),
  poolAddress: text("pool_address").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  shares: bigint("shares", { mode: "bigint" }).notNull(),
  chainId: bigint("chain_id", { mode: "bigint" }).notNull(),
  bridgeTokenSender: bigint("bridge_token_sender", { mode: "bigint" }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
}, (table) => ({
  userIdx: index("borrow_debt_crosschain_user_idx").on(table.user),
  poolIdx: index("borrow_debt_crosschain_pool_idx").on(table.poolAddress),
  chainIdx: index("borrow_debt_crosschain_chain_idx").on(table.chainId),
  timestampIdx: index("borrow_debt_crosschain_timestamp_idx").on(table.timestamp),
}));

export const repayWithCollateralTable = pgTable("repay_with_collateral", {
  id: text("id").primaryKey(), // txHash-logIndex
  user: text("user").notNull(),
  poolAddress: text("pool_address").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  shares: bigint("shares", { mode: "bigint" }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: bigint("timestamp", { mode: "bigint" }).notNull(),
}, (table) => ({
  userIdx: index("repay_with_collateral_user_idx").on(table.user),
  poolIdx: index("repay_with_collateral_pool_idx").on(table.poolAddress),
  timestampIdx: index("repay_with_collateral_timestamp_idx").on(table.timestamp),
}));

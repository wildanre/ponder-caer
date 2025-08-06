CREATE TABLE "basic_token_sender" (
	"id" text PRIMARY KEY NOT NULL,
	"chain_id" bigint NOT NULL,
	"basic_token_sender" text NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrow_debt_crosschain" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"pool_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"shares" bigint NOT NULL,
	"chain_id" bigint NOT NULL,
	"bridge_token_sender" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrow_debt" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"pool_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"shares" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collateral_supply" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"pool_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lending_pool" (
	"id" text PRIMARY KEY NOT NULL,
	"collateral_token" text NOT NULL,
	"borrow_token" text NOT NULL,
	"ltv" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liquidity_supply" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"pool_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"shares" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liquidity_withdraw" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"pool_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"shares" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"position_address" text NOT NULL,
	"pool_address" text NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_data_stream" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"data_stream" text NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repay_with_collateral" (
	"id" text PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"pool_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"shares" bigint NOT NULL,
	"block_number" bigint NOT NULL,
	"transaction_hash" text NOT NULL,
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "borrow_debt_crosschain_user_idx" ON "borrow_debt_crosschain" USING btree ("user");--> statement-breakpoint
CREATE INDEX "borrow_debt_crosschain_pool_idx" ON "borrow_debt_crosschain" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "borrow_debt_crosschain_chain_idx" ON "borrow_debt_crosschain" USING btree ("chain_id");--> statement-breakpoint
CREATE INDEX "borrow_debt_crosschain_timestamp_idx" ON "borrow_debt_crosschain" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "borrow_debt_user_idx" ON "borrow_debt" USING btree ("user");--> statement-breakpoint
CREATE INDEX "borrow_debt_pool_idx" ON "borrow_debt" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "borrow_debt_timestamp_idx" ON "borrow_debt" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "collateral_supply_user_idx" ON "collateral_supply" USING btree ("user");--> statement-breakpoint
CREATE INDEX "collateral_supply_pool_idx" ON "collateral_supply" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "collateral_supply_timestamp_idx" ON "collateral_supply" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "lending_pool_block_number_idx" ON "lending_pool" USING btree ("block_number");--> statement-breakpoint
CREATE INDEX "lending_pool_created_at_idx" ON "lending_pool" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "liquidity_supply_user_idx" ON "liquidity_supply" USING btree ("user");--> statement-breakpoint
CREATE INDEX "liquidity_supply_pool_idx" ON "liquidity_supply" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "liquidity_supply_timestamp_idx" ON "liquidity_supply" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "liquidity_withdraw_user_idx" ON "liquidity_withdraw" USING btree ("user");--> statement-breakpoint
CREATE INDEX "liquidity_withdraw_pool_idx" ON "liquidity_withdraw" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "liquidity_withdraw_timestamp_idx" ON "liquidity_withdraw" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "position_user_idx" ON "position" USING btree ("user");--> statement-breakpoint
CREATE INDEX "position_pool_idx" ON "position" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "position_timestamp_idx" ON "position" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "repay_with_collateral_user_idx" ON "repay_with_collateral" USING btree ("user");--> statement-breakpoint
CREATE INDEX "repay_with_collateral_pool_idx" ON "repay_with_collateral" USING btree ("pool_address");--> statement-breakpoint
CREATE INDEX "repay_with_collateral_timestamp_idx" ON "repay_with_collateral" USING btree ("timestamp");
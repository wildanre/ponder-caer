import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from './src/db/schema.ts';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL tidak ditemukan dalam environment variables');
  process.exit(1);
}

try {
  const client = postgres(DATABASE_URL);
  const db = drizzle(client, { schema });
  
  console.log('🔍 Checking data in Supabase tables...\n');
  
  // Check lending_pool table
  const lendingPools = await db.select().from(schema.lendingPool);
  console.log(`📊 Lending Pools: ${lendingPools.length} records`);
  if (lendingPools.length > 0) {
    console.log('   Sample:', JSON.stringify(lendingPools[0], null, 2));
  }
  
  // Check basic_token_sender table
  const tokenSenders = await db.select().from(schema.basicTokenSender);
  console.log(`\n📊 Basic Token Senders: ${tokenSenders.length} records`);
  
  // Check price_data_stream table
  const priceStreams = await db.select().from(schema.priceDataStream);
  console.log(`📊 Price Data Streams: ${priceStreams.length} records`);
  if (priceStreams.length > 0) {
    console.log('   Sample:', JSON.stringify(priceStreams[0], null, 2));
  }
  
  // Check position table
  const positions = await db.select().from(schema.position);
  console.log(`\n📊 Positions: ${positions.length} records`);
  if (positions.length > 0) {
    console.log('   Sample:', JSON.stringify(positions[0], null, 2));
  }
  
  // Check liquidity_supply table
  const liquiditySupplies = await db.select().from(schema.liquiditySupply);
  console.log(`\n📊 Liquidity Supplies: ${liquiditySupplies.length} records`);
  if (liquiditySupplies.length > 0) {
    console.log('   Sample:', JSON.stringify(liquiditySupplies[0], null, 2));
  }
  
  // Check borrow_debt_crosschain table
  const borrowDebtCrosschain = await db.select().from(schema.borrowDebtCrosschain);
  console.log(`\n📊 Borrow Debt Crosschain: ${borrowDebtCrosschain.length} records`);
  if (borrowDebtCrosschain.length > 0) {
    console.log('   Sample:', JSON.stringify(borrowDebtCrosschain[0], null, 2));
  }
  
  await client.end();
  console.log('\n✅ Data check completed');
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

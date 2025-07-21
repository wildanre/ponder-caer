import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL tidak ditemukan dalam environment variables');
  process.exit(1);
}

try {
  const client = postgres(DATABASE_URL);
  
  console.log('🔍 Checking data in Supabase tables...\n');
  
  // Check lending_pool table
  const lendingPools = await client`SELECT COUNT(*) as count FROM lending_pool`;
  console.log(`📊 Lending Pools: ${lendingPools[0].count} records`);
  
  if (lendingPools[0].count > 0) {
    const sample = await client`SELECT * FROM lending_pool LIMIT 1`;
    console.log('   Sample:', sample[0]);
  }
  
  // Check basic_token_sender table
  const tokenSenders = await client`SELECT COUNT(*) as count FROM basic_token_sender`;
  console.log(`\n📊 Basic Token Senders: ${tokenSenders[0].count} records`);
  
  // Check price_data_stream table
  const priceStreams = await client`SELECT COUNT(*) as count FROM price_data_stream`;
  console.log(`📊 Price Data Streams: ${priceStreams[0].count} records`);
  
  if (priceStreams[0].count > 0) {
    const sample = await client`SELECT * FROM price_data_stream LIMIT 1`;
    console.log('   Sample:', sample[0]);
  }
  
  // Check position table
  const positions = await client`SELECT COUNT(*) as count FROM position`;
  console.log(`\n📊 Positions: ${positions[0].count} records`);
  
  if (positions[0].count > 0) {
    const sample = await client`SELECT * FROM position LIMIT 1`;
    console.log('   Sample:', sample[0]);
  }
  
  // Check liquidity_supply table
  const liquiditySupplies = await client`SELECT COUNT(*) as count FROM liquidity_supply`;
  console.log(`\n📊 Liquidity Supplies: ${liquiditySupplies[0].count} records`);
  
  if (liquiditySupplies[0].count > 0) {
    const sample = await client`SELECT * FROM liquidity_supply LIMIT 1`;
    console.log('   Sample:', sample[0]);
  }
  
  // Check borrow_debt_crosschain table
  const borrowDebtCrosschain = await client`SELECT COUNT(*) as count FROM borrow_debt_crosschain`;
  console.log(`\n📊 Borrow Debt Crosschain: ${borrowDebtCrosschain[0].count} records`);
  
  if (borrowDebtCrosschain[0].count > 0) {
    const sample = await client`SELECT * FROM borrow_debt_crosschain LIMIT 1`;
    console.log('   Sample:', sample[0]);
  }
  
  // Check collateral_supply table
  const collateralSupply = await client`SELECT COUNT(*) as count FROM collateral_supply`;
  console.log(`\n📊 Collateral Supply: ${collateralSupply[0].count} records`);
  
  if (collateralSupply[0].count > 0) {
    const sample = await client`SELECT * FROM collateral_supply LIMIT 1`;
    console.log('   Sample:', sample[0]);
  }
  
  await client.end();
  console.log('\n✅ Data check completed');
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

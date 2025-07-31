import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = postgres(process.env.DATABASE_URL);

async function cleanupPriceDataStream() {
  try {
    console.log('🧹 Starting cleanup of price_data_stream table...');
    
    // Check current count
    const countBefore = await client`SELECT COUNT(*) as count FROM price_data_stream`;
    console.log(`📊 Records before cleanup: ${countBefore[0].count}`);
    
    // Show duplicate entries (same token-dataStream combination)
    const duplicates = await client`
      SELECT token, data_stream, COUNT(*) as count 
      FROM price_data_stream 
      GROUP BY token, data_stream 
      HAVING COUNT(*) > 1
    `;
    
    console.log(`🔍 Found ${duplicates.length} duplicate token-dataStream combinations:`);
    duplicates.forEach(dup => {
      console.log(`   - Token: ${dup.token}, DataStream: ${dup.data_stream}, Count: ${dup.count}`);
    });
    
    if (duplicates.length > 0) {
      // Delete all records (we'll re-index anyway)
      console.log('🗑️  Clearing all price_data_stream records to avoid conflicts...');
      const deleteResult = await client`DELETE FROM price_data_stream`;
      console.log(`✅ Deleted ${deleteResult.count} records`);
    }
    
    // Check final count
    const countAfter = await client`SELECT COUNT(*) as count FROM price_data_stream`;
    console.log(`📊 Records after cleanup: ${countAfter[0].count}`);
    
    console.log('✅ Cleanup completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Restart your Ponder indexer');
    console.log('   2. The indexer will re-process events with the new ID format (txHash-logIndex)');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.end();
  }
}

cleanupPriceDataStream();

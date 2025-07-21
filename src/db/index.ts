import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection with fallback to hardcoded connection for testing
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xanvchnjbfuavmxmvpnf:vNAqdr1pt8rBVdja@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

let client: postgres.Sql<{}> | null = null;
let db: any = null;

console.log("🔍 Database connection setup:");
console.log("  - DATABASE_URL from env:", !!process.env.DATABASE_URL);
console.log("  - Connection string exists:", !!connectionString);

try {
  console.log("✅ Initializing Supabase connection...");
  // Disable prefetch as it is not supported for "Transaction" pool mode
  client = postgres(connectionString, { prepare: false });
  // Create the drizzle database instance
  db = drizzle(client, { schema });
  console.log("✅ Supabase connection initialized successfully!");
} catch (error) {
  console.error("❌ Failed to initialize Supabase connection:", error);
}

export { client, db };

// Export all schema tables for easy access
export * from './schema';

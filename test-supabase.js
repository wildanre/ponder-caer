import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL tidak ditemukan dalam environment variables');
  process.exit(1);
}

console.log('Connecting to Supabase...');
console.log('Database URL exists:', !!DATABASE_URL);

try {
  // Buat koneksi postgres
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);
  
  console.log('✅ Koneksi ke database berhasil!');
  
  // Test query sederhana
  const result = await client`SELECT 1 as test`;
  console.log('✅ Test query berhasil:', result);
  
  // List semua tabel
  const tables = await client`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  
  console.log('\n📋 Tabel yang tersedia:');
  tables.forEach(table => {
    console.log(`  - ${table.table_name}`);
  });
  
  await client.end();
  console.log('\n✅ Test selesai, koneksi ditutup');
  
} catch (error) {
  console.error('❌ Error saat koneksi:', error);
  process.exit(1);
}

import dotenv from 'dotenv';
import { runSync } from './src/db/syncEngine';

// Load environment variables
dotenv.config();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const SYNC_INTERVAL_MS = 3 * 60 * 60 * 1000; // Every 3 hours

async function startWorker() {
  console.log('====================================================');
  console.log('⚽ Football Stats Ingestion Worker started...');
  console.log(`⏱️ Sync interval: every 3 hours`);
  console.log(`🔑 API Key Configured: ${API_KEY ? 'YES (football-data.org)' : 'NO (Simulation/Offline Mode)'}`);
  console.log('====================================================');

  // Initial sync run on boot
  await executeSyncCycle();

  // Schedule periodic synchronization
  setInterval(async () => {
    await executeSyncCycle();
  }, SYNC_INTERVAL_MS);
}

async function executeSyncCycle() {
  console.log(`[Worker - ${new Date().toISOString()}] Initiating sync cycle...`);
  try {
    const result = await runSync(API_KEY);
    console.log(`[Worker - Result] Success: ${result.success}. Count: ${result.syncedCount}. Msg: ${result.message}`);
  } catch (err) {
    console.error(`[Worker - Error] Critical failure during sync cycle:`, err);
  }
}

startWorker().catch((err) => {
  console.error('[Worker - Fatal] Service crashed:', err);
  process.exit(1);
});

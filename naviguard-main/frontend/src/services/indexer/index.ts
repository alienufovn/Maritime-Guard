import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

// 1. Configuration
const RPC_URL = process.env.RPC_URL!;
const MONGO_URI = process.env.MONGODB_ATLAS_URI!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const DB_NAME = "naviguard_db";
const COLLECTION_NAME = "telemetry_logs";

// The ABI for the event we want to index
const CONTRACT_ABI = [
  "event RiskScoreUpdated(address indexed vessel, uint32 score)"
];

async function startIndexer() {
  console.log("⚓ Starting NaviGuard Indexer...");

  // 2. Initialize MongoDB
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  console.log("✅ Connected to MongoDB Atlas");

  // 3. Initialize Provider and Contract
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  console.log(`📡 Listening for events on Asset Hub at: ${CONTRACT_ADDRESS}`);

  // 4. Listen for the RiskScoreUpdated Event
  contract.on("RiskScoreUpdated", async (vessel, score, event) => {
    try {
      console.log(`🔔 New Risk Event: Vessel ${vessel} scored ${score}`);

      // Prepare the document for MongoDB
      const logEntry = {
        vesselAddress: vessel.toLowerCase(),
        riskScore: Number(score),
        blockNumber: event.log.blockNumber,
        transactionHash: event.log.transactionHash,
        timestamp: new Date(), // Using current time as proxy for block time
        // Note: You can expand this by fetching more AIS data via your API
      };

      // 5. Atomic Write to Atlas
      const result = await collection.insertOne(logEntry);
      console.log(`💾 Data indexed: ${result.insertedId}`);

    } catch (error) {
      console.error("❌ Failed to index event:", error);
    }
  });

  // Keep the process alive
  process.on('SIGINT', async () => {
    await client.close();
    process.exit(0);
  });
}

startIndexer().catch(console.error);
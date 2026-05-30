import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';

/**
 * MongoDB Atlas <-> Google Cloud (AI Studio) Connection Diagnostics Tool
 * Scans, Detects, and Fixes connection issues between AI Studio serverless 
 * containers and MongoDB Atlas accounts.
 */

// 1. Locate the environment variables securely
let envPath = '.env.local';
if (!fs.existsSync(envPath)) {
    envPath = '.env';
}
const envConfig = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const uri = envConfig.MONGODB_ATLAS_URI || process.env.MONGODB_ATLAS_URI;

async function scanAndDetect() {
    console.log(`\n========================================================`);
    console.log(`🚀 ATLAS -> GCP CLOUD RUN CONNECTION SCANNER`);
    console.log(`========================================================`);
    
    if (!uri) {
        console.error("❌ [DETECTED] Missing MONGODB_ATLAS_URI in .env.local");
        console.log("   [FIX] Add your connection string to .env.local like this:");
        console.log("         MONGODB_ATLAS_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority");
        return;
    }
    
    console.log(`🔎 [SCANNING] Targeting URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`);
    
    // Explicitly using connection settings required for GCP serverless stability
    const client = new MongoClient(uri, { 
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        tls: true,
        retryWrites: true,
    });

    try {
        console.log(`📡 [CONNECTING] Executing connection from Google Cloud (AI Studio)...`);
        await client.connect();
        
        console.log("\n✅ [SUCCESS] Connection established! Node driver successfully handshook with MongoDB Atlas.");
        const dbs = await client.db().admin().listDatabases();
        console.log("📂 [DATA] Accessible Databases:", dbs.databases.map((db: any) => db.name).join(", "));
        console.log("\n🔒 [SECURITY] Best Practices Verified:");
        console.log("   - Connected over TLS/SSL");
        console.log("   - DNS SRV records successfully resolved");
        
    } catch (err: any) {
        console.error(`\n❌ [DETECTED] Connection Failed!\n`);
        console.error(`   Raw Error Form: ${err.message}\n`);
        
        console.log(`========================================================`);
        console.log(`🛠️ PRESCRIBED GOOGLE CLOUD / ATLAS FIXES`);
        console.log(`========================================================`);
        
        if (err.message.includes("ENOTFOUND")) {
            console.log("1. DNS RESOLUTION FAILURE (Current Root Cause)");
            console.log("   ➤ Diagnosis: Google Cloud couldn't find the host 'alienufovn.ylgyqbw.mongodb.net'.");
            console.log("   ➤ Fix 1: Verify the cluster hasn't been paused, terminated, or misspelled.");
            console.log("   ➤ Fix 2: Check your MongoDB Atlas Dashboard -> Database to ensure the cluster 'alienufovn' actually exists and is active.");
        } 
        else if (err.message.toLowerCase().includes("bad auth") || err.message.toLowerCase().includes("authentication") || err.message.toLowerCase().includes("auth failed") || err.message.toLowerCase().includes("code: 18")) {
            console.log("1. AUTHENTICATION FAILURE (Current Root Cause)");
            console.log("   ➤ Diagnosis: Invalid username, password, or authentication parameters.");
            console.log("   ➤ Fix: Update .env.local with Database Access credentials and verify authMechanism options configured in Atlas.");
        } 
        else if (err.message.includes("timeout") || err.message.includes("ECONNREFUSED")) {
            console.log("1. NETWORK BLOCK (Current Root Cause)");
            console.log("   ➤ Diagnosis: Your connection was ignored/dropped by Atlas. Since Google Cloud serverless IPs are highly dynamic, Atlas Firewall blocks them by default.");
            console.log("   ➤ Fix A: Go to MongoDB Atlas: Security > Network Access.");
            console.log("   ➤ Fix B: Click 'Add IP Address', select 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0).");
            console.log("   ➤ Fix C (Enterprise): If 0.0.0.0/0 is unacceptable, establish a VPC Peering connection between Google Cloud VPC and MongoDB Atlas VPC.");
        } 
        else if (err.message.includes("SSL") || err.message.includes("alert number 80")) {
            console.log("1. TLS HANDSHAKE ALERT (Current Root Cause)");
            console.log("   ➤ Diagnosis: Connection closed securely during TLS handshake.");
            console.log("   ➤ Fix: This is almost always caused by an IP not being whitelisted in Network Access, causing Atlas to reject the SSL packet.");
        } 
        else {
            console.log("1. UNKNOWN FAILURE");
            console.log("   ➤ Diagnosis: An unhandled driver exception occurred.");
            console.log("   ➤ Fix: Re-copy the exact 'mongodb+srv' driver string from your Atlas 'Connect' dashboard.");
        }
        console.log(`========================================================\n`);
    } finally {
        await client.close();
    }
}

scanAndDetect();

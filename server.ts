import express from "express";
import path from "path";
import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load local environment files first, then fallback to processes environment
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up server-side Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

// REST API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Run live connection test for all three MongoDB connection strings
app.post("/api/mongo/test", async (req, res) => {
  const results: Record<string, any> = {};

  const URIs = {
    ATLAS_URI: process.env.MONGODB_ATLAS_URI || "mongodb+srv://alienufovn:sOgbHDUBU2RgMnfE@alienufovn.0tzgnzs.mongodb.net/?appName=alienufovn",
    URI_1: process.env.MONGODB_URI_1 || "mongodb://alienufovn:sOgbHDUBU2RgMnfE@federateddatabaseinstance0-fxlxvy.g.query.mongodb.net/?ssl=true&authSource=admin&appName=FederatedDatabaseInstance0",
    URI_2: process.env.MONGODB_URI_2 || "mongodb://alienufovn:sOgbHDUBU2RgMnfE@federateddatabaseinstance1-fxlxvy.g.query.mongodb.net/?ssl=true&authSource=admin&authMechanism=SCRAM-SHA-1&appName=FederatedDatabaseInstance1",
    ATLAS_SQL: process.env.MONGODB_ATLAS_SQL || "mongodb://alienufovn:sOgbHDUBU2RgMnfE@atlas-sql-6a11518a0bf800d38b7169e9-fxlxvy.g.query.mongodb.net/?ssl=true&authSource=admin&appName=atlas-sql-6a11518a0bf800d38b7169e9"
  };

  for (const [key, uri] of Object.entries(URIs)) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    try {
      await client.connect();
      const dbs = await client.db().admin().listDatabases();
      results[key] = {
        success: true,
        databases: dbs.databases.map((db: any) => db.name),
        uriMasked: uri.replace(/:([^:@]+)@/, ':****@'),
      };
    } catch (err: any) {
      let diagnosis = "An unhandled driver exception occurred.";
      let fix = "Re-copy the exact connection string from your your Atlas dashboard.";
      let errorType = "UNKNOWN";

      const msg = err.message.toLowerCase();
      if (err.message.includes("ENOTFOUND")) {
        errorType = "DNS_ERROR";
        diagnosis = "Google Cloud was unable to resolve the hostname in DNS.";
        fix = "Verify the cluster hasn't been paused, terminated, or misspelled.";
      } else if (msg.includes("bad auth") || msg.includes("authentication") || msg.includes("auth failed") || msg.includes("code: 18") || msg.includes("code 18") || msg.includes("authenticationfailed")) {
        errorType = "AUTH_ERROR";
        diagnosis = "Invalid username/password credentials, or unsupported authentication mechanism.";
        fix = "Verify the username, password, and connection parameters (like authMechanism/authSource) of your Database User access credentials configured in Atlas.";
      } else if (msg.includes("ssl") || msg.includes("handshake") || msg.includes("alert number 80")) {
        errorType = "SSL_ERROR";
        diagnosis = "Secure TLS Handshake failed.";
        fix = "Atlas closes connection during SSL handshake when the incoming IP is not whitelisted in Atlas Network Access.";
      } else if (msg.includes("timeout") || msg.includes("econnrefused") || msg.includes("closed") || msg.includes("disconnected") || msg.includes("reset")) {
        errorType = "NETWORK_ERROR";
        diagnosis = "Connection was ignored, dropped, or directly closed by Atlas firewall or database service.";
        fix = "Go to MongoDB Atlas > Network Access > Click 'Add IP Address' > Select 'Allow Access From Anywhere' (0.0.0.0/0). Google Cloud Runs use highly dynamic IP ranges that are blocked by default.";
      }

      results[key] = {
        success: false,
        error: err.message,
        errorType,
        diagnosis,
        fix,
        uriMasked: uri.replace(/:([^:@]+)@/, ':****@'),
      };
    } finally {
      await client.close();
    }
  }

  res.json({ success: true, results });
});

// Run a server-side MongoDB Query
app.post("/api/mongo/query", async (req, res) => {
  const { uriKey, dbName, collectionName, filter = {}, limit = 5 } = req.body;
  
  const URIs: Record<string, string> = {
    ATLAS_URI: process.env.MONGODB_ATLAS_URI || "mongodb+srv://alienufovn:sOgbHDUBU2RgMnfE@alienufovn.0tzgnzs.mongodb.net/?appName=alienufovn",
    URI_1: process.env.MONGODB_URI_1 || "mongodb://alienufovn:sOgbHDUBU2RgMnfE@federateddatabaseinstance0-fxlxvy.g.query.mongodb.net/?ssl=true&authSource=admin&appName=FederatedDatabaseInstance0",
    URI_2: process.env.MONGODB_URI_2 || "mongodb://alienufovn:sOgbHDUBU2RgMnfE@federateddatabaseinstance1-fxlxvy.g.query.mongodb.net/?ssl=true&authSource=admin&authMechanism=SCRAM-SHA-1&appName=FederatedDatabaseInstance1",
    ATLAS_SQL: process.env.MONGODB_ATLAS_SQL || "mongodb://alienufovn:sOgbHDUBU2RgMnfE@atlas-sql-6a11518a0bf800d38b7169e9-fxlxvy.g.query.mongodb.net/?ssl=true&authSource=admin&appName=atlas-sql-6a11518a0bf800d38b7169e9"
  };

  const selectedUri = URIs[uriKey];
  if (!selectedUri) {
    return res.status(400).json({ success: false, error: "Invalid URI key provided." });
  }

  const client = new MongoClient(selectedUri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(dbName || undefined);
    const collection = db.collection(collectionName || "movies");
    const documents = await collection.find(filter).limit(Math.min(limit, 50)).toArray();
    res.json({ success: true, documents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
});

// Server-side AI benchmark trigger (hides API Key from the client)
app.post("/api/benchmark", async (req, res) => {
  const { task, prompt, model = "gemini-2.5-flash" } = req.body;
  try {
    const client = getGeminiClient();
    const startTime = Date.now();
    
    // Antigravity server-side model logic
    const response = await client.models.generateContent({
      model: model,
      contents: [
        {
          text: `Maritime Counter-Terrorism Assessment\nTask Category: ${task}\nSystem Telemetry Input: ${prompt}\n\nAssess immediately. Output risk index (LOW/MEDIUM/HIGH/STABILIZED) and direct reasoning bullet points.`,
        }
      ],
    });
    
    const endTime = Date.now();
    res.json({
      success: true,
      text: response.text,
      latency: endTime - startTime,
      model: model,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite & Static file handler setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Naviguard Full-Stack Server booted dynamically on port ${PORT}`);
  });
}

startServer();

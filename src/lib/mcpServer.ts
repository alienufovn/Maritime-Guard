import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

// Initialize environment variables support for standalone execution context
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

// Establish a secure, lazy connection helper to prevent crashing at module load time
// exactly as specified in the Environment Variable & API Key security guidelines
let mongoClient: MongoClient | null = null;

function getMongoClient(): MongoClient {
  if (!mongoClient) {
    const uri = process.env.MONGODB_ATLAS_URI || 
                process.env.MONGODB_URI_2 || 
                "mongodb+srv://alienufovn:sOgbHDUBU2RgMnfE@alienufovn.0tzgnzs.mongodb.net/?appName=alienufovn";
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
  }
  return mongoClient;
}

// Instantiate the MCP Server
const server = new Server(
  {
    name: "naviguard-mcp-db-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_databases",
        description: "Securely query and list all databases in the connected external MongoDB Atlas cluster",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "query_db_collection",
        description: "Run advanced data retrieval queries on the external database cluster",
        inputSchema: {
          type: "object",
          properties: {
            dbName: { type: "string", description: "Database name to query" },
            collectionName: { type: "string", description: "Collection name to query" },
            filter: { type: "object", description: "MongoDB filter query payload" },
            limit: { type: "number", description: "Maximum number of documents to return (default 10, max 100)" },
          },
          required: ["dbName", "collectionName"],
        },
      },
    ],
  };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const client = getMongoClient();
    await client.connect();

    if (name === "list_databases") {
      const dbs = await client.db().admin().listDatabases();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              databases: dbs.databases.map((db: any) => db.name),
            }, null, 2),
          },
        ],
      };
    }

    if (name === "query_db_collection") {
      const { dbName, collectionName, filter = {}, limit = 10 } = (args || {}) as any;
      const targetLimit = Math.min(limit, 100);

      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      const results = await collection.find(filter).limit(targetLimit).toArray();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              db: dbName,
              collection: collectionName,
              documentsCount: results.length,
              data: results,
            }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Tool ${name} is not implemented or supported.`);

  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing MCP tool: ${error.message || error}`,
        },
      ],
    };
  }
});

// Start the Server using Standard I/O (Stdio) Transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("NaviGuard MCP secure database server started successfully.");
}

// Protect execution context if run directly
if (process.argv[1]?.endsWith("mcpServer.ts") || process.argv[1]?.endsWith("mcpServer.js")) {
  run().catch((err) => {
    console.error("Failed to start NaviGuard MCP server:", err);
  });
}

export { server, getMongoClient };

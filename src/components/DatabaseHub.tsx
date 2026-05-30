import React, { useState, useEffect } from "react";
import { 
  Database, RefreshCw, AlertTriangle, CheckCircle2, 
  Terminal, ShieldAlert, Code, Send 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConnectionResult {
  success: boolean;
  databases?: string[];
  uriMasked: string;
  error?: string;
  errorType?: "DNS_ERROR" | "AUTH_ERROR" | "NETWORK_ERROR" | "SSL_ERROR" | "UNKNOWN";
  diagnosis?: string;
  fix?: string;
}

export function DatabaseHub() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<Record<string, ConnectionResult> | null>(null);
  const [activeTab, setActiveTab] = useState<"diagnostics" | "explorer" | "mcp">("diagnostics");
  
  // Database Explorer states
  const [selectedUriKey, setSelectedUriKey] = useState("URI_2");
  const [customDb, setCustomDb] = useState("sample_mflix");
  const [customCollection, setCustomCollection] = useState("movies");
  const [queryFilter, setQueryFilter] = useState('{"year": 1994}');
  const [limitCount, setLimitCount] = useState(3);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/mongo/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        toast.success("Connection audit scan completed successfully.");
      } else {
        toast.error("Internal service error during diagnostics.");
      }
    } catch (err: any) {
      toast.error(`Connection failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleQuery = async () => {
    setQueryLoading(true);
    setQueryResult(null);
    setQueryError(null);
    try {
      let filterObj = {};
      try {
        if (queryFilter.trim()) {
          filterObj = JSON.parse(queryFilter);
        }
      } catch (e) {
        throw new Error("Invalid query filter JSON. Make sure you use double quotes for keys and string values.");
      }

      const res = await fetch("/api/mongo/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uriKey: selectedUriKey,
          dbName: customDb,
          collectionName: customCollection,
          filter: filterObj,
          limit: limitCount
        })
      });

      const data = await res.json();
      if (data.success) {
        setQueryResult(data.documents);
        toast.success(`Retrieved ${data.documents.length} document(s).`);
      } else {
        setQueryError(data.error);
        toast.error("Query execution failed");
      }
    } catch (err: any) {
      setQueryError(err.message);
      toast.error(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-500" /> Secure <span className="text-blue-500">Database Hub</span>
          </h1>
          <p className="text-white/40 text-sm font-serif italic mt-1">
            Real-time diagnostic analysis and connection scanner for NaviGuard Atlas clusters.
          </p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <TabButton active={activeTab === "diagnostics"} onClick={() => setActiveTab("diagnostics")}>
            Diagnostics
          </TabButton>
          <TabButton active={activeTab === "explorer"} onClick={() => setActiveTab("explorer")}>
            Data Explorer
          </TabButton>
          <TabButton active={activeTab === "mcp"} onClick={() => setActiveTab("mcp")}>
            MCP Server API
          </TabButton>
        </div>
      </div>

      {activeTab === "diagnostics" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xs uppercase font-mono tracking-[0.25em] text-white/30">
              Live Connection Integrity Checks
            </h2>
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              <RefreshCw className={cn("w-4 h-4", testing && "animate-spin")} />
              {testing ? "Scanning..." : "Sync Integrity Audit"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DatabaseCard 
              title="MONGODB_ATLAS_URI" 
              subtitle="User Primary Account"
              result={results?.ATLAS_URI} 
              testing={testing}
            />
            <DatabaseCard 
              title="MONGODB_URI_1"
              subtitle="Federated Db Instance 0"
              result={results?.URI_1} 
              testing={testing}
            />
            <DatabaseCard 
              title="MONGODB_URI_2"
              subtitle="Federated Db Instance 1"
              result={results?.URI_2} 
              testing={testing}
            />
            <DatabaseCard 
              title="MONGODB_ATLAS_SQL"
              subtitle="SQL Data Lake Interface"
              result={results?.ATLAS_SQL} 
              testing={testing}
            />
          </div>

          {/* Guide for Network Access Whitelisting */}
          <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-yellow-400" /> Urgent Cloud Integration Action Required?
            </h3>
            <div className="text-xs text-white/60 space-y-3 leading-relaxed">
              <p>
                Since Google Cloud serverless instances rely on **highly dynamic IP addresses**, connections to MongoDB Atlas
                will be blocked by default. To enable successful cloud authentication and resolve the errors, please follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-white/40 font-mono">
                <li>Log in to your <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-yellow-400 underline">MongoDB Atlas Dashboard</a></li>
                <li>Navigate under security parameters to <strong className="text-white/70">Security &gt; Network Access</strong></li>
                <li>Click <strong className="text-white/70">Add IP Address</strong></li>
                <li>Select <strong className="text-white/70">ALLOW ACCESS FROM ANYWHERE</strong> (adds <code className="text-yellow-400 bg-white/5 px-1 py-0.5 rounded">0.0.0.0/0</code>)</li>
                <li>Wait 60 seconds for Atlas IP sync, then click <strong className="text-white/70">"Sync Integrity Audit"</strong> here above!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {activeTab === "explorer" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-[#1a1c1e] border border-white/5 rounded-xl p-6 shadow-2xl space-y-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest font-mono">Query Customizer</h3>
            
            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-white/40 block">Select Target MongoDB URI</label>
                <select 
                  value={selectedUriKey}
                  onChange={(e) => setSelectedUriKey(e.target.value)}
                  className="w-full bg-[#141517] border border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 text-white"
                >
                  <option value="ATLAS_URI">MONGODB_ATLAS_URI (Primary Account)</option>
                  <option value="URI_1">MONGODB_URI_1 (Federated Db 0)</option>
                  <option value="URI_2">MONGODB_URI_2 (Federated Db 1)</option>
                  <option value="ATLAS_SQL">MONGODB_ATLAS_SQL (SQL Data Lake)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-white/40 block">Database Name</label>
                <input 
                  type="text"
                  value={customDb}
                  onChange={(e) => setCustomDb(e.target.value)}
                  className="w-full bg-[#141517] border border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/40 block">Collection Name</label>
                <input 
                  type="text"
                  value={customCollection}
                  onChange={(e) => setCustomCollection(e.target.value)}
                  className="w-full bg-[#141517] border border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/40 block">JSON Query Filter</label>
                <textarea 
                  value={queryFilter}
                  onChange={(e) => setQueryFilter(e.target.value)}
                  rows={4}
                  className="w-full bg-[#141517] border border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 text-white"
                  placeholder='For example: {"genres": "Action"}'
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/40 block">Result Limit</label>
                <input 
                  type="number"
                  min={1}
                  max={25}
                  value={limitCount}
                  onChange={(e) => setLimitCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#141517] border border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleQuery}
              disabled={queryLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {queryLoading ? "Fetching..." : "Execute MongoDB Query"}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-6 shadow-2xl h-full flex flex-col">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest font-mono mb-4 flex items-center justify-between">
                <span>QueryResult Segment</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">REST SECURE</span>
              </h3>

              {queryLoading && (
                <div className="flex-1 flex flex-col justify-center items-center h-64 gap-3">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">Connecting to secure driver...</span>
                </div>
              )}

              {queryError && (
                <div className="flex-1 bg-red-500/5 rounded-xl border border-red-500/15 p-6 font-mono text-xs text-red-400 space-y-2 h-64 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Connection Refused
                  </div>
                  <pre className="whitespace-pre-wrap">{queryError}</pre>
                  <p className="text-[10px] text-white/40 pt-4 leading-relaxed">
                    Check if the network access settings allow your dynamic server IP or set up allow-all (0.0.0.0/0) rules on MongoDB Atlas temporarily files.
                  </p>
                </div>
              )}

              {!queryLoading && !queryError && !queryResult && (
                <div className="flex-1 flex flex-col justify-center items-center h-64 text-white/15 text-center p-6 border border-dashed border-white/5 rounded-xl">
                  <Terminal className="w-12 h-12 mb-4 text-white/5" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider">Awaiting Execution Input</p>
                  <p className="text-[10px] max-w-xs text-white/30 italic font-serif leading-relaxed mt-2">
                    Enter your collection variables on the left pane and query results will stream here safely.
                  </p>
                </div>
              )}

              {queryResult && (
                <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 overflow-auto max-h-[380px] font-mono text-xs">
                  {queryResult.length === 0 ? (
                    <div className="text-white/40 italic text-center py-12">Successful connection, but collection query returned 0 documents match.</div>
                  ) : (
                    <pre className="text-green-400/90 whitespace-pre-wrap">{JSON.stringify(queryResult, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "mcp" && (
        <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold">NaviGuard Model Context Protocol (MCP) Server</h3>
          </div>
          
          <div className="space-y-4 text-sm text-white/60 leading-relaxed">
            <p>
              NaviGuard implements an automated **Model Context Protocol (MCP)** server architecture in `src/lib/mcpServer.ts`.
              MCP standardizes communication between Large Language Models (the client) and target secure infrastructure (databases, code, servers).
            </p>
            <p>
              By spinning up the NaviGuard MCP Server over **Standard I/O (stdio)** transport, you can plug this server as a custom tool definition
              directly inside any modern AI platform. This allows AI models to safely run the following operations:
            </p>

            <ul className="list-disc list-inside bg-white/5 rounded-xl p-6 font-mono text-xs text-white/80 space-y-3 border border-white/5">
              <li>
                <strong className="text-blue-400">list_databases</strong> - Auto-scans and lists all databases available in the MongoDB Atlas instance.
              </li>
              <li>
                <strong className="text-blue-400">query_db_collection</strong> - Allows the AI to query specific records, collections, and run filters dynamically up to 100 entries.
              </li>
            </ul>

            <h4 className="font-bold text-white uppercase tracking-widest font-mono text-xs pt-4">Server Architecture Execution Snippet:</h4>
            
            <div className="bg-[#141517] rounded-xl border border-white/5 p-4 font-mono text-xs text-white/50 space-y-2">
              <div><span className="text-blue-400">import</span> {"{ Server }"} <span className="text-blue-400">from</span> <span className="text-green-400">"@modelcontextprotocol/sdk/server/index.js"</span>;</div>
              <div><span className="text-blue-400">import</span> {"{ StdioServerTransport }"} <span className="text-blue-400">from</span> <span className="text-green-400">"@modelcontextprotocol/sdk/server/stdio.js"</span>;</div>
              <div className="pt-2 text-white/20">// Start transport connection securely over stdio</div>
              <div><span className="text-blue-400">const</span> transport = <span className="text-blue-400">new</span> StdioServerTransport();</div>
              <div><span className="text-blue-400">await</span> server.connect(transport);</div>
              <div className="text-green-400 font-bold">// Console info logged to stderr so it does not conflict with tool outputs</div>
              <div className="text-white/80">console.error("NaviGuard MCP secure database server started successfully.");</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-wider font-mono",
        active ? "bg-blue-600 text-white shadow-md" : "text-white/40 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function DatabaseCard({ title, subtitle, result, testing }: { title: string, subtitle: string, result?: ConnectionResult, testing: boolean }) {
  return (
    <div className="bg-[#141517] border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold font-mono tracking-widest text-white">{title}</h4>
          <span className="text-[10px] text-white/30 uppercase font-mono block">{subtitle}</span>
        </div>
        
        {testing ? (
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
        ) : result?.success ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 uppercase font-mono">
            <CheckCircle2 className="w-4 h-4" /> Connected
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase font-mono">
            <AlertTriangle className="w-4 h-4" /> Blocked
          </div>
        )}
      </div>

      <div className="font-mono text-[9px] bg-black/30 p-2.5 rounded-lg border border-white/5 break-all text-white/40">
        {result?.uriMasked || "mongodb://atlas-sql-******"}
      </div>

      {!testing && result && (
        <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
          {result.success ? (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-white/30 tracking-widest block">Databases Available:</span>
              <div className="flex flex-wrap gap-1">
                {result.databases?.map((db, idx) => (
                  <span key={idx} className="bg-green-500/10 text-green-400 text-[9px] px-2 py-0.5 rounded font-mono">
                    {db}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider font-mono">
                Error Root Cause: {result.errorType}
              </div>
              <p className="text-white/50 leading-relaxed font-mono text-[10px]">
                {result.diagnosis}
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-[10px] text-yellow-400/90 leading-relaxed font-mono">
                <strong>Suggested Fix:</strong> {result.fix}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

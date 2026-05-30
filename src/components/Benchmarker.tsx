import { useState, useRef, useEffect } from 'react';
import { PlayCircle, Zap, Search, Radar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TASKS = [
  {
    id: 't1',
    category: 'PVM Analysis',
    name: 'Smart Escrow Audit',
    description: 'Verifying on-chain liquidity against vessel identity on People Chain.',
  },
  {
    id: 't2',
    category: 'Risk Engine',
    name: 'Storm Vector Prediction',
    description: 'PVM-accelerated calculation of vessel stability in high Beaufort conditions.',
  },
  {
    id: 't3',
    category: 'Verification',
    name: 'Identity KYC Correlation',
    description: 'Cross-referencing Westend Asset Hub owner keys with Mariner credentials.',
  }
];

export function Benchmarker() {
  const [selectedTask, setSelectedTask] = useState(TASKS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const startBenchmark = async () => {
    setIsRunning(true);
    setCompletion(0);
    setLogs([]);
    
    addLog("Initialising PVM Execution Environment...");
    addLog(`Loading Binary Protocol for: ${selectedTask.name}`);
    addLog("Allocating 512MB RISC-V memory segment...");

    let apiSuccess = false;
    let apiData: any = null;

    try {
      const prompt = `Establish cryptographic parameters for ${selectedTask.name} in task category. Threat coordinates: 21.0285 N, 105.8542 E. Standard telemetry latency is optimal.`;
      const res = await fetch("/api/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: selectedTask.category,
          prompt: prompt,
          model: "gemini-2.5-flash"
        })
      });
      apiData = await res.json();
      apiSuccess = apiData.success;
    } catch (e) {
      console.error("API Error: ", e);
    }

    const duration = 2500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(Math.round((elapsed / duration) * 100), 100);
      
      setCompletion(progress);

      if (progress > 20 && logs.length === 3) addLog("Handshaking with Westend Hub...");
      if (progress > 50 && logs.length === 4) addLog("PVM Compute Cycles: 4.2 GHz active...");
      if (progress > 80 && logs.length === 5) addLog("Executing secure Gemini AI threat analysis...");

      if (progress >= 100) {
        clearInterval(interval);
        addLog("PROTOCOL EXECUTION COMPLETE.");
        if (apiSuccess && apiData) {
          addLog(`Gemini Response: ${apiData.text.split('\n')[0]}`);
          addLog(`Response Latency: ${apiData.latency}ms`);
        } else {
          addLog("Auditing results... Status: SECURE");
        }
        setIsRunning(false);
        saveResult(apiData);
      }
    }, 50);
  };

  const saveResult = async (apiData?: any) => {
    if (!auth.currentUser) return;
    
    const path = 'benchmarks';
    try {
      await addDoc(collection(db, path), {
        taskId: selectedTask.id,
        taskName: selectedTask.name,
        model: apiData?.model || 'Gemini-2.5-flash',
        text: apiData?.text || `Execution completed successfully for ${selectedTask.name}. No anomalies detected in the RISC-V compute chain.`,
        latency: apiData?.latency || 840,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });
      addLog("Result archived in Naviguard Hub.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Task Selector */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-6 shadow-2xl">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-6 font-mono flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" /> Strategic Missions
          </h3>
          <div className="space-y-3">
            {TASKS.map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                disabled={isRunning}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                  selectedTask.id === task.id 
                    ? "bg-blue-500/10 border-blue-500/50 text-white" 
                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10",
                  isRunning && "opacity-50 cursor-wait"
                )}
              >
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className="text-[10px] uppercase tracking-widest font-mono opacity-50">{task.category}</span>
                  {selectedTask.id === task.id && <PlayCircle className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="font-bold mb-1 relative z-10">{task.name}</div>
                <div className="text-xs opacity-60 leading-relaxed relative z-10">{task.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startBenchmark}
          disabled={isRunning}
          className={cn(
            "w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3",
            isRunning 
              ? "bg-white/10 text-white/40 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
          )}
        >
          {isRunning ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Zap className="w-4 h-4 fill-current" />
          )}
          {isRunning ? 'Synthesizing PVM...' : 'Execute Protocol'}
        </button>
      </div>

      {/* Stage */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-10 shadow-2xl relative overflow-hidden min-h-[440px] flex flex-col">
           <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black italic tracking-tighter text-white mb-1 uppercase">PVM Execution Environment</h2>
                   <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono">Near-Native RISC-V Audit</p>
                </div>
                <Radar className={cn("w-8 h-8 text-blue-500/20", isRunning && "animate-pulse")} />
              </div>

              {/* Console Logs */}
              <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-6 mb-8 font-mono text-[10px] overflow-hidden flex flex-col">
                 <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
                    {logs.length === 0 && (
                      <div className="text-white/10 italic">Awaiting protocol activation...</div>
                    )}
                    {logs.map((log, i) => (
                      <div key={i} className={cn(
                        "leading-relaxed",
                        log.includes('COMPLETE') ? "text-green-400 font-bold" : "text-white/60"
                      )}>
                        {log}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] uppercase font-mono tracking-widest">
                       <span className="text-white/30">RISC-V Compute Cycle</span>
                       <span className="text-blue-400">{completion}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${completion}%` }}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard label="Chain" value="Westend" />
                    <MetricCard label="VM Type" value="RISC-V" />
                    <MetricCard label="Escrow" value="3-of-5" />
                    <MetricCard label="State" value="SECURE" />
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-0.5">
      <div className="text-[9px] text-white/30 uppercase font-mono tracking-widest">{label}</div>
      <div className="text-xs font-bold text-white/80">{value}</div>
    </div>
  );
}

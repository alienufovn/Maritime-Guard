import { useState } from 'react';
import { PlayCircle, Zap, Search, Radar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

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

  const startBenchmark = () => {
    setIsRunning(true);
    setCompletion(0);
    const interval = setInterval(() => {
      setCompletion(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Task Selector */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-6 shadow-2xl">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-6 font-mono flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" /> Core Protocols
          </h3>
          <div className="space-y-3">
            {TASKS.map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all duration-200 group relative overflow-hidden",
                  selectedTask.id === task.id 
                    ? "bg-blue-500/10 border-blue-500/50 text-white" 
                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
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
        <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-10 shadow-2xl relative overflow-hidden min-h-[440px]">
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div>
                   <h2 className="text-3xl font-black italic tracking-tighter text-white mb-2 uppercase">Execution Environment</h2>
                   <p className="text-white/40 text-sm italic font-serif">PolkaVM Near-Native Performance Audit</p>
                </div>
                <Radar className="w-10 h-10 text-blue-500/20" />
              </div>

              <div className="space-y-12">
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

                 <div className="grid grid-cols-2 gap-6">
                    <MetricCard label="Chain ID" value="Westend-AH" />
                    <MetricCard label="VM Type" value="RISC-V (PVM)" />
                    <MetricCard label="Escrow Multi-Sig" value="3-of-5" />
                    <MetricCard label="Audit State" value="TRUSTLESS" />
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
    <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-1">
      <div className="text-[10px] text-white/30 uppercase font-mono tracking-widest">{label}</div>
      <div className="text-lg font-bold text-white/80">{value}</div>
    </div>
  );
}

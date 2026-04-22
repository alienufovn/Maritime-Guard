import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import { ethers } from 'ethers';

interface RiskEvent {
  id: string;
  vessel: string;
  score: number;
  timestamp: string;
  txHash: string;
}

const LiveEventLog = ({ contractAddress }: { contractAddress: string }) => {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupListener = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const abi = ["event RiskScoreUpdated(address indexed vessel, uint32 score)"];
      const contract = new ethers.Contract(contractAddress, abi, provider);

      console.log("📡 Listening for RiskScoreUpdated events...");

      contract.on("RiskScoreUpdated", (vessel, score, event) => {
        const newEvent: RiskEvent = {
          id: event.log.transactionHash + event.log.index,
          vessel: vessel,
          score: Number(score),
          timestamp: new Date().toLocaleTimeString(),
          txHash: event.log.transactionHash,
        };

        setEvents((prev) => [newEvent, ...prev].slice(0, 10)); // Keep last 10
      });
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, [], provider);
        contract.removeAllListeners("RiskScoreUpdated");
      }
    };
  }, [contractAddress]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
      {/* Terminal Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-blue-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">On-Chain Event Log</h2>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-grow overflow-y-auto p-4 font-mono text-xs space-y-3" ref={scrollRef}>
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 italic">
            <Clock size={24} className="animate-pulse" />
            <p>Awaiting PVM events from Asset Hub...</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                {event.score > 70 ? (
                  <ShieldAlert className="text-red-400 shrink-0" size={16} />
                ) : (
                  <ShieldCheck className="text-green-400 shrink-0" size={16} />
                )}
                
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-400 font-bold">EVENT_RISK_UPDATE</span>
                    <span className="text-slate-500">{event.timestamp}</span>
                  </div>
                  <p className="text-slate-300 mb-1">
                    Vessel: <span className="text-slate-400">{event.vessel.slice(0, 12)}...</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">SCORE:</span>
                    <span className={`font-bold ${event.score > 70 ? 'text-red-400' : 'text-green-400'}`}>
                      {event.score} / 100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveEventLog;
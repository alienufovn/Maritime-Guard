import React from 'react';
import { Activity, Zap } from 'lucide-react';

interface ModeToggleProps {
  isSimulated: boolean;
  onToggle: (val: boolean) => void;
}

const ModeToggle = ({ isSimulated, onToggle }: ModeToggleProps) => {
  return (
    <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-full border border-slate-700 shadow-inner">
      <button
        onClick={() => onToggle(false)}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          !isSimulated 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Activity size={14} />
        LIVE NETWORK
      </button>

      <button
        onClick={() => onToggle(true)}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          isSimulated 
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Zap size={14} />
        SIMULATION
      </button>
    </div>
  );
};

export default ModeToggle;
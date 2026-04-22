import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Activity, 
  Database, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from 'lucide-react';

interface HealthStatus {
  service: string;
  status: 'loading' | 'online' | 'offline';
  message: string;
  icon: React.ReactNode;
}

const HealthDashboard = ({ contractAddress }: { contractAddress: string }) => {
  const [statuses, setStatuses] = useState<HealthStatus[]>([
    { service: 'Asset Hub RPC', status: 'loading', message: 'Connecting...', icon: <Globe size={20} /> },
    { service: 'PVM Contract', status: 'loading', message: 'Verifying Bytecode...', icon: <Cpu size={20} /> },
    { service: 'Analytics API', status: 'loading', message: 'Checking MongoDB...', icon: <Database size={20} /> },
  ]);

  useEffect(() => {
    checkSystemHealth();
  }, [contractAddress]);

  const checkSystemHealth = async () => {
    const newStatuses = [...statuses];

    // 1. Check RPC & Network
    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
      const network = await provider.getNetwork();
      newStatuses[0] = { ...newStatuses[0], status: 'online', message: `Connected to Chain ${network.chainId}` };
      
      // 2. Check PVM Contract Reachability
      const code = await provider.getCode(contractAddress);
      if (code !== '0x' && code !== '0x0') {
        newStatuses[1] = { ...newStatuses[1], status: 'online', message: 'PVM Binary Active' };
      } else {
        newStatuses[1] = { ...newStatuses[1], status: 'offline', message: 'Contract Not Found' };
      }
    } catch (e) {
      newStatuses[0] = { ...newStatuses[0], status: 'offline', message: 'RPC Connection Failed' };
      newStatuses[1] = { ...newStatuses[1], status: 'offline', message: 'Awaiting Network' };
    }

    // 3. Check Backend API (MongoDB Proxy)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);
      if (response.ok) {
        newStatuses[2] = { ...newStatuses[2], status: 'online', message: 'Atlas Search Operational' };
      } else {
        newStatuses[2] = { ...newStatuses[2], status: 'offline', message: 'API Service Error' };
      }
    } catch (e) {
      newStatuses[2] = { ...newStatuses[2], status: 'offline', message: 'Backend Unreachable' };
    }

    setStatuses(newStatuses);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
        <Activity className="text-blue-400" size={24} />
        <h2 className="text-xl font-bold">System Integrity</h2>
      </div>

      <div className="space-y-4">
        {statuses.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className={`${
                s.status === 'online' ? 'text-green-400' : s.status === 'offline' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {s.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{s.service}</p>
                <p className="text-xs text-slate-500">{s.message}</p>
              </div>
            </div>

            {s.status === 'loading' ? (
              <Loader2 className="animate-spin text-slate-600" size={18} />
            ) : s.status === 'online' ? (
              <CheckCircle2 className="text-green-500" size={18} />
            ) : (
              <XCircle className="text-red-500" size={18} />
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          setStatuses(statuses.map(s => ({ ...s, status: 'loading' })));
          checkSystemHealth();
        }}
        className="w-full mt-6 py-2 text-xs font-medium text-slate-400 hover:text-white transition uppercase tracking-widest"
      >
        Re-verify Systems
      </button>
    </div>
  );
};

export default HealthDashboard;
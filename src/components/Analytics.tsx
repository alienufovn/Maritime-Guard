import React, { useEffect, useState } from 'react';
import { 
  Activity, TrendingUp, Shield, 
  AlertTriangle, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';

export function Analytics() {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // Admins can see everything, but for common users we enforce the query filter
    // to satisfy the security rules' Query Enforcer pattern.
    const isAdmin = auth.currentUser.email === 'bui.anh.kiet.29.04.1975@gmail.com';
    
    let q;
    if (isAdmin) {
      q = query(
        collection(db, 'benchmarks'), 
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
    } else {
      q = query(
        collection(db, 'benchmarks'), 
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timeStr: doc.data().timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''
      })).reverse();
      setBenchmarks(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'benchmarks');
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    { label: "Security Uptime", value: "99.98%", icon: <Shield className="text-green-400" /> },
    { label: "Avg PVM Latency", value: "842ms", icon: <Clock className="text-blue-400" /> },
    { label: "Anomalies Caught", value: "0", icon: <AlertTriangle className="text-yellow-400" /> },
    { label: "Protocol Integrity", value: "Verified", icon: <CheckCircle2 className="text-blue-500" /> }
  ];

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Activity className="w-10 h-10 text-blue-500 animate-spin" />
          <span className="text-xs uppercase font-mono tracking-widest text-white/40">Syncing Intelligence...</span>
       </div>
     );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1a1c1e] border border-white/5 rounded-2xl p-6 shadow-xl">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg">{stat.icon}</div>
                <TrendingUp className="w-3 h-3 text-white/10" />
             </div>
             <div className="text-[10px] uppercase font-mono tracking-widest text-white/30 mb-1">{stat.label}</div>
             <div className="text-2xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Execution Latency (PVM Cycles)">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={benchmarks}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="timeStr" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141517', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
           </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Intelligence Accuracy index">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="timeStr" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141517', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="latency" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.6} />
              </BarChart>
           </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <div className="bg-[#1a1c1e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest font-mono flex items-center gap-2">
               <Zap className="w-4 h-4 text-blue-500" /> Recent Audit Logs
            </h3>
            <span className="text-[10px] text-white/20 font-mono">Live Delta Feed</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-white/40">
               <thead>
                  <tr className="bg-white/5">
                     <th className="p-4 uppercase tracking-widest">Protocol</th>
                     <th className="p-4 uppercase tracking-widest">Model</th>
                     <th className="p-4 uppercase tracking-widest">Timestamp</th>
                     <th className="p-4 uppercase tracking-widest">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {benchmarks.slice(0, 5).map((b, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                       <td className="p-4 text-white/80 font-bold">{b.taskName}</td>
                       <td className="p-4">{b.model}</td>
                       <td className="p-4">{b.timeStr}</td>
                       <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">STABLE</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1c1e] border border-white/5 rounded-2xl p-8 shadow-2xl space-y-6">
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest font-mono">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

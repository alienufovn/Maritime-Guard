import React, { useState, useEffect } from 'react';
import { 
  Shield, Radar, BarChart3, Upload, Compass, 
  Globe, Info, ExternalLink, MessageSquare, 
  Activity, Anchor, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Benchmarker } from './components/Benchmarker';
import { MetricChart } from './components/MetricCharts';
import { DatasetUploader } from './components/DatasetUpload';
import { FeedbackForm } from './components/FeedbackForm';
import { Analytics } from './components/Analytics';
import { HackathonDocs } from './components/HackathonDocs';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

type Page = 'dashboard' | 'benchmark' | 'datasets' | 'analytics' | 'feedback' | 'docs';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Mock data for analytics
  const performanceData = [
    { name: 'Gemini-3 Flash', value: 94 },
    { name: 'Gemini-3.1 Pro', value: 98 },
    { name: 'Llama-3-70b', value: 89 },
    { name: 'GPT-4o', value: 96 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c0e] text-white">
      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "bg-[#0f1113] border-r border-white/5 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight uppercase">Naviguard</span>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem 
            icon={<Radar />} 
            label="Security Hub" 
            active={activePage === 'dashboard'} 
            onClick={() => setActivePage('dashboard')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Compass />} 
            label="PVM Benchmark" 
            active={activePage === 'benchmark'} 
            onClick={() => setActivePage('benchmark')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Upload />} 
            label="Data Ingestion" 
            active={activePage === 'datasets'} 
            onClick={() => setActivePage('datasets')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<BarChart3 />} 
            label="Analytics" 
            active={activePage === 'analytics'} 
            onClick={() => setActivePage('analytics')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<MessageSquare />} 
            label="Feedback" 
            active={activePage === 'feedback'} 
            onClick={() => setActivePage('feedback')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
           {isSidebarOpen && (
             <div className="p-3 bg-white/5 rounded-lg border border-white/5 mb-4">
                <div className="text-[10px] text-white/30 uppercase font-mono tracking-widest mb-1">Developer</div>
                <div className="text-xs text-blue-400 font-mono">Bui Anh Kiet</div>
             </div>
           )}
          <NavItem 
            icon={<Info />} 
            label="Hackathon Docs" 
            active={activePage === 'docs'}
            onClick={() => setActivePage('docs')}
            collapsed={!isSidebarOpen}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0c0e]/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            >
              <Activity className="w-5 h-5 " />
            </button>
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30">System Partition</span>
              <span className="text-sm font-medium text-white/80 uppercase tracking-widest">{activePage}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <a 
              href="https://navisea.base44.app" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors group"
            >
              <Globe className="w-4 h-4" />
              <span>Navisea Network</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            
            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
               {!user ? (
                 <button 
                    onClick={login}
                    className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase flex items-center gap-2 transition-all"
                 >
                   <Shield size={14} /> Protocol Login
                 </button>
               ) : (
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-mono text-white/60 tracking-wider">
                          {user.email?.split('@')[0]}
                        </span>
                    </div>
                    <button 
                      onClick={logout}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                      title="Terminate Session"
                    >
                      <LogOut size={14} />
                    </button>
                 </div>
               )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="p-8 max-w-7xl mx-auto w-full">
           {activePage === 'dashboard' && (
             <div className="space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight mb-2 italic">NAVI<span className="text-blue-500">GUARD</span></h1>
                        <p className="text-white/40 text-lg italic font-serif">PVM Risk Protocol & Escrow Governance.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="PVM Risk Index" value="LOW" color="text-green-400" />
                    <StatCard label="Escrow Liquidity" value="$1.2M" trend="+4%" />
                    <StatCard label="PVM Execution" value="840ms" trend="-20ms" />
                    <StatCard label="Maritime Nodes" value="48 Active" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-8 relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-blue-600/10 border border-blue-600/20 px-3 py-1 rounded-full text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Live Link</div>
                        <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-8 font-mono flex items-center gap-2">
                            <Anchor className="w-4 h-4" /> Vessel Protocol Status
                        </h3>
                        <div className="space-y-4">
                            <SummaryLine label="Accuracy" value="98.2%" percent={98.2} />
                            <SummaryLine label="Safety Compliance" value="Verified" percent={100} />
                            <SummaryLine label="PVM Response" value="Optimal" percent={88} />
                        </div>
                    </div>
                    <MetricChart data={performanceData} title="Intelligence Index (LLM Comparative)" type="bar" />
                </div>
             </div>
           )}

           {activePage === 'benchmark' && <Benchmarker />}
           {activePage === 'datasets' && <DatasetUploader onUpload={(data) => console.log(data)} />}
           {activePage === 'analytics' && <Analytics />}
           {activePage === 'feedback' && <FeedbackForm />}
           {activePage === 'docs' && <HackathonDocs />}
        </div>

        {/* Global Footer Meta */}
        <footer className="mt-auto p-8 flex justify-between border-t border-white/5 bg-[#0a0c0e]">
          <div className="text-[10px] text-white/20 font-mono tracking-[0.3em] uppercase">
             Naviguard // Hackathon Dev: Bui Anh Kiet // +84345973017
          </div>
          <div className="flex gap-4 text-[10px] text-white/40 font-mono">
            <span>Lat: 21.0285</span>
            <span>Long: 105.8542</span>
            <div className="flex items-center gap-1 text-green-500">
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
               <span>SYSTEM SECURE</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: any, label: string, active?: boolean, onClick: () => void, collapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 transition-all duration-200 group rounded-xl",
        collapsed ? "px-2 py-4 justify-center" : "px-4 py-4",
        active 
          ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
          : "text-white/40 hover:bg-white/5 hover:text-white"
      )}
    >
      <div className={cn("shrink-0 transition-transform group-hover:scale-110", active && "text-white")}>
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
      {!collapsed && <span className="font-medium tracking-wide text-sm">{label}</span>}
      {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />}
    </button>
  );
}

function StatCard({ label, value, trend, color }: { label: string, value: string, trend?: string, color?: string }) {
  return (
    <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="relative z-10">
        <span className="text-[10px] uppercase font-mono tracking-widest text-white/30 block mb-4">{label}</span>
        <div className={cn("text-3xl font-black tracking-tight mb-2", color || "text-white")}>{value}</div>
        {trend && (
           <div className={cn("text-[10px] font-mono", trend.startsWith('+') ? 'text-green-400' : 'text-blue-400')}>
             {trend}
           </div>
        )}
      </div>
    </div>
  );
}

function SummaryLine({ label, value, percent }: { label: string, value: string, percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs items-baseline">
        <span className="uppercase tracking-widest text-white/40 font-mono">{label}</span>
        <span className="font-bold text-white tracking-widest">{value}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500/50" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

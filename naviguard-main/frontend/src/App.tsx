import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { NaviGuardContract } from './utils/contract-helper';
import { 
  ShieldCheck, 
  Anchor, 
  Activity, 
  Wallet, 
  Zap 
} from 'lucide-react';
import TelemetryChart from './components/TelemetryChart';
import { triggerMockRiskEvent } from './utils/mockAisGenerator';
import ModeToggle from './components/ModeToggle';
import { runOneClickDemo } from './utils/demoScript';

const CONTRACT_ADDRESS = "0xYour_Deployed_Contract_Address";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<NaviGuardContract | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [vesselData, setVesselData] = useState<any[]>([]);

  // 1. Connect Wallet Logic
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        const naviGuard = new NaviGuardContract(CONTRACT_ADDRESS, signer);
        
        setAccount(accounts[0]);
        setContract(naviGuard);
        
        // Fetch initial data
        const score = await naviGuard.getVesselScore(accounts[0]);
        setLatestScore(score);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install a Polkadot-compatible EVM wallet like Talisman or MetaMask.");
    }
  };

  // 2. Trigger PVM Risk Analysis
  const runRiskAnalysis = async () => {
    if (isSimulated) {
      setIsAnalyzing(true);
      const userAddress = account || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      
      triggerMockRiskEvent(userAddress, (payload) => {
        const { aisData, eventPayload } = payload;
        
        // Simplified PVM scoring algorithm
        const mockScore = Math.min(100, Math.floor((aisData.windSpeed * 1.5) + (aisData.waveHeight * 10)));
        
        setLatestScore(mockScore);
        const newTelemetryEntry = {
          ...aisData,
          risk: mockScore,
          time: new Date().toLocaleTimeString(),
          wind: aisData.windSpeed,
          wave: aisData.waveHeight
        };
        
        setVesselData(prev => [newTelemetryEntry, ...prev]);
        setIsAnalyzing(false);
      });
      return;
    }

    if (!contract) return;
    
    setIsAnalyzing(true);
    try {
      const mockTelemetry = "0x4e61766947756172645f54657374"; 
      await contract.submitRiskAnalysis(mockTelemetry);
      const newScore = await contract.getVesselScore(account!);
      setLatestScore(newScore);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Demo shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        runOneClickDemo(
          setIsSimulated, 
          () => {}, // setEvents placeholder
          setVesselData, 
          account || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [account]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-slate-700 pb-6">
        <div className="flex items-center gap-3">
          <Anchor className="text-blue-400 w-10 h-10" />
          <h1 className="text-3xl font-bold tracking-tight">NaviGuard <span className="text-blue-500">PVM</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <ModeToggle isSimulated={isSimulated} onToggle={setIsSimulated} />
          {!account ? (
            <button 
              onClick={connectWallet}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold transition"
            >
              <Wallet size={20} /> Connect Wallet
            </button>
          ) : (
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-slate-300">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          )}
        </div>
      </header>

      {isSimulated && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/50 p-3 rounded-xl flex items-center gap-3 text-amber-500 text-sm">
          <Zap size={16} />
          <span><strong>Simulation Mode Active:</strong> UI is mirroring PVM logic locally for demonstration purposes.</span>
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-slate-400">
            <ShieldCheck size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest">Protocol Status</h2>
          </div>
          
          <div className="text-center py-8">
            <p className="text-slate-400 mb-2">Latest PVM Risk Score</p>
            <h3 className={`text-6xl font-black ${latestScore && latestScore > 70 ? 'text-red-400' : 'text-green-400'}`}>
              {latestScore ?? '--'}
            </h3>
          </div>

          <button
            disabled={(!account && !isSimulated) || isAnalyzing}
            onClick={runRiskAnalysis}
            className="w-full mt-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition"
          >
            {isAnalyzing ? (
              <Activity className="animate-spin" />
            ) : (
              isSimulated ? "Simulate PVM Risk" : "Compute On-Chain Risk"
            )}
          </button>
        </div>

        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 h-[400px] flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Activity size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest">Live Telemetry & Risk Correlation</h2>
          </div>

          <div className="flex-grow">
            <TelemetryChart data={vesselData} />
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>Built for Polkadot Hub • Powered by Rust PVM & Asset Hub</p>
      </footer>
    </div>
  );
}

export default App;

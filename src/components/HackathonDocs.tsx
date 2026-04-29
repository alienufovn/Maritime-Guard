import React from 'react';
import { 
  Cpu, Globe, Link2, 
  Zap, Anchor,
  ExternalLink, Mail, Phone
} from 'lucide-react';

export function HackathonDocs() {
  const developerInfo = {
    name: "Bui Anh Kiet",
    email: "bui.anh.kiet.29.04.1975@gmail.com",
    websites: [
      { name: "Jimdo Portfolio", url: "https://haveholyspirits.jimdofree.com" },
      { name: "Navisea Network", url: "https://navisea.base44.app" }
    ],
    mobile: "+84345973017"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-widest">
           Hackathon Examination // April 2026
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          Naviguard <span className="text-blue-500">Protocol</span>
        </h1>
        <p className="text-lg text-white/40 font-serif max-w-2xl mx-auto italic">
          "Ensuring maritime security through PolkaVM-accelerated intelligence and trustless escrow governance."
        </p>
      </section>

      {/* Tech Stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TechCard 
          icon={<Cpu />} 
          title="PolkaVM (PVM)" 
          desc="RISC-V based execution environment for near-native performance on maritime risk calculations." 
        />
        <TechCard 
          icon={<Zap />} 
          title="Gemini 3.1 Pro" 
          desc="Advanced reasoning for threat assessment and anomaly detection in maritime traffic." 
        />
        <TechCard 
          icon={<Globe />} 
          title="Westend Hub" 
          desc="Leveraging Polkadot Asset Hub for secure vessel credentialing and escrow liquidity." 
        />
      </div>

      {/* Main Content */}
      <div className="space-y-10">
        <Section title="Project Architecture">
          <p className="text-white/60 leading-relaxed">
            Naviguard is designed as a counter-terrorism and maritime security overlay for the Navisea network. 
            It utilizes <strong>PolkaVM (PVM)</strong> to perform heavy computations (like storm vector prediction 
            and route optimization) directly on-chain or in trustless environments. By benchmarking Large 
            Language Models (LLMs) like Gemini, Naviguard identifies the most accurate "Neural Advisors" 
            for live security feeds.
          </p>
        </Section>

        <Section title="PVM Implementation">
          <div className="bg-[#141517] border border-white/5 rounded-xl p-6 font-mono text-xs space-y-3">
            <div className="text-blue-400">// PolkaVM Initialization snippet</div>
            <div className="text-white/40 italic"># loading RISC-V maritime binary...</div>
            <div className="text-white/80">pvm_execute(PROGRAM_HASH, INPUT_BUFFER) {"->"} Result</div>
            <div className="text-green-500/60 transition-pulse">SUCCESS: Execution stabilized in 840ms</div>
          </div>
          <p className="text-white/40 text-sm italic mt-4">
            The PVM environment ensures that risk audits are deterministic and can be verified by any validator in the Polkadot ecosystem.
          </p>
        </Section>

        <Section title="Developer Metadata">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl">
                    BK
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{developerInfo.name}</h4>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-mono">Lead Developer & Architect</p>
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{developerInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{developerInfo.mobile}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/30">Official Ecosystems</h5>
                <div className="space-y-3">
                  {developerInfo.websites.map((site, i) => (
                    <a 
                      key={i}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Link2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">{site.name}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/10 group-hover:text-blue-400" />
                    </a>
                  ))}
                </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Footer Docs */}
      <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-6">
         <Anchor className="w-12 h-12 text-white/10 animate-float" />
         <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-white/20">
              Naviguard // Verification Complete // Hackathon 2026
            </p>
         </div>
      </div>
    </div>
  );
}

function TechCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-[#1a1c1e] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group">
      <div className="p-3 bg-white/5 rounded-xl w-fit mb-4 group-hover:bg-blue-600/10 transition-colors">
        {React.cloneElement(icon, { className: "w-6 h-6 text-blue-500" })}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xs uppercase tracking-[0.3em] font-mono text-white/40 whitespace-nowrap">{title}</h2>
        <div className="h-[1px] w-full bg-white/5" />
      </div>
      {children}
    </div>
  );
}

import { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';

interface DatasetUploaderProps {
  onUpload: (data: any[]) => void;
}

export function DatasetUploader({ onUpload }: DatasetUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [filename, setFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setFilename(file.name);
    setStatus('parsing');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        setStatus('success');
        onUpload(results.data);
      },
      error: (err: Error) => {
        console.error("Parse error:", err);
        setStatus('error');
      }
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-12 shadow-2xl text-center max-w-2xl mx-auto">
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-10 font-mono">
        Strategic Dataset Ingestion
      </h3>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-2xl p-20 transition-all duration-300 flex flex-col items-center justify-center",
          isDragging ? "border-blue-500 bg-blue-500/5 rotate-1" : "border-white/10 hover:border-white/20 hover:bg-white/5"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv,.json"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        
        <div className="p-6 bg-white/5 rounded-full mb-6 group-hover:scale-110 transition-transform">
          <Upload className="w-10 h-10 text-white/40" />
        </div>
        
        <p className="text-xl font-bold text-white mb-3">
          {status === 'success' ? 'Dataset Secured' : 'Awaiting Manifest...'}
        </p>
        <p className="text-sm text-white/30 mb-8 max-w-xs mx-auto italic font-serif">
          Support for Westend Asset Hub telemetry and PVM execution logs (CSV/JSON)
        </p>

        {status === 'parsing' && (
          <div className="flex items-center gap-3 text-blue-400">
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
            <span className="text-xs uppercase tracking-[0.2em] font-mono">Decoding Stream...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono font-bold leading-none">{filename} Parsed</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Parse Integrity Failed</span>
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-mono text-white/20">
          <span>Escrow Compliance Audit</span>
          <span>Zero-Knowledge Proofs Capable</span>
        </div>
      </div>
    </div>
  );
}

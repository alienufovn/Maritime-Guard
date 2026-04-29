import React, { useState } from 'react';
import { Send, User, Mail, Globe, Phone, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const developerInfo = {
    name: "Bui Anh Kiet",
    email: "bui.anh.kiet.29.04.1975@gmail.com",
    websites: [
      { name: "Jimdo Portfolio", url: "https://haveholyspirits.jimdofree.com" },
      { name: "Navisea App", url: "https://navisea.base44.app" }
    ],
    mobile: "+84345973017"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const path = 'feedback';
    try {
      await addDoc(collection(db, path), {
        message: message.trim(),
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || null,
        userEmail: auth.currentUser?.email || null,
      });
      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#1a1c1e] border border-white/5 rounded-xl p-8 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Developer Info */}
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-6 font-mono flex items-center gap-2">
              <User className="w-4 h-4" /> Developer Profile
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
                  BK
                </div>
                <div>
                  <div className="text-xl font-bold">{developerInfo.name}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Lead Engineer</div>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-white/5">
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
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-4 font-mono">Ecosystem Links</h3>
            <div className="grid grid-cols-1 gap-3">
              {developerInfo.websites.map((site, i) => (
                <a 
                  key={i}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">{site.name}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-blue-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-6 font-mono">
             Naviguard Feedback
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-white/30 tracking-widest">Message Segment</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending || submitted}
                className="w-full bg-[#141517] border border-white/10 rounded-lg p-4 text-sm focus:border-blue-500 outline-none transition-all min-h-[160px] disabled:opacity-50"
                placeholder="Submit your tactical feedback or feature requests..."
              />
            </div>
            
            <button 
              type="submit"
              disabled={isSending || submitted || !message.trim()}
              className={cn(
                "w-full py-4 rounded-lg font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3",
                submitted ? "bg-green-600" : (isSending ? "bg-blue-600/50 cursor-wait" : "bg-blue-600 hover:bg-blue-500")
              )}
            >
              {submitted ? (
                <>Transmission Received</>
              ) : (
                <>
                  <Send className={cn("w-4 h-4", isSending && "animate-pulse")} />
                  {isSending ? 'Sending...' : 'Submit Protocol'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

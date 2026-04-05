'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Session {
  id: string; openedAt: string; closedAt?: string; openingCash: number; closingCash?: number;
  user: { name: string; email: string };
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openingCash, setOpeningCash] = useState('0');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  async function load() {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    const sessionsData = Array.isArray(data) ? data : [];
    setSessions(sessionsData);
    const open = sessionsData.find((s: Session) => !s.closedAt);
    setActiveSession(open || null);
  }
  useEffect(() => { load(); }, []);

  async function openSession() {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ openingCash }) });
      const session = await res.json();
      if (!res.ok) { toast.error(session.error); return; }
      toast.success('Terminal Session Initialized');
      setActiveSession(session);
      router.push('/pos/floor');
    } catch { toast.error('Initialization Failure'); } finally { setLoading(false); }
  }

  async function closeSession() {
    if (!activeSession) return;
    const cash = prompt('Enter final reconciliation amount (INR):', '0');
    if (cash === null) return;
    await fetch(`/api/sessions/${activeSession.id}/close`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ closingCash: cash }) });
    toast.success('Session Terminated Successfully'); load();
  }

  const lastSession = sessions[0];

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-950 min-h-screen font-sans text-slate-200">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Terminal Command</h1>
          <p className="text-slate-500 font-medium italic">Synchronize your local register with the global vault.</p>
        </div>
        <div className="flex bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
          <div className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest border-r border-white/10">Node: ALPHA-7</div>
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-6">{activeSession ? 'Status: ONLINE' : 'Status: STANDBY'}</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Session status */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-[48px] p-10 border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-20" />
          
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl border border-primary/20">📡</span>
            Terminal Infrastructure
          </h2>
          
          {activeSession ? (
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full w-fit">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                <span className="text-primary font-black text-[10px] uppercase tracking-widest">Live Registry Session</span>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md rounded-[32px] p-8 border border-white/5 space-y-4 shadow-inner">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Established At</span>
                  <span className="text-white font-mono">{new Date(activeSession.openedAt).toLocaleTimeString()}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Authorized Agent</span>
                  <span className="text-white font-black">{activeSession.user.name}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Initial Liquidity</span>
                  <span className="text-primary font-mono font-black">₹{activeSession.openingCash}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  className="flex-1 bg-primary text-black font-black uppercase tracking-[0.2em] py-5 rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                  onClick={() => router.push('/pos/floor')}
                >
                  🚀 Activate Terminal
                </button>
                <button 
                  className="px-8 bg-rose-500/10 text-rose-500 font-black uppercase tracking-[0.1em] py-5 rounded-[24px] hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all text-[10px]"
                  onClick={closeSession}
                >
                  Terminate
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-full w-fit">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Protocol Stalled</span>
              </div>

              <AnimatePresence>
                {lastSession && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 text-sm border border-white/5"
                  >
                    <div className="text-slate-500 mb-4 font-black uppercase tracking-widest text-[8px] italic opacity-60">Historical Archive Check:</div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Last Terminal Exit</span>
                      <span className="text-white font-mono text-xs">{new Date(lastSession.closedAt!).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-400 text-xs">Final Liquidity</span>
                      <span className="text-white font-mono font-black">₹{lastSession.closingCash || 0}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Opening Hardware Liquidity (INR)</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-5 text-xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" 
                  type="number" 
                  value={openingCash} 
                  onChange={e => setOpeningCash(e.target.value)} 
                />
              </div>

              <button 
                className={`w-full py-6 rounded-[24px] font-black uppercase tracking-[0.4em] text-xs transition-all shadow-2xl ${loading ? 'bg-slate-800 text-slate-600' : 'bg-primary text-black shadow-primary/30 hover:scale-[1.02] animate-pulse-glow'}`}
                onClick={openSession} 
                disabled={loading}
              >
                {loading ? 'Initializing Core...' : 'Initialize Registry'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Sessions history */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-[48px] p-10 border border-white/10 shadow-2xl flex flex-col"
        >
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <span className="w-10 h-10 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center text-xl border border-white/10">📑</span>
            Session Ledger
          </h2>
          
          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
            {sessions.map((s, idx) => (
              <motion.div 
                key={s.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-[24px] p-5 border border-white/5 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-black uppercase tracking-tight text-sm">{s.user.name}</span>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${s.closedAt ? 'bg-slate-900 border-white/10 text-slate-500' : 'bg-primary/10 border-primary/20 text-primary animate-pulse'}`}>
                    {s.closedAt ? 'Terminated' : 'Active'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium font-mono group-hover:text-slate-400 transition-colors">{new Date(s.openedAt).toLocaleString()}</div>
              </motion.div>
            ))}
            {sessions.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 grayscale opacity-20">
                <span className="text-5xl mb-4">🗄️</span>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ledger is Vacant</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';
import { useRouter } from 'next/navigation';
import { useSelfOrder } from './layout';
import { motion } from 'framer-motion';

export default function SplashPage() {
  const { table, config, token } = useSelfOrder();
  const router = useRouter();

  if (!config) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-slate-400 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Experience...</p>
      </div>
    </div>
  );

  if (!config.selfOrderEnabled) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-sm w-full bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 text-center border border-slate-100">
        <div className="text-6xl mb-6">🚫</div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Service Paused</h2>
        <p className="text-slate-500 font-medium text-sm leading-relaxed">Digital ordering is temporarily unavailable. Please signal a staff member for assistance.</p>
        <button onClick={() => window.location.reload()} className="mt-8 text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline">Retry Connection</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-100 rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <div className="bg-white/40 backdrop-blur-3xl border border-white/50 p-12 rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-8 drop-shadow-2xl"
          >
            ☕
          </motion.div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Odoo POS Cafe</h1>
          
          {table && (
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full mb-8 shadow-xl shadow-indigo-600/20">
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Station {table.number} · {table.floor.name}</span>
            </div>
          )}

          <p className="text-slate-500 font-medium mb-12 leading-relaxed">Experience our curated selection of artisanal coffee and gourmet snacks directly from your seat.</p>

          <button
            onClick={() => router.push(`/s/${token}/menu`)}
            className="w-full bg-slate-900 text-white rounded-3xl py-6 text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Explore Menu
          </button>

          {config.selfOrderMode === 'QR_MENU' && (
            <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Digital Menu · Register Order at Counter</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Powered by Odoo POS Hub</div>
      </motion.div>
    </div>
  );
}

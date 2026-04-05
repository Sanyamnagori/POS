'use client';
import Link from 'next/link';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent font-sans relative z-10 flex flex-col">
      {/* Premium Top Bar */}
      <header className="bg-black/60 backdrop-blur-2xl border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-50 pointer-events-none"></div>
        <div className="flex items-center gap-8 relative z-10">
          <Link href="/" className="flex items-center gap-3 group transition-all active:scale-95">
            <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">☕</div>
            <span className="font-black text-white tracking-widest text-lg uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">POS Terminal</span>
          </Link>
          <nav className="flex items-center bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <Link href="/pos/floor" className="text-xs font-black px-5 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 uppercase tracking-widest">
              <span>🪑</span> Floor View
            </Link>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <Link href="/kitchen" className="text-xs font-black px-5 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 uppercase tracking-widest">
              <span>👨‍🍳</span> Kitchen
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={() => window.location.reload()} className="text-xs font-black px-4 py-2.5 rounded-xl text-primary-400 hover:text-primary hover:bg-primary/10 transition-all uppercase tracking-widest border border-transparent hover:border-primary/30 flex items-center gap-2">
            <span>↻</span> Sync
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <Link href="/admin" className="text-xs font-black px-5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest border border-white/5">Management</Link>
          <Link href="/customer-display" target="_blank" className="btn-secondary !text-xs !px-5 !py-2.5 uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-2">
            Display <span className="opacity-50">↗</span>
          </Link>
        </div>
      </header>
      <main className="animate-fade-in flex-1 relative z-10">{children}</main>
    </div>
  );
}

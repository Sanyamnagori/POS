'use client';
import Link from 'next/link';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Premium Top Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:shadow-indigo-500/10 transition-shadow">☕</div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">POS Terminal</span>
          </Link>
          <nav className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            <Link href="/pos/floor" className="text-sm font-bold px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2">
              🪑 Floor View
            </Link>
            <Link href="/kitchen" className="text-sm font-bold px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2">
              👨‍🍳 Kitchen
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()} className="text-xs font-bold px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">↻ Sync</button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <Link href="/admin" className="text-sm font-bold px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">Management</Link>
          <Link href="/customer-display" target="_blank" className="btn-secondary !text-xs !px-4 !py-2 border-slate-200 shadow-none hover:border-indigo-200 hover:bg-indigo-50/30">Display View ↗</Link>
        </div>
      </header>
      <main className="animate-fade-in">{children}</main>
    </div>
  );
}

'use client';
import Link from 'next/link';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-bold text-white text-sm">Odoo POS Cafe</span>
          </div>
          <nav className="flex gap-2">
            <Link href="/pos/floor" className="text-sm px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all">Tables</Link>
            <Link href="/kitchen" className="text-sm px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all">Kitchen</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.location.reload()} className="text-sm px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all">↻ Reload</button>
          <Link href="/backend" className="text-sm px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all">Backend</Link>
          <Link href="/customer-display" target="_blank" className="btn-secondary text-xs py-1.5">Customer Display ↗</Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

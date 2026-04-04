'use client';
import { useRouter } from 'next/navigation';
import { useSelfOrder } from './layout';

export default function SplashPage() {
  const { table, config, token } = useSelfOrder();
  const router = useRouter();

  if (!config) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400 text-center"><div className="text-4xl mb-3">⏳</div>Loading...</div>
    </div>
  );

  if (!config.selfOrderEnabled) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center"><div className="text-5xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-white">Self ordering is disabled</h2>
        <p className="text-slate-400 mt-2">Please ask staff for assistance</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15)_0%,transparent_70%)]" />
      <div className="relative text-center">
        <div className="text-8xl mb-6 animate-bounce">☕</div>
        <h1 className="text-4xl font-bold text-white mb-2">Odoo POS Cafe</h1>
        {table && <p className="text-sky-400 text-lg mb-2">Table {table.number} · {table.floor.name}</p>}
        <p className="text-slate-400 mb-10">Tap below to browse our menu</p>
        <button
          onClick={() => router.push(`/s/${token}/menu`)}
          className="btn-primary text-lg px-10 py-4 rounded-2xl pulse-glow"
        >
          🍽️ Order Here
        </button>
        {config.selfOrderMode === 'QR_MENU' && (
          <p className="text-xs text-slate-500 mt-4">View-only menu · Order at counter</p>
        )}
      </div>
    </div>
  );
}

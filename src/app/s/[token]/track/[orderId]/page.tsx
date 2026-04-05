'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  id: string; quantity: number; isPrepared: boolean; product: { name: string };
}
interface Order {
  id: string; status: string; total: number; createdAt: string; items: OrderItem[];
}

const STATUS_STEPS = ['DRAFT', 'SENT', 'PREPARING', 'READY', 'PAID'];
const STATUS_LABELS: Record<string, string> = { DRAFT: 'Transmitted', SENT: 'Queued', PREPARING: 'In Kitchen', READY: 'Ready', PAID: 'Settled' };
const STATUS_ICONS: Record<string, string> = { DRAFT: '📡', SENT: '📄', PREPARING: '🍳', READY: '✅', PAID: '💳' };

export default function TrackPage({ params }: { params: { token: string; orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  async function load() {
    const res = await fetch(`/api/orders/${params.orderId}`);
    if (res.ok) setOrder(await res.json());
  }
  useEffect(() => { load(); const i = setInterval(load, 3000); return () => clearInterval(i); }, []);

  if (!order) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-slate-400 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locating Transaction...</p>
      </div>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => router.push(`/s/${params.token}/menu`)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:text-indigo-600 transition-colors">←</button>
            <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Live Tracking</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref: #{order.id.slice(-6).toUpperCase()}</p>
            </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8 mt-4">
        {/* Progress Hub */}
        <div className="bg-white rounded-[48px] p-10 shadow-2xl shadow-slate-200/40 border border-slate-100">
          <div className="flex justify-between items-start mb-10 relative px-2">
            {STATUS_STEPS.filter(s => ['SENT', 'PREPARING', 'READY'].includes(s)).map((status, i) => {
              const step = STATUS_STEPS.indexOf(status);
              const isDone = currentStep >= step;
              const isCurrent = currentStep === step;
              return (
                <div key={status} className="flex-1 flex flex-col items-center relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-500
                    ${isDone ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'border-slate-100 bg-slate-50 text-slate-300'}
                    ${isCurrent ? 'scale-110 ring-4 ring-indigo-50 border-indigo-500' : ''}`}>
                    {STATUS_ICONS[status]}
                  </div>
                  <div className={`text-[9px] mt-4 font-black uppercase tracking-widest ${isDone ? 'text-indigo-600' : 'text-slate-300'}`}>{STATUS_LABELS[status]}</div>
                </div>
              );
            })}
            {/* Progress Line */}
            <div className="absolute top-7 left-14 right-14 h-0.5 bg-slate-100 -z-0">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, (Math.max(0, currentStep - 1) / 2) * 100)}%` }}
                 className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
               />
            </div>
          </div>

          <div className="text-center bg-slate-50 rounded-[32px] py-6 px-4">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Estimated Intelligence</p>
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {order.status === 'READY' ? 'Your selection is ready! 🎉' : order.status === 'PAID' ? 'Transaction Settled ✓' : 'Our experts are preparing...'}
               </h3>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Itemized Log</h3>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-transparent transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm
                  ${item.isPrepared ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  {item.isPrepared ? '✓' : item.quantity}
                </div>
                <div className="flex-1 min-w-0">
                    <div className={`text-xs font-black uppercase tracking-tight truncate ${item.isPrepared ? 'line-through opacity-30 text-slate-500' : 'text-slate-900'}`}>
                        {item.product.name}
                    </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-baseline mt-8 pt-6 border-t border-slate-50 px-2">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Settle</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{order.total.toFixed(0)}</span>
          </div>
        </div>

        <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Refreshing Stream every 3 seconds</p>
        </div>
      </div>
    </div>
  );
}

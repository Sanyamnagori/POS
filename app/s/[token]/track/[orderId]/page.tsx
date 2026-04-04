'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string; quantity: number; isPrepared: boolean; product: { name: string };
}
interface Order {
  id: string; status: string; total: number; createdAt: string; items: OrderItem[];
}

const STATUS_STEPS = ['DRAFT', 'SENT', 'PREPARING', 'COMPLETED', 'PAID'];
const STATUS_LABELS: Record<string, string> = { DRAFT: 'Received', SENT: 'To Cook', PREPARING: 'Cooking', COMPLETED: 'Ready', PAID: 'Paid' };
const STATUS_ICONS: Record<string, string> = { DRAFT: '📝', SENT: '🔥', PREPARING: '🍳', COMPLETED: '✅', PAID: '💳' };

export default function TrackPage({ params }: { params: { token: string; orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  async function load() {
    const res = await fetch(`/api/orders/${params.orderId}`);
    if (res.ok) setOrder(await res.json());
  }
  useEffect(() => { load(); const i = setInterval(load, 3000); return () => clearInterval(i); }, []);

  if (!order) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400 text-center"><div className="text-4xl mb-3">⏳</div>Loading...</div>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push(`/s/${params.token}/menu`)} className="text-slate-400">←</button>
        <h1 className="font-bold text-white">Track Order</h1>
        <span className="ml-auto text-xs text-slate-500">#{order.id.slice(-8).toUpperCase()}</span>
      </div>

      {/* Progress */}
      <div className="card mb-6">
        <div className="flex justify-between items-start">
          {STATUS_STEPS.filter(s => ['SENT', 'PREPARING', 'COMPLETED'].includes(s)).map((status, i, arr) => {
            const step = STATUS_STEPS.indexOf(status);
            const done = currentStep >= step;
            const current = currentStep === step;
            return (
              <div key={status} className="flex-1 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-all
                  ${done ? 'border-sky-500 bg-sky-500/20' : 'border-slate-600 bg-slate-800'}
                  ${current ? 'pulse-glow' : ''}`}>
                  {STATUS_ICONS[status]}
                </div>
                <div className={`text-xs mt-2 font-medium ${done ? 'text-sky-400' : 'text-slate-600'}`}>{STATUS_LABELS[status]}</div>
                {i < arr.length - 1 && (
                  <div className="absolute" style={{ top: '20px', left: '50%', width: '100%' }} />
                )}
              </div>
            );
          })}
        </div>
        <div className="relative flex items-center mt-2 px-5">
          <div className="h-1 bg-slate-700 flex-1 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (Math.max(0, currentStep - 1) / 2) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card mb-4">
        <h3 className="font-semibold text-white mb-3">Order Items</h3>
        {order.items.map(item => (
          <div key={item.id} className="flex items-center gap-2 py-2 border-b border-slate-700 last:border-0">
            <span className={`w-5 h-5 rounded-sm border flex items-center justify-center text-xs
              ${item.isPrepared ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'}`}>
              {item.isPrepared && '✓'}
            </span>
            <span className={`flex-1 text-sm ${item.isPrepared ? 'line-through text-slate-500' : 'text-white'}`}>
              {item.quantity}× {item.product.name}
            </span>
          </div>
        ))}
        <div className="flex justify-between mt-3 pt-2 border-t border-slate-700">
          <span className="text-slate-400 text-sm">Total</span>
          <span className="text-sky-400 font-bold">₹{order.total.toFixed(0)}</span>
        </div>
      </div>

      <p className="text-center text-slate-600 text-xs">Page refreshes automatically every 3 seconds</p>
    </div>
  );
}

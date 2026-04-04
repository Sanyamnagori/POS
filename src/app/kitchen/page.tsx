'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

interface OrderItem {
  id: string; productId: string; quantity: number; isPrepared: boolean;
  note?: string; product: { name: string; category: { name: string; color: string } };
}
interface Order {
  id: string; status: string; createdAt: string; total: number;
  table?: { number: string; floor: { name: string } };
  items: OrderItem[];
}

type KitchenStatus = 'SENT' | 'PREPARING' | 'READY';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  async function loadOrders() {
    const res = await fetch('/api/orders?status=SENT');
    const res2 = await fetch('/api/orders?status=PREPARING');
    const res3 = await fetch('/api/orders?status=READY');
    const [sent, preparing, ready] = await Promise.all([res.json(), res2.json(), res3.json()]);
    const all = [...sent, ...preparing, ...ready.slice(0, 10)];
    setOrders(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  useEffect(() => {
    loadOrders();
    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
      socketRef.current = socket;
      socket.on('NEW_ORDER', () => { loadOrders(); toast('🍳 New order!'); });
      socket.on('UPDATE_ORDER_STATUS', () => loadOrders());
      socket.on('PAYMENT_DONE', () => loadOrders());
      return () => { socket.disconnect(); };
    } catch {}
  }, []);

  async function moveStatus(order: Order) {
    const next: Record<string, string> = { SENT: 'PREPARING', PREPARING: 'READY' };
    const nextStatus = next[order.status];
    if (!nextStatus) return;
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    socketRef.current?.emit('UPDATE_ORDER_STATUS', { orderId: order.id, status: nextStatus });
    loadOrders();
  }

  async function toggleItem(orderId: string, itemId: string, isPrepared: boolean) {
    await fetch(`/api/orders/${orderId}/items`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, isPrepared: !isPrepared }),
    });
    loadOrders();
  }

  const col = (status: KitchenStatus) => orders.filter(o => o.status === status &&
    (search === '' || o.items.some(i => i.product?.name.toLowerCase().includes(search.toLowerCase())) || o.id.toLowerCase().includes(search.toLowerCase()) || o.table?.number.toLowerCase().includes(search.toLowerCase())));

  const columns: Array<{ status: KitchenStatus; label: string; icon: string; color: string }> = [
    { status: 'SENT', label: 'To Cook', icon: '🔥', color: 'amber' },
    { status: 'PREPARING', label: 'Preparing', icon: '🍳', color: 'blue' },
    { status: 'READY', label: 'Ready', icon: '✅', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🍳</div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Kitchen Operations</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Production Sync</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input className="input !pl-10 !py-2.5 !bg-slate-100 border-none shadow-none focus:ring-indigo-500/10 placeholder:text-slate-400 hover:bg-slate-200/50 transition-colors" placeholder="Filter orders or items..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={loadOrders} className="btn-secondary !text-xs !py-3 !px-6 border-slate-200">↻ Force Refresh</button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8 p-8 h-[calc(100vh-88px)] max-w-[1920px] mx-auto">
        {columns.map(({ status, label, icon, color }) => (
          <div key={status} className="flex flex-col h-full overflow-hidden">
            <div className={`flex items-center gap-3 mb-6 px-6 py-4 rounded-3xl border-2 shadow-lg shadow-${color}-500/5 bg-white border-${color}-100`}>
              <span className="text-2xl">{icon}</span>
              <span className="font-black text-slate-900 uppercase tracking-widest text-xs">{label}</span>
              <div className={`ml-auto w-8 h-8 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center font-black text-sm border border-${color}-100`}>
                {col(status).length}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-5 px-1 pb-10 no-scrollbar">
              {col(status).map((order, idx) => (
                <div 
                  key={order.id} 
                  style={{ animationDelay: `${idx * 80}ms` }}
                  className="group animate-slide-up bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all overflow-hidden relative cursor-pointer active:scale-[0.98]" 
                  onClick={() => moveStatus(order)}
                >
                  {/* Status Side Accent */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full bg-${color === 'blue' ? 'indigo' : color}-500 opacity-20`} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="font-black text-slate-900 text-lg tracking-tighter uppercase mb-0.5">
                          {order.table ? `Table ${order.table.number}` : 'External Order'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-slate-100">#{order.id.slice(-6)}</span>
                          <span className="text-[10px] font-medium text-slate-400 italic">Received {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-indigo-600 font-extrabold text-sm tracking-tighter">₹{order.total.toFixed(0)}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest mt-1 text-${color === 'blue' ? 'indigo' : color}-500/60`}>Tap to advance →</div>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      {order.items.map(item => (
                        <div 
                          key={item.id} 
                          className={`flex items-center gap-3 py-2 transition-all ${item.isPrepared ? 'opacity-30' : ''}`}
                          onClick={e => { e.stopPropagation(); toggleItem(order.id, item.id, item.isPrepared); }}
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.isPrepared ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-200 bg-white'}`}>
                            {item.isPrepared && <span className="text-white text-[10px] font-black italic">✓</span>}
                          </div>
                          <div className="flex-1">
                            <span className={`text-xs font-bold uppercase tracking-tight ${item.isPrepared ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              <span className="text-indigo-600 font-black mr-2 bg-indigo-50 px-1.5 py-0.5 rounded-md">{item.quantity}x</span>
                              {item.product?.name || 'Deleted Product'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {col(status).length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 opacity-20 filter grayscale">
                  <div className="text-5xl mb-4">{status === 'READY' ? '🎉' : '💤'}</div>
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No {label} orders</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

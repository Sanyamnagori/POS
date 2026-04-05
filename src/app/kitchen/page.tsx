'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

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
    try {
      const [res, res2, res3] = await Promise.all([
        fetch('/api/orders?status=SENT'),
        fetch('/api/orders?status=PREPARING'),
        fetch('/api/orders?status=READY')
      ]);
      
      const sent = await res.json();
      const preparing = await res2.json();
      const ready = await res3.json();

      if (Array.isArray(sent) && Array.isArray(preparing) && Array.isArray(ready)) {
        const all = [...sent, ...preparing, ...ready.slice(0, 10)];
        setOrders(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        console.error('Kitchen data is not in array format:', { sent, preparing, ready });
      }
    } catch (e) {
      console.error('Error loading kitchen orders:', e);
    }
  }

  useEffect(() => {
    loadOrders();
    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
        timeout: 20000,
      });
      socketRef.current = socket;
      
      socket.on('connect', () => console.log('Socket connected to backend'));
      socket.on('connect_error', (err) => console.warn('Socket connection failed, retrying in 5s...', err.message));
      
      socket.on('NEW_ORDER', () => { loadOrders(); toast.success('New Ticket Received 🍳'); });
      socket.on('UPDATE_ORDER_STATUS', () => loadOrders());
      socket.on('PAYMENT_DONE', () => loadOrders());
      
      return () => { socket.disconnect(); };
    } catch (e) {
      console.error('Socket initialization error:', e);
    }
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

  const col = (status: KitchenStatus) => (Array.isArray(orders) ? orders : []).filter(o => o.status === status &&
    (search === '' || o.items?.some(i => i.product?.name?.toLowerCase()?.includes((search || '').toLowerCase())) || o.id?.toLowerCase()?.includes((search || '').toLowerCase()) || o.table?.number?.toLowerCase()?.includes((search || '').toLowerCase())));

  const columns: Array<{ status: KitchenStatus; label: string; icon: string; accent: string; bg: string }> = [
    { status: 'SENT', label: 'In Queue', icon: '⚡', accent: 'amber-500', bg: 'amber-500/10' },
    { status: 'PREPARING', label: 'Processing', icon: '♨️', accent: 'cyan-500', bg: 'cyan-500/10' },
    { status: 'READY', label: 'Verified Ready', icon: '✅', accent: 'emerald-500', bg: 'emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-black font-sans text-slate-200 overflow-hidden">
      <header className="bg-dark-900 border-b border-white/10 px-10 py-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-[28px] flex items-center justify-center text-4xl shadow-xl shadow-primary/20 text-black">🍳</div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Kitchen Intelligence</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Terminal · Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-[400px]">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">⌕</span>
            <input 
              className="input !pl-14 !py-4 !bg-white/5 !border-white/10 !text-white font-bold uppercase tracking-widest text-xs" 
              placeholder="Filter operational matrix..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <button onClick={loadOrders} className="h-14 px-10 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm">Refresh Stream</button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-10 p-10 h-[calc(100vh-112px)] max-w-[2400px] mx-auto overflow-y-auto no-scrollbar">
        {columns.map(({ status, label, icon, accent, bg }) => (
          <div key={status} className="flex flex-col h-full">
            <div className={`flex items-center gap-5 mb-8 px-8 py-6 rounded-[32px] bg-dark-900 border border-white/5 shadow-2xl`}>
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center text-2xl`}>{icon}</div>
              <span className="font-black text-white uppercase tracking-[0.2em] text-sm">{label}</span>
              <div className={`ml-auto px-4 py-2 rounded-xl bg-primary text-black font-black text-lg tracking-tighter`}>
                {col(status).length}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 px-2 pb-10 no-scrollbar">
              <AnimatePresence>
                {col(status).map((order) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    layout
                    key={order.id} 
                    className={`bg-dark-800 border border-white/5 rounded-[40px] shadow-2xl overflow-hidden relative group hover:border-primary/30 transition-all cursor-pointer`}
                    onClick={() => moveStatus(order)}
                  >
                    {/* Header: Station & ID */}
                    <div className="p-8 border-b border-white/5 bg-white/5 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className={`w-3 h-3 rounded-full bg-${accent} animate-pulse shadow-lg`} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order.table?.floor?.name || 'External'}</span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                            {order.table ? `Unit ${order.table.number}` : 'Delivery'}
                        </h2>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Index #{order.id.slice(-4)}</div>
                         <div className="text-sm font-black text-primary tracking-tighter">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>

                    {/* Content: Operational Items */}
                    <div className="p-8 space-y-4">
                      {order.items.map(item => (
                        <div 
                          key={item.id} 
                          className={`flex items-center gap-5 p-5 rounded-[28px] transition-all border ${item.isPrepared ? 'opacity-30 bg-white/5 border-transparent' : 'bg-white/5 border-white/5 shadow-sm hover:border-primary/20'}`}
                          onClick={e => { e.stopPropagation(); toggleItem(order.id, item.id, item.isPrepared); }}
                        >
                          <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${item.isPrepared ? 'bg-primary border-primary text-black' : 'border-white/10 bg-white/5 text-white/20'}`}>
                            {item.isPrepared ? '✓' : ''}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-baseline gap-3">
                                <span className={`text-xl font-black bg-white/10 text-white px-3 py-1 rounded-xl text-sm ${item.isPrepared ? 'opacity-40' : ''}`}>{item.quantity}×</span>
                                <span className={`text-lg font-black uppercase tracking-tight ${item.isPrepared ? 'line-through text-slate-500 font-medium' : 'text-white'}`}>
                                    {item.product?.name}
                                </span>
                             </div>
                             {item.note && <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1 ml-15">“{item.note}”</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Action Handle */}
                    <div className="px-8 pb-8">
                       <button className={`w-full py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all ${status === 'SENT' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black' : status === 'PREPARING' ? 'bg-primary/10 text-primary hover:bg-primary hover:text-black' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'}`}>
                           {status === 'SENT' ? 'Engage Processing' : status === 'PREPARING' ? 'Mark Dispatch Ready' : 'Order Handed Over'}
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {col(status).length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 opacity-20 grayscale scale-125">
                  <div className="text-8xl mb-8">🌀</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">Synchronized State</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

type KitchenStatus = 'SENT' | 'PREPARING' | 'COMPLETED';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  async function loadOrders() {
    const res = await fetch('/api/orders?status=SENT');
    const res2 = await fetch('/api/orders?status=PREPARING');
    const res3 = await fetch('/api/orders?status=COMPLETED');
    const [sent, preparing, completed] = await Promise.all([res.json(), res2.json(), res3.json()]);
    const all = [...sent, ...preparing, ...completed.slice(0, 10)];
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
    const next: Record<string, string> = { SENT: 'PREPARING', PREPARING: 'COMPLETED' };
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
    (search === '' || o.items.some(i => i.product.name.toLowerCase().includes(search.toLowerCase())) || o.id.toLowerCase().includes(search.toLowerCase()) || o.table?.number.toLowerCase().includes(search.toLowerCase())));

  const columns: Array<{ status: KitchenStatus; label: string; icon: string; color: string }> = [
    { status: 'SENT', label: 'To Cook', icon: '🔥', color: 'amber' },
    { status: 'PREPARING', label: 'Preparing', icon: '🍳', color: 'blue' },
    { status: 'COMPLETED', label: 'Completed', icon: '✅', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🍳</span>
          <h1 className="text-lg font-bold text-white">Kitchen Display</h1>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-1" title="Live" />
        </div>
        <input className="input max-w-xs text-sm" placeholder="Search orders/items..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={loadOrders} className="btn-secondary text-sm">↻ Refresh</button>
      </header>

      <div className="grid grid-cols-3 gap-4 p-4 h-[calc(100vh-57px)]">
        {columns.map(({ status, label, icon, color }) => (
          <div key={status} className="flex flex-col overflow-hidden">
            <div className={`flex items-center gap-2 mb-3 bg-${color}-500/20 border border-${color}-500/30 rounded-xl px-4 py-2`}>
              <span>{icon}</span>
              <span className={`font-bold text-${color}-400`}>{label}</span>
              <span className={`badge bg-${color}-500/30 text-${color}-400 ml-auto`}>{col(status).length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {col(status).map(order => (
                <div key={order.id} className="kitchen-ticket animate-slide-in" onClick={() => moveStatus(order)}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-white text-sm">{order.table ? `Table ${order.table.number}` : 'QR Order'}</div>
                      <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()} · #{order.id.slice(-6)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sky-400 font-bold text-sm">₹{order.total.toFixed(0)}</div>
                      {status !== 'COMPLETED' && <div className="text-xs text-slate-500">tap to advance</div>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {order.items.map(item => (
                      <div key={item.id} className={`flex items-center gap-2 text-xs py-1 px-2 rounded cursor-pointer hover:bg-slate-700 ${item.isPrepared ? 'opacity-50' : ''}`}
                        onClick={e => { e.stopPropagation(); toggleItem(order.id, item.id, item.isPrepared); }}>
                        <span className={`w-4 h-4 rounded-sm border ${item.isPrepared ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'} flex items-center justify-center`}>
                          {item.isPrepared && <span className="text-white text-xs">✓</span>}
                        </span>
                        <span className={`${item.isPrepared ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.quantity}x {item.product.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {col(status).length === 0 && (
                <div className="text-center text-slate-600 py-12 text-sm">No orders</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface OrderItem {
  id: string; quantity: number; price: number; product: { name: string };
}
interface Order {
  id: string; status: string; total: number; table?: { number: string };
  items: OrderItem[];
}

export default function CustomerDisplayPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [paid, setPaid] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
      socketRef.current = socket;
      socket.on('ORDER_UPDATE', (data: Order) => { setOrder(data); setPaid(false); });
      socket.on('PAYMENT_DONE', () => { setPaid(true); setTimeout(() => { setOrder(null); setPaid(false); }, 5000); });
      return () => { socket.disconnect(); };
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-sky-950 flex">
      {/* Left: Branding */}
      <div className="w-2/5 flex flex-col items-center justify-center p-12 border-r border-slate-800">
        <div className="text-8xl mb-6">☕</div>
        <h1 className="text-4xl font-bold text-white text-center">Odoo POS Cafe</h1>
        <p className="text-slate-400 mt-3 text-center text-lg">Thank you for choosing us!</p>
        <div className="mt-8 space-y-3 text-slate-500 text-sm text-center">
          <p>📍 Ground Floor, MG Road</p>
          <p>📞 +91 98765 43210</p>
          <p>🌐 odoopos.cafe</p>
        </div>
      </div>

      {/* Right: Dynamic order */}
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        {paid ? (
          <div className="text-center animate-slide-in">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-emerald-400">Thank you!</h2>
            <p className="text-slate-400 mt-2 text-xl">for shopping with us</p>
            <p className="text-slate-500 mt-4">Please come again!</p>
          </div>
        ) : order ? (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Order</h2>
              {order.table && <p className="text-slate-400">Table {order.table.number}</p>}
            </div>
            <div className="card space-y-2 mb-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <div>
                    <span className="text-white font-medium">{item.product?.name || item.productId}</span>
                    <span className="text-slate-400 text-sm ml-2">×{item.quantity}</span>
                  </div>
                  <span className="text-sky-400 font-semibold">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-6 py-4 text-center">
              <div className="text-slate-400 text-sm">Total Amount</div>
              <div className="text-4xl font-bold text-sky-400">₹{order.total?.toFixed ? order.total.toFixed(0) : order.total}</div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🙂</div>
            <h2 className="text-2xl font-bold text-white">Welcome!</h2>
            <p className="text-slate-400 mt-2">Waiting for your order...</p>
          </div>
        )}
      </div>
    </div>
  );
}

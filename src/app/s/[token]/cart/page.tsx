'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelfOrder } from '../layout';
import toast from 'react-hot-toast';

export default function SelfCartPage() {
  const { cart, removeFromCart, clearCart, table, token } = useSelfOrder();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const res = await fetch(`/api/self-order/${token}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })) }),
      });
      const order = await res.json();
      if (!res.ok) { toast.error(order.error || 'Error placing order'); return; }
      clearCart();
      router.push(`/s/${token}/confirmation?orderId=${order.id}&total=${total.toFixed(0)}`);
    } catch { toast.error('Network error'); } finally { setPlacing(false); }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400">←</button>
        <h1 className="font-bold text-white flex-1">Your Cart</h1>
        {table && <span className="text-xs text-sky-400">Table {table.number}</span>}
      </div>

      <div className="flex-1 p-4 space-y-3 pb-40">
        {cart.map(item => (
          <div key={item.productId} className="card flex items-center gap-3">
            <div className="flex-1">
              <div className="font-semibold text-white">{item.name}</div>
              <div className="text-sky-400">₹{item.price} × {item.quantity}</div>
            </div>
            <span className="text-white font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
            <button onClick={() => removeFromCart(item.productId)} className="text-red-400 text-xs hover:text-red-300">✕</button>
          </div>
        ))}
        {cart.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-slate-400">Your cart is empty</p>
            <button onClick={() => router.back()} className="btn-primary mt-4">Browse Menu</button>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-slate-950/90 backdrop-blur border-t border-slate-800">
          <div className="flex justify-between text-lg font-bold text-white mb-3">
            <span>Total</span><span className="text-sky-400">₹{total.toFixed(0)}</span>
          </div>
          <button onClick={placeOrder} disabled={placing} className="btn-primary w-full py-3 rounded-xl text-base">
            {placing ? 'Placing order...' : '✓ Place Order'}
          </button>
        </div>
      )}
    </div>
  );
}

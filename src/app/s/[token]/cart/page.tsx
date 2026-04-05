'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelfOrder } from '../layout';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function SelfCartPage() {
  const { cart, removeFromCart, clearCart, table, token } = useSelfOrder();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      // 1. Create Internal Order (DRAFT)
      const res = await fetch(`/api/self-order/${token}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })) }),
      });
      const order = await res.json();
      if (!res.ok) { toast.error(order.error || 'Error placing order'); setPlacing(false); return; }

      // 2. Create Razorpay Order
      const rzpRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, amount: total }),
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        toast.error(rzpData.error || 'Razorpay initialization failed');
        setPlacing(false);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Odoo POS Cafe",
        description: `Table ${table?.number} Order`,
        order_id: rzpData.id,
        handler: async function (response: any) {
          // 4. Verify Payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internalOrderId: order.id,
              method: 'UPI', // Default for self-order
              amount: total
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            clearCart();
            router.push(`/s/${token}/confirmation?orderId=${order.id}&total=${total.toFixed(0)}`);
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: "Guest",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function() {
            setPlacing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch { 
      toast.error('Network error'); 
      setPlacing(false); 
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="bg-white border-b border-slate-100 px-6 py-6 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:text-indigo-600 transition-colors">←</button>
        <div className="flex-1">
            <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Your Selection</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cart.length} Item{cart.length !== 1 ? 's' : ''} Prepared</p>
        </div>
        {table && <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-600/20">Unit {table.number}</span>}
      </div>

      <div className="flex-1 p-6 space-y-4 pb-48">
        <AnimatePresence mode="popLayout">
          {cart.map(item => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              key={item.productId} 
              className="bg-white rounded-[32px] p-6 flex items-center gap-5 border border-slate-100 shadow-sm relative group"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {item.name.toLowerCase().includes('coffee') ? '☕' : '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-slate-900 text-sm uppercase tracking-tight truncate">{item.name}</div>
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">₹{item.price} × {item.quantity}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-slate-900 tracking-tighter">₹{(item.price * item.quantity).toFixed(0)}</div>
                <button onClick={() => removeFromCart(item.productId)} className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">Remove</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {cart.length === 0 && (
          <div className="text-center py-32 flex flex-col items-center opacity-30 scale-125">
            <div className="text-7xl mb-6">🛒</div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Your bag is empty</p>
            <button onClick={() => router.back()} className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Return to Menu</button>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-8 bg-white/80 backdrop-blur-3xl border-t border-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] rounded-t-[48px]">
          <div className="flex justify-between items-baseline mb-6 px-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Merchant Summary</span>
            <span className="text-4xl font-black text-indigo-600 tracking-tighter shadow-indigo-100 drop-shadow-sm">₹{total.toFixed(0)}</span>
          </div>
          <button onClick={placeOrder} disabled={placing} className="w-full bg-slate-900 text-white py-6 rounded-[28px] text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {placing ? 'Transmitting Request...' : 'Transmit Order ✓'}
          </button>
        </div>
      )}
    </div>
  );
}

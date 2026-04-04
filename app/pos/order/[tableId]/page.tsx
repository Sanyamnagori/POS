'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/useCartStore';

interface Product {
  id: string; name: string; price: number; tax: number; description?: string;
  category: { id: string; name: string; color: string };
  variants: Array<{ id: string; attribute: string; value: string; extraPrice: number }>;
}
interface Category { id: string; name: string; color: string; }
interface POSConfig { cashEnabled: boolean; digitalEnabled: boolean; upiEnabled: boolean; upiId?: string; }

function QRCode({ value }: { value: string }) {
  const [qrSvg, setQrSvg] = useState('');
  useEffect(() => {
    import('qrcode').then(QR => {
      QR.toString(value, { type: 'svg', width: 200, color: { dark: '#fff', light: '#1e293b' } }).then(setQrSvg);
    });
  }, [value]);
  return <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-48 h-48" />;
}

export default function OrderPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const { items, addItem, removeItem, updateQty, clearCart, subtotal, totalTax, total, setTable, setSession, setOrderId, sessionId } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<POSConfig | null>(null);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tableInfo, setTableInfo] = useState<{ number: string } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState<'CASH' | 'DIGITAL' | 'UPI'>('CASH');
  const [showQR, setShowQR] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderIdState] = useState<string | null>(null);

  useEffect(() => {
    setTable(params.tableId);
    async function load() {
      const [pr, ca, cf, sessions, tableRes] = await Promise.all([
        fetch('/api/products'), fetch('/api/categories'),
        fetch('/api/pos-config'), fetch('/api/sessions'),
        fetch('/api/tables'),
      ]);
      setProducts(await pr.json()); setCategories(await ca.json()); setConfig(await cf.json());
      const sessionList = await sessions.json();
      const open = sessionList.find((s: { closedAt: string | null }) => !s.closedAt);
      if (open) setSession(open.id);
      const tableList = await tableRes.json();
      const t = tableList.find((tt: { id: string }) => tt.id === params.tableId);
      if (t) setTableInfo(t);
    }
    load();
  }, []);

  const filtered = products.filter(p =>
    (activeCat === 'all' || p.category.id === activeCat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function sendToKitchen() {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: params.tableId, sessionId, items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, price: i.price })) }),
      });
      const order = await res.json();
      // Send to kitchen
      await fetch(`/api/orders/${order.id}/send`, { method: 'PUT' });
      setOrderIdState(order.id);
      setOrderId(order.id);

      // Emit socket event
      try {
        const { io } = await import('socket.io-client');
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
        socket.emit('NEW_ORDER', { orderId: order.id, tableId: params.tableId, items: order.items });
        socket.emit('ORDER_UPDATE', { orderId: order.id, tableId: params.tableId, items: order.items, status: 'SENT', total: order.total });
        setTimeout(() => socket.disconnect(), 1000);
      } catch {}

      toast.success('Order sent to kitchen! 🍳');
      setShowPayment(true);
    } catch { toast.error('Error'); } finally { setLoading(false); }
  }

  async function handlePay() {
    if (!orderId) { toast.error('Send to kitchen first'); return; }
    if (payMethod === 'UPI') { setShowQR(true); return; }
    confirmPay();
  }

  async function confirmPay() {
    if (!orderId) return;
    setLoading(true);
    try {
      await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: payMethod, amount: total() }),
      });
      try {
        const { io } = await import('socket.io-client');
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
        socket.emit('PAYMENT_DONE', { orderId, tableId: params.tableId, amount: total() });
        setTimeout(() => socket.disconnect(), 1000);
      } catch {}
      setShowQR(false); setShowThankYou(true);
      clearCart();
      setTimeout(() => { setShowThankYou(false); setShowPayment(false); setOrderIdState(null); router.push('/pos/floor'); }, 3000);
    } catch { toast.error('Payment error'); } finally { setLoading(false); }
  }

  const upiUrl = config?.upiId ? `upi://pay?pa=${config.upiId}&am=${total().toFixed(2)}&cu=INR` : '';

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center gap-4">
          <button onClick={() => router.push('/pos/floor')} className="text-slate-400 hover:text-white">← Back</button>
          <span className="font-bold text-white">Table {tableInfo?.number || params.tableId}</span>
          <input className="input ml-auto max-w-xs text-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-slate-800 bg-slate-900/50">
          <button onClick={() => setActiveCat('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCat === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCat === c.id ? 'text-white' : 'text-slate-400 bg-slate-800'}`}
              style={activeCat === c.id ? { background: c.color } : {}}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {filtered.map(product => (
            <button key={product.id} onClick={() => addItem({ productId: product.id, name: product.name, price: product.price, tax: product.tax, quantity: 1 })}
              className="card text-left hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group cursor-pointer">
              <div className="text-2xl mb-2">
                {product.category.name === 'Beverages' ? '☕' : product.category.name === 'Food' ? '🍽️' : product.category.name === 'Snacks' ? '🍟' : '🍰'}
              </div>
              <div className="font-medium text-white text-sm group-hover:text-sky-400 transition-colors">{product.name}</div>
              <div className="text-sky-400 font-bold mt-1">₹{product.price}</div>
              {product.tax > 0 && <div className="text-xs text-slate-500">+{product.tax}% tax</div>}
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-4 text-center text-slate-500 py-12">No products found</div>}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-bold text-white">Cart</h2>
          <p className="text-xs text-slate-500">{items.length} item(s)</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.map(item => (
            <div key={`${item.productId}-${item.variantId}`} className="bg-slate-800 rounded-lg p-2.5 animate-slide-in">
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-sm text-white font-medium flex-1">{item.name}</span>
                <button onClick={() => removeItem(item.productId, item.variantId)} className="text-slate-500 hover:text-red-400 ml-2 text-xs">✕</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.productId, item.variantId, -1)} className="w-6 h-6 bg-slate-700 rounded text-white text-sm hover:bg-slate-600">−</button>
                  <span className="w-6 text-center text-white text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.variantId, 1)} className="w-6 h-6 bg-slate-700 rounded text-white text-sm hover:bg-sky-600">+</button>
                </div>
                <span className="text-sky-400 font-semibold text-sm">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center text-slate-500 py-12 text-sm">Add items from the menu</div>}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal</span>
            <span>₹{subtotal().toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-xs text-sky-400/80">
            <span>Tax</span>
            <span>₹{totalTax().toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-slate-800 pt-2 mb-1">
            <span className="text-slate-300">Total</span>
            <span className="text-sky-400">₹{total().toFixed(0)}</span>
          </div>
          <button onClick={sendToKitchen} disabled={loading || items.length === 0} className="btn-primary w-full">
            {loading ? 'Sending...' : '🍳 Send to Kitchen'}
          </button>
          {orderId && (
            <button onClick={() => setShowPayment(true)} className="btn-success w-full">💳 Payment</button>
          )}
          <button onClick={clearCart} className="btn-secondary w-full text-sm">Clear Cart</button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && !showThankYou && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm animate-slide-in">
            {showQR ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-white mb-2">Scan UPI QR</h2>
                <p className="text-slate-400 text-sm mb-4">Amount: <span className="text-sky-400 font-bold">₹{total().toFixed(0)}</span></p>
                <div className="flex justify-center mb-4">
                  <QRCode value={upiUrl} />
                </div>
                <p className="text-xs text-slate-500 mb-4 break-all">{upiUrl}</p>
                <div className="flex gap-2">
                  <button onClick={confirmPay} disabled={loading} className="btn-success flex-1">{loading ? '...' : '✓ Confirm Paid'}</button>
                  <button onClick={() => setShowQR(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-1">Payment</h2>
                <p className="text-slate-400 text-sm mb-4">Total: <span className="text-sky-400 font-bold text-xl">₹{total().toFixed(0)}</span></p>
                <div className="space-y-2 mb-4">
                  {config?.cashEnabled && (
                    <button onClick={() => setPayMethod('CASH')} className={`w-full p-3 rounded-lg border text-left transition-all ${payMethod === 'CASH' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      <span className="text-xl mr-2">💵</span><span className="text-white font-medium">Cash</span>
                    </button>
                  )}
                  {config?.digitalEnabled && (
                    <button onClick={() => setPayMethod('DIGITAL')} className={`w-full p-3 rounded-lg border text-left transition-all ${payMethod === 'DIGITAL' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      <span className="text-xl mr-2">💳</span><span className="text-white font-medium">Card / Digital</span>
                    </button>
                  )}
                  {config?.upiEnabled && (
                    <button onClick={() => setPayMethod('UPI')} className={`w-full p-3 rounded-lg border text-left transition-all ${payMethod === 'UPI' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      <span className="text-xl mr-2">📱</span><span className="text-white font-medium">UPI</span>
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePay} disabled={loading} className="btn-success flex-1">{loading ? '...' : '✓ Confirm Payment'}</button>
                  <button onClick={() => setShowPayment(false)} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Thank you */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center animate-slide-in">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-white mb-2">Payment Done!</h2>
            <p className="text-slate-400">Returning to floor view...</p>
          </div>
        </div>
      )}
    </div>
  );
}

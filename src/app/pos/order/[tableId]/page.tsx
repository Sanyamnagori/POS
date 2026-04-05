'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/stores/useCartStore';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Product {
  id: string; name: string; price: number; tax: number; uom?: string; description?: string;
  category: { id: string; name: string; color: string };
  variants: Array<{ id: string; attribute: string; value: string; extraPrice: number }>;
}
interface Category { id: string; name: string; color: string; }
interface POSConfig { cashEnabled: boolean; digitalEnabled: boolean; upiEnabled: boolean; upiId?: string; }

function QRCode({ value }: { value: string }) {
  const [qrSvg, setQrSvg] = useState('');
  useEffect(() => {
    import('qrcode').then(QR => {
      QR.toString(value, { 
        type: 'svg', 
        width: 200, 
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' } 
      }).then(setQrSvg);
    });
  }, [value]);
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: qrSvg }} 
      className="p-4 bg-white border border-slate-100 rounded-[32px] shadow-inner" 
    />
  );
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { id: string; price: number; value: string }>>({});

  useEffect(() => {
    setTable(params.tableId);
    async function load() {
      const [pr, ca, cf, sessions, tableRes] = await Promise.all([
        fetch('/api/products'), fetch('/api/categories'),
        fetch('/api/pos-config'), fetch('/api/sessions'),
        fetch('/api/tables'),
      ]);
      const [productsData, categoriesData, configData, sessionListData, tableListData] = await Promise.all([
        pr.ok ? pr.json() : [],
        ca.ok ? ca.json() : [],
        cf.ok ? cf.json() : null,
        sessions.ok ? sessions.json() : [],
        tableRes.ok ? tableRes.json() : [],
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setConfig(configData);

      const sessionList = Array.isArray(sessionListData) ? sessionListData : [];
      const open = sessionList.find((s: { closedAt: string | null }) => !s.closedAt);
      if (open) setSession(open.id);

      const tableList = Array.isArray(tableListData) ? tableListData : [];
      const t = tableList.find((tt: { id: string }) => tt.id === params.tableId);
      if (t) setTableInfo(t);
    }
    load();
  }, []);

  const filtered = Array.isArray(products) ? products.filter(p =>
    (activeCat === 'all' || p?.category?.id === activeCat) &&
    p?.name?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleProductClick = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setSelectedVariants({});
    } else {
      addItem({ productId: product.id, name: product.name, price: product.price, tax: product.tax, quantity: 1 });
      toast.success(`${product.name} added`);
    }
  };

  const confirmVariant = () => {
    if (!selectedProduct) return;
    const extra = Object.values(selectedVariants).reduce((s, v) => s + v.price, 0);
    const variantNames = Object.values(selectedVariants).map(v => v.value).join(', ');
    const variantIds = Object.values(selectedVariants).map(v => v.id).join('-'); // Simple composite ID or use the first one if we only support one attribute per product
    
    addItem({ 
      productId: selectedProduct.id, 
      variantId: Object.values(selectedVariants)[0]?.id, // For now, use the first selected variant ID as Prisma expects 1:1
      name: `${selectedProduct.name}${variantNames ? ` (${variantNames})` : ''}`, 
      price: selectedProduct.price + extra, 
      tax: selectedProduct.tax, 
      quantity: 1 
    });
    
    setSelectedProduct(null);
    toast.success('Added with options');
  };

  async function sendToKitchen() {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: params.tableId, sessionId, items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, price: i.price, tax: i.tax })) }),
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
    
    // For Cash, use the old flow
    if (payMethod === 'CASH') {
      confirmPay();
      return;
    }

    // For Digital/UPI, use Razorpay
    await displayRazorpay();
  }

  const displayRazorpay = async () => {
    if (!orderId) return;
    setLoading(true);

    try {
      // 1. Create Order on Backend
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: total() }),
      });
      const data = await res.json();

      // 2. Open Razorpay Checkout
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKey || razorpayKey === 'rzp_test_placeholder') {
        toast.error('Razorpay is in test/placeholder mode. Please update your .env with valid keys.');
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency,
        name: "Odoo POS Cafe",
        description: `Order #${orderId.slice(-6)}`,
        order_id: data.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internalOrderId: orderId,
              method: payMethod,
              amount: total()
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            // Success Logic
            try {
              const { io } = await import('socket.io-client');
              const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
              socket.emit('PAYMENT_DONE', { orderId, tableId: params.tableId, amount: total() });
              setTimeout(() => socket.disconnect(), 1000);
            } catch {}

            setShowQR(false); 
            setShowThankYou(true);
            clearCart();
            setTimeout(() => { 
                setShowThankYou(false); 
                setShowPayment(false); 
                setOrderIdState(null); 
                router.push('/pos/floor'); 
            }, 3000);
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: "Guest Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4f46e5", // Indigo 600
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err) {
      toast.error('Gateway Connection Error');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="flex h-[calc(100vh-72px)] bg-white overflow-hidden">
      {/* Left: Products Grid */}
      <div className="flex-1 flex flex-col border-r border-slate-100">
        {/* Context Header */}
        <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/pos/floor')} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all">←</button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Table {tableInfo?.number || params.tableId}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dining Area · Active Session</p>
            </div>
          </div>
          <div className="relative w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input className="input !pl-10 !py-2.5 !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10" placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Dynamic Category Pill Filter */}
        <div className="flex gap-3 px-8 py-4 overflow-x-auto bg-white border-b border-slate-100 no-scrollbar">
          <button onClick={() => setActiveCat('all')}
            className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${activeCat === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>All Items</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${activeCat === c.id ? 'text-white shadow-lg' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
              style={activeCat === c.id ? { background: c.color, boxShadow: `0 8px 20px -4px ${c.color}66` } : {}}>
              {c.name}
            </button>
          ))}
        </div>

        {/* High-Fidelity Product Grid */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start bg-slate-50/30">
          {filtered.map((product, idx) => (
            <button 
              key={product.id} 
              onClick={() => handleProductClick(product)}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="group animate-slide-up bg-white border border-slate-100 rounded-3xl p-6 text-left hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative min-h-[200px] flex flex-col"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
                {product.category.name === 'Beverages' ? '☕' : product.category.name === 'Food' ? '🍽️' : product.category.name === 'Snacks' ? '🍟' : '🍰'}
              </div>
              <div className="font-extrabold text-slate-900 mb-1 tracking-tight group-hover:text-indigo-600 transition-colors uppercase text-sm leading-tight flex-1">
                {product.name}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{product.uom || 'Unit'}</div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="text-indigo-600 font-black text-xl tracking-tighter">₹{product.price}</div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">+</div>
              </div>
              {product.tax > 0 && <div className="absolute top-4 right-4 text-[9px] font-extrabold text-indigo-500/50 uppercase tracking-widest">+{product.tax}% Tax</div>}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-400">
              <div className="text-5xl mb-4 opacity-20">🧊</div>
              <p className="font-bold uppercase tracking-widest text-xs">No matching products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Modern Cart Sidebar */}
      <div className="w-[420px] bg-white flex flex-col shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.05)] border-l border-slate-100">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Order Details</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{items.reduce((a, b) => a + b.quantity, 0)} Items</p>
          </div>
          <button onClick={clearCart} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline">Reset</button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {items.map(item => (
            <div key={`${item.productId}-${item.variantId}`} className="group animate-slide-up flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/20 transition-all">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm">
                x{item.quantity}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-sm font-extrabold text-slate-900 leading-tight uppercase tracking-tight">{item.name}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">₹{item.price} per unit</span>
              </div>
              <div className="flex flex-col items-end justify-between py-0.5">
                <button onClick={() => removeItem(item.productId, item.variantId)} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                <div className="text-slate-900 font-extrabold text-sm tracking-tighter">₹{(item.price * item.quantity).toFixed(0)}</div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-32 flex flex-col items-center gap-4 opacity-30">
              <div className="text-5xl">🛒</div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Modern Checkout Section */}
        <div className="p-8 bg-slate-50/80 border-t border-slate-100 space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-900">₹{subtotal().toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Estimated Tax</span>
              <span className="text-indigo-600">₹{totalTax().toFixed(0)}</span>
            </div>
            <div className="w-full h-px bg-slate-200/60 my-2" />
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Total Payable</span>
              <span className="text-3xl font-black text-indigo-600 tracking-tighter shadow-indigo-100 drop-shadow-sm">₹{total().toFixed(0)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-3 pt-4">
            <button 
              onClick={sendToKitchen} 
              disabled={loading || items.length === 0} 
              className="col-span-3 btn-primary !rounded-2xl !py-4 shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform"
            >
              {loading ? 'Processing...' : '🚀 Place Order'}
            </button>
            <button 
              onClick={() => orderId && setShowPayment(true)} 
              disabled={!orderId}
              className={`col-span-2 flex items-center justify-center rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${orderId ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-indigo-500/5' : 'border-slate-200 text-slate-300 cursor-not-allowed'}`}
            >
              Payment
            </button>
          </div>
        </div>
      </div>

      {/* Premium Payment Modal Overlay */}
      {showPayment && !showThankYou && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] w-full max-w-md p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            {showQR ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">📱</div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Scan & Pay</h2>
                <p className="text-slate-500 font-medium text-sm mb-8">Amount to pay: <span className="text-indigo-600 font-black">₹{total().toFixed(0)}</span></p>
                <div className="flex justify-center mb-8 p-6 bg-white border-2 border-slate-100 rounded-[32px] shadow-sm">
                  <QRCode value={upiUrl} />
                </div>
                <div className="flex gap-4">
                  <button onClick={confirmPay} disabled={loading} className="btn-primary flex-1 !rounded-2xl !py-4">Confirm Paid ✓</button>
                  <button onClick={() => setShowQR(false)} className="btn-secondary !rounded-2xl !py-4">Back</button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">💳</div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Complete Payment</h2>
                <p className="text-slate-500 font-medium mb-10">Select your preferred transaction method</p>
                
                <div className="space-y-4 mb-10">
                  {[
                    { id: 'CASH', icon: '💵', label: 'Cash Payment', desc: 'Settle at counter', enabled: config?.cashEnabled },
                    { id: 'DIGITAL', icon: '💳', label: 'Card / Debit', desc: 'Secure terminal pay', enabled: config?.digitalEnabled },
                    { id: 'UPI', icon: '📱', label: 'Instant UPI', desc: 'Scan any QR app', enabled: config?.upiEnabled }
                  ].filter(m => m.enabled).map((m) => (
                    <button 
                      key={m.id}
                      onClick={() => setPayMethod(m.id as any)} 
                      className={`w-full p-6 bg-white rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${payMethod === m.id ? 'border-indigo-600 shadow-xl shadow-indigo-500/10' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-5">
                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{m.icon}</span>
                        <div>
                          <div className="font-black text-slate-900 uppercase tracking-tight text-sm">{m.label}</div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">{m.desc}</div>
                        </div>
                      </div>
                      {payMethod === m.id && <div className="absolute top-4 right-4 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-indigo-600/30">✓</div>}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button onClick={handlePay} disabled={loading} className="btn-primary flex-1 !rounded-2xl !py-5 shadow-2xl shadow-indigo-600/20 text-lg">Process <span className="opacity-50 ml-1">→</span></button>
                  <button onClick={() => setShowPayment(false)} className="btn-secondary !rounded-2xl !py-5">Cancel</button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Modern Success State */}
      {showThankYou && (
        <div className="fixed inset-0 bg-white z-[60] flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div 
              initial={{ rotate: -45 }}
              animate={{ rotate: 0 }}
              className="text-[120px] mb-8 drop-shadow-2xl"
            >
              💖
            </motion.div>
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Your meal is on its way!</h2>
            <p className="text-indigo-600 font-black uppercase tracking-[0.4em] text-sm opacity-60">Payment successfully processed</p>
            <div className="mt-12 flex justify-center">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-1 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-1 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-1 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Variant Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-50">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold">✨</div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{selectedProduct.name}</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Customize your selection</p>
              </div>
            </div>

            <div className="space-y-8 mb-10">
              {/* Group variants by attribute */}
              {Array.from(new Set(selectedProduct.variants.map(v => v.attribute))).map(attr => (
                <div key={attr} className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{attr}</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.variants.filter(v => v.attribute === attr).map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariants({ ...selectedVariants, [attr]: { id: v.id, price: v.extraPrice, value: v.value } })}
                        className={`px-6 py-3 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest ${selectedVariants[attr]?.id === v.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-500/10' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {v.value} {v.extraPrice > 0 && <span className="ml-2 opacity-50">+₹{v.extraPrice}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={confirmVariant} 
                className="btn-primary flex-1 !rounded-2xl !py-5 shadow-2xl shadow-indigo-600/20 text-lg uppercase font-black tracking-widest"
              >
                Confirm Addition
              </button>
              <button onClick={() => setSelectedProduct(null)} className="btn-secondary !rounded-2xl !py-5 uppercase font-black tracking-widest">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

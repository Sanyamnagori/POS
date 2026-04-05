'use client';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import QRCode from 'qrcode';

interface OrderItem {
  id: string; quantity: number; price: number; product: { name: string };
}
interface Order {
  id: string; status: string; total: number; table?: { number: string };
  items: OrderItem[];
}
interface Config {
  upiEnabled: boolean;
  upiId?: string;
}

export default function CustomerDisplayPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [paid, setPaid] = useState(false);
  const [qrSrc, setQrSrc] = useState<string>('');
  const [config, setConfig] = useState<Config>({ upiEnabled: false });
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    fetch('/api/pos-config').then(r => r.json()).then(setConfig);
    
    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
        timeout: 20000,
      });
      socketRef.current = socket;
      
      socket.on('connect', () => console.log('Customer display socket connected'));
      socket.on('connect_error', (err) => console.warn('Customer display socket error:', err.message));
      
      socket.on('ORDER_UPDATE', (data: Order) => { setOrder(data); setPaid(false); });
      socket.on('PAYMENT_DONE', () => { setPaid(true); setTimeout(() => { setOrder(null); setPaid(false); }, 5000); });
      return () => { socket.disconnect(); };
    } catch (e) {
      console.error('Socket error:', e);
    }
  }, []);

  useEffect(() => {
    if (order && config.upiEnabled && config.upiId) {
      const upiLink = `upi://pay?pa=${config.upiId}&pn=Odoo%20Cafe&am=${order.total}&cu=INR`;
      QRCode.toDataURL(upiLink).then(setQrSrc);
    } else {
      setQrSrc('');
    }
  }, [order, config]);

  return (
    <div className="min-h-screen bg-white flex font-sans overflow-hidden">
      {/* Left: Branding & Payment Instruction */}
      <div className="w-[45%] flex flex-col items-center justify-between p-16 border-r border-slate-100 bg-slate-50/30">
        <div className="text-center">
            <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-5xl mb-8 mx-auto shadow-2xl shadow-indigo-600/20 animate-bounce-slow">☕</div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">Odoo POS Cafe</h1>
            <div className="px-6 py-2 bg-indigo-50 rounded-full inline-block">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Premium Merchant POS</span>
            </div>
        </div>

        {qrSrc && !paid ? (
            <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-slide-up">
                <div className="text-center mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Scan to Pay securely</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">UPI Smart Checkout</h3>
                </div>
                <div className="bg-slate-50 p-6 rounded-[32px] mb-6">
                    <img src={qrSrc} alt="UPI QR" className="w-56 h-56 mix-blend-multiply" />
                </div>
                <div className="flex items-center justify-center gap-3">
                    {['GPAY', 'PAYTM', 'PHONEPE'].map(app => (
                        <div key={app} className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center grayscale opacity-40">
                             <span className="text-[8px] font-black">{app}</span>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="space-y-4 text-center">
                <p className="text-slate-400 font-medium italic text-lg leading-relaxed">"Savor the moment, one cup at a time.<br/>Your satisfaction is our primary metric."</p>
                <div className="pt-8 flex gap-4 justify-center">
                    <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">📍 Ground Floor</div>
                    <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">⭐ 4.9 Ratings</div>
                </div>
            </div>
        )}

        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Verified Merchant Terminal · {new Date().getFullYear()}</div>
      </div>

      {/* Right: Dynamic order display */}
      <div className="flex-1 flex flex-col p-16">
        {paid ? (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in">
            <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-6xl text-white shadow-2xl shadow-emerald-500/30 mb-8 animate-scale-in">✓</div>
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 text-center">TRANSACTION SUCCESS</h2>
            <p className="text-xl text-slate-400 font-medium italic text-center">Your order is being synchronized with the kitchen display.</p>
            <div className="mt-12 px-10 py-4 bg-emerald-50 text-emerald-600 rounded-full text-sm font-black uppercase tracking-widest">See you again soon!</div>
          </div>
        ) : order ? (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="flex items-end justify-between mb-12">
                <div>
                   <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">Active Order</h2>
                   {order.table && <span className="text-xs font-black text-indigo-600 uppercase tracking-widest px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">STATION {order.table.number}</span>}
                </div>
            </div>

            <div className="flex-1 bg-slate-50/50 rounded-[48px] p-12 border border-slate-100 overflow-y-auto mb-10">
              <div className="space-y-8">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-[20px] flex items-center justify-center text-xl shadow-sm text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all font-black">
                            {item.quantity}
                        </div>
                        <div>
                            <div className="text-xl font-black text-slate-900 tracking-tight uppercase">{item.product?.name}</div>
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Premium Blend</div>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">
                        ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[48px] p-12 flex items-center justify-between shadow-2xl shadow-slate-900/40">
                <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-1">Final Settlement</p>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Consolidated Total</h3>
                </div>
                <div className="text-6xl font-black text-white tracking-tighter">
                    ₹{order.total?.toLocaleString()}
                </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale scale-110">
            <div className="w-24 h-24 border-8 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-10" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-[0.4em]">Waiting for order...</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Terminal Connectivity Established</p>
          </div>
        )}
      </div>
    </div>
  );
}

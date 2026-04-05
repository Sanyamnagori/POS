'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelfOrder } from '../layout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SelfMenuPage() {
  const { products, categories, token, cart, addToCart, config } = useSelfOrder();
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const isQrOnly = config?.selfOrderMode === 'QR_MENU';

  const filtered = products.filter(p =>
    (activeCat === 'all' || p.category.id === activeCat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Dynamic Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <button 
            onClick={() => router.push(`/s/${token}`)} 
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:text-indigo-600 transition-colors"
          >
            ←
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Menu Registry</h1>
            {isQrOnly && <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">View Only Mode</p>}
          </div>
          <div className="w-10 h-10 flex items-center justify-center">
             {!isQrOnly && cartCount > 0 && (
                <Link href={`/s/${token}/cart`} className="relative w-full h-full bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <span className="text-white text-sm">🛒</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 border-2 border-white rounded-full text-[8px] font-black text-white flex items-center justify-center">{cartCount}</span>
                </Link>
             )}
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
          <input 
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-6 text-xs font-bold focus:ring-2 focus:ring-indigo-600/10 placeholder:text-slate-300" 
            placeholder="Search our selection..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto bg-white border-b border-slate-100 no-scrollbar sticky top-[133px] z-30">
        <button 
          onClick={() => setActiveCat('all')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCat === 'all' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
        >
          All Items
        </button>
        {categories.map(c => (
          <button 
            key={c.id} 
            onClick={() => setActiveCat(c.id)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCat === c.id ? 'text-white' : 'bg-slate-50 text-slate-400'}`}
            style={activeCat === c.id ? { background: c.color, boxShadow: `0 8px 16px -4px ${c.color}66` } : {}}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={p.id} 
              className="bg-white rounded-[32px] p-5 flex items-center gap-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 hover:border-indigo-100 transition-all group"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {p.category.name === 'Beverages' ? '☕' : p.category.name === 'Food' ? '🍽️' : p.category.name === 'Snacks' ? '🍟' : '🍰'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-60">{p.category.name}</span>
                </div>
                <div className="font-black text-slate-900 text-sm uppercase tracking-tight truncate">{p.name}</div>
                {p.description && <div className="text-[10px] font-medium text-slate-400 mt-1 line-clamp-1 italic">“{p.description}”</div>}
                <div className="text-lg font-black text-slate-900 mt-2 tracking-tighter">₹{p.price}</div>
              </div>
              {!isQrOnly && (
                <button 
                  onClick={() => addToCart({ productId: p.id, name: p.name, price: p.price, quantity: 1 })}
                  className="w-12 h-12 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-xl"
                >
                  +
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filtered.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center opacity-30">
            <div className="text-6xl mb-4">🧊</div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">No matching selections</p>
          </div>
        )}
      </div>

      {/* Persistent Checkout Handle */}
      {!isQrOnly && cartCount > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <Link href={`/s/${token}/cart`} className="pointer-events-auto flex items-center justify-between bg-slate-900 text-white px-8 py-5 rounded-[28px] shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all group">
            <div className="flex flex-col items-start">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Your Selection</span>
               <span className="text-sm font-black uppercase tracking-widest">{cartCount} Item{cartCount > 1 ? 's' : ''} in Bag</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-xs font-black uppercase tracking-widest opacity-80 group-hover:mr-2 transition-all">Review Order</span>
               <span className="text-xl">→</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

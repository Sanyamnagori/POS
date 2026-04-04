'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelfOrder } from '../layout';
import Link from 'next/link';

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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => router.push(`/s/${token}`)} className="text-slate-400 text-sm">←</button>
          <h1 className="font-bold text-white">Menu</h1>
          {!isQrOnly && cartCount > 0 && (
            <Link href={`/s/${token}/cart`} className="relative">
              <span className="text-xl">🛒</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 rounded-full text-xs text-white flex items-center justify-center">{cartCount}</span>
            </Link>
          )}
          {isQrOnly ? <span className="text-xs text-amber-400">View Only</span> : cartCount === 0 && <span className="w-6" />}
        </div>
        <input className="input text-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-slate-900/60 border-b border-slate-800">
        <button onClick={() => setActiveCat('all')}
          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${activeCat === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${activeCat === c.id ? 'text-white' : 'bg-slate-800 text-slate-400'}`}
            style={activeCat === c.id ? { background: c.color } : {}}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="flex-1 p-4 space-y-3 pb-20">
        {filtered.map(p => (
          <div key={p.id} className="card flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {p.category.name === 'Beverages' ? '☕' : p.category.name === 'Food' ? '🍽️' : p.category.name === 'Snacks' ? '🍟' : '🍰'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">{p.name}</div>
              {p.description && <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>}
              <div className="text-sky-400 font-bold mt-1">₹{p.price}</div>
            </div>
            {!isQrOnly && (
              <button onClick={() => addToCart({ productId: p.id, name: p.name, price: p.price, quantity: 1 })}
                className="w-8 h-8 bg-sky-500 rounded-full text-white font-bold hover:bg-sky-600 transition-colors flex items-center justify-center">+</button>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-500 py-12">No items found</div>}
      </div>

      {/* Bottom Cart */}
      {!isQrOnly && cartCount > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4">
          <Link href={`/s/${token}/cart`} className="btn-primary w-full flex items-center justify-between px-6 py-3 rounded-2xl">
            <span>{cartCount} item(s)</span>
            <span>View Cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}

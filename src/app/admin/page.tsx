'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BackendPage() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, tables: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [reportRes, productsRes, tablesRes] = await Promise.all([
          fetch('/api/reports?period=today'),
          fetch('/api/products'),
          fetch('/api/tables'),
        ]);
        const report = reportRes.ok ? await reportRes.json() : {};
        const products = productsRes.ok ? await productsRes.json() : [];
        const tables = tablesRes.ok ? await tablesRes.json() : [];
        setStats({
          orders: (report || {}).totalOrders || 0,
          revenue: (report || {}).totalRevenue || 0,
          products: Array.isArray(products) ? products.length : 0,
          tables: Array.isArray(tables) ? tables.length : 0,
        });
      } catch {}
    }
    load();
  }, []);

  const cards = [
    { label: "Today's Orders", value: stats.orders, icon: '🧾', color: 'sky' },
    { label: "Today's Revenue", value: `₹${stats.revenue.toFixed(0)}`, icon: '💰', color: 'emerald' },
    { label: 'Products', value: stats.products, icon: '🍽️', color: 'violet' },
    { label: 'Tables', value: stats.tables, icon: '🪑', color: 'amber' },
  ];

  const quickLinks = [
    { href: '/admin/categories', label: 'Manage Categories', icon: '🏷️', desc: 'Add/edit menu categories' },
    { href: '/admin/products', label: 'Manage Products', icon: '🍽️', desc: 'Add/edit menu items' },
    { href: '/admin/floors', label: 'Floor & Tables', icon: '🪑', desc: 'Set up dining area' },
    { href: '/admin/payment-methods', label: 'Payment Methods', icon: '💳', desc: 'Configure cash, UPI, digital' },
    { href: '/admin/sessions', label: 'Open POS Session', icon: '🖥️', desc: 'Start a register session' },
    { href: '/pos/floor', label: 'POS Terminal', icon: '🚀', desc: 'Launch point of sale' },
    { href: '/kitchen', label: 'Kitchen Display', icon: '🍳', desc: 'View and manage orders' },
    { href: '/reports', label: 'Reports', icon: '📊', desc: 'Analytics and insights' },
  ];

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-950 min-h-screen font-sans text-slate-200">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Back-Office Insights</h1>
          <p className="text-slate-400 font-medium italic">Overview of your cafe&apos;s real-time performance and operations.</p>
        </div>
        <div className="flex bg-dark-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
          <div className="px-4 py-2 text-xs font-black text-primary uppercase tracking-widest border-r border-white/10">Live Sync</div>
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Active Session</div>
        </div>
      </div>

      {/* High-Fidelity Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {cards.map((card, idx) => (
          <div 
            key={card.label} 
            style={{ animationDelay: `${idx * 100}ms` }}
            className="group animate-slide-up bg-dark-900/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/5 shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color === 'sky' ? 'indigo' : card.color}-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors`} />
            <div className="flex items-start justify-between mb-8 relative">
              <div className={`w-14 h-14 bg-${card.color === 'sky' ? 'indigo' : card.color}-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-${card.color === 'sky' ? 'indigo' : card.color}-100 transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
              <div className={`px-3 py-1 bg-${card.color === 'sky' ? 'indigo' : card.color}-100/50 text-${card.color === 'sky' ? 'indigo' : card.color}-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-${card.color === 'sky' ? 'indigo' : card.color}-100`}>
                Today
              </div>
            </div>
            <div className="relative">
              <div className="text-4xl font-black text-white tracking-tighter mb-1">{card.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Actions */}
      <div className="mb-8 flex items-center gap-4">
        <h2 className="text-xl font-black text-white tracking-tight uppercase">Operational Hub</h2>
        <div className="flex-1 h-px bg-slate-200/60" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link, idx) => (
          <Link 
            key={link.href} 
            href={link.href}
            style={{ animationDelay: `${idx * 50}ms` }}
            className="group animate-slide-up bg-dark-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col items-start text-left"
          >
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
              {link.icon}
            </div>
            <div className="font-extrabold text-white group-hover:text-primary transition-colors text-lg tracking-tight mb-2 uppercase">{link.label}</div>
            <div className="text-xs text-slate-500 font-medium leading-relaxed italic pr-4">{link.desc}</div>
            <div className="mt-8 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Launch Module →</div>
          </Link>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="mt-20 pt-10 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Core Systems Operational</span>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Build v1.0.4-stable · 2026 Odoo Professional POS Suite
        </div>
      </div>
    </div>
  );
}

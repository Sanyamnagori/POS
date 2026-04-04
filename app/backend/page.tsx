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
        const report = await reportRes.json();
        const products = await productsRes.json();
        const tables = await tablesRes.json();
        setStats({
          orders: report.totalOrders || 0,
          revenue: report.totalRevenue || 0,
          products: products.length || 0,
          tables: tables.length || 0,
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
    { href: '/backend/categories', label: 'Manage Categories', icon: '🏷️', desc: 'Add/edit menu categories' },
    { href: '/backend/products', label: 'Manage Products', icon: '🍽️', desc: 'Add/edit menu items' },
    { href: '/backend/floors', label: 'Floor & Tables', icon: '🪑', desc: 'Set up dining area' },
    { href: '/backend/payment-methods', label: 'Payment Methods', icon: '💳', desc: 'Configure cash, UPI, digital' },
    { href: '/backend/sessions', label: 'Open POS Session', icon: '🖥️', desc: 'Start a register session' },
    { href: '/pos/floor', label: 'POS Terminal', icon: '🚀', desc: 'Launch point of sale' },
    { href: '/kitchen', label: 'Kitchen Display', icon: '🍳', desc: 'View and manage orders' },
    { href: '/reports', label: 'Reports', icon: '📊', desc: 'Analytics and insights' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome to Odoo POS Cafe Management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`badge bg-${card.color}-500/20 text-${card.color}-400`}>Today</span>
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-slate-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className="card hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-200 group cursor-pointer">
            <div className="text-2xl mb-2">{link.icon}</div>
            <div className="font-semibold text-white group-hover:text-sky-400 transition-colors text-sm">{link.label}</div>
            <div className="text-xs text-slate-500 mt-1">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

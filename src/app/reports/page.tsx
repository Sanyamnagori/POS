'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

interface ReportData {
  totalOrders: number; totalRevenue: number; avgOrderValue: number;
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
  topCategories: Array<{ name: string; revenue: number }>;
  dailySales: Record<string, number>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      setData(await res.json());
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [period]);

  const salesEntries = data ? Object.entries(data.dailySales) : [];
  const maxSale = salesEntries.length > 0 ? Math.max(...salesEntries.map(([, v]) => v)) : 1;
  const totalCatRevenue = data?.topCategories.reduce((s, c) => s + c.revenue, 0) || 1;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-white">Reports</h1><p className="text-slate-400">Sales analytics and insights</p></div>
          <div className="flex gap-2">
            {['today', 'weekly', 'monthly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize ${period === p ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="text-slate-400 text-center py-24">Loading...</div> : !data ? null : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Orders', value: data.totalOrders, icon: '🧾', color: 'sky' },
                { label: 'Revenue', value: `₹${data.totalRevenue.toFixed(0)}`, icon: '💰', color: 'emerald' },
                { label: 'Avg Order Value', value: `₹${data.avgOrderValue.toFixed(0)}`, icon: '📈', color: 'violet' },
              ].map(m => (
                <div key={m.label} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{m.icon}</span>
                    <span className={`badge bg-${m.color}-500/20 text-${m.color}-400 capitalize`}>{period}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{m.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Sales chart */}
              <div className="col-span-2 card">
                <h2 className="font-semibold text-white mb-4">Revenue by Day</h2>
                {salesEntries.length > 0 ? (
                  <div className="flex items-end gap-1 h-40">
                    {salesEntries.map(([day, val]) => (
                      <div key={day} className="flex-1 flex flex-col items-center justify-end gap-1">
                        <div className="text-xs text-sky-400">₹{val.toFixed(0)}</div>
                        <div className="w-full bg-sky-500/20 rounded-t hover:bg-sky-500/40 transition-colors"
                          style={{ height: `${(val / maxSale) * 120}px`, minHeight: '4px' }} />
                        <div className="text-xs text-slate-500 rotate-45 origin-left">{day.slice(0, 5)}</div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-slate-500 text-center py-12 text-sm">No sales data for this period</div>}
              </div>

              {/* Categories */}
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Top Categories</h2>
                <div className="space-y-3">
                  {data.topCategories.length > 0 ? data.topCategories.map(cat => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{cat.name}</span>
                        <span className="text-sky-400">₹{cat.revenue.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-sky-500 rounded-full h-1.5 transition-all" style={{ width: `${(cat.revenue / totalCatRevenue) * 100}%` }} />
                      </div>
                    </div>
                  )) : <div className="text-slate-500 text-sm text-center py-8">No data</div>}
                </div>
              </div>

              {/* Top products */}
              <div className="col-span-3 card">
                <h2 className="font-semibold text-white mb-4">Top Products</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Qty Sold</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.length > 0 ? data.topProducts.map((p, i) => (
                      <tr key={p.name} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-2 text-white">#{i + 1} {p.name}</td>
                        <td className="py-2 text-right text-slate-300">{p.qty}</td>
                        <td className="py-2 text-right text-sky-400 font-semibold">₹{p.revenue.toFixed(0)}</td>
                      </tr>
                    )) : <tr><td colSpan={3} className="text-center py-8 text-slate-500">No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/frontend/components/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
  topCategories: Array<{ name: string; revenue: number }>;
  dailySales: Record<string, number>;
  hourlyDistribution: Record<string, { orders: number; revenue: number }>;
  paymentBreakdown: Array<{ method: string; count: number; total: number }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [period]);

  if (loading && !data) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // ── Chart data ──
  const lineData = {
    labels: data ? Object.keys(data.dailySales).map(d => d.split('-').slice(1).join('/')) : [],
    datasets: [{
      label: 'Daily Revenue',
      data: data ? Object.values(data.dailySales) : [],
      borderColor: 'rgb(79, 70, 229)',
      backgroundColor: 'rgba(79, 70, 229, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    }]
  };

  const pieData = {
    labels: data?.topCategories.map(c => c.name) || [],
    datasets: [{
      data: data?.topCategories.map(c => c.revenue) || [],
      backgroundColor: [
        'rgba(79, 70, 229, 0.85)', 'rgba(16, 185, 129, 0.85)',
        'rgba(245, 158, 11, 0.85)', 'rgba(239, 68, 68, 0.85)',
        'rgba(139, 92, 246, 0.85)', 'rgba(236, 72, 153, 0.85)',
        'rgba(14, 165, 233, 0.85)', 'rgba(249, 115, 22, 0.85)',
        'rgba(34, 197, 94, 0.85)', 'rgba(168, 85, 247, 0.85)',
      ],
      borderWidth: 0,
    }]
  };

  const hourlyData = {
    labels: data?.hourlyDistribution ? Object.keys(data.hourlyDistribution) : [],
    datasets: [{
      label: 'Orders per Hour',
      data: data?.hourlyDistribution ? Object.values(data.hourlyDistribution).map(h => h.orders) : [],
      backgroundColor: 'rgba(79, 70, 229, 0.6)',
      borderColor: 'rgb(79, 70, 229)',
      borderWidth: 1,
      borderRadius: 8,
      barPercentage: 0.7,
    }]
  };

  const paymentData = {
    labels: data?.paymentBreakdown?.map(p => p.method) || [],
    datasets: [{
      data: data?.paymentBreakdown?.map(p => p.total) || [],
      backgroundColor: ['rgba(16, 185, 129, 0.85)', 'rgba(79, 70, 229, 0.85)', 'rgba(245, 158, 11, 0.85)'],
      borderWidth: 0,
    }]
  };

  const totalPayments = data?.paymentBreakdown?.reduce((s, p) => s + p.count, 0) || 0;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        {/* Header Block */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Analytics Engine</h1>
            <p className="text-slate-500 font-medium italic">Operational intelligence and financial performance analytics.</p>
          </div>
          <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {['today', 'weekly', 'monthly'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${period === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`, icon: '💰', color: 'indigo' },
            { label: 'Orders', value: data?.totalOrders || 0, icon: '🧾', color: 'emerald' },
            { label: 'Avg. Order Value', value: `₹${(data?.avgOrderValue || 0).toFixed(0)}`, icon: '📈', color: 'amber' },
            { label: 'Transactions', value: totalPayments, icon: '💳', color: 'violet' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-xl shadow-slate-200/20 group hover:scale-[1.02] transition-transform">
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 bg-${card.color}-50 text-${card.color}-600 rounded-2xl flex items-center justify-center text-2xl font-bold`}>{card.icon}</div>
                <div className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{period}</div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{card.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue Trend + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-5 bg-indigo-600 rounded-full" />
              Revenue Trend
            </h3>
            <div className="h-[280px]">
              {data ? <Line data={lineData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 'bold' } } }, x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } } }, plugins: { legend: { display: false } } }} /> : null}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              Category Mix
            </h3>
            <div className="flex-1 flex items-center justify-center min-h-[220px]">
              {data ? <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold', size: 9 }, padding: 12 } } } }} /> : null}
            </div>
          </div>
        </div>

        {/* Hourly Distribution + Payment Method */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              Peak Hours Analysis
            </h3>
            <div className="h-[250px]">
              {data ? <Bar data={hourlyData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 'bold' } } }, x: { grid: { display: false }, ticks: { font: { size: 9 } } } }, plugins: { legend: { display: false } } }} /> : null}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-5 bg-violet-500 rounded-full" />
              Payment Methods
            </h3>
            <div className="flex-1 flex items-center justify-center min-h-[180px]">
              {data ? <Doughnut data={paymentData} options={{ maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold', size: 10 }, padding: 14 } } } }} /> : null}
            </div>
            {/* Payment Details */}
            <div className="mt-4 space-y-2">
              {data?.paymentBreakdown?.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.method}</span>
                  <span className="text-xs font-black text-slate-900 tracking-tight">₹{parseFloat(String(p.total)).toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-slate-400 font-bold">({p.count})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="w-1.5 h-5 bg-rose-500 rounded-full" />
            Top Selling Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-8">#</th>
                  <th className="text-left py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Product</th>
                  <th className="text-center py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Units Sold</th>
                  <th className="text-right py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.topProducts.map((p, idx) => (
                  <tr key={idx} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx < 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{p.name}</div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-4 py-1.5 bg-slate-50 rounded-xl text-xs font-black text-slate-600 tracking-tight">{p.qty}</span>
                    </td>
                    <td className="py-4 text-right font-black text-indigo-600 tracking-tighter text-lg">
                      ₹{parseFloat(String(p.revenue)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between opacity-40">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Report generated in real-time from SQL aggregation pipeline</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">v2.0 Analytics Engine</span>
        </div>
      </main>
    </div>
  );
}

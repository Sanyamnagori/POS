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
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
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
);

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
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
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [period]);

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

  const lineData = {
    labels: data ? Object.keys(data.dailySales).map(d => d.split('-').slice(1).join('/')) : [],
    datasets: [
      {
        label: 'Daily Revenue',
        data: data ? Object.values(data.dailySales) : [],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  const pieData = {
    labels: data?.topCategories.map(c => c.name) || [],
    datasets: [
      {
        data: data?.topCategories.map(c => c.revenue) || [],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        {/* Header Block */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Menu Reporting</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {[
            { label: 'Merchant Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'indigo', growth: '+12.5%' },
            { label: 'Total Volume', value: data?.totalOrders || 0, icon: '🧾', color: 'emerald', growth: '+8.2%' },
            { label: 'AOV Index', value: `₹${(data?.avgOrderValue || 0).toLocaleString()}`, icon: '📈', color: 'amber', growth: '-2.1%' }
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 group hover:scale-[1.02] transition-transform">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 bg-${card.color}-50 text-${card.color}-600 rounded-2xl flex items-center justify-center text-3xl font-bold`}>{card.icon}</div>
                <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.growth}</div>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{card.value}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Dynamic Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              Revenue Performance Trend
            </h3>
            <div className="h-[300px]">
              {data ? <Line data={lineData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }} /> : null}
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              Category Liquidity
            </h3>
            <div className="flex-1 flex items-center justify-center min-h-[250px]">
              {data ? <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold', size: 10 } } } } }} /> : null}
            </div>
          </div>
        </div>

        {/* Detailed Inventory Performance */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
            Product Liquidity Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Specification</th>
                  <th className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory Volume</th>
                  <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross Liquidity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.topProducts.map((p, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">{idx + 1}</div>
                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{p.name}</div>
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <span className="px-4 py-2 bg-slate-50 rounded-2xl text-xs font-black text-slate-600 tracking-tight">{p.qty} Units</span>
                    </td>
                    <td className="py-5 text-right font-black text-indigo-600 tracking-tighter text-lg">
                      ₹{p.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/useCartStore';

interface Table {
  id: string; number: string; seats: number; isActive: boolean;
  floor: { name: string };
  orders?: Array<{ status: string }>;
}
interface Floor { id: string; name: string; tables: Table[]; }

export default function FloorPage() {
  const router = useRouter();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, boolean>>({});
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const { setTable } = useCartStore();

  async function load() {
    const [floorRes, orderRes] = await Promise.all([
      fetch('/api/floors'),
      fetch('/api/orders?status=SENT'),
    ]);
    const floorsData = await floorRes.json();
    const orders = await orderRes.json();
    setFloors(floorsData);
    if (floorsData.length > 0 && !selectedFloor) setSelectedFloor(floorsData[0].id);
    const map: Record<string, boolean> = {};
    orders.forEach((o: { tableId: string }) => { if (o.tableId) map[o.tableId] = true; });
    setActiveOrders(map);
  }

  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, []);

  function selectTable(table: Table) {
    setTable(table.id);
    router.push(`/pos/order/${table.id}`);
  }

  const currentFloor = floors.find(f => f.id === selectedFloor);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Hospitality Floor</h1>
          <p className="text-slate-500 font-medium">Select a table to manage orders or start a new service.</p>
        </div>
        
        {/* Floor Selection */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
          {floors.map(f => (
            <button 
              key={f.id} 
              onClick={() => setSelectedFloor(f.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedFloor === f.id ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
            >
              {f.name}
            </button>
          ))}
          {floors.length === 0 && <span className="px-4 py-2 text-slate-400 text-xs font-bold uppercase tracking-widest leading-8">No Floors</span>}
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-6 mb-8 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-lg bg-white border border-slate-200 shadow-sm" /> 
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-lg bg-amber-500 shadow-lg shadow-amber-500/20" /> 
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occupied</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-lg bg-slate-200 border border-slate-300" /> 
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reserved/Inactive</span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {currentFloor?.tables.map((table, idx) => {
          const occupied = activeOrders[table.id];
          return (
            <button
              key={table.id}
              onClick={() => table.isActive && selectTable(table)}
              disabled={!table.isActive}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`table-card group animate-slide-up ${occupied ? 'occupied' : ''} ${!table.isActive ? 'opacity-50 grayscale cursor-not-allowed bg-slate-100 border-dashed' : ''}`}
            >
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-300 ${occupied ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                  {occupied ? '🍽️' : '🪑'}
                </div>
                {occupied && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              
              <div className="text-center">
                <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-lg">Table {table.number}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{table.seats} Guest Seats</div>
              </div>

              {occupied ? (
                <div className="mt-2 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">Active Order</div>
              ) : table.isActive ? (
                <div className="mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Select</div>
              ) : null}
            </button>
          );
        })}
        
        {currentFloor?.tables.length === 0 && (
          <div className="col-span-full card py-24 flex flex-col items-center justify-center border-dashed border-2 bg-slate-50/50">
            <div className="text-4xl mb-4 opacity-20">🌫️</div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Design your floor layout in backend</p>
          </div>
        )}
      </div>
    </div>
  );
}

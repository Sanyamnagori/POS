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
    <div className="p-6">
      {/* Floor tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {floors.map(f => (
          <button key={f.id} onClick={() => setSelectedFloor(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedFloor === f.id ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {f.name}
          </button>
        ))}
        {floors.length === 0 && <span className="text-slate-500 text-sm">No floors configured. Go to Backend → Floors & Tables</span>}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-700 border border-slate-600" /> Available</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500" /> Occupied</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-900/40 border border-red-800" /> Inactive</div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentFloor?.tables.map(table => {
          const occupied = activeOrders[table.id];
          return (
            <button
              key={table.id}
              onClick={() => table.isActive && selectTable(table)}
              disabled={!table.isActive}
              className={`table-card text-center ${occupied ? 'occupied' : ''} ${!table.isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl">{occupied ? '🍽️' : '🪑'}</div>
              <div className="font-bold text-white">{table.number}</div>
              <div className="text-xs text-slate-400">{table.seats} seats</div>
              {occupied && <div className="text-xs text-amber-400 font-medium">Occupied</div>}
            </button>
          );
        })}
        {currentFloor?.tables.length === 0 && (
          <div className="col-span-6 card text-center text-slate-500 py-12">No tables on this floor.</div>
        )}
      </div>
    </div>
  );
}

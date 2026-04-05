'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/useCartStore';
import { motion } from 'framer-motion';

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
    try {
      const [floorRes, orderRes] = await Promise.all([
        fetch('/api/floors'),
        fetch('/api/orders?status=SENT'),
      ]);
      const floorsData = await floorRes.json();
      const orders = await orderRes.json();
      
      if (Array.isArray(floorsData)) {
        setFloors(floorsData);
        if (floorsData.length > 0 && !selectedFloor) setSelectedFloor(floorsData[0].id);
      } else {
        console.error('Floors data is not an array:', floorsData);
      }

      if (Array.isArray(orders)) {
        const map: Record<string, boolean> = {};
        orders.forEach((o: { tableId: string }) => { if (o.tableId) map[o.tableId] = true; });
        setActiveOrders(map);
      }
    } catch (e) {
      console.error('Error loading floor data:', e);
    }
  }

  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, []);

  function selectTable(table: Table) {
    setTable(table.id);
    router.push(`/pos/order/${table.id}`);
  }

  const currentFloor = floors.find(f => f.id === selectedFloor);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 15 } }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto text-white">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-widest uppercase mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Hospitality Grid</h1>
          <p className="text-white/50 font-bold uppercase tracking-widest text-xs">Select targeting quadrant for terminal initialization.</p>
        </div>
        
        {/* Floor Selection */}
        <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {floors.map(f => (
            <button 
              key={f.id} 
              onClick={() => setSelectedFloor(f.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${selectedFloor === f.id ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {f.name}
            </button>
          ))}
          {floors.length === 0 && <span className="px-4 py-2 text-white/30 text-xs font-black uppercase tracking-widest leading-8">Offline</span>}
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-6 mb-8 px-2 bg-black/20 p-4 rounded-xl border border-white/5 inline-flex backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-white/20 border-2 border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.2)]" /> 
          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.8)]" /> 
          <span className="text-[10px] font-black text-accent-400 uppercase tracking-[0.2em]">Active</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-black border-2 border-white/10" /> 
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Disabled</span>
        </div>
      </div>

      {/* Tables Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={selectedFloor}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        {currentFloor?.tables.map((table) => {
          const occupied = activeOrders[table.id];
          return (
            <motion.button
              variants={itemVariants}
              key={table.id}
              onClick={() => table.isActive && selectTable(table)}
              disabled={!table.isActive}
              className={`table-card group ${occupied ? 'occupied' : ''} ${!table.isActive ? 'opacity-30 grayscale cursor-not-allowed bg-black/40 border-white/5 border-dashed' : ''}`}
            >
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-500 shadow-inner ${occupied ? 'bg-accent/20 text-accent border border-accent/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-white/30 group-hover:bg-primary/20 group-hover:text-primary group-hover:border group-hover:border-primary/50 border border-white/5'}`}>
                  {occupied ? '🍽️' : '🪑'}
                </div>
                {occupied && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full border border-white/20 animate-[pulse-glow_2s_infinite] shadow-[0_0_15px_rgba(139,92,246,1)]" />
                )}
                
                <div className="text-center mt-4">
                  <div className="font-black text-white group-hover:text-primary transition-colors uppercase tracking-widest text-lg drop-shadow-md">T-{table.number}</div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">{table.seats} Units</div>
                </div>

                {occupied ? (
                  <div className="mt-4 px-4 py-1.5 bg-accent/20 border border-accent/50 text-accent text-[10px] font-black rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.3)]">In Progress</div>
                ) : table.isActive ? (
                  <div className="mt-4 px-4 py-1.5 bg-primary/20 border border-primary/50 text-primary text-[10px] font-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.3)]">Init Setup</div>
                ) : null}
              </div>
            </motion.button>
          );
        })}
        
        {currentFloor?.tables.length === 0 && (
           <div className="col-span-full card py-32 flex flex-col items-center justify-center border-dashed border-2 bg-black/20 border-white/10">
             <div className="text-5xl mb-6 opacity-20 grayscale">🌫️</div>
             <p className="text-white/40 font-black uppercase tracking-widest text-sm text-center">Uncharted Sector<br/><span className="text-[10px] opacity-60">Design schematic in Admin terminal</span></p>
           </div>
        )}
      </motion.div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Floor { id: string; name: string; tables: Table[]; }
interface Table { id: string; number: string; seats: number; isActive: boolean; tableType?: string; qrTokens?: Array<{ token: string }> }

export default function FloorsPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [floorName, setFloorName] = useState('');
  const [tableForm, setTableForm] = useState({ floorId: '', number: '', seats: '4', tableType: 'Table' });
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch('/api/floors');
    const data = await res.json();
    setFloors(Array.isArray(data) ? data : []);
  }
  useEffect(() => { load(); }, []);

  async function createFloor(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/floors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: floorName }) });
    setFloorName(''); toast.success('Floor created!'); load();
  }

  async function createTable(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tableForm) });
    setTableForm({ ...tableForm, number: '', tableType: 'Table' }); toast.success('Table added!'); load();
  }

  async function toggleTable(id: string, isActive: boolean) {
    await fetch(`/api/tables/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) });
    load();
  }

  async function generateQR(tableId: string) {
    const res = await fetch('/api/qr-tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableId }) });
    const data = await res.json();
    const url = `${window.location.host === 'localhost:3000' ? 'http://' : 'https://'}${window.location.host}/s/${data.token}`;
    setQrMap(prev => ({ ...prev, [tableId]: url }));
    toast.success('QR URL copied to clipboard!');
    navigator.clipboard.writeText(url);
  }

  async function deleteTable(id: string) {
    if (!confirm('Are you sure you want to remove this unit?')) return;
    await fetch(`/api/tables/${id}`, { method: 'DELETE' });
    toast.success('Unit removed from floor'); load();
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-950 min-h-screen font-sans text-slate-200">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Space Management</h1>
          <p className="text-slate-500 font-medium italic">Architect your dining environment and physical table layout.</p>
        </div>
        <div className="flex bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
          <div className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest border-r border-white/10">Active Grid</div>
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Version FL-202</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Creation Blueprints */}
        <div className="space-y-8 animate-slide-up">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl border border-primary/20">🏢</span>
              New Sector
            </h3>
            <form onSubmit={createFloor} className="space-y-6">
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                placeholder="Floor Name (e.g. Roof Top)" 
                value={floorName} 
                onChange={e => setFloorName(e.target.value)} 
                required 
              />
              <button type="submit" className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px]">Initialize Sector</button>
            </form>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl border border-primary/20">🪑</span>
              New Unit
            </h3>
            <form onSubmit={createTable} className="space-y-6">
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none" 
                value={tableForm.floorId} 
                onChange={e => setTableForm({...tableForm, floorId: e.target.value})} 
                required
              >
                <option value="" className="bg-slate-900 text-slate-500">Target Sector</option>
                {floors.map(f => <option key={f.id} value={f.id} className="bg-slate-900">{f.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                  placeholder="ID (G5)" 
                  value={tableForm.number} 
                  onChange={e => setTableForm({...tableForm, number: e.target.value})} 
                  required 
                />
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none" 
                  value={tableForm.tableType} 
                  onChange={e => setTableForm({...tableForm, tableType: e.target.value})}
                >
                  <option value="Table" className="bg-slate-900 font-sans">Table</option>
                  <option value="Booth" className="bg-slate-900 font-sans">Booth</option>
                  <option value="Bar" className="bg-slate-900 font-sans">Bar</option>
                </select>
              </div>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                type="number" 
                placeholder="Capacity" 
                value={tableForm.seats} 
                onChange={e => setTableForm({...tableForm, seats: e.target.value})} 
              />
              <button type="submit" className="w-full bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-white/20 active:scale-95 transition-all text-[10px] border border-white/10">Deploy Unit</button>
            </form>
          </div>
        </div>

        {/* Live Environment Overview */}
        <div className="lg:col-span-3 space-y-12">
          {floors.map((floor, idx) => (
            <div key={floor.id} style={{ animationDelay: `${idx * 100}ms` }} className="animate-slide-up">
              <div className="flex items-center gap-6 mb-8 px-6">
                <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">📍</span>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">{floor.name}</h3>
                <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-xl backdrop-blur-md">
                  {floor.tables.length} Registered Units
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {floor.tables.map((table, tIdx) => (
                  <div 
                    key={table.id} 
                    style={{ animationDelay: `${tIdx * 40}ms` }}
                    className={`group animate-slide-up bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border transition-all duration-500 relative overflow-hidden ${table.isActive ? 'border-white/5 shadow-2xl hover:border-primary/40 hover:shadow-primary/5' : 'border-rose-500/20 bg-rose-500/5 opacity-40'}`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className={`text-4xl font-black tracking-tighter transition-colors ${table.isActive ? 'text-white group-hover:text-primary' : 'text-rose-500'}`}>{table.number}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2 italic">{table.seats} Seats · {table.tableType}</div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_15px] ${table.isActive ? 'bg-primary shadow-primary animate-pulse' : 'bg-rose-500 shadow-rose-500'}`} />
                        <button onClick={() => deleteTable(table.id)} className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-rose-500 p-2">🗑️</button>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-8">
                      <button 
                        className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${table.isActive ? 'bg-white/5 text-slate-400 hover:bg-primary hover:text-black border border-white/5' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                        onClick={() => toggleTable(table.id, table.isActive)}
                      >
                        {table.isActive ? 'Active' : 'Offline'}
                      </button>
                      <button 
                        className="w-12 h-12 rounded-[18px] bg-white/5 text-slate-500 hover:bg-primary/20 hover:text-primary border border-white/10 flex items-center justify-center transition-all group/qr"
                        onClick={() => generateQR(table.id)}
                      >
                        <span className="text-lg group-hover/qr:scale-110 transition-transform">🔗</span>
                      </button>
                    </div>

                    {qrMap[table.id] && (
                      <div className="mt-4 px-4 py-3 bg-primary/10 rounded-xl text-[9px] font-bold text-primary break-all animate-in slide-in-from-right-4 border border-primary/20 backdrop-blur-md">
                        Linked: {qrMap[table.id]}
                      </div>
                    )}
                  </div>
                ))}
                {floor.tables.length === 0 && (
                  <div className="col-span-full py-24 bg-white/5 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center opacity-30 grayscale">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No units assigned to this operational sector</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {floors.length === 0 && (
            <div className="bg-white/5 border-2 border-dashed border-white/5 rounded-[56px] py-48 flex flex-col items-center justify-center grayscale opacity-30 animate-pulse">
              <div className="text-7xl mb-8">🏜️</div>
              <p className="text-sm font-black uppercase tracking-[0.5em] text-white">Facility architecture undefined</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4">Initialization Required</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

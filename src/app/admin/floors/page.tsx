'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Floor { id: string; name: string; tables: Table[]; }
interface Table { id: string; number: string; seats: number; isActive: boolean; qrTokens?: Array<{ token: string }> }

export default function FloorsPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [floorName, setFloorName] = useState('');
  const [tableForm, setTableForm] = useState({ floorId: '', number: '', seats: '4' });
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch('/api/floors');
    const data = await res.json();
    setFloors(data);
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
    setTableForm({ ...tableForm, number: '' }); toast.success('Table added!'); load();
  }

  async function toggleTable(id: string, isActive: boolean) {
    await fetch(`/api/tables/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) });
    load();
  }

  async function generateQR(tableId: string) {
    const res = await fetch('/api/qr-tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableId }) });
    const data = await res.json();
    const url = `${window.location.origin}/s/${data.token}`;
    setQrMap(prev => ({ ...prev, [tableId]: url }));
    toast.success('QR URL copied to clipboard!');
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-50 min-h-full font-sans">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Space Management</h1>
        <p className="text-slate-500 font-medium italic">Architect your dining environment and physical table layout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Creation Blueprints */}
        <div className="space-y-8 animate-slide-up">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">🏢</span>
              New Floor
            </h3>
            <form onSubmit={createFloor} className="space-y-4">
              <input className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4" placeholder="e.g. Terrace Garden" value={floorName} onChange={e => setFloorName(e.target.value)} required />
              <button type="submit" className="btn-primary w-full !rounded-2xl !py-4 shadow-lg shadow-indigo-600/10 active:scale-95 transition-transform text-xs uppercase tracking-widest font-black">Register Floor</button>
            </form>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">🪑</span>
              New Table
            </h3>
            <form onSubmit={createTable} className="space-y-4">
              <select className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4" value={tableForm.floorId} onChange={e => setTableForm({...tableForm, floorId: e.target.value})} required>
                <option value="">Select Target Floor</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4" placeholder="No. (T5)" value={tableForm.number} onChange={e => setTableForm({...tableForm, number: e.target.value})} required />
                <input className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4 text-center" type="number" placeholder="Seats" value={tableForm.seats} onChange={e => setTableForm({...tableForm, seats: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary w-full !rounded-2xl !py-4 shadow-lg shadow-indigo-600/10 active:scale-95 transition-transform text-xs uppercase tracking-widest font-black">Add to Floor</button>
            </form>
          </div>
        </div>

        {/* Live Environment Overview */}
        <div className="lg:col-span-3 space-y-10">
          {floors.map((floor, idx) => (
            <div key={floor.id} style={{ animationDelay: `${idx * 100}ms` }} className="animate-slide-up">
              <div className="flex items-center gap-4 mb-6 ml-6">
                <span className="text-2xl">📍</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{floor.name}</h3>
                <div className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                  {floor.tables.length} Total Units
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {floor.tables.map((table, tIdx) => (
                  <div 
                    key={table.id} 
                    style={{ animationDelay: `${tIdx * 40}ms` }}
                    className={`group animate-slide-up bg-white rounded-[32px] p-6 border transition-all duration-300 relative overflow-hidden ${table.isActive ? 'border-slate-100 shadow-lg shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-500/5' : 'border-rose-100 bg-rose-50/30 opacity-60'}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className={`text-2xl font-black tracking-tighter ${table.isActive ? 'text-slate-900' : 'text-rose-900'}`}>{table.number}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{table.seats} Capacity</div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${table.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button 
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${table.isActive ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                        onClick={() => toggleTable(table.id, table.isActive)}
                      >
                        {table.isActive ? 'Enabled' : 'Disabled'}
                      </button>
                      <button 
                        className="w-12 py-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 flex items-center justify-center transition-all"
                        onClick={() => generateQR(table.id)}
                      >
                        🔗
                      </button>
                    </div>

                    {qrMap[table.id] && (
                      <div className="mt-4 px-3 py-2 bg-indigo-50 rounded-lg text-[9px] font-bold text-indigo-600 break-all animate-slide-in-right border border-indigo-100">
                        Registry: {qrMap[table.id]}
                      </div>
                    )}
                  </div>
                ))}
                {floor.tables.length === 0 && (
                  <div className="col-span-full py-16 bg-white/40 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center opacity-40">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No units assigned to this floor</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {floors.length === 0 && (
            <div className="bg-white/40 border-2 border-dashed border-slate-100 rounded-[48px] py-40 flex flex-col items-center justify-center grayscale opacity-40">
              <div className="text-6xl mb-6">🏜️</div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-900">Your facility architecture is undefined</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white">Floors & Tables</h1><p className="text-slate-400">Set up your dining area</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Create forms */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3">New Floor</h3>
            <form onSubmit={createFloor} className="space-y-2">
              <input className="input" placeholder="e.g. Ground Floor" value={floorName} onChange={e => setFloorName(e.target.value)} required />
              <button type="submit" className="btn-primary w-full">Add Floor</button>
            </form>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-3">New Table</h3>
            <form onSubmit={createTable} className="space-y-2">
              <select className="input" value={tableForm.floorId} onChange={e => setTableForm({...tableForm, floorId: e.target.value})} required>
                <option value="">Select floor</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <input className="input" placeholder="Table number (e.g. T1)" value={tableForm.number} onChange={e => setTableForm({...tableForm, number: e.target.value})} required />
              <input className="input" type="number" placeholder="Seats" value={tableForm.seats} onChange={e => setTableForm({...tableForm, seats: e.target.value})} />
              <button type="submit" className="btn-primary w-full">Add Table</button>
            </form>
          </div>
        </div>

        {/* Floor list */}
        <div className="lg:col-span-3 space-y-4">
          {floors.map(floor => (
            <div key={floor.id} className="card">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span>🏢</span> {floor.name}
                <span className="badge bg-slate-700 text-slate-400">{floor.tables.length} tables</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {floor.tables.map(table => (
                  <div key={table.id} className={`bg-slate-900 border rounded-lg p-3 ${table.isActive ? 'border-slate-700' : 'border-red-800 opacity-50'}`}>
                    <div className="font-bold text-white text-sm">{table.number}</div>
                    <div className="text-xs text-slate-400">{table.seats} seats</div>
                    <div className="flex gap-1 mt-2">
                      <button className={`text-xs py-0.5 px-2 rounded-md ${table.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                        onClick={() => toggleTable(table.id, table.isActive)}>
                        {table.isActive ? 'Active' : 'Off'}
                      </button>
                      <button className="text-xs py-0.5 px-2 rounded-md bg-sky-500/20 text-sky-400" onClick={() => generateQR(table.id)}>QR</button>
                    </div>
                    {qrMap[table.id] && <div className="text-xs text-sky-400 mt-1 truncate">{qrMap[table.id]}</div>}
                  </div>
                ))}
                {floor.tables.length === 0 && <div className="col-span-4 text-slate-500 text-sm py-4 text-center">No tables. Add one!</div>}
              </div>
            </div>
          ))}
          {floors.length === 0 && <div className="card text-center text-slate-500 py-12">No floors yet. Create one!</div>}
        </div>
      </div>
    </div>
  );
}

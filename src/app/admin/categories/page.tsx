'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', color: '#3b82f6' });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await fetch(`/api/categories/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Updated!'); setEditId(null);
      } else {
        await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Created!');
      }
      setForm({ name: '', color: '#3b82f6' });
      load();
    } catch { toast.error('Error'); } finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    toast.success('Deleted!'); load();
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-50 min-h-full font-sans">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Menu Taxonomy</h1>
        <p className="text-slate-500 font-medium italic">Organize your offerings with logical groupings and visual tagging.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Creation Hub */}
        <div className="animate-slide-up">
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20 sticky top-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">🏷️</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{editId ? 'Modify Tag' : 'New Category'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Name</label>
                <input className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4" placeholder="e.g. Signature Coffees" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Identity Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button 
                      key={c} 
                      type="button" 
                      onClick={() => setForm({ ...form, color: c })}
                      className={`h-12 rounded-2xl transition-all duration-300 relative group overflow-hidden ${form.color === c ? 'ring-4 ring-indigo-500/20 scale-95 shadow-inner' : 'hover:scale-105 shadow-sm'}`}
                      style={{ background: c }}
                    >
                      {form.color === c && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-white text-xs font-black">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="btn-primary flex-1 !rounded-2xl !py-4 shadow-xl shadow-indigo-600/20 text-sm active:scale-95 transition-transform">
                  {loading ? 'Processing...' : editId ? 'Commit Changes' : 'Register Category'}
                </button>
                {editId && (
                  <button type="button" className="btn-secondary !rounded-2xl !py-4 !px-6 border-slate-200" onClick={() => { setEditId(null); setForm({ name: '', color: '#3b82f6' }); }}>
                    Discard
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Global Catalog List */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] ml-6 mb-6">Registered Groupings ({categories.length})</p>
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div 
                key={cat.id} 
                style={{ animationDelay: `${idx * 50}ms` }}
                className="group animate-slide-up bg-white rounded-[32px] p-6 border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-indigo-500/5 border border-slate-50" style={{ background: cat.color }}>
                    <span className="text-white text-xs font-black opacity-40">#{(idx + 1).toString().padStart(2, '0')}</span>
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 tracking-tight uppercase group-hover:text-indigo-600 transition-colors leading-none">{cat.name}</span>
                    <div className="flex items-center gap-3 mt-1.5 opacity-60">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Internal Registry · Order {cat.order}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="h-10 px-6 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all" onClick={() => { setEditId(cat.id); setForm({ name: cat.name, color: cat.color }); }}>Modify</button>
                  <button className="h-10 px-4 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all" onClick={() => handleDelete(cat.id)}>🗑️</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px] py-32 flex flex-col items-center justify-center opacity-40 grayscale">
                <div className="text-5xl mb-4">🌪️</div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 pr-2">Your menu taxonomy is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

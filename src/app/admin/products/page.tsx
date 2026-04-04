'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; color: string; }
interface Variant { attribute: string; value: string; extraPrice: number; }
interface Product {
  id: string; name: string; category: Category; price: number; tax: number;
  description?: string; isAvailable: boolean; variants: Array<Variant & { id: string }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', categoryId: '', price: '', tax: '0', description: '' });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [search, setSearch] = useState('');

  async function load() {
    const [pr, ca] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
    setProducts(await pr.json()); setCategories(await ca.json());
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditProd(null); setForm({ name: '', categoryId: categories[0]?.id || '', price: '', tax: '0', description: '' });
    setVariants([]); setShowModal(true);
  }
  function openEdit(p: Product) {
    setEditProd(p);
    setForm({ name: p.name, categoryId: p.category.id, price: String(p.price), tax: String(p.tax), description: p.description || '' });
    setVariants(p.variants.map(v => ({ attribute: v.attribute, value: v.value, extraPrice: v.extraPrice })));
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, variants };
    try {
      if (editProd) {
        await fetch(`/api/products/${editProd.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        toast.success('Updated!');
      } else {
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        toast.success('Created!');
      }
      setShowModal(false); load();
    } catch { toast.error('Error'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    toast.success('Deleted!'); load();
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-50 min-h-full font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Product Catalog</h1>
          <p className="text-slate-500 font-medium italic">Manage your menu items, pricing, and variants.</p>
        </div>
        <button className="btn-primary !px-8 !py-4 shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform" onClick={openNew}>
          + Create Product
        </button>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="relative w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input className="input !pl-10 !py-3 !bg-white border-slate-200/60 shadow-sm focus:ring-indigo-500/10" placeholder="Filter by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 h-px bg-slate-200/60" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map((p, idx) => (
          <div 
            key={p.id} 
            style={{ animationDelay: `${idx * 40}ms` }}
            className="group animate-slide-up bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative flex flex-col"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1 pr-4">
                <h3 className="font-black text-slate-900 leading-tight uppercase tracking-tight text-lg group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" style={{ borderColor: p.category.color + '44', backgroundColor: p.category.color + '11', color: p.category.color }}>
                    {p.category.name}
                  </span>
                  {p.variants.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                      {p.variants.length} Opts
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 tracking-tighter shadow-indigo-100 drop-shadow-sm">₹{p.price}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Tax {p.tax}%</div>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic mb-8 line-clamp-2 flex-1">{p.description || "No description provided."}</p>
            
            <div className="flex gap-3 pt-4 border-t border-slate-50 mt-auto">
              <button 
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100" 
                onClick={() => openEdit(p)}
              >
                Edit
              </button>
              <button 
                className="py-3 px-4 rounded-2xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all" 
                onClick={() => handleDelete(p.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-dashed border-2 bg-white/50 rounded-[40px]">
            <div className="text-5xl mb-4 opacity-20">🧊</div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 pr-2">No products match your filters</p>
          </div>
        )}
      </div>

      {/* Premium Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[48px] w-full max-w-xl p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">📦</div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight">{editProd ? 'Update Product' : 'Registry Entry'}</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Fill in the required information</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity & Naming</label>
                <input className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4" placeholder="Enter product name (e.g. Italian Espresso)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                  <select className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Financial Setup (INR)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4" type="number" placeholder="Base Price" step="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                    <input className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4 text-center" type="number" placeholder="Tax %" step="0.1" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brief Description</label>
                <textarea className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4 no-scrollbar" placeholder="Item characteristics, ingredients, or notes..." rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎭</span>
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Configuration Variants</label>
                  </div>
                  <button type="button" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                    onClick={() => setVariants([...variants, { attribute: 'Size', value: '', extraPrice: 0 }])}>+ New Entry</button>
                </div>
                
                <div className="space-y-4">
                  {variants.map((v, i) => (
                    <div key={i} className="flex gap-4 animate-slide-in">
                      <input className="input !bg-white border-slate-200 !text-xs !py-3 flex-1" placeholder="Attr (e.g. Size)" value={v.attribute}
                        onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, attribute: e.target.value} : vv))} />
                      <input className="input !bg-white border-slate-200 !text-xs !py-3 flex-1" placeholder="Val (e.g. Large)" value={v.value}
                        onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, value: e.target.value} : vv))} />
                      <div className="relative group/price">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[9px] font-black">₹</span>
                        <input className="input !bg-white border-slate-200 !text-xs !py-3 !pl-6 w-24" type="number" placeholder="Extra" value={v.extraPrice}
                          onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, extraPrice: parseFloat(e.target.value) || 0} : vv))} />
                      </div>
                      <button type="button" className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all flex-shrink-0" onClick={() => setVariants(variants.filter((_,ii) => ii !== i))}>✕</button>
                    </div>
                  ))}
                  {variants.length === 0 && (
                    <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic opacity-60">No additional variants configured</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 btn-primary !rounded-2xl !py-4 shadow-2xl shadow-indigo-600/20 text-lg active:scale-[0.98] transition-transform">
                  {editProd ? 'Update Profile' : 'Confirm Registry Entry'}
                </button>
                <button type="button" className="btn-secondary !rounded-2xl !py-4 !px-8 hover:bg-white hover:text-slate-900 border-slate-200" onClick={() => setShowModal(false)}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

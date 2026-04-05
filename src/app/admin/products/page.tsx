'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Category { id: string; name: string; color: string; }
interface Variant { attribute: string; value: string; extraPrice: number; }
interface Product {
  id: string; name: string; category: Category; price: number; tax: number;
  uom?: string; priceTaxIncluded: boolean;
  description?: string; isAvailable: boolean; variants: Array<Variant & { id: string }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', categoryId: '', price: '', tax: '0', uom: 'Unit', priceTaxIncluded: true, description: '' });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [search, setSearch] = useState('');

  async function load() {
    try {
      const [pr, ca] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
      const productsData = await pr.json();
      const categoriesData = await ca.json();
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      if (!Array.isArray(productsData)) console.error('Products data is not an array:', productsData);
      if (!Array.isArray(categoriesData)) console.error('Categories data is not an array:', categoriesData);
    } catch (e) {
      console.error('Error loading products/categories:', e);
    }
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditProd(null); setForm({ name: '', categoryId: categories[0]?.id || '', price: '', tax: '0', uom: 'Unit', priceTaxIncluded: true, description: '' });
    setVariants([]); setShowModal(true);
  }
  function openEdit(p: Product) {
    setEditProd(p);
    setForm({ 
      name: p.name, 
      categoryId: p.category.id, 
      price: String(p.price), 
      tax: String(p.tax), 
      uom: p.uom || 'Unit',
      priceTaxIncluded: p.priceTaxIncluded !== false,
      description: p.description || '' 
    });
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

  const filtered = (Array.isArray(products) ? products : []).filter(p => 
    p?.name?.toLowerCase()?.includes((search || '').toLowerCase())
  );

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-950 min-h-screen font-sans text-slate-200">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Product Catalog</h1>
          <p className="text-slate-400 font-medium italic">Manage your menu items, pricing, and variants in real-time.</p>
        </div>
        <button className="bg-primary text-black font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs" onClick={openNew}>
          + Register Product
        </button>
      </motion.div>

      <div className="mb-12 flex items-center gap-6">
        <div className="relative w-96 group">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">🔍</span>
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
            placeholder="Search Registry..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex-1 h-px bg-white/5" />
        <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-lg">
          <div className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest border-r border-white/10">{filtered.length} Units Found</div>
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-6">Filter Active</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map((p, idx) => (
          <motion.div 
            key={p.id} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className="group bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border border-white/5 shadow-2xl hover:border-primary/30 hover:shadow-primary/5 transition-all relative flex flex-col overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 transition-colors group-hover:opacity-30`} style={{ background: p.category?.color || '#3b82f6' }} />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex-1 pr-4">
                <h3 className="font-black text-white leading-tight uppercase tracking-tight text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" style={{ 
                    borderColor: (p.category?.color || '#6366f1') + '44', 
                    backgroundColor: (p.category?.color || '#6366f1') + '11', 
                    color: p.category?.color || '#6366f1' 
                  }}>
                    {p.category?.name || 'Standard'}
                  </span>
                  {p.variants.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10">
                      {p.variants.length} Variants
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white tracking-tighter shadow-primary/10 drop-shadow-sm">₹{p.price}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-60">Tax {p.tax}%</div>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic mb-8 line-clamp-2 flex-1 relative z-10">{p.description || "No registry description provided for this unit."}</p>
            
            <div className="flex gap-3 pt-6 border-t border-white/5 mt-auto relative z-10">
              <button 
                className="flex-1 py-3 px-4 rounded-2xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary border border-white/5 transition-all" 
                onClick={() => openEdit(p)}
              >
                Modify
              </button>
              <button 
                className="py-3 px-4 rounded-2xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white border border-rose-500/10 transition-all" 
                onClick={() => handleDelete(p.id)}
              >
                🗑️
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center border-dashed border-2 bg-white/5 border-white/10 rounded-[48px] opacity-40 grayscale animate-pulse">
            <div className="text-6xl mb-6">🏜️</div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-white">No products match your current schema</p>
          </div>
        )}
      </div>

      {/* High-Fidelity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-dark-900/40 rounded-[48px] w-full max-w-2xl p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar relative"
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl font-bold border border-primary/20">📦</div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-tight">{editProd ? 'Update Profile' : 'Registry Input'}</h2>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 italic">Define asset characteristics and pricing</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Identity</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                  placeholder="Registry Name (e.g. Signature Grind)" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Classification</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none" 
                    value={form.categoryId} 
                    onChange={e => setForm({...form, categoryId: e.target.value})} 
                    required
                  >
                    <option value="" className="bg-slate-900">Select Schema</option>
                    {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Financial Setup (INR)</label>
                  <div className="flex gap-3">
                    <input 
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                      type="number" 
                      placeholder="Base Price" 
                      step="1" 
                      value={form.price} 
                      onChange={e => setForm({...form, price: e.target.value})} 
                      required 
                    />
                    <select 
                      className="w-24 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none" 
                      value={form.uom} 
                      onChange={e => setForm({...form, uom: e.target.value})}
                    >
                      <option value="Unit" className="bg-slate-900">U</option>
                      <option value="KG" className="bg-slate-900">KG</option>
                      <option value="Liter" className="bg-slate-900">L</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Taxation (%)</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                    type="number" 
                    placeholder="Rate" 
                    step="0.1" 
                    value={form.tax} 
                    onChange={e => setForm({...form, tax: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pricing Logic</label>
                  <div className="flex items-center gap-4 h-[58px] bg-white/5 px-6 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all cursor-pointer" 
                       onClick={() => setForm({...form, priceTaxIncluded: !form.priceTaxIncluded})}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.priceTaxIncluded ? 'bg-primary border-primary' : 'border-white/10 bg-transparent'}`}>
                      {form.priceTaxIncluded && <span className="text-black text-[10px] font-black">✓</span>}
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Gross Internal Tax</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Registry Description</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium no-scrollbar resize-none" 
                  placeholder="Asset profile characteristics..." 
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎭</span>
                    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Asset Configuration Variants</label>
                  </div>
                  <button 
                    type="button" 
                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/20 hover:border-primary/30 transition-all shadow-sm"
                    onClick={() => setVariants([...variants, { attribute: 'Option', value: '', extraPrice: 0 }])}
                  >
                    + Add Variant
                  </button>
                </div>
                
                <div className="space-y-4">
                  {variants.map((v, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 items-center"
                    >
                      <input 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40" 
                        placeholder="Key" 
                        value={v.attribute}
                        onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, attribute: e.target.value} : vv))} 
                      />
                      <input 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40" 
                        placeholder="Value" 
                        value={v.value}
                        onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, value: e.target.value} : vv))} 
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-black">₹</span>
                        <input 
                          className="w-24 bg-white/5 border border-white/10 rounded-xl pl-6 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40" 
                          type="number" 
                          placeholder="Delta" 
                          value={v.extraPrice}
                          onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, extraPrice: parseFloat(e.target.value) || 0} : vv))} 
                        />
                      </div>
                      <button 
                        type="button" 
                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all flex-shrink-0" 
                        onClick={() => setVariants(variants.filter((_,ii) => ii !== i))}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                  {variants.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-3xl">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Zero additional variants mapped</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-black font-black uppercase tracking-[0.2em] py-5 rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                >
                  {editProd ? 'Commit Update' : 'Initialize Asset Registry'}
                </button>
                <button 
                  type="button" 
                  className="px-10 bg-white/5 text-slate-400 font-black uppercase tracking-[0.1em] py-5 rounded-[24px] hover:bg-white/10 transition-all text-[10px]" 
                  onClick={() => setShowModal(false)}
                >
                  Discard
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );

}

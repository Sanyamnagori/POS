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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Products</h1><p className="text-slate-400">Manage your menu items</p></div>
        <button className="btn-primary" onClick={openNew}>+ New Product</button>
      </div>

      <div className="mb-4">
        <input className="input max-w-xs" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="card animate-slide-in">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge text-xs" style={{ background: p.category.color + '33', color: p.category.color }}>{p.category.name}</span>
                  {p.variants.length > 0 && <span className="badge bg-slate-700 text-slate-400 text-xs">{p.variants.length} variant(s)</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-sky-400">₹{p.price}</div>
                <div className="text-xs text-slate-500">Tax: {p.tax}%</div>
              </div>
            </div>
            {p.description && <p className="text-xs text-slate-400 mb-3">{p.description}</p>}
            <div className="flex gap-2 mt-2">
              <button className="btn-secondary text-xs py-1 px-3 flex-1" onClick={() => openEdit(p)}>Edit</button>
              <button className="btn-danger text-xs py-1 px-3 flex-1" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 card text-center text-slate-500 py-12">No products found.</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in">
            <h2 className="text-lg font-bold text-white mb-4">{editProd ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className="input" placeholder="Product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <select className="input" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className="input" type="number" placeholder="Price" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                <input className="input" type="number" placeholder="Tax %" step="0.01" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} />
              </div>
              <textarea className="input" placeholder="Description (optional)" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400">Variants</label>
                  <button type="button" className="text-xs text-sky-400 hover:text-sky-300"
                    onClick={() => setVariants([...variants, { attribute: 'Pack', value: '', extraPrice: 0 }])}>+ Add</button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input text-xs" placeholder="Attribute" value={v.attribute}
                      onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, attribute: e.target.value} : vv))} />
                    <input className="input text-xs" placeholder="Value" value={v.value}
                      onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, value: e.target.value} : vv))} />
                    <input className="input text-xs w-20" type="number" placeholder="+₹" value={v.extraPrice}
                      onChange={e => setVariants(variants.map((vv, ii) => ii === i ? {...vv, extraPrice: parseFloat(e.target.value)} : vv))} />
                    <button type="button" className="text-red-400 text-xs" onClick={() => setVariants(variants.filter((_,ii) => ii !== i))}>✕</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">{editProd ? 'Update' : 'Create'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

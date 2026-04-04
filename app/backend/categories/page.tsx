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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Categories</h1>
        <p className="text-slate-400">Organize your menu items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">{editId ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input className="input" placeholder="e.g. Beverages" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-lg transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
              {editId && (
                <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm({ name: '', color: '#3b82f6' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="card flex items-center justify-between animate-slide-in">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ background: cat.color }} />
                  <span className="font-medium text-white">{cat.name}</span>
                  <span className="badge bg-slate-700 text-slate-400">#{cat.order}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm py-1 px-3" onClick={() => { setEditId(cat.id); setForm({ name: cat.name, color: cat.color }); }}>Edit</button>
                  <button className="btn-danger text-sm py-1 px-3" onClick={() => handleDelete(cat.id)}>Delete</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <div className="card text-center text-slate-500 py-12">No categories yet. Create one!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

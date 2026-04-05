'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import CategoryList from '@/components/admin/categories/CategoryList';
import { motion } from 'framer-motion';
import ConfirmModal from '@/frontend/components/shared/ConfirmModal';

interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  async function load() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(form: { id?: string; name: string; color: string }) {
    setLoading(true);
    try {
      if (form.id) {
        await fetch(`/api/categories/${form.id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(form) 
        });
        toast.success('Registry Updated!');
        setEditCat(null);
      } else {
        await fetch('/api/categories', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(form) 
        });
        toast.success('Category Initialized!');
      }
      load();
    } catch { 
      toast.error('Transmission Error'); 
    } finally { 
      setLoading(false); 
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete({ isOpen: true, id });
  }

  async function executeDelete() {
    const id = confirmDelete.id;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }
      toast.success('Category Purged'); 
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setConfirmDelete({ isOpen: false, id: '' });
    }
  }

  async function reorder(id: string, currentOrder: number, direction: 'up' | 'down') {
    const targetIdx = categories.findIndex(c => c.id === id);
    const otherIdx = direction === 'up' ? targetIdx - 1 : targetIdx + 1;
    if (otherIdx < 0 || otherIdx >= categories.length) return;

    const other = categories[otherIdx];
    await Promise.all([
      fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: other.order }) }),
      fetch(`/api/categories/${other.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: currentOrder }) })
    ]);
    load();
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-950 min-h-screen font-sans text-slate-200">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Menu Taxonomy</h1>
          <p className="text-slate-500 font-medium italic">Architect your digital catalog architecture and visual hierarchy.</p>
        </div>
        <div className="flex bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
          <div className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest border-r border-white/10">Active Schema</div>
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Version HL-734</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="animate-slide-up">
          <CategoryForm 
            initialData={editCat} 
            onSubmit={handleSubmit} 
            onCancel={() => setEditCat(null)} 
            loading={loading} 
          />
        </div>

        <div className="lg:col-span-2">
          <CategoryList 
            categories={categories} 
            onEdit={setEditCat} 
            onDelete={handleDelete} 
            onReorder={reorder} 
          />
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title="Wipe Classification?"
        message="This will permanently purge this category from the registry. This action cannot be reversed."
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '' })}
        confirmText="Purge Registry"
        type="danger"
      />
    </div>
  );
}


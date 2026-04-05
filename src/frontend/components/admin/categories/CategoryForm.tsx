
'use client';
import { useState, useEffect } from 'react';

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

interface CategoryFormProps {
  initialData?: { id: string; name: string; color: string } | null;
  onSubmit: (data: { id?: string; name: string; color: string }) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
}

export default function CategoryForm({ initialData, onSubmit, onCancel, loading }: CategoryFormProps) {
  const [form, setForm] = useState({ name: '', color: '#3b82f6' });

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, color: initialData.color });
    } else {
      setForm({ name: '', color: '#3b82f6' });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, id: initialData?.id });
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 border border-white/10 shadow-2xl sticky top-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-bold border border-primary/20">
          {initialData ? '📝' : '🏷️'}
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none">
            {initialData ? 'Modify Entity' : 'New Classification'}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registry Entry System</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
            placeholder="e.g. Signature Blends" 
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
          />
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Signature</label>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_COLORS.map((c) => (
              <button 
                key={c} 
                type="button" 
                onClick={() => setForm({ ...form, color: c })}
                className={`h-12 rounded-2xl transition-all duration-300 relative group overflow-hidden border-2 ${form.color === c ? 'border-primary scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-transparent hover:scale-105 opacity-60 hover:opacity-100'}`}
                style={{ background: c }}
              >
                {form.color === c && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-xs font-black animate-in fade-in zoom-in">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs disabled:opacity-50"
          >
            {loading ? 'Transmitting...' : initialData ? 'Commit Update' : 'Initialize Category'}
          </button>
          {initialData && (
            <button 
              type="button" 
              className="w-full bg-white/5 text-slate-400 font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-white/10 transition-all text-[10px]" 
              onClick={onCancel}
            >
              Abort Operation
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

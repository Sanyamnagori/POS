'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Login failed'); return; }
      toast.success('Access Granted! Welcome back.');
      router.push('/admin');
    } catch {
      toast.error('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230ea5e9%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-sky-500/10 rounded-[32px] mb-6 pulse-glow border border-sky-500/20"
            >
              <span className="text-5xl drop-shadow-2xl">☕</span>
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3 uppercase italic">POS TERMINAL</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Administrative Access Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email or Username</label>
              <input
                className="input !bg-slate-900/50 !border-slate-800 focus:!border-sky-500/50"
                placeholder="admin@ods.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Password</label>
                <Link href="/forgot-password" className="text-[10px] text-sky-400 font-bold uppercase tracking-widest hover:underline hover:text-sky-300">Forgot Code?</Link>
              </div>
              <input
                type="password"
                className="input !bg-slate-900/50 !border-slate-800 focus:!border-sky-500/50"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full !py-5 !rounded-2xl shadow-2xl shadow-sky-600/20 text-lg uppercase font-black tracking-widest mt-4 group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>Enter Dashboard <span className="opacity-40 group-hover:translate-x-1 transition-transform inline-block ml-1">→</span></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mt-10 pt-8 border-t border-slate-900">
            Unregistered operator?{' '}
            <Link href="/signup" className="text-sky-400 hover:text-sky-300 hover:underline">Apply Here</Link>
          </p>

          <div className="mt-6 flex justify-center gap-4 grayscale opacity-30">
             <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] text-white font-black tracking-widest uppercase">SSL SECURE</div>
             <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] text-white font-black tracking-widest uppercase">2026 EDITION</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

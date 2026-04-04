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
      toast.success('Welcome back!');
      router.push('/admin');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl opacity-60" 
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-3xl opacity-50" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="card shadow-2xl !p-10 border-slate-100 ring-1 ring-slate-200/50">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-[28px] mb-6 shadow-sm shadow-indigo-100/50"
            >
              <span className="text-4xl">☕</span>
            </motion.div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Access your restaurant dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="admin@posca.fe"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <button type="button" className="text-xs text-indigo-600 font-bold hover:underline">Forgot?</button>
              </div>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full text-lg !py-3.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In Securely <span className="opacity-50 text-xl">→</span></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8 font-medium">
            New to the platform?{' '}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline transition-colors">Contact Admin</Link>
          </p>

          {/* Demo Hint */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[11px] text-slate-400 text-center font-bold uppercase tracking-widest leading-none mb-2">Practice Environment</p>
            <p className="text-xs text-slate-500 text-center font-medium">Demo: <span className="text-indigo-600 font-bold">admin@posca.fe</span> / <span className="text-indigo-600 font-bold">admin123</span></p>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">
          © 2026 Odoo POS Cafe System
        </div>
      </motion.div>
    </div>
  );
}

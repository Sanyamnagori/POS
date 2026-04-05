'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { 
        toast.error(data.error || 'Identity registration failed. Please try again.'); 
        console.error('Signup API returned error:', data.error);
        return; 
      }
      toast.success('Account created successfully!');
      router.push('/admin');
    } catch (err: any) {
      toast.error('Network failure. The server might be offline.');
      console.error('Signup network error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background highlights */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230ea5e9%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass p-10 shadow-2xl border border-white/5">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500/10 rounded-[28px] mb-6 pulse-glow border border-sky-500/20">
              <span className="text-4xl text-sky-400">☕</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2 uppercase">Join Odoo POS</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Create your administrative account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <input className="input !bg-slate-900/50 !border-slate-800" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                <input className="input !bg-slate-900/50 !border-slate-800" placeholder="johndoe" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email ID</label>
                <input className="input !bg-slate-900/50 !border-slate-800" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input className="input !bg-slate-900/50 !border-slate-800" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 !rounded-2xl !py-4 shadow-xl shadow-sky-500/20 uppercase font-black tracking-widest text-sm">
              {loading ? 'Creating Identity...' : 'Register Identity →'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8 pb-4 border-b border-slate-900">
            Already have an account?{' '}
            <Link href="/login" className="text-sky-400 font-bold hover:underline transition-all hover:text-sky-300">Sign In</Link>
          </p>
          
          <div className="mt-8 text-center text-slate-600 font-black tracking-widest text-[9px] uppercase">
             Highly Encrypted · Secure Authentication
          </div>
        </div>
      </motion.div>
    </div>
  );
}

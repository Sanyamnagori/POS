'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '', confirmP: '' });
  const [loading, setLoading] = useState(false);

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmP) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230ea5e9%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500/10 rounded-[28px] mb-6 pulse-glow border border-sky-500/20">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Password Recovery</h1>
            <p className="text-slate-400 font-medium tracking-tight">Step {step}: {step === 1 ? 'Enter email address' : step === 2 ? 'Verify 6-digit OTP' : 'Set new password'}</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email ID</label>
                  <input className="input" type="email" placeholder="you@exmaple.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg shadow-sky-500/20">
                  {loading ? 'Sending...' : 'Send OTP code →'}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form key="step2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Verification Code</label>
                  <input className="input text-center text-3xl font-black tracking-[10px] py-6" maxLength={6} placeholder="000000" value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} required />
                  <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">Check your inbox for the code</p>
                </div>
                <button type="submit" className="btn-primary w-full shadow-lg shadow-sky-500/20">Verify OTP Code ✓</button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-sky-400 font-bold uppercase tracking-widest hover:underline">Change Email</button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form key="step3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                  <input className="input" type="password" placeholder="••••••••" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                  <input className="input" type="password" placeholder="••••••••" value={form.confirmP} onChange={e => setForm({ ...form, confirmP: e.target.value })} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full shadow-lg shadow-sky-500/20">
                  {loading ? 'Processing...' : 'Reset My Password ✓'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-slate-500 text-sm mt-8 border-t border-slate-800/50 pt-8">
            Remember your credentials?{' '}
            <Link href="/login" className="text-sky-400 font-bold hover:underline transition-all">Go back to login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

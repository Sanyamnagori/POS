'use client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

function ConfirmContent({ token }: { token: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const total = params.get('total');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-[48px] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center text-5xl text-white shadow-xl shadow-emerald-500/20 mb-10 mx-auto animate-bounce-slow">✓</div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Order Confirmed</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">Your artisanal selection has been transmitted to our kitchen experts.</p>

        <div className="bg-slate-50 rounded-[32px] p-8 mb-10 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Transaction ID</span>
                <span className="text-slate-900">#{orderId?.slice(-6).toUpperCase()}</span>
            </div>
            <div className="w-full h-px bg-slate-200/50" />
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Settlement</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">₹{total}</span>
            </div>
        </div>

        <div className="space-y-4">
            <button 
                onClick={() => router.push(`/s/${token}/track/${orderId}`)} 
                className="w-full bg-slate-900 text-white py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-900/20"
            >
                📍 Track Preparation
            </button>
            <button 
                onClick={() => router.push(`/s/${token}/menu`)} 
                className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors"
            >
                Add More Items
            </button>
        </div>
      </motion.div>

      <div className="mt-12 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Merchant Terminal Synchronized</div>
    </div>
  );
}

export default function ConfirmationPage({ params }: { params: { token: string } }) {
  return <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-400">Loading...</div>}><ConfirmContent token={params.token} /></Suspense>;
}

'use client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmContent({ token }: { token: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const total = params.get('total');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-7xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-white mb-2">Order Placed!</h1>
      <p className="text-slate-400 mb-6">Your order has been sent to the kitchen</p>
      <div className="card w-full max-w-xs mb-6">
        <div className="flex justify-between mb-2"><span className="text-slate-400 text-sm">Order ID</span><span className="text-white text-sm font-mono">#{orderId?.slice(-8).toUpperCase()}</span></div>
        <div className="flex justify-between"><span className="text-slate-400 text-sm">Amount</span><span className="text-sky-400 font-bold">₹{total}</span></div>
      </div>
      <button onClick={() => router.push(`/s/${token}/track/${orderId}`)} className="btn-primary w-full max-w-xs mb-3">
        📍 Track Order
      </button>
      <button onClick={() => router.push(`/s/${token}/menu`)} className="btn-secondary w-full max-w-xs text-sm">
        Add More Items
      </button>
    </div>
  );
}

export default function ConfirmationPage({ params }: { params: { token: string } }) {
  return <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}><ConfirmContent token={params.token} /></Suspense>;
}

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface POSConfig {
  id: string; cashEnabled: boolean; digitalEnabled: boolean;
  upiEnabled: boolean; upiId?: string;
}

export default function PaymentMethodsPage() {
  const [config, setConfig] = useState<POSConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/pos-config').then(r => r.json()).then(setConfig);
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/pos-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      toast.success('System Configuration Synchronized');
    } catch {
      toast.error('Synchronization Failure');
    } finally {
      setSaving(false);
    }
  }

  if (!config) return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-950 min-h-screen font-sans text-slate-500 flex items-center justify-center animate-pulse uppercase tracking-[0.3em] text-[10px] font-black">
      Acquiring Configuration...
    </div>
  );

  const toggle = (key: keyof POSConfig) => setConfig(prev => ({ ...prev!, [key]: !prev![key as keyof POSConfig] }));

  const methods = [
    { key: 'cashEnabled' as const, icon: '💵', label: 'Fiat Currency', desc: 'Accept physical cash and manual reconciliation' },
    { key: 'digitalEnabled' as const, icon: '💳', label: 'Internal Digital', desc: 'Process card and stored value transactions' },
    { key: 'upiEnabled' as const, icon: '📱', label: 'Unified Payments', desc: 'Secure real-time UPI settlements via QR' },
  ];

  return (
    <div className="p-10 max-w-[1600px] mx-auto bg-slate-950 min-h-screen font-sans text-slate-200">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Payment Architecture</h1>
          <p className="text-slate-500 font-medium italic">Define the transactional protocols for your terminal infrastructure.</p>
        </div>
        <div className="flex bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
          <div className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest border-r border-white/10">Protocols Active</div>
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-6">SSL Encryption 256-bit</div>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-6">
        {methods.map((method, idx) => (
          <motion.div 
            key={method.key} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group p-8 rounded-[36px] border transition-all duration-500 relative overflow-hidden backdrop-blur-xl cursor-pointer ${config[method.key] ? 'bg-primary/5 border-primary/20 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.1)]' : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'}`}
            onClick={() => toggle(method.key)}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-6">
                <span className={`text-4xl transition-transform duration-500 ${config[method.key] ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'grayscale group-hover:grayscale-0'}`}>{method.icon}</span>
                <div>
                  <div className={`text-lg font-black uppercase tracking-tight transition-colors ${config[method.key] ? 'text-white' : 'text-slate-400'}`}>{method.label}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1 italic">{method.desc}</div>
                </div>
              </div>
              <div className={`relative w-14 h-8 rounded-full transition-all duration-500 border ${config[method.key] ? 'bg-primary border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]' : 'bg-slate-800 border-white/10'}`}>
                <motion.div 
                   animate={{ x: config[method.key] ? 24 : 4 }}
                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
                   className={`absolute top-1.5 w-4 h-4 rounded-full transition-colors ${config[method.key] ? 'bg-black' : 'bg-slate-400'}`} 
                />
              </div>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {config.upiEnabled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[36px] border border-white/10 mt-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">💳</span>
                  <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">UPI Merchant Descriptor</label>
                </div>
                <input 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm" 
                  placeholder="merchant@vpa" 
                  value={config.upiId || ''}
                  onChange={e => setConfig({ ...config, upiId: e.target.value })} 
                />
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic opacity-60">
                  Dynamic Payload: upi://pay?pa={config.upiId || 'PENDING'}&am=VALUE
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-6 mt-8 rounded-[28px] font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl ${saving ? 'bg-slate-800 text-slate-500' : 'bg-primary text-black shadow-primary/20 hover:shadow-primary/30'}`}
          onClick={save} 
          disabled={saving}
        >
          {saving ? 'Synchronizing Cryptography...' : 'Commit Protocol Update'}
        </motion.button>
      </div>
    </div>
  );
}

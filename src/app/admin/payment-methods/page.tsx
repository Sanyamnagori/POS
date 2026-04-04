'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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
    await fetch('/api/pos-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    toast.success('Payment methods saved!');
    setSaving(false);
  }

  if (!config) return <div className="p-8 text-slate-400">Loading...</div>;

  const toggle = (key: keyof POSConfig) => setConfig(prev => ({ ...prev!, [key]: !prev![key as keyof POSConfig] }));

  const methods = [
    { key: 'cashEnabled' as const, icon: '💵', label: 'Cash', desc: 'Accept physical cash payments' },
    { key: 'digitalEnabled' as const, icon: '💳', label: 'Digital / Card', desc: 'Accept card and digital payments' },
    { key: 'upiEnabled' as const, icon: '📱', label: 'UPI', desc: 'Accept UPI payments via QR code' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white">Payment Methods</h1><p className="text-slate-400">Configure accepted payment types</p></div>
      <div className="max-w-lg space-y-4">
        {methods.map(method => (
          <div key={method.key} className={`card flex items-center justify-between transition-all ${config[method.key] ? 'border-sky-500/30 bg-sky-500/5' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{method.icon}</span>
              <div>
                <div className="font-semibold text-white">{method.label}</div>
                <div className="text-sm text-slate-400">{method.desc}</div>
              </div>
            </div>
            <button onClick={() => toggle(method.key)}
              className={`relative w-12 h-6 rounded-full transition-colors ${config[method.key] ? 'bg-sky-500' : 'bg-slate-700'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config[method.key] ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}

        {config.upiEnabled && (
          <div className="card animate-slide-in">
            <label className="block text-sm text-slate-400 mb-2">UPI ID</label>
            <input className="input" placeholder="yourupi@bank" value={config.upiId || ''}
              onChange={e => setConfig({ ...config, upiId: e.target.value })} />
            <p className="text-xs text-slate-500 mt-2">
              QR will be generated as: upi://pay?pa=UPI_ID&am=AMOUNT
            </p>
          </div>
        )}

        <button className="btn-primary w-full" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

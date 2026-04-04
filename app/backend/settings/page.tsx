'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface POSConfig {
  selfOrderEnabled: boolean; selfOrderMode: string; bgImageUrl?: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<POSConfig>({ selfOrderEnabled: false, selfOrderMode: 'ONLINE_ORDERING' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/pos-config').then(r => r.json()).then(c => setConfig(c || { selfOrderEnabled: false, selfOrderMode: 'ONLINE_ORDERING' }));
  }, []);

  async function save() {
    setSaving(true);
    await fetch('/api/pos-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    toast.success('Settings saved!'); setSaving(false);
  }

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white">Settings</h1><p className="text-slate-400">Configure mobile and self-ordering</p></div>
      <div className="max-w-lg space-y-4">
        <div className={`card flex items-center justify-between transition-all ${config.selfOrderEnabled ? 'border-sky-500/30 bg-sky-500/5' : ''}`}>
          <div>
            <div className="font-semibold text-white">Self Ordering</div>
            <div className="text-sm text-slate-400">Allow customers to order via QR code</div>
          </div>
          <button onClick={() => setConfig(p => ({ ...p, selfOrderEnabled: !p.selfOrderEnabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${config.selfOrderEnabled ? 'bg-sky-500' : 'bg-slate-700'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.selfOrderEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {config.selfOrderEnabled && (
          <div className="card animate-slide-in space-y-3">
            <h3 className="font-semibold text-white">Self Order Mode</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" value="ONLINE_ORDERING" checked={config.selfOrderMode === 'ONLINE_ORDERING'}
                onChange={() => setConfig(p => ({ ...p, selfOrderMode: 'ONLINE_ORDERING' }))} className="accent-sky-500" />
              <div>
                <div className="text-white text-sm font-medium">Online Ordering</div>
                <div className="text-xs text-slate-400">Customers can browse and place orders</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" value="QR_MENU" checked={config.selfOrderMode === 'QR_MENU'}
                onChange={() => setConfig(p => ({ ...p, selfOrderMode: 'QR_MENU' }))} className="accent-sky-500" />
              <div>
                <div className="text-white text-sm font-medium">QR Menu (View Only)</div>
                <div className="text-xs text-slate-400">Customers can only browse the menu</div>
              </div>
            </label>
          </div>
        )}

        <button className="btn-primary w-full" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface POSConfig {
  id?: string;
  cashEnabled: boolean;
  digitalEnabled: boolean;
  upiEnabled: boolean;
  upiId?: string;
  selfOrderEnabled: boolean;
  selfOrderMode: 'ONLINE_ORDERING' | 'QR_MENU';
  bgImageUrl?: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<POSConfig>({
    cashEnabled: true,
    digitalEnabled: true,
    upiEnabled: false,
    selfOrderEnabled: false,
    selfOrderMode: 'ONLINE_ORDERING'
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/pos-config')
      .then(r => r.json())
      .then(c => setConfig(c || {
        cashEnabled: true,
        digitalEnabled: true,
        upiEnabled: false,
        selfOrderEnabled: false,
        selfOrderMode: 'ONLINE_ORDERING'
      }));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/pos-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      toast.success('System configuration updated!');
    } catch {
      toast.error('Failed to sync settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-10 max-w-[1200px] mx-auto bg-slate-50 min-h-full font-sans animate-fade-in">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">System Architecture</h1>
          <p className="text-slate-500 font-medium italic">Configure core merchant services, payments, and digital interfaces.</p>
        </div>
        <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Point of Sale</span>
          <span className="text-lg font-black text-indigo-600 tracking-tight">Odoo Cafe</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          {/* Payment Methods Section */}
          <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">💳</div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Payment Ecosystem</h2>
            </div>

            <div className="space-y-6">
              {[
                { key: 'cashEnabled', title: 'Cash Payments', desc: 'Accept physical currency at the counter' },
                { key: 'digitalEnabled', title: 'Digital (Bank/Card)', desc: 'Process POS terminal transactions' },
                { key: 'upiEnabled', title: 'QR Payment (UPI)', desc: 'Generate dynamic UPI QR codes' }
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div>
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{item.title}</div>
                    <div className="text-xs text-slate-400 font-medium italic">{item.desc}</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={(config as any)[item.key]} 
                    onChange={(e) => setConfig({...config, [item.key]: e.target.checked})}
                    className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-200" 
                  />
                </label>
              ))}

              {config.upiEnabled && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-slide-up">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Merchant UPI Configuration</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs italic">ID:</span>
                    <input 
                      className="input !bg-slate-50 border-none shadow-none focus:ring-indigo-500/10 !py-4 !pl-12" 
                      placeholder="e.g. merchant@upi" 
                      value={config.upiId || ''} 
                      onChange={e => setConfig({...config, upiId: e.target.value})} 
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 font-bold italic px-2">Used for dynamic QR generation on the customer display.</p>
                </div>
              )}
            </div>
          </section>

          {/* Infrastructure Actions */}
          <div className="flex gap-4">
            <button 
              className="btn-primary flex-1 !rounded-2xl !py-5 shadow-2xl shadow-indigo-600/20 text-lg active:scale-95 transition-transform"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Syncing...' : 'Commit System Changes'}
            </button>
            <button 
              className="px-8 py-5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
              onClick={() => router.push('/admin/qr-print')}
              title="Print QR Table Menu"
            >
              🖨️
            </button>
          </div>
        </div>

        <div className="space-y-10">
          {/* Mobile Order Section */}
          <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">📱</div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Mobile Ordering</h2>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Self-Service Interface</span>
              </div>
              <button 
                onClick={() => setConfig(p => ({ ...p, selfOrderEnabled: !p.selfOrderEnabled }))}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${config.selfOrderEnabled ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${config.selfOrderEnabled ? 'left-8' : 'left-1 shadow-sm'}`} />
              </button>
            </div>

            {config.selfOrderEnabled && (
              <div className="space-y-10 animate-fade-in">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Operation Mode</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { val: 'ONLINE_ORDERING', icon: '🛒', label: 'Full Store' },
                      { val: 'QR_MENU', icon: '📖', label: 'Menu Only' }
                    ].map(mode => (
                      <button 
                        key={mode.val}
                        onClick={() => setConfig(p => ({ ...p, selfOrderMode: mode.val as any }))}
                        className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${config.selfOrderMode === mode.val ? 'border-indigo-600 bg-indigo-50/50 shadow-inner' : 'border-slate-100 hover:border-indigo-200 bg-slate-50/30'}`}
                      >
                        <span className="text-2xl">{mode.icon}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${config.selfOrderMode === mode.val ? 'text-indigo-600' : 'text-slate-400'}`}>{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">UI Personalization</h3>
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                       {['#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'].map(c => (
                         <div key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform" style={{ background: c }} />
                       ))}
                       <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 cursor-pointer">➕</div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interface Theme</span>
                  </div>
                  <div className="relative group overflow-hidden rounded-3xl cursor-pointer">
                    <div className="bg-slate-100 h-32 w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all">
                      <span className="text-2xl opacity-40 group-hover:scale-110 transition-transform">🖼️</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Background Image</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

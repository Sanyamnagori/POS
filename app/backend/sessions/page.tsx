'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Session {
  id: string; openedAt: string; closedAt?: string; openingCash: number; closingCash?: number;
  user: { name: string; email: string };
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openingCash, setOpeningCash] = useState('0');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  async function load() {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    setSessions(data);
    const open = data.find((s: Session) => !s.closedAt);
    setActiveSession(open || null);
  }
  useEffect(() => { load(); }, []);

  async function openSession() {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ openingCash }) });
      const session = await res.json();
      if (!res.ok) { toast.error(session.error); return; }
      toast.success('Session opened!');
      setActiveSession(session);
      router.push('/pos/floor');
    } catch { toast.error('Error'); } finally { setLoading(false); }
  }

  async function closeSession() {
    if (!activeSession) return;
    const cash = prompt('Enter closing cash amount:', '0');
    if (cash === null) return;
    await fetch(`/api/sessions/${activeSession.id}/close`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ closingCash: cash }) });
    toast.success('Session closed!'); load();
  }

  const lastSession = sessions[0];

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white">POS Terminal</h1><p className="text-slate-400">Open or manage your POS session</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        {/* Session status */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Session Status</h2>
          {activeSession ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold">Session Open</span>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Opened at</span>
                  <span className="text-white">{new Date(activeSession.openedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Cashier</span>
                  <span className="text-white">{activeSession.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Opening cash</span>
                  <span className="text-white">₹{activeSession.openingCash}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1" onClick={() => router.push('/pos/floor')}>🚀 Open POS</button>
                <button className="btn-danger" onClick={closeSession}>Close Session</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 font-semibold">No Active Session</span>
              </div>
              {lastSession && (
                <div className="bg-slate-900 rounded-lg p-3 text-sm space-y-1">
                  <div className="text-slate-400 mb-1">Last session:</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Closed at</span>
                    <span className="text-white">{new Date(lastSession.closedAt!).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Closing cash</span>
                    <span className="text-white">₹{lastSession.closingCash || 0}</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Opening Cash (₹)</label>
                <input className="input" type="number" value={openingCash} onChange={e => setOpeningCash(e.target.value)} />
              </div>
              <button className="btn-primary w-full pulse-glow" onClick={openSession} disabled={loading}>
                {loading ? 'Opening...' : '🚀 Open Session'}
              </button>
            </div>
          )}
        </div>

        {/* Sessions history */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Recent Sessions</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.map(s => (
              <div key={s.id} className="bg-slate-900 rounded-lg p-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white">{s.user.name}</span>
                  <span className={`badge ${s.closedAt ? 'bg-slate-700 text-slate-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {s.closedAt ? 'Closed' : 'Open'}
                  </span>
                </div>
                <div className="text-slate-500">{new Date(s.openedAt).toLocaleString()}</div>
              </div>
            ))}
            {sessions.length === 0 && <div className="text-slate-500 text-center py-4">No sessions yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

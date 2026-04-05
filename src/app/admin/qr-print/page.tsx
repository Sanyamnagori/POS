'use client';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface Table {
  id: string;
  number: string;
  floor: { name: string };
  qrTokens: Array<{ token: string }>;
}

export default function QRPrintPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch('/api/tables');
    const data = await res.json();
    setTables(data);
    
    const codes: Record<string, string> = {};
    for (const table of data) {
      if (table.qrTokens?.[0]) {
        const url = `${window.location.origin}/s/${table.qrTokens[0].token}`;
        codes[table.id] = await QRCode.toDataURL(url);
      }
    }
    setQrCodes(codes);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="mb-10 no-print flex justify-between items-center bg-slate-50 p-8 rounded-[32px] border border-slate-100">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">QR Registry</h1>
            <p className="text-slate-500 font-medium italic">Generate and print physical identifiers for your stations.</p>
        </div>
        <button onClick={() => window.print()} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform">Print All Labels</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 print:grid-cols-3 print:gap-4">
        {tables.map(table => (
          <div key={table.id} className="border-2 border-slate-100 rounded-[40px] p-8 flex flex-col items-center text-center bg-white shadow-sm hover:shadow-xl transition-shadow print:shadow-none print:border-slate-300">
            <div className="mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1">{table.floor?.name || 'Main Floor'}</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Unit {table.number}</h2>
            </div>
            {qrCodes[table.id] ? (
              <img src={qrCodes[table.id]} alt={`QR for ${table.number}`} className="w-48 h-48 mb-6" />
            ) : (
                <div className="w-48 h-48 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6 italic text-xs">No Token Active</div>
            )}
            <div className="px-6 py-2 bg-indigo-50 rounded-full">
                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Scan for QR Menu</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .p-10 { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

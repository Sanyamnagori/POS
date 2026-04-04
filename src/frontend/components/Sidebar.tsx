'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/products', label: 'Products', icon: '🍽️' },
  { href: '/admin/floors', label: 'Floors & Tables', icon: '🪑' },
  { href: '/admin/payment-methods', label: 'Payment Methods', icon: '💳' },
  { href: '/admin/sessions', label: 'POS Terminal', icon: '🖥️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/pos/floor', label: 'Open POS', icon: '🚀', highlight: true },
  { href: '/kitchen', label: 'Kitchen', icon: '🍳' },
  { href: '/reports', label: 'Reports', icon: '📊' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    router.push('/login');
  }

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
      {/* Brand Header */}
      <div className="p-8 border-b border-slate-50">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:shadow-indigo-500/10 transition-shadow">
            <span>☕</span>
          </div>
          <div>
            <h1 className="font-black text-slate-900 tracking-tight text-sm uppercase">Odoo POS</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Control</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
        <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          
          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all my-6 group"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">{item.icon}</span>
                <span className="text-sm font-black uppercase tracking-wider">{item.label}</span>
                <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>{item.icon}</span>
              <span className={`text-sm font-bold tracking-tight ${isActive ? 'font-black' : ''}`}>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-6 border-t border-slate-50">
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all group"
        >
          <span className="text-xl grayscale group-hover:grayscale-0">🚪</span>
          <span className="text-sm font-bold tracking-tight">System Logout</span>
        </button>
      </div>
    </aside>
  );
}

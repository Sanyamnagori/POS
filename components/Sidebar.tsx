'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/backend', label: 'Dashboard', icon: '🏠' },
  { href: '/backend/categories', label: 'Categories', icon: '🏷️' },
  { href: '/backend/products', label: 'Products', icon: '🍽️' },
  { href: '/backend/floors', label: 'Floors & Tables', icon: '🪑' },
  { href: '/backend/payment-methods', label: 'Payment Methods', icon: '💳' },
  { href: '/backend/sessions', label: 'POS Terminal', icon: '🖥️' },
  { href: '/backend/settings', label: 'Settings', icon: '⚙️' },
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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
            <span className="text-xl">☕</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">Odoo POS Cafe</h1>
            <p className="text-xs text-slate-500">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/backend'
            ? pathname === '/backend'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''} ${item.highlight ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : ''}`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.highlight && <span className="ml-auto text-xs bg-sky-500 text-white px-1.5 py-0.5 rounded-full">LIVE</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <span>🚪</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

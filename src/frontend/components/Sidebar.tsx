'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/products', label: 'Products', icon: '🍽️' },
  { href: '/admin/floors', label: 'Floors & Tables', icon: '🪑' },
  { href: '/admin/payment-methods', label: 'Payment Methods', icon: '💳' },
  { href: '/admin/sessions', label: 'POS Terminal', icon: '🖥️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/pos/floor', label: 'Launch POS', icon: '🚀', highlight: true },
  { href: '/kitchen', label: 'Kitchen Display', icon: '🍳' },
  { href: '/reports', label: 'Reports', icon: '📊' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('System disconnected');
    router.push('/login');
  }

  const sidebarVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { staggerChildren: 0.05, duration: 0.5, ease: 'easeOut' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside 
      initial="hidden" animate="visible" variants={sidebarVariants}
      className="w-72 bg-dark-950/80 backdrop-blur-2xl border-r border-white/10 flex flex-col h-screen sticky top-0 shadow-[4px_0_30px_rgba(0,0,0,0.5)] z-40"
    >
      {/* Brand Header */}
      <div className="p-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px]"></div>
        <Link href="/" className="flex items-center gap-4 group relative z-10">
          <div className="w-12 h-12 bg-black/50 border border-primary/30 rounded-xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] group-hover:border-primary transition-all duration-300">
            <span className="group-hover:scale-110 transition-transform">☕</span>
          </div>
          <div>
            <h1 className="font-black text-white tracking-widest text-sm uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Odoo POS</h1>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-0.5">Enterprise</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
        <motion.p variants={itemVariants} className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Core Modules</motion.p>
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          
          if (item.highlight) {
            return (
              <motion.div variants={itemVariants} key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl bg-primary/10 border border-primary/50 text-primary group transition-all my-6 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:bg-primary/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">{item.icon}</span>
                  <span className="text-sm font-black uppercase tracking-widest text-white">{item.label}</span>
                  <span className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
                </Link>
              </motion.div>
            );
          }

          return (
            <motion.div variants={itemVariants} key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-primary shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-r-full"></motion.div>
                )}
                <span className={`text-xl transition-all ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`}>{item.icon}</span>
                <span className={`text-sm tracking-wide ${isActive ? 'font-black' : 'font-bold'}`}>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout} 
          className="flex items-center gap-3 w-full px-5 py-3 rounded-xl border border-rose-500/20 text-rose-500/70 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all group shadow-[0_0_15px_rgba(244,63,94,0)] hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        >
          <span className="text-xl group-hover:translate-x-1 transition-transform">🚪</span>
          <span className="text-sm font-bold tracking-widest uppercase">Disconnect</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}

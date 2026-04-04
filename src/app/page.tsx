'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Odoo POS Cafe</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link href="/login" className="btn-primary flex items-center gap-2 text-sm !py-2">
              Launch Terminal 🚀
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                ✨ Next Generation POS
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                Serve Smarter. <br />
                <span className="text-indigo-600">Sell Faster.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-md mb-10 leading-relaxed">
                A professional, real-time POS suite tailored for high-performance cafes and restaurants. Cloud-synced, offline-ready, and beautiful.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login" className="btn-primary text-lg !px-8 !py-4 shadow-xl shadow-indigo-500/30">Get Started Free</Link>
                <Link href="/kitchen" className="btn-secondary text-lg !px-8 !py-4">View Live Kitchen</Link>
              </div>
              
              <div className="mt-12 flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">10ms</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Real-time Sync</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">100%</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Cloud Secured</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative lg:h-[600px]"
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              {/* Mockup Container */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/50 to-amber-100/50 rounded-3xl blur-3xl opacity-50" />
              <div className="card relative h-full w-full bg-white border-2 border-slate-200 overflow-hidden !p-0 shadow-2xl skew-y-[-2deg] hover:skew-y-0 transition-transform duration-700">
                <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 px-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <div className="p-8">
                  <div className="h-4 w-32 bg-slate-100 rounded mb-8" />
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-32 bg-slate-50 rounded-xl border border-slate-100" />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-10 w-40 bg-indigo-50 rounded-lg" />
                    <div className="h-10 w-10 bg-indigo-600 rounded-lg" />
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">✓</div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Payment Received</div>
                  <div className="text-[10px] text-slate-500 font-medium">₹1,240.00 via UPI</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Built for Modern Operations</h2>
          <p className="text-slate-500 max-w-2xl mx-auto italic font-medium">Streamlining your cafe experience from table to kitchen display.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { icon: '🚀', title: 'Real-time Sync', desc: 'Orders reach the kitchen display in milliseconds using high-performance WebSockets.' },
            { icon: '💎', title: 'Premium Interface', desc: 'A meticulously designed UI that feels natural and professional for staff and customers.' },
            { icon: '📊', title: 'Deep Analytics', desc: 'Track your revenue, popular items, and cashier sessions with granular accuracy.' }
          ].map((f, i) => (
            <motion.div 
              key={f.title}
              whileHover={{ y: -10 }}
              className="card bg-white border-slate-100 !p-8 group cursor-default"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xl opacity-50">☕</span>
            <span className="font-bold text-slate-400 tracking-tight text-sm">© 2026 Odoo POS Cafe</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link href="/admin" className="hover:text-indigo-600 transition-colors">Backend Login</Link>
            <Link href="/kitchen" className="hover:text-indigo-600 transition-colors">Kitchen View</Link>
            <Link href="/customer-display" className="hover:text-indigo-600 transition-colors">Display</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

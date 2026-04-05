'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouse);

    const orbs = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 200 + 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      hue: Math.random() > 0.5 ? 189 : 262,
      opacity: Math.random() * 0.12 + 0.04,
    }));

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        const dx = mouseX - orb.x;
        const dy = mouseY - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400) {
          orb.vx += dx * 0.00003;
          orb.vy += dy * 0.00003;
        }

        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        orb.vx *= 0.999;
        orb.vy *= 0.999;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        if (orb.hue === 189) {
          gradient.addColorStop(0, `rgba(6, 182, 212, ${orb.opacity})`);
          gradient.addColorStop(0.5, `rgba(6, 182, 212, ${orb.opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        } else {
          gradient.addColorStop(0, `rgba(139, 92, 246, ${orb.opacity})`);
          gradient.addColorStop(0.5, `rgba(139, 92, 246, ${orb.opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.opacity})`;
        ctx.fill();
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Login failed'); return; }
      toast.success('Access Granted! Welcome back.');
      router.push('/admin');
    } catch {
      toast.error('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic animated background */}
      <DynamicBackground />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230ea5e9%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] z-[1]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 rounded-3xl">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-sky-500/10 rounded-[32px] mb-6 pulse-glow border border-sky-500/20"
            >
              <span className="text-5xl drop-shadow-2xl">☕</span>
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3 uppercase italic">POS TERMINAL</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Administrative Access Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email or Username</label>
              <input
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all backdrop-blur-sm"
                placeholder="admin@ods.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Password</label>
                <Link href="/forgot-password" className="text-[10px] text-sky-400 font-bold uppercase tracking-widest hover:underline hover:text-sky-300">Forgot Code?</Link>
              </div>
              <input
                type="password"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all backdrop-blur-sm"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full !py-5 !rounded-2xl shadow-2xl shadow-sky-600/20 text-lg uppercase font-black tracking-widest mt-4 group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>Enter Dashboard <span className="opacity-40 group-hover:translate-x-1 transition-transform inline-block ml-1">→</span></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mt-10 pt-8 border-t border-slate-900">
            Unregistered operator?{' '}
            <Link href="/signup" className="text-sky-400 hover:text-sky-300 hover:underline">Apply Here</Link>
          </p>

          <div className="mt-6 flex justify-center gap-4 grayscale opacity-30">
             <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] text-white font-black tracking-widest uppercase">SSL SECURE</div>
             <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] text-white font-black tracking-widest uppercase">2026 EDITION</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

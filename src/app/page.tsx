'use client';
import { useEffect, useRef } from 'react';
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
      canvas.height = window.innerHeight * 2; // cover full page scroll
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY + window.scrollY;
    };
    window.addEventListener('mousemove', handleMouse);

    // Floating orbs - more and bigger for the landing page
    const orbs = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 300 + 120,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      hue: Math.random() > 0.5 ? 189 : 262,
      opacity: Math.random() * 0.1 + 0.03,
    }));

    // Particles
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    // Shooting stars
    const shootingStars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];
    let lastShootingStar = 0;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Occasionally spawn a shooting star
      if (time - lastShootingStar > 3000 + Math.random() * 4000) {
        lastShootingStar = time;
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.3,
          vx: (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.random() * 2 + 1,
          life: 0,
          maxLife: 60 + Math.random() * 40,
        });
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;
        const alpha = 1 - ss.life / ss.maxLife;
        if (alpha <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        grad.addColorStop(0, `rgba(6, 182, 212, ${alpha * 0.8})`);
        grad.addColorStop(1, `rgba(6, 182, 212, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw orbs
      orbs.forEach((orb) => {
        const dx = mouseX - orb.x;
        const dy = mouseY - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 500) {
          orb.vx += dx * 0.00002;
          orb.vy += dy * 0.00002;
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

      // Draw particles
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

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.06 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-200 overflow-hidden relative">
      {/* Dynamic animated background */}
      <DynamicBackground />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 border border-primary/50 text-xl flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">☕</div>
            <span className="font-black text-white tracking-widest text-lg uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Odoo POS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-primary transition-colors">Auth</Link>
            <Link href="/login" className="btn-primary flex items-center gap-2 text-sm !py-2.5">
              Launch Engine 🚀
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 text-primary-400 rounded-full text-xs font-black uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                V2.0 Core Active
              </motion.div>
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-2xl">
                Serve Smarter. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-accent drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]">Sell Faster.</span>
              </h1>
              <p className="text-xl text-white/50 max-w-lg mb-12 leading-relaxed font-medium">
                Enterprise-grade POS terminal tailored for high-frequency environments. Zero latency. Complete synchronization.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link href="/login" className="btn-primary text-lg !px-10 !py-4 uppercase tracking-widest font-black flex items-center gap-3">
                  Initialize Terminal
                  <span className="text-2xl">➜</span>
                </Link>
                <Link href="/kitchen" className="btn-secondary text-lg !px-10 !py-4 uppercase tracking-widest font-black">
                  Kitchen View
                </Link>
              </div>
              
              <div className="mt-16 flex items-center gap-12">
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 relative group">
                  <div className="absolute -inset-4 bg-primary/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">10<span className="text-primary text-2xl">ms</span></span>
                  <span className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Sync Latency</span>
                </motion.div>
                <div className="w-px h-16 bg-white/10" />
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 relative group">
                  <div className="absolute -inset-4 bg-accent/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">100<span className="text-accent text-2xl">%</span></span>
                  <span className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Data Integrity</span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="relative lg:h-[700px] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              style={{ perspective: '1000px' }}
            >
              {/* Holographic glowing orb behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-[80px] opacity-70 animate-[pulse-glow_4s_infinite]" />
              
              <div className="card relative h-[600px] w-full bg-black/60 border border-white/20 overflow-hidden !p-0 shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.2)] backdrop-blur-2xl rounded-3xl z-10 block group">
                {/* Terminal Header */}
                <div className="h-10 bg-white/5 border-b border-white/10 flex items-center gap-2 px-5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <div className="ml-4 text-[10px] font-mono text-white/30 truncate">root@pos-terminal:~</div>
                </div>
                
                <div className="p-8 h-[calc(100%-40px)] flex flex-col relative">
                  {/* Subtle scanning line effect */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 shadow-[0_0_10px_rgba(6,182,212,1)] animate-[float_3s_ease-in-out_infinite] z-20 pointer-events-none opacity-50"></div>
                  
                  <div className="h-6 w-48 bg-white/10 rounded mb-8" />
                  <div className="grid grid-cols-2 gap-5 mb-8 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`rounded-2xl border border-white/10 p-4 shrink-0 shadow-inner group-hover:border-primary/30 transition-colors duration-500 ${i === 1 ? 'bg-primary/10 border-primary/40' : 'bg-white/5'}`}>
                        <div className="h-20 bg-black/40 rounded-xl mb-4" />
                        <div className="h-3 w-1/2 bg-white/20 rounded mb-2" />
                        <div className="h-3 w-1/3 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="h-12 w-48 bg-primary/20 rounded-xl" />
                    <div className="h-12 w-12 bg-primary text-black flex items-center justify-center font-black rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.5)]">➜</div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -30, 0], rotateZ: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-12 bg-black/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.2)] border border-white/10 flex items-center gap-4 z-20"
              >
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]">💵</div>
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-wider mb-1">Transaction Success</div>
                  <div className="text-sm text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">₹1,240.00 <span className="text-white/50 text-xs ml-1 font-medium">via UPI</span></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 relative z-10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl opacity-30 grayscale">☕</span>
            <span className="font-black text-white/30 tracking-widest text-[10px] uppercase">© 2026 Odoo System Interface</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
            <Link href="/admin" className="hover:text-primary transition-colors">System Admin</Link>
            <Link href="/kitchen" className="hover:text-primary transition-colors">Kitchen Display</Link>
            <Link href="/customer-display" className="hover:text-primary transition-colors">Customer Facing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

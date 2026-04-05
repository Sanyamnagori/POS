import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Odoo POS Cafe - Enterprise',
  description: 'Next-Generation Full-stack Restaurant Point of Sale System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body className={`${outfit.className} bg-black text-slate-200 min-h-screen selection:bg-primary/30 relative`}>
        {/* Ambient Animated Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden layout-bg pointer-events-none bg-black">
           <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px] mix-blend-screen animate-float"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '-3s' }}></div>
        </div>
        
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          {children}
        </div>
        
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(24, 24, 27, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 30px rgba(0,0,0,0.5)',
              padding: '16px',
            }
          }}
        />
      </body>
    </html>
  );
}

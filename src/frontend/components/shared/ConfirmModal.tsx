'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmModalProps) {
  const accentColor = type === 'danger' ? 'rose-500' : type === 'warning' ? 'amber-500' : 'primary';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-dark-900/40 border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Accent Blur */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 bg-${accentColor}/20 blur-3xl rounded-full`} />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-16 h-16 bg-${accentColor}/10 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-${accentColor}/20`}>
                {type === 'danger' ? '⚠️' : type === 'warning' ? '🔔' : 'ℹ️'}
              </div>
              
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                {title}
              </h3>
              
              <p className="text-slate-400 text-sm font-medium leading-relaxed italic mb-8">
                {message}
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={onCancel}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`flex-1 py-4 rounded-2xl bg-${accentColor} text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-${accentColor}/20`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

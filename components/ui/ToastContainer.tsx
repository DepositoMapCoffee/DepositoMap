'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/store/toastStore';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let colors = 'bg-surface-high/90 border-outline-soft/20 text-brand-white';
          
          if (toast.type === 'success') {
            Icon = CheckCircle2;
            colors = 'bg-brand-accent/20 border-brand-accent/30 text-brand-white';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            colors = 'bg-red-500/20 border-red-500/30 text-red-50';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto ${colors}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <p className="font-sans text-sm font-medium flex-1 leading-snug">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
              >
                <X className="w-4 h-4 opacity-70" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

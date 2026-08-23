import { Terminal, Download, MonitorPlay, Smartphone, X, Apple, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface InstallModalProps {
  onClose?: () => void;
  canBypass?: boolean;
}

export default function InstallModal({ onClose, canBypass = true }: InstallModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center p-4 sm:p-8 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={canBypass ? onClose : undefined}
        className="fixed inset-0 bg-zinc-950/95 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="my-auto relative w-full max-w-2xl glass-card rounded-[2rem] border border-white/10 shadow-2xl flex flex-col bg-zinc-900/90 z-10 p-8"
      >
        {canBypass && onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-neon-sm shrink-0">
            <Download className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-display text-white tracking-tight uppercase">App Installation</h2>
            <p className="text-sm font-medium text-zinc-400">Initialize Wealth Horizon on your device</p>
          </div>
        </div>

        <p className="text-zinc-300 text-sm mb-8 leading-relaxed">
          For the optimal, secure experience, Wealth Horizon is designed to run locally as a standalone application. Install it to your device to enable offline caching, native performance, and a full-screen environment stripped of browser chrome.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* iOS */}
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm uppercase tracking-widest mb-2">
              <Apple className="w-4 h-4 text-zinc-400" /> iOS
            </div>
            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-2 font-medium">
              <li>Open in <span className="text-zinc-200">Safari</span></li>
              <li>Tap the <span className="text-zinc-200">Share icon</span> at the bottom</li>
              <li>Scroll down and tap <span className="text-zinc-200">"Add to Home Screen"</span></li>
            </ol>
          </div>

          {/* Android */}
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm uppercase tracking-widest mb-2">
              <Smartphone className="w-4 h-4 text-zinc-400" /> Android
            </div>
            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-2 font-medium">
              <li>Open in <span className="text-zinc-200">Chrome</span></li>
              <li>Tap the <span className="text-zinc-200">3-dot menu</span> at the top right</li>
              <li>Tap <span className="text-zinc-200">"Install app"</span> or <span className="text-zinc-200">"Add to Home Screen"</span></li>
            </ol>
          </div>

          {/* Desktop */}
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm uppercase tracking-widest mb-2">
              <MonitorPlay className="w-4 h-4 text-zinc-400" /> Desktop
            </div>
            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-2 font-medium">
              <li>Open in <span className="text-zinc-200">Chrome</span> or <span className="text-zinc-200">Edge</span></li>
              <li>Look at the right side of the <span className="text-zinc-200">address bar</span> at the top</li>
              <li>Click the <span className="text-zinc-200">Install icon</span> <Download className="inline w-3 h-3 text-zinc-400"/></li>
            </ol>
          </div>

        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          {canBypass && onClose ? (
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-zinc-300 transition-all flex items-center gap-2"
            >
              Continue in Browser <ExternalLink className="h-3 w-3" />
            </button>
          ) : (
            <div />
          )}
          <button 
            onClick={() => {
              if (onClose && canBypass) onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-pink-600/20 text-pink-400 font-bold text-xs uppercase tracking-widest hover:bg-pink-600/30 hover:text-pink-300 transition-all border border-pink-500/30 shadow-lg shadow-pink-500/10 flex items-center gap-2"
          >
             {canBypass ? 'Acknowledge' : 'Awaiting Install...'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

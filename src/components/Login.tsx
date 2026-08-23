import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, Zap, Globe, Puzzle, Download, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useVersion } from '../context/VersionContext';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const isValidConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const { version } = useVersion();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!isValidConfig) {
      setError("Firebase is not configured yet. Please update firebase-applet-config.json with your own Firebase project credentials.");
      return;
    }
    try {
      await signIn();
    } catch (err: any) {
      if (err?.code === 'auth/cancelled-popup-request') {
        setError("Sign-in cancelled. Please try again.");
      } else {
        setError(err?.message || "Sign in failed");
      }
    }
  }

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-zinc-950 text-zinc-100 mesh-gradient relative overflow-y-auto overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-[2rem] shadow-2xl relative z-10 shrink-0 my-12"
        >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 via-rose-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-500 border border-white/20">
            <Globe className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-1">
            <h1 className="horizon-title text-4xl leading-none tracking-tighter">
              Wealth <span className="gradient-text">Horizon</span>
            </h1>
            <p className="text-zinc-500 font-bold italic text-[10px] uppercase tracking-[0.2em]">
              The next boundary of finance
            </p>
          </div>

          {!isValidConfig && (
            <div className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-xl text-left flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold mb-1">Firebase Configuration Missing</p>
                <p className="text-rose-400/80 text-xs">To run this app yourself, please open the <strong>Code Editor</strong> on the left, find <code className="bg-rose-500/20 px-1 rounded">firebase-applet-config.json</code>, and paste your own Firebase Web config inside.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/20 p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="w-full space-y-4 pt-4">
            <div className="flex items-center gap-3 text-left p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Secure Infrastructure</h3>
                <p className="text-xs text-zinc-500">Your data is yours. Protected by Firebase.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Real-time Syncing</h3>
                <p className="text-xs text-zinc-500">Instant updates across all your devices.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Puzzle className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Seamless Integration</h3>
                <p className="text-xs text-zinc-500">Connect your financial ecosystem with ease.</p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button
              id="google-login-btn"
              onClick={handleSignIn}
              className="w-full h-14 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 hover:brightness-110 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>

          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            No credit card required • GDPR Compliant • v{version}
          </p>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import { cloudService } from '../data/cloud';
import { Users, Shield, Activity, Database, Terminal, Server, Cpu, HardDrive, Wifi, MemoryStick as Memory, Globe, Layers, Power, Lock, RefreshCw, Folder, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Currency, CURRENCIES } from '../types';

import { useVersion } from '../context/VersionContext';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  netWorth: number;
  accountCount: number;
  investmentCount: number;
  transactionCount: number;
  lastActive: string;
  lastLogin?: string;
}

interface AdminConsoleProps {
  currency: Currency;
  globalUpdate: { message: string; version: number };
}

export default function AdminConsole({ currency, globalUpdate }: AdminConsoleProps) {
  const { version, setVersion } = useVersion();
  const [systemUpdateText, setSystemUpdateText] = useState(globalUpdate.message);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0 });
  const [feedback, setFeedback] = useState<any[]>([]);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showGlobalAlertModal, setShowGlobalAlertModal] = useState(false);
  const [globalAlertText, setGlobalAlertText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [systemLog, setSystemLog] = useState<{ id: string; msg: string; time: string; type: 'info' | 'success' | 'warn' }[]>([]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      msg,
      time: new Date().toLocaleTimeString(),
      type
    };
    setSystemLog(prev => [newLog, ...prev].slice(0, 5));
  };

  const handleSendGlobalAlert = async () => {
    if (!globalAlertText.trim()) return;
    try {
      await cloudService.saveGlobalAlert(globalAlertText.trim());
      addLog("Global alert broadcast transmitted to all nodes.", "warn");
      setShowGlobalAlertModal(false);
      setGlobalAlertText('');
    } catch (e) {
      addLog("Failed to broadcast global alert.", "warn");
    }
  };

  const rate = CURRENCIES[currency].rate;
  const symbol = CURRENCIES[currency].symbol;

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await cloudService.fetchAllUsersData();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();

    const unsubscribeFeedback = cloudService.subscribeToFeedback((fbData) => {
      setFeedback(fbData);
    });

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/system-metrics?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMetrics({ cpu: data.cpuUsagePercent, memory: data.memoryUsageMB });
      } catch (e) {
        console.error('Failed to fetch metrics', e);
      }
    };
    fetchMetrics();
    const metricsInterval = setInterval(fetchMetrics, 15000);

    return () => {
      unsubscribeFeedback();
      clearInterval(metricsInterval);
    };
  }, []);

  const totalTransactions = users.reduce((sum, u) => sum + u.transactionCount, 0);

  const filteredUsers = searchTerm.trim() 
    ? users.filter(u => u.id.includes(searchTerm) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    : users;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-12 w-12 border-t-2 border-teal-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Scanning System...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/30">
              <Shield className="h-5 w-5 text-teal-400" />
            </div>
            <h1 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">About App</h1>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest ml-12">System & Platform Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'System Info', value: `v${version}`, icon: Terminal, color: 'zinc', type: 'info', tip: 'Platform runtime version and kernel status.' },
          { label: 'Network Users', value: users.length, icon: Users, color: 'teal', type: 'action', action: () => setShowNetworkModal(true), tip: 'Total verified users in the database. Click to view.' },
          { label: 'Active Nodes', value: 'α-1, β-2, γ-1, δ-2', icon: Wifi, color: 'emerald', type: 'info', tip: 'Current distribution of high-availability clusters.' },
          
          // Sysadmin Commands
          { label: 'Lock System', value: 'Lockdown', icon: Lock, color: 'rose', type: 'action', action: () => addLog("System Lockdown initiated. All client actions frozen.", "warn"), tip: 'Restrict user access and freeze application state.' },
          { label: 'Reboot', value: 'Restart', icon: Power, color: 'orange', type: 'action', action: () => addLog("System reboot: Safe restart scheduled in 5m.", "warn"), tip: 'Trigger safe system restart for patch application.' },
          { label: 'Force Sync', value: 'Run', icon: RefreshCw, color: 'indigo', type: 'action', action: () => addLog("Master Ledger Sync successfully forced.", "success"), tip: 'Synchronize local state with master cloud ledger.' },
          { label: 'Audit Perf', value: 'Analyze', icon: Activity, color: 'emerald', type: 'action', action: () => addLog("Perf Audit: Latency 14ms (Optimal).", "info"), tip: 'Verify millisecond-accurate response times.' },
          { label: 'Global Alert', value: 'Alert', icon: Globe, color: 'violet', type: 'action', action: () => setShowGlobalAlertModal(true), tip: 'Transmit emergency status to all active clients.' }
        ].map((stat, i) => {
            const Wrapper = stat.type === 'action' ? motion.button : motion.div;
            return (
              <Wrapper 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={stat.type === 'action' ? stat.action : undefined}
                disabled={stat.type === 'action' ? false : undefined}
                className={`glass-card p-4 border border-zinc-500/20 space-y-2 flex flex-col items-center justify-center text-center 
                transition-all duration-200
                bg-zinc-900/50 hover:bg-zinc-900/80
                shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]
                rounded-2xl relative group w-full text-left
                ${stat.type === 'action' ? 'cursor-pointer hover:border-indigo-500/30 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] active:scale-95' : ''}
                ${stat.label === 'Active Nodes' ? 'z-50' : 'z-10'}
                `}
              >
                {stat.label === 'Active Nodes' ? (
                  <NodeDropdown nodes={[
                    { id: 'α-1', desc: 'Core ledger: main synchronization node.' },
                    { id: 'β-2', desc: 'Analytics: Real-time processing node.' },
                    { id: 'γ-1', desc: 'Auth provider: Identity management node.' },
                    { id: 'δ-2', desc: 'Storage gateway: Data persistence node.' },
                  ]} />
                ) : (
                 <>
                  <div className={`p-2 w-fit rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                    <p className={`text-xl font-black tracking-tighter ${stat.type === 'action' ? 'text-zinc-400' : 'text-zinc-100'}`}>{stat.value}</p>
                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity delay-100 italic">
                        {stat.tip}
                      </p>
                    </div>
                  </div>
                 </>
                )}
              </Wrapper>
            );
          }
        )}
      </div>

      <AnimatePresence>
        {systemLog.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="glass-card p-6 rounded-[2rem] border-white/5 space-y-4 shadow-2xl bg-zinc-950/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sysadmin Output</h2>
            </div>
            <div className="space-y-2 font-mono scrollbar-hide max-h-32 overflow-y-auto">
              {systemLog.map(log => (
                <div key={log.id} className="text-[10px] flex items-center justify-between group py-1 border-b border-white/5 last:border-none">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-700 w-16">[{log.time}]</span>
                    <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'warn' ? 'text-orange-400' : 'text-indigo-400'}>
                      {log.msg}
                    </span>
                  </div>
                  <span className="text-[8px] opacity-0 group-hover:opacity-100 text-zinc-800 uppercase tracking-tighter">Verified Agent</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-8">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-zinc-400" />
            <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Platform Infrastructure</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 group relative">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-zinc-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-300">Environment</span>
                  <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Deployment Cluster State</span>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">Production</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 group">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-zinc-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-300">Database Region</span>
                  <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Physical Master Shard Location</span>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400">europe-west1</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 group">
              <div className="flex items-center gap-3">
                <Cpu className="h-4 w-4 text-zinc-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-300">CPU Usage</span>
                  <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Real-time processing load</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: `${metrics.cpu}%` }} />
                </div>
                <span className="text-xs font-mono text-zinc-400">{metrics.cpu}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Memory className="h-4 w-4 text-zinc-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-300">Active Memory</span>
                  <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Dynamic RAM allocation</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (metrics.memory / 4096) * 100)}%` }} />
                </div>
                <span className="text-xs font-mono text-zinc-400">{metrics.memory} MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-6 max-h-[500px] flex flex-col">
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-pink-500 uppercase tracking-widest">Version Control</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-24 bg-zinc-900 border border-white/5 rounded-full px-4 py-1 text-[10px] font-mono text-zinc-300 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <textarea
                value={systemUpdateText}
                onChange={(e) => setSystemUpdateText(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-4 py-2 text-xs text-zinc-300 outline-none min-h-[80px]"
                placeholder="System update text..."
              />
              <button
                onClick={async () => {
                  try {
                    await cloudService.saveGlobalSystemUpdate(systemUpdateText, globalUpdate.version);
                    addLog('System update text updated', 'success');
                  } catch (e) {
                    addLog('Failed to update system message', 'warn');
                  }
                }}
                className="w-full py-2 bg-pink-600/20 text-pink-400 font-bold uppercase tracking-widest text-[10px] border border-pink-500/30 rounded-xl hover:bg-pink-600/40 hover:text-white transition-all"
              >
                Update System Message
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-6 max-h-[500px] flex flex-col">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-pink-400" />
              <h2 className="text-xs font-black text-pink-500 uppercase tracking-widest">User Feedback</h2>
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {feedback.length > 0 ? feedback.map((fb, idx) => (
              <div key={fb.id || idx} className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-zinc-300">{fb.userEmail}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{new Date(fb.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{fb.feedback}</p>
              </div>
            )) : (
              <div className="text-sm text-zinc-500 italic p-4 text-center">No feedback has been submitted yet.</div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNetworkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card rounded-[2rem] p-6 border-white/10 shadow-2xl bg-zinc-950/90 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h3 className="text-zinc-100 font-extrabold text-sm uppercase tracking-widest flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Network Users
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative group/search">
                    <input 
                      type="text"
                      placeholder="Search UID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-zinc-900 border border-white/10 rounded-full px-4 py-1 text-[10px] font-mono text-zinc-300 w-32 focus:w-48 focus:border-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setShowNetworkModal(false)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.length > 0 ? filteredUsers.map((u, idx) => {
                  const hasLoggedInRecently = u.lastLogin && (Date.now() - new Date(u.lastLogin).getTime() < 1000 * 60 * 60 * 24 * 7); // 7 days
                  return (
                  <div key={u.id || idx} className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-300 break-all">{u.email && u.email !== 'Unknown' ? u.email : (u.displayName !== 'Anonymous' ? u.displayName : u.id)}</span>
                      {hasLoggedInRecently ? (
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded shrink-0 ml-2">Active</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-500/10 px-2 py-0.5 rounded shrink-0 ml-2">Inactive</span>
                      )}
                    </div>
                    {u.lastLogin && (
                      <div className="text-[10px] text-zinc-500 font-mono">Last seen: {new Date(u.lastLogin).toLocaleString()}</div>
                    )}
                  </div>
                )}) : (
                  <div className="text-sm text-zinc-500 italic p-4 text-center">No users found in the system.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGlobalAlertModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm"
            onClick={() => setShowGlobalAlertModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <Globe className="h-5 w-5 text-violet-500" />
                  Global Broadcast
                </h2>
                <button onClick={() => setShowGlobalAlertModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Transmit an emergency alert to all connected nodes instantly. This will display prominently upon next interaction.
                </p>
                <textarea
                  value={globalAlertText}
                  onChange={(e) => setGlobalAlertText(e.target.value)}
                  placeholder="Enter broadcast message protocol..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 resize-none h-32 focus:outline-none focus:border-violet-500/50"
                />
                <button
                  onClick={handleSendGlobalAlert}
                  className="w-full py-3 bg-violet-600/20 text-violet-400 font-bold uppercase tracking-widest text-xs border border-violet-500/30 rounded-xl hover:bg-violet-600/40 hover:text-white transition-all shadow-lg shadow-violet-900/20"
                >
                  Transmit Beacon
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NodeDropdown({ nodes }: { nodes: { id: string; desc: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-center group py-2 transition-transform duration-200 active:scale-95">
        <Wifi className={`h-6 w-6 mx-auto transition-colors ${isOpen ? 'text-emerald-300' : 'text-emerald-500'}`} />
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1 group-hover:text-zinc-200">{isOpen ? "Close View" : "Active Nodes"}</p>
        <p className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1">{nodes.map(n => n.id).join(' • ')}</p>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-3 left-0 w-[85vw] sm:w-72 bg-zinc-950/90 rounded-2xl p-4 border border-zinc-800 shadow-2xl z-50 text-left backdrop-blur-md">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">System Node Topology</h4>
          {nodes.map(n => (
            <div key={n.id} className="text-xs py-2 border-b border-zinc-800/50 last:border-none">
              <span className="font-bold text-emerald-400 mr-2">{n.id}</span>
              <span className="text-zinc-300">{n.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, LogOut, Settings, IndianRupee, Activity, Users, Download, TrendingUp, Pin, Trash2, Volume2, Bell, Ban
} from "lucide-react";
import { auth, db } from "@/src/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/src/lib/utils";

const ADMIN_EMAIL = "itsyadavaman05@gmail.com";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);
  const [copyStatus, setCopyStatus] = useState("Copy Public Link");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && u.email === ADMIN_EMAIL) {
        setUser(u);
      } else {
        setUser(null);
        if (u) {
          signOut(auth);
          alert("UNAUTHORIZED ACCESS: Primary credentials required.");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const copyLink = () => {
    if (typeof window === "undefined") return;
    const link = `${window.location.origin}/`;
    navigator.clipboard.writeText(link);
    setCopyStatus("LINK COPIED");
    setTimeout(() => setCopyStatus("Copy Public Link"), 2000);
  };

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "donations"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDonations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const deleteDonation = async (id: string) => {
    if (confirm("Are you sure you want to purge this record?")) {
      await deleteDoc(doc(db, "donations", id));
    }
  };

  const totalEarnings = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-hud-bg flex items-center justify-center">
        <div className="text-hud-yellow animate-pulse font-mono tracking-[0.5em]">INITIALIZING_ADMIN_UPLINK...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hud-card p-12 max-w-md w-full text-center border-t-4 border-hud-yellow"
        >
          <Shield className="w-16 h-16 text-hud-yellow mx-auto mb-8 glow-yellow" />
          <h1 className="text-3xl font-black uppercase text-white mb-4 tracking-tighter">Command Center</h1>
          <p className="text-sm text-hud-green/50 uppercase tracking-widest mb-10 leading-relaxed font-mono">
            Restricted access portal. Authentication via primary biometric Google profile required.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full py-5 bg-hud-yellow text-black font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_30px_rgba(255,157,0,0.2)]"
          >
            Authorize Operator
          </button>
          <Link href="/" className="inline-block mt-8 text-[10px] text-hud-green/40 hover:text-hud-yellow uppercase tracking-[0.4em] transition-colors">
            Return to Public Feed
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <header className="p-6 border-b border-hud-border flex justify-between items-center bg-hud-panel/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 border border-hud-yellow flex items-center justify-center text-hud-yellow">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase text-white tracking-widest">Admin Control <span className="text-hud-yellow">v4.0</span></h1>
            <div className="text-[10px] text-hud-green/50 font-mono">OPERATOR: {user.email} // SESSION_ACTIVE</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="px-4 py-2 text-[10px] uppercase font-bold text-hud-green/60 hover:text-white transition-colors">Public View</Link>
          <button onClick={handleLogout} className="p-2 border border-hud-border text-hud-green/40 hover:text-hud-yellow transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Transmission Value" value={formatCurrency(totalEarnings)} icon={<IndianRupee />} trend="+12.4% vs last sync" />
          <StatCard title="Total Uplinks" value={donations.length.toString()} icon={<Activity />} trend="Nominal activity detected" />
          <StatCard title="Active Watchers" value="1,204" icon={<Users />} trend="Real-time occupancy" />
          <StatCard title="System Integrity" value="99.9%" icon={<Shield />} trend="All sectors operational" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="hud-card overflow-hidden">
               <div className="p-6 border-b border-hud-border flex justify-between items-center bg-hud-bg/50">
                  <h2 className="text-xl font-black uppercase text-white tracking-tighter">Transmission Registry</h2>
                  <div className="flex gap-2">
                    <button className="p-2 border border-hud-border text-hud-green/40 hover:text-hud-yellow transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
               </div>
               <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                   <thead className="bg-hud-bg/30 text-[10px] uppercase tracking-widest text-hud-green opacity-50">
                     <tr>
                       <th className="p-6 border-b border-hud-border">Timestamp</th>
                       <th className="p-6 border-b border-hud-border">Operator</th>
                       <th className="p-6 border-b border-hud-border">Units</th>
                       <th className="p-6 border-b border-hud-border">Signal Data</th>
                       <th className="p-6 border-b border-hud-border">Action</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs">
                     {donations.map((d) => (
                       <tr key={d.id} className="hover:bg-hud-green/[0.03] transition-colors group">
                         <td className="p-6 border-b border-hud-border font-mono text-hud-green/40">
                           {d.timestamp?.toDate ? d.timestamp.toDate().toLocaleString() : 'PENDING'}
                         </td>
                         <td className="p-6 border-b border-hud-border font-bold text-white uppercase">{d.name}</td>
                         <td className="p-6 border-b border-hud-border font-black text-hud-yellow">{formatCurrency(d.amount)}</td>
                         <td className="p-6 border-b border-hud-border text-hud-green/80 italic line-clamp-1 truncate max-w-xs">
                           "{d.message}"
                         </td>
                         <td className="p-6 border-b border-hud-border">
                            <div className="flex gap-3">
                               <button className="p-2 opacity-0 group-hover:opacity-100 text-hud-green/40 hover:text-hud-yellow transition-all">
                                 <Pin className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => deleteDonation(d.id)}
                                 className="p-2 opacity-0 group-hover:opacity-100 text-hud-green/40 hover:text-hud-yellow transition-all"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {donations.length === 0 && (
                   <div className="py-20 text-center text-hud-green/20 uppercase tracking-[0.5em] text-xs">Registry Empty</div>
                 )}
               </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="lg:col-span-4 space-y-8">
             <div className="hud-card p-8 space-y-8">
                <h3 className="text-sm font-black uppercase text-hud-yellow tracking-widest border-b border-hud-border pb-4">TERMINAL_SETTINGS</h3>
                
                <div className="space-y-6">
                   <ToggleSetting label="Text-to-Speech Audio" icon={<Volume2 />} active />
                   <ToggleSetting label="Global Alerts" icon={<Bell />} active />
                   <ToggleSetting label="Auto-Pin Highest" icon={<Pin />} />
                   <ToggleSetting label="Obscenity Scrubbing" icon={<Ban />} active />
                </div>

                <div className="pt-8 space-y-4">
                  <h4 className="tactical-label">Public Donation Link</h4>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={typeof window !== "undefined" ? `${window.location.origin}/` : ""}
                      className="bg-hud-bg border border-hud-border p-3 text-[10px] font-mono text-hud-green flex-1 focus:outline-none"
                    />
                    <button 
                      onClick={copyLink}
                      className="px-4 border border-hud-border bg-hud-yellow text-black hover:bg-white transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                    >
                      {copyStatus}
                    </button>
                  </div>
                  <p className="text-[9px] text-hud-green/30 uppercase leading-relaxed">
                    This link is restricted. Only viewers with this direct URL can access the support terminal.
                  </p>
                </div>

                <div className="pt-8">
                   <button className="w-full py-4 border border-hud-yellow text-hud-yellow hover:bg-hud-yellow hover:text-black font-black uppercase text-xs tracking-widest transition-all">
                     Export Signal Logs (.CSV)
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="hud-card p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-hud-yellow opacity-50" />
      <div className="flex justify-between items-start mb-4">
        <div className="text-hud-green/50">{icon}</div>
        <TrendingUp className="w-4 h-4 text-hud-green/20" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-hud-green/40 mb-1">{title}</div>
        <div className="text-3xl font-black text-white tracking-tighter mb-2">{value}</div>
        <div className="text-[9px] uppercase tracking-tight text-hud-yellow font-bold">{trend}</div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, icon, active = false }: any) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
         <div className="text-hud-green/40 group-hover:text-hud-yellow transition-colors">{icon}</div>
         <span className="text-[10px] uppercase font-black text-white tracking-widest">{label}</span>
       </div>
       <div className={cn(
         "w-10 h-5 border flex items-center px-1 transition-all",
         active ? "border-hud-yellow bg-hud-yellow/20 justify-end" : "border-hud-border bg-hud-bg justify-start"
       )}>
          <div className={cn("w-3 h-3 rotate-45", active ? "bg-hud-yellow glow-yellow" : "bg-hud-green/20")} />
       </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Star, Trophy, MessageSquare } from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";
import confetti from "canvas-confetti";

interface Donation {
  id: string;
  name: string;
  amount: number;
  message: string;
  timestamp: any;
  verified: boolean;
}

export default function LiveFeed() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeAlert, setActiveAlert] = useState<Donation | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "donations"),
      where("verified", "==", true),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
      
      if (docs.length > 0 && donations.length > 0 && docs[0].id !== donations[0].id) {
        handleNewDonation(docs[0]);
      }
      setDonations(docs);
    });

    return () => unsubscribe();
  }, [donations.length]);

  const handleNewDonation = (donation: Donation) => {
    setActiveAlert(donation);
    
    if (donation.amount >= 500) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ff9d00', '#ffffff']
      });
    }

    setTimeout(() => setActiveAlert(null), 8000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-x-0 top-24 z-50 flex justify-center pointer-events-none px-4"
          >
            <AlertCard donation={activeAlert} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-6 px-2 shrink-0">
        <RadioPulse />
        <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white italic underline decoration-hud-yellow decoration-2 underline-offset-8">Superchats</h3>
        <div className="h-[1px] flex-1 bg-hud-border/30 ml-4" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-10 pr-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {donations.map((donation) => (
            <motion.div
              key={donation.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "p-4 hud-card transition-all flex gap-4 overflow-hidden border-l-2",
                donation.amount >= 1000 ? "border-l-hud-yellow-bright bg-hud-yellow/[0.04]" : 
                donation.amount >= 500 ? "border-l-hud-yellow bg-hud-yellow/[0.02]" : 
                "border-l-hud-border"
              )}
            >
              <div className={cn(
                "shrink-0 flex items-center justify-center w-10 h-10 border font-black text-[8px] tracking-tighter",
                donation.amount >= 500 ? "border-hud-yellow text-hud-yellow" : "border-hud-border text-hud-green/30"
              )}>
                {donation.amount >= 1000 ? "VIP" : donation.amount >= 500 ? "PRO" : "STD"}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className={cn(
                    "font-black uppercase tracking-tight text-xs truncate",
                    donation.amount >= 500 ? "text-hud-yellow" : "text-white"
                  )}>{donation.name}</span>
                  <span className={cn(
                    "text-xs font-black italic shrink-0",
                    donation.amount >= 500 ? "text-hud-yellow-bright" : "text-hud-green"
                  )}>{formatCurrency(donation.amount)}</span>
                </div>
                <p className={cn(
                  "text-[11px] mt-1.5 leading-snug font-medium break-words",
                  donation.amount >= 500 ? "text-white/90" : "text-hud-green/70"
                )}>
                  {donation.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {donations.length === 0 && (
          <div className="text-center py-20 border border-dashed border-hud-border/10 opacity-10">
            <p className="text-[8px] uppercase tracking-[0.5em]">Sector clear // Waiting for signal</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ donation, isFullscreen }: { donation: Donation, isFullscreen?: boolean }) {
  return (
    <div className={cn(
      "w-full max-w-xl p-12 hud-card border-2 relative",
      donation.amount >= 1000 ? "border-hud-yellow-bright shadow-[0_0_50px_rgba(255,157,0,0.2)]" : 
      donation.amount >= 500 ? "border-hud-yellow bg-hud-yellow/10 shadow-[0_0_30px_rgba(255,157,0,0.1)]" : 
      "border-hud-green bg-hud-bg"
    )}>
      <div className="absolute inset-0 grid-bg opacity-10" />
      
      <div className="relative z-10 text-center space-y-8">
         <div className="tactical-label flex justify-center gap-3 items-center opacity-100">
           <Zap className="w-4 h-4 text-hud-yellow animate-pulse" />
           High-Priority Transmission Received
           <Zap className="w-4 h-4 text-hud-yellow animate-pulse" />
         </div>

        <div className="space-y-2">
          <h2 className={cn(
            "text-5xl font-black uppercase tracking-tight mb-2 hud-title-gradient",
            donation.amount >= 500 ? "scale-110" : ""
          )}>{donation.name}</h2>
          <div className="text-[10px] font-mono text-hud-green tracking-[0.5em] uppercase opacity-50">Uplink Status: Secure</div>
        </div>

        <div className={cn(
          "w-full py-6 border-y-2 text-6xl font-black tracking-tighter flex items-center justify-center gap-4",
          donation.amount >= 500 ? "border-hud-yellow text-hud-yellow" : "border-hud-green text-hud-green"
        )}>
          <span className="text-3xl opacity-50">₹</span>
          {donation.amount}
        </div>

        <div className={cn(
          "relative p-8 border bg-hud-bg/90 text-2xl font-bold tracking-tight",
          donation.amount >= 500 ? "border-hud-yellow/30 text-white" : "border-hud-border text-hud-green"
        )}>
          <div className="absolute -top-3 left-6 px-4 bg-hud-bg text-[10px] uppercase font-mono tracking-widest text-hud-yellow">Signal_Data</div>
          "{donation.message}"
        </div>
      </div>

      {/* Decorative hud corners */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-hud-yellow" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-hud-yellow" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-hud-yellow" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-hud-yellow" />
    </div>
  );
}

function RadioPulse() {
  return (
    <div className="relative flex items-center justify-center w-4 h-4">
      <div className="absolute w-full h-full bg-hud-green rounded-full animate-ping opacity-75" />
      <div className="relative w-2 h-2 bg-hud-green rounded-full" />
    </div>
  );
}

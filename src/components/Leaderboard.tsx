import React, { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Trophy, Medal, IndianRupee } from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";

interface Supporter {
  name: string;
  totalAmount: number;
}

export default function Leaderboard() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  useEffect(() => {
    const q = query(collection(db, "donations"), where("verified", "==", true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const totals: Record<string, number> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        totals[data.name] = (totals[data.name] || 0) + data.amount;
      });

      const sorted = Object.entries(totals)
        .map(([name, totalAmount]) => ({ name, totalAmount }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      setSupporters(sorted);
    });

    return () => unsubscribe();
  }, []);

  const maxAmount = supporters.length > 0 ? supporters[0].totalAmount : 1;

  return (
    <div className="hud-card p-8 border-t-2 border-hud-yellow">
      <div className="tactical-label mb-2 flex items-center gap-3">
        <Trophy className="w-4 h-4 text-hud-yellow" />
        Elite Supporters Dashboard
      </div>
      <h2 className="text-3xl font-black uppercase text-white mb-8 tracking-tight italic">Leaderboard <span className="text-hud-yellow opacity-50">//</span> ALLTI_STATS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {supporters.map((s, index) => (
            <motion.div
              key={s.name}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "group relative p-6 border transition-all h-full flex flex-col justify-between",
                index === 0 ? "border-hud-yellow bg-hud-yellow/[0.03] shadow-[0_0_25px_rgba(255,157,0,0.1)]" : 
                index === 1 ? "border-slate-400/50 bg-slate-400/[0.02]" :
                index === 2 ? "border-amber-700/50 bg-amber-700/[0.02]" :
                "border-hud-border bg-hud-bg/50 hover:border-hud-green/30"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <RankIndicator rank={index + 1} />
                <div className={cn(
                  "text-lg font-black tracking-tighter",
                  index === 0 ? "text-hud-yellow" : "text-white"
                )}>
                  {formatCurrency(s.totalAmount)}
                </div>
              </div>

              <div className="space-y-4">
                <div className={cn(
                  "font-black uppercase tracking-widest text-sm truncate",
                  index === 0 ? "text-hud-yellow-bright" : "text-hud-green"
                )}>
                  {s.name}
                </div>

                <div className="h-1 bg-hud-green/5 w-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.totalAmount / maxAmount) * 100}%` }}
                    className={cn(
                      "h-full relative",
                      index === 0 ? "bg-hud-yellow" : "bg-hud-green/40"
                    )}
                  />
                </div>
              </div>

              {index === 0 && (
                <div className="absolute -top-3 -right-3 bg-hud-yellow text-black px-2 py-1 text-[8px] font-black tracking-widest shadow-lg rotate-12">
                  TOP_UNIT
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {supporters.length === 0 && (
        <div className="text-center py-20 border border-dashed border-hud-border opacity-20">
          <p className="text-[10px] uppercase tracking-[0.5em]">No signal history detected</p>
        </div>
      )}
    </div>
  );
}

function RankIndicator({ rank }: { rank: number }) {
  const getRankStyle = () => {
    switch (rank) {
      case 1: return "bg-hud-yellow text-black border-hud-yellow shadow-[0_0_15px_rgba(255,157,0,0.4)]";
      case 2: return "bg-slate-400 text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]";
      case 3: return "bg-amber-700 text-black border-amber-500 shadow-[0_0_10px_rgba(180,83,9,0.2)]";
      default: return "bg-transparent text-hud-green border-hud-border";
    }
  };

  return (
    <div className={cn(
      "w-7 h-7 border flex items-center justify-center text-[10px] font-black transition-all",
      getRankStyle()
    )}>
      {rank}
    </div>
  );
}

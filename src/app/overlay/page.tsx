"use client";

import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";
import confetti from "canvas-confetti";

interface Donation {
  id: string;
  name: string;
  amount: number;
  message: string;
  timestamp: any;
}

export default function OverlayPage() {
  const [activeAlert, setActiveAlert] = useState<Donation | null>(null);
  const [latestDonation, setLatestDonation] = useState<Donation | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "donations"),
      where("verified", "==", true),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const donation = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Donation;
        
        if (!latestDonation || donation.id !== latestDonation.id) {
          triggerAlert(donation);
        }
        setLatestDonation(donation);
      }
    });

    return () => unsubscribe();
  }, [latestDonation]);

  const triggerAlert = (donation: Donation) => {
    setActiveAlert(donation);
    
    if (donation.amount >= 500) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.1 },
        colors: ['#ff9d00', '#ffffff']
      });
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(`${donation.name} says: ${donation.message}`);
      utterance.rate = 1.0;
      utterance.pitch = 0.8; 
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => setActiveAlert(null), 8000);
  };

  return (
    <div className="w-full h-screen bg-transparent overflow-hidden font-sans text-hud-green p-20 select-none border-[12px] border-transparent flex items-center justify-center relative">
      {/* Alert Center */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <AnimatePresence>
          {activeAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <AlertCard donation={activeAlert} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ticker Widget */}
      <div className="absolute bottom-20 right-20">
        <AnimatePresence>
          {latestDonation && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="hud-card p-6 flex items-center gap-6 min-w-[350px] border-l-4 border-l-hud-yellow bg-hud-bg/95"
            >
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.4em] text-hud-yellow font-black mb-1 opacity-60">Latest_Uplink</div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-xl text-white uppercase tracking-tight">{latestDonation.name}</span>
                  <span className="text-hud-yellow font-black text-lg italic">{formatCurrency(latestDonation.amount)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AlertCard({ donation }: { donation: Donation }) {
  const isHighTier = donation.amount >= 500;

  return (
    <div className={cn(
      "w-[700px] p-12 hud-card border-2 relative overflow-hidden",
      isHighTier ? "border-hud-yellow shadow-[0_0_80px_rgba(255,157,0,0.2)] bg-hud-bg/95" : "border-hud-green bg-hud-bg/90"
    )}>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-hud-yellow/20 -translate-y-full animate-[scan_3s_linear_infinite]" />
      
      <div className="relative z-10 text-center space-y-10">
        <div className="flex justify-center items-center gap-4">
          <div className="h-[1px] flex-1 bg-hud-border" />
          <div className="tactical-label flex items-center gap-3 opacity-100">
             <Zap className={cn("w-4 h-4", isHighTier ? "text-hud-yellow" : "text-hud-green")} />
             Priority Transmission Detected
             <Zap className={cn("w-4 h-4", isHighTier ? "text-hud-yellow" : "text-hud-green")} />
          </div>
          <div className="h-[1px] flex-1 bg-hud-border" />
        </div>

        <div className="space-y-4">
          <motion.h2 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={cn(
            "text-6xl font-black uppercase tracking-tighter hud-title-gradient",
            isHighTier ? "text-hud-yellow" : ""
          )}>{donation.name}</motion.h2>
          <div className="text-5xl font-black text-white italic tracking-widest flex items-center justify-center gap-4">
            <span className="text-2xl opacity-40">₹</span>
            {donation.amount}
          </div>
        </div>

        <div className={cn(
          "relative p-10 border bg-hud-bg text-3xl font-bold tracking-tight italic leading-relaxed",
          isHighTier ? "border-hud-yellow/40 text-white" : "border-hud-border text-hud-green"
        )}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 bg-hud-bg text-[12px] uppercase font-mono tracking-[0.5em] text-hud-yellow">Signal_Data</div>
          "{donation.message}"
        </div>
      </div>

      {/* Decorative hud corners */}
      <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-hud-yellow" />
      <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-hud-yellow" />
      <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-hud-yellow" />
      <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-hud-yellow" />
    </div>
  );
}

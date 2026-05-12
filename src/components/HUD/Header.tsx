"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, Layout, Radio, User } from "lucide-react";
import Link from "next/link";
import { auth } from "@/src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "arao26704@gmail.com";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="relative w-full pt-8 pb-4 px-10 border-b border-hud-border">
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-hud-yellow/10 border border-hud-yellow flex items-center justify-center glow-yellow">
            <Zap className="w-6 h-6 text-hud-yellow fill-hud-yellow/20" />
          </div>
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tight hud-title-gradient">
                SUPPORT <span className="text-hud-yellow">TERMINAL</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 mt-1">
               <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-hud-green">
                 <Radio className="w-3 h-3 animate-pulse" />
                 LIVE_FEED_SYNCED
               </div>
               <span className="text-hud-green/30">•</span>
               <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-hud-green">
                 <Layout className="w-3 h-3" />
                 V4.2.0_STABLE
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <div className="text-[10px] text-hud-green/50 uppercase tracking-widest">Operator Console</div>
            <div className="text-xs font-bold text-white uppercase tracking-tighter">XONN_STREAM_UPLINK</div>
          </div>
          
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 px-6 py-2 bg-hud-yellow/10 border border-hud-yellow/30 text-hud-yellow text-xs font-bold uppercase tracking-widest hover:bg-hud-yellow hover:text-black transition-all">
              <User className="w-4 h-4" />
              Admin Access
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

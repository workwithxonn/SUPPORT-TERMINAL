import React from "react";
import { motion } from "motion/react";
import Header from "@/src/components/HUD/Header.tsx";
import DonationForm from "@/src/components/DonationForm.tsx";
import LiveFeed from "@/src/components/LiveFeed.tsx";
import Leaderboard from "@/src/components/Leaderboard.tsx";
import { Radar, Hexagon, Code, Settings, Share2, Info, Activity, Radio } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen grid-bg relative overflow-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 px-6 md:px-10 py-6 overflow-hidden flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
          {/* Left Side: Support Panel (Compact) */}
          <div className="lg:w-[450px] shrink-0 overflow-y-auto no-scrollbar">
            <DonationForm onSuccess={() => {}} />
          </div>

          {/* Right Side: SuperChat Feed (Latest First) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <LiveFeed />
          </div>
        </div>

        {/* Bottom Section: Top Supporters Leaderboard (Aggregated) */}
        <div className="mt-auto border-t border-hud-border pt-8 pb-10">
          <Leaderboard />
        </div>
      </main>

      {/* Decorative HUD Details */}
      <div className="fixed bottom-4 left-4 pointer-events-none opacity-10">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em]">
          XONN_TERMINAL_ID: 0x4F2 // UPLINK: STABLE
        </div>
      </div>
    </div>
  );
}

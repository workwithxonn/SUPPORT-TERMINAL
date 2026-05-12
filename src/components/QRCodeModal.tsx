"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Timer, AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";

interface Props {
  orderId: string;
  amount: number;
  paymentLink: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QRCodeModal({ orderId, amount, paymentLink, onClose, onSuccess }: Props) {
  const [timeLeft, setTimeLeft] = useState(40);
  const [status, setStatus] = useState<"pending" | "expired" | "success">("pending");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setStatus("expired");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 100;
      if (ctx) {
        ctx.fillStyle = "#121812";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        ctx.fillStyle = "#ff9d00";
        ctx.font = "bold 16px JetBrains Mono";
        ctx.textAlign = "center";
        ctx.fillText(`AMOUNT: ${formatCurrency(amount)}`, canvas.width / 2, img.height + 60);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `XONN_QR_${orderId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-hud-bg/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="hud-card w-full max-w-sm p-8 flex flex-col items-center relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-hud-green/40 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="tactical-label mb-6">Payment Uplink Authorized</div>
        
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-white mb-2">{formatCurrency(amount)}</div>
          <div className="text-[10px] uppercase tracking-widest text-hud-green/60">Order ID: {orderId}</div>
        </div>

        <div ref={qrRef} className="p-4 bg-white rounded-none mb-8 relative group">
          {status === "expired" && (
            <div className="absolute inset-0 bg-hud-bg/90 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-hud-yellow mb-4" />
              <div className="text-sm font-bold uppercase text-hud-yellow">Session Expired</div>
            </div>
          )}
          <QRCodeSVG 
            value={paymentLink} 
            size={200} 
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="w-full space-y-4">
          {status === "pending" ? (
            <>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest mb-2 px-2">
                <div className="flex items-center gap-2">
                  <Timer className={cn("w-4 h-4", timeLeft < 10 ? "text-hud-yellow animate-pulse" : "text-hud-green")} />
                  <span className={timeLeft < 10 ? "text-hud-yellow" : ""}>Expires In: {timeLeft}s</span>
                </div>
                <span className="text-hud-green/40">Secure Uplink</span>
              </div>
              
              <button
                onClick={downloadQR}
                className="w-full py-4 border border-hud-green/30 text-hud-green text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-hud-green hover:text-hud-bg transition-all flex items-center justify-center gap-3"
              >
                <Download className="w-4 h-4" />
                Download QR Asset
              </button>
            </>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-hud-yellow text-black text-[10px] font-black uppercase tracking-[0.2em] glow-yellow transition-all"
            >
              Generate New QR
            </button>
          )}
        </div>

        <div className="mt-8 text-[8px] uppercase tracking-[0.3em] text-center text-hud-green/40">
           Scan using any UPI app // Encryption Level 5 Active
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-hud-yellow/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-hud-yellow/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-hud-yellow/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-hud-yellow/50" />
      </motion.div>
    </div>
  );
}

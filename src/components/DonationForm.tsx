"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, AlertTriangle, CheckCircle2, Loader2, Zap } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/src/lib/utils";
import QRCodeModal from "./QRCodeModal";

interface Props {
  onSuccess: (donation: any) => void;
}

export default function DonationForm({ onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: 20,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charLimit, setCharLimit] = useState(20);
  const [paymentData, setPaymentData] = useState<{ orderId: string, paymentLink: string } | null>(null);

  useEffect(() => {
    const amount = formData.amount;
    if (amount >= 500) setCharLimit(1000);
    else if (amount >= 200) setCharLimit(250);
    else if (amount >= 100) setCharLimit(120);
    else if (amount >= 50) setCharLimit(50);
    else setCharLimit(20);
  }, [formData.amount]);

  const isOverLimit = formData.message.length > charLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit) return;
    if (formData.amount < 20) {
      setError("Minimum donation is ₹20");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: formData.amount,
          email: formData.email,
          name: formData.name
        }),
      });
      
      const contentType = orderRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await orderRes.text();
        console.error("Non-JSON response received:", text);
        throw new Error("Terminal link failed: Server returned non-JSON response. Check console.");
      }

      const order = await orderRes.json();
      if (!orderRes.ok || !order.success) {
        throw new Error(order.error || order.message || "Failed to initiate payment");
      }

      // 2. Show QR Modal
      setPaymentData({
        orderId: order.id,
        paymentLink: order.short_url || `https://checkout.razorpay.com/v1/checkout.js?order_id=${order.id}`
      });
      
    } catch (err: any) {
      console.error("Donation Error:", err);
      setError(err.message || "Unknown error encountered during transmission");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    const donationData = {
      ...formData,
      razorpayOrderId: paymentData?.orderId,
      verified: true,
      timestamp: serverTimestamp(),
      status: 'success'
    };
    
    await addDoc(collection(db, "donations"), donationData);
    onSuccess(donationData);
    setFormData({ name: "", email: "", amount: 20, message: "" });
    setPaymentData(null);
  };

  return (
    <div className="hud-card p-10 group overflow-hidden border-l-4 border-l-hud-yellow">
      <div className="flex justify-between items-start mb-10">
        <div className="p-3 bg-hud-yellow/10 border border-hud-yellow text-hud-yellow group-hover:glow-yellow transition-all">
          <Zap className="w-6 h-6 fill-hud-yellow/10" />
        </div>
        <div className="tactical-label opacity-100">Support Uplink</div>
      </div>
      
      <h2 className="text-4xl font-black uppercase tracking-tight text-white mb-6">INITIATE <span className="text-hud-yellow">SUPPORT</span></h2>
      
      <p className="text-xs text-hud-green/60 uppercase mb-10 leading-relaxed font-mono">
        Configure signal parameters. Higher contribution units grant increased character bandwidth and priority transmission status.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-3">
            <label className="tactical-label opacity-100">Signal Identity</label>
            <input
              type="text"
              required
              placeholder="DISPLAY NAME"
              className="w-full bg-hud-bg/50 border border-hud-border text-white p-5 focus:border-hud-yellow focus:outline-none transition-all font-bold placeholder:text-hud-green/20"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="tactical-label opacity-100">Contact Protocol</label>
            <input
              type="email"
              required
              placeholder="EMAIL_ADDRESS"
              className="w-full bg-hud-bg/50 border border-hud-border text-white p-5 focus:border-hud-yellow focus:outline-none transition-all font-bold placeholder:text-hud-green/20"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="tactical-label opacity-100 flex justify-between">
            <span>Contribution Units (INR)</span>
            <span className="text-hud-yellow">MIN_REQ: ₹20</span>
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-hud-yellow font-black text-2xl">₹</span>
            <input
              type="number"
              required
              min="20"
              className="w-full bg-hud-bg/50 border border-hud-border text-hud-yellow p-8 pl-12 text-5xl font-black focus:border-hud-yellow-bright focus:outline-none transition-all shadow-inner"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {[50, 100, 200, 500, 1000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setFormData({...formData, amount: amt})}
                className={cn(
                  "px-6 py-3 text-[10px] border border-hud-border font-black transition-all uppercase tracking-widest",
                  formData.amount === amt ? "bg-hud-yellow text-black border-hud-yellow glow-yellow" : "hover:border-hud-yellow hover:text-hud-yellow"
                )}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end mb-1">
            <label className="tactical-label opacity-100">Encoded Message</label>
            <span className={cn(
              "text-[10px] font-mono",
              isOverLimit ? "text-hud-yellow-bright animate-pulse font-black" : "text-hud-green/40"
            )}>
              {formData.message.length} / {charLimit === Infinity ? "∞" : charLimit}
            </span>
          </div>
          <textarea
            required
            placeholder="TYPE MESSAGE TO STREAMER..."
            rows={5}
            className={cn(
              "w-full bg-hud-bg/50 border p-5 focus:outline-none transition-all font-bold placeholder:text-hud-green/20 resize-none",
              isOverLimit ? "border-hud-yellow-bright bg-hud-yellow/5 text-hud-yellow" : "border-hud-border text-white focus:border-hud-yellow"
            )}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          {isOverLimit && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] text-hud-yellow-bright font-black uppercase tracking-widest mt-2"
            >
              BUFFER OVERFLOW: Increase contribution for more bandwidth.
            </motion.p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || isOverLimit}
          className={cn(
            "w-full py-6 uppercase font-black tracking-[0.4em] transition-all relative overflow-hidden text-lg",
            (loading || isOverLimit) ? "bg-hud-green/5 text-hud-green/20 cursor-not-allowed" : "bg-hud-yellow text-black hover:bg-white glow-yellow active:scale-[0.98]"
          )}
        >
          {loading ? "PROCESSING..." : "TRANSMIT SUPPORT"}
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 border border-hud-yellow/50 bg-hud-yellow/10 text-hud-yellow text-xs font-bold uppercase tracking-[0.2em] text-center"
            >
              FAILURE_REASON: {error}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {paymentData && (
          <QRCodeModal
            amount={formData.amount}
            orderId={paymentData.orderId}
            paymentLink={paymentData.paymentLink}
            onClose={() => setPaymentData(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

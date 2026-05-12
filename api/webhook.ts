import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "xonn_webh1ook_secure_2026";
    const signature = req.headers["x-razorpay-signature"] as string;
    
    if (!signature) {
      return res.status(400).json({ success: false, error: "Missing signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
      .digest("hex");

    res.setHeader("Content-Type", "application/json");
    if (expectedSignature === signature) {
      const event = req.body.event;
      console.log("[WEBHOOK] Received Event:", event);
      
      if (event === "payment.captured") {
         console.log("[WEBHOOK] Payment Captured:", req.body.payload.payment.entity.id);
      }
      res.status(200).json({ success: true, status: "ok" });
    } else {
      console.warn("[WEBHOOK] Signature Mismatch");
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err: any) {
    console.error("[WEBHOOK] Error:", err);
    res.status(500).json({ success: false, error: "Internal webhook error" });
  }
}

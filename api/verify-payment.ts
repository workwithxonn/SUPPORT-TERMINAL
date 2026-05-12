import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({ success: false, error: "RAZORPAY_KEY_SECRET not configured on server" });
    }
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    res.setHeader("Content-Type", "application/json");
    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true, verified: true });
    } else {
      res.status(400).json({ success: false, verified: false, error: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("[API] Verification Error:", error);
    res.status(500).json({ success: false, error: "Verification process failed" });
  }
}

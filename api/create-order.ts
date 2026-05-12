import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpay: any = null;

const getRazorpay = () => {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.");
    }
    
    razorpay = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpay;
};

export default async function handler(req: any, res: any) {
  // Simple check for method
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { amount, currency = "INR", name, email } = req.body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) < 20) {
      return res.status(400).json({ 
        success: false, 
        error: "Minimum donation is ₹20" 
      });
    }

    const client = getRazorpay();

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        donor_name: name || "Anonymous",
        donor_email: email || "no-email@provided.com"
      }
    };

    console.log("[API] Creating Razorpay Order:", options);
    const order = await client.orders.create(options);
    
    // Ensure we return valid JSON
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ ...order, success: true });
  } catch (error: any) {
    console.error("[API] Razorpay Order Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to create order",
      message: "Check server logs for details"
    });
  }
}

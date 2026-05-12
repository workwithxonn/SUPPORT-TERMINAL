import { NextResponse } from "next/server";
import Razorpay from "razorpay";

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

export async function POST(request: Request) {
  try {
    const { amount, currency = "INR", name, email } = await request.json();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) < 20) {
      return NextResponse.json({ 
        success: false, 
        error: "Minimum donation is ₹20" 
      }, { status: 400 });
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

    console.log("[NEXT_API] Creating Razorpay Order:", options);
    const order = await client.orders.create(options);
    
    return NextResponse.json({ ...order, success: true });
  } catch (error: any) {
    console.error("[NEXT_API] Razorpay Order Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to create order",
      message: "Check server logs for details"
    }, { status: 500 });
  }
}

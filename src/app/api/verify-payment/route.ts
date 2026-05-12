import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ success: false, error: "RAZORPAY_KEY_SECRET not configured on server" }, { status: 500 });
    }
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({ success: false, verified: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[NEXT_API] Verification Error:", error);
    return NextResponse.json({ success: false, error: "Verification process failed" }, { status: 500 });
  }
}

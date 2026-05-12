import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "xonn_webh1ook_secure_2026";
    const signature = request.headers.get("x-razorpay-signature");
    
    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }

    const payload = await request.text();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expectedSignature === signature) {
      const body = JSON.parse(payload);
      const event = body.event;
      console.log("[NEXT][WEBHOOK] Event:", event);
      
      return NextResponse.json({ success: true, status: "ok" });
    } else {
      console.warn("[NEXT][WEBHOOK] Signature Mismatch");
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[NEXT][WEBHOOK] Error:", err);
    return NextResponse.json({ success: false, error: "Internal webhook error" }, { status: 500 });
  }
}

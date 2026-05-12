import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Razorpay Initialization (LAZY)
  let razorpay: any = null;
  const getRazorpay = () => {
    if (!razorpay) {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!key_id || !key_secret) {
        throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Please set them in the Settings menu.");
      }
      
      razorpay = new Razorpay({
        key_id,
        key_secret,
      });
    }
    return razorpay;
  };

  app.use(express.json());

  // --- API Routes ---

  // Create Razorpay Order
  app.post("/api/create-order", async (req, res) => {
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

      console.log("[SERVER] Creating Razorpay Order:", options);
      const order = await client.orders.create(options);
      res.json({ ...order, success: true });
    } catch (error: any) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to create order",
        message: "Check server logs for details"
      });
    }
  });

  // Razorpay Webhook (Production verification)
  // Support both /api/webhook and /api/razorpay/webhook
  const handleWebhook = async (req: express.Request, res: express.Response) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "xonn_webh1ook_secure_2026";
      const signature = req.headers["x-razorpay-signature"] as string;
      
      if (!signature) {
        return res.status(400).json({ success: false, error: "Missing signature" });
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

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
  };

  app.post("/api/webhook", handleWebhook);
  app.post("/api/razorpay/webhook", handleWebhook);

  // Verify Razorpay Payment Signature
  app.post("/api/verify-payment", async (req, res) => {
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

      if (expectedSignature === razorpay_signature) {
        res.json({ success: true, verified: true });
      } else {
        res.status(400).json({ success: false, verified: false, error: "Invalid signature" });
      }
    } catch (error: any) {
      console.error("Verification Error:", error);
      res.status(500).json({ success: false, error: "Verification process failed" });
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin Auth (Simplified for this applet)
  app.post("/api/admin-login", (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true, token: "mock-admin-token" });
    } else {
      res.status(401).json({ success: false });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Initializing Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[SERVER] Vite middleware initialized successfully.");
    } catch (err) {
      console.error("[SERVER] Failed to initialize Vite middleware:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Running at http://localhost:${PORT}`);
  });
}

startServer();

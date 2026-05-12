import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";

// Import API handlers
import createOrderHandler from "./api/create-order.ts";
import verifyPaymentHandler from "./api/verify-payment.ts";
import webhookHandler from "./api/webhook.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes (Imported Handlers) ---
  app.post("/api/create-order", async (req, res) => {
    console.log("[SERVER] POST /api/create-order");
    await createOrderHandler(req, res);
  });
  
  app.post("/api/verify-payment", async (req, res) => {
    console.log("[SERVER] POST /api/verify-payment");
    await verifyPaymentHandler(req, res);
  });
  
  app.post("/api/webhook", async (req, res) => {
    console.log("[SERVER] POST /api/webhook");
    await webhookHandler(req, res);
  });
  
  app.post("/api/razorpay/webhook", async (req, res) => {
    console.log("[SERVER] POST /api/razorpay/webhook");
    await webhookHandler(req, res);
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

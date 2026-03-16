import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db/pool.js";
import instancesRouter from "./routes/instances.js";

// Prevent unhandled errors from crashing the process
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - handle preflight explicitly
app.options('*', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  });
  res.sendStatus(204);
});

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info');
  next();
});

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Auto-create tables on startup
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id VARCHAR(255) UNIQUE NOT NULL,
        instance_name VARCHAR(255) NOT NULL,
        token VARCHAR(512),
        connected BOOLEAN DEFAULT false,
        connected_phone VARCHAR(50),
        webhook_connected TEXT,
        webhook_disconnected TEXT,
        webhook_delivery TEXT,
        webhook_received TEXT,
        webhook_message_status TEXT,
        webhook_chat_presence TEXT,
        auto_read BOOLEAN DEFAULT false,
        reject_calls BOOLEAN DEFAULT false,
        call_message TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE instances ADD COLUMN IF NOT EXISTS reject_calls BOOLEAN DEFAULT false;
      ALTER TABLE instances ADD COLUMN IF NOT EXISTS call_message TEXT;
    `);
    console.log("✅ Database tables ready");
  } catch (err) {
    console.error("⚠️ DB init warning:", err.message);
  }
}
initDB();

// Health check (before other routes for fastest response)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/instances", instancesRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: true, message: "Rota não encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: true, message: "Erro interno do servidor" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 W-API Hub Backend running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => process.exit(0));
});

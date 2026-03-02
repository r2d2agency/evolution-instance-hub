import "dotenv/config";
import express from "express";
import cors from "cors";
import instancesRouter from "./routes/instances.js";

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

// Routes
app.use("/api/instances", instancesRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: true, message: "Rota não encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: true, message: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`🚀 W-API Hub Backend running on port ${PORT}`);
});

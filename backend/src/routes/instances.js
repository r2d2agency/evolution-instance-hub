import { Router } from "express";
import { wapi } from "../services/wapi.js";
import { instancesRepo } from "../repositories/instances.js";
import {
  createInstanceSchema,
  updateWebhooksSchema,
  renameSchema,
  autoReadSchema,
} from "../validators/instances.js";

const router = Router();

// ─── CREATE INSTANCE ─────────────────────────────────────────
// POST /api/instances
// Body: { instanceName, webhooks: { connected, disconnected, delivery, received, messageStatus, chatPresence }, rejectCalls, callMessage, metadata }
router.post("/", async (req, res) => {
  try {
    const parsed = createInstanceSchema.parse(req.body);

    // 1. Create instance on W-API
    const wapiRes = await wapi.createInstance(
      parsed.instanceName,
      parsed.rejectCalls,
      parsed.callMessage
    );

    if (wapiRes.error) {
      return res.status(400).json({ error: true, message: wapiRes.message || "Erro ao criar instância na W-API" });
    }

    const instanceId = wapiRes.instanceId;
    const token = wapiRes.token;

    // 2. Configure webhooks on W-API
    const webhookTypes = {
      connected: parsed.webhooks.connected,
      disconnected: parsed.webhooks.disconnected,
      delivery: parsed.webhooks.delivery,
      received: parsed.webhooks.received,
      "message-status": parsed.webhooks.messageStatus,
      "chat-presence": parsed.webhooks.chatPresence,
    };

    const webhookResults = {};
    for (const [type, url] of Object.entries(webhookTypes)) {
      if (url) {
        try {
          await wapi.updateWebhook(instanceId, type, url);
          webhookResults[type] = "ok";
        } catch (err) {
          webhookResults[type] = `error: ${err.message}`;
        }
      }
    }

    // 3. Save to database
    const saved = await instancesRepo.create({
      instance_id: instanceId,
      instance_name: parsed.instanceName,
      token,
      webhook_connected: parsed.webhooks.connected || null,
      webhook_disconnected: parsed.webhooks.disconnected || null,
      webhook_delivery: parsed.webhooks.delivery || null,
      webhook_received: parsed.webhooks.received || null,
      webhook_message_status: parsed.webhooks.messageStatus || null,
      webhook_chat_presence: parsed.webhooks.chatPresence || null,
      reject_calls: parsed.rejectCalls,
      call_message: parsed.callMessage,
      metadata: parsed.metadata,
    });

    res.status(201).json({
      error: false,
      message: "Instância criada com sucesso",
      instance: saved,
      webhookResults,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(422).json({ error: true, message: "Dados inválidos", details: err.errors });
    }
    console.error("POST /instances error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── LIST INSTANCES ──────────────────────────────────────────
// GET /api/instances
router.get("/", async (req, res) => {
  try {
    const instances = await instancesRepo.findAll();

    // Enrich with live status from W-API
    const enriched = await Promise.all(
      instances.map(async (inst) => {
        try {
          const status = await wapi.status(inst.instance_id);
          return { ...inst, connected: status.connected };
        } catch {
          return inst;
        }
      })
    );

    res.json({ error: false, instances: enriched });
  } catch (err) {
    console.error("GET /instances error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── GET INSTANCE DETAILS ────────────────────────────────────
// GET /api/instances/:id
router.get("/:id", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    // Enrich with W-API data
    let wapiData = {};
    try {
      wapiData = await wapi.fetchInstance(inst.instance_id);
    } catch {}

    let deviceData = {};
    try {
      if (wapiData.connected) {
        deviceData = await wapi.device(inst.instance_id);
      }
    } catch {}

    res.json({ error: false, instance: { ...inst, wapi: wapiData, device: deviceData } });
  } catch (err) {
    console.error("GET /instances/:id error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── DELETE INSTANCE ─────────────────────────────────────────
// DELETE /api/instances/:id
router.delete("/:id", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    // Delete from W-API
    try {
      await wapi.deleteInstance(inst.instance_id);
    } catch (err) {
      console.warn("W-API delete warning:", err.message);
    }

    // Delete from DB
    await instancesRepo.delete(req.params.id);

    res.json({ error: false, message: "Instância excluída" });
  } catch (err) {
    console.error("DELETE /instances/:id error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── QR CODE ─────────────────────────────────────────────────
// GET /api/instances/:id/qrcode
router.get("/:id/qrcode", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.qrCode(inst.instance_id);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /qrcode error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── DISCONNECT ──────────────────────────────────────────────
// POST /api/instances/:id/disconnect
router.post("/:id/disconnect", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.disconnect(inst.instance_id);
    await instancesRepo.update(req.params.id, { connected: false });
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("POST /disconnect error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── RESTART ─────────────────────────────────────────────────
// POST /api/instances/:id/restart
router.post("/:id/restart", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.restart(inst.instance_id);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("POST /restart error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── UPDATE WEBHOOKS ─────────────────────────────────────────
// PUT /api/instances/:id/webhooks
router.put("/:id/webhooks", async (req, res) => {
  try {
    const parsed = updateWebhooksSchema.parse(req.body);
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const webhookMap = {
      connected: { field: "webhook_connected", value: parsed.connected },
      disconnected: { field: "webhook_disconnected", value: parsed.disconnected },
      delivery: { field: "webhook_delivery", value: parsed.delivery },
      received: { field: "webhook_received", value: parsed.received },
      "message-status": { field: "webhook_message_status", value: parsed.messageStatus },
      "chat-presence": { field: "webhook_chat_presence", value: parsed.chatPresence },
    };

    const results = {};
    const dbUpdate = {};

    for (const [type, { field, value }] of Object.entries(webhookMap)) {
      if (value !== undefined) {
        try {
          await wapi.updateWebhook(inst.instance_id, type, value);
          results[type] = "ok";
          dbUpdate[field] = value;
        } catch (err) {
          results[type] = `error: ${err.message}`;
        }
      }
    }

    if (Object.keys(dbUpdate).length > 0) {
      await instancesRepo.update(req.params.id, dbUpdate);
    }

    res.json({ error: false, message: "Webhooks atualizados", results });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(422).json({ error: true, message: "Dados inválidos", details: err.errors });
    }
    console.error("PUT /webhooks error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── AUTO READ ───────────────────────────────────────────────
// PUT /api/instances/:id/auto-read
router.put("/:id/auto-read", async (req, res) => {
  try {
    const parsed = autoReadSchema.parse(req.body);
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    await wapi.autoRead(inst.instance_id, parsed.value);
    await instancesRepo.update(req.params.id, { auto_read: parsed.value });

    res.json({ error: false, message: parsed.value ? "Leitura automática ativada" : "Leitura automática desativada" });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(422).json({ error: true, message: "Dados inválidos", details: err.errors });
    }
    console.error("PUT /auto-read error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── RENAME ──────────────────────────────────────────────────
// PUT /api/instances/:id/rename
router.put("/:id/rename", async (req, res) => {
  try {
    const parsed = renameSchema.parse(req.body);
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    await wapi.rename(inst.instance_id, parsed.instanceName);
    await instancesRepo.update(req.params.id, { instance_name: parsed.instanceName });

    res.json({ error: false, message: "Instância renomeada" });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(422).json({ error: true, message: "Dados inválidos", details: err.errors });
    }
    console.error("PUT /rename error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── DEVICE INFO ─────────────────────────────────────────────
// GET /api/instances/:id/device
router.get("/:id/device", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.device(inst.instance_id);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /device error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── STATUS ──────────────────────────────────────────────────
// GET /api/instances/:id/status
router.get("/:id/status", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.status(inst.instance_id);
    
    // Sync status to DB
    await instancesRepo.update(req.params.id, { connected: data.connected });

    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /status error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── WEBHOOK LOGS ────────────────────────────────────────────
// GET /api/instances/:id/webhook-logs
router.get("/:id/webhook-logs", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const data = await wapi.fetchWebhookLogs(inst.instance_id, page, perPage);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /webhook-logs error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

export default router;

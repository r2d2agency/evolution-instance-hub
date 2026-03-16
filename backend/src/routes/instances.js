import { Router } from "express";
import { wapi } from "../services/wapi.js";
import { instancesRepo } from "../repositories/instances.js";
import {
  createInstanceSchema,
  updateWebhooksSchema,
  renameSchema,
  autoReadSchema,
  rejectCallsSchema,
} from "../validators/instances.js";

const router = Router();

// ─── CREATE INSTANCE ─────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const parsed = createInstanceSchema.parse(req.body);

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

    // Configure webhooks using instance token
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
          await wapi.updateWebhook(instanceId, type, url, token);
          webhookResults[type] = "ok";
        } catch (err) {
          webhookResults[type] = `error: ${err.message}`;
        }
      }
    }

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

    res.status(201).json({ error: false, message: "Instância criada com sucesso", instance: saved, webhookResults });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(422).json({ error: true, message: "Dados inválidos", details: err.errors });
    }
    console.error("POST /instances error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── SYNC FROM W-API ─────────────────────────────────────────
router.post("/sync", async (req, res) => {
  try {
    let page = 1;
    let allInstances = [];
    let hasMore = true;

    while (hasMore) {
      const data = await wapi.listInstances(page, 100);
      const instances = data.instances || data.data || [];
      allInstances = allInstances.concat(instances);
      hasMore = instances.length === 100;
      page++;
    }

    let imported = 0;
    let skipped = 0;

    for (const inst of allInstances) {
      const instanceId = inst.instanceId || inst.id;
      if (!instanceId) continue;

      const existing = await instancesRepo.findByInstanceId(instanceId);
      if (existing) {
        skipped++;
        continue;
      }

      await instancesRepo.create({
        instance_id: instanceId,
        instance_name: inst.instanceName || instanceId,
        token: inst.token || "",
        webhook_connected: inst.webhookConnectedUrl || null,
        webhook_disconnected: inst.webhookDisconnectedUrl || null,
        webhook_delivery: inst.webhookDeliveryUrl || null,
        webhook_received: inst.webhookReceivedUrl || null,
        webhook_message_status: inst.webhookStatusUrl || null,
        webhook_chat_presence: inst.webhookPresenceUrl || null,
        reject_calls: inst.rejectCalls || false,
        call_message: inst.callMessage || null,
        metadata: {},
      });
      imported++;
    }

    res.json({
      error: false,
      message: `Sincronização concluída: ${imported} importadas, ${skipped} já existentes`,
      total: allInstances.length,
      imported,
      skipped,
    });
  } catch (err) {
    console.error("POST /sync error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── LIST INSTANCES ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    let instances = [];
    try {
      instances = await instancesRepo.findAll();
    } catch (dbErr) {
      console.error("DB findAll error:", dbErr.message);
      return res.json({ error: false, instances: [] });
    }

    // Enrich with live status using instance token
    const enriched = await Promise.all(
      instances.map(async (inst) => {
        try {
          const status = await wapi.status(inst.instance_id, inst.token);
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
router.get("/:id", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    let wapiData = {};
    try {
      wapiData = await wapi.fetchInstance(inst.instance_id, inst.token);
    } catch {}

    let deviceData = {};
    try {
      if (wapiData.connected) {
        deviceData = await wapi.device(inst.instance_id, inst.token);
      }
    } catch {}

    res.json({ error: false, instance: { ...inst, wapi: wapiData, device: deviceData } });
  } catch (err) {
    console.error("GET /instances/:id error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── DELETE INSTANCE ─────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    try {
      await wapi.deleteInstance(inst.instance_id);
    } catch (err) {
      console.warn("W-API delete warning:", err.message);
    }

    await instancesRepo.delete(req.params.id);
    res.json({ error: false, message: "Instância excluída" });
  } catch (err) {
    console.error("DELETE /instances/:id error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── QR CODE ─────────────────────────────────────────────────
router.get("/:id/qrcode", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.qrCode(inst.instance_id, inst.token);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /qrcode error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── DISCONNECT ──────────────────────────────────────────────
router.post("/:id/disconnect", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.disconnect(inst.instance_id, inst.token);
    await instancesRepo.update(req.params.id, { connected: false });
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("POST /disconnect error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── RESTART ─────────────────────────────────────────────────
router.post("/:id/restart", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.restart(inst.instance_id, inst.token);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("POST /restart error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── UPDATE WEBHOOKS ─────────────────────────────────────────
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
          await wapi.updateWebhook(inst.instance_id, type, value, inst.token);
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
router.put("/:id/auto-read", async (req, res) => {
  try {
    const parsed = autoReadSchema.parse(req.body);
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    await wapi.autoRead(inst.instance_id, parsed.value, inst.token);
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
router.put("/:id/rename", async (req, res) => {
  try {
    const parsed = renameSchema.parse(req.body);
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    await wapi.rename(inst.instance_id, parsed.instanceName, inst.token);
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
router.get("/:id/device", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.device(inst.instance_id, inst.token);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /device error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── STATUS ──────────────────────────────────────────────────
router.get("/:id/status", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const data = await wapi.status(inst.instance_id, inst.token);
    await instancesRepo.update(req.params.id, { connected: data.connected });

    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /status error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

// ─── WEBHOOK LOGS ────────────────────────────────────────────
router.get("/:id/webhook-logs", async (req, res) => {
  try {
    const inst = await instancesRepo.findById(req.params.id);
    if (!inst) return res.status(404).json({ error: true, message: "Instância não encontrada" });

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const data = await wapi.fetchWebhookLogs(inst.instance_id, inst.token, page, perPage);
    res.json({ error: false, ...data });
  } catch (err) {
    console.error("GET /webhook-logs error:", err.message);
    res.status(500).json({ error: true, message: err.message });
  }
});

export default router;
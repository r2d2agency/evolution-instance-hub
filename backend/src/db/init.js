import "dotenv/config";
import pool from "./pool.js";

const sql = `
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

CREATE INDEX IF NOT EXISTS idx_instances_instance_id ON instances(instance_id);
CREATE INDEX IF NOT EXISTS idx_instances_instance_name ON instances(instance_name);
`;

async function init() {
  try {
    await pool.query(sql);
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
  } finally {
    await pool.end();
  }
}

init();

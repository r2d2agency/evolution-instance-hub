import pool from "../db/pool.js";

export const instancesRepo = {
  async create(data) {
    const res = await pool.query(
      `INSERT INTO instances (instance_id, instance_name, token, webhook_connected, webhook_disconnected, webhook_delivery, webhook_received, webhook_message_status, webhook_chat_presence, reject_calls, call_message, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.instance_id,
        data.instance_name,
        data.token,
        data.webhook_connected || null,
        data.webhook_disconnected || null,
        data.webhook_delivery || null,
        data.webhook_received || null,
        data.webhook_message_status || null,
        data.webhook_chat_presence || null,
        data.reject_calls || false,
        data.call_message || null,
        JSON.stringify(data.metadata || {}),
      ]
    );
    return res.rows[0];
  },

  async findAll() {
    const res = await pool.query("SELECT * FROM instances ORDER BY created_at DESC");
    return res.rows;
  },

  async findById(id) {
    const res = await pool.query("SELECT * FROM instances WHERE id = $1", [id]);
    return res.rows[0] || null;
  },

  async findByInstanceId(instanceId) {
    const res = await pool.query("SELECT * FROM instances WHERE instance_id = $1", [instanceId]);
    return res.rows[0] || null;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const res = await pool.query(
      `UPDATE instances SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async delete(id) {
    const res = await pool.query("DELETE FROM instances WHERE id = $1 RETURNING *", [id]);
    return res.rows[0] || null;
  },
};

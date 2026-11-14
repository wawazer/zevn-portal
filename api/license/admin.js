import { corsHeaders, generateKey, getRedis } from "../_lib.js";

function checkAdmin(req) {
  const secret = req.headers["x-admin-secret"];
  return secret === process.env.ADMIN_SECRET;
}

export default async function handler(req, res) {
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (!checkAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const redis = getRedis();

    // GET — list all licenses
    if (req.method === "GET") {
      const keys = await redis.keys("license:*");
      if (!keys || keys.length === 0) {
        return res.status(200).json([]);
      }

      const results = await redis.mget(...keys);
      const licenses = (results || [])
        .map((r) => {
          if (typeof r === "string") {
            try {
              return JSON.parse(r);
            } catch {
              return null;
            }
          }
          return r;
        })
        .filter((r) => r && typeof r === "object")
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

      return res.status(200).json(licenses);
    }

    // POST — mutations
    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {}
      }
      const { action, key: licenseKey, owner, app } = body || {};

      if (action === "create") {
        if (!owner) return res.status(400).json({ error: "Owner is required" });
        const newKey = generateKey();
        const now = new Date().toISOString();
        const record = {
          key: newKey,
          owner,
          app: app || "scrape-ticket",
          status: "active",
          deviceId: null,
          hostname: null,
          createdAt: now,
          activatedAt: null,
          lastSeen: null,
        };
        await redis.set(`license:${newKey}`, record);
        return res.status(201).json(record);
      }

      if (!licenseKey) return res.status(400).json({ error: "key is required" });
      let stored = await redis.get(`license:${licenseKey}`);
      if (typeof stored === "string") {
        try {
          stored = JSON.parse(stored);
        } catch {}
      }
      if (!stored || typeof stored !== "object") {
        return res.status(404).json({ error: "License not found" });
      }

      if (action === "toggle_status") {
        stored.status = stored.status === "active" ? "revoked" : "active";
        await redis.set(`license:${licenseKey}`, stored);
        return res.status(200).json(stored);
      }

      if (action === "reset_device") {
        stored.deviceId = null;
        stored.hostname = null;
        stored.activatedAt = null;
        await redis.set(`license:${licenseKey}`, stored);
        return res.status(200).json(stored);
      }

      if (action === "delete") {
        await redis.del(`license:${licenseKey}`);
        return res.status(200).json({ deleted: true });
      }

      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

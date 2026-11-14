import { corsHeaders, generateKey, getRedis } from "../_lib.js";

function checkAdmin(req) {
  const secret = req.headers["x-admin-secret"];
  return secret === process.env.ADMIN_SECRET;
}

export default async function handler(req, res) {
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (!checkAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const redis = getRedis();

  // GET — list all licenses
  if (req.method === "GET") {
    const keys = [];
    let cursor = 0;
    do {
      const [nextCursor, batch] = await redis.scan(cursor, { match: "license:*", count: 100 });
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== 0);

    if (keys.length === 0) return res.status(200).json([]);

    const pipeline = redis.pipeline();
    for (const k of keys) pipeline.get(k);
    const results = await pipeline.exec();

    const licenses = results
      .filter((r) => r && typeof r === "object")
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return res.status(200).json(licenses);
  }

  // POST — mutations
  if (req.method === "POST") {
    const { action, key: licenseKey, owner, app } = req.body || {};

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
    const stored = await redis.get(`license:${licenseKey}`);
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
}

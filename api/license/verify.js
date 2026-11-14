import { corsHeaders, getRedis } from "../_lib.js";

export default async function handler(req, res) {
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { licenseKey, deviceId, hostname, app } = req.body || {};

  if (!licenseKey || !deviceId || !hostname) {
    return res.status(400).json({ valid: false, reason: "MISSING_FIELDS", message: "licenseKey, deviceId, dan hostname wajib diisi." });
  }

  const key = String(licenseKey).trim().toUpperCase();
  const redis = getRedis();
  const stored = await redis.get(`license:${key}`);

  if (!stored || typeof stored !== "object") {
    return res.status(403).json({ valid: false, reason: "INVALID_OR_REVOKED", message: "License key tidak valid atau telah dicabut." });
  }

  if (stored.status !== "active") {
    return res.status(403).json({ valid: false, reason: "INVALID_OR_REVOKED", message: "License key tidak valid atau telah dicabut." });
  }

  // App mismatch check
  if (stored.app && app && stored.app !== app) {
    return res.status(403).json({ valid: false, reason: "APP_MISMATCH", message: `Lisensi ini hanya berlaku untuk app "${stored.app}".` });
  }

  const now = new Date().toISOString();

  // Device binding logic
  if (!stored.deviceId) {
    // First-time bind
    stored.deviceId = deviceId;
    stored.hostname = hostname;
    stored.activatedAt = now;
    stored.lastSeen = now;
    await redis.set(`license:${key}`, stored);
  } else if (stored.deviceId !== deviceId) {
    return res.status(403).json({
      valid: false,
      reason: "DEVICE_MISMATCH",
      message: `Lisensi sudah terikat pada perangkat lain (${stored.hostname}).`,
    });
  } else {
    // Same device — update lastSeen
    stored.lastSeen = now;
    await redis.set(`license:${key}`, stored);
  }

  return res.status(200).json({
    valid: true,
    owner: stored.owner,
    app: stored.app,
    hostname: stored.hostname,
  });
}

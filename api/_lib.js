import { Redis } from "@upstash/redis";

export function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Characters excluding ambiguous 0/O and 1/I
const SAFE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomBlock(len) {
  let block = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) {
    block += SAFE_CHARS[arr[i] % SAFE_CHARS.length];
  }
  return block;
}

export function generateKey() {
  return `ZEVN-${randomBlock(4)}-${randomBlock(4)}`;
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-secret",
  };
}

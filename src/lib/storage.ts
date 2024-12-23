import { Redis } from "@upstash/redis";

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

const redis =
  globalThis.redis ||
  new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.redis = redis;
}

export { redis };

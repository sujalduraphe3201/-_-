import { Redis } from "ioredis";

export function createRedisConnection(): Redis {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
  });

  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("error", (err) => console.error("❌ Redis error:", err));

  return redis;
}
// connection with redis is done in this file 

import { NextFunction, Request, Response } from "express";
import {Redis} from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

const window = 60;
const MaxRequest = 100;

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ip = req.ip;
    const key = `rate-limiter:${ip}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, window);
    }
    if (current > MaxRequest) {
      res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
      return;
    }
    next();
  } catch (err) {
    console.error("Rate Limiter Error:", err);
    next();
  }
}
// this file is used to limit the number of requests a user can make to the server within a specified time window. 
// It uses Redis to track the number of requests from each IP address. If the number of requests exceeds the defined limit,
//  it responds with a 429 status code, indicating too many requests.
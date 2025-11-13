import { createRedisConnection } from "./connection.js";
import { Queue } from "bullmq";
const connection = createRedisConnection();

export const flowQueue = new Queue("flowQueue", { connection });

export async function addJob(type: string, payload: any, opts = {}) {
  const job = await flowQueue.add(type, payload, {
    removeOnComplete: 1000,
    removeOnFail: 1000,
    ...opts,
  });
  console.log(`Job queued ${job.name} (ID ${job.id})`);
  return job;
}

// this file job is to add jobs in queue then the later will be processed by worker file.

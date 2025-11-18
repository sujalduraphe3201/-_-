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
export async function findJob(jobId: string) {
  const job = await flowQueue.getJob(jobId);
  if (!job) {
    console.log(`job not found with id ${jobId}`);
    return null;
  }
  return job;
}
export async function getAllJobs() {
  const jobs = await flowQueue.getJobs(
    ["waiting", "active", "completed", "failed", "delayed"],
    0,
    1000
  );
  if (!jobs) {
    console.log(`Error while fetching jobs`);
    return;
  }
  return jobs || [];
}

export async function updateJob(jobId: string, payload: any) {
  const job = await flowQueue.getJob(jobId);
  if (!job) {
    console.log(`job not found with id ${jobId}`);
    return;
  }
}

export async function deleteJob(jobId: string) {
  const job = await flowQueue.getJob(jobId);
  if (!job) {
    console.log(`job not found with id ${jobId}`);
    return;
  }
  const deleteJob = await job.remove();
  console.log(`Job deleted`);
}

// this file job is to add jobs in queue then the later will be processed by worker file.

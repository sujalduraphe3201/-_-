import { Job, Worker } from "bullmq";
import { createRedisConnection } from "./connection.js";

const connection = createRedisConnection();

const worker = new Worker(
  "flowQueue",
  async (job: Job) => {
    console.log(`👷 Processing job ${job.id}: ${job.name}`, job.data);

    switch (job.name) {
      case "send-email":
        console.log(`📧 Email sent to ${job.data.to}`);
        break;
      case "webhook":
        console.log(`📧 Email sent to ${job.data.to}`);
        break;

      case "generate-report":
        console.log(`📧 Email sent to ${job.data.to}`);
        break;
      default:
        console.log(` Unknown job type: ${job.name}`);
    }
    return { ok: true };
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  }
);
worker.on("completed", (job, err) => {
  console.log(`Job completed ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed ${err.message}`);
});
worker.on("error", (err) => {
  console.log(`worker error `, err);
});

async function shutdown() {
  console.log("Shutting down worker...");
  worker.close();
  connection.disconnect();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
console.log(" Worker started and waiting for jobs...");

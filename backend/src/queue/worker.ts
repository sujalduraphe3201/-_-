import { Job, Worker } from "bullmq";
import { createRedisConnection } from "./connection.js";
import nodemailer from "nodemailer";

const connection = createRedisConnection();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.HOST) {
  console.warn("Email transport config incomplete. Email jobs may fail.");
}

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const worker = new Worker(
  "flowQueue",
  async (job: Job) => {
    console.log(`👷 Processing job ${job.id}: ${job.name}`, job.data);

    switch (job.name) {
      case "send-email": {
        const { to, subject, message } = job.data;
        if (!to || !subject || !message) {
          throw new Error("Missing email parameters");
        }
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject,
          text: message,
        });
        console.log(`📧 Email sent: ${info.messageId}`);
        return { status: "sent", messageId: info.messageId };
      }

      case "webhook":
        console.log("🔗 Webhook job received - implement actual handler");
        return { status: "pending-implementation" };

      case "generate-report":
        console.log("📊 Report job received - implement actual logic");
        return { status: "pending-implementation" };

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  }
);

worker.on("completed", (job, result) => {
  console.log(`✔ Job completed ${job.id}`, result);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

worker.on("error", (err) => {
  console.error(`🔥 Worker error`, err);
});

async function shutdown() {
  console.log("Shutting down worker...");
  await worker.close();
  connection.disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Worker started and waiting for jobs...");

import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { flowQueue } from "./producer.js";
import { createBullBoard } from "@bull-board/api";

const serverAdapter = new ExpressAdapter();

export function mountBullBoard(app: any) {
  serverAdapter.setBasePath("/admin/queues");
  const queues = [new BullMQAdapter(flowQueue)];
  createBullBoard({
    queues,
    serverAdapter,
  });
  app.use("/admin/queues", serverAdapter.getRouter());
}

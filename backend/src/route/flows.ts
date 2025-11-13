import { Router } from "express";
import { authMiddleware } from "../middleware/middleware.js";
import { addJob,  } from "../queue/producer.js";

const router = Router();
router.post("/job", authMiddleware, async (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type || !payload) {
      res.status(400).json({ error: "Missing type or payload" });
      return;
    }
    const allowed = ["send-email", "generate-report", "webhook"];
    if (!allowed.includes(type)) {
      res.status(400).json({ error: "Invalid job type" });
      return;
    }
    const job = await addJob(type, payload, {
      attempt: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
    res.status(200).json({ message: "Job queued", jobId: job.id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;

import { Router } from "express";
import { authMiddleware } from "../middleware/middleware.js";
import {
  addJob,
  deleteJob,
  findJob,
  getAllJobs,
  updateJob,
} from "../queue/producer.js";

const router = Router();

router.get("/jobs", authMiddleware, async (req, res) => {
  try {
    const jobs = await getAllJobs();

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/job/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Job ID is required" });
      return;
    }

    const job = await findJob(id);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const state = await job.getState(); // waiting, active, completed, failed
    const returnValue = await job.returnvalue;
    const failedReason = job.failedReason;

    res.json({
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      attemptsMade: job.attemptsMade,
      finishedOn: job.finishedOn,
      timestamp: job.timestamp,
      returnValue,
      failedReason,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// CREATE JOB ----------------------------------------------------
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
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });

    res.status(200).json({ message: "Job queued", jobId: job.id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE JOB ----------------------------------------------------
router.put("/job/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { payload } = req.body;

    if (!id) {
      res.status(400).json({ message: "job id is required" });
      return;
    }

    const existing = await findJob(id);
    if (!existing) {
      res.status(404).json({ message: "job not found" });
      return;
    }

    await updateJob(id, payload);

    res.json({ message: "Job updated", id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE JOB ----------------------------------------------------
router.delete("/job/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await findJob(id);
    if (!existing) {
      res.status(404).json({ message: "job not found" });
      return;
    }

    await deleteJob(id);

    res.json({ message: "Job deleted", id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

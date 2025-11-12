import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cors from "cors";
import authRoutes from "./route/userRoutes.js";
import flowRoute from "./route/flows.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (_req, res) => {
  res.send("Main route is healthy ✅");
});

app.use("/api/auth", authRoutes);
app.use("/api/flows", flowRoute);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` Server is listening on port ${PORT}`);
});

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import analysesRouter from "./routes/analyses.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "AI News and Misinformation Analyzer" });
});

app.use("/api/analyses", analysesRouter);

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found." });
  }
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  const response = { error: "An internal server error occurred." };
  if (process.env.NODE_ENV !== "production") {
    response.details = err.message || String(err);
  }
  res.status(500).json(response);
});

app.listen(port, () => {
  console.log(`AI News and Misinformation Analyzer running at http://localhost:${port}`);
});

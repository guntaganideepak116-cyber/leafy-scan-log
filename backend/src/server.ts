import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { initFirebase } from "./services/firebase.service.js";
import { analyzePlantImage } from "./controllers/plant.controller.js";

dotenv.config();

// Initialize Firebase Admin (optional Firestore connection)
initFirebase();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Enable Cross-Origin Resource Sharing for the PWA frontend
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

// Configure Multer for in-memory image streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB max file size
    files: 1,
  },
});

// Root welcome route
app.get("/", (_req, res) => {
  res.json({
    name: "Smart Plant AI API",
    version: "1.0.0",
    description: "Real-time AI plant disease detection service powered by Pl@ntNet",
    endpoints: {
      health: "GET /api/health",
      analyze: "POST /api/plant/analyze (multipart/form-data with 'image' field)",
    },
  });
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const hasPlantNetKey = Boolean(
    process.env.PLANTNET_API_KEY &&
      process.env.PLANTNET_API_KEY.trim() !== "" &&
      process.env.PLANTNET_API_KEY !== "your_plantnet_api_key_here"
  );

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    aiProvider: "Pl@ntNet",
    hasApiKeyConfigured: hasPlantNetKey,
    uptimeSeconds: process.uptime(),
  });
});

// Primary plant analysis endpoint expected by frontend
app.post("/api/plant/analyze", upload.single("image"), analyzePlantImage);

// Multer error handling and 404 middleware
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        message: "Image file is too large. Maximum allowed size is 15 MB.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
    return;
  }

  console.error("Unhandled server exception:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error occurred.",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(`🌱 SMART PLANT AI BACKEND SERVICE STARTED`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

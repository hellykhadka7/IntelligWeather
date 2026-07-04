require("dotenv").config();
const mongoose = require("mongoose");
// Disable buffering globally — DB operations fail immediately when not connected
mongoose.set("bufferCommands", false);

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

// Routes
const weatherRoutes  = require("./src/routes/weather.routes");
const aqiRoutes      = require("./src/routes/aqi.routes");
const searchRoutes   = require("./src/routes/search.routes");
const mlRoutes       = require("./src/routes/ml.routes");
const historyRoutes  = require("./src/routes/history.routes");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting — 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please slow down." },
});
app.use("/api", limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/weather",  weatherRoutes);
app.use("/api/aqi",      aqiRoutes);
app.use("/api/search",   searchRoutes);
app.use("/api/ml",       mlRoutes);
app.use("/api/history",  historyRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Weather Intelligence API", version: "1.0.0" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Error handler (must be last)
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Weather Intelligence API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
});

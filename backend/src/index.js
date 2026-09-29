const express = require("express");
const cors = require("cors");
require("dotenv").config();

const analyzeRoutes = require("./routes/analyzeRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const testMediaRoutes = require("./routes/testMediaRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    });
}

console.log("Allowed frontend origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Browser ke baghair requests allow
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: false,

    optionsSuccessStatus: 204,
  })
);

// Explicit preflight handling
// app.options("*", cors());

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Downora backend is running",
  });
});

app.use("/api/analyze", analyzeRoutes);

app.use("/api/download", downloadRoutes);

app.use("/api/test-media", testMediaRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked this origin.",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Downora backend running on http://localhost:${PORT}`
  );
});
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const roomRoutes = require("./routes/roomRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const campusRoutes = require("./routes/campusRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/campus", campusRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "College Hall Ticket Seating API is running",
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend in production if built
const frontendDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

// SPA and 404 fallback handler (No route path string, prevents path-to-regexp PathError)
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    });
  }
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      res.send("CampusOne College Hall Ticket API is running. Frontend dev server on port 5173.");
    }
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/college_hall_ticket";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });
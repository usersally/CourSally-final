// simple-server.js - Minimal working server
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

console.log("🚀 Starting SIMPLE server...");
console.log("📌 PORT:", PORT);
console.log("📌 Node version:", process.version);

// Enable CORS for all
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Simple routes that always work
app.get("/", (req, res) => {
  res.json({
    status: "✅ Simple server is running!",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post("/auth/login", (req, res) => {
  console.log("📝 Login attempt:", req.body.email || "no email");
  res.json({
    success: true,
    message: "Login successful (simple server)",
    data: {
      token: "simple-token-" + Date.now(),
      user: {
        _id: "simple-id",
        email: req.body.email || "test@test.com",
        role: "student",
        firstName: "Simple",
        lastName: "User",
      },
    },
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`✅ Test: curl http://localhost:${PORT}/health`);
});

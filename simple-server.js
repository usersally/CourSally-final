// simple-server.js - COMPLETE WORKING VERSION
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

console.log("🚀 Starting SIMPLE server...");
console.log("📌 PORT:", PORT);
console.log("📌 Node version:", process.version);

// Enable CORS for ALL origins (for testing)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins for testing
      console.log("📍 Request from origin:", origin);
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  }),
);

// Handle preflight requests explicitly
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

// ============= ROUTES =============

// Root route
app.get("/", (req, res) => {
  console.log("✅ Root endpoint called");
  res.json({
    success: true,
    message: "🚀 Server is running on Railway!",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Health check route
app.get("/health", (req, res) => {
  console.log("✅ Health check called");
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Login route
app.post("/auth/login", (req, res) => {
  console.log("📝 Login attempt:", req.body.email || "no email");
  res.json({
    success: true,
    message: "Login successful!",
    data: {
      token: "railway-token-" + Date.now(),
      user: {
        _id: "railway-id",
        email: req.body.email || "test@test.com",
        role: "student",
        firstName: "Test",
        lastName: "User",
      },
    },
  });
});

// Register route
app.post("/auth/register", (req, res) => {
  console.log("📝 Register attempt:", req.body.email || "no email");
  res.json({
    success: true,
    message: "Registration successful!",
    data: {
      token: "railway-token-" + Date.now(),
      user: {
        _id: "railway-id-" + Date.now(),
        email: req.body.email || "test@test.com",
        role: "student",
        firstName: req.body.firstName || "Test",
        lastName: req.body.lastName || "User",
      },
    },
  });
});

// Catch-all route for debugging
app.all("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.path);
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    method: req.method,
    availableRoutes: [
      { method: "GET", path: "/" },
      { method: "GET", path: "/health" },
      { method: "POST", path: "/auth/login" },
      { method: "POST", path: "/auth/register" },
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`✅ Login: http://localhost:${PORT}/auth/login`);
  console.log("=".repeat(50));
});

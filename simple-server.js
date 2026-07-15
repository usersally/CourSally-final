// Enable CORS with specific origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all Vercel deployments
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://front-sable-eight.vercel.app",
        "https://front-19a6xaymm-usersallys-projects.vercel.app",
        "https://front-4m8hw94x9-usersallys-projects.vercel.app",
        /\.vercel\.app$/,
      ];

      console.log("📍 Origin:", origin);

      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is allowed
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === "string") {
          return origin === allowed;
        }
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        console.log("✅ CORS allowed for:", origin);
        callback(null, true);
      } else {
        console.log("❌ CORS blocked for:", origin);
        callback(new Error("Not allowed by CORS"));
      }
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

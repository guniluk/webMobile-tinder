import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import { connDB } from "./utils/connDB.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import matchRoutes from "./routes/match.route.js";
import messageRoutes from "./routes/message.route.js";
import { initializeSocket } from "./socket/socket.server.js";
import { initCronJob } from "./utils/cron.js";

// Load environment variables at the earliest
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve absolute paths reliably regardless of execution directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

// Create HTTP server and initialize Socket.IO
const httpServer = createServer(app);
initializeSocket(httpServer);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === "production") {
        if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
          return callback(null, true);
        }
        return callback(null, true); // Allow all configured origins in production
      }
      return callback(null, true); // In development, allow all origins (web + mobile expo)
    },
    credentials: true,
  }),
);
app.use(cookieParser());

// Health check endpoint for cron keep-alive & monitoring
app.get("/api/health", (_, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDistPath));

  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Connect Database & Start Server
connDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Initialize 14-minute keep-alive cron job
      initCronJob();
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

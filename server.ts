import 'dotenv/config';
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./server/app";
import { verifyMongoConnection } from "./server/db/mongo";

async function startServer() {
  const PORT = 3000;

  try {
    await verifyMongoConnection();
    console.log('[TrustGov] MongoDB connection verified.');
  } catch (error) {
    console.error('[TrustGov] MongoDB connection failed. Check MONGO_URI and MONGO_DB_NAME.');
    console.error(error);
    process.exit(1);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TrustGov] Server running on http://localhost:${PORT}`);
    console.log(`[TrustGov] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

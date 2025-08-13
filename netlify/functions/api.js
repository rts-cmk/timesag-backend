import express from "express";
import serverless from "serverless-http";
import router from "../../src/router.js";
import cors from "cors";

// Ensure environment variables are available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set');
}

const app = express();

// Configure middleware with explicit options for serverless
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(router);

export const handler = serverless(app, {
  binary: false
});
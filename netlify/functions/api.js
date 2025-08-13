import { Router } from "express";
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

// Raw body parser for debugging
app.use((req, res, next) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    console.log('Raw body received:', body);
    if (body && req.headers['content-type']?.includes('application/json')) {
      try {
        req.body = JSON.parse(body);
        console.log('Parsed body:', req.body);
      } catch (e) {
        console.error('JSON parse error:', e);
        req.body = {};
      }
    }
    next();
  });
});

app.use(cors());

// Add debugging middleware
app.use((req, res, next) => {
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Request headers:', req.headers);
  console.log('Final request body:', req.body);
  console.log('Body type:', typeof req.body);
  next();
});

app.use(router);

export const handler = serverless(app);
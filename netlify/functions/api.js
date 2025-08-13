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
app.use(cors());

// Custom body parser for Netlify Functions
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // For Netlify Functions, the body might be in req.body already
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        console.error('Failed to parse JSON body:', e);
      }
    }
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add debugging middleware
app.use((req, res, next) => {
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Body type:', typeof req.body);
  next();
});

app.use(router);

export const handler = serverless(app);
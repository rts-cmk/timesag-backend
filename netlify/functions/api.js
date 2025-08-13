import express from "express";
import serverless from "serverless-http";
import router from "../../src/router.js";
import cors from "cors";

const app = express();
app.use(express.json())
app.use(cors())
app.use(router)

export const handler = serverless(app);
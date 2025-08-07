import { Router } from "express";
import costumersRoutes from "./routes/costumers.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";




const router = Router();

usersRoutes(router);
costumersRoutes(router);
authRoutes(router);







export default router;

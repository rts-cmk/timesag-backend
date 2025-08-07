import { Router } from "express";
import usersRoutes from "./routes/users.routes";
import costumersRoutes from "./routes/costumers.routes";
import authRoutes from "./routes/auth.routes";





const router = Router();

usersRoutes(router);
costumersRoutes(router);
authRoutes(router);







export default router;

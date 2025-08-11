import { Router } from "express";
import costumersRoutes from "./routes/costumers.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import timeentriesRoutes from "./routes/timeentries.routes.js";




const router = Router();

usersRoutes(router);
costumersRoutes(router);
authRoutes(router);
projectsRoutes(router);
tasksRoutes(router);
timeentriesRoutes(router);







export default router;

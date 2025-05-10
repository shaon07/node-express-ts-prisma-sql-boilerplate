import { Router } from "express";
import { container } from "../../config/di-container";
import { TYPES } from "../../config/types";
import { UserController } from "../controllers/UserController";
import { userRoutes } from "./user.routes";

const router = Router();

const userController = container.get<UserController>(TYPES.UserController);

// API versioning prefix
const apiVersion = "/api/v1";

router.use(`${apiVersion}/users`, userRoutes(userController));

export default router;

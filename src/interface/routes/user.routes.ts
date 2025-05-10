import { Router } from "express";
import { UserController } from "../controllers/UserController";

export function userRoutes(userController: UserController) {
  const router = Router();

  router.post("/", userController.createUser);
  router.post("/login", userController.login);
  router.get("/:id", userController.getUser);
  router.put("/:id", userController.updateUser);
  router.delete("/:id", userController.deleteUser);

  return router;
}

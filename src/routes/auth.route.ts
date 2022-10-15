import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/requestValidation";

const auth = Router();

auth.post("/register", validateRequest.registration, authController.register);

auth.post("/login", validateRequest.login, authController.login);

auth.post("/token/refresh", validateRequest.refreshToken, authController.refreshToken);

export default auth;

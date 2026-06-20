import { Router } from "express";
import { validateBodySchema } from "../middlewares/validations.js";
import { checkUser, login, register } from "../handlers/auth.js";

import { CheckAuth } from "../middlewares/auth.js";
import { loginSchema, registerSchema } from "../validation/user.js";

const router = Router();

router.post("/login", validateBodySchema(loginSchema), login);

router.post("/register", validateBodySchema(registerSchema), register);

router.get("/check", CheckAuth, checkUser);

export default router;

import { Router } from "express";

import UserController from "./user.controller.js";
import asyncHandler from "../../shared/utils/async-handler.js";
import validationMiddleware from "../../shared/middlewares/validation.middleware.js";
import { registerValidation, loginValidation } from "./user.validation.js";

const userRouter = Router();

userRouter.post(
  "/signup",
  registerValidation,
  validationMiddleware,
  asyncHandler(UserController.register),
);

userRouter.post(
  "/signin",
  loginValidation,
  validationMiddleware,
  asyncHandler(UserController.login),
);

export default userRouter;

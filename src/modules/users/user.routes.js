import { Router } from "express";

import UserController from "./user.controller.js";
import asyncHandler from "../../shared/utils/async-handler.js";

const userRouter = Router();

userRouter.post(
    "/signup",
    asyncHandler(UserController.register)
);

userRouter.post(
    "/signin",
    asyncHandler(UserController.login)
);

export default userRouter;
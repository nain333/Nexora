import { Router } from "express";

import LikeController from "./like.controller.js";
import authMiddleware from "../../shared/middlewares/auth.middleware.js";
import validationMiddleware from "../../shared/middlewares/validation.middleware.js";
import { postIdValidation } from "./like.validation.js";

const likeRouter = Router();

likeRouter.use(authMiddleware);

likeRouter.get(
    "/toggle/:postId",
    postIdValidation,
    validationMiddleware,
    LikeController.toggleLike
);

likeRouter.get(
    "/:postId",
    postIdValidation,
    validationMiddleware,
    LikeController.getLikes
);

export default likeRouter;
import express from "express";
import userRouter from "./modules/users/user.routes.js";
import postRouter from "./modules/posts/post.routes.js";
import commentRouter from "./modules/comments/comment.route.js";
import notFoundHandler from "./shared/middlewares/not-found.middleware.js";
import errorHandler from "./shared/middlewares/error.middleware.js";
import loggerMiddleware from "./shared/middlewares/logger.middleware.js";

const app = express();
// bootstrap route
app.use(express.json());
app.get("/", (req, res) =>
  res.json({
    status: "ok",
    message: "welcome to Nexora",
  }),
);
// User routes are intentionally excluded from request logging
app.use("/api", userRouter);
// log subsequent logging  routes

app.use(loggerMiddleware);
app.use("/api/posts",postRouter)
app.use("/api/comments",commentRouter)
app.use(notFoundHandler);
app.use(errorHandler);
export default app;

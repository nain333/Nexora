import express from "express";
import userRouter from "./modules/users/user.routes.js";

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
app.use("/api/users", userRouter);
// log subsequent logging  routes

app.use(loggerMiddleware);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;

import pinoHttp from "pino-http";

import logger from "../logger/logger.js";

const loggerMiddleware = pinoHttp({
  logger,

  customProps(req) {
    return {
      requestUrl: req.originalUrl,
      requestBody: req.body,
    };
  },
});

export default loggerMiddleware;

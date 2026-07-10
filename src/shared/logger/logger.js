import pino from "pino";

import envConfig from "../../config/env.config.js";

const transport = pino.transport({
  targets: [
    {
      target: "pino/file",
      level: envConfig.logLevel,
      options: {
        destination: 1,
      },
    },
    {
      target: "pino/file",
      level: envConfig.logLevel,
      options: {
        destination: "./logs/app.log",
        mkdir: true,
      },
    },
  ],
});

const logger = pino(
  {
    level: envConfig.logLevel,
  },
  transport,
);

export default logger;

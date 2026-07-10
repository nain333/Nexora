import "dotenv/config";

const envConfig = {
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || "info",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
};

export default Object.freeze(envConfig);

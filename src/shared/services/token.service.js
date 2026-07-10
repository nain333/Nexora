import jwt from "jsonwebtoken";

import envConfig from "../../config/env.config.js";

export default class TokenService {
  static generateAccessToken(payload) {
    return jwt.sign(payload, envConfig.jwtSecret, {
      expiresIn: envConfig.jwtExpiresIn,
      algorithm: "HS256",
    });
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, envConfig.jwtSecret, {
      algorithms: ["HS256"],
    });
  }
}

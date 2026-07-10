import UnauthorizedError from "../errors/unauthorized-error.js";
import TokenService from "../services/token.service.js";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Authentication token is required");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Invalid authorization header");
  }

  try {
    const payload = TokenService.verifyAccessToken(token);

    req.user = payload;

    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired authentication token");
  }
}

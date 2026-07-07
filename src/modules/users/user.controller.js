import bcrypt from "bcrypt";

import UserModel from "./user.model.js";
import ConflictError from "../../shared/errors/conflict-error.js";
import UnauthorizedError from "../../shared/errors/unauthorized-error.js";
import TokenService from "../../shared/services/token.service.js";

export default class UserController {
  static async register(req, res) {
    const { name, email, password } = req.body;

    const existingUser = UserModel.getUserByEmail(email);

    if (existingUser) {
      throw new ConflictError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = UserModel.addUser(name, email, hashedPassword);

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;

    const user = UserModel.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
    });

    return res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        accessToken,
      },
    });
  }
}

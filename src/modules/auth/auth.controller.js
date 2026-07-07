import bcrypt from "bcrypt";
import UserModel from "../users/user.model.js";

export default class AuthController {
    static async signUp(req, res) {
        const { name, email, password } = req.body;

        const existingUser = UserModel.getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = UserModel.addUser(name, email, hashedPassword);

        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
}
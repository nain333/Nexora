import { randomUUID } from "node:crypto";

const users = [];

export default class UserModel {
    constructor(name, email, password) {
        this.id = randomUUID();
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
    }

    static addUser(name, email, password) {
        const user = new UserModel(name, email, password);
        users.push(user);
        return user;
    }

    static getAllUsers() {
        return users;
    }

    static getUserById(userId) {
        return users.find((user) => user.id === userId);
    }

    static getUserByEmail(email) {
        return users.find((user) => user.email === email);
    }

   
}
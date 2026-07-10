import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../app.js";

describe("Users/Auth API", () => {
  const uniqueEmail = `user-${Date.now()}@test.com`;
  const password = "Password123";

  describe("POST /api/signup", () => {
    it("USER-01 should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Automated Test User",
          email: uniqueEmail,
          password,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "User registered successfully",
      );

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(
        "Automated Test User",
      );
      expect(response.body.data.email).toBe(uniqueEmail);

      expect(response.body.data.password).toBeUndefined();
    });

    it("USER-02 should reject duplicate email registration", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Duplicate User",
          email: uniqueEmail,
          password,
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe(
        "An account with this email already exists",
      );
    });

    it("USER-03 should reject missing name", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          email: `missing-name-${Date.now()}@test.com`,
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-04 should reject an empty name", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "",
          email: `empty-name-${Date.now()}@test.com`,
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-05 should reject a whitespace-only name", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "   ",
          email: `whitespace-name-${Date.now()}@test.com`,
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-06 should reject missing email", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Test User",
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-07 should reject an empty email", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Test User",
          email: "",
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-08 should reject an invalid email", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Test User",
          email: "invalid-email",
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-09 should reject missing password", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Test User",
          email: `missing-password-${Date.now()}@test.com`,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-10 should reject an empty password", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Test User",
          email: `empty-password-${Date.now()}@test.com`,
          password: "",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-11 should reject a password shorter than 8 characters", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Test User",
          email: `short-password-${Date.now()}@test.com`,
          password: "Pass123",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-12 should accept a password exactly 8 characters long", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Eight Character User",
          email: `eight-password-${Date.now()}@test.com`,
          password: "Pass1234",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
    });

    it("USER-13 should reject unexpected signup fields", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Test User",
          email: `unknown-field-${Date.now()}@test.com`,
          password,
          role: "admin",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-14 should not expose the hashed password in the signup response", async () => {
      const response = await request(app)
        .post("/api/signup")
        .send({
          name: "Security Test User",
          email: `security-${Date.now()}@test.com`,
          password,
        });

      expect(response.statusCode).toBe(201);

      expect(response.body.data).not.toHaveProperty(
        "password",
      );
    });
  });

  describe("POST /api/signin", () => {
    it("USER-15 should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: uniqueEmail,
          password,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "User logged in successfully",
      );

      expect(
        response.body.data.accessToken,
      ).toBeDefined();

      expect(
        typeof response.body.data.accessToken,
      ).toBe("string");
    });

    it("USER-16 should reject login for a nonexistent user", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: `nonexistent-${Date.now()}@test.com`,
          password,
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe(
        "Invalid email or password",
      );
    });

    it("USER-17 should reject an incorrect password", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: uniqueEmail,
          password: "WrongPassword123",
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe(
        "Invalid email or password",
      );
    });

    it("USER-18 should use the same error message for nonexistent users and incorrect passwords", async () => {
      const nonexistentResponse = await request(app)
        .post("/api/signin")
        .send({
          email: `unknown-${Date.now()}@test.com`,
          password,
        });

      const incorrectPasswordResponse =
        await request(app)
          .post("/api/signin")
          .send({
            email: uniqueEmail,
            password: "DefinitelyWrongPassword",
          });

      expect(nonexistentResponse.statusCode).toBe(401);
      expect(
        incorrectPasswordResponse.statusCode,
      ).toBe(401);

      expect(nonexistentResponse.body.message).toBe(
        incorrectPasswordResponse.body.message,
      );
    });

    it("USER-19 should reject missing email", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-20 should reject an empty email", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: "",
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-21 should reject an invalid email format", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: "not-an-email",
          password,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-22 should reject missing password", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: uniqueEmail,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-23 should reject an empty password", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: uniqueEmail,
          password: "",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-24 should reject unexpected signin fields", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: uniqueEmail,
          password,
          role: "admin",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("USER-25 should not expose user password information during login", async () => {
      const response = await request(app)
        .post("/api/signin")
        .send({
          email: uniqueEmail,
          password,
        });

      expect(response.statusCode).toBe(200);

      expect(response.body.data).not.toHaveProperty(
        "password",
      );

      expect(response.body.data).not.toHaveProperty(
        "user",
      );
    });
  });

  describe("Email Normalization", () => {
    it("USER-26 should normalize an email during registration and login", async () => {
      const normalizedEmail =
        `normalized-${Date.now()}@test.com`;

      const registerResponse = await request(app)
        .post("/api/signup")
        .send({
          name: "Normalization User",
          email: normalizedEmail.toUpperCase(),
          password,
        });

      expect(registerResponse.statusCode).toBe(201);

      expect(registerResponse.body.data.email).toBe(
        normalizedEmail,
      );

      const loginResponse = await request(app)
        .post("/api/signin")
        .send({
          email: normalizedEmail.toUpperCase(),
          password,
        });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body.status).toBe("success");
    });
  });
});
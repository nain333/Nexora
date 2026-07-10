import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";

import app from "../../app.js";
import seedDevelopmentData from "../../config/seed.js";

describe("Comments API", () => {
  let primaryToken;
  let secondaryToken;
  let postId;
  let primaryCommentId;

  beforeAll(async () => {
    await seedDevelopmentData();

    const primaryLoginResponse = await request(app).post("/api/signin").send({
      email: "primary@test.com",
      password: "Password123",
    });

    expect(primaryLoginResponse.statusCode).toBe(200);

    primaryToken = primaryLoginResponse.body.data.accessToken;

    const secondaryLoginResponse = await request(app).post("/api/signin").send({
      email: "secondary@test.com",
      password: "Password123",
    });

    expect(secondaryLoginResponse.statusCode).toBe(200);

    secondaryToken = secondaryLoginResponse.body.data.accessToken;

    const postsResponse = await request(app)
      .get("/api/posts/all")
      .set("Authorization", `Bearer ${primaryToken}`);

    expect(postsResponse.statusCode).toBe(200);
    expect(postsResponse.body.data.posts.length).toBeGreaterThan(0);

    postId = postsResponse.body.data.posts[0].id;
  });

  describe("Authentication", () => {
    it("COMMENT-01 should reject GET comments without authentication", async () => {
      const response = await request(app).get(`/api/comments/${postId}`);

      expect(response.statusCode).toBe(401);
    });

    it("COMMENT-02 should reject POST comment without authentication", async () => {
      const response = await request(app).post(`/api/comments/${postId}`).send({
        content: "Unauthorized comment",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("Create Comment", () => {
    it("COMMENT-03 should create a comment successfully", async () => {
      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Automated test comment",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.comment.content).toBe("Automated test comment");

      primaryCommentId = response.body.data.comment.id;
    });

    it("COMMENT-04 should reject missing comment content", async () => {
      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-05 should reject empty comment content", async () => {
      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "",
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-06 should reject whitespace-only comment content", async () => {
      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "   ",
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-07 should reject non-string comment content", async () => {
      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: 123,
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-08 should reject unexpected request body fields", async () => {
      const response = await request(app)
        .post(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Valid comment",
          role: "admin",
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-09 should reject an invalid post UUID", async () => {
      const response = await request(app)
        .post("/api/comments/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Valid comment",
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-10 should return 404 for a nonexistent post", async () => {
      const response = await request(app)
        .post("/api/comments/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Valid comment",
        });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Get Comments", () => {
    it("COMMENT-11 should retrieve comments for a post", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.data.comments)).toBe(true);
    });

    it("COMMENT-12 should return pagination metadata", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBeDefined();
      expect(response.body.data.pagination.limit).toBeDefined();
      expect(response.body.data.pagination.totalComments).toBeDefined();
      expect(response.body.data.pagination.totalPages).toBeDefined();
    });

    it("COMMENT-13 should apply page and limit pagination", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}?page=1&limit=1`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.comments.length).toBeLessThanOrEqual(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    it("COMMENT-14 should reject page zero", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}?page=0`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-15 should reject a negative page", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}?page=-1`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-16 should reject a non-integer page", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}?page=abc`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-17 should reject limit zero", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}?limit=0`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-18 should reject a limit greater than 100", async () => {
      const response = await request(app)
        .get(`/api/comments/${postId}?limit=101`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-19 should reject an invalid post UUID", async () => {
      const response = await request(app)
        .get("/api/comments/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-20 should return 404 for a nonexistent post", async () => {
      const response = await request(app)
        .get("/api/comments/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Update Comment", () => {
    it("COMMENT-21 should update the owner's comment", async () => {
      const response = await request(app)
        .put(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Updated automated comment",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.comment.content).toBe(
        "Updated automated comment",
      );
    });

    it("COMMENT-22 should reject update without authentication", async () => {
      const response = await request(app)
        .put(`/api/comments/${primaryCommentId}`)
        .send({
          content: "Unauthorized update",
        });

      expect(response.statusCode).toBe(401);
    });

    it("COMMENT-23 should reject update by another user", async () => {
      const response = await request(app)
        .put(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${secondaryToken}`)
        .send({
          content: "Forbidden update",
        });

      expect(response.statusCode).toBe(403);
    });

    it("COMMENT-24 should reject missing update content", async () => {
      const response = await request(app)
        .put(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-25 should reject empty update content", async () => {
      const response = await request(app)
        .put(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "",
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-26 should reject unexpected update fields", async () => {
      const response = await request(app)
        .put(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Valid update",
          role: "admin",
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-27 should reject an invalid comment UUID", async () => {
      const response = await request(app)
        .put("/api/comments/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Valid update",
        });

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-28 should return 404 for a nonexistent comment", async () => {
      const response = await request(app)
        .put("/api/comments/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "Valid update",
        });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Delete Comment", () => {
    it("COMMENT-29 should reject delete without authentication", async () => {
      const response = await request(app).delete(
        `/api/comments/${primaryCommentId}`,
      );

      expect(response.statusCode).toBe(401);
    });

    it("COMMENT-30 should reject delete by another user", async () => {
      const response = await request(app)
        .delete(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${secondaryToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("COMMENT-31 should reject an invalid comment UUID", async () => {
      const response = await request(app)
        .delete("/api/comments/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("COMMENT-32 should return 404 for a nonexistent comment", async () => {
      const response = await request(app)
        .delete("/api/comments/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("COMMENT-33 should delete the owner's comment", async () => {
      const response = await request(app)
        .delete(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Comment deleted successfully");
    });

    it("COMMENT-34 should return 404 when deleting the same comment again", async () => {
      const response = await request(app)
        .delete(`/api/comments/${primaryCommentId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
    });
  });
});

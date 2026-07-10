import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../app.js";
import seedDevelopmentData from "../../config/seed.js";

describe("Likes API", () => {
  let primaryToken;
  let secondaryToken;
  let postId;

  beforeAll(async () => {
    await seedDevelopmentData();

    const primaryLoginResponse = await request(app).post("/api/signin").send({
      email: "primary@test.com",
      password: "Password123",
    });

    expect(primaryLoginResponse.statusCode).toBe(200);
    expect(primaryLoginResponse.body.status).toBe("success");
    expect(primaryLoginResponse.body.data.accessToken).toBeDefined();

    primaryToken = primaryLoginResponse.body.data.accessToken;

    const secondaryLoginResponse = await request(app).post("/api/signin").send({
      email: "secondary@test.com",
      password: "Password123",
    });

    expect(secondaryLoginResponse.statusCode).toBe(200);
    expect(secondaryLoginResponse.body.status).toBe("success");
    expect(secondaryLoginResponse.body.data.accessToken).toBeDefined();

    secondaryToken = secondaryLoginResponse.body.data.accessToken;

    const postsResponse = await request(app)
      .get("/api/posts/all")
      .set("Authorization", `Bearer ${primaryToken}`);

    expect(postsResponse.statusCode).toBe(200);
    expect(postsResponse.body.status).toBe("success");
    expect(postsResponse.body.data.posts.length).toBeGreaterThan(0);

    postId = postsResponse.body.data.posts[0].id;
  });

  describe("Authentication", () => {
    it("LIKE-01 should reject retrieving likes without authentication", async () => {
      const response = await request(app).get(`/api/likes/${postId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("LIKE-02 should reject toggling a like without authentication", async () => {
      const response = await request(app).get(`/api/likes/toggle/${postId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("LIKE-03 should reject an invalid authentication token", async () => {
      const response = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", "Bearer invalid-token");

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });
  });

  describe("Get Likes", () => {
    it("LIKE-04 should retrieve likes for an existing post", async () => {
      const response = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.data.likes)).toBe(true);
    });

    it("LIKE-05 should return the correct response structure", async () => {
      const response = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("likes");
      expect(Array.isArray(response.body.data.likes)).toBe(true);
    });

    it("LIKE-06 should reject an invalid post UUID", async () => {
      const response = await request(app)
        .get("/api/likes/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("LIKE-07 should return 404 for a nonexistent post", async () => {
      const response = await request(app)
        .get("/api/likes/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Post not found");
    });
  });

  describe("Toggle Like", () => {
    it("LIKE-08 should add a like successfully", async () => {
      /*
       * Toggle first to normalize the state.
       *
       * Seed data may already contain a Primary User like for
       * the selected post. We inspect the current state before
       * asserting the creation behavior.
       */

      const likesResponse = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(likesResponse.statusCode).toBe(200);

      const primaryUserAlreadyLiked = likesResponse.body.data.likes.some(
        (like) => {
          return (
            like.userId ===
            JSON.parse(
              Buffer.from(primaryToken.split(".")[1], "base64url").toString(),
            ).userId
          );
        },
      );

      if (primaryUserAlreadyLiked) {
        const removeResponse = await request(app)
          .get(`/api/likes/toggle/${postId}`)
          .set("Authorization", `Bearer ${primaryToken}`);

        expect(removeResponse.statusCode).toBe(200);
      }

      const response = await request(app)
        .get(`/api/likes/toggle/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Post liked successfully");
      expect(response.body.data.like).toBeDefined();
      expect(response.body.data.like.postId).toBe(postId);
    });

    it("LIKE-09 should expose the newly added like through GET likes", async () => {
      const response = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");

      const matchingLike = response.body.data.likes.find(
        (like) => like.postId === postId,
      );

      expect(matchingLike).toBeDefined();
    });

    it("LIKE-10 should remove an existing like successfully", async () => {
      const response = await request(app)
        .get(`/api/likes/toggle/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Like removed successfully");
      expect(response.body.data.like).toBeDefined();
      expect(response.body.data.like.postId).toBe(postId);
    });

    it("LIKE-11 should no longer expose the removed like", async () => {
      const response = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");

      const primaryUserId = JSON.parse(
        Buffer.from(primaryToken.split(".")[1], "base64url").toString(),
      ).userId;

      const removedLike = response.body.data.likes.find(
        (like) => like.userId === primaryUserId && like.postId === postId,
      );

      expect(removedLike).toBeUndefined();
    });

    it("LIKE-12 should allow two different users to like the same post", async () => {
      /*
       * Normalize both users to an unliked state first.
       */

      const currentLikesResponse = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(currentLikesResponse.statusCode).toBe(200);

      const primaryUserId = JSON.parse(
        Buffer.from(primaryToken.split(".")[1], "base64url").toString(),
      ).userId;

      const secondaryUserId = JSON.parse(
        Buffer.from(secondaryToken.split(".")[1], "base64url").toString(),
      ).userId;

      const currentLikes = currentLikesResponse.body.data.likes;

      if (currentLikes.some((like) => like.userId === primaryUserId)) {
        const response = await request(app)
          .get(`/api/likes/toggle/${postId}`)
          .set("Authorization", `Bearer ${primaryToken}`);

        expect(response.statusCode).toBe(200);
      }

      if (currentLikes.some((like) => like.userId === secondaryUserId)) {
        const response = await request(app)
          .get(`/api/likes/toggle/${postId}`)
          .set("Authorization", `Bearer ${secondaryToken}`);

        expect(response.statusCode).toBe(200);
      }

      const primaryLikeResponse = await request(app)
        .get(`/api/likes/toggle/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(primaryLikeResponse.statusCode).toBe(201);

      const secondaryLikeResponse = await request(app)
        .get(`/api/likes/toggle/${postId}`)
        .set("Authorization", `Bearer ${secondaryToken}`);

      expect(secondaryLikeResponse.statusCode).toBe(201);

      const likesResponse = await request(app)
        .get(`/api/likes/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(likesResponse.statusCode).toBe(200);

      const primaryLike = likesResponse.body.data.likes.find(
        (like) => like.userId === primaryUserId,
      );

      const secondaryLike = likesResponse.body.data.likes.find(
        (like) => like.userId === secondaryUserId,
      );

      expect(primaryLike).toBeDefined();
      expect(secondaryLike).toBeDefined();
    });

    it("LIKE-13 should reject toggle for an invalid post UUID", async () => {
      const response = await request(app)
        .get("/api/likes/toggle/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("LIKE-14 should return 404 when toggling a nonexistent post", async () => {
      const response = await request(app)
        .get("/api/likes/toggle/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Post not found");
    });
  });
});

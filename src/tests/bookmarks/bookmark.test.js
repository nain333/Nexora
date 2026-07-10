import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../app.js";
import seedDevelopmentData from "../../config/seed.js";

describe("Bookmarks API", () => {
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
    it("BOOKMARK-01 should reject retrieving bookmarks without authentication", async () => {
      const response = await request(app).get("/api/bookmarks");

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("BOOKMARK-02 should reject creating a bookmark without authentication", async () => {
      const response = await request(app).post(`/api/bookmarks/${postId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("BOOKMARK-03 should reject deleting a bookmark without authentication", async () => {
      const response = await request(app).delete(`/api/bookmarks/${postId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("BOOKMARK-04 should reject an invalid authentication token", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", "Bearer invalid-token");

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });
  });

  describe("Get Bookmarks", () => {
    it("BOOKMARK-05 should retrieve the authenticated user's bookmarks", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.data.bookmarks)).toBe(true);
    });

    it("BOOKMARK-06 should return the correct response structure", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("bookmarks");
      expect(Array.isArray(response.body.data.bookmarks)).toBe(true);
    });
  });

  describe("Create Bookmark", () => {
    it("BOOKMARK-07 should create a bookmark successfully", async () => {
      const response = await request(app)
        .post(`/api/bookmarks/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Post bookmarked successfully");

      expect(response.body.data.bookmark).toBeDefined();

      expect(response.body.data.bookmark.postId).toBe(postId);

      expect(response.body.data.bookmark.id).toBeDefined();

      expect(response.body.data.bookmark.userId).toBeDefined();

      expect(response.body.data.bookmark.createdAt).toBeDefined();
    });

    it("BOOKMARK-08 should expose the newly created bookmark through GET bookmarks", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");

      const bookmark = response.body.data.bookmarks.find(
        (bookmark) => bookmark.postId === postId,
      );

      expect(bookmark).toBeDefined();
    });

    it("BOOKMARK-09 should reject duplicate bookmarks", async () => {
      const response = await request(app)
        .post(`/api/bookmarks/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(409);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Post is already bookmarked");
    });

    it("BOOKMARK-10 should reject an invalid post UUID", async () => {
      const response = await request(app)
        .post("/api/bookmarks/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("BOOKMARK-11 should return 404 when bookmarking a nonexistent post", async () => {
      const response = await request(app)
        .post("/api/bookmarks/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Post not found");
    });

    it("BOOKMARK-12 should allow different users to bookmark the same post", async () => {
      const response = await request(app)
        .post(`/api/bookmarks/${postId}`)
        .set("Authorization", `Bearer ${secondaryToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Post bookmarked successfully");
      expect(response.body.data.bookmark.postId).toBe(postId);
    });
  });

  describe("User Isolation", () => {
    it("BOOKMARK-13 should return only the Primary User's bookmarks", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      const primaryUserId = JSON.parse(
        Buffer.from(primaryToken.split(".")[1], "base64url").toString(),
      ).userId;

      const bookmarks = response.body.data.bookmarks;

      expect(
        bookmarks.every((bookmark) => bookmark.userId === primaryUserId),
      ).toBe(true);
    });

    it("BOOKMARK-14 should return only the Secondary User's bookmarks", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", `Bearer ${secondaryToken}`);

      expect(response.statusCode).toBe(200);

      const secondaryUserId = JSON.parse(
        Buffer.from(secondaryToken.split(".")[1], "base64url").toString(),
      ).userId;

      const bookmarks = response.body.data.bookmarks;

      expect(
        bookmarks.every((bookmark) => bookmark.userId === secondaryUserId),
      ).toBe(true);
    });
  });

  describe("Delete Bookmark", () => {
    it("BOOKMARK-15 should delete the authenticated user's bookmark", async () => {
      const response = await request(app)
        .delete(`/api/bookmarks/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Bookmark removed successfully");
    });

    it("BOOKMARK-16 should no longer expose the deleted bookmark", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      const bookmark = response.body.data.bookmarks.find(
        (bookmark) => bookmark.postId === postId,
      );

      expect(bookmark).toBeUndefined();
    });

    it("BOOKMARK-17 should return 404 when deleting the same bookmark again", async () => {
      const response = await request(app)
        .delete(`/api/bookmarks/${postId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Bookmark not found");
    });

    it("BOOKMARK-18 should reject deletion with an invalid post UUID", async () => {
      const response = await request(app)
        .delete("/api/bookmarks/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("BOOKMARK-19 should return 404 when deleting a bookmark that does not exist", async () => {
      const response = await request(app)
        .delete("/api/bookmarks/00000000-0000-4000-8000-000000000000")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Bookmark not found");
    });

    it("BOOKMARK-20 deleting the Primary User's bookmark should not delete the Secondary User's bookmark", async () => {
      const response = await request(app)
        .get("/api/bookmarks")
        .set("Authorization", `Bearer ${secondaryToken}`);

      expect(response.statusCode).toBe(200);

      const secondaryBookmark = response.body.data.bookmarks.find(
        (bookmark) => bookmark.postId === postId,
      );

      expect(secondaryBookmark).toBeDefined();
    });
  });
});

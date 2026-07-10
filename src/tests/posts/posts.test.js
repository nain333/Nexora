import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../app.js";
import seedDevelopmentData from "../../config/seed.js";

describe("Posts API", () => {
  let primaryToken;
  let secondaryToken;
  let primaryUserId;
  let secondaryUserId;

  let primaryPostId;
  let secondaryPostId;
  let deletablePostId;
  let statusPostId;

  const nonexistentUUID = "00000000-0000-4000-8000-000000000000";

  beforeAll(async () => {
    await seedDevelopmentData();

    const primaryLoginResponse = await request(app).post("/api/signin").send({
      email: "primary@test.com",
      password: "Password123",
    });

    expect(primaryLoginResponse.statusCode).toBe(200);
    expect(primaryLoginResponse.body.status).toBe("success");

    primaryToken = primaryLoginResponse.body.data.accessToken;

    const secondaryLoginResponse = await request(app).post("/api/signin").send({
      email: "secondary@test.com",
      password: "Password123",
    });

    expect(secondaryLoginResponse.statusCode).toBe(200);
    expect(secondaryLoginResponse.body.status).toBe("success");

    secondaryToken = secondaryLoginResponse.body.data.accessToken;

    primaryUserId = JSON.parse(
      Buffer.from(primaryToken.split(".")[1], "base64url").toString(),
    ).userId;

    secondaryUserId = JSON.parse(
      Buffer.from(secondaryToken.split(".")[1], "base64url").toString(),
    ).userId;

    const primaryPostResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        caption: "POST TEST PRIMARY RESOURCE",
      });

    expect(primaryPostResponse.statusCode).toBe(201);

    primaryPostId = primaryPostResponse.body.data.post.id;

    const secondaryPostResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${secondaryToken}`)
      .send({
        caption: "POST TEST SECONDARY RESOURCE",
      });

    expect(secondaryPostResponse.statusCode).toBe(201);

    secondaryPostId = secondaryPostResponse.body.data.post.id;
  });

  describe("Authentication", () => {
    it("POST-01 should reject retrieving the public feed without authentication", async () => {
      const response = await request(app).get("/api/posts/all");

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("POST-02 should reject retrieving user posts without authentication", async () => {
      const response = await request(app).get("/api/posts");

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("POST-03 should reject retrieving a post without authentication", async () => {
      const response = await request(app).get(`/api/posts/${primaryPostId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("POST-04 should reject creating a post without authentication", async () => {
      const response = await request(app).post("/api/posts").send({
        caption: "Unauthorized post",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("POST-05 should reject updating a post without authentication", async () => {
      const response = await request(app)
        .put(`/api/posts/${primaryPostId}`)
        .send({
          caption: "Unauthorized update",
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("POST-06 should reject deleting a post without authentication", async () => {
      const response = await request(app).delete(`/api/posts/${primaryPostId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("POST-07 should reject status updates without authentication", async () => {
      const response = await request(app)
        .patch(`/api/posts/${primaryPostId}/status`)
        .send({
          status: "draft",
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("POST-08 should reject an invalid authentication token", async () => {
      const response = await request(app)
        .get("/api/posts/all")
        .set("Authorization", "Bearer invalid-token");

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe("fail");
    });
  });

  describe("Create Post", () => {
    it("POST-09 should create a post successfully", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "Automated created post",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Post created successfully");

      expect(response.body.data.post.id).toBeDefined();
      expect(response.body.data.post.userId).toBe(primaryUserId);
      expect(response.body.data.post.caption).toBe("Automated created post");
      expect(response.body.data.post.status).toBe("published");
      expect(response.body.data.post.createdAt).toBeDefined();
    });

    it("POST-10 should reject missing caption", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-11 should reject an empty caption", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-12 should reject whitespace-only caption", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "   ",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-13 should reject non-string caption", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: 123,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-14 should reject captions longer than 2200 characters", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "a".repeat(2201),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-15 should accept a caption exactly 2200 characters long", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "a".repeat(2200),
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.post.caption.length).toBe(2200);
    });

    it("POST-16 should reject unexpected request body fields", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "Valid caption",
          role: "admin",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });
  });

  describe("Get User Posts", () => {
    it("POST-17 should retrieve the authenticated user's posts", async () => {
      const response = await request(app)
        .get("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.data.posts)).toBe(true);
    });

    it("POST-18 should return only posts belonging to the authenticated user", async () => {
      const response = await request(app)
        .get("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      expect(
        response.body.data.posts.every((post) => post.userId === primaryUserId),
      ).toBe(true);
    });
  });

  describe("Get Post By ID", () => {
    it("POST-19 should retrieve an existing post", async () => {
      const response = await request(app)
        .get(`/api/posts/${primaryPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.post.id).toBe(primaryPostId);
    });

    it("POST-20 should reject an invalid post UUID", async () => {
      const response = await request(app)
        .get("/api/posts/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-21 should return 404 for a nonexistent post", async () => {
      const response = await request(app)
        .get(`/api/posts/${nonexistentUUID}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Post not found");
    });
  });

  describe("Update Post", () => {
    it("POST-22 should update the owner's post", async () => {
      const response = await request(app)
        .put(`/api/posts/${primaryPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "Updated automated post",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Post updated successfully");
      expect(response.body.data.post.caption).toBe("Updated automated post");
    });

    it("POST-23 should reject update by another user", async () => {
      const response = await request(app)
        .put(`/api/posts/${primaryPostId}`)
        .set("Authorization", `Bearer ${secondaryToken}`)
        .send({
          caption: "Forbidden update",
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.status).toBe("fail");
    });

    it("POST-24 should reject an invalid post UUID", async () => {
      const response = await request(app)
        .put("/api/posts/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "Valid update",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-25 should return 404 for a nonexistent post", async () => {
      const response = await request(app)
        .put(`/api/posts/${nonexistentUUID}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "Valid update",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
    });

    it("POST-26 should reject update without caption or image", async () => {
      const response = await request(app)
        .put(`/api/posts/${primaryPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-27 should reject an empty update caption", async () => {
      const response = await request(app)
        .put(`/api/posts/${primaryPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-28 should reject unexpected update fields", async () => {
      const response = await request(app)
        .put(`/api/posts/${primaryPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "Valid update",
          role: "admin",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });
  });

  describe("Post Status", () => {
    it("POST-29 should create a dedicated post for status testing", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "STATUS TEST RESOURCE",
        });

      expect(response.statusCode).toBe(201);

      statusPostId = response.body.data.post.id;
    });

    it("POST-30 should update a post status to draft", async () => {
      const response = await request(app)
        .patch(`/api/posts/${statusPostId}/status`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          status: "draft",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.post.status).toBe("draft");
    });

    it("POST-31 should exclude draft posts from the public feed", async () => {
      const response = await request(app)
        .get("/api/posts/all")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      const draftPost = response.body.data.posts.find(
        (post) => post.id === statusPostId,
      );

      expect(draftPost).toBeUndefined();
    });

    it("POST-32 should update a post status to archived", async () => {
      const response = await request(app)
        .patch(`/api/posts/${statusPostId}/status`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          status: "archived",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.post.status).toBe("archived");
    });

    it("POST-33 should exclude archived posts from the public feed", async () => {
      const response = await request(app)
        .get("/api/posts/all")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      expect(
        response.body.data.posts.find((post) => post.id === statusPostId),
      ).toBeUndefined();
    });

    it("POST-34 should restore the post to published", async () => {
      const response = await request(app)
        .patch(`/api/posts/${statusPostId}/status`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          status: "published",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.post.status).toBe("published");
    });

    it("POST-35 should reject an invalid status", async () => {
      const response = await request(app)
        .patch(`/api/posts/${statusPostId}/status`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          status: "deleted",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-36 should reject missing status", async () => {
      const response = await request(app)
        .patch(`/api/posts/${statusPostId}/status`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-37 should reject status updates by another user", async () => {
      const response = await request(app)
        .patch(`/api/posts/${statusPostId}/status`)
        .set("Authorization", `Bearer ${secondaryToken}`)
        .send({
          status: "draft",
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.status).toBe("fail");
    });

    it("POST-38 should reject an invalid UUID for status updates", async () => {
      const response = await request(app)
        .patch("/api/posts/not-a-valid-uuid/status")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          status: "draft",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-39 should return 404 for status updates on a nonexistent post", async () => {
      const response = await request(app)
        .patch(`/api/posts/${nonexistentUUID}/status`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          status: "draft",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
    });
  });

  describe("Feed Filtering and Pagination", () => {
    it("POST-40 should return only published posts", async () => {
      const response = await request(app)
        .get("/api/posts/all")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      expect(
        response.body.data.posts.every((post) => post.status === "published"),
      ).toBe(true);
    });

    it("POST-41 should filter posts by caption case-insensitively", async () => {
      const response = await request(app)
        .get("/api/posts/all?caption=post%20test%20secondary")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.posts.length).toBeGreaterThan(0);

      expect(
        response.body.data.posts.every((post) =>
          post.caption.toLowerCase().includes("post test secondary"),
        ),
      ).toBe(true);
    });

    it("POST-42 should return an empty collection for an unmatched caption", async () => {
      const response = await request(app)
        .get("/api/posts/all?caption=NO_MATCH_UNIQUE_938274")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.posts).toEqual([]);
      expect(response.body.data.pagination.totalPosts).toBe(0);
    });

    it("POST-43 should apply pagination correctly", async () => {
      const response = await request(app)
        .get("/api/posts/all?page=1&limit=2")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.posts.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    it("POST-44 should return numeric pagination metadata", async () => {
      const response = await request(app)
        .get("/api/posts/all?page=1&limit=2")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(typeof response.body.data.pagination.currentPage).toBe("number");
      expect(typeof response.body.data.pagination.limit).toBe("number");
      expect(typeof response.body.data.pagination.totalPosts).toBe("number");
      expect(typeof response.body.data.pagination.totalPages).toBe("number");
    });

    it("POST-45 should return an empty collection for a page beyond the available range", async () => {
      const response = await request(app)
        .get("/api/posts/all?page=999999&limit=2")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.posts).toEqual([]);
    });

    it("POST-46 should reject page zero", async () => {
      const response = await request(app)
        .get("/api/posts/all?page=0")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("POST-47 should reject a negative page", async () => {
      const response = await request(app)
        .get("/api/posts/all?page=-1")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("POST-48 should reject a non-integer page", async () => {
      const response = await request(app)
        .get("/api/posts/all?page=abc")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("POST-49 should reject limit zero", async () => {
      const response = await request(app)
        .get("/api/posts/all?limit=0")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("POST-50 should reject limit greater than 100", async () => {
      const response = await request(app)
        .get("/api/posts/all?limit=101")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("POST-51 should reject unsupported query parameters", async () => {
      const response = await request(app)
        .get("/api/posts/all?page=1&limit=2&role=admin")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-52 should combine caption filtering and pagination correctly", async () => {
      const response = await request(app)
        .get("/api/posts/all?caption=POST%20TEST&page=1&limit=1")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.posts.length).toBeLessThanOrEqual(1);

      expect(
        response.body.data.posts.every((post) =>
          post.caption.toLowerCase().includes("post test"),
        ),
      ).toBe(true);

      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });
  });

  describe("Date Sorting", () => {
    it("POST-53 should sort the default feed newest-first", async () => {
      const response = await request(app)
        .get("/api/posts/all?limit=100")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      const posts = response.body.data.posts;

      for (let index = 1; index < posts.length; index++) {
        const previousDate = new Date(posts[index - 1].createdAt).getTime();

        const currentDate = new Date(posts[index].createdAt).getTime();

        expect(previousDate).toBeGreaterThanOrEqual(currentDate);
      }
    });

    it("POST-54 should explicitly sort by date newest-first", async () => {
      const response = await request(app)
        .get("/api/posts/all?sort=date&limit=100")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      const posts = response.body.data.posts;

      for (let index = 1; index < posts.length; index++) {
        expect(
          new Date(posts[index - 1].createdAt).getTime(),
        ).toBeGreaterThanOrEqual(new Date(posts[index].createdAt).getTime());
      }
    });

    it("POST-55 should reject unsupported sort values", async () => {
      const response = await request(app)
        .get("/api/posts/all?sort=random")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });
  });

  describe("Engagement Sorting", () => {
    let lowEngagementPostId;
    let mediumEngagementPostId;
    let highEngagementPostId;

    it("POST-56 should create controlled posts with different engagement levels", async () => {
      const lowResponse = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "ENGAGEMENT TEST LOW",
        });

      expect(lowResponse.statusCode).toBe(201);

      lowEngagementPostId = lowResponse.body.data.post.id;

      const mediumResponse = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "ENGAGEMENT TEST MEDIUM",
        });

      expect(mediumResponse.statusCode).toBe(201);

      mediumEngagementPostId = mediumResponse.body.data.post.id;

      const highResponse = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "ENGAGEMENT TEST HIGH",
        });

      expect(highResponse.statusCode).toBe(201);

      highEngagementPostId = highResponse.body.data.post.id;

      const mediumLikeResponse = await request(app)
        .get(`/api/likes/toggle/${mediumEngagementPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(mediumLikeResponse.statusCode).toBe(201);

      const highPrimaryLikeResponse = await request(app)
        .get(`/api/likes/toggle/${highEngagementPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(highPrimaryLikeResponse.statusCode).toBe(201);

      const highSecondaryLikeResponse = await request(app)
        .get(`/api/likes/toggle/${highEngagementPostId}`)
        .set("Authorization", `Bearer ${secondaryToken}`);

      expect(highSecondaryLikeResponse.statusCode).toBe(201);

      const highCommentResponse = await request(app)
        .post(`/api/comments/${highEngagementPostId}`)
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          content: "High engagement comment",
        });

      expect(highCommentResponse.statusCode).toBe(201);
    });

    it("POST-57 should sort controlled posts by engagement descending", async () => {
      const response = await request(app)
        .get(
          "/api/posts/all?caption=ENGAGEMENT%20TEST&sort=engagement&limit=100",
        )
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);

      const ids = response.body.data.posts.map((post) => post.id);

      expect(ids).toEqual([
        highEngagementPostId,
        mediumEngagementPostId,
        lowEngagementPostId,
      ]);
    });

    it("POST-58 should sort by engagement before applying pagination", async () => {
      const firstPageResponse = await request(app)
        .get(
          "/api/posts/all?caption=ENGAGEMENT%20TEST&sort=engagement&page=1&limit=1",
        )
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(firstPageResponse.statusCode).toBe(200);
      expect(firstPageResponse.body.data.posts.length).toBe(1);
      expect(firstPageResponse.body.data.posts[0].id).toBe(
        highEngagementPostId,
      );

      const secondPageResponse = await request(app)
        .get(
          "/api/posts/all?caption=ENGAGEMENT%20TEST&sort=engagement&page=2&limit=1",
        )
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(secondPageResponse.statusCode).toBe(200);
      expect(secondPageResponse.body.data.posts[0].id).toBe(
        mediumEngagementPostId,
      );

      const thirdPageResponse = await request(app)
        .get(
          "/api/posts/all?caption=ENGAGEMENT%20TEST&sort=engagement&page=3&limit=1",
        )
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(thirdPageResponse.statusCode).toBe(200);
      expect(thirdPageResponse.body.data.posts[0].id).toBe(lowEngagementPostId);
    });
  });

  describe("Delete Post", () => {
    it("POST-59 should create a dedicated post for deletion", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${primaryToken}`)
        .send({
          caption: "DELETE TEST RESOURCE",
        });

      expect(response.statusCode).toBe(201);

      deletablePostId = response.body.data.post.id;
    });

    it("POST-60 should reject deletion by another user", async () => {
      const response = await request(app)
        .delete(`/api/posts/${deletablePostId}`)
        .set("Authorization", `Bearer ${secondaryToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.status).toBe("fail");
    });

    it("POST-61 should reject deletion with an invalid UUID", async () => {
      const response = await request(app)
        .delete("/api/posts/not-a-valid-uuid")
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("POST-62 should return 404 when deleting a nonexistent post", async () => {
      const response = await request(app)
        .delete(`/api/posts/${nonexistentUUID}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
    });

    it("POST-63 should delete the owner's post", async () => {
      const response = await request(app)
        .delete(`/api/posts/${deletablePostId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Post deleted successfully");
    });

    it("POST-64 should return 404 when retrieving the deleted post", async () => {
      const response = await request(app)
        .get(`/api/posts/${deletablePostId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
    });

    it("POST-65 should return 404 when deleting the same post again", async () => {
      const response = await request(app)
        .delete(`/api/posts/${deletablePostId}`)
        .set("Authorization", `Bearer ${primaryToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("fail");
    });
  });
});

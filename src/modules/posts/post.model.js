import { randomUUID } from "node:crypto";
import LikeModel from "../likes/like.model.js";
import CommentModel from "../comments/comment.model.js";
const posts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    userId: "test-user-id",
    caption: "Seed post for API testing",
    imageUrl: "uploads/posts/test-image.jpg",
    status: "published",
    createdAt: new Date("2026-07-01T10:00:00.000Z"),
  },
];

export default class PostModel {
  constructor(userId, caption, imageUrl, status = "published") {
    this.id = randomUUID();
    this.userId = userId;
    this.caption = caption;
    this.imageUrl = imageUrl;
    this.status = status;
    this.createdAt = new Date();
  }

  static createPost(userId, caption, imageUrl, status = "published") {
    const post = new PostModel(userId, caption, imageUrl, status);

    posts.push(post);

    return post;
  }

  static getAllPosts(caption, sort, page = 1, limit = 10) {
    let filteredPosts = posts.filter((post) => post.status === "published");

    if (caption) {
      const normalizedCaption = caption.trim().toLowerCase();

      filteredPosts = filteredPosts.filter((post) =>
        post.caption.toLowerCase().includes(normalizedCaption),
      );
    }

    if (!sort || sort === "date") {
      filteredPosts = [...filteredPosts].sort(
        (a, b) => b.createdAt - a.createdAt,
      );
    }

    if (sort === "engagement") {
      filteredPosts = [...filteredPosts].sort((a, b) => {
        const likesOnPostA = LikeModel.getLikesByPostId(a.id).length;

        const likesOnPostB = LikeModel.getLikesByPostId(b.id).length;

        const commentsOnPostA = CommentModel.getCommentsByPostId(a.id)
          .pagination.totalComments;

        const commentsOnPostB = CommentModel.getCommentsByPostId(b.id)
          .pagination.totalComments;

        const engagementOnPostA = likesOnPostA + commentsOnPostA;

        const engagementOnPostB = likesOnPostB + commentsOnPostB;

        return engagementOnPostB - engagementOnPostA;
      });
    }

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);

    const startIndex = (page - 1) * limit;

    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);

    return {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        limit,
        totalPosts,
        totalPages,
      },
    };
  }
  static getPostsByUserId(userId) {
    return posts.filter((post) => post.userId === userId);
  }

  static getPostById(postId) {
    return posts.find((post) => post.id === postId);
  }

  static updatePost(postId, caption, imageUrl) {
    const post = PostModel.getPostById(postId);

    if (!post) {
      return null;
    }

    if (caption !== undefined) {
      post.caption = caption;
    }

    if (imageUrl !== undefined) {
      post.imageUrl = imageUrl;
    }

    return post;
  }
  static updatePostStatus(postId, status) {
    const post = PostModel.getPostById(postId);

    if (!post) {
      return null;
    }

    post.status = status;

    return post;
  }

  static deletePost(postId) {
    const postIndex = posts.findIndex((post) => post.id === postId);

    if (postIndex === -1) {
      return null;
    }

    const [deletedPost] = posts.splice(postIndex, 1);

    return deletedPost;
  }
}

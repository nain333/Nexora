import { randomUUID } from "node:crypto";

const posts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    userId: "test-user-id",
    caption: "Seed post for API testing",
    imageUrl: "uploads/posts/test-image.jpg",
  },
];

export default class PostModel {
  constructor(userId, caption, imageUrl) {
    this.id = randomUUID();
    this.userId = userId;
    this.caption = caption;
    this.imageUrl = imageUrl;
  }

  static createPost(userId, caption, imageUrl) {
    const post = new PostModel(userId, caption, imageUrl);

    posts.push(post);

    return post;
  }

  static getAllPosts(caption, page = 1, limit = 10) {
    let filteredPosts = posts;

    if (caption) {
      const normalizedCaption = caption.trim().toLowerCase();

      filteredPosts = filteredPosts.filter((post) =>
        post.caption.toLowerCase().includes(normalizedCaption),
      );
    }

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);

    const startIndex = (page - 1) * limit;

    const paginatedPosts = filteredPosts.slice(
      startIndex,
      startIndex + limit,
    );

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

  static deletePost(postId) {
    const postIndex = posts.findIndex((post) => post.id === postId);

    if (postIndex === -1) {
      return null;
    }

    const [deletedPost] = posts.splice(postIndex, 1);

    return deletedPost;
  }
}
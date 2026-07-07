import { randomUUID } from "node:crypto";

const posts = [];

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

    static getAllPosts() {
        return posts;
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
        const postIndex = posts.findIndex(
            (post) => post.id === postId
        );

        if (postIndex === -1) {
            return null;
        }

        const [deletedPost] = posts.splice(postIndex, 1);

        return deletedPost;
    }
}
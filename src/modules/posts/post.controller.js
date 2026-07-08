import PostModel from "./post.model.js";

import ForbiddenError from "../../shared/errors/forbidden-error.js";
import NotFoundError from "../../shared/errors/not-found-error.js";

export default class PostController {
static getAllPosts(req, res) {
    const {
        caption,
        sort,
        page = 1,
        limit = 10,
    } = req.query;

    const result = PostModel.getAllPosts(
        caption,
        sort,
        page,
        limit,
    );

    return res.status(200).json({
        status: "success",
        data: result,
    });
}

    static getUserPosts(req, res) {
        const userId = req.user.userId;

        const posts = PostModel.getPostsByUserId(userId);

        return res.status(200).json({
            status: "success",
            data: {
                posts,
            },
        });
    }

    static getPostById(req, res) {
        const { id } = req.params;

        const post = PostModel.getPostById(id);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        return res.status(200).json({
            status: "success",
            data: {
                post,
            },
        });
    }

    static createPost(req, res) {
        const userId = req.user.userId;
        const { caption } = req.body;

        const imageUrl = req.file?.path;

        const post = PostModel.createPost(
            userId,
            caption,
            imageUrl
        );

        return res.status(201).json({
            status: "success",
            message: "Post created successfully",
            data: {
                post,
            },
        });
    }

    static updatePost(req, res) {
        const { id } = req.params;
        const { caption } = req.body;

        const post = PostModel.getPostById(id);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        if (post.userId !== req.user.userId) {
            throw new ForbiddenError(
                "You are not authorized to update this post"
            );
        }

        const imageUrl = req.file?.path;

        const updatedPost = PostModel.updatePost(
            id,
            caption,
            imageUrl
        );

        return res.status(200).json({
            status: "success",
            message: "Post updated successfully",
            data: {
                post: updatedPost,
            },
        });
    }
static updatePostStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const post = PostModel.getPostById(id);

    if (!post) {
        throw new NotFoundError("Post not found");
    }

    if (post.userId !== req.user.userId) {
        throw new ForbiddenError(
            "You are not authorized to update this post"
        );
    }

    const updatedPost = PostModel.updatePostStatus(id, status);

    return res.status(200).json({
        status: "success",
        message: "Post status updated successfully",
        data: {
            post: updatedPost,
        },
    });
}
    static deletePost(req, res) {
        const { id } = req.params;

        const post = PostModel.getPostById(id);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        if (post.userId !== req.user.userId) {
            throw new ForbiddenError(
                "You are not authorized to delete this post"
            );
        }

        PostModel.deletePost(id);

        return res.status(200).json({
            status: "success",
            message: "Post deleted successfully",
        });
    }
}
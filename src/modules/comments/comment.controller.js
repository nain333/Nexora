import CommentModel from "./comment.model.js";
import PostModel from "../posts/post.model.js";

import ForbiddenError from "../../shared/errors/forbidden-error.js";
import NotFoundError from "../../shared/errors/not-found-error.js";

export default class CommentController {
    static getComments(req, res) {
        const { id: postId } = req.params;

        const post = PostModel.getPostById(postId);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        const comments = CommentModel.getCommentsByPostId(postId);

        return res.status(200).json({
            status: "success",
            data: {
                comments,
            },
        });
    }

    static createComment(req, res) {
        const { id: postId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        const post = PostModel.getPostById(postId);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        const comment = CommentModel.createComment(
            userId,
            postId,
            content
        );

        return res.status(201).json({
            status: "success",
            message: "Comment created successfully",
            data: {
                comment,
            },
        });
    }

    static updateComment(req, res) {
        const { id: commentId } = req.params;
        const { content } = req.body;

        const comment = CommentModel.getCommentById(commentId);

        if (!comment) {
            throw new NotFoundError("Comment not found");
        }

        if (comment.userId !== req.user.userId) {
            throw new ForbiddenError(
                "You are not authorized to update this comment"
            );
        }

        const updatedComment = CommentModel.updateComment(
            commentId,
            content
        );

        return res.status(200).json({
            status: "success",
            message: "Comment updated successfully",
            data: {
                comment: updatedComment,
            },
        });
    }

    static deleteComment(req, res) {
        const { id: commentId } = req.params;

        const comment = CommentModel.getCommentById(commentId);

        if (!comment) {
            throw new NotFoundError("Comment not found");
        }

        if (comment.userId !== req.user.userId) {
            throw new ForbiddenError(
                "You are not authorized to delete this comment"
            );
        }

        CommentModel.deleteComment(commentId);

        return res.status(200).json({
            status: "success",
            message: "Comment deleted successfully",
        });
    }
}
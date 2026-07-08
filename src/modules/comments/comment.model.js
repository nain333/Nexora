import { randomUUID } from "node:crypto";

const comments = [];

export default class CommentModel {
    constructor(userId, postId, content) {
        this.id = randomUUID();
        this.userId = userId;
        this.postId = postId;
        this.content = content;
        this.createdAt = new Date();
    }

    static createComment(userId, postId, content) {
        const comment = new CommentModel(
            userId,
            postId,
            content
        );

        comments.push(comment);

        return comment;
    }

    static getCommentsByPostId(postId, page = 1, limit = 10) {
    const postComments = comments.filter(
        (comment) => comment.postId === postId
    );

    const totalComments = postComments.length;
    const totalPages = Math.ceil(totalComments / limit);

    const startIndex = (page - 1) * limit;

    const paginatedComments = postComments.slice(
        startIndex,
        startIndex + limit
    );

    return {
        comments: paginatedComments,
        pagination: {
            currentPage: page,
            limit,
            totalComments,
            totalPages,
        },
    };
}

    static getCommentById(commentId) {
        return comments.find(
            (comment) => comment.id === commentId
        );
    }

    static updateComment(commentId, content) {
        const comment = CommentModel.getCommentById(commentId);

        if (!comment) {
            return null;
        }

        comment.content = content;

        return comment;
    }

    static deleteComment(commentId) {
        const commentIndex = comments.findIndex(
            (comment) => comment.id === commentId
        );

        if (commentIndex === -1) {
            return null;
        }

        const [deletedComment] = comments.splice(commentIndex, 1);

        return deletedComment;
    }
}
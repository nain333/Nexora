import { randomUUID } from "node:crypto";

const likes = [];

export default class LikeModel {
    constructor(userId, postId) {
        this.id = randomUUID();
        this.userId = userId;
        this.postId = postId;
        this.createdAt = new Date();
    }

    static getLikesByPostId(postId) {
        return likes.filter((like) => like.postId === postId);
    }

    static getLikeByUserAndPost(userId, postId) {
        return likes.find(
            (like) =>
                like.userId === userId &&
                like.postId === postId
        );
    }

    static addLike(userId, postId) {
        const like = new LikeModel(userId, postId);

        likes.push(like);

        return like;
    }

    static removeLike(userId, postId) {
        const likeIndex = likes.findIndex(
            (like) =>
                like.userId === userId &&
                like.postId === postId
        );

        if (likeIndex === -1) {
            return null;
        }

        const [removedLike] = likes.splice(likeIndex, 1);

        return removedLike;
    }
}
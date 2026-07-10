import LikeModel from "./like.model.js";
import PostModel from "../posts/post.model.js";

import NotFoundError from "../../shared/errors/not-found-error.js";

export default class LikeController {
  static getLikes(req, res) {
    const { postId } = req.params;

    const post = PostModel.getPostById(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const likes = LikeModel.getLikesByPostId(postId);

    return res.status(200).json({
      status: "success",
      data: {
        likes,
      },
    });
  }

  static toggleLike(req, res) {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = PostModel.getPostById(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const existingLike = LikeModel.getLikeByUserAndPost(userId, postId);

    if (existingLike) {
      const removedLike = LikeModel.removeLike(userId, postId);

      return res.status(200).json({
        status: "success",
        message: "Like removed successfully",
        data: {
          like: removedLike,
        },
      });
    }

    const like = LikeModel.addLike(userId, postId);

    return res.status(201).json({
      status: "success",
      message: "Post liked successfully",
      data: {
        like,
      },
    });
  }
}

import BookmarkModel from "./bookmark.model.js";
import PostModel from "../posts/post.model.js";

import ConflictError from "../../shared/errors/conflict-error.js";
import NotFoundError from "../../shared/errors/not-found-error.js";

export default class BookmarkController {
  static getBookmarks(req, res) {
    const userId = req.user.userId;

    const bookmarks = BookmarkModel.getBookmarksByUserId(userId);

    return res.status(200).json({
      status: "success",
      data: {
        bookmarks,
      },
    });
  }

  static createBookmark(req, res) {
    const { id: postId } = req.params;
    const userId = req.user.userId;

    const post = PostModel.getPostById(postId);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const existingBookmark = BookmarkModel.getBookmarkByUserAndPost(
      userId,
      postId,
    );

    if (existingBookmark) {
      throw new ConflictError("Post is already bookmarked");
    }

    const bookmark = BookmarkModel.createBookmark(userId, postId);

    return res.status(201).json({
      status: "success",
      message: "Post bookmarked successfully",
      data: {
        bookmark,
      },
    });
  }

  static deleteBookmark(req, res) {
    const { id: postId } = req.params;
    const userId = req.user.userId;

    const bookmark = BookmarkModel.getBookmarkByUserAndPost(userId, postId);

    if (!bookmark) {
      throw new NotFoundError("Bookmark not found");
    }

    BookmarkModel.deleteBookmark(userId, postId);

    return res.status(200).json({
      status: "success",
      message: "Bookmark removed successfully",
    });
  }
}

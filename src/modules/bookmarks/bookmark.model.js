import { randomUUID } from "node:crypto";

const bookmarks = [];

export default class BookmarkModel {
  constructor(userId, postId) {
    this.id = randomUUID();
    this.userId = userId;
    this.postId = postId;
    this.createdAt = new Date();
  }

  static createBookmark(userId, postId) {
    const bookmark = new BookmarkModel(userId, postId);

    bookmarks.push(bookmark);

    return bookmark;
  }

  static getBookmarksByUserId(userId) {
    return bookmarks.filter((bookmark) => bookmark.userId === userId);
  }

  static getBookmarkByUserAndPost(userId, postId) {
    return bookmarks.find(
      (bookmark) => bookmark.userId === userId && bookmark.postId === postId,
    );
  }

  static deleteBookmark(userId, postId) {
    const bookmarkIndex = bookmarks.findIndex(
      (bookmark) => bookmark.userId === userId && bookmark.postId === postId,
    );

    if (bookmarkIndex === -1) {
      return null;
    }

    const [deletedBookmark] = bookmarks.splice(bookmarkIndex, 1);

    return deletedBookmark;
  }
}

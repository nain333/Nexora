import { apiRequest } from "./client.js";

function getLikes(postId) {
  return apiRequest(`/api/likes/${postId}`);
}

function toggleLike(postId) {
  return apiRequest(`/api/likes/toggle/${postId}`);
}

function getBookmarks() {
  return apiRequest("/api/bookmarks");
}

function createBookmark(postId) {
  return apiRequest(`/api/bookmarks/${postId}`, {
    method: "POST",
  });
}

function deleteBookmark(postId) {
  return apiRequest(`/api/bookmarks/${postId}`, {
    method: "DELETE",
  });
}

export {
  getLikes,
  toggleLike,
  getBookmarks,
  createBookmark,
  deleteBookmark,
};
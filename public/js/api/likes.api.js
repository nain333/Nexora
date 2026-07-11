import { apiRequest } from "./client.js";

function getPostLikes(postId) {
  return apiRequest(`/api/likes/${postId}`);
}

function togglePostLike(postId) {
  return apiRequest(`/api/likes/toggle/${postId}`);
}

export { getPostLikes, togglePostLike };
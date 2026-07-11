import { apiRequest } from "./client.js";

function getAllPosts(query = "") {
  return apiRequest(`/api/posts/all${query}`);
}

function getUserPosts() {
  return apiRequest("/api/posts/");
}

function getPostById(postId) {
  return apiRequest(`/api/posts/${postId}`);
}

function createPost(formData) {
  return apiRequest("/api/posts/", {
    method: "POST",
    body: formData,
  });
}

function updatePost(postId, formData) {
  return apiRequest(`/api/posts/${postId}`, {
    method: "PUT",
    body: formData,
  });
}

function updatePostStatus(postId, status) {
  return apiRequest(`/api/posts/${postId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

function deletePost(postId) {
  return apiRequest(`/api/posts/${postId}`, {
    method: "DELETE",
  });
}

export {
  getAllPosts,
  getUserPosts,
  getPostById,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
};
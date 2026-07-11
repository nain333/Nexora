import { apiRequest } from "./client.js";

function getComments(postId) {
  return apiRequest(`/api/comments/${postId}`);
}

function createComment(postId, content) {
  return apiRequest(`/api/comments/${postId}`, {
    method: "POST",
    body: { content },
  });
}

function updateComment(commentId, content) {
  return apiRequest(`/api/comments/${commentId}`, {
    method: "PUT",
    body: { content },
  });
}

function deleteComment(commentId) {
  return apiRequest(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
}

export {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
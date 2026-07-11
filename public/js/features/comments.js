import {
  createComment,
  getComments,
} from "../api/comments.api.js";
import { showToast } from "../ui/toast.js";

function updateCommentButton(commentButton, totalComments) {
  const commentCount = commentButton.querySelector(
    "[data-comment-count]",
  );

  if (!commentCount) {
    return;
  }

  commentCount.textContent =
    totalComments > 0 ? String(totalComments) : "";
}

function createCommentElement(comment) {
  const commentElement = document.createElement("article");

  commentElement.className = "comment";
  commentElement.dataset.commentId = comment.id;

  const content = document.createElement("p");

  content.className = "comment__content";
  content.textContent = comment.content;

  const metadata = document.createElement("div");

  metadata.className = "comment__metadata";

  const createdAt = document.createElement("time");

  createdAt.className = "comment__date";
  createdAt.dateTime = comment.createdAt;
  createdAt.textContent = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(comment.createdAt));

  metadata.append(createdAt);
  commentElement.append(content, metadata);

  return commentElement;
}

function renderComments(commentsContainer, comments) {
  commentsContainer.replaceChildren();

  if (!comments.length) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "comments__empty";
    emptyMessage.textContent = "No comments yet.";

    commentsContainer.append(emptyMessage);

    return;
  }

  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    fragment.append(createCommentElement(comment));
  });

  commentsContainer.append(fragment);
}

async function loadPostComments(postCard) {
  const { postId } = postCard.dataset;

  const commentButton = postCard.querySelector(
    '[data-action="comment"]',
  );

  const commentsContainer = postCard.querySelector(
    "[data-comments-list]",
  );

  if (!commentButton || !commentsContainer) {
    return;
  }

  try {
    const response = await getComments(postId);

    const comments = response.data?.comments ?? [];
    const totalComments =
      response.data?.pagination?.totalComments ?? comments.length;

    renderComments(commentsContainer, comments);
    updateCommentButton(commentButton, totalComments);
  } catch (error) {
    if (!error.isAuthError) {
      showToast(error.message, "error");
    }
  }
}

async function togglePostComments(postCard) {
  const commentsSection = postCard.querySelector(
    "[data-comments-section]",
  );

  if (!commentsSection) {
    return;
  }

  if (!commentsSection.hidden) {
    commentsSection.hidden = true;
    return;
  }

  commentsSection.hidden = false;

  await loadPostComments(postCard);
}

async function handleCommentSubmit(event, postCard) {
  event.preventDefault();

  const form = event.target;

  if (!form.matches("[data-comment-form]")) {
    return;
  }

  const { postId } = postCard.dataset;

  const formData = new FormData(form);
  const content = formData.get("content")?.trim();

  if (!content) {
    showToast("Comment content is required.", "error");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  try {
    submitButton.disabled = true;

    await createComment(postId, content);

    form.reset();

    await loadPostComments(postCard);

    showToast("Comment posted successfully.", "success");
  } catch (error) {
    if (!error.isAuthError) {
      showToast(error.message, "error");
    }
  } finally {
    submitButton.disabled = false;
  }
}

export {
  handleCommentSubmit,
  loadPostComments,
  togglePostComments,
  updateCommentButton,
};
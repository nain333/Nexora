import { deletePost, getAllPosts } from "../api/posts.api.js";
import { getPostLikes, togglePostLike } from "../api/likes.api.js";
import { API_BASE_URL } from "../config.js";
import { getCurrentUserId } from "../services/token.service.js";
import { showConfirmDialog } from "../ui/confirm-dialog.js";
import { showToast } from "../ui/toast.js";

const postsContainer = document.querySelector("#posts-container");
const feedStatus = document.querySelector("#feed-status");
const refreshFeedButton = document.querySelector("#refresh-feed-button");

function setFeedStatus(message) {
  if (!feedStatus) {
    return;
  }

  feedStatus.textContent = message;
  feedStatus.hidden = !message;
}

function clearPosts() {
  postsContainer.replaceChildren();
}

function updateLikeButton(likeButton, likes) {
  const currentUserId = getCurrentUserId();

  const isLiked = likes.some((like) => like.userId === currentUserId);

  const likeCount = likeButton.querySelector("[data-like-count]");
  const likeIconPath = likeButton.querySelector(".post-card__action-icon path");

  likeCount.textContent = likes.length > 0 ? String(likes.length) : "";

  likeButton.classList.toggle("post-card__action--liked", isLiked);
  likeButton.setAttribute("aria-pressed", String(isLiked));

  likeIconPath.setAttribute("fill", isLiked ? "currentColor" : "none");
}

async function loadPostLikes(postCard) {
  const { postId } = postCard.dataset;
  const likeButton = postCard.querySelector('[data-action="like"]');

  if (!likeButton) {
    return;
  }

  try {
    const response = await getPostLikes(postId);
    const likes = response.data?.likes ?? [];

    updateLikeButton(likeButton, likes);
  } catch (error) {
    if (!error.isAuthError) {
      showToast(error.message, "error");
    }
  }
}

function createPostElement(post) {
  const article = document.createElement("article");

  article.className = "post-card";
  article.dataset.postId = post.id;

  const header = document.createElement("header");
  header.className = "post-card__header";

  const status = document.createElement("span");

  status.className = "post-card__status";
  status.textContent = post.status || "published";

  const createdAt = document.createElement("time");

  createdAt.className = "post-card__date";
  createdAt.dateTime = post.createdAt;
  createdAt.textContent = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(post.createdAt));

  header.append(status, createdAt);

  const body = document.createElement("div");

  body.className = "post-card__body";

  if (post.caption) {
    const caption = document.createElement("p");

    caption.className = "post-card__caption";
    caption.textContent = post.caption;

    body.append(caption);
  }

  if (post.imageUrl) {
    const media = document.createElement("div");

    media.className = "post-card__media";

    const image = document.createElement("img");

    image.className = "post-card__image";
    image.src = `${API_BASE_URL}/${post.imageUrl}`;
    image.alt = post.caption || "Post image";
    image.loading = "lazy";

    media.append(image);
    body.append(media);
  }

  article.append(header, body);

  const actions = document.createElement("div");

  actions.className = "post-card__actions";

  const likeButton = document.createElement("button");

  likeButton.className = "post-card__action";
  likeButton.type = "button";
  likeButton.dataset.action = "like";
  likeButton.setAttribute("aria-label", "Like post");
  likeButton.setAttribute("aria-pressed", "false");

  likeButton.innerHTML = `
    <svg
      class="post-card__action-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <span
      class="post-card__action-count"
      data-like-count
    ></span>
  `;

  const commentButton = document.createElement("button");

  commentButton.className = "post-card__action";
  commentButton.type = "button";
  commentButton.dataset.action = "comment";
  commentButton.setAttribute("aria-label", "View comments");

  commentButton.innerHTML = `
    <svg
      class="post-card__action-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <span class="post-card__action-label">Comment</span>
  `;

  const deleteButton = document.createElement("button");

  deleteButton.className = "post-card__action post-card__action--danger";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", "Delete post");

  deleteButton.innerHTML = `
    <svg
      class="post-card__action-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <span class="post-card__action-label">Delete</span>
  `;

  actions.append(likeButton, commentButton, deleteButton);
  article.append(actions);

  return article;
}

function renderPosts(posts) {
  clearPosts();

  if (!posts.length) {
    setFeedStatus("No posts yet.");
    return;
  }

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    fragment.append(createPostElement(post));
  });

  postsContainer.append(fragment);
  setFeedStatus("");

  const postCards = postsContainer.querySelectorAll(".post-card");

  postCards.forEach((postCard) => {
    loadPostLikes(postCard);
  });
}

async function loadFeed() {
  setFeedStatus("Loading posts...");

  try {
    const response = await getAllPosts();
    const posts = response.data?.posts ?? [];

    renderPosts(posts);
  } catch (error) {
    clearPosts();

    if (error.isAuthError) {
      return;
    }

    setFeedStatus("Unable to load posts.");
    showToast(error.message, "error");
  }
}

async function handlePostAction(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const postCard = actionButton.closest(".post-card");

  if (!postCard) {
    return;
  }

  const { postId } = postCard.dataset;
  const { action } = actionButton.dataset;

  if (action === "like") {
    try {
      actionButton.disabled = true;

      await togglePostLike(postId);

      const response = await getPostLikes(postId);
      const likes = response.data?.likes ?? [];

      updateLikeButton(actionButton, likes);
    } catch (error) {
      if (!error.isAuthError) {
        showToast(error.message, "error");
      }
    } finally {
      actionButton.disabled = false;
    }

    return;
  }

  if (action !== "delete") {
    return;
  }

  const confirmed = await showConfirmDialog({
    title: "Delete post?",
    message:
      "This post will be permanently deleted. This action cannot be undone.",
    confirmLabel: "Delete post",
    trigger: actionButton,
  });

  if (!confirmed) {
    return;
  }

  try {
    actionButton.disabled = true;

    await deletePost(postId);

    showToast("Post deleted successfully.", "success");

    await loadFeed();
  } catch (error) {
    actionButton.disabled = false;

    if (!error.isAuthError) {
      showToast(error.message, "error");
    }
  }
}

function initializeFeed() {
  refreshFeedButton?.addEventListener("click", loadFeed);
  postsContainer?.addEventListener("click", handlePostAction);

  document.addEventListener("auth:signin", loadFeed);

  document.addEventListener("auth:logout", () => {
    clearPosts();
    setFeedStatus("");
  });

  document.addEventListener("post:created", loadFeed);
}

export { initializeFeed, loadFeed };

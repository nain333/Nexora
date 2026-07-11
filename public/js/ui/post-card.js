function formatPostDate(dateString) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function createActionButton(label, action, postId) {
  const button = document.createElement("button");

  button.className = "post-card__action";
  button.type = "button";
  button.dataset.action = action;
  button.dataset.postId = postId;
  button.textContent = label;

  return button;
}

function createPostCard(post) {
  const article = document.createElement("article");

  article.className = "post-card";
  article.dataset.postId = post.id;

  const header = document.createElement("header");
  header.className = "post-card__header";

  const author = document.createElement("span");
  author.className = "post-card__author";
  author.textContent = "Nexora user";

  const date = document.createElement("time");
  date.className = "post-card__date";
  date.dateTime = post.createdAt;
  date.textContent = formatPostDate(post.createdAt);

  header.append(author, date);

  const body = document.createElement("div");
  body.className = "post-card__body";

  if (post.caption) {
    const caption = document.createElement("p");

    caption.className = "post-card__caption";
    caption.textContent = post.caption;

    body.append(caption);
  }

  if (post.imageUrl) {
    const image = document.createElement("img");

    image.className = "post-card__image";
    image.src = post.imageUrl;
    image.alt = "";
    image.loading = "lazy";

    body.append(image);
  }

  const actions = document.createElement("div");
  actions.className = "post-card__actions";

  actions.append(
    createActionButton("Like", "like", post.id),
    createActionButton("Comment", "comments", post.id),
    createActionButton("Bookmark", "bookmark", post.id),
  );

  const commentsContainer = document.createElement("section");

  commentsContainer.className = "post-card__comments";
  commentsContainer.dataset.commentsFor = post.id;
  commentsContainer.hidden = true;

  article.append(header, body, actions, commentsContainer);

  return article;
}

function renderPostCards(container, posts) {
  container.replaceChildren();

  if (!posts.length) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "posts-container__empty";
    emptyMessage.textContent = "No posts to display.";

    container.append(emptyMessage);

    return;
  }

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    fragment.append(createPostCard(post));
  });

  container.append(fragment);
}

export { createPostCard, renderPostCards };
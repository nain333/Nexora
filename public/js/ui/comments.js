function formatCommentDate(dateString) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function createCommentElement(comment) {
  const commentElement = document.createElement("article");

  commentElement.className = "comment";
  commentElement.dataset.commentId = comment.id;

  const content = document.createElement("p");

  content.className = "comment__content";
  content.textContent = comment.content;

  const date = document.createElement("time");

  date.className = "comment__date";
  date.dateTime = comment.createdAt;
  date.textContent = formatCommentDate(comment.createdAt);

  commentElement.append(content, date);

  return commentElement;
}

function renderComments(container, comments) {
  container.replaceChildren();

  if (!comments.length) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "comments__empty";
    emptyMessage.textContent = "No comments yet. Start the conversation.";

    container.append(emptyMessage);

    return;
  }

  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    fragment.append(createCommentElement(comment));
  });

  container.append(fragment);
}

export { createCommentElement, renderComments };
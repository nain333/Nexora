import { createPost } from "../api/posts.api.js";
import { showToast } from "../ui/toast.js";

const composerForm = document.querySelector("#create-post-form");
const captionInput = document.querySelector("#post-caption");
const imageInput = document.querySelector("#post-image");
const publishButton = document.querySelector("#create-post-button");
async function handlePostCreation(event) {
  event.preventDefault();

  const caption = captionInput.value.trim();
  const image = imageInput.files[0];

  const formData = new FormData();

  if (caption) {
    formData.append("caption", caption);
  }

  if (image) {
    formData.append("image", image);
  }

  try {
    publishButton.disabled = true;
    publishButton.textContent = "Publishing...";

    await createPost(formData);

    composerForm.reset();

    showToast("Post published successfully.", "success");

    document.dispatchEvent(new CustomEvent("post:created"));
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = "Publish";
  }
}

function initializeComposer() {
  composerForm.addEventListener("submit", handlePostCreation);
}

export { initializeComposer };
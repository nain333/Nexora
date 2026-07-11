const toastContainer = document.querySelector("#toast-container");

const DEFAULT_DURATION = 4000;
const VALID_TYPES = new Set(["success", "warning", "error", "info"]);

function removeToast(toast) {
  toast.remove();
}

function showToast(message, type = "info", duration = DEFAULT_DURATION) {
  const toastType = VALID_TYPES.has(type) ? type : "info";

  const toast = document.createElement("div");

  toast.className = `toast toast--${toastType}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.textContent = message;

  toastContainer.append(toast);

  const timeoutId = window.setTimeout(() => {
    removeToast(toast);
  }, duration);

  toast.addEventListener(
    "click",
    () => {
      window.clearTimeout(timeoutId);
      removeToast(toast);
    },
    { once: true },
  );

  return toast;
}

function clearToasts() {
  toastContainer.replaceChildren();
}

export { showToast, clearToasts };
const loadingOverlay = document.querySelector("#loading-overlay");

function showLoading() {
  loadingOverlay.hidden = false;
  loadingOverlay.setAttribute("aria-hidden", "false");
}

function hideLoading() {
  loadingOverlay.hidden = true;
  loadingOverlay.setAttribute("aria-hidden", "true");
}

export { showLoading, hideLoading };
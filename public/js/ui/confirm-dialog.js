const confirmDialog = document.querySelector("#confirm-dialog");
const confirmDialogTitle = document.querySelector("#confirm-dialog-title");
const confirmDialogMessage = document.querySelector(
  "#confirm-dialog-message",
);
const confirmDialogCancelButton = document.querySelector(
  "#confirm-dialog-cancel",
);
const confirmDialogConfirmButton = document.querySelector(
  "#confirm-dialog-confirm",
);

let resolveConfirmation = null;
let triggerElement = null;

function closeConfirmDialog(confirmed) {
  if (!confirmDialog || !resolveConfirmation) {
    return;
  }

  confirmDialog.close();

  const resolve = resolveConfirmation;
  const elementToRestoreFocus = triggerElement;

  resolveConfirmation = null;
  triggerElement = null;

  resolve(confirmed);
  elementToRestoreFocus?.focus();
}

function handleCancel() {
  closeConfirmDialog(false);
}

function handleConfirm() {
  closeConfirmDialog(true);
}

function handleDialogCancel(event) {
  event.preventDefault();
  closeConfirmDialog(false);
}

function handleBackdropClick(event) {
  if (event.target === confirmDialog) {
    closeConfirmDialog(false);
  }
}

function initializeConfirmDialog() {
  if (
    !confirmDialog ||
    !confirmDialogCancelButton ||
    !confirmDialogConfirmButton
  ) {
    return;
  }

  confirmDialogCancelButton.addEventListener("click", handleCancel);
  confirmDialogConfirmButton.addEventListener("click", handleConfirm);
  confirmDialog.addEventListener("cancel", handleDialogCancel);
  confirmDialog.addEventListener("click", handleBackdropClick);
}

function showConfirmDialog({
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  trigger = null,
} = {}) {
  if (
    !confirmDialog ||
    !confirmDialogTitle ||
    !confirmDialogMessage ||
    !confirmDialogConfirmButton
  ) {
    return Promise.resolve(false);
  }

  if (resolveConfirmation) {
    return Promise.resolve(false);
  }

  confirmDialogTitle.textContent = title;
  confirmDialogMessage.textContent = message;
  confirmDialogConfirmButton.textContent = confirmLabel;

  triggerElement = trigger;

  return new Promise((resolve) => {
    resolveConfirmation = resolve;
    confirmDialog.showModal();
    confirmDialogCancelButton?.focus();
  });
}

export { initializeConfirmDialog, showConfirmDialog };
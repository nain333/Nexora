import { initializeAuth } from "./features/auth.js";
import { initializeComposer } from "./features/composer.js";
import { initializeFeed, loadFeed } from "./features/feed.js";
import { hasToken } from "./services/token.service.js";
import { initializeConfirmDialog } from "./ui/confirm-dialog.js";

function initializeApp() {
  initializeConfirmDialog();

  initializeAuth();
  initializeFeed();
  initializeComposer();

  if (hasToken()) {
    loadFeed();
  }
}

initializeApp();
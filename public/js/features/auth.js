import { signIn, signUp } from "../api/auth.api.js";
import { hasToken, removeToken, setToken } from "../services/token.service.js";
import {
  clearFormErrors,
  initializeFormErrorClearing,
  showFormErrors,
} from "../ui/form-errors.js";
import { hideLoading, showLoading } from "../ui/loading.js";
import { showToast } from "../ui/toast.js";

const authView = document.querySelector("#auth-view");
const feedView = document.querySelector("#feed-view");

const signinTab = document.querySelector("#signin-tab");
const signupTab = document.querySelector("#signup-tab");

const signinForm = document.querySelector("#signin-form");
const signupForm = document.querySelector("#signup-form");

const authHeading = document.querySelector("#auth-heading");
const authDescription = document.querySelector("#auth-description");

const authenticatedUser = document.querySelector("#authenticated-user");
const authenticatedUserName = document.querySelector(
  "#authenticated-user-name",
);

const logoutButton = document.querySelector("#logout-button");

function setActiveTab(activeTab) {
  const isSignin = activeTab === "signin";

  signinTab.classList.toggle("auth-tab--active", isSignin);
  signupTab.classList.toggle("auth-tab--active", !isSignin);

  signinTab.setAttribute("aria-selected", String(isSignin));
  signupTab.setAttribute("aria-selected", String(!isSignin));

  clearFormErrors(signinForm);
  clearFormErrors(signupForm);

  signinForm.hidden = !isSignin;
  signupForm.hidden = isSignin;

  authHeading.textContent = isSignin ? "Welcome back" : "Create your account";

  authDescription.textContent = isSignin
    ? "Sign in to continue to Nexora."
    : "Join Nexora and start sharing with the community.";
}

function showAuthenticatedView() {
  authView.hidden = true;
  feedView.hidden = false;
  authenticatedUser.hidden = false;
}

function showUnauthenticatedView() {
  authView.hidden = false;
  feedView.hidden = true;
  authenticatedUser.hidden = true;
  authenticatedUserName.textContent = "";
}

function handleRequestError(form, error) {
  const errors = error.data?.errors;
  const hasFieldErrors = showFormErrors(form, errors);

  if (hasFieldErrors) {
    const firstInvalidField = form.querySelector(".form-input--invalid");

    firstInvalidField?.focus();
    return;
  }

  showToast(error.message, "error");
}

async function handleSignin(event) {
  event.preventDefault();

  clearFormErrors(signinForm);

  const formData = new FormData(signinForm);

  const credentials = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    showLoading();

    const response = await signIn(credentials);
    const accessToken = response.data.accessToken;

    setToken(accessToken);

    signinForm.reset();
    showAuthenticatedView();
    showToast("Signed in successfully.", "success");

    document.dispatchEvent(new CustomEvent("auth:signin"));
  } catch (error) {
    handleRequestError(signinForm, error);
  } finally {
    hideLoading();
  }
}

async function handleSignup(event) {
  event.preventDefault();

  clearFormErrors(signupForm);

  const formData = new FormData(signupForm);

  const userData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    showLoading();

    await signUp(userData);

    signupForm.reset();
    setActiveTab("signin");

    showToast("Account created successfully. Sign in to continue.", "success");
  } catch (error) {
    handleRequestError(signupForm, error);
  } finally {
    hideLoading();
  }
}

function handleLogout() {
  removeToken();

  showUnauthenticatedView();
  setActiveTab("signin");

  showToast("Signed out successfully.", "info");

  document.dispatchEvent(new CustomEvent("auth:logout"));
}
function handleUnauthorized() {
  removeToken();

  showUnauthenticatedView();
  setActiveTab("signin");

  showToast("Your session has expired. Please sign in again.", "warning");

  document.dispatchEvent(new CustomEvent("auth:logout"));
}

function initializeAuth() {
  signinTab.addEventListener("click", () => {
    setActiveTab("signin");
  });

  signupTab.addEventListener("click", () => {
    setActiveTab("signup");
  });

  signinForm.addEventListener("submit", handleSignin);
  signupForm.addEventListener("submit", handleSignup);
  logoutButton.addEventListener("click", handleLogout);
  

  document.addEventListener("auth:unauthorized", handleUnauthorized);

  initializeFormErrorClearing(signinForm);
  initializeFormErrorClearing(signupForm);

  if (hasToken()) {
    showAuthenticatedView();
    return;
  }

  showUnauthenticatedView();
}

export { initializeAuth };

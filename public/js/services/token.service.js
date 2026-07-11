import { TOKEN_STORAGE_KEY } from "../config.js";

function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function hasToken() {
  return Boolean(getToken());
}

function getTokenPayload() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decodedPayload = decodeURIComponent(
      atob(normalizedPayload)
        .split("")
        .map((character) => {
          return `%${character
            .charCodeAt(0)
            .toString(16)
            .padStart(2, "0")}`;
        })
        .join(""),
    );

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

function getCurrentUserId() {
  return getTokenPayload()?.userId ?? null;
}

export {
  getToken,
  setToken,
  removeToken,
  hasToken,
  getCurrentUserId,
};
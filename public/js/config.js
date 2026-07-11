const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? ""
    : "https://nexora-q31k.onrender.com";

const TOKEN_STORAGE_KEY = "nexora_access_token";

export { API_BASE_URL, TOKEN_STORAGE_KEY };

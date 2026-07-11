import { API_BASE_URL } from "../config.js";
import { getToken, removeToken } from "../services/token.service.js";

function createHeaders(customHeaders, hasBody) {
  const headers = new Headers(customHeaders);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  return response.json();
}

function getErrorMessage(data) {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((error) => error.message).join(" ");
  }

  return data?.message || "Request failed";
}

async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    headers: customHeaders,
    signal,
  } = {},
) {
  const isFormData = body instanceof FormData;
  const hasBody = body !== undefined && body !== null;

  const headers = createHeaders(customHeaders, hasBody && !isFormData);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData || typeof body === "string" ? body : JSON.stringify(body),
    signal,
  });

  const data = await parseResponse(response);

  if (response.status === 401) {
    removeToken();

    document.dispatchEvent(
      new CustomEvent("auth:unauthorized"),
    );
  }

  if (!response.ok) {
    const error = new Error(getErrorMessage(data));

    error.status = response.status;
    error.data = data;
    error.isAuthError = response.status === 401;

    throw error;
  }

  return data;
}

export { apiRequest };
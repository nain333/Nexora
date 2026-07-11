import { apiRequest } from "./client.js";

function signUp(userData) {
  return apiRequest("/api/signup", {
    method: "POST",
    body: userData,
  });
}

function signIn(credentials) {
  return apiRequest("/api/signin", {
    method: "POST",
    body: credentials,
  });
}

export { signUp, signIn };
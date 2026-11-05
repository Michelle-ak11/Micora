import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// An expired or deactivated session: clear it and go to Login.
// Auth calls are skipped, because a 401 there just means wrong credentials.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem("token");
    const isAuthCall = error.config?.url?.startsWith("/api/auth/");

    if (error.response?.status === 401 && hadToken && !isAuthCall) {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function saveSession(login) {
  localStorage.setItem("token", login.token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: login.id,
      username: login.username,
      email: login.email,
      role: login.role,
    })
  );
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Turns an axios error into text a page can show
export function errorMessage(error) {
  if (error.response) {
    return error.response.data?.message || `Something went wrong (${error.response.status})`;
  }
  return "Can't reach the server. Check your connection and try again.";
}

export default api;
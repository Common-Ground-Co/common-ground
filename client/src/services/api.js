// Shared API helper: uses a Render API base URL in production and falls back to same-origin in development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function apiPath(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

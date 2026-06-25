import { apiPath } from "./api.js";

export async function adminFetchStudios() {
  const response = await fetch(apiPath("/api/admin/studios"));
  if (!response.ok) throw new Error(`Failed to fetch studios: ${response.status}`);
  return response.json();
}

export async function adminCreateStudio(payload) {
  const response = await fetch(apiPath("/api/admin/studios"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Failed to create studio: ${response.status}`);
  }
  return response.json();
}

export async function adminUpdateStudio(id, payload) {
  const response = await fetch(apiPath(`/api/admin/studios/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Failed to update studio: ${response.status}`);
  }
  return response.json();
}

export async function adminDeleteStudio(id) {
  const response = await fetch(apiPath(`/api/admin/studios/${id}`), {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Failed to delete studio: ${response.status}`);
  return response.json();
}

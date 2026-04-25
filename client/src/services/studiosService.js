// Studios API service: centralizes fetch calls for studio data.
import { apiPath } from "./api.js";

export async function fetchStudios() {
  const response = await fetch(apiPath("/api/studios"));

  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch studios: ${response.status}`);
  }

  return response.json();
}

export async function fetchStudioById(id) {
  const response = await fetch(apiPath(`/api/studios/${id}`));

  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch studio: ${response.status}`);
  }

  return response.json();
}

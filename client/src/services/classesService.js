// Classes API service: centralizes fetch calls for class schedule data.
import { apiPath } from "./api.js";

export async function fetchClasses() {
  const response = await fetch(apiPath("/api/classes"));
  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch classes: ${response.status}`);
  }
  return response.json();
}

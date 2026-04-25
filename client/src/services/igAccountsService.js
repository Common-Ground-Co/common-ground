// IG Accounts API service: centralizes fetch calls for IG account data.
import { apiPath } from "./api.js";

export async function fetchIgAccounts() {
  const response = await fetch(apiPath("/api/ig-accounts"));
  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch IG accounts: ${response.status}`);
  }
  return response.json();
}

export async function fetchIgAccountById(id) {
  const response = await fetch(apiPath(`/api/ig-accounts/${id}`));
  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch IG account: ${response.status}`);
  }
  return response.json();
}

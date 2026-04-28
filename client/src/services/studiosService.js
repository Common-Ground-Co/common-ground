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

function getOrCreateReviewToken() {
  const existing = localStorage.getItem("commonGroundReviewToken");
  if (existing) return existing;

  const newToken =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem("commonGroundReviewToken", newToken);
  return newToken;
}

export async function fetchReviewsByStudio(studioId) {
  const token = getOrCreateReviewToken();
  const response = await fetch(apiPath(`/api/reviews?studio_id=${studioId}`), {
    headers: {
      "x-review-token": token,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.status}`);
  }

  return response.json();
}

export async function createStudioReview({ studioId, name, rating, description }) {
  const token = getOrCreateReviewToken();
  const response = await fetch(apiPath("/api/reviews"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      studio_id: Number(studioId),
      name: name?.trim() || "Anonymous",
      email: token,
      rating: Number(rating),
      description: description.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create review: ${response.status}`);
  }

  return response.json();
}

export async function deleteStudioReview(reviewId) {
  const token = getOrCreateReviewToken();
  const response = await fetch(apiPath(`/api/reviews/${reviewId}`), {
    method: "DELETE",
    headers: {
      "x-review-token": token,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.status}`);
  }

  return response.json();
}

export async function updateStudioReview(reviewId, { name, rating, description }) {
  const token = getOrCreateReviewToken();
  const response = await fetch(apiPath(`/api/reviews/${reviewId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-review-token": token,
    },
    body: JSON.stringify({
      name: name?.trim() || "Anonymous",
      rating: Number(rating),
      description: description.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update review: ${response.status}`);
  }

  return response.json();
}

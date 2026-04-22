// Studios API service: centralizes fetch calls for studio data.
export async function fetchStudios() {
  const response = await fetch("/api/studios");

  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch studios: ${response.status}`);
  }

  return response.json();
}

export async function fetchStudioById(id) {
  const response = await fetch(`/api/studios/${id}`);

  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch studio: ${response.status}`);
  }

  return response.json();
}

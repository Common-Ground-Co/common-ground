// Classes API service: centralizes fetch calls for class schedule data.

export async function fetchClasses() {
  const response = await fetch("/api/classes");
  // Throwing here lets pages handle loading/error UI in one place.
  if (!response.ok) {
    throw new Error(`Failed to fetch classes: ${response.status}`);
  }
  return response.json();
}

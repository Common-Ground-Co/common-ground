function PlaceholderPage({ title, description }) {
  return (
    // Temporary page content for sections that are not built yet.
    <main className="placeholder-page">
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  );
}

export default PlaceholderPage;

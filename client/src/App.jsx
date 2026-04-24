// Root app component: defines shared layout and route-to-page mapping.
import { Route, Routes } from "react-router-dom";
import StudiosPage from "./pages/StudiosPage.jsx";
import StudioDetailPage from "./pages/StudioDetailPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ClassSchedulePage from "./pages/ClassSchedulePage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";

function App() {
  return (
    <>
      {/* Map each URL path to the page component users should see. */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/studios" element={<StudiosPage />} />
        <Route path="/studios/:id" element={<StudioDetailPage />} />
        <Route path="/class-schedule" element={<ClassSchedulePage />} />
        <Route
          path="/ig-class-radar"
          element={
            <PlaceholderPage
              title="IG Class Radar"
              description="Instagram class discovery is coming soon."
            />
          }
        />
        <Route
          path="/add-studio"
          element={
            <PlaceholderPage
              title="Add Studio"
              description="Studio submissions will open soon."
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;

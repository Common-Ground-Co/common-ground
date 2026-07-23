// Class schedule page: lists upcoming classes grouped by date, filterable by day, skill level, and studio.
import { useEffect, useMemo, useState } from "react";
import * as chrono from "chrono-node";
import Navigation from "../components/Navigation.jsx";
import { fetchClasses } from "../services/classesService.js";
import "../css/ClassSchedulePage.css";

const DAYS = [
  "All",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "Open"];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=120&q=80";

function normalizeClassDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function parseClassDate(value) {
  const normalized = normalizeClassDate(value);
  if (!normalized) return null;
  // Anchor at noon so parsing never crosses into the adjacent day near DST boundaries.
  const parsed = chrono.parseDate(`${normalized} 12:00 PM`);
  return parsed || null;
}

function formatClassDate(value) {
  const parsed = parseClassDate(value);
  if (!parsed) return "Date TBD";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDayLabelFromDate(value, fallbackDay) {
  const parsed = parseClassDate(value);
  if (!parsed) return fallbackDay || "Unknown";
  return parsed.toLocaleDateString("en-US", { weekday: "long" });
}

function formatStartTime(value) {
  if (!value) {
    return "TBD";
  }
  // Anchor to a fixed date so chrono can reliably parse the bare HH:MM:SS string.
  const parsed = chrono.parseDate(`2000-01-01T${value}`);
  if (!parsed) {
    return String(value);
  }
  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSkillLevelClass(level) {
  const normalized = String(level || "").toLowerCase();
  if (normalized.includes("begin")) return "skill-pill skill-pill--beg";
  if (normalized.includes("inter")) return "skill-pill skill-pill--int";
  if (normalized.includes("adv")) return "skill-pill skill-pill--adv";
  return "skill-pill";
}

function matchesDay(item, selectedDay) {
  if (selectedDay === "All") return true;
  const dayOfWeek = getDayLabelFromDate(item.class_date, item.day_of_week);
  return dayOfWeek === selectedDay;
}

function matchesLevel(skillLevel, selectedLevel) {
  if (selectedLevel === "All") return true;
  const normalized = String(skillLevel || "").toLowerCase();
  const levelLower = selectedLevel.toLowerCase();
  if (levelLower === "beginner") return normalized.includes("begin");
  if (levelLower === "intermediate") return normalized.includes("inter");
  if (levelLower === "advanced") return normalized.includes("adv");
  if (levelLower === "open") return normalized === "open" || !skillLevel;
  return false;
}

function matchesStudio(item, selectedStudio) {
  if (selectedStudio === "All") return true;
  return item.studio_name === selectedStudio;
}

function ClassSchedulePage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedStudio, setSelectedStudio] = useState("All");

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const data = await fetchClasses();
        setClasses(data);
      } catch (err) {
        setError(err.message || "Unable to load class schedule");
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  // Derived from live data so this list auto-updates when a studio is added.
  const studioNames = [
    "All",
    ...new Set(classes.map((c) => c.studio_name).filter(Boolean)),
  ].sort();

  // Memoized so re-filtering only reruns when classes or the selected filters change.
  const visibleClasses = useMemo(() => {
    return classes.filter(
      (item) =>
        matchesDay(item, selectedDay) &&
        matchesLevel(item.skill_level, selectedLevel) &&
        matchesStudio(item, selectedStudio),
    );
  }, [classes, selectedDay, selectedLevel, selectedStudio]);

  // Groups classes by date so each date renders as its own section.
  const groupedByDate = visibleClasses.reduce((acc, current) => {
    const key = normalizeClassDate(current.class_date);
    const dayOfWeek = getDayLabelFromDate(
      current.class_date,
      current.day_of_week,
    );
    if (!acc[key]) {
      acc[key] = {
        classDate: key,
        dayOfWeek,
        items: [],
      };
    }
    acc[key].items.push(current);
    return acc;
  }, {});

  // Only date groups are sorted; classes within a group keep their natural order.
  const groupedEntries = Object.values(groupedByDate).sort((a, b) =>
    String(a.classDate).localeCompare(String(b.classDate)),
  );

  return (
    <div className="class-schedule-page">
      <div className="page-nav-wrap">
        <Navigation variant="category-strip--page" />
      </div>
      <main className="class-schedule-container">
        {/* Filters and schedule sections share one dark panel. */}
        <div className="schedule-panel">
          <section className="filter-section" aria-label="Filter classes">
            <div className="filter-group">
              <div className="filter-row">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`filter-btn ${selectedDay === day ? "active" : ""}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-row">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`filter-btn ${selectedLevel === level ? "active" : ""}`}
                    onClick={() => setSelectedLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-row">
                {studioNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`filter-btn ${selectedStudio === name ? "active" : ""}`}
                    onClick={() => setSelectedStudio(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <p className="schedule-message">Loading classes...</p>
          ) : null}
          {error ? <p className="schedule-message error">{error}</p> : null}
          {!loading && !error && classes.length === 0 ? (
            <p className="schedule-message">
              No classes available right now. Check back soon.
            </p>
          ) : null}

          {!loading && !error && classes.length > 0 ? (
            <div className="schedule-sections">
              {groupedEntries.map((group) => (
                <section key={group.classDate} className="day-section">
                  <header className="day-section-header">
                    <h2>{group.dayOfWeek}</h2>
                    <p>{formatClassDate(group.classDate)}</p>
                  </header>
                  <div className="day-class-list">
                    {group.items.map((classItem) => (
                      <article key={classItem.id} className="class-card">
                        <div className="class-main">
                          <h3>{classItem.name.replace(/^[^a-zA-Z]+/, "")}</h3>
                          <div className="studio-row">
                            <img
                              src={classItem.studio_photo_url || FALLBACK_IMAGE}
                              alt={`${classItem.studio_name} studio`}
                              loading="lazy"
                            />
                            <span>{classItem.studio_name}</span>
                          </div>
                        </div>
                        <div className="class-instructor">
                          {classItem.instructor ? (
                            <span>{classItem.instructor}</span>
                          ) : null}
                        </div>
                        <div className="class-meta">
                          <p className="class-time">
                            {formatStartTime(classItem.start_time)}
                          </p>
                          <span
                            className={getSkillLevelClass(
                              classItem.skill_level,
                            )}
                          >
                            {classItem.skill_level || "Open"}
                          </span>
                        </div>
                        <div className="class-actions">
                          {classItem.studio_schedule_url ? (
                            <a
                              href={classItem.studio_schedule_url}
                              target="_blank"
                              rel="noreferrer"
                              className="book-class-btn"
                            >
                              Book Class
                            </a>
                          ) : (
                            <span className="no-link">No booking link</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default ClassSchedulePage;

// Shared navigation links used across app pages.
import { Link } from "react-router-dom";
import "../css/Navigation.css";

const navItems = [
  { label: "Home", icon: "fa-solid fa-house", to: "/" },
  { label: "Studios", icon: "fa-solid fa-building", to: "/studios" },
  {
    label: "Class Schedule",
    icon: "fa-regular fa-calendar-days",
    to: "/class-schedule",
  },
  {
    label: "IG Class Radar",
    icon: "fa-brands fa-instagram",
    to: "/ig-class-radar",
  },
  { label: "Add Studio", icon: "fa-solid fa-square-plus", to: "/add-studio" },
];

function Navigation({ variant = "", className = "" }) {
  // Build final CSS class list so pages can pass style variants.
  const navClassName = ["category-strip", variant, className]
    .filter(Boolean)
    .join(" ");

  return (
    // Shared top navigation used across the app.
    <nav className={navClassName} aria-label="Primary navigation">
      {navItems.map((item) => (
        <Link key={item.label} className="category-item" to={item.to}>
          <i className={item.icon} aria-hidden="true" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default Navigation;

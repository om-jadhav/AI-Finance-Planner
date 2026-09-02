import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Icon({ children }) {
  return <span aria-hidden="true">{children}</span>;
}

export default function Sidebar({ active }) {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">₹</div>
        Finance Planner
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`nav-item ${active === "overview" ? "active" : ""}`}
        >
          <Icon>⌂</Icon>
          Overview
        </Link>

        <Link
          to="/financial-profile"
          className={`nav-item ${active === "financial-profile" ? "active" : ""}`}
        >
          <Icon>◈</Icon>
          Financial Profile
        </Link>

        <Link
          to="/plan"
          className={`nav-item ${active === "plan" ? "active" : ""}`}
        >
          <Icon>◎</Icon>
          Your Plan
        </Link>

        <Link
          to="/financial-assistant"
          className={`nav-item ${active === "financial-assistant" ? "active" : ""}`}
        >
          <Icon>💬</Icon>
          Financial Assistant
        </Link>


        {/* NEW: Calculators link – points to the public calculator page */}
        <Link
          to="/calculators"
          className={`nav-item ${active === "calculator" ? "active" : ""}`}
        >
          <i className="fas fa-calculator"></i>          Calculators
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-button" onClick={logout}>
          ↪ &nbsp; Log out
        </button>
      </div>
    </aside>
  );
}
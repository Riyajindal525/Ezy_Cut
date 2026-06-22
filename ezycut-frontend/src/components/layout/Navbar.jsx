import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Scissors,
  Bell,
  Star,
  CreditCard,
  Calendar,
  Clock,
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import useAuthStore from "../../store/auth.store";

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const customerLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/my-bookings", label: "Bookings", icon: Calendar },
    { to: "/my-queue", label: "Queue", icon: Clock },
    { to: "/my-reviews", label: "Reviews", icon: Star },
    { to: "/payment-history", label: "Payments", icon: CreditCard },
    { to: "/notifications", label: "Alerts", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <Scissors size={22} strokeWidth={2.5} style={{ color: "var(--brand-accent)" }} />
        <span>Ezy<span>Cut</span></span>
      </Link>

      {/* Mobile toggle */}
      <button
        className="btn btn-outline btn-icon navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Nav links (desktop row / mobile dropdown) */}
      <div className={`navbar-links ${menuOpen ? "open" : ""}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {!token ? (
          <>
            <NavLink to="/salons" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
              Explore
            </NavLink>
            <NavLink to="/track" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
              Track Queue
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
              Login
            </NavLink>
            <Link to="/register" className="btn btn-primary" style={{ marginLeft: "0.25rem" }} onClick={closeMenu}>
              Get Started
            </Link>
          </>
        ) : (
          <>
            <NavLink to="/salons" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
              Salons
            </NavLink>
            <NavLink to="/track" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
              Track Queue
            </NavLink>

            {/* Customer links */}
            {user?.role === "customer" && (
              <div className="navbar-customer-links" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {customerLinks.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    style={{ fontSize: "0.8125rem" }}
                    onClick={closeMenu}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Owner dashboard + profile/notifications */}
            {user?.role === "salon_owner" && (
              <>
                <Link to="/owner/dashboard" className="btn btn-primary btn-sm" style={{ marginLeft: "0.25rem" }} onClick={closeMenu}>
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} style={{ fontSize: "0.8125rem" }} onClick={closeMenu}>
                  <Bell size={14} />
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} style={{ fontSize: "0.8125rem" }} onClick={closeMenu}>
                  Profile
                </NavLink>
              </>
            )}
            {user?.role === "admin" && (
              <Link to="/admin/dashboard" className="btn btn-primary btn-sm" style={{ marginLeft: "0.25rem" }} onClick={closeMenu}>
                <LayoutDashboard size={14} />
                Admin Panel
              </Link>
            )}

            {/* User info + logout */}
            <div className="navbar-user" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem", paddingLeft: "0.75rem", borderLeft: "1px solid var(--gray-200)" }}>
              <div style={{
                width: "2rem", height: "2rem", borderRadius: "50%",
                background: "var(--brand-primary)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6875rem", fontWeight: 700,
              }}>
                {user?.name?.slice(0, 2).toUpperCase() || "ME"}
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ gap: "0.375rem" }}>
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
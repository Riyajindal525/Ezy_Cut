import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
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
  AlertTriangle,
} from "lucide-react";
import useAuthStore from "../../store/auth.store";
import navbarIcon from "../../assets/ezycut-icon.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
    setShowLogoutConfirm(false);
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

  const navLinkClass = ({ isActive }) =>
    `ezc-nav-link ${isActive ? "active" : ""}`;

  const navLinkSmClass = ({ isActive }) =>
    `ezc-nav-link-sm ${isActive ? "active" : ""}`;

  return (
    <>
      <nav className={`ezc-navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Brand */}
        <Link to="/" className="ezc-navbar-brand" onClick={closeMenu}>
          <img
            src={navbarIcon}
            alt="EzyCut"
            className={`ezc-navbar-logo ${scrolled ? "scrolled" : ""}`}
          />
          <span className="ezc-navbar-brand-text">
      <span className="ezc-brand-ezy">EZY</span>
      <span className="ezc-brand-cut">CUT</span>
    </span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="ezc-navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Nav links (desktop row / mobile dropdown) */}
        <div className={`ezc-navbar-links ${menuOpen ? "open" : ""}`}>
          {!token ? (
            <>
              <NavLink to="/salons" className={navLinkClass} onClick={closeMenu}>
                Explore
              </NavLink>
              <NavLink to="/about" className={navLinkClass} onClick={closeMenu}>
              About Us
              </NavLink>
             <NavLink to="/partner-with-us" className={navLinkClass} onClick={closeMenu}>
              Partner With Us
             </NavLink>
              <NavLink to="/track" className={navLinkClass} onClick={closeMenu}>
                Track Queue
              </NavLink>
              <NavLink to="/login" className={navLinkClass} onClick={closeMenu}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="ezc-get-started-btn"
                onClick={closeMenu}
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/salons" className={navLinkClass} onClick={closeMenu}>
                Salons
              </NavLink>
              <NavLink to="/about" className={navLinkClass} onClick={closeMenu}>
               About Us
               </NavLink>
              <NavLink to="/track" className={navLinkClass} onClick={closeMenu}>
                Track Queue
              </NavLink>

              {/* Customer links */}
              {user?.role === "customer" && (
                <div className="ezc-customer-links">
                  {customerLinks.map(({ to, label }) => (
                    <NavLink key={to} to={to} className={navLinkSmClass} onClick={closeMenu}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Owner dashboard + profile/notifications */}
              {user?.role === "salon_owner" && (
                <>
                  <Link
                    to="/owner/dashboard"
                    className="ezc-dash-btn"
                    onClick={closeMenu}
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <NavLink to="/notifications" className={navLinkSmClass} onClick={closeMenu}>
                    <Bell size={14} />
                  </NavLink>
                  <NavLink to="/profile" className={navLinkSmClass} onClick={closeMenu}>
                    Profile
                  </NavLink>
                </>
              )}
              {user?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="ezc-dash-btn"
                  onClick={closeMenu}
                >
                  <LayoutDashboard size={14} />
                  Admin Panel
                </Link>
              )}

              {/* User info + logout */}
              <div className="ezc-user-section">
                <div className="ezc-avatar">
                  {user?.name?.slice(0, 2).toUpperCase() || "ME"}
                </div>
                <button
                  className="ezc-logout-btn"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div
          className="ezc-logout-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="ezc-logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ezc-logout-modal-icon">
              <AlertTriangle size={22} />
            </div>
            <h3 className="ezc-logout-modal-title">Log out of EzyCut?</h3>
            <p className="ezc-logout-modal-desc">
              You&apos;ll need to sign in again to access your bookings, queue, and profile.
            </p>
            <div className="ezc-logout-modal-actions">
              <button
                className="ezc-logout-modal-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="ezc-logout-modal-confirm" onClick={handleLogout}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
import { NavLink, useNavigate } from "react-router-dom";
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  Wrench,
  Clock,
  Wallet,
  Store,
  Users,
  BarChart2,
  DollarSign,
  Home,
  LogOut,
  User,
} from "lucide-react";
import useAuthStore from "../../store/auth.store";

const ownerLinks = [
  { name: "Overview", path: "/owner/dashboard", icon: LayoutDashboard },
  { name: "Appointments", path: "/owner/bookings", icon: Calendar },
  { name: "Services", path: "/owner/services", icon: Wrench },
  { name: "Live Queue", path: "/owner/queue", icon: Clock },
  { name: "Earnings", path: "/owner/payments", icon: Wallet },
  { name: "Salon Profile", path: "/owner/salon", icon: Store },
  { name: "My Profile", path: "/owner/profile", icon: User },
];

const adminLinks = [
  { name: "Platform Stats", path: "/admin/dashboard", icon: BarChart2 },
  { name: "Salons", path: "/admin/salons", icon: Store },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Payments", path: "/admin/payments", icon: DollarSign },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart2 },
];

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const isOwner = user?.role === "salon_owner";
  const isAdmin = user?.role === "admin";

  const links = isOwner ? ownerLinks : isAdmin ? adminLinks : [];
  const roleLabel = isOwner ? "Owner Panel" : isAdmin ? "Admin Panel" : "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div style={{
          width: "2.25rem", height: "2.25rem",
          background: "var(--brand-accent)",
          borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Scissors size={16} strokeWidth={2.5} style={{ color: "white" }} />
        </div>
        <div>
          <div className="sidebar-brand-name">EzyCut</div>
          <div className="sidebar-role-badge">{roleLabel}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <Icon size={16} className="sidebar-link-icon" strokeWidth={2} />
            {name}
          </NavLink>
        ))}

        <div className="divider" style={{ margin: "0.5rem 0" }} />

        <NavLink to="/" className="sidebar-link">
          <Home size={16} className="sidebar-link-icon" strokeWidth={2} />
          Back to Site
        </NavLink>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.slice(0, 2).toUpperCase() || "ME"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </div>
            <div className="sidebar-user-role capitalize">{user?.role?.replace("_", " ")}</div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ padding: "0.4rem", width: "auto", flexShrink: 0 }}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

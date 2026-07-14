import { NavLink, useNavigate } from "react-router-dom";
import {
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
  ShieldCheck,
  X,
} from "lucide-react";
import useAuthStore from "../../store/auth.store";
import logo from "../../assets/ezycut-icon.png";

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
  { name: "KYC Review", path: "/admin/kyc", icon: ShieldCheck },
];

const Sidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
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

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.8125rem] font-semibold transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white shadow-md shadow-[#0d9488]/20"
        : "text-[#5b6b68] hover:bg-[#f0fdfa] hover:text-[#0f766e] hover:translate-x-0.5"
    }`;

  const iconWrapClass = (isActive) =>
    `w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
      isActive ? "bg-white/20" : "bg-[#f0fdfa] group-hover:bg-white"
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[60] w-[86vw] max-w-[280px] h-screen flex flex-col bg-white border-r border-gray-200 shadow-xl overflow-hidden transition-transform duration-300 md:sticky md:translate-x-0 md:w-[260px] md:min-w-[260px] md:shadow-[1px_0_0_rgba(0,0,0,0.02)] ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between px-3 pt-3 md:hidden">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gray-400">Menu</span>
        <button
          type="button"
          aria-label="Close sidebar"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          onClick={onMobileClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Brand */}
      <div className="px-5 pt-4 pb-5 border-b border-gray-100 flex items-center gap-3">
  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden">
    <img src={logo} alt="EzyCut" className="w-full h-full object-contain scale-125" />
  </div>
  <div className="min-w-0">
    <div className="text-xl font-black leading-tight tracking-tight truncate">
      <span className="text-[#1a1a1a]">EZY</span>
      <span className="text-[#0d9488]">CUT</span>
    </div>
    <div className="inline-flex items-center text-[0.625rem] font-bold uppercase tracking-wider text-[#0f766e] bg-[#f0fdfa] border border-[#ccfbf1] rounded-full px-2 py-0.5 mt-1">
      {roleLabel}
    </div>
  </div>
</div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-3 py-5 overflow-hidden">
        <span className="px-3 mb-2 text-[0.6875rem] font-bold uppercase tracking-wider text-gray-300">
          Menu
        </span>
        <div className="flex flex-col gap-1">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={linkClass} onClick={onMobileClose}>
              {({ isActive }) => (
                <>
                  <span className={iconWrapClass(isActive)}>
                    <Icon
                      size={14.5}
                      strokeWidth={2.4}
                      className={isActive ? "text-white" : "text-[#0d9488]"}
                    />
                  </span>
                  <span className="truncate">{name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="h-px bg-gray-100 my-3" />

        <NavLink to="/" className={linkClass} onClick={onMobileClose}>
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Home
                  size={14.5}
                  strokeWidth={2.4}
                  className={isActive ? "text-white" : "text-[#0d9488]"}
                />
              </span>
              Back to Site
            </>
          )}
        </NavLink>
      </nav>

      {/* User Footer */}
      <div className="px-3 pb-4 pt-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-[#f7f9f8] border border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d9488] to-[#022525] text-white flex items-center justify-center text-[0.6875rem] font-extrabold shrink-0 shadow-sm">
            {user?.name?.slice(0, 2).toUpperCase() || "ME"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.8125rem] font-bold text-[#022525] truncate">
              {user?.name}
            </div>
            <div className="text-[0.7rem] text-gray-400 font-medium capitalize truncate">
              {user?.role?.replace("_", " ")}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Plus, ChevronDown, Menu } from "lucide-react";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";

const Header = ({ title, onMenuToggle }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  // Salon store state
  const { salons, activeSalonId, setActiveSalonId, fetchSalons } = useSalonStore();

  const isOwner = user?.role === "salon_owner";

  useEffect(() => {
    if (isOwner) {
      fetchSalons();
    }
  }, [isOwner, fetchSalons]);

  const ownedSalons = salons.filter(
    (s) => s.owner?._id === user?.id || s.owner === user?.id
  );

  // Set default active salon if not set
  useEffect(() => {
    if (isOwner && ownedSalons.length > 0) {
      const match = ownedSalons.find((s) => s._id === activeSalonId);
      if (!match) {
        setActiveSalonId(ownedSalons[0]._id);
      }
    }
  }, [isOwner, ownedSalons, activeSalonId, setActiveSalonId]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="h-16 sm:h-17 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Open sidebar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 md:hidden"
          onClick={onMenuToggle}
        >
          <Menu size={18} />
        </button>

        <h1 className="text-base sm:text-lg font-extrabold text-gray-800 tracking-tight truncate">{title}</h1>

        {isOwner && (
          <div className="hidden md:flex items-center gap-3">
            {ownedSalons.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">Active Salon:</span>
                <div className="relative">
                  <select
                    value={activeSalonId || ""}
                    onChange={(e) => {
                      setActiveSalonId(e.target.value);
                      if (location.search.includes("register=true")) {
                        navigate(location.pathname);
                      }
                    }}
                    className="appearance-none bg-[#f7faf9] text-gray-700 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-[0.8125rem] font-semibold outline-none cursor-pointer hover:border-gray-300 focus:border-[#0d9488] transition-colors"
                  >
                    {ownedSalons.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} {!s.isApproved ? "⏳" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/owner/dashboard?register=true")}
              className="inline-flex items-center gap-1.5 bg-linear-to-br from-[#0d9488] to-[#0f766e] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus size={14} /> Register Salon
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* User info */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d9488] to-[#022525] text-white flex items-center justify-center text-[0.6875rem] font-extrabold shrink-0 shadow-sm">
            {user?.name?.slice(0, 2).toUpperCase() || "ME"}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[0.8125rem] font-bold text-gray-800">{user?.name}</span>
            <span className="text-[0.6875rem] text-gray-400 font-medium capitalize">
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
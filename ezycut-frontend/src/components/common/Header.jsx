import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Plus } from "lucide-react";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";

const Header = ({ title }) => {
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
    <header className="dash-header">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1 className="dash-header-title">{title}</h1>

        {isOwner && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {ownedSalons.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 500 }}>Active Salon:</span>
                <select
                  value={activeSalonId || ""}
                  onChange={(e) => {
                    setActiveSalonId(e.target.value);
                    if (location.search.includes("register=true")) {
                      navigate(location.pathname);
                    }
                  }}
                  style={{
                    background: "#121214",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.8125rem",
                    fontWeight: 650,
                    outline: "none",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {ownedSalons.map((s) => (
                    <option key={s._id} value={s._id} style={{ background: "#121214", color: "white" }}>
                      {s.name} {!s.isApproved ? "⏳" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button
              onClick={() => navigate("/owner/dashboard?register=true")}
              className="btn btn-primary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "0.25rem", borderRadius: "var(--radius-md)" }}
            >
              <Plus size={14} /> Register Salon
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: "2rem", height: "2rem",
            borderRadius: "50%",
            background: "var(--brand-accent)",
            color: "#09090b",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.6875rem", fontWeight: 700,
          }}>
            {user?.name?.slice(0, 2).toUpperCase() || "ME"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-800)" }}>
              {user?.name}
            </span>
            <span style={{ fontSize: "0.6875rem", color: "var(--gray-400)", fontWeight: 500, textTransform: "capitalize" }}>
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ gap: "0.375rem" }}>
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

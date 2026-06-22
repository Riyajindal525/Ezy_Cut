import { User, Mail, Phone, Shield, Lock } from "lucide-react";
import useAuthStore from "../../store/auth.store";

const roleConfig = {
  customer: { label: "Customer", color: "var(--brand-accent)", bg: "var(--brand-accent-light)" },
  salon_owner: { label: "Salon Owner", color: "#7c3aed", bg: "#f5f3ff" },
  admin: { label: "Administrator", color: "#dc2626", bg: "#fee2e2" },
};

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const role = roleConfig[user?.role] || { label: user?.role, color: "var(--gray-500)", bg: "var(--gray-100)" };

  const fields = [
    { label: "Full Name", value: user?.name, icon: User },
    { label: "Email Address", value: user?.email, icon: Mail },
    { label: "Phone Number", value: user?.phone || "Not provided", icon: Phone },
    { label: "Account Role", value: role.label, icon: Shield },
  ];

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="page-container" style={{ maxWidth: "720px" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="page-title">My Profile</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>Your EzyCut account information</p>
        </div>

        {/* Profile Hero Card */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--brand-primary) 0%, #312e81 100%)",
            borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
            padding: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}>
            {/* Avatar */}
            <div style={{
              width: "5rem", height: "5rem",
              borderRadius: "50%",
              background: "var(--brand-accent)",
              border: "3px solid rgba(255,255,255,0.2)",
              color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", fontWeight: 800,
              flexShrink: 0,
            }}>
              {user?.name?.slice(0, 2).toUpperCase() || "ME"}
            </div>

            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                {user?.name}
              </h2>
              <div style={{
                display: "inline-flex",
                marginTop: "0.5rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "var(--radius-full)",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
              }}>
                {role.label}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {fields.map(({ label, value, icon: Icon }) => (
              <div key={label} style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-100)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <Icon size={14} style={{ color: "var(--gray-400)" }} />
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gray-400)" }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--gray-800)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info notice */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          padding: "1rem 1.25rem",
          background: "var(--gray-50)",
          border: "1px solid var(--gray-200)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.875rem",
          color: "var(--gray-500)",
        }}>
          <Lock size={15} style={{ flexShrink: 0, marginTop: "0.125rem", color: "var(--gray-400)" }} />
          <span>
            Account information is locked for security. To update your registered credentials, please contact{" "}
            <strong>support@ezycut.in</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;

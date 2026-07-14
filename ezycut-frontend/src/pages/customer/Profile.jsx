import { User, Mail, Phone, Shield, Lock, Sparkles } from "lucide-react";
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
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">My Profile</h1>
          <p className="text-white/60 text-sm">Your EzyCut account information</p>
        </div>
      </div>

      {/* ============ MAIN CONTENT (overlaps hero bottom) ============ */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 pb-12 flex flex-col gap-6">

        {/* Profile Hero Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Identity strip */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#022525] to-[#0f766e] p-6 sm:p-8 flex items-center gap-5 flex-wrap">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.2)_0%,transparent_70%)] pointer-events-none" />

            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full bg-[#0d9488] border-4 border-white/15 text-white flex items-center justify-center text-2xl font-extrabold shrink-0 shadow-lg">
              {user?.name?.slice(0, 2).toUpperCase() || "ME"}
            </div>

            <div className="relative flex flex-col gap-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{user?.name}</h2>
              <span className="inline-flex self-start items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[0.8125rem] font-bold text-white/90">
                {role.label}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-[#f7f9f8] border border-gray-100 rounded-xl p-4 flex flex-col gap-2 transition-colors hover:border-[#0d9488]/20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-[#0d9488]" />
                  </div>
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#9ca3af]">
                    {label}
                  </span>
                </div>
                <div className="text-[0.9375rem] font-bold text-[#022525] break-words">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-3 px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm text-[#5b6b68]">
          <div className="w-7 h-7 rounded-lg bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0 mt-0.5">
            <Lock size={13} className="text-[#0d9488]" />
          </div>
          <span className="leading-relaxed">
            Account information is locked for security. To update your registered credentials, please contact{" "}
            <strong className="text-[#022525]">support@ezycut.in</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import { useEffect, useState } from "react";
import { getAdminRecentUsers } from "../../api/dashboard.api";
import { Users as UsersIcon, Mail, ShieldCheck, AlertCircle } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await getAdminRecentUsers();
      setUsers(data.users);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch registered user accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roleStyles = (role) => {
    if (role === "admin")
      return "bg-rose-50 text-rose-600 border-rose-100";
    if (role === "salon_owner")
      return "bg-teal-50 text-teal-700 border-teal-100";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const initials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[fadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-9 h-9 border-[3px] border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-sm px-5 py-4 rounded-xl">
        <AlertCircle size={18} className="shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Page Header */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden rounded-2xl p-6 md:p-7 bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-4 flex-wrap`}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm shadow-teal-200 flex items-center justify-center shrink-0">
            <UsersIcon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              User Accounts Directory
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Audit platform-wide registered user profiles and role configurations
            </p>
          </div>
        </div>

        <span className="relative inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3.5 py-1.5 rounded-full ring-1 ring-inset ring-teal-200">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          {users.length} Accounts
        </span>
      </div>

      {/* Users List */}
      <div {...fadeUp(80)} className={`${fadeUp(80).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/60">
          <h3 className="text-base font-semibold text-slate-800">Registered User Accounts</h3>
          <p className="text-xs text-slate-400 mt-1">Recent profiles across the platform</p>
        </div>

        <div className="p-6 pt-4">
          {users.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-14">
              <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
                <UsersIcon size={24} className="text-teal-400" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm">No Users Registered</h4>
              <p className="text-xs text-slate-400 max-w-sm">User details will populate upon customer registration.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {users.map((u, i) => (
                <div
                  key={u._id}
                  {...fadeUp(120 + i * 30)}
                  className={`${fadeUp(120 + i * 30).className} bg-slate-50 border border-slate-200 rounded-xl p-5 hover:bg-slate-100 hover:border-teal-300 hover:shadow-[0_6px_18px_rgba(15,118,110,0.1)] transition-all duration-200`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                        {initials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{u.name}</div>
                        <div className="text-[0.7rem] text-slate-400 font-mono truncate">ID: {u._id}</div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full whitespace-nowrap border capitalize ${roleStyles(u.role)}`}
                    >
                      <ShieldCheck size={12} />
                      {u.role.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-wide mb-1">Email Address</p>
                      <p className="inline-flex items-center gap-1.5 text-sm text-slate-700 break-all">
                        <Mail size={13} className="text-teal-500 shrink-0" />
                        {u.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-wide mb-1">Account Role</p>
                      <p className="text-sm text-slate-700 capitalize">{u.role.replace("_", " ")}</p>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-wide mb-1">Registration Date</p>
                      <p className="text-sm text-slate-700">{new Date(u.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
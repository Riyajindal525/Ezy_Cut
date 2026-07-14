import { useEffect, useState } from "react";
import {
  getAdminOverview,
  getAdminRecentSalons,
  getAdminRecentUsers,
  getAdminTopSalons,
} from "../../api/dashboard.api";
import {
  Wallet,
  Users,
  Building,
  CalendarCheck,
  Store,
  UserCircle,
  Trophy,
  Star,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentSalons, setRecentSalons] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topSalons, setTopSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [overviewData, salonsData, usersData, topSalonsData] = await Promise.all([
          getAdminOverview(),
          getAdminRecentSalons(),
          getAdminRecentUsers(),
          getAdminTopSalons(),
        ]);

        setOverview(overviewData.overview);
        setRecentSalons(salonsData.salons);
        setRecentUsers(usersData.users);
        setTopSalons(topSalonsData.salons || []);
      } catch (err) {
        console.error(err);
        setError("Error loading system metrics overview.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-9 h-9 border-[3px] border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
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

  const getRoleClass = (role) => {
    if (role === "admin") return "bg-rose-50 text-rose-700 border border-rose-100";
    if (role === "salon_owner") return "bg-violet-50 text-violet-700 border border-violet-100";
    return "bg-gray-50 text-gray-700 border border-gray-100";
  };

  const rankBadgeClass = (idx) => {
    if (idx === 0) return "bg-amber-100 text-amber-700 border border-amber-200";
    if (idx === 1) return "bg-gray-100 text-gray-600 border border-gray-200";
    if (idx === 2) return "bg-orange-50 text-orange-600 border border-orange-200";
    return "bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1]";
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${overview?.totalRevenue || 0}`,
      sub: "Platform gross sales",
      subColor: "text-emerald-600",
      icon: Wallet,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Registered Users",
      value: overview?.totalUsers || 0,
      sub: `Customers (${overview?.totalCustomers}) · Owners (${overview?.totalSalonOwners})`,
      subColor: "text-gray-400",
      icon: Users,
      tint: "bg-sky-50 text-sky-600",
    },
    {
      label: "Salons Registered",
      value: overview?.totalSalons || 0,
      sub: `Approved (${overview?.approvedSalons}) · Pending (${overview?.pendingSalons})`,
      subColor: "text-gray-400",
      icon: Building,
      tint: "bg-violet-50 text-violet-600",
    },
    {
      label: "Total Bookings",
      value: overview?.totalBookings || 0,
      sub: `Completed (${overview?.completedBookings})`,
      subColor: "text-sky-600",
      icon: CalendarCheck,
      tint: "bg-[#f0fdfa] text-[#0d9488]",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div {...fadeUp(0)} className={fadeUp(0).className}>
        <h1 className="font-['Outfit'] text-2xl md:text-[1.75rem] font-extrabold text-[#042f2e] tracking-[-0.02em]">
          Platform Overview
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">Live snapshot of EzyCut's growth and activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            {...fadeUp(60 + i * 40)}
            className={`${fadeUp(60 + i * 40).className} group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_14px_32px_rgba(15,118,110,0.1)] hover:-translate-y-1 hover:border-[#0d9488]/25 transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.07)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative flex justify-between items-start">
              <span className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.tint} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={17} />
              </div>
            </div>
            <div className="relative">
              <h3 className="font-['Outfit'] text-3xl font-extrabold text-[#042f2e] tracking-tight">{card.value}</h3>
              <p className={`text-xs font-semibold mt-1.5 ${card.subColor}`}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Salons & Recent Users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
   {/* Recent Salons */}
        <div {...fadeUp(240)} className={`${fadeUp(240).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col`}>
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
            <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
                <Store size={16} />
              </span>
              Recent Salon Profiles
            </h3>
            <p className="text-xs text-gray-400 mt-1 ml-10">Latest registered salons on the platform</p>
          </div>
          <div className="p-6 pt-4 flex-1">
            {recentSalons.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-3 py-10">
                <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                  <Store size={22} className="text-gray-300" />
                </div>
                <h4 className="font-bold text-gray-700 text-sm">No Salons Yet</h4>
                <p className="text-xs text-gray-400">Registered salons will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm border-collapse min-w-[480px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">Salon Name</th>
                      <th className="text-left text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">Owner</th>
                      <th className="text-left text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">City</th>
                      <th className="text-center text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSalons.map((s, i) => (
                      <tr
                        key={s._id}
                        {...fadeUp(280 + i * 40)}
                        className={`${fadeUp(280 + i * 40).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                      >
                        <td className="py-3 px-2 font-bold text-black whitespace-nowrap max-w-[140px] truncate">{s.name}</td>
                        <td className="py-3 px-2 text-black font-medium whitespace-nowrap max-w-[120px] truncate">{s.owner?.name || "Unassigned"}</td>
                        <td className="py-3 px-2 text-black font-medium whitespace-nowrap">{s.city}</td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${
                              s.isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}
                          >
                            {s.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div {...fadeUp(300)} className={`${fadeUp(300).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col`}>
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
            <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
                <UserCircle size={16} />
              </span>
              Recent User Signups
            </h3>
            <p className="text-xs text-gray-400 mt-1 ml-10">Newly registered platform users</p>
          </div>
          <div className="p-6 pt-4 flex-1">
            {recentUsers.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-3 py-10">
                <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                  <UserCircle size={22} className="text-gray-300" />
                </div>
                <h4 className="font-bold text-gray-700 text-sm">No Users Yet</h4>
                <p className="text-xs text-gray-400">User signups will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm border-collapse min-w-[480px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">Name</th>
                      <th className="text-left text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">Email</th>
                      <th className="text-left text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">Role</th>
                      <th className="text-left text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider pb-3 px-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u, i) => (
                      <tr
                        key={u._id}
                        {...fadeUp(340 + i * 40)}
                        className={`${fadeUp(340 + i * 40).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                      >
                        <td className="py-3 px-2 font-bold text-black whitespace-nowrap max-w-[110px] truncate">{u.name}</td>
                        <td className="py-3 px-2 text-black text-xs font-medium whitespace-nowrap max-w-[150px] truncate">{u.email}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${getRoleClass(u.role)}`}>
                            {u.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-black text-xs font-semibold whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Salons Leaderboard */}
      <div {...fadeUp(380)} className={`${fadeUp(380).className} relative bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="relative px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f0fdfa] via-white to-white flex items-center justify-between flex-wrap gap-3">
          <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leaderboardDots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.4" fill="#0d9488" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaderboardDots)" />
          </svg>
          <h3 className="relative font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Trophy size={16} />
            </span>
            Top Performing Salons
            <span className="text-xs font-medium text-gray-400 ml-1">Ranked by rating and total reviews</span>
          </h3>
          <span className="relative inline-flex items-center gap-1.5 bg-[#0f766e] text-white text-[0.65rem] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full">
            <Sparkles size={11} />
            Leaderboard
          </span>
        </div>

        <div className="p-6 pt-4">
          {topSalons.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <Star size={22} className="text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-700 text-sm">No Leaderboard Data</h4>
              <p className="text-xs text-gray-400 max-w-sm">Top salon statistics will populate once reviews are submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2 w-12">#</th>
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Salon Info</th>
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Owner</th>
                    <th className="text-center text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Rating</th>
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {topSalons.map((s, idx) => (
                    <tr
                      key={s._id}
                      {...fadeUp(420 + idx * 40)}
                      className={`${fadeUp(420 + idx * 40).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                    >
                      <td className="py-3.5 px-2">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold ${rankBadgeClass(idx)}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-[#042f2e] whitespace-nowrap">{s.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{s.city}, {s.state}</div>
                      </td>
                      <td className="py-3.5 px-2 text-gray-600 font-semibold whitespace-nowrap max-w-[120px] truncate">
                        {s.owner?.name || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100 font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                          <Star size={11} fill="currentColor" />
                          {s.rating || "0"}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-gray-400 text-xs whitespace-nowrap">
                        {s.totalReviews || 0} reviews
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
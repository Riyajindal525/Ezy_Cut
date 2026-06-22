import { useEffect, useState } from "react";
import {
  getAdminOverview,
  getAdminRecentSalons,
  getAdminRecentUsers,
  getAdminTopSalons,
} from "../../api/dashboard.api";

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

  if (loading) {
    return (
      <div className="admin-loader">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-wrapper">
        <div className="admin-danger-notice">{error}</div>
      </div>
    );
  }

  const getRoleClass = (role) => {
    if (role === "admin") return "admin-badge admin-badge-red";
    if (role === "salon_owner") return "admin-badge admin-badge-purple";
    return "admin-badge admin-badge-neutral";
  };

  return (
    <div className="admin-page-wrapper">

      {/* ── Stat Cards ── */}
      <div className="admin-stat-grid">

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Revenue</span>
            <div className="admin-stat-icon" style={{ background: "rgba(212,175,55,0.1)" }}>💰</div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">₹{overview?.totalRevenue || 0}</div>
            <div className="admin-stat-sub admin-stat-sub-green">Platform gross sales</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Registered Users</span>
            <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.1)" }}>👥</div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{overview?.totalUsers || 0}</div>
            <div className="admin-stat-sub">
              Customers ({overview?.totalCustomers}) · Owners ({overview?.totalSalonOwners})
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Salons Registered</span>
            <div className="admin-stat-icon" style={{ background: "rgba(168,85,247,0.1)" }}>🏪</div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{overview?.totalSalons || 0}</div>
            <div className="admin-stat-sub">
              Approved ({overview?.approvedSalons}) · Pending ({overview?.pendingSalons})
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Bookings</span>
            <div className="admin-stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}>📅</div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">{overview?.totalBookings || 0}</div>
            <div className="admin-stat-sub admin-stat-sub-blue">
              Completed ({overview?.completedBookings})
            </div>
          </div>
        </div>

      </div>

      {/* ── Recent Salons & Recent Users ── */}
      <div className="admin-grid-2">

        {/* Recent Salons */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Recent Salon Profiles</div>
              <div className="admin-card-subtitle">Latest registered salons on the platform</div>
            </div>
          </div>
          <div className="admin-card-pad" style={{ paddingTop: "1rem" }}>
            {recentSalons.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">🏪</div>
                <div className="admin-empty-title">No Salons Yet</div>
                <div className="admin-empty-desc">Registered salons will appear here.</div>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Salon Name</th>
                      <th>Owner</th>
                      <th>City</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSalons.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <div className="admin-cell-primary">{s.name}</div>
                        </td>
                        <td>{s.owner?.name || "Unassigned"}</td>
                        <td>{s.city}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`admin-badge ${s.isApproved ? "admin-badge-green" : "admin-badge-amber"}`}>
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
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Recent User Signups</div>
              <div className="admin-card-subtitle">Newly registered platform users</div>
            </div>
          </div>
          <div className="admin-card-pad" style={{ paddingTop: "1rem" }}>
            {recentUsers.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">👤</div>
                <div className="admin-empty-title">No Users Yet</div>
                <div className="admin-empty-desc">User signups will appear here.</div>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="admin-cell-primary">{u.name}</div>
                        </td>
                        <td style={{ fontSize: "0.8125rem", color: "#71717a" }}>{u.email}</td>
                        <td>
                          <span className={getRoleClass(u.role)}>
                            {u.role.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.75rem", color: "#71717a" }}>
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

      {/* ── Top Performing Salons Leaderboard ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">🏆 Top Performing Salons</div>
            <div className="admin-card-subtitle">Ranked by rating and total reviews</div>
          </div>
          <span className="admin-page-badge">Leaderboard</span>
        </div>
        <div className="admin-card-pad" style={{ paddingTop: "1rem" }}>
          {topSalons.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">⭐</div>
              <div className="admin-empty-title">No Leaderboard Data</div>
              <div className="admin-empty-desc">Top salon statistics will populate once reviews are submitted.</div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "3rem" }}>#</th>
                    <th>Salon Info</th>
                    <th>Owner</th>
                    <th style={{ textAlign: "center" }}>Rating</th>
                    <th>Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {topSalons.map((s, idx) => (
                    <tr key={s._id}>
                      <td>
                        <span className={`admin-rank-badge ${idx === 0 ? "admin-rank-1" : idx === 1 ? "admin-rank-2" : idx === 2 ? "admin-rank-3" : "admin-rank-n"}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td>
                        <div className="admin-cell-primary">{s.name}</div>
                        <div className="admin-cell-secondary">{s.city}, {s.state}</div>
                      </td>
                      <td style={{ color: "#d4d4d8", fontWeight: 600 }}>
                        {s.owner?.name || "Unassigned"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="admin-star-rating">
                          ⭐ {s.rating || "0"}
                        </span>
                      </td>
                      <td style={{ color: "#a1a1aa", fontSize: "0.8125rem" }}>
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

import { useEffect, useState } from "react";
import { getAdminRecentUsers } from "../../api/dashboard.api";

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

      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">User Accounts Directory</div>
          <div className="admin-page-desc">
            Audit platform-wide registered user profiles and role configurations
          </div>
        </div>
        <span className="admin-page-badge">
          {users.length} Accounts
        </span>
      </div>

      {/* ── Users Table ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">Registered User Accounts</div>
          <span className="admin-page-badge">Recent Profiles</span>
        </div>

        <div className="admin-card-pad" style={{ paddingTop: "1rem" }}>
          {users.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">👥</div>
              <div className="admin-empty-title">No Users Registered</div>
              <div className="admin-empty-desc">
                User details will populate upon customer registration.
              </div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Account Role</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <span className="admin-cell-mono">{u._id}</span>
                      </td>
                      <td>
                        <div className="admin-cell-primary">{u.name}</div>
                      </td>
                      <td style={{ color: "#71717a", fontSize: "0.875rem" }}>{u.email}</td>
                      <td>
                        <span className={getRoleClass(u.role)}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                        {new Date(u.createdAt).toLocaleString()}
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

export default AdminUsers;

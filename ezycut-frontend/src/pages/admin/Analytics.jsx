import { useEffect, useState } from "react";
import {
  getNetRevenue,
  getPlatformMonthlyRevenue,
} from "../../api/payment.api";

const AdminAnalytics = () => {
  const [netRevenue, setNetRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [netData, monthlyData] = await Promise.all([
          getNetRevenue(),
          getPlatformMonthlyRevenue(),
        ]);
        setNetRevenue(netData.revenue);
        setMonthlyRevenue(monthlyData.revenue || []);
      } catch (err) {
        console.error(err);
        setError("Error loading system revenue analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "long" });
  };

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

  const maxRevenue =
    monthlyRevenue.length > 0
      ? Math.max(...monthlyRevenue.map((m) => m.revenue))
      : 1;

  return (
    <div className="admin-page-wrapper">

      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Revenue Analytics</div>
          <div className="admin-page-desc">
            Platform-wide financial overview — gross sales, refunds, and net earnings
          </div>
        </div>
        <span className="admin-page-badge">
          {new Date().getFullYear()} Report
        </span>
      </div>

      {/* ── Financial Summary Cards ── */}
      <div className="admin-analytics-grid">

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Gross Platform Sales</span>
            <div className="admin-stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
              📈
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">₹{netRevenue?.paidRevenue || 0}</div>
            <div className="admin-stat-sub admin-stat-sub-green">Total transactions captured</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Platform Refunds</span>
            <div className="admin-stat-icon" style={{ background: "rgba(239,68,68,0.1)" }}>
              💸
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">₹{netRevenue?.refundedRevenue || 0}</div>
            <div className="admin-stat-sub admin-stat-sub-red">Total returned to clients</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Net Platform Earnings</span>
            <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.1)" }}>
              💰
            </div>
          </div>
          <div className="admin-stat-body">
            <div className="admin-stat-value">₹{netRevenue?.netRevenue || 0}</div>
            <div className="admin-stat-sub admin-stat-sub-blue">Earnings net after refunds</div>
          </div>
        </div>

      </div>

      {/* ── Monthly Revenue Bar Chart ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">
              📊 Monthly Revenue Comparisons ({new Date().getFullYear()})
            </div>
            <div className="admin-card-subtitle">
              Monthly breakdown of platform revenue and booking counts
            </div>
          </div>
        </div>

        <div className="admin-card-pad">
          {monthlyRevenue.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📊</div>
              <div className="admin-empty-title">No Revenue Data Yet</div>
              <div className="admin-empty-desc">
                Monthly revenue aggregates will appear once transactions are completed.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {monthlyRevenue.map((m, idx) => {
                const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={idx} className="admin-bar-row">
                    <div className="admin-bar-meta">
                      <span className="admin-bar-label">
                        {getMonthName(m._id.month)}
                      </span>
                      <span className="admin-bar-amount">
                        ₹{m.revenue.toLocaleString()}
                        <span className="admin-bar-sub" style={{ marginLeft: "0.5rem" }}>
                          ({m.bookings} bookings)
                        </span>
                      </span>
                    </div>
                    <div className="admin-bar-track">
                      <div
                        className="admin-bar-fill admin-bar-fill-blue"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "../../api/notification.api";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import toast from "../../utils/toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      toast.error("Failed to load notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <Loader message="Loading notifications..." />;

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="page-container" style={{ maxWidth: "720px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  background: "var(--danger)",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "var(--radius-full)",
                }}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
              {unreadCount} unread · {notifications.length} total
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleReadAll}
              disabled={markingAll}
              className="btn btn-outline btn-sm"
              style={{ gap: "0.375rem" }}
            >
              <CheckCheck size={13} />
              {markingAll ? "Marking..." : "Mark All Read"}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="You have no notifications. We'll let you know when something happens."
            icon={BellOff}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                className="card"
                style={{
                  padding: "1.25rem",
                  borderLeft: `3px solid ${n.isRead ? "var(--gray-200)" : "var(--brand-accent)"}`,
                  background: n.isRead ? "white" : "#fafbff",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  {/* Icon */}
                  <div style={{
                    width: "2.25rem", height: "2.25rem",
                    borderRadius: "50%",
                    background: n.isRead ? "var(--gray-100)" : "var(--brand-accent-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Bell size={14} style={{ color: n.isRead ? "var(--gray-400)" : "var(--brand-accent)" }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "0.9375rem", fontWeight: n.isRead ? 600 : 700, color: "var(--gray-800)" }}>
                        {n.title}
                      </h3>
                      <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", whiteSpace: "nowrap" }}>
                        {new Date(n.createdAt).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginTop: "0.25rem", lineHeight: 1.6 }}>
                      {n.message}
                    </p>
                  </div>

                  {/* Mark read */}
                  {!n.isRead && (
                    <button
                      onClick={() => handleRead(n._id)}
                      className="btn btn-success btn-sm btn-icon"
                      title="Mark as read"
                      style={{ flexShrink: 0 }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
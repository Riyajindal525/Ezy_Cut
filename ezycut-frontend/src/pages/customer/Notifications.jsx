import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Check, CheckCheck, Sparkles } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "../../api/notification.api";
import Loader from "../../components/common/Loader";
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
  // Show only unread notifications
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  if (loading) return <Loader message="Loading notifications..." />;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:pb-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="relative inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-[#f43f5e] text-white text-xs font-extrabold">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#f43f5e] opacity-60 animate-ping" />
                  <span className="relative">{unreadCount}</span>
                </span>
              )}
            </h1>
            <p className="text-white/60 text-sm">
              {unreadCount} unread
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleReadAll}
              disabled={markingAll}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/[0.16] border border-white/15 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {markingAll ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <CheckCheck size={15} />
              )}
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {unreadNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-4 py-16 px-6">
            <div className="relative w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
              <BellOff size={26} className="text-[#0d9488]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold text-[#022525]">All caught up!</h3>
              <p className="text-[#5b6b68] text-sm max-w-sm">
                You&apos;re all caught up — no unread notifications.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {unreadNotifications.map((n, i) => (
              <div
                key={n._id}
                className={`group relative bg-white rounded-2xl border shadow-sm px-5 py-4 flex gap-4 items-start transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0 ${
                  n.isRead
                    ? "border-gray-200"
                    : "border-[#99f6e4] bg-gradient-to-r from-[#f0fdfa] to-white"
                }`}
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                {/* Unread accent bar */}
                {!n.isRead && (
                  <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-[#0d9488] to-[#5eead4]" />
                )}

                {/* Icon */}
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    n.isRead ? "bg-gray-100" : "bg-[#0d9488]/10"
                  }`}
                >
                  {!n.isRead && (
                    <span className="absolute inset-0 rounded-full bg-[#0d9488]/20 animate-ping" />
                  )}
                  {n.isRead ? (
                    <Bell size={16} className="text-gray-400" />
                  ) : (
                    <BellRing size={16} className="relative text-[#0d9488]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3
                      className={`text-[0.9375rem] leading-snug ${
                        n.isRead ? "font-semibold text-[#022525]/80" : "font-bold text-[#022525]"
                      }`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        hour: "numeric",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#5b6b68] mt-1 leading-relaxed">{n.message}</p>
                </div>

                {/* Mark read */}
                {!n.isRead && (
                  <button
                    onClick={() => handleRead(n._id)}
                    title="Mark as read"
                    className="shrink-0 w-8 h-8 rounded-full bg-[#0d9488] text-white flex items-center justify-center transition-all duration-200 hover:bg-[#0f766e] hover:scale-110 active:scale-95 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Check size={14} strokeWidth={2.75} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

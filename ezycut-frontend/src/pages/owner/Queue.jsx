import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonQueue,
  startService,
  completeQueue,
  cancelQueue,
} from "../../api/queue.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Clock, HelpCircle, Play, Check, Trash2 } from "lucide-react";

const OwnerQueue = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Queue Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetQueueId, setTargetQueueId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchSalonAndQueue = async (showLoader = false) => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    if (showLoader) setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const queueResponse = await getSalonQueue(activeSalonId);
        setQueueItems(queueResponse.queue || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load active queue list.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndQueue(true);

    // Dynamic Polling every 10 seconds
    const interval = setInterval(() => {
      fetchSalonAndQueue(false);
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleQueueAction = async (queueId, actionFn, successMessage) => {
    try {
      await actionFn(queueId);
      toast.success(successMessage);
      fetchSalonAndQueue(false); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process queue action.");
    }
  };

  const triggerCancelQueue = (queueId) => {
    setTargetQueueId(queueId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancelQueue = async () => {
    if (!targetQueueId) return;
    setCancelLoading(true);
    try {
      await cancelQueue(targetQueueId);
      toast.success("Client entry removed from queue!");
      setCancelModalOpen(false);
      setTargetQueueId(null);
      fetchSalonAndQueue(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel queue entry.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Derived statistics
  const currentServing = queueItems.find((q) => q.status === "in_service");
  const waitingList = queueItems.filter((q) => q.status === "waiting");

  if (loading) {
    return <Loader message="Loading waitlist queue..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="owner-welcome-card">
        <div className="owner-welcome-icon">
          <Clock size={36} style={{ color: "var(--brand-accent)" }} />
        </div>
        <h3 className="owner-welcome-title">Salon Setup Required</h3>
        <p className="owner-welcome-desc">
          You have not registered a salon profile yet. Please complete your salon setup first.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <Link
            to="/owner/dashboard?register=true"
            className="owner-btn owner-btn-solid-gold"
            style={{ padding: "0.875rem 2rem", fontSize: "0.875rem", borderRadius: "12px", textDecoration: "none", display: "inline-flex" }}
          >
            Go to Onboarding Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-page-wrapper">
      {/* Overview Cards */}
      <div className="owner-stat-grid">
        {/* Card 1 */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Clients Waiting</span>
            <div className="owner-stat-icon" style={{ background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.15)" }}>
              <Clock size={16} style={{ color: "var(--brand-accent)" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value">{waitingList.length}</h3>
            <p className="owner-stat-sub text-zinc-500">In line to be served</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Currently Serving</span>
            <div className="owner-stat-icon" style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
              <Play size={16} style={{ color: "#60a5fa" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            {currentServing ? (
              <div>
                <h3 className="owner-stat-value" style={{ fontSize: "1.25rem", color: "var(--brand-accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentServing.customer?.name}</h3>
                <p className="owner-stat-sub text-zinc-400">{currentServing.service?.name} (Token: #{currentServing.tokenNumber})</p>
              </div>
            ) : (
              <div>
                <h3 className="owner-stat-value" style={{ fontSize: "1.25rem", color: "#52525b", fontStyle: "italic" }}>No Active Client</h3>
                <p className="owner-stat-sub text-zinc-550">Start next client from list</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3 */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Next In Line</span>
            <div className="owner-stat-icon" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <Clock size={16} style={{ color: "#34d399" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            {waitingList.length > 0 ? (
              <div>
                <h3 className="owner-stat-value" style={{ fontSize: "1.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{waitingList[0].customer?.name}</h3>
                <p className="owner-stat-sub text-zinc-400">Token: #{waitingList[0].tokenNumber}</p>
              </div>
            ) : (
              <div>
                <h3 className="owner-stat-value" style={{ fontSize: "1.25rem", color: "#52525b", fontStyle: "italic" }}>No one in line</h3>
                <p className="owner-stat-sub text-zinc-550">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Waitlist Table */}
      <div className="owner-card">
        <div className="owner-card-header">
          <h3 className="owner-card-title">
            <Clock size={20} style={{ color: "var(--brand-accent)" }} /> Queue Waitlist — {salon?.name}
          </h3>
          <span className="owner-live-indicator">
            <span className="owner-live-dot"></span> Auto-refreshing
          </span>
        </div>
        <div className="owner-card-pad">
          {queueItems.length === 0 ? (
            <div className="owner-empty">
              <div className="owner-empty-icon">
                <Clock size={24} className="text-zinc-500" />
              </div>
              <h4 className="owner-empty-title">Queue is Clear</h4>
              <p className="owner-empty-desc">
                Customers will join the queue once checked-in from their bookings dashboard.
              </p>
            </div>
          ) : (
            <div className="owner-table-container">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Token Code</th>
                    <th>Token #</th>
                    <th>Client</th>
                    <th>Phone</th>
                    <th>Service</th>
                    <th>Wait time</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queueItems.map((q) => (
                    <tr key={q._id} style={{ background: q.status === "in_service" ? "rgba(59, 130, 246, 0.03)" : "transparent" }}>
                      <td style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--brand-accent)", fontSize: "1rem" }}>{q.tokenCode}</td>
                      <td style={{ fontWeight: 700, color: "#ffffff" }}>#{q.tokenNumber}</td>
                      <td style={{ fontWeight: 700, color: "#ffffff" }}>{q.customer?.name}</td>
                      <td style={{ fontWeight: 650, color: "#a1a1aa" }}>{q.customer?.phone || "N/A"}</td>
                      <td style={{ fontWeight: 700 }}>{q.service?.name}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#a1a1aa" }}>{q.estimatedWaitTime} mins</td>
                      <td>
                        <span
                          className={`owner-badge ${
                            q.status === "in_service"
                              ? "owner-badge-blue"
                              : "owner-badge-amber"
                          }`}
                        >
                          {q.status.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="inline-flex gap-2 justify-end">
                          {q.status === "waiting" && (
                            <button
                              onClick={() => handleQueueAction(q._id, startService, "Client service started! 💈")}
                              className="owner-btn owner-btn-solid-gold"
                            >
                              <Play size={10} fill="currentColor" /> Start
                            </button>
                          )}
                          {q.status === "in_service" && (
                            <button
                              onClick={() => handleQueueAction(q._id, completeQueue, "Client service completed! 🎉")}
                              className="owner-btn owner-btn-solid-green"
                            >
                              <Check size={10} strokeWidth={3} /> Complete
                            </button>
                          )}
                          <button
                            onClick={() => triggerCancelQueue(q._id)}
                            className="owner-btn owner-btn-red"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Styled React Queue Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal owner-modal-sm">
            <div className="owner-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="owner-modal-icon" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <HelpCircle size={18} style={{ color: "#f87171" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "white", margin: 0 }}>Cancel Entry</h3>
                  <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0.125rem 0 0" }}>Remove client from queue line</p>
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#d4d4d8", lineHeight: 1.6 }}>
              Are you sure you want to cancel and remove this client from the queue waitlist? This cannot be undone.
            </p>

            <div className="owner-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setTargetQueueId(null);
                }}
                className="owner-btn owner-btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelQueue}
                disabled={cancelLoading}
                className="owner-btn owner-btn-solid-red"
                style={{ background: "#ef4444", borderColor: "#ef4444", color: "#ffffff" }}
              >
                {cancelLoading ? "Removing..." : "Remove Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerQueue;

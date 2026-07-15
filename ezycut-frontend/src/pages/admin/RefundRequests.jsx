import { useEffect, useState } from "react";
import {
  getRefundRequests,
  approveRefundRequest,
  rejectRefundRequest,
} from "../../api/payment.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  IndianRupee,
  User,
  CalendarDays,
} from "lucide-react";

const AdminRefundRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // paymentId being processed

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getRefundRequests();
      setRequests(res.requests || []);
    } catch {
      toast.error("Failed to load refund requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (paymentId) => {
    setActionLoading(paymentId);
    try {
      await approveRefundRequest(paymentId);
      toast.success("Refund approved and processed via Razorpay ✓");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve refund.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionNote.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setActionLoading(rejectPaymentId);
    try {
      await rejectRefundRequest(rejectPaymentId, rejectionNote);
      toast.success("Refund request rejected.");
      setShowRejectModal(false);
      setRejectionNote("");
      setRejectPaymentId(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject refund.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader message="Loading refund requests..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          borderRadius: "1.25rem",
          padding: "1.75rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 32px rgba(15,52,96,0.3)",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px",
              padding: "0.25rem 0.75rem",
              fontSize: "0.675rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#93c5fd",
              marginBottom: "0.6rem",
            }}
          >
            <IndianRupee size={11} /> Admin Panel
          </span>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
            }}
          >
            Refund Requests
          </h2>
          <p style={{ color: "#93c5fd", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Review and action customer cancellation refund requests
          </p>
        </div>
        <button
          onClick={fetchRequests}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: "0.75rem",
            padding: "0.6rem 1.1rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stats Badge ── */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: requests.length > 0 ? "#fef3c7" : "#f0fdf4",
          border: `1px solid ${requests.length > 0 ? "#fde68a" : "#bbf7d0"}`,
          borderRadius: "0.75rem",
          padding: "0.6rem 1rem",
          fontSize: "0.825rem",
          fontWeight: 700,
          color: requests.length > 0 ? "#92400e" : "#166534",
          width: "fit-content",
        }}
      >
        <AlertTriangle size={14} />
        {requests.length} Pending Request{requests.length !== 1 ? "s" : ""}
      </div>

      {/* ── Requests List ── */}
      {requests.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #f0f0f0",
            borderRadius: "1.25rem",
            padding: "3.5rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <CheckCircle size={26} color="#16a34a" />
          </div>
          <h3 style={{ fontWeight: 800, color: "#1f2937", marginBottom: "0.4rem" }}>
            All Clear!
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            No pending refund requests at the moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map((req) => (
            <div
              key={req._id}
              style={{
                background: "#fff",
                border: "1px solid #f3f4f6",
                borderRadius: "1rem",
                padding: "1.25rem 1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              {/* Left: Customer & booking info */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#0d9488,#022525)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                    }}
                  >
                    {req.customer?.name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem" }}>
                      {req.customer?.name}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {req.customer?.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    <IndianRupee size={11} /> ₹{req.amount}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    {req.service?.name}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    <User size={10} /> {req.salon?.name}
                  </span>
                  {req.booking?.bookingDate && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        padding: "0.25rem 0.6rem",
                        fontSize: "0.75rem",
                        color: "#374151",
                        fontWeight: 600,
                      }}
                    >
                      <CalendarDays size={10} />{" "}
                      {new Date(req.booking.bookingDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {req.refundReason && (
                  <p
                    style={{
                      marginTop: "0.6rem",
                      fontSize: "0.78rem",
                      color: "#6b7280",
                      fontStyle: "italic",
                      borderLeft: "3px solid #e5e7eb",
                      paddingLeft: "0.6rem",
                    }}
                  >
                    &ldquo;{req.refundReason}&rdquo;
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    marginTop: "0.5rem",
                    color: "#9ca3af",
                    fontSize: "0.72rem",
                  }}
                >
                  <Clock size={11} /> Requested{" "}
                  {new Date(req.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Right: Action buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => handleApprove(req._id)}
                  disabled={actionLoading === req._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: actionLoading === req._id ? "#d1fae5" : "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.625rem",
                    padding: "0.55rem 1rem",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: actionLoading === req._id ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
                    transition: "all 0.2s",
                    opacity: actionLoading === req._id ? 0.7 : 1,
                  }}
                >
                  <CheckCircle size={13} />
                  {actionLoading === req._id ? "Processing..." : "Approve Refund"}
                </button>
                <button
                  onClick={() => {
                    setRejectPaymentId(req._id);
                    setShowRejectModal(true);
                  }}
                  disabled={actionLoading === req._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "#fff",
                    color: "#ef4444",
                    border: "1px solid #fecaca",
                    borderRadius: "0.625rem",
                    padding: "0.55rem 1rem",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: actionLoading === req._id ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: actionLoading === req._id ? 0.5 : 1,
                  }}
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Rejection Reason Modal ── */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "1.25rem",
              padding: "1.75rem",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.2rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XCircle size={20} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: "#111827", margin: 0 }}>Reject Refund Request</h3>
                <p style={{ color: "#6b7280", fontSize: "0.78rem", margin: "0.2rem 0 0" }}>
                  Provide a reason so the customer is informed.
                </p>
              </div>
            </div>
            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g., Cancellation was made within 2 hours of appointment..."
              rows={4}
              style={{
                width: "100%",
                border: "1.5px solid #e5e7eb",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                fontSize: "0.875rem",
                color: "#111827",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionNote("");
                  setRejectPaymentId(null);
                }}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#374151",
                  borderRadius: "0.625rem",
                  padding: "0.55rem 1.1rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === rejectPaymentId}
                style={{
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  borderRadius: "0.625rem",
                  padding: "0.55rem 1.25rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: actionLoading === rejectPaymentId ? 0.6 : 1,
                }}
              >
                {actionLoading === rejectPaymentId ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefundRequests;

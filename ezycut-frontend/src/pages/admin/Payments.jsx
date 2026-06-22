import { useEffect, useState } from "react";
import {
  getAllPayments,
  refundPayment,
} from "../../api/payment.api";
import toast from "../../utils/toast";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Refund Modal States
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPaymentsList = async () => {
    try {
      const data = await getAllPayments();
      setPayments(data.payments);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch platform transaction logs ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsList();
  }, []);

  const handleRefund = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setRefundReason("");
    setRefundModalOpen(true);
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    if (!selectedPaymentId) return;
    setRefundLoading(true);
    try {
      await refundPayment(selectedPaymentId, refundReason);
      toast.success("Refund processed successfully! 🎉");
      setRefundModalOpen(false);
      setSelectedPaymentId(null);
      setRefundReason("");
      fetchPaymentsList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid": return "admin-badge admin-badge-green";
      case "refunded": return "admin-badge admin-badge-amber";
      case "failed": return "admin-badge admin-badge-red";
      default: return "admin-badge admin-badge-neutral";
    }
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

  return (
    <div className="admin-page-wrapper">

      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Global Payments Ledger</div>
          <div className="admin-page-desc">
            Audit all online transaction logs, razorpay references, and issue universal refunds
          </div>
        </div>
        <span className="admin-page-badge">{payments.length} Transactions</span>
      </div>

      {/* ── Payments Table ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">Transaction Records</div>
        </div>

        <div className="admin-card-pad" style={{ paddingTop: "1rem" }}>
          {payments.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">💳</div>
              <div className="admin-empty-title">No Transactions Found</div>
              <div className="admin-empty-desc">Platform transactions ledger is currently empty.</div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Salon &amp; Service</th>
                    <th>Amount</th>
                    <th>Paid Date</th>
                    <th>Payment ID</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="admin-cell-primary">{p.customer?.name}</div>
                        <div className="admin-cell-secondary">{p.customer?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#d4d4d8", fontSize: "0.875rem" }}>
                          {p.salon?.name || "N/A"}
                        </div>
                        <div className="admin-cell-secondary">{p.service?.name}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: "#f4f4f5", fontSize: "0.9375rem" }}>
                          ₹{p.amount}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}
                      </td>
                      <td>
                        <span className="admin-cell-mono">{p.razorpayPaymentId || "N/A"}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={getStatusClass(p.status)}>{p.status}</span>
                      </td>
                      <td>
                        {p.status === "paid" ? (
                          <button
                            onClick={() => handleRefund(p._id)}
                            className="admin-btn admin-btn-amber"
                          >
                            Refund
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#52525b", fontStyle: "italic" }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Refund Modal ── */}
      {refundModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div>
              <div className="admin-modal-title">Issue Refund</div>
              <div className="admin-modal-desc">
                Provide a reason for initiating this refund (optional)
              </div>
            </div>

            <form onSubmit={submitRefund} className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Reason (Optional)</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Booking cancelled, duplicate transaction..."
                  rows="3"
                  className="admin-form-textarea"
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setRefundModalOpen(false);
                    setSelectedPaymentId(null);
                    setRefundReason("");
                  }}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="admin-btn admin-btn-solid-red"
                >
                  {refundLoading ? (
                    <>
                      <div style={{ width: "0.875rem", height: "0.875rem", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Processing...
                    </>
                  ) : (
                    "Confirm Refund"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPayments;

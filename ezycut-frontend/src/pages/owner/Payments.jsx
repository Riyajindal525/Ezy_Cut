import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonPayments,
  refundPayment,
} from "../../api/payment.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Wallet, AlertTriangle, CreditCard, X } from "lucide-react";

const OwnerPayments = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refund Modal States
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchSalonAndPayments = async () => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const paymentsResponse = await getSalonPayments(activeSalonId);
        setPayments(paymentsResponse.payments || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salon transaction ledgers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

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
      toast.success("Refund processed successfully! 🎉. The booking has been cancelled.");
      setRefundModalOpen(false);
      setSelectedPaymentId(null);
      setRefundReason("");
      fetchSalonAndPayments();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  // Aggregates
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const netEarnings = totalPaid - totalRefunded;

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":     return "owner-badge-green";
      case "refunded": return "owner-badge-amber";
      case "failed":   return "owner-badge-red";
      default:         return "owner-badge-neutral";
    }
  };

  if (loading) {
    return <Loader message="Compiling ledger records..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="owner-welcome-card">
        <div className="owner-welcome-icon">
          <Wallet size={36} style={{ color: "var(--brand-accent)" }} />
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

      {/* Financial Summary Cards */}
      <div className="owner-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>

        {/* Gross Earnings */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Gross Earnings</span>
            <div className="owner-stat-icon" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <Wallet size={16} style={{ color: "#34d399" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value">₹{totalPaid}</h3>
            <p className="owner-stat-sub" style={{ color: "#34d399" }}>Total revenue collected</p>
          </div>
        </div>

        {/* Total Refunded */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Total Refunded</span>
            <div className="owner-stat-icon" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
              <CreditCard size={16} style={{ color: "#f87171" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value">₹{totalRefunded}</h3>
            <p className="owner-stat-sub" style={{ color: "#f87171" }}>Returned transaction funds</p>
          </div>
        </div>

        {/* Net Income */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Net Income</span>
            <div className="owner-stat-icon" style={{ background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.15)" }}>
              <Wallet size={16} style={{ color: "var(--brand-accent)" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value" style={{ color: "var(--brand-accent)" }}>₹{netEarnings}</h3>
            <p className="owner-stat-sub" style={{ color: "#fbbf24" }}>Net profit after refunds</p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="owner-card">
        <div className="owner-card-header">
          <div>
            <h3 className="owner-card-title">
              <Wallet size={18} style={{ color: "var(--brand-accent)" }} />
              Payment Transactions — {salon?.name}
            </h3>
            <p className="owner-card-subtitle">{payments.length} transaction{payments.length !== 1 ? "s" : ""} recorded</p>
          </div>
        </div>
        <div className="owner-card-pad">
          {payments.length === 0 ? (
            <div className="owner-empty">
              <div className="owner-empty-icon">
                <CreditCard size={24} color="#52525b" />
              </div>
              <p className="owner-empty-title">No Transactions Recorded</p>
              <p className="owner-empty-desc">
                Any online checkout transactions completed by clients will populate here.
              </p>
            </div>
          ) : (
            <div className="owner-table-container">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Paid Date</th>
                    <th>Payment ID</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#ffffff" }}>{p.customer?.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.125rem" }}>{p.customer?.email}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.service?.name}</td>
                      <td style={{ fontWeight: 800, color: "var(--brand-accent)", fontSize: "1rem" }}>₹{p.amount}</td>
                      <td style={{ color: "#71717a" }}>{p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#a1a1aa" }}>{p.razorpayPaymentId || "N/A"}</td>
                      <td>
                        <span className={`owner-badge ${getStatusClass(p.status)}`}>{p.status}</span>
                      </td>
                      <td>
                        {p.status === "paid" ? (
                          <button
                            onClick={() => handleRefund(p._id)}
                            className="owner-btn owner-btn-amber"
                          >
                            Issue Refund
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#52525b", fontStyle: "italic" }}>Unavailable</span>
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

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal owner-modal-md">
            <div className="owner-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="owner-modal-icon" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <AlertTriangle size={18} style={{ color: "#f87171" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "white", margin: 0 }}>Issue Refund</h3>
                  <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0.125rem 0 0" }}>Initiate payment chargeback</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="owner-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitRefund} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Reason (Optional)</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Salon closed today, customer requested cancellation..."
                  rows="3"
                  className="owner-form-textarea"
                />
              </div>

              <div className="owner-modal-footer" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  onClick={() => {
                    setRefundModalOpen(false);
                    setSelectedPaymentId(null);
                    setRefundReason("");
                  }}
                  className="owner-btn owner-btn-outline"
                  style={{ padding: "0.6rem 1.125rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="owner-btn owner-btn-solid-red"
                  style={{ padding: "0.6rem 1.375rem" }}
                >
                  {refundLoading ? "Processing..." : "Confirm Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPayments;

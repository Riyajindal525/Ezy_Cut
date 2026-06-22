import { useEffect, useState } from "react";
import { IndianRupee, Calendar, MapPin, ReceiptText, RefreshCw } from "lucide-react";
import { getMyPayments } from "../../api/payment.api";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import toast from "../../utils/toast";

const statusConfig = {
  paid: { label: "Paid", class: "badge-paid" },
  created: { label: "Pending", class: "badge-pending" },
  failed: { label: "Failed", class: "badge-cancelled" },
  refunded: { label: "Refunded", class: "badge-refunded" },
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getMyPayments();
        setPayments(data.payments);
      } catch (err) {
        toast.error("Failed to load payment history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Summary
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  if (loading) return <Loader message="Loading payment history..." />;

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="page-container">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="page-title">Payment History</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>{payments.length} transaction{payments.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Summary Cards */}
        {payments.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div className="stat-card">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value" style={{ fontSize: "1.75rem" }}>₹{totalPaid}</div>
              <div className="stat-sub">Paid transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Refunded</div>
              <div className="stat-value" style={{ fontSize: "1.75rem", color: "var(--brand-accent)" }}>₹{totalRefunded}</div>
              <div className="stat-sub">Returned to you</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Net Spent</div>
              <div className="stat-value" style={{ fontSize: "1.75rem", color: "var(--success)" }}>₹{totalPaid - totalRefunded}</div>
              <div className="stat-sub">After refunds</div>
            </div>
          </div>
        )}

        {/* Payment list */}
        {payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            description="Your payment transactions will appear here after you book a service."
            icon={ReceiptText}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {payments.map((payment) => {
              const status = statusConfig[payment.status] || { label: payment.status, class: "badge-pending" };

              return (
                <div key={payment._id} className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    {/* Icon */}
                    <div style={{
                      width: "2.75rem", height: "2.75rem",
                      borderRadius: "var(--radius-md)",
                      background: payment.status === "paid" ? "var(--success-light)" : payment.status === "refunded" ? "#f5f3ff" : "var(--danger-light)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <IndianRupee size={18} style={{ color: payment.status === "paid" ? "var(--success)" : payment.status === "refunded" ? "#7c3aed" : "var(--danger)" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <div>
                          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)" }}>
                            {payment.salon?.name}
                          </h2>
                          <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{payment.service?.name}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gray-800)" }}>₹{payment.amount}</div>
                          <span className={`badge ${status.class}`} style={{ marginTop: "0.25rem" }}>{status.label}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <Calendar size={12} />
                          {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        {payment.salon?.city && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <MapPin size={12} />
                            {payment.salon.city}
                          </div>
                        )}
                        {payment.refundStatus && payment.refundStatus !== "none" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <RefreshCw size={12} />
                            Refund: {payment.refundStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
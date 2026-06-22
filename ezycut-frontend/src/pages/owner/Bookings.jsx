import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonBookings,
  completeBooking,
  markNoShow,
  ownerCancelBooking,
} from "../../api/booking.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Calendar, User, Phone, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

const OwnerBookings = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Confirmation Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [modalActionFn, setModalActionFn] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSalonAndBookings = async () => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const bookingsResponse = await getSalonBookings(activeSalonId);
        setBookings(bookingsResponse.bookings || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salon appointments ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const triggerActionConfirmation = (bookingId, actionFn, warningText) => {
    setSelectedBookingId(bookingId);
    setModalActionFn(() => actionFn);
    setModalMessage(warningText);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBookingId || !modalActionFn) return;
    setActionLoading(true);
    try {
      await modalActionFn(selectedBookingId);
      toast.success("Booking status updated successfully!");
      setShowConfirmModal(false);
      setSelectedBookingId(null);
      setModalActionFn(null);
      fetchSalonAndBookings(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update booking status.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "owner-badge-green";
      case "completed":
        return "owner-badge-blue";
      case "no_show":
        return "owner-badge-amber";
      case "cancelled_by_customer":
      case "cancelled_by_owner":
        return "owner-badge-red";
      default:
        return "owner-badge-neutral";
    }
  };

  if (loading) {
    return <Loader message="Loading appointments logs..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="owner-welcome-card">
        <div className="owner-welcome-icon">
          <Calendar size={36} style={{ color: "var(--brand-accent)" }} />
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
      {/* Header Panel */}
      <div className="owner-page-header">
        <div>
          <h3 className="owner-page-title">{salon?.name} Appointments</h3>
          <p className="owner-page-desc">View schedules and update reservation statuses</p>
        </div>
        <span className={`owner-badge ${salon?.isApproved ? "owner-badge-green" : "owner-badge-amber"}`}>
          {salon?.isApproved ? "Approved & Live" : "Pending Review"}
        </span>
      </div>

      {/* Bookings Table Card */}
      <div className="owner-card">
        <div className="owner-card-header">
          <h3 className="owner-card-title">Appointments Ledger</h3>
        </div>
        <div className="owner-card-pad">
          {bookings.length === 0 ? (
            <div className="owner-empty">
              <div className="owner-empty-icon">
                <Calendar size={24} className="text-zinc-500" />
              </div>
              <h4 className="owner-empty-title">No Appointments Logged</h4>
              <p className="owner-empty-desc">
                Customers will see slots and book through your salon page once it is live.
              </p>
            </div>
          ) : (
            <div className="owner-table-container">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time slot</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className="owner-avatar">
                            {b.customer?.name?.slice(0, 2).toUpperCase() || "CU"}
                          </div>
                          <span style={{ fontWeight: 700, color: "#ffffff" }}>{b.customer?.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 650, color: "#a1a1aa" }}>{b.customer?.phone || "N/A"}</td>
                      <td style={{ fontWeight: 700 }}>{b.service?.name}</td>
                      <td style={{ color: "#71717a" }}>{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#a1a1aa" }}>{b.startTime} - {b.endTime}</td>
                      <td style={{ fontWeight: 800, color: "#ffffff", fontSize: "1rem" }}>₹{b.totalAmount}</td>
                      <td>
                        <span className={`owner-badge ${getStatusBadgeClass(b.status)}`}>
                          {b.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {b.status === "confirmed" ? (
                          <div className="inline-flex gap-2 justify-end">
                            <button
                              onClick={() => triggerActionConfirmation(b._id, completeBooking, "Are you sure you want to mark this booking as completed?")}
                              className="owner-btn owner-btn-green"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => triggerActionConfirmation(b._id, markNoShow, "Are you sure you want to mark this client as a No Show?")}
                              className="owner-btn owner-btn-amber"
                            >
                              No Show
                            </button>
                            <button
                              onClick={() => triggerActionConfirmation(b._id, ownerCancelBooking, "Cancel this booking? Note: Refund must be processed manually if payment was done.")}
                              className="owner-btn owner-btn-red"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#52525b", fontStyle: "italic" }}>No actions</span>
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

      {/* Styled React Confirmation Modal */}
      {showConfirmModal && (
        <div className="owner-modal-overlay">
          <div className="owner-modal owner-modal-md">
            <div className="owner-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="owner-modal-icon" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <AlertTriangle size={18} style={{ color: "#fbbf24" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "white", margin: 0 }}>Confirm Booking Action</h3>
                  <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0.125rem 0 0" }}>Please review before completing action</p>
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#d4d4d8", lineHeight: 1.6 }}>
              {modalMessage}
            </p>

            <div className="owner-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBookingId(null);
                  setModalActionFn(null);
                }}
                className="owner-btn owner-btn-outline"
                style={{ padding: "0.625rem 1.25rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="owner-btn owner-btn-solid-gold"
                style={{ padding: "0.625rem 1.25rem" }}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;

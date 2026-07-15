import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  Users,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cancelBooking } from "../../api/booking.api";
import useBookingStore from "../../store/booking.store";
import { joinQueue } from "../../api/queue.api";
import ReviewModal from "../../components/review/ReviewModal";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import toast from "../../utils/toast";

const statusConfig = {
  confirmed: { label: "Confirmed", class: "badge-confirmed", icon: CheckCircle },
  completed: { label: "Completed", class: "badge-completed", icon: CheckCircle },
  cancelled: { label: "Cancelled", class: "badge-cancelled", icon: XCircle },
  cancelled_by_owner: { label: "Cancelled by Owner", class: "badge-cancelled", icon: XCircle },
  cancelled_by_customer: { label: "Cancelled", class: "badge-cancelled", icon: XCircle },
  no_show: { label: "No Show", class: "badge-no_show", icon: AlertCircle },
};

const MyBookings = () => {
  const fetchMyBookings = useBookingStore((state) => state.fetchMyBookings);
  const bookings = useBookingStore((state) => state.myBookings);
  const cancelBookingInCache = useBookingStore((state) => state.cancelBookingInCache);

  const [loading, setLoading] = useState(true);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchBookings = async (force = false) => {
    try {
      await fetchMyBookings(force);
    } catch (err) {
      toast.error("Failed to load bookings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking? This action cannot be undone.")) return;
    setActionLoading((p) => ({ ...p, [`cancel_${bookingId}`]: true }));
    try {
      await cancelBooking(bookingId);
      cancelBookingInCache(bookingId);
      toast.success("Booking cancelled successfully.");
      fetchBookings(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed.");
    } finally {
      setActionLoading((p) => ({ ...p, [`cancel_${bookingId}`]: false }));
    }
  };

  const handleJoinQueue = async (bookingId) => {
    setActionLoading((p) => ({ ...p, [`queue_${bookingId}`]: true }));
    try {
      const data = await joinQueue(bookingId);
      toast.success(data.message || "Joined queue successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join queue.");
    } finally {
      setActionLoading((p) => ({ ...p, [`queue_${bookingId}`]: false }));
    }
  };

  if (loading) return <Loader message="Loading your bookings..." />;

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="page-container">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p style={{ color: "var(--gray-500)", marginTop: "0.25rem", fontSize: "0.9375rem" }}>
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Link to="/salons" className="btn btn-primary" style={{ gap: "0.375rem" }}>
            + New Booking
          </Link>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Start exploring salons and book your first appointment today."
            action={<Link to="/salons" className="btn btn-primary">Explore Salons</Link>}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || { label: booking.status, class: "badge-pending" };
              const isConfirmed = booking.status === "confirmed";
              const isCompleted = booking.status === "completed";

              return (
                <div key={booking._id} className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    {/* Salon icon */}
                    <div style={{
                      width: "3rem", height: "3rem",
                      borderRadius: "var(--radius-md)",
                      background: "linear-gradient(135deg, var(--brand-primary), #312e81)",
                      color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.125rem", fontWeight: 800, flexShrink: 0,
                    }}>
                      {booking.salon?.name?.charAt(0)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                        <div>
                          <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: "0.25rem" }}>
                            {booking.salon?.name}
                          </h2>
                          <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{booking.service?.name}</p>
                        </div>
                        <span className={`badge ${status.class}`}>{status.label}</span>
                      </div>

                      {/* Details grid */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <Calendar size={13} />
                          {new Date(booking.bookingDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <Clock size={13} />
                          <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                            {booking.startTime} – {booking.endTime}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 700, color: "var(--gray-700)" }}>
                          <IndianRupee size={13} />
                          ₹{booking.totalAmount}
                        </div>
                        {booking.notes && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <FileText size={13} />
                            {booking.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {(isConfirmed || isCompleted) && (
                        <div style={{ display: "flex", gap: "0.625rem", marginTop: "1rem", flexWrap: "wrap" }}>
                          {isConfirmed && (
                            <>
                              <button
                                onClick={() => handleJoinQueue(booking._id)}
                                disabled={actionLoading[`queue_${booking._id}`]}
                                className="btn btn-accent btn-sm"
                                style={{ gap: "0.375rem" }}
                              >
                                <Users size={13} />
                                {actionLoading[`queue_${booking._id}`] ? "Joining..." : "Join Queue"}
                              </button>
                              <button
                                onClick={() => handleCancel(booking._id)}
                                disabled={actionLoading[`cancel_${booking._id}`]}
                                className="btn btn-danger btn-sm"
                                style={{ gap: "0.375rem" }}
                              >
                                <XCircle size={13} />
                                {actionLoading[`cancel_${booking._id}`] ? "Cancelling..." : "Cancel"}
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <button
                              onClick={() => setReviewBookingId(booking._id)}
                              className="btn btn-outline btn-sm"
                              style={{ gap: "0.375rem" }}
                            >
                              <Star size={13} />
                              Write Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBookingId && (
        <ReviewModal
          bookingId={reviewBookingId}
          onClose={() => setReviewBookingId(null)}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};

export default MyBookings;
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
  CalendarPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cancelBooking } from "../../api/booking.api";
import useBookingStore from "../../store/booking.store";
import { joinQueue } from "../../api/queue.api";
import ReviewModal from "../../components/review/ReviewModal";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    class: "bg-teal-50 text-teal-700 border-teal-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  cancelled_by_owner: {
    label: "Cancelled by Owner",
    class: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  cancelled_by_customer: {
    label: "Cancelled",
    class: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  no_show: {
    label: "No Show",
    class: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertCircle,
  },
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
    fetchBookings();
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
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:pb-10 flex items-center justify-between flex-wrap gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">My Bookings</h1>
            <p className="text-white/60 text-sm">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <Link
            to="/salons"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/[0.16] border border-white/15 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            + New Booking
          </Link>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-4 py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
              <CalendarPlus size={26} className="text-[#0d9488]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold text-[#022525]">No bookings yet</h3>
              <p className="text-[#5b6b68] text-sm max-w-sm">
                Start exploring salons and book your first appointment today.
              </p>
            </div>
            <Link
              to="/salons"
              className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Explore Salons
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking, bi) => {
              const status = statusConfig[booking.status] || {
                label: booking.status,
                class: "bg-gray-50 text-gray-600 border-gray-200",
                icon: AlertCircle,
              };
              const StatusIcon = status.icon;
              const isConfirmed = booking.status === "confirmed";
              const isCompleted = booking.status === "completed";

              return (
                <div
                  key={booking._id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-6 animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0"
                  style={{ animationDelay: `${Math.min(bi, 8) * 70}ms` }}
                >
                  <div className="flex gap-4 sm:gap-5 flex-wrap sm:flex-nowrap">
                    {/* Salon icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#022525] text-white flex items-center justify-center text-lg font-extrabold shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      {booking.salon?.name?.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div>
                          <h2 className="text-[1.05rem] font-bold text-[#022525] mb-0.5">
                            {booking.salon?.name}
                          </h2>
                          <p className="text-sm text-[#5b6b68]">{booking.service?.name}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${status.class}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5b6b68]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#0d9488]" />
                          {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#0d9488]" />
                          <span className="font-mono font-semibold text-[#022525]">
                            {booking.startTime} – {booking.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-[#022525]">
                          <IndianRupee size={13} />
                          {booking.totalAmount}
                        </div>
                        {booking.notes && (
                          <div className="flex items-center gap-1.5">
                            <FileText size={13} className="text-[#0d9488]" />
                            {booking.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {(isConfirmed || isCompleted) && (
                        <div className="flex gap-2.5 mt-4 flex-wrap">
                          {isConfirmed && (
                            <>
                              <button
                                onClick={() => handleJoinQueue(booking._id)}
                                disabled={actionLoading[`queue_${booking._id}`]}
                                className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                              >
                                <Users size={13} />
                                {actionLoading[`queue_${booking._id}`] ? "Joining..." : "Join Queue"}
                              </button>
                              <button
                                onClick={() => handleCancel(booking._id)}
                                disabled={actionLoading[`cancel_${booking._id}`]}
                                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-600 text-xs font-semibold px-3.5 py-2 rounded-lg border border-rose-200 transition-colors"
                              >
                                <XCircle size={13} />
                                {actionLoading[`cancel_${booking._id}`] ? "Cancelling..." : "Cancel"}
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <button
                              onClick={() => setReviewBookingId(booking._id)}
                              className="inline-flex items-center gap-1.5 bg-white hover:bg-[#f0fdfa] text-[#0d9488] text-xs font-semibold px-3.5 py-2 rounded-lg border border-[#99f6e4] transition-colors"
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
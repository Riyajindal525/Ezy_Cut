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
import { Calendar, User, Phone, CheckCircle, AlertTriangle, XCircle, Clock, Scissors } from "lucide-react";

const SALON_HERO_IMG =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80";
const SALON_EMPTY_IMG =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80";

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
        return "bg-emerald-50 text-emerald-600";
      case "completed":
        return "bg-sky-50 text-sky-600";
      case "no_show":
        return "bg-amber-50 text-amber-600";
      case "cancelled_by_customer":
      case "cancelled_by_owner":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) {
    return <Loader message="Loading appointments logs..." />;
  }

  if (salons.filter((s) => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="relative h-36 overflow-hidden">
          <img src={SALON_EMPTY_IMG} alt="Salon" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16231d]/80 to-[#16231d]/20" />
        </div>
        <div className="p-8 sm:p-10 text-center -mt-10 relative">
          <div className="w-20 h-20 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <Calendar size={32} className="text-[#0d9488]" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 mb-3">Salon Setup Required</h3>
          <p className="text-gray-500 text-[0.9375rem] leading-relaxed">
            You have not registered a salon profile yet. Please complete your salon setup first.
          </p>
          <div className="mt-8">
            <Link
              to="/owner/dashboard?register=true"
              className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors"
            >
              Go to Onboarding Form
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Panel — with salon imagery */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden rounded-3xl shadow-xl`}
      >
        <img src={SALON_HERO_IMG} alt="Salon" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#16231d]/95 via-[#1d302a]/90 to-[#2a4238]/70" />
        <div className="relative px-6 sm:px-10 py-8 sm:py-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#a8dcc4] mb-3">
              <Scissors size={12} /> Appointments Ledger
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{salon?.name} Appointments</h3>
            <p className="text-[#c3d9cd] text-sm mt-1">View schedules and update reservation statuses</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
              salon?.isApproved ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30" : "bg-amber-400/15 text-amber-300 border border-amber-400/30"
            }`}
          >
            {salon?.isApproved ? "Approved & Live" : "Pending Review"}
          </span>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div {...fadeUp(120)} className={`${fadeUp(120).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Clock size={17} className="text-[#0d9488]" /> Appointments Ledger
          </h3>
        </div>
        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-4 py-12">
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md">
                <img src={SALON_EMPTY_IMG} alt="No bookings" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#16231d]/40 flex items-center justify-center">
                  <Calendar size={24} className="text-white" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-700">No Appointments Logged</h4>
              <p className="text-sm text-gray-400 max-w-sm">
                Customers will see slots and book through your salon page once it is live.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Customer</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Contact</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Service</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Date</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Time slot</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Amount</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Status</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr
                      key={b._id}
                      {...fadeUp(160 + i * 40)}
                      className={`${fadeUp(160 + i * 40).className} border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition-colors`}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d9488] to-[#022525] text-white flex items-center justify-center text-[0.6875rem] font-extrabold shrink-0 shadow-sm">
                            {b.customer?.name?.slice(0, 2).toUpperCase() || "CU"}
                          </div>
                          <span className="font-bold text-gray-800">{b.customer?.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-gray-500">{b.customer?.phone || "N/A"}</td>
                      <td className="py-3.5 pr-4 font-bold text-gray-700">{b.service?.name}</td>
                      <td className="py-3.5 pr-4 text-gray-400">{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td className="py-3.5 pr-4 font-mono font-semibold text-gray-600">
                        {b.startTime} - {b.endTime}
                      </td>
                      <td className="py-3.5 pr-4 font-extrabold text-gray-800 text-base">₹{b.totalAmount}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full ${getStatusBadgeClass(b.status)}`}>
                          {b.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {b.status === "confirmed" ? (
                          <div className="inline-flex gap-1.5 justify-end flex-wrap">
                            <button
                              onClick={() =>
                                triggerActionConfirmation(b._id, completeBooking, "Are you sure you want to mark this booking as completed?")
                              }
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle size={12} /> Complete
                            </button>
                            <button
                              onClick={() =>
                                triggerActionConfirmation(b._id, markNoShow, "Are you sure you want to mark this client as a No Show?")
                              }
                              className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <AlertTriangle size={12} /> No Show
                            </button>
                            <button
                              onClick={() =>
                                triggerActionConfirmation(
                                  b._id,
                                  ownerCancelBooking,
                                  "Cancel this booking? Note: Refund must be processed manually if payment was done."
                                )
                              }
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No actions</span>
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.25s_ease]">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Confirm Booking Action</h3>
                <p className="text-xs text-gray-400 mt-0.5">Please review before completing action</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{modalMessage}</p>

            <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBookingId(null);
                  setModalActionFn(null);
                }}
                className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="inline-flex items-center bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors"
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
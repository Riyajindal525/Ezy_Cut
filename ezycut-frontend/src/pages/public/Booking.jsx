import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  IndianRupee,
  Tag,
  FileText,
  CheckCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { getServiceById } from "../../api/service.api";
import { createOrder, verifyPayment } from "../../api/payment.api";
import useBookingStore from "../../store/booking.store";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const fetchSlotsFromStore = useBookingStore((state) => state.fetchSlots);

  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Today's date for min input
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(serviceId);
        setService(data.service);
      } catch (err) {
        toast.error("Service not found.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setSelectedSlot("");
    setSlots([]);

    if (!selectedDate) return;

    setSlotsLoading(true);
    try {
      const fetchedSlots = await fetchSlotsFromStore(service.salon, service._id, selectedDate);
      setSlots(fetchedSlots);
      if (!fetchedSlots.length) {
        toast.info("No available slots for this date. Try another day.");
      }
    } catch (err) {
      toast.error("Failed to fetch available slots.");
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!date) { toast.warning("Please select a date."); return; }
    if (!selectedSlot) { toast.warning("Please select a time slot."); return; }

    setPayLoading(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Please check your connection.");
      setPayLoading(false);
      return;
    }

    try {
      const orderData = await createOrder({
        salonId: service.salon,
        serviceId: service._id,
        bookingDate: date,
        startTime: selectedSlot,
        notes,
      });

      const options = {
        key: orderData.order.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.orderId,
        name: "EzyCut",
        description: service.name,
        theme: { color: "#0d9488" },
        handler: async function (response) {
          try {
            await verifyPayment({
              paymentId: orderData.order.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Booking confirmed! 🎉");
            navigate("/my-bookings");
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
            console.error(err);
          } finally {
            setPayLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
      setPayLoading(false);
    }
  };

  if (loading) return <Loader message="Loading service details..." />;

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white pt-24">
        <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
          <Calendar size={26} className="text-[#0d9488]" />
        </div>
        <h2 className="text-2xl font-bold text-[#374151]">Service Not Found</h2>
        <Link
          to="/salons"
          className="inline-flex items-center gap-1.5 border border-gray-200 text-[#134e4a] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#f0fdfa] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Salons
        </Link>
      </div>
    );
  }

  // step progress: 1 = date, 2 = slot, 3 = confirm
  const step = selectedSlot ? 3 : date ? 2 : 1;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-white pt-24 md:pt-28 pb-16">
      <div className="page-container max-w-[760px]">
        {/* Back */}
        <Link
          to={`/salons/${service.salon}`}
          className="inline-flex items-center gap-1.5 border border-gray-200 text-[#134e4a] text-sm font-semibold px-3.5 py-2 rounded-lg mb-5 hover:bg-[#f0fdfa] hover:border-[#0d9488]/30 transition-all duration-200 animate-[ezcFadeUp_0.4s_ease_forwards]"
        >
          <ArrowLeft size={14} />
          Back to Salon
        </Link>

        <h1
          className="text-2xl md:text-3xl font-extrabold text-[#022525] tracking-[-0.02em] mb-2 animate-[ezcFadeUp_0.4s_ease_forwards]"
          style={{ opacity: 0 }}
        >
          Book Appointment
        </h1>
        <p
          className="text-sm text-[#5b6b68] mb-6 animate-[ezcFadeUp_0.4s_ease_forwards]"
          style={{ animationDelay: "40ms", opacity: 0 }}
        >
          Pick a date, choose a slot, and confirm — takes less than a minute.
        </p>

        {/* Step indicator */}
        <div
          className="flex items-center gap-2 mb-8 animate-[ezcFadeUp_0.4s_ease_forwards]"
          style={{ animationDelay: "70ms", opacity: 0 }}
        >
          {[
            { n: 1, label: "Date" },
            { n: 2, label: "Slot" },
            { n: 3, label: "Confirm" },
          ].map((s, idx) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-300 ${
                    step >= s.n
                      ? "bg-[#0d9488] text-white"
                      : "bg-[#f0fdfa] text-[#5b6b68] border border-[#ccfbf1]"
                  }`}
                >
                  {step > s.n ? <CheckCircle size={14} /> : s.n}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${
                    step >= s.n ? "text-[#134e4a]" : "text-[#9ca3af]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`h-[2px] flex-1 rounded-full transition-colors duration-300 ${
                    step > s.n ? "bg-[#0d9488]" : "bg-[#e5e7eb]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Service Info Card */}
        <div
          className="rounded-2xl border border-gray-200 overflow-hidden mb-5 shadow-sm animate-[ezcFadeUp_0.4s_ease_forwards]"
          style={{ animationDelay: "100ms", opacity: 0 }}
        >
          <div className="relative p-6 bg-gradient-to-br from-[#0f766e] to-[#042f2e] overflow-hidden">
            <div className="absolute -right-14 -top-14 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.18)_0%,transparent_70%)] pointer-events-none" />
            {service.category && (
              <span className="relative inline-flex items-center gap-1 bg-white/10 border border-white/20 text-[#5eead4] text-[0.6875rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3">
                <Tag size={10} />
                {service.category}
              </span>
            )}
            <h2 className="relative text-xl md:text-2xl font-extrabold text-white mb-1.5">{service.name}</h2>
            {service.description && (
              <p className="relative text-white/65 text-sm leading-relaxed">{service.description}</p>
            )}
          </div>

          <div className="flex items-center gap-6 p-5 bg-white">
            <div className="flex items-center gap-2 font-bold text-[#022525]">
              <IndianRupee size={16} className="text-[#0d9488]" />
              <span className="text-xl">₹{service.price}</span>
            </div>
            <div className="flex items-center gap-2 text-[#5b6b68] text-sm">
              <Clock size={15} />
              {service.duration} minutes
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm animate-[ezcFadeUp_0.4s_ease_forwards]"
          style={{ animationDelay: "140ms", opacity: 0 }}
        >
          <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold text-[#022525] mb-4">
            <Calendar size={16} className="text-[#0d9488]" />
            Select Date
          </h3>
          <input
            type="date"
            value={date}
            min={today}
            onChange={handleDateChange}
            className="w-full max-w-[240px] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#022525] outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15 transition-all duration-150"
          />
        </div>

        {/* Slots */}
        {date && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm animate-[ezcFadeUp_0.35s_ease_forwards]" style={{ opacity: 0 }}>
            <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold text-[#022525] mb-4">
              <Clock size={16} className="text-[#0d9488]" />
              Available Slots
            </h3>

            {slotsLoading ? (
              <div className="flex items-center gap-2.5 text-[#5b6b68] text-sm py-2">
                <Loader2 size={16} className="animate-spin text-[#0d9488]" />
                Fetching available slots...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-[#5b6b68] text-sm">No slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`font-mono text-[0.8125rem] font-bold rounded-lg py-2.5 border transition-all duration-150 ${
                      selectedSlot === slot
                        ? "bg-[#0d9488] border-[#0d9488] text-white shadow-md shadow-[#0d9488]/20"
                        : "bg-white border-gray-200 text-[#374151] hover:border-[#0d9488]/40 hover:bg-[#f0fdfa]"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Confirmation & Notes */}
        {selectedSlot && (
          <div
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-[ezcFadeUp_0.35s_ease_forwards]"
            style={{ opacity: 0 }}
          >
            <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold text-[#022525] mb-4">
              <CheckCircle size={16} className="text-[#0d9488]" />
              Confirm Booking
            </h3>

            {/* Summary */}
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-4 mb-5 flex flex-col gap-2.5 text-sm">
              <div className="flex gap-2">
                <span className="text-[#5b6b68] min-w-[80px]">Date</span>
                <span className="font-semibold text-[#022525]">
                  {new Date(date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#5b6b68] min-w-[80px]">Time</span>
                <span className="font-semibold text-[#022525] font-mono">{selectedSlot}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#5b6b68] min-w-[80px]">Amount</span>
                <span className="font-bold text-[#022525]">₹{service.price}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#5b6b68] uppercase tracking-wide">
                <FileText size={13} />
                Special Requests (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#022525] outline-none resize-y focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/15 transition-all duration-150 placeholder:text-[#9ca3af]"
                placeholder="Any special requests, preferences, or notes for the salon..."
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={payLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-[#0d9488]/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              {payLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee size={16} />
                  Pay ₹{service.price} & Confirm
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-[#9ca3af] mt-3">
              <ShieldCheck size={12} />
              Secured by Razorpay. Your payment info is never stored.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
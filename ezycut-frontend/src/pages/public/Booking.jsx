import { useEffect, useState, useRef } from "react";
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
  Gift,
  X,
} from "lucide-react";
import { getServiceById } from "../../api/service.api";
import { createOrder, verifyPayment } from "../../api/payment.api";
import { validateRewardCode } from "../../api/wallet.api";
import useBookingStore from "../../store/booking.store";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";
import { getPlatformSettings } from "../../api/invoice.api";

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
  const [gstRate, setGstRate] = useState(18);

  // Reward code states
  const [rewardInput, setRewardInput] = useState("");
  const [appliedReward, setAppliedReward] = useState(null);
  const [validatingReward, setValidatingReward] = useState(false);

  const slotsRequestId = useRef(0);
  const isValidFullDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getPlatformSettings();
        setGstRate(data.settings.gstRate);
      } catch (err) {
        console.error("Failed to fetch GST rate:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setSelectedSlot("");
    setSlots([]);

    // Ignore intermediate/incomplete values fired while user is still typing
    if (!selectedDate || !isValidFullDate(selectedDate)) return;
    const thisRequestId = ++slotsRequestId.current;

    setSlotsLoading(true);
    try {
      const fetchedSlots = await fetchSlotsFromStore(service.salon, service._id, selectedDate);
      // If a newer request has started since this one fired, drop this stale result
      if (thisRequestId !== slotsRequestId.current) return;

      setSlots(fetchedSlots);
      if (!fetchedSlots.length) {
        toast.info("No available slots for this date. Try another day.");
      }
    } catch (err) {
      if (thisRequestId !== slotsRequestId.current) return;
      toast.error("Failed to fetch available slots.");
      console.error(err);
    } finally {
      if (thisRequestId === slotsRequestId.current) {
        setSlotsLoading(false);
      }
    }
  };

  const handleApplyReward = async () => {
    if (!rewardInput.trim()) return;
    const subtotal = service.price + Math.round((service.price * gstRate) / 100);

    setValidatingReward(true);
    try {
      const res = await validateRewardCode({
        code: rewardInput.trim(),
        bookingAmount: subtotal,
      });

      if (res.valid) {
        setAppliedReward({
          code: res.code,
          discountAmount: res.discountAmount,
          minimumBookingAmount: res.minimumBookingAmount,
        });
        toast.success(`Reward applied! ₹${res.discountAmount} OFF 🎉`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired reward code.");
      setAppliedReward(null);
    } finally {
      setValidatingReward(false);
    }
  };

  const handleRemoveReward = () => {
    setAppliedReward(null);
    setRewardInput("");
    toast.info("Reward removed.");
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
        rewardCode: appliedReward ? appliedReward.code : undefined,
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

  // Price calculations
  const subtotal = service.price + Math.round((service.price * gstRate) / 100);
  const discount = appliedReward ? Math.min(appliedReward.discountAmount, subtotal) : 0;
  const finalTotal = Math.max(0, subtotal - discount);

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
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-300 ${step >= s.n
                      ? "bg-[#0d9488] text-white"
                      : "bg-[#f0fdfa] text-[#5b6b68] border border-[#ccfbf1]"
                    }`}
                >
                  {step > s.n ? <CheckCircle size={14} /> : s.n}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${step >= s.n ? "text-[#134e4a]" : "text-[#9ca3af]"
                    }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`h-[2px] flex-1 rounded-full transition-colors duration-300 ${step > s.n ? "bg-[#0d9488]" : "bg-[#e5e7eb]"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Service summary card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm animate-[ezcFadeUp_0.4s_ease_forwards]" style={{ animationDelay: "100ms", opacity: 0 }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d9488] bg-[#f0fdfa] border border-[#ccfbf1] px-2.5 py-1 rounded-full">
                Service Details
              </span>
              <h2 className="text-xl font-bold text-[#022525] mt-2">{service.name}</h2>
              <p className="text-sm text-[#5b6b68] mt-1 line-clamp-2">{service.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#5b6b68] pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1 font-semibold">
              <Clock size={14} className="text-[#0d9488]" />
              {service.duration} mins
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Tag size={14} className="text-[#0d9488]" />
              ₹{service.price} + GST ({gstRate}%)
            </span>
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
                    className={`font-mono text-[0.8125rem] font-bold rounded-lg py-2.5 border transition-all duration-150 ${selectedSlot === slot
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

        {/* Confirmation & Reward Code & Payment */}
        {selectedSlot && (
          <div
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-[ezcFadeUp_0.35s_ease_forwards]"
            style={{ opacity: 0 }}
          >
            <h3 className="flex items-center gap-2 text-[0.9375rem] font-bold text-[#022525] mb-4">
              <CheckCircle size={16} className="text-[#0d9488]" />
              Confirm Booking
            </h3>

            {/* Reward Code Section */}
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="text-[#0d9488]" size={18} />
                <h4 className="font-bold text-sm text-[#0f766e]">Have an EZYCUT Reward Code?</h4>
              </div>
              {!appliedReward ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. EZY-RDM-XXXXXX"
                    value={rewardInput}
                    onChange={(e) => setRewardInput(e.target.value.toUpperCase())}
                    className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-[#0d9488] outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyReward}
                    disabled={validatingReward || !rewardInput.trim()}
                    className="bg-[#0d9488] text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-[#0f766e] transition-colors disabled:opacity-50"
                  >
                    {validatingReward ? "Validating..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white border border-[#5eead4] rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-[#0d9488]" size={18} />
                    <div>
                      <span className="font-mono font-bold text-sm text-[#0f766e]">{appliedReward.code}</span>
                      <span className="text-xs text-[#0d9488] ml-2 font-semibold">₹{appliedReward.discountAmount} OFF Applied</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReward}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Remove Reward
                  </button>
                </div>
              )}
            </div>

            {/* Summary Price Breakdown */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Date & Time</span>
                <span className="font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} @ {selectedSlot}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal (incl. GST)</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-[#0d9488] font-bold">
                  <span>Reward Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between items-center text-base font-extrabold text-gray-900">
                <span>Total Payable</span>
                <span className="text-[#0d9488]">₹{finalTotal}</span>
              </div>
            </div>

            {/* Special Notes */}
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
                  Pay ₹{finalTotal} & Confirm
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
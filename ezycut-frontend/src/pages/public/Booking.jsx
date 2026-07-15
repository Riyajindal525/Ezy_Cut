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
        theme: { color: "#6366f1" },
        handler: async function (response) {
          try {
            await verifyPayment({
              paymentId: orderData.order.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Invalidate the cache to ensure the new booking shows up instantly
            useBookingStore.getState().clearBookingCache();
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
      <div style={{ padding: "3rem 0", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gray-700)", marginBottom: "1rem" }}>
          Service Not Found
        </h2>
        <Link to="/salons" className="btn btn-outline">← Back to Salons</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="page-container" style={{ maxWidth: "760px" }}>
        {/* Back */}
        <Link to={`/salons/${service.salon}`} className="btn btn-outline btn-sm" style={{ gap: "0.375rem", marginBottom: "1.5rem" }}>
          <ArrowLeft size={14} />
          Back to Salon
        </Link>

        <h1 className="page-title" style={{ marginBottom: "1.5rem" }}>Book Appointment</h1>

        {/* Service Info Card */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{
            padding: "1.5rem",
            background: "linear-gradient(135deg, var(--brand-primary) 0%, #312e81 100%)",
            borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          }}>
            {service.category && (
              <span style={{
                fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                color: "#c7d2fe", background: "rgba(99,102,241,0.3)",
                padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)",
                display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.75rem",
              }}>
                <Tag size={10} />{service.category}
              </span>
            )}
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "white", marginBottom: "0.375rem" }}>
              {service.name}
            </h2>
            {service.description && (
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem" }}>{service.description}</p>
            )}
          </div>

          <div style={{ padding: "1.25rem", display: "flex", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--gray-800)" }}>
              <IndianRupee size={16} style={{ color: "var(--success)" }} />
              <span style={{ fontSize: "1.25rem" }}>₹{service.price}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-500)", fontSize: "0.9rem" }}>
              <Clock size={15} />
              {service.duration} minutes
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={16} style={{ color: "var(--brand-accent)" }} />
            Select Date
          </h3>
          <input
            type="date"
            value={date}
            min={today}
            onChange={handleDateChange}
            className="form-input"
            style={{ maxWidth: "240px" }}
          />
        </div>

        {/* Slots */}
        {date && (
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={16} style={{ color: "var(--brand-accent)" }} />
              Available Slots
            </h3>

            {slotsLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--gray-500)", padding: "0.5rem 0" }}>
                <div className="spinner" style={{ width: "16px", height: "16px" }} />
                Fetching available slots...
              </div>
            ) : slots.length === 0 ? (
              <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>No slots available for this date.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.625rem" }}>
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`btn ${selectedSlot === slot ? "btn-accent" : "btn-outline"}`}
                    style={{ fontSize: "0.8125rem", fontFamily: "monospace", fontWeight: 700 }}
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
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle size={16} style={{ color: "var(--success)" }} />
              Confirm Booking
            </h3>

            {/* Summary */}
            <div style={{
              background: "var(--gray-50)",
              borderRadius: "var(--radius)",
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex", flexDirection: "column", gap: "0.5rem",
              fontSize: "0.875rem", color: "var(--gray-600)",
            }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ color: "var(--gray-400)", minWidth: "80px" }}>Date</span>
                <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>
                  {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ color: "var(--gray-400)", minWidth: "80px" }}>Time</span>
                <span style={{ fontWeight: 600, color: "var(--gray-800)", fontFamily: "monospace" }}>{selectedSlot}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ color: "var(--gray-400)", minWidth: "80px" }}>Amount</span>
                <span style={{ fontWeight: 700, color: "var(--gray-800)" }}>₹{service.price}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <FileText size={13} />
                Special Requests (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="form-input form-textarea"
                placeholder="Any special requests, preferences, or notes for the salon..."
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={payLoading}
              className="btn btn-accent btn-lg btn-full"
              style={{ gap: "0.5rem" }}
            >
              {payLoading ? (
                <><div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderTopColor: "white" }} /> Processing...</>
              ) : (
                <><IndianRupee size={16} /> Pay ₹{service.price} & Confirm</>
              )}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.75rem" }}>
              🔒 Secured by Razorpay. Your payment info is never stored.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
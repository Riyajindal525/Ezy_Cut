import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Star,
  Bell,
  CreditCard,
  ArrowRight,
  MapPin,
  Users,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Scissors,
  Ticket,
  Wand2,
  ListChecks,
} from "lucide-react";
import smilingWomen from "../../assets/smilingWomen.png"
import useAuthStore from "../../store/auth.store";
import { getMyBookings } from "../../api/booking.api";
import { getMyPayments } from "../../api/payment.api";
import { getMyReviews } from "../../api/review.api";
import { getNotifications } from "../../api/notification.api";
import { getMyQueue } from "../../api/queue.api";
import { getAllSalons, getNearbySalons } from "../../api/salon.api";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // States
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [queueStatus, setQueueStatus] = useState([]);
  const [nearbySalons, setNearbySalons] = useState([]);
  const [allSalons, setAllSalons] = useState([]);
  const [coords, setCoords] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [bookingsData, paymentsData, reviewsData, alertsData, queueData, salonsData] = await Promise.all([
        getMyBookings(),
        getMyPayments(),
        getMyReviews(),
        getNotifications(),
        getMyQueue(),
        getAllSalons(),
      ]);

      setBookings(bookingsData.bookings || []);
      setPayments(paymentsData.payments || []);
      setReviews(reviewsData.reviews || []);
      setNotifications(alertsData.notifications || []);
      setQueueStatus(queueData.queues || []);

      const approvedSalons = (salonsData.salons || []).filter((s) => s.isApproved);
      setAllSalons(approvedSalons);
      setNearbySalons(approvedSalons.slice(0, 3)); // Fallback default
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customer dashboard details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Get user geolocation coordinates
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setCoords({ latitude, longitude });
          try {
            const data = await getNearbySalons(longitude, latitude, 25000); // 25km radius
            const approved = (data.salons || []).filter((s) => s.isApproved);
            if (approved.length > 0) {
              setNearbySalons(approved.slice(0, 3));
            }
          } catch (err) {
            console.error("Proximity search failed", err);
          } finally {
            setGeoLoading(false);
          }
        },
        (err) => {
          console.error(err);
          setGeoLoading(false);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader message="Loading dashboard overview..." />;

  // Derived Values
  const activeQueue = queueStatus.find((q) => q.status === "waiting" || q.status === "in_service");
  const upcomingBooking = bookings.find((b) => b.status === "confirmed");
  const showMetricsDashboard = !!activeQueue || !!upcomingBooking;

  // Sorting salons for sections
  const topRatedSalons = [...allSalons]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const recommendedSalons = allSalons.filter((s) => s.rating >= 4).slice(0, 1);

  // Fallback image helper
  const getSalonImage = (salon) => {
    if (salon.images && salon.images.length > 0 && salon.images[0]) {
      return salon.images[0];
    }
    // Premium placeholder
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80";
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const statCards = [
    { label: "Bookings", val: bookings.length, icon: Calendar, tint: "bg-[#f0fdfa] text-[#0d9488]" },
    { label: "Payments", val: payments.length, icon: CreditCard, tint: "bg-emerald-50 text-emerald-700" },
    { label: "Reviews", val: reviews.length, icon: Star, tint: "bg-amber-50 text-amber-700" },
    { label: "Alerts", val: notifications.length, icon: Bell, tint: "bg-sky-50 text-sky-700" },
    { label: "Queue Entry", val: queueStatus.length, icon: Ticket, tint: "bg-slate-100 text-slate-700" },
  ];

  const quickActions = [
    { icon: Calendar, label: "Book Appointment", onClick: () => navigate("/salons") },
    { icon: Wand2, label: "AI Recommendations", onClick: () => navigate("/ai-mentor") },
    { icon: Scissors, label: "Browse Salons", onClick: () => navigate("/salons") },
    { icon: Clock, label: "Live Queue", onClick: () => navigate("/my-queue") },
    { icon: ListChecks, label: "My Bookings", onClick: () => navigate("/my-bookings") },
    { icon: CreditCard, label: "Payments", onClick: () => navigate("/payment-history") },
  ];

  const SalonCard = ({ salon, badge }) => (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_12px_32px_rgba(13,148,136,0.12)] hover:border-[#0d9488]/25 transition-all duration-300 overflow-hidden hover:-translate-y-1">
      <div className="relative h-40 overflow-hidden">
        <img
          src={getSalonImage(salon)}
          alt={salon.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
        {badge && (
          <span className="absolute top-3 left-3 bg-[#0f766e] text-white text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
            {badge}
          </span>
        )}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {salon.rating > 0 ? salon.rating : "New"}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-[1.05rem] leading-tight drop-shadow-sm">{salon.name}</h3>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[#5b6b68] text-sm">
          <MapPin size={13} className="text-[#0d9488] shrink-0" />
          <span className="truncate">{salon.city}</span>
        </div>
        <p className="text-[#5b6b68] text-sm line-clamp-1">{salon.address}</p>
        <button
          onClick={() => navigate(`/salons/${salon._id}`)}
          className="mt-1 w-full inline-flex items-center justify-center gap-1.5 border border-[#ccfbf1] text-[#0f766e] hover:bg-[#f0fdfa] font-semibold text-sm py-2 rounded-lg transition-colors"
        >
          View Details <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]`}
      >
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Welcome back, {user?.name || "Customer"} 👋
            </h1>
            <p className="text-white/60 text-sm">Ready for your next self-care session?</p>
          </div>
          <button
            onClick={() => navigate("/salons")}
            className="inline-flex items-center gap-2 bg-white text-[#0f766e] hover:bg-[#f0fdfa] font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            Book Appointment <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ============ MAIN CONTENT (overlaps hero bottom) ============ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 pb-12 flex flex-col gap-6 sm:gap-8">

        {/* Stats strip */}
        <div
          {...fadeUp(60)}
          className={`${fadeUp(60).className} grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4`}
        >
          {statCards.map(({ label, val, icon: Icon, tint }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0d9488]/20 transition-all duration-200 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5b6b68]">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tint}`}>
                  <Icon size={15} />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-[#022525] leading-none">{val}</span>
            </div>
          ))}
        </div>

        {/* Two-column layout: main + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">

          {/* ============ MAIN COLUMN ============ */}
          <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">

            {/* AI Recommendation promo */}
            <div
              {...fadeUp(100)}
              className={`${fadeUp(100).className} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#0d9488] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg`}
            >
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative flex flex-col gap-2 max-w-md shrink">
                <span className="inline-flex items-center gap-1.5 self-start bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-white">
                  <Wand2 size={11} /> AI Powered
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  Your Personal Grooming Assistant
                </h2>
                <p className="text-white/75 text-sm leading-relaxed">
                  Get AI-powered recommendations for hairstyles, beauty &amp; grooming services picked just for you.
                </p>
                <button
                  onClick={() => navigate("/ai-mentor")}
                  className="mt-2 self-start inline-flex items-center gap-2 bg-white text-[#0f766e] hover:bg-[#f0fdfa] font-bold text-sm px-5 py-2.5 rounded-xl shadow transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Sparkles size={15} /> Get Recommendations
                </button>
              </div>
              <img
                src={smilingWomen}
                alt="Woman flipping her hair"
                className="relative hidden sm:block shrink-0 w-48 h-56 lg:w-56 lg:h-64 rounded-2xl object-cover shadow-xl border-4 border-white/10"
              />
            </div>

            {/* Nearby Salons */}
            <div {...fadeUp(140)} className={`${fadeUp(140).className} flex flex-col gap-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#022525] flex items-center gap-2">
                  <MapPin size={17} className="text-[#0d9488]" /> Nearby Salons
                </h2>
                <Link to="/salons" className="text-[#0f766e] text-sm font-bold hover:underline">
                  View All &gt;
                </Link>
              </div>

              {geoLoading ? (
                <div className="flex items-center gap-2 text-[#5b6b68] py-6">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0d9488] rounded-full animate-spin" />
                  Detecting nearby salon listings...
                </div>
              ) : nearbySalons.length === 0 ? (
                <p className="text-[#5b6b68]">No salons found in your proximity.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {nearbySalons.map((salon) => (
                    <SalonCard key={salon._id} salon={salon} />
                  ))}
                </div>
              )}
            </div>

            {/* Top Rated Collections */}
            <div {...fadeUp(180)} className={`${fadeUp(180).className} flex flex-col gap-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#022525] flex items-center gap-2">
                  <TrendingUp size={17} className="text-[#0d9488]" /> Top Rated Collections
                </h2>
                <Link to="/salons" className="text-[#0f766e] text-sm font-bold hover:underline">
                  View All &gt;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {topRatedSalons.map((salon) => (
                  <SalonCard key={salon._id} salon={salon} badge="Top Rated" />
                ))}
              </div>
            </div>

            {/* Recommended */}
            {recommendedSalons.length > 0 && (
              <div {...fadeUp(220)} className={`${fadeUp(220).className} relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#022525] to-[#0f766e] p-1`}>
                <div className="bg-white rounded-[14px] flex flex-wrap overflow-hidden">
                  {recommendedSalons.map((salon) => (
                    <div key={salon._id} className="flex flex-wrap w-full">
                      <div className="relative w-full sm:w-[220px] h-[160px] sm:h-auto overflow-hidden shrink-0">
                        <img
                          src={getSalonImage(salon)}
                          alt={salon.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                          <Star size={11} className="fill-amber-400 text-amber-400" /> {salon.rating}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col gap-1.5 flex-1 min-w-[220px]">
                        <span className="inline-flex items-center gap-1.5 self-start bg-[#f0fdfa] text-[#0f766e] text-[0.625rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-1">
                          <Sparkles size={10} /> Recommended For You
                        </span>
                        <h3 className="text-[1.05rem] font-bold text-[#022525]">{salon.name}</h3>
                        <div className="flex items-center gap-1.5 text-[#5b6b68] text-sm">
                          <MapPin size={13} className="text-[#0d9488]" />
                          <span>{salon.city}, {salon.state}</span>
                        </div>
                        <p className="text-[#5b6b68] text-sm mb-1">{salon.address}</p>
                        <button
                          onClick={() => navigate(`/salons/${salon._id}`)}
                          className="self-start inline-flex items-center gap-1.5 border border-[#ccfbf1] text-[#0f766e] hover:bg-[#f0fdfa] font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                          View Details <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Alerts & Recent Charges */}
            <div {...fadeUp(260)} className={`${fadeUp(260).className} grid gap-6 sm:grid-cols-2`}>
              {/* Recent Alerts */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[1.05rem] font-bold text-[#022525] flex items-center gap-2">
                    <Bell size={17} className="text-[#0d9488]" /> Recent Alerts
                  </h3>
                  <Link to="/notifications" className="text-[#0f766e] text-sm font-bold hover:underline">
                    Inbox &gt;
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {notifications.slice(0, 4).map((alert) => (
                    <div key={alert._id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                      <div className="font-bold text-[#022525] text-sm mb-1">{alert.title}</div>
                      <div className="text-[#5b6b68] text-sm leading-relaxed">{alert.message}</div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-[#5b6b68] py-4 text-center text-sm">
                      No alerts registered.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Charges */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[1.05rem] font-bold text-[#022525] flex items-center gap-2">
                    <CreditCard size={17} className="text-[#0d9488]" /> Recent Charges
                  </h3>
                  <Link to="/payment-history" className="text-[#0f766e] text-sm font-bold hover:underline">
                    Statements &gt;
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {payments.slice(0, 3).map((pm) => (
                    <div
                      key={pm._id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#022525] text-sm">{pm.booking?.service?.name || "Salon Service"}</div>
                        <div className="text-[#5b6b68] text-sm mt-0.5">{pm.booking?.salon?.name || "Verified Salon"}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-extrabold text-[#022525]">₹{pm.amount}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[0.625rem] font-extrabold uppercase">
                          {pm.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-[#5b6b68] py-4 text-center text-sm">
                      No billing history found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div {...fadeUp(300)} className={`${fadeUp(300).className} flex flex-col gap-4 pb-2`}>
              <h3 className="text-[1.05rem] font-bold text-[#022525] flex items-center gap-2">
                <Scissors size={17} className="text-[#0d9488]" /> Quick Navigation
              </h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate("/salons")}
                  className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  Book Salon Slot
                </button>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => navigate("/my-queue")}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Live Queue
                </button>
                <button
                  onClick={() => navigate("/payment-history")}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Payments
                </button>
                <button
                  onClick={() => navigate("/my-reviews")}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  My Reviews
                </button>
              </div>
            </div>
          </div>

          {/* ============ SIDEBAR COLUMN ============ */}
          <div className="lg:col-span-1 flex flex-col gap-6 sm:gap-8 lg:sticky lg:top-6">

            {/* Quick Actions */}
            <div {...fadeUp(100)} className={`${fadeUp(100).className} bg-white rounded-2xl border border-gray-200 shadow-sm p-5`}>
              <h3 className="text-sm font-bold text-[#5b6b68] uppercase tracking-wide mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map(({ icon: Icon, label, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="group flex flex-col items-center justify-center gap-2 bg-[#fafbfb] border border-gray-100 rounded-xl py-4 px-1.5 text-center transition-all duration-200 hover:border-[#0d9488]/30 hover:bg-[#f0fdfa]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center transition-colors duration-200 group-hover:bg-[#0d9488] group-hover:border-[#0d9488]">
                      <Icon size={15} className="text-[#0d9488] transition-colors duration-200 group-hover:text-white" />
                    </div>
                    <span className="text-[0.625rem] font-semibold text-[#134e4a] leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {showMetricsDashboard && (
              <>
                {/* Upcoming Reservation */}
                <div {...fadeUp(140)} className={`${fadeUp(140).className} flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#5b6b68] uppercase tracking-wide flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#0d9488]" /> Upcoming Booking
                    </h3>
                    <Link to="/my-bookings" className="text-[#0f766e] text-xs font-bold hover:underline">
                      View All &gt;
                    </Link>
                  </div>

                  {upcomingBooking ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="relative h-24 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=500&q=80"
                          alt="Salon interior"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-2 left-3 text-white font-bold text-sm drop-shadow">
                          {upcomingBooking.salon?.name}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <span className="text-sm text-[#5b6b68] font-medium">{upcomingBooking.service?.name}</span>
                        <div className="flex flex-col gap-1.5 text-sm">
                          <div className="flex items-center gap-2 text-[#022525] font-semibold">
                            <Calendar size={13} className="text-[#0d9488]" />
                            {new Date(upcomingBooking.bookingDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                          </div>
                          <div className="flex items-center gap-2 text-[#022525] font-semibold font-mono">
                            <Clock size={13} className="text-[#0d9488]" />
                            {upcomingBooking.startTime} - {upcomingBooking.endTime}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-[#022525] font-extrabold">₹{upcomingBooking.totalAmount}</span>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[0.625rem] font-extrabold uppercase">
                            <CheckCircle size={10} /> {upcomingBooking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-[#5b6b68] text-sm">
                      No upcoming appointments confirmed.
                    </div>
                  )}
                </div>

                {/* Live Line Entry */}
                <div {...fadeUp(180)} className={`${fadeUp(180).className} flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#5b6b68] uppercase tracking-wide flex items-center gap-1.5">
                      <Clock size={14} className="text-[#0d9488]" /> Live Line Entry
                    </h3>
                    <Link to="/my-queue" className="text-[#0f766e] text-xs font-bold hover:underline">
                      View &gt;
                    </Link>
                  </div>

                  {activeQueue ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-[#022525]">
                            {activeQueue.salon?.name || "Premium Salon"}
                          </span>
                          <span className="text-sm text-[#5b6b68] font-medium">{activeQueue.service?.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[0.625rem] text-[#9ca3af] uppercase font-bold">Position</span>
                          <span className="text-2xl font-extrabold text-[#022525]">#{activeQueue.position}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0d9488] rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(10, 100 - activeQueue.position * 20)}%` }}
                        />
                      </div>
                      <div className="flex justify-between flex-wrap gap-3 text-sm">
                        <div className="flex flex-col">
                          <span className="text-[#9ca3af] text-[0.625rem] font-semibold uppercase">Wait Est.</span>
                          <span className="text-[#0f766e] font-extrabold">{activeQueue.estimatedWaitTime} mins</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#9ca3af] text-[0.625rem] font-semibold uppercase">Token</span>
                          <span className="text-[#022525] font-bold font-mono">{activeQueue.tokenCode}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-[#5b6b68] text-sm">
                      You are not currently in any salon queue line.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Rewards style summary card */}
            <div {...fadeUp(220)} className={`${fadeUp(220).className} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#022525] to-[#0f766e] p-5 flex flex-col gap-4 shadow-lg`}>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.2)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide flex items-center gap-1.5">
                  <Users size={14} className="text-[#5eead4]" /> Your Activity
                </h3>
              </div>
              <div className="relative grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.625rem] text-white/50 font-semibold uppercase">Reviews Given</span>
                  <span className="text-xl font-extrabold text-white">{reviews.length}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.625rem] text-white/50 font-semibold uppercase">Total Payments</span>
                  <span className="text-xl font-extrabold text-white">{payments.length}</span>
                </div>
              </div>
              <Link
                to="/my-reviews"
                className="relative inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
              >
                View My Reviews <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
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
} from "lucide-react";
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

  // Unified layout render
  return (
    <div style={{ minHeight: "calc(100vh - 68px)", padding: "2.5rem 0", background: "#09090b" }}>
      <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* Welcome Banner Card */}
        <div className="card" style={{
          background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "2.5rem 2rem",
          borderRadius: "var(--radius-xl)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: "var(--radius-full)",
              padding: "0.25rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--brand-accent)",
              textTransform: "uppercase"
            }}>
              ✨ Customer Portal
            </span>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 900, color: "white", margin: 0 }}>
              Hello, {user?.name || "Customer"} 👋
            </h1>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", margin: 0 }}>
              Welcome back to EzyCut. Choose your salon and secure your booking.
            </p>
          </div>
          <button onClick={() => navigate("/salons")} className="btn btn-primary" style={{ padding: "0.875rem 1.75rem", gap: "0.5rem", borderRadius: "var(--radius-md)", fontWeight: 700 }}>
            Book Appointment <ArrowRight size={16} />
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.25rem",
        }}>
          {[
            { label: "Bookings", val: bookings.length, icon: Calendar, color: "#3b82f6" },
            { label: "Payments", val: payments.length, icon: CreditCard, color: "#10b981" },
            { label: "Reviews", val: reviews.length, icon: Star, color: "#fbbf24" },
            { label: "Alerts", val: notifications.length, icon: Bell, color: "#8b5cf6" },
            { label: "Queue Entry", val: queueStatus.length, icon: Clock, color: "#eab308" }
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="card" style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              background: "#121214",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-400)" }}>{label}</span>
                <div style={{
                  width: "2rem", height: "2rem", borderRadius: "var(--radius-sm)",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <span style={{ fontSize: "2.25rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Active Reservation & Live Queue Split */}
        {showMetricsDashboard && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "2rem",
          }}>
            
            {/* Upcoming Reservation Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>📅</span> Upcoming Reservation
                </h3>
                <Link to="/my-bookings" style={{ color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>
                  Manage &gt;
                </Link>
              </div>
              
              {upcomingBooking ? (
                <div className="card" style={{
                  background: "#121214",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem"
                }}>
                  <div style={{ display: "flex", gap: "0.75rem", borderLeft: "4px solid var(--brand-accent)", paddingLeft: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "white" }}>{upcomingBooking.salon?.name}</span>
                      <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", fontWeight: 500 }}>{upcomingBooking.service?.name}</span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.8125rem",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ color: "var(--gray-400)" }}>Date</span>
                      <span style={{ color: "white", fontWeight: 700 }}>
                        {new Date(upcomingBooking.bookingDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ color: "var(--gray-400)" }}>Time Window</span>
                      <span style={{ color: "white", fontWeight: 700, fontFamily: "monospace" }}>{upcomingBooking.startTime} - {upcomingBooking.endTime}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ color: "var(--gray-400)" }}>Total Price</span>
                      <span style={{ color: "white", fontWeight: 700 }}>₹{upcomingBooking.totalAmount}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ color: "var(--gray-400)" }}>Status</span>
                      <span style={{
                        alignSelf: "flex-start",
                        background: "var(--success-light)",
                        color: "var(--success)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.6875rem",
                        fontWeight: 850,
                        textTransform: "uppercase"
                      }}>
                        {upcomingBooking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: "1.5rem", textAlign: "center", color: "var(--gray-500)", background: "#121214", border: "1px solid rgba(255,255,255,0.06)" }}>
                  No upcoming appointments confirmed.
                </div>
              )}
            </div>

            {/* Live Line Entry Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>⌛</span> Live Line Entry
                </h3>
                <Link to="/my-queue" style={{ color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>
                  View Queue &gt;
                </Link>
              </div>

              {activeQueue ? (
                <div className="card" style={{
                  background: "#121214",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem"
                }}>
                  <div style={{ display: "flex", justify: "space-between", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "white" }}>
                        {activeQueue.salon?.name || "Premium Salon"}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", fontWeight: 500 }}>
                        {activeQueue.service?.name}
                      </span>
                    </div>
                    
                    <div style={{ textAlign: "right" }}>
                      <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--gray-400)", textTransform: "uppercase", fontWeight: 700 }}>Position</span>
                      <span style={{ fontSize: "1.875rem", fontWeight: 900, color: "white" }}>#{activeQueue.position}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.max(10, 100 - activeQueue.position * 20)}%`,
                        height: "100%",
                        background: "var(--brand-accent)",
                        borderRadius: "var(--radius-full)"
                      }}></div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", fontSize: "0.8125rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ color: "var(--gray-400)" }}>Wait Est.</span>
                      <span style={{ color: "var(--brand-accent)", fontWeight: 800 }}>{activeQueue.estimatedWaitTime} mins</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ color: "var(--gray-400)" }}>Token Code</span>
                      <span style={{ color: "white", fontWeight: 700, fontFamily: "monospace" }}>{activeQueue.tokenCode}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ color: "var(--gray-400)" }}>Status</span>
                      <span style={{
                        alignSelf: "flex-start",
                        background: "var(--warning-light)",
                        color: "var(--warning)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.6875rem",
                        fontWeight: 850,
                        textTransform: "uppercase"
                      }}>
                        {activeQueue.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: "1.5rem", textAlign: "center", color: "var(--gray-500)", background: "#121214", border: "1px solid rgba(255,255,255,0.06)" }}>
                  You are not currently in any salon queue line.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Nearby Salons Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📍</span> Nearby Salons
            </h2>
            <Link to="/salons" style={{ color: "var(--brand-accent)", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" }}>
              Explore All &gt;
            </Link>
          </div>

          {geoLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-500)", padding: "2rem 0" }}>
              <div className="spinner" style={{ width: "16px", height: "16px" }} />
              Detecting nearby salon listings...
            </div>
          ) : nearbySalons.length === 0 ? (
            <p style={{ color: "var(--gray-400)" }}>No salons found in your proximity.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {nearbySalons.map((salon) => (
                <div key={salon._id} className="card card-hover" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                    <img
                      src={getSalonImage(salon)}
                      alt={salon.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span style={{
                      position: "absolute", top: "0.75rem", right: "0.75rem",
                      background: "rgba(0,0,0,0.65)", color: "white",
                      padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)",
                      fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem"
                    }}>
                      ⭐ {salon.rating > 0 ? salon.rating : "N/A"}
                    </span>
                  </div>
                  <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0 }}>{salon.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--gray-500)", fontSize: "0.8125rem" }}>
                      <MapPin size={12} />
                      <span>{salon.city}</span>
                    </div>
                    <p style={{ color: "var(--gray-500)", fontSize: "0.8125rem", margin: 0, flex: 1 }}>{salon.address}</p>
                    <button
                      onClick={() => navigate(`/salons/${salon._id}`)}
                      className="btn btn-outline btn-sm btn-full"
                      style={{ marginTop: "0.75rem", fontWeight: 700 }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Rated Collections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🏅</span> Top Rated Collections
            </h2>
            <Link to="/salons" style={{ color: "var(--brand-accent)", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" }}>
              Explore All &gt;
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {topRatedSalons.map((salon) => (
              <div key={salon._id} className="card card-hover" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                  <img
                    src={getSalonImage(salon)}
                    alt={salon.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <span style={{
                    position: "absolute", top: "0.75rem", left: "0.75rem",
                    background: "var(--brand-accent)", color: "#09090b",
                    padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)",
                    fontSize: "0.6875rem", fontWeight: 800, textTransform: "uppercase"
                  }}>
                    Top Rated
                  </span>
                  <span style={{
                    position: "absolute", top: "0.75rem", right: "0.75rem",
                    background: "rgba(0,0,0,0.65)", color: "white",
                    padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)",
                    fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem"
                  }}>
                    ⭐ {salon.rating > 0 ? salon.rating : "0"}
                  </span>
                </div>
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0 }}>{salon.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--gray-500)", fontSize: "0.8125rem" }}>
                    <MapPin size={12} />
                    <span>{salon.city}</span>
                  </div>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.8125rem", margin: 0, flex: 1 }}>{salon.address}</p>
                  <button
                    onClick={() => navigate(`/salons/${salon._id}`)}
                    className="btn btn-outline btn-sm btn-full"
                    style={{ marginTop: "0.75rem", fontWeight: 700 }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Section */}
        {recommendedSalons.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>📈</span> Recommended For You
              </h2>
              <Link to="/salons" style={{ color: "var(--brand-accent)", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" }}>
                Explore All &gt;
              </Link>
            </div>
            <div>
              {recommendedSalons.map((salon) => (
                <div key={salon._id} className="card card-hover" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", maxWidth: "560px" }}>
                  <div style={{ position: "relative", width: "200px", height: "150px", minWidth: "150px" }}>
                    <img
                      src={getSalonImage(salon)}
                      alt={salon.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span style={{
                      position: "absolute", top: "0.5rem", right: "0.5rem",
                      background: "rgba(0,0,0,0.65)", color: "white",
                      padding: "0.2rem 0.4rem", borderRadius: "var(--radius-sm)",
                      fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.2"
                    }}>
                      ⭐ {salon.rating}
                    </span>
                  </div>
                  <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1, minWidth: "220px" }}>
                    <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0 }}>{salon.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--gray-500)", fontSize: "0.8125rem" }}>
                      <MapPin size={12} />
                      <span>{salon.city}, {salon.state}</span>
                    </div>
                    <p style={{ color: "var(--gray-500)", fontSize: "0.8125rem", margin: "0 0 0.5rem" }}>{salon.address}</p>
                    <button
                      onClick={() => navigate(`/salons/${salon._id}`)}
                      className="btn btn-outline btn-sm"
                      style={{ alignSelf: "flex-start", fontWeight: 700 }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Alerts & Recent Charges */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "2rem",
        }}>
          
          {/* Recent Alerts Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🔔</span> Recent Alerts
              </h3>
              <Link to="/notifications" style={{ color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>
                Inbox &gt;
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {notifications.slice(0, 4).map((alert) => (
                <div key={alert._id} className="card" style={{
                  padding: "1rem 1.25rem",
                  background: "#121214",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontWeight: 800, color: "white", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{alert.title}</div>
                  <div style={{ color: "var(--gray-500)", fontSize: "0.8125rem", lineHeight: 1.4 }}>{alert.message}</div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ color: "var(--gray-500)", padding: "1rem", textAlign: "center" }}>No alerts registered.</div>
              )}
            </div>
          </div>

          {/* Recent Charges Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>💳</span> Recent Charges
              </h3>
              <Link to="/payment-history" style={{ color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none" }}>
                Statements &gt;
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {payments.slice(0, 3).map((pm) => (
                <div key={pm._id} className="card" style={{
                  padding: "1rem 1.25rem",
                  background: "#121214",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "white", fontSize: "0.875rem" }}>{pm.booking?.service?.name || "Salon Service"}</div>
                    <div style={{ color: "var(--gray-500)", fontSize: "0.8125rem", marginTop: "0.15rem" }}>{pm.booking?.salon?.name || "Verified Salon"}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.375rem" }}>
                    <span style={{ fontWeight: 800, color: "white", fontSize: "1rem" }}>₹{pm.amount}</span>
                    <span style={{
                      background: "var(--success-light)",
                      color: "var(--success)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      textTransform: "uppercase"
                    }}>{pm.status}</span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <div style={{ color: "var(--gray-500)", padding: "1rem", textAlign: "center" }}>No billing history found.</div>
              )}
            </div>
          </div>

        </div>

        {/* Quick Navigation Footer Row */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>✨</span> Quick Navigation
          </h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/salons")} className="btn btn-primary" style={{ fontWeight: 700, borderRadius: "var(--radius-md)" }}>
              Book Salon Slot
            </button>
            <button onClick={() => navigate("/my-bookings")} className="btn btn-outline" style={{ fontWeight: 700, borderRadius: "var(--radius-md)" }}>
              My Bookings
            </button>
            <button onClick={() => navigate("/my-queue")} className="btn btn-outline" style={{ fontWeight: 700, borderRadius: "var(--radius-md)" }}>
              Live Queue
            </button>
            <button onClick={() => navigate("/payment-history")} className="btn btn-outline" style={{ fontWeight: 700, borderRadius: "var(--radius-md)" }}>
              Payments
            </button>
            <button onClick={() => navigate("/my-reviews")} className="btn btn-outline" style={{ fontWeight: 700, borderRadius: "var(--radius-md)" }}>
              My Reviews
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;

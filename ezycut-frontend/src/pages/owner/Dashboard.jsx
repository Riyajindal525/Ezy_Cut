import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { getAllSalons, createSalon, updateSalon } from "../../api/salon.api";
import { getSalonBookings } from "../../api/booking.api";
import { getSalonQueue } from "../../api/queue.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import {
  TrendingUp,
  Calendar,
  Clock,
  Star,
  DollarSign,
  MapPin,
  Phone,
  Plus,
  ArrowRight,
  Info,
  Building,
  User,
  ListOrdered,
  ChevronRight
} from "lucide-react";

const OwnerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, setActiveSalonId, salons, fetchSalons } = useSalonStore();
  const location = useLocation();
  const navigate = useNavigate();

  // States
  const [salon, setSalon] = useState(null);
  const [salonLoading, setSalonLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Onboarding Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    latitude: "",
    longitude: "",
    openingTime: "09:00 AM",
    closingTime: "09:00 PM",
    imageUrl: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  const ownedSalons = salons.filter(
    (s) => s.owner?._id === user?.id || s.owner === user?.id
  );

  // Parse query params to toggle register form
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("register") === "true") {
      setShowRegisterForm(true);
    } else {
      setShowRegisterForm(false);
    }
  }, [location.search]);

  // Compute metrics from bookings and queue
  const loadActiveSalonData = async (salonObj) => {
    setLoading(true);
    try {
      const [bookingsData, queueData] = await Promise.all([
        getSalonBookings(salonObj._id),
        getSalonQueue(salonObj._id),
      ]);

      const allBookings = bookingsData.bookings || [];
      const queueList = queueData.queue || [];

      // Calculations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCount = allBookings.filter((b) => {
        const bDate = new Date(b.bookingDate);
        return bDate >= today && bDate < tomorrow && b.status !== "cancelled_by_customer" && b.status !== "cancelled_by_owner";
      }).length;

      const completed = allBookings.filter((b) => b.status === "completed");
      const revenueSum = completed.reduce((sum, b) => sum + b.totalAmount, 0);

      // Recent Bookings (top 5)
      const recent = allBookings.slice(0, 5);

      // Top Performing Services
      const serviceStats = {};
      completed.forEach((b) => {
        const sName = b.service?.name || "General";
        if (!serviceStats[sName]) {
          serviceStats[sName] = { service: sName, totalBookings: 0, revenue: 0 };
        }
        serviceStats[sName].totalBookings += 1;
        serviceStats[sName].revenue += b.totalAmount;
      });
      const topS = Object.values(serviceStats)
        .sort((a, b) => b.totalBookings - a.totalBookings)
        .slice(0, 5);

      // Monthly Revenue Comparisons
      const monthlyStats = {};
      completed.forEach((b) => {
        const date = new Date(b.bookingDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        if (!monthlyStats[key]) {
          monthlyStats[key] = { _id: { month, year }, revenue: 0, bookings: 0 };
        }
        monthlyStats[key].revenue += b.totalAmount;
        monthlyStats[key].bookings += 1;
      });
      const monthlyRev = Object.values(monthlyStats).sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      });

      setOverview({
        totalRevenue: revenueSum,
        todayBookings: todayCount,
        completedBookings: completed.length,
        activeQueue: queueList.length,
        averageRating: salonObj.rating || 0,
        totalReviews: salonObj.totalReviews || 0,
      });
      setRecentBookings(recent);
      setTopServices(topS);
      setMonthlyRevenue(monthlyRev);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load salon analytics.");
    } finally {
      setLoading(false);
    }
  };

  // Sync state with active salon selection
  useEffect(() => {
    const initSalon = async () => {
      setSalonLoading(true);
      await fetchSalons();

      if (ownedSalons.length === 0) {
        setSalon(null);
        setSalonLoading(false);
        return;
      }

      // Check active selection
      let currentSalon = ownedSalons.find((s) => s._id === activeSalonId);
      if (!currentSalon) {
        currentSalon = ownedSalons[0];
        setActiveSalonId(currentSalon._id);
      }

      setSalon(currentSalon);

      if (currentSalon.isApproved) {
        await loadActiveSalonData(currentSalon);
      } else {
        // Pending state
        setOverview(null);
        setRecentBookings([]);
        setTopServices([]);
        setMonthlyRevenue([]);
      }
      setSalonLoading(false);
    };

    if (user) {
      initSalon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          toast.success("Location coordinates captured! 📍");
        },
        (err) => {
          console.error(err);
          toast.error("Failed to detect location. Please enter coordinates manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const res = await createSalon({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });

      if (formData.imageUrl.trim() && res.salon?._id) {
        await updateSalon(res.salon._id, {
          images: [formData.imageUrl.trim()]
        });
      }

      toast.success("Salon profile submitted successfully! Please wait for admin approval. ⏳");
      
      // Refresh list and select the new salon
      const updatedSalons = await fetchSalons(true);
      const newSalon = updatedSalons.find((s) => s.name === formData.name);
      if (newSalon) {
        setActiveSalonId(newSalon._id);
      }
      
      setFormData({
        name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        latitude: "",
        longitude: "",
        openingTime: "09:00 AM",
        closingTime: "09:00 PM",
        imageUrl: "",
      });

      navigate("/owner/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to register salon. Please review fields.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "short" });
  };

  if (salonLoading) {
    return <Loader message="Verifying salon profile association..." />;
  }

  // State 0: Welcome / Empty Dashboard when user has no salons yet
  if (ownedSalons.length === 0 && !showRegisterForm) {
    return (
      <div className="owner-welcome-card">
        <div className="owner-welcome-icon">
          <Building size={36} style={{ color: "var(--brand-accent)" }} />
        </div>
        
        <h3 className="owner-welcome-title">Welcome to EzyCut!</h3>
        <p className="owner-welcome-desc">
          You don't have any salons registered under this account yet. Register your salon profile to start listing services, managing bookings, and tracking live queues.
        </p>

        <div style={{ marginTop: "2.5rem" }}>
          <button
            onClick={() => navigate("/owner/dashboard?register=true")}
            className="owner-btn owner-btn-solid-gold"
            style={{ padding: "0.875rem 2rem", fontSize: "0.875rem", borderRadius: "12px" }}
          >
            + Register Your Salon
          </button>
        </div>
      </div>
    );
  }

  // State 1: Register Salon Form
  if (showRegisterForm) {
    return (
      <div className="owner-onboarding-card">
        <div className="flex justify-between items-center pb-5 border-b border-white/[0.06] mb-8">
          <div>
            <span className="owner-onboarding-tag">
              Onboarding
            </span>
            <h3 className="owner-onboarding-title">Register Salon Profile</h3>
            <p className="owner-onboarding-desc">Configure details to enlist your shop on EzyCut</p>
          </div>
          {ownedSalons.length > 0 && (
            <button
              onClick={() => navigate("/owner/dashboard")}
              className="owner-btn owner-btn-outline"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="owner-form-section space-y-6">
            <h4 className="owner-form-section-heading">
              <Building size={14} /> Basic Information
            </h4>
            <div className="owner-form-grid-2">
              <div className="owner-form-group">
                <label className="owner-form-label">Salon Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="e.g. Sharp & Sleek Salon"
                />
              </div>
              <div className="owner-form-group">
                <label className="owner-form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>

            <div className="owner-form-group">
              <label className="owner-form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="owner-form-textarea"
                placeholder="Provide a compelling catalog description for customers..."
              />
            </div>

            <div className="owner-form-group">
              <label className="owner-form-label">Salon Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="owner-form-input"
                placeholder="e.g. https://images.unsplash.com/photo-... (optional)"
              />
            </div>
          </div>

          {/* Section 2: Address & Coordinates */}
          <div className="owner-form-section space-y-6">
            <h4 className="owner-form-section-heading">
              <MapPin size={14} /> Physical Location
            </h4>
            <div className="owner-form-group">
              <label className="owner-form-label">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="owner-form-input"
                placeholder="e.g. Shop 42, 1st Floor, Royal Complex"
              />
            </div>

            <div className="owner-form-grid-3">
              <div className="owner-form-group">
                <label className="owner-form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="City"
                />
              </div>
              <div className="owner-form-group">
                <label className="owner-form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="State"
                />
              </div>
              <div className="owner-form-group">
                <label className="owner-form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="Pincode"
                />
              </div>
            </div>

            <div className="owner-location-box">
              <div className="owner-location-box-header">
                <span className="owner-form-label">Geolocation Coordinates</span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="owner-btn owner-btn-outline"
                >
                  Use Current Location 📍
                </button>
              </div>
              <div className="owner-form-grid-2">
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="Latitude (e.g. 28.61)"
                />
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="Longitude (e.g. 77.20)"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operations & Timings */}
          <div className="owner-form-section space-y-6">
            <h4 className="owner-form-section-heading">
              <Clock size={14} /> Operational Hours
            </h4>
            <div className="owner-form-grid-2">
              <div className="owner-form-group">
                <label className="owner-form-label">Opening Time</label>
                <input
                  type="text"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  className="owner-form-input"
                  placeholder="e.g. 09:00 AM"
                />
              </div>
              <div className="owner-form-group">
                <label className="owner-form-label">Closing Time</label>
                <input
                  type="text"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  className="owner-form-input"
                  placeholder="e.g. 09:00 PM"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerLoading}
            className="owner-submit-btn"
          >
            {registerLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Registering Shop...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>
      </div>
    );
  }

  // State 2: Active Salon Pending Approval
  if (salon && !salon.isApproved) {
    return (
      <div className="owner-welcome-card">
        <div className="owner-welcome-icon">
          <Clock size={36} style={{ color: "var(--brand-accent)" }} />
        </div>
        
        <h3 className="owner-welcome-title">Registration Under Review</h3>
        <p className="owner-welcome-desc">
          The profile details for <strong>{salon.name}</strong> have been submitted and are pending review by our administration. We will activate your dashboard once verified.
        </p>

        <div className="owner-form-divider" style={{ margin: "2rem 0" }} />

        <div className="flex flex-col gap-4 items-center">
          <div className="flex items-center gap-2 text-xs text-zinc-550 font-semibold uppercase tracking-wider">
            <Info size={14} /> Need to list another store?
          </div>
          <button
            onClick={() => navigate("/owner/dashboard?register=true")}
            className="owner-btn owner-btn-outline"
            style={{ padding: "0.75rem 1.5rem", borderRadius: "10px" }}
          >
            + Register Another Salon
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader message="Recalculating salon insights..." />;
  }

  const maxRevenue = monthlyRevenue.length > 0
    ? Math.max(...monthlyRevenue.map((m) => m.revenue))
    : 0;

  return (
    <div className="owner-page-wrapper">
      {/* Metric Cards Grid */}
      <div className="owner-stat-grid">
        
        {/* Card 1 */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Total Revenue</span>
            <div className="owner-stat-icon" style={{
              background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <DollarSign size={16} style={{ color: "#10b981" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value">₹{overview?.totalRevenue || 0}</h3>
            <p className="owner-stat-sub text-emerald-400">
              ▲ Lifetime completed sales
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Today's Bookings</span>
            <div className="owner-stat-icon" style={{
              background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Calendar size={16} style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value">{overview?.todayBookings || 0}</h3>
            <p className="owner-stat-sub text-blue-400">Scheduled for today</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Active Queue</span>
            <div className="owner-stat-icon" style={{
              background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Clock size={16} style={{ color: "var(--brand-accent)" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value">{overview?.activeQueue || 0}</h3>
            <p className="owner-stat-sub text-amber-400">Clients checked-in/waiting</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="owner-stat-card">
          <div className="owner-stat-header">
            <span className="owner-stat-label">Salon Rating</span>
            <div className="owner-stat-icon" style={{
              background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Star size={16} style={{ color: "#a855f7" }} />
            </div>
          </div>
          <div className="owner-stat-body">
            <h3 className="owner-stat-value">
              {overview?.averageRating || 0} <span style={{ fontSize: "1.125rem", fontWeight: "normal", color: "#52525b" }}>/ 5</span>
            </h3>
            <p className="owner-stat-sub text-purple-400">Across {overview?.totalReviews || 0} reviews</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "2rem" }}>
        
        {/* Recent Appointments */}
        <div className="owner-card" style={{ gridColumn: "span 2" }}>
          <div className="owner-card-header">
            <h3 className="owner-card-title">
              <Calendar size={18} style={{ color: "var(--brand-accent)" }} /> Recent Appointments
            </h3>
            <Link to="/owner/bookings" className="owner-btn owner-btn-gold">
              Manage Bookings <ChevronRight size={14} />
            </Link>
          </div>

          <div className="owner-card-pad">
            {recentBookings.length === 0 ? (
              <p className="text-sm text-zinc-500 py-10 text-center font-medium">No bookings logged for this salon yet.</p>
            ) : (
              <div className="owner-table-container">
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th style={{ textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id}>
                        <td style={{ fontWeight: 700, color: "#ffffff" }}>{b.customer?.name}</td>
                        <td style={{ fontWeight: 600 }}>{b.service?.name}</td>
                        <td style={{ color: "#71717a" }}>{new Date(b.bookingDate).toLocaleDateString()}</td>
                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#a1a1aa" }}>{b.startTime}</td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            className={`owner-badge ${
                              b.status === "completed"
                                ? "owner-badge-blue"
                                : b.status === "confirmed"
                                ? "owner-badge-green"
                                : "owner-badge-red"
                            }`}
                          >
                            {b.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Services */}
        <div className="owner-card">
          <div className="owner-card-header">
            <h3 className="owner-card-title">
              <TrendingUp size={18} style={{ color: "var(--brand-accent)" }} /> Top Services
            </h3>
            <Link to="/owner/services" className="owner-btn owner-btn-gold">
              Catalog <ChevronRight size={14} />
            </Link>
          </div>

          <div className="owner-card-pad" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {topServices.length === 0 ? (
              <p className="text-sm text-zinc-500 py-10 text-center font-medium">No sales statistics available.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {topServices.map((item, idx) => (
                  <div key={idx} className="owner-service-row">
                    <div>
                      <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.875rem" }}>{item.service}</h4>
                      <p style={{ fontSize: "0.6875rem", color: "#71717a", fontWeight: 600, marginTop: "0.125rem" }}>{item.totalBookings} orders filled</p>
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--brand-accent)", fontSize: "1rem" }}>₹{item.revenue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Comparisons */}
      <div className="owner-card">
        <div className="owner-card-header">
          <h3 className="owner-card-title">Monthly Revenue Comparisons ({new Date().getFullYear()})</h3>
        </div>
        <div className="owner-card-pad">
          {monthlyRevenue.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 font-medium text-sm">
              No completed sales aggregates recorded for this calendar year.
            </div>
          ) : (
            <div className="space-y-6">
              {monthlyRevenue.map((m, idx) => {
                const pct = (m.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span style={{ fontWeight: 700, color: "#d4d4d8" }}>{getMonthName(m._id.month)}</span>
                      <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "1rem" }}>
                        ₹{m.revenue} <span style={{ color: "#52525b", fontSize: "0.75rem", fontWeight: 600 }}>({m.bookings} bookings)</span>
                      </span>
                    </div>
                    <div className="owner-bar-track">
                      <div
                        className="owner-bar-fill"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

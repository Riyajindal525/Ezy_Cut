import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { createSalon, updateSalon } from "../../api/salon.api";
import { getSalonBookings } from "../../api/booking.api";
import { getSalonQueue } from "../../api/queue.api";
import { submitKyc, getSalonKyc } from "../../api/kyc.api";
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
  ChevronRight,
  Upload,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ShieldX,
  X
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
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  // KYC Stepper State
  const [registerStep, setRegisterStep] = useState(1);
  const [createdSalonId, setCreatedSalonId] = useState(null);
  const [kycFiles, setKycFiles] = useState({
    ownerIdProof: null,
    businessProof: null,
    salonImages: [],
  });
  const [kycMeta, setKycMeta] = useState({
    ownerIdProofType: "aadhaar",
    businessProofType: "none",
  });
  const [kycLoading, setKycLoading] = useState(false);
  const [kycData, setKycData] = useState(null);
  const idProofRef = useRef(null);
  const bizProofRef = useRef(null);
  const salonImgRef = useRef(null);

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
        try {
          const res = await getSalonKyc(currentSalon._id);
          setKycData(res.kyc || null);
        } catch (err) {
          setKycData(null);
        }
      }
      setSalonLoading(false);
    };

    if (user) {
      initSalon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "phone") {
      // Keep only digits and restrict to max 10 digits
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData({
      ...formData,
      [e.target.name]: value,
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

  // ─── KYC Step 2 Submit ─────────────────────────────────────────────────────
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kycFiles.ownerIdProof) {
      toast.error("Owner ID proof document is required.");
      return;
    }
    setKycLoading(true);
    try {
      const fd = new FormData();
      fd.append("salonId", createdSalonId);
      fd.append("ownerIdProofType", kycMeta.ownerIdProofType);
      fd.append("businessProofType", kycMeta.businessProofType);
      fd.append("ownerIdProof", kycFiles.ownerIdProof);
      if (kycFiles.businessProof) fd.append("businessProof", kycFiles.businessProof);
      kycFiles.salonImages.forEach((img) => fd.append("salonImages", img));

      await submitKyc(fd);
      toast.success("KYC documents submitted! Pending admin verification. ✅");

      const updatedSalons = await fetchSalons(true);
      const newSalon = updatedSalons.find((s) => s._id === createdSalonId);
      if (newSalon) setActiveSalonId(newSalon._id);

      setFormData({ name:"", description:"", address:"", city:"", state:"", pincode:"", phone:"", latitude:"", longitude:"", openingTime:"09:00 AM", closingTime:"09:00 PM" });
      setRegisterStep(1);
      setCreatedSalonId(null);
      setKycFiles({ ownerIdProof: null, businessProof: null, salonImages: [] });
      navigate("/owner/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit KYC. Please try again.");
    } finally {
      setKycLoading(false);
    }
  };

  // State 1: Register Salon Form (2-step KYC stepper)
  if (showRegisterForm) {
    return (
      <div className="owner-onboarding-card">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "2rem" }}>
          <div>
            <span className="owner-onboarding-tag">Onboarding</span>
            <h3 className="owner-onboarding-title">Register Salon Profile</h3>
            <p className="owner-onboarding-desc">Complete both steps to list your salon on EzyCut</p>
          </div>
          {ownedSalons.length > 0 && (
            <button onClick={() => navigate("/owner/dashboard")} className="owner-btn owner-btn-outline">
              Cancel
            </button>
          )}
        </div>

        {/* Step Progress Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "2.5rem" }}>
          {[{ n: 1, label: "Basic Details" }, { n: 2, label: "KYC Documents" }].map(({ n, label }, idx) => (
            <div key={n} style={{ display: "flex", alignItems: "center", flex: idx === 0 ? "none" : 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                <div style={{
                  width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                  background: registerStep >= n ? "var(--brand-accent)" : "rgba(255,255,255,0.06)",
                  color: registerStep >= n ? "#09090b" : "#71717a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.875rem", border: "2px solid",
                  borderColor: registerStep >= n ? "var(--brand-accent)" : "rgba(255,255,255,0.1)",
                  transition: "all 0.3s",
                }}>
                  {registerStep > n ? <CheckCircle2 size={16} /> : n}
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: registerStep >= n ? "white" : "#71717a", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {idx === 0 && (
                <div style={{ flex: 1, height: "2px", background: registerStep > 1 ? "var(--brand-accent)" : "rgba(255,255,255,0.08)", margin: "0 1rem", marginBottom: "1.5rem", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Basic Details ── */}
        {registerStep === 1 && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setRegisterLoading(true);
            try {
              const res = await createSalon({ ...formData, latitude: Number(formData.latitude), longitude: Number(formData.longitude) });
              setCreatedSalonId(res.salon?._id);
              toast.success("Basic details saved! Now upload your KYC documents.");
              setRegisterStep(2);
            } catch (err) {
              console.error(err);
              toast.error(err.response?.data?.message || "Failed to save salon details.");
            } finally {
              setRegisterLoading(false);
            }
          }} className="space-y-8">

            {/* Section 1: Basic Info */}
            <div className="owner-form-section space-y-6">
              <h4 className="owner-form-section-heading"><Building size={14} /> Basic Information</h4>
              <div className="owner-form-grid-2">
                <div className="owner-form-group">
                  <label className="owner-form-label">Salon Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="owner-form-input" placeholder="e.g. Sharp & Sleek Salon" />
                </div>
                <div className="owner-form-group">
                  <label className="owner-form-label">Contact Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" maxLength="10" className="owner-form-input" placeholder="e.g. 9876543210 (10 digits)" />
                </div>
              </div>
              <div className="owner-form-group">
                <label className="owner-form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="owner-form-textarea" placeholder="Tell customers about your salon..." />
              </div>
            </div>

            {/* Section 2: Address */}
            <div className="owner-form-section space-y-6">
              <h4 className="owner-form-section-heading"><MapPin size={14} /> Physical Location</h4>
              <div className="owner-form-group">
                <label className="owner-form-label">Street Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="owner-form-input" placeholder="e.g. Shop 42, Royal Complex" />
              </div>
              <div className="owner-form-grid-3">
                <div className="owner-form-group">
                  <label className="owner-form-label">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="owner-form-input" placeholder="City" />
                </div>
                <div className="owner-form-group">
                  <label className="owner-form-label">State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} required className="owner-form-input" placeholder="State" />
                </div>
                <div className="owner-form-group">
                  <label className="owner-form-label">Pincode *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className="owner-form-input" placeholder="Pincode" />
                </div>
              </div>
              <div className="owner-location-box">
                <div className="owner-location-box-header">
                  <span className="owner-form-label">Geolocation *</span>
                  <button type="button" onClick={handleGetLocation} className="owner-btn owner-btn-outline">Use Current Location 📍</button>
                </div>
                <div className="owner-form-grid-2">
                  <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} required className="owner-form-input" placeholder="Latitude (e.g. 28.61)" />
                  <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} required className="owner-form-input" placeholder="Longitude (e.g. 77.20)" />
                </div>
              </div>
            </div>

            {/* Section 3: Hours */}
            <div className="owner-form-section space-y-6">
              <h4 className="owner-form-section-heading"><Clock size={14} /> Operational Hours</h4>
              <div className="owner-form-grid-2">
                <div className="owner-form-group">
                  <label className="owner-form-label">Opening Time</label>
                  <input type="text" name="openingTime" value={formData.openingTime} onChange={handleChange} className="owner-form-input" placeholder="09:00 AM" />
                </div>
                <div className="owner-form-group">
                  <label className="owner-form-label">Closing Time</label>
                  <input type="text" name="closingTime" value={formData.closingTime} onChange={handleChange} className="owner-form-input" placeholder="09:00 PM" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={registerLoading} className="owner-submit-btn">
              {registerLoading ? "Saving Details..." : "Save & Continue to KYC →"}
            </button>
          </form>
        )}

        {/* ── STEP 2: KYC Documents ── */}
        {registerStep === 2 && (
          <form onSubmit={handleKycSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Mandatory Notice */}
            <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "10px", padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <ShieldCheck size={20} style={{ color: "var(--brand-accent)", flexShrink: 0, marginTop: "0.1rem" }} />
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--brand-accent)", marginBottom: "0.25rem" }}>KYC Verification Required</p>
                <p style={{ fontSize: "0.8125rem", color: "#a1a1aa", lineHeight: 1.6 }}>As per government regulations, salon owners must complete KYC verification. Upload your identity proof (mandatory) and business documents. Accepted formats: JPEG, PNG, PDF (max 5MB each).</p>
              </div>
            </div>

            {/* Owner ID Proof — MANDATORY */}
            <div className="owner-form-section" style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
              <h4 className="owner-form-section-heading"><User size={14} /> Owner Identity Proof <span style={{ color: "#f87171", fontSize: "0.75rem", fontWeight: 500, marginLeft: "0.5rem" }}>* Required</span></h4>
              <div className="owner-form-group">
                <label className="owner-form-label">Document Type *</label>
                <select
                  value={kycMeta.ownerIdProofType}
                  onChange={(e) => setKycMeta(p => ({ ...p, ownerIdProofType: e.target.value }))}
                  className="owner-form-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                </select>
              </div>
              <div>
                <label className="owner-form-label" style={{ marginBottom: "0.5rem", display: "block" }}>Upload Document *</label>
                <div
                  onClick={() => idProofRef.current?.click()}
                  style={{
                    border: `2px dashed ${kycFiles.ownerIdProof ? "var(--brand-accent)" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: "10px", padding: "2rem 1.5rem", cursor: "pointer",
                    textAlign: "center", background: kycFiles.ownerIdProof ? "rgba(251,191,36,0.04)" : "rgba(255,255,255,0.02)",
                    transition: "all 0.2s",
                  }}
                >
                  {kycFiles.ownerIdProof ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                      <CheckCircle2 size={20} style={{ color: "var(--brand-accent)" }} />
                      <span style={{ fontSize: "0.875rem", color: "var(--brand-accent)", fontWeight: 600 }}>{kycFiles.ownerIdProof.name}</span>
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); setKycFiles(p => ({ ...p, ownerIdProof: null })); }} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: 0 }}><X size={16} /></button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <Upload size={24} style={{ color: "#71717a" }} />
                      <span style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Click to upload ID proof</span>
                      <span style={{ fontSize: "0.75rem", color: "#52525b" }}>JPEG, PNG or PDF · Max 5MB</span>
                    </div>
                  )}
                </div>
                <input ref={idProofRef} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }}
                  onChange={(e) => e.target.files?.[0] && setKycFiles(p => ({ ...p, ownerIdProof: e.target.files[0] }))} />
              </div>
            </div>

            {/* Business Proof — OPTIONAL */}
            <div className="owner-form-section" style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
              <h4 className="owner-form-section-heading"><FileText size={14} /> Business Proof <span style={{ color: "#71717a", fontSize: "0.75rem", fontWeight: 400, marginLeft: "0.5rem" }}>(Optional)</span></h4>
              <div className="owner-form-group">
                <label className="owner-form-label">Document Type</label>
                <select
                  value={kycMeta.businessProofType}
                  onChange={(e) => setKycMeta(p => ({ ...p, businessProofType: e.target.value }))}
                  className="owner-form-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="none">Not Applicable / Skip</option>
                  <option value="gst">GST Certificate</option>
                  <option value="trade_license">Trade License</option>
                  <option value="shop_act">Shop & Establishment Act</option>
                  <option value="udyam">Udyam Registration</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {kycMeta.businessProofType !== "none" && (
                <div>
                  <label className="owner-form-label" style={{ marginBottom: "0.5rem", display: "block" }}>Upload Business Document</label>
                  <div
                    onClick={() => bizProofRef.current?.click()}
                    style={{
                      border: `2px dashed ${kycFiles.businessProof ? "var(--brand-accent)" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: "10px", padding: "1.5rem", cursor: "pointer",
                      textAlign: "center", background: "rgba(255,255,255,0.02)", transition: "all 0.2s",
                    }}
                  >
                    {kycFiles.businessProof ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--brand-accent)" }} />
                        <span style={{ fontSize: "0.875rem", color: "var(--brand-accent)", fontWeight: 600 }}>{kycFiles.businessProof.name}</span>
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); setKycFiles(p => ({ ...p, businessProof: null })); }} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: 0 }}><X size={16} /></button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <Upload size={20} style={{ color: "#71717a" }} />
                        <span style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Click to upload business document</span>
                        <span style={{ fontSize: "0.75rem", color: "#52525b" }}>JPEG, PNG or PDF · Max 5MB</span>
                      </div>
                    )}
                  </div>
                  <input ref={bizProofRef} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }}
                    onChange={(e) => e.target.files?.[0] && setKycFiles(p => ({ ...p, businessProof: e.target.files[0] }))} />
                </div>
              )}
            </div>

            {/* Salon Images — OPTIONAL */}
            <div className="owner-form-section" style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
              <h4 className="owner-form-section-heading"><Upload size={14} /> Salon Photos <span style={{ color: "#71717a", fontSize: "0.75rem", fontWeight: 400, marginLeft: "0.5rem" }}>(Optional · Up to 5)</span></h4>
              <div>
                <div
                  onClick={() => salonImgRef.current?.click()}
                  style={{
                    border: `2px dashed ${kycFiles.salonImages.length > 0 ? "var(--brand-accent)" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: "10px", padding: "1.5rem", cursor: "pointer",
                    textAlign: "center", background: "rgba(255,255,255,0.02)", transition: "all 0.2s",
                  }}
                >
                  {kycFiles.salonImages.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                      {kycFiles.salonImages.map((img, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "6px", padding: "0.35rem 0.75rem" }}>
                          <CheckCircle2 size={14} style={{ color: "var(--brand-accent)" }} />
                          <span style={{ fontSize: "0.8rem", color: "var(--brand-accent)" }}>{img.name}</span>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setKycFiles(p => ({ ...p, salonImages: p.salonImages.filter((_, idx) => idx !== i) })); }} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: 0 }}><X size={12} /></button>
                        </div>
                      ))}
                      {kycFiles.salonImages.length < 5 && <span style={{ fontSize: "0.8rem", color: "#71717a" }}>+ Add more</span>}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <Upload size={20} style={{ color: "#71717a" }} />
                      <span style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Click to upload salon photos</span>
                      <span style={{ fontSize: "0.75rem", color: "#52525b" }}>JPEG or PNG · Max 5MB each · Up to 5 photos</span>
                    </div>
                  )}
                </div>
                <input ref={salonImgRef} type="file" accept="image/jpeg,image/png" multiple style={{ display: "none" }}
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    const remaining = 5 - kycFiles.salonImages.length;
                    const toAdd = selected.slice(0, remaining);
                    setKycFiles(p => ({ ...p, salonImages: [...p.salonImages, ...toAdd] }));
                  }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" onClick={() => setRegisterStep(1)} className="owner-btn owner-btn-outline" style={{ flex: 1 }}>← Back</button>
              {kycFiles.ownerIdProof && (
                <button type="submit" disabled={kycLoading} className="owner-submit-btn" style={{ flex: 2 }}>
                  {kycLoading ? "Uploading Documents..." : "Submit KYC & Complete Registration"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    );
  }

  // State 2: Active Salon Pending Approval
  if (salon && !salon.isApproved) {
    const isRejected = kycData && kycData.kycStatus === "rejected";

    return (
      <div className="owner-welcome-card" style={{ maxWidth: "600px", margin: "2rem auto", padding: "2.5rem" }}>
        {isRejected ? (
          <>
            <div className="owner-welcome-icon" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <ShieldX size={36} style={{ color: "#ef4444" }} />
            </div>
            
            <h3 className="owner-welcome-title" style={{ color: "#ef4444" }}>KYC Verification Rejected</h3>
            <p className="owner-welcome-desc" style={{ marginBottom: "1.5rem" }}>
              The registration details for <strong>{salon.name}</strong> were reviewed by our team and could not be verified at this time.
            </p>

            <div style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "10px",
              padding: "1.25rem",
              marginBottom: "2rem",
              textAlign: "left"
            }}>
              <p style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Reason for Rejection:
              </p>
              <p style={{ fontSize: "0.875rem", color: "#fca5a5", lineHeight: 1.6, fontWeight: 500 }}>
                {kycData.rejectionReason || "Documents provided are invalid or incomplete. Please check your uploaded files and try again."}
              </p>
            </div>

            <button
              onClick={() => {
                setCreatedSalonId(salon._id);
                setRegisterStep(2);
                setShowRegisterForm(true);
                navigate(`/owner/dashboard?register=true`);
              }}
              className="owner-btn owner-btn-solid-gold"
              style={{ width: "100%", padding: "1rem", borderRadius: "12px", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem" }}
            >
              Re-submit KYC Documents
            </button>
          </>
        ) : (
          <>
            <div className="owner-welcome-icon">
              <Clock size={36} style={{ color: "var(--brand-accent)" }} />
            </div>
            
            <h3 className="owner-welcome-title">Registration Under Review</h3>
            <p className="owner-welcome-desc">
              The profile details for <strong>{salon.name}</strong> have been submitted and are pending review by our administration. We will activate your dashboard once verified.
            </p>
          </>
        )}

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

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
  X,
  Sparkles,
  Navigation,
  Users,
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

  // ─────────────────────────────────────────────────────────────────────────
  // State 0: Welcome / Empty Dashboard when user has no salons yet
  // ─────────────────────────────────────────────────────────────────────────
  if (ownedSalons.length === 0 && !showRegisterForm) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white border border-gray-100 rounded-3xl shadow-sm p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center mx-auto mb-6">
          <Building size={34} className="text-[#0d9488]" />
        </div>

        <h3 className="text-2xl font-extrabold text-gray-800 mb-3">Welcome to EzyCut!</h3>
        <p className="text-gray-500 text-[0.9375rem] leading-relaxed max-w-md mx-auto">
          You don't have any salons registered under this account yet. Register your salon profile to start listing services, managing bookings, and tracking live queues.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate("/owner/dashboard?register=true")}
            className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors"
          >
            <Plus size={16} /> Register Your Salon
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

  // Shared input classes for the light theme
  const inputCls =
    "w-full bg-[#f7faf9] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#0d9488] focus:bg-white focus:ring-2 focus:ring-[#0d9488]/15";
  const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-wider";

  // ─────────────────────────────────────────────────────────────────────────
  // State 1: Register Salon Form (2-step KYC stepper)
  // ─────────────────────────────────────────────────────────────────────────
  if (showRegisterForm) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-10">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap pb-6 border-b border-gray-100 mb-8">
          <div>
            <span className="inline-flex bg-[#f0fdfa] border border-[#ccfbf1] px-3 py-1 rounded-full text-[0.6875rem] font-bold text-[#0f766e] uppercase tracking-wider mb-2">
              Onboarding
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Register Salon Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Complete both steps to list your salon on EzyCut</p>
          </div>
          {ownedSalons.length > 0 && (
            <button
              onClick={() => navigate("/owner/dashboard")}
              className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Step Progress Indicator */}
        <div className="flex items-center mb-10">
          {[{ n: 1, label: "Basic Details" }, { n: 2, label: "KYC Documents" }].map(({ n, label }, idx) => (
            <div key={n} className={`flex items-center ${idx === 0 ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    registerStep >= n
                      ? "bg-[#0d9488] border-[#0d9488] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {registerStep > n ? <CheckCircle2 size={16} /> : n}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${registerStep >= n ? "text-gray-800" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {idx === 0 && (
                <div className={`flex-1 h-0.5 mx-4 -mb-6 transition-colors ${registerStep > 1 ? "bg-[#0d9488]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Basic Details ── */}
        {registerStep === 1 && (
          <form
            onSubmit={async (e) => {
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
            }}
            className="space-y-6"
          >
            {/* Section 1: Basic Info */}
            <div className="bg-[#f7faf9] border border-gray-100 rounded-2xl p-6 space-y-5">
              <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-2">
                <Building size={14} /> Basic Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Salon Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputCls} placeholder="e.g. Sharp & Sleek Salon" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Contact Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" maxLength="10" className={inputCls} placeholder="e.g. 9876543210 (10 digits)" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={inputCls} placeholder="Tell customers about your salon..." />
              </div>
            </div>

            {/* Section 2: Address */}
            <div className="bg-[#f7faf9] border border-gray-100 rounded-2xl p-6 space-y-5">
              <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} /> Physical Location
              </h4>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Street Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className={inputCls} placeholder="e.g. Shop 42, Royal Complex" />
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className={inputCls} placeholder="City" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} required className={inputCls} placeholder="State" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Pincode *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className={inputCls} placeholder="Pincode" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center gap-4 flex-wrap mb-3">
                  <span className={labelCls}>Geolocation *</span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Navigation size={12} /> Use Current Location
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} required className={inputCls} placeholder="Latitude (e.g. 28.61)" />
                  <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} required className={inputCls} placeholder="Longitude (e.g. 77.20)" />
                </div>
              </div>
            </div>

            {/* Section 3: Hours */}
            <div className="bg-[#f7faf9] border border-gray-100 rounded-2xl p-6 space-y-5">
              <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} /> Operational Hours
              </h4>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Opening Time</label>
                  <input type="text" name="openingTime" value={formData.openingTime} onChange={handleChange} className={inputCls} placeholder="09:00 AM" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Closing Time</label>
                  <input type="text" name="closingTime" value={formData.closingTime} onChange={handleChange} className={inputCls} placeholder="09:00 PM" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors flex items-center justify-center gap-2"
            >
              {registerLoading ? "Saving Details..." : "Save & Continue to KYC"} <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* ── STEP 2: KYC Documents ── */}
        {registerStep === 2 && (
          <form onSubmit={handleKycSubmit} className="flex flex-col gap-6">
            {/* Mandatory Notice */}
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl px-5 py-4 flex gap-3 items-start">
              <ShieldCheck size={20} className="text-[#0d9488] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#0f766e] mb-1">KYC Verification Required</p>
                <p className="text-[0.8125rem] text-gray-500 leading-relaxed">
                  As per government regulations, salon owners must complete KYC verification. Upload your identity proof (mandatory) and business documents. Accepted formats: JPEG, PNG, PDF (max 5MB each).
                </p>
              </div>
            </div>

            {/* Owner ID Proof — MANDATORY */}
            <div className="bg-[#f7faf9] border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Owner Identity Proof
                <span className="text-rose-500 text-[0.6875rem] font-semibold normal-case ml-1">* Required</span>
              </h4>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Document Type *</label>
                <select
                  value={kycMeta.ownerIdProofType}
                  onChange={(e) => setKycMeta((p) => ({ ...p, ownerIdProofType: e.target.value }))}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                </select>
              </div>
              <div>
                <label className={`${labelCls} mb-2 block`}>Upload Document *</label>
                <div
                  onClick={() => idProofRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 cursor-pointer text-center transition-colors ${
                    kycFiles.ownerIdProof ? "border-[#0d9488] bg-[#f0fdfa]" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {kycFiles.ownerIdProof ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 size={20} className="text-[#0d9488]" />
                      <span className="text-sm text-[#0f766e] font-semibold">{kycFiles.ownerIdProof.name}</span>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setKycFiles((p) => ({ ...p, ownerIdProof: null }));
                        }}
                        className="text-gray-400 hover:text-rose-500 p-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload ID proof</span>
                      <span className="text-xs text-gray-400">JPEG, PNG or PDF · Max 5MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={idProofRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setKycFiles((p) => ({ ...p, ownerIdProof: e.target.files[0] }))}
                />
              </div>
            </div>

            {/* Business Proof — OPTIONAL */}
            <div className="bg-[#f7faf9] border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} /> Business Proof
                <span className="text-gray-400 text-[0.6875rem] font-medium normal-case ml-1">(Optional)</span>
              </h4>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Document Type</label>
                <select
                  value={kycMeta.businessProofType}
                  onChange={(e) => setKycMeta((p) => ({ ...p, businessProofType: e.target.value }))}
                  className={`${inputCls} cursor-pointer`}
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
                  <label className={`${labelCls} mb-2 block`}>Upload Business Document</label>
                  <div
                    onClick={() => bizProofRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 cursor-pointer text-center transition-colors ${
                      kycFiles.businessProof ? "border-[#0d9488] bg-[#f0fdfa]" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {kycFiles.businessProof ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 size={18} className="text-[#0d9488]" />
                        <span className="text-sm text-[#0f766e] font-semibold">{kycFiles.businessProof.name}</span>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setKycFiles((p) => ({ ...p, businessProof: null }));
                          }}
                          className="text-gray-400 hover:text-rose-500 p-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload business document</span>
                        <span className="text-xs text-gray-400">JPEG, PNG or PDF · Max 5MB</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={bizProofRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setKycFiles((p) => ({ ...p, businessProof: e.target.files[0] }))}
                  />
                </div>
              )}
            </div>

            {/* Salon Images — OPTIONAL */}
            <div className="bg-[#f7faf9] border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-2">
                <Upload size={14} /> Salon Photos
                <span className="text-gray-400 text-[0.6875rem] font-medium normal-case ml-1">(Optional · Up to 5)</span>
              </h4>
              <div>
                <div
                  onClick={() => salonImgRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 cursor-pointer text-center transition-colors ${
                    kycFiles.salonImages.length > 0 ? "border-[#0d9488] bg-[#f0fdfa]" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {kycFiles.salonImages.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {kycFiles.salonImages.map((img, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white border border-[#ccfbf1] rounded-lg px-3 py-1.5">
                          <CheckCircle2 size={14} className="text-[#0d9488]" />
                          <span className="text-[0.8rem] text-[#0f766e]">{img.name}</span>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setKycFiles((p) => ({ ...p, salonImages: p.salonImages.filter((_, idx) => idx !== i) }));
                            }}
                            className="text-gray-400 hover:text-rose-500 p-0"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {kycFiles.salonImages.length < 5 && <span className="text-[0.8rem] text-gray-400 self-center">+ Add more</span>}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload salon photos</span>
                      <span className="text-xs text-gray-400">JPEG or PNG · Max 5MB each · Up to 5 photos</span>
                    </div>
                  )}
                </div>
                <input
                  ref={salonImgRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    const remaining = 5 - kycFiles.salonImages.length;
                    const toAdd = selected.slice(0, remaining);
                    setKycFiles((p) => ({ ...p, salonImages: [...p.salonImages, ...toAdd] }));
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setRegisterStep(1)}
                className="flex-1 inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                ← Back
              </button>
              {kycFiles.ownerIdProof && (
                <button
                  type="submit"
                  disabled={kycLoading}
                  className="flex-[2] bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors"
                >
                  {kycLoading ? "Uploading Documents..." : "Submit KYC & Complete Registration"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State 2: Active Salon Pending Approval
  // ─────────────────────────────────────────────────────────────────────────
  if (salon && !salon.isApproved) {
    const isRejected = kycData && kycData.kycStatus === "rejected";

    return (
      <div className="max-w-xl mx-auto my-8 bg-white border border-gray-100 rounded-3xl shadow-sm p-8 sm:p-10">
        {isRejected ? (
          <>
            <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6">
              <ShieldX size={34} className="text-rose-500" />
            </div>

            <h3 className="text-2xl font-extrabold text-rose-500 text-center mb-3">KYC Verification Rejected</h3>
            <p className="text-gray-500 text-[0.9375rem] leading-relaxed text-center mb-6">
              The registration details for <strong className="text-gray-700">{salon.name}</strong> were reviewed by our team and could not be verified at this time.
            </p>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 mb-8 text-left">
              <p className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-2">Reason for Rejection:</p>
              <p className="text-sm text-rose-600 leading-relaxed font-medium">
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
              className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors mb-4"
            >
              Re-submit KYC Documents
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock size={34} className="text-[#0d9488]" />
            </div>

            <h3 className="text-2xl font-extrabold text-gray-800 text-center mb-3">Registration Under Review</h3>
            <p className="text-gray-500 text-[0.9375rem] leading-relaxed text-center">
              The profile details for <strong className="text-gray-700">{salon.name}</strong> have been submitted and are pending review by our administration. We will activate your dashboard once verified.
            </p>
          </>
        )}

        <div className="h-px bg-gray-100 my-8" />

        <div className="flex flex-col gap-4 items-center">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
            <Info size={14} /> Need to list another store?
          </div>
          <button
            onClick={() => navigate("/owner/dashboard?register=true")}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={14} /> Register Another Salon
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

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${overview?.totalRevenue || 0}`,
      sub: "Lifetime completed sales",
      icon: DollarSign,
      tint: "bg-emerald-50 text-emerald-600",
      subTint: "text-emerald-600",
    },
    {
      label: "Today's Bookings",
      value: overview?.todayBookings || 0,
      sub: "Scheduled for today",
      icon: Calendar,
      tint: "bg-sky-50 text-sky-600",
      subTint: "text-sky-600",
    },
    {
      label: "Active Queue",
      value: overview?.activeQueue || 0,
      sub: "Clients checked-in/waiting",
      icon: Users,
      tint: "bg-[#f0fdfa] text-[#0d9488]",
      subTint: "text-[#0d9488]",
    },
    {
      label: "Salon Rating",
      value: (
        <>
          {overview?.averageRating || 0} <span className="text-lg font-normal text-gray-400">/ 5</span>
        </>
      ),
      sub: `Across ${overview?.totalReviews || 0} reviews`,
      icon: Star,
      tint: "bg-purple-50 text-purple-600",
      subTint: "text-purple-600",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, sub, icon: Icon, tint, subTint }) => (
          <div
            key={label}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
                <Icon size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-gray-800 tracking-tight">{value}</h3>
              <p className={`text-xs font-semibold mt-1.5 ${subTint}`}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Appointments */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={17} className="text-[#0d9488]" /> Recent Appointments
            </h3>
            <Link
              to="/owner/bookings"
              className="inline-flex items-center gap-1 bg-[#f0fdfa] hover:bg-[#ccfbf1]/60 text-[#0f766e] font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Manage Bookings <ChevronRight size={13} />
            </Link>
          </div>

          <div className="p-6">
            {recentBookings.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center font-medium">No bookings logged for this salon yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Customer</th>
                      <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Service</th>
                      <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Date</th>
                      <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Time</th>
                      <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 pr-4 font-bold text-gray-800">{b.customer?.name}</td>
                        <td className="py-3 pr-4 font-medium text-gray-600">{b.service?.name}</td>
                        <td className="py-3 pr-4 text-gray-400">{new Date(b.bookingDate).toLocaleDateString()}</td>
                        <td className="py-3 pr-4 font-mono font-semibold text-gray-600">{b.startTime}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                              b.status === "completed"
                                ? "bg-sky-50 text-sky-600"
                                : b.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
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
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={17} className="text-[#0d9488]" /> Top Services
            </h3>
            <Link
              to="/owner/services"
              className="inline-flex items-center gap-1 bg-[#f0fdfa] hover:bg-[#ccfbf1]/60 text-[#0f766e] font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Catalog <ChevronRight size={13} />
            </Link>
          </div>

          <div className="p-6 flex flex-col gap-3">
            {topServices.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center font-medium">No sales statistics available.</p>
            ) : (
              topServices.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center px-4 py-3 rounded-xl bg-[#f7faf9] border border-gray-100 hover:border-[#ccfbf1] transition-colors"
                >
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-sm">{item.service}</h4>
                    <p className="text-[0.6875rem] text-gray-400 font-semibold mt-0.5">{item.totalBookings} orders filled</p>
                  </div>
                  <span className="font-mono font-extrabold text-[#0d9488] text-base">₹{item.revenue}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Comparisons */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={16} className="text-[#0d9488]" /> Monthly Revenue Comparisons ({new Date().getFullYear()})
          </h3>
        </div>
        <div className="p-6">
          {monthlyRevenue.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium text-sm">
              No completed sales aggregates recorded for this calendar year.
            </div>
          ) : (
            <div className="space-y-6">
              {monthlyRevenue.map((m, idx) => {
                const pct = (m.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="font-bold text-gray-600">{getMonthName(m._id.month)}</span>
                      <span className="text-gray-800 font-extrabold text-base">
                        ₹{m.revenue} <span className="text-gray-400 text-xs font-semibold">({m.bookings} bookings)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0d9488] to-[#14b8a6] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
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
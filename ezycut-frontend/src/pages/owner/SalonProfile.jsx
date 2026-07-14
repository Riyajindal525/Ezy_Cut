import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { getAllSalons, updateSalon, deleteSalon } from "../../api/salon.api";
import { getSalonKyc } from "../../api/kyc.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import {
  Building,
  Trash2,
  ShieldAlert,
  X,
  ShieldCheck,
  Clock,
  ShieldX,
  MapPin,
  ImagePlus,
  Sparkles,
  Crosshair,
} from "lucide-react";

const SalonProfile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons, fetchSalons, setActiveSalonId } = useSalonStore();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [kyc, setKyc] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typedSalonName, setTypedSalonName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const fetchActiveSalonProfile = async () => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        setFormData({
          name: activeSalon.name || "",
          description: activeSalon.description || "",
          address: activeSalon.address || "",
          city: activeSalon.city || "",
          state: activeSalon.state || "",
          pincode: activeSalon.pincode || "",
          phone: activeSalon.phone || "",
          latitude: activeSalon.location?.coordinates?.[1]?.toString() || "",
          longitude: activeSalon.location?.coordinates?.[0]?.toString() || "",
          openingTime: activeSalon.openingTime || "09:00 AM",
          closingTime: activeSalon.closingTime || "09:00 PM",
          imageUrl: activeSalon.images?.[0] || "",
        });
        // Fetch KYC status
        try {
          const kycData = await getSalonKyc(activeSalon._id);
          setKyc(kycData.kyc || null);
        } catch {
          setKyc(null);
        }
      } else {
        setError("register_needed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load salon profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveSalonProfile();
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
          toast.success("Location coordinates updated! 📍");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salon) return;
    setSaveLoading(true);

    try {
      await updateSalon(salon._id, {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      });
      toast.success("Salon profile details updated successfully! 🎉");
      await fetchSalons(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update salon profile settings.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteSalon = async () => {
    if (typedSalonName !== salon.name) {
      toast.error("Salon name does not match.");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteSalon(salon._id);
      toast.success("Salon profile deleted successfully.");
      setShowDeleteModal(false);

      const updatedSalons = await fetchSalons(true);
      const remainingOwned = updatedSalons.filter(
        (s) => s.owner?._id === user?.id || s.owner === user?.id
      );

      if (remainingOwned.length > 0) {
        setActiveSalonId(remainingOwned[0]._id);
        navigate("/owner/dashboard");
      } else {
        setActiveSalonId(null);
        navigate("/owner/dashboard?register=true");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete salon profile.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const inputClass =
    "w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all duration-200 focus:border-[#0d9488] focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)]";
  const labelClass = "text-[0.8125rem] font-semibold text-gray-600 mb-2 block";

  if (loading) {
    return <Loader message="Retrieving salon registry settings..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0 || error === "register_needed") {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white border border-gray-100 rounded-3xl shadow-sm p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center mx-auto mb-6">
          <Building size={32} className="text-[#0d9488]" />
        </div>
        <h3 className="font-['Outfit'] text-2xl font-extrabold text-gray-800 mb-3">Salon Setup Required</h3>
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
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header Banner with decorative SVG */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden rounded-2xl p-7 md:p-8 bg-gradient-to-br from-[#0f766e] to-[#042f2e] border border-[#0d9488]/20 flex items-center justify-between gap-4 flex-wrap`}
      >
        {/* Decorative pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="salonProfileDots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#5eead4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#salonProfileDots)" />
        </svg>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.22)_0%,transparent_70%)] pointer-events-none" />
        <Sparkles size={18} className="absolute right-8 top-8 text-white/25" />

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Building size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-['Outfit'] text-xl md:text-2xl font-extrabold text-white tracking-[-0.02em]">
              Salon Profile Settings
            </h1>
            <p className="text-white/70 text-sm mt-1">Configure your salon details, opening hours, and location</p>
          </div>
        </div>

        <span
          className={`relative inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide px-3.5 py-2 rounded-full ${
            salon?.isApproved
              ? "bg-emerald-400/15 text-emerald-300 border border-emerald-300/25"
              : "bg-amber-400/15 text-amber-300 border border-amber-300/25"
          }`}
        >
          {salon?.isApproved ? <ShieldCheck size={13} /> : <Clock size={13} />}
          {salon?.isApproved ? "Approved & Live" : "Pending Review"}
        </span>
      </div>

      {/* Profile Form Card */}
      <div {...fadeUp(80)} className={`${fadeUp(80).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e]">Profile Configuration</h3>
          <p className="text-xs text-gray-400 mt-1">Update your salon details and operational settings</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Showcase image preview + basic info */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <label className={labelClass}>Showcase Preview</label>
                <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden border border-gray-200 bg-[#f0fdfa] relative">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Salon preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[#0d9488]">
                      <ImagePlus size={22} className="opacity-60" />
                      <p className="text-[0.65rem] font-semibold text-[#5b6b68]">No image yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Salon Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Salon Name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Phone Number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Salon Showcase Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. https://images.unsplash.com/photo-... (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`${inputClass} resize-y`}
                placeholder="Tell customers about your salon services..."
              />
            </div>

            {/* Street Address */}
            <div>
              <label className={labelClass}>Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Street Address"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="City"
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="State"
                />
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Pincode"
                />
              </div>
            </div>

            {/* Geolocation */}
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <span className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-[#134e4a]">
                  <MapPin size={15} className="text-[#0d9488]" />
                  Geolocation Coordinates
                </span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-[#f0fdfa] border border-[#0d9488]/30 text-[#0f766e] font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
                >
                  <Crosshair size={13} />
                  Capture Current Coordinates
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className={`${inputClass} bg-white`}
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className={`${inputClass} bg-white`}
                  placeholder="Longitude"
                />
              </div>
            </div>

            {/* Opening / Closing Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Opening Time</label>
                <input
                  type="text"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Opening Time (e.g. 09:00 AM)"
                />
              </div>
              <div>
                <label className={labelClass}>Closing Time</label>
                <input
                  type="text"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Closing Time (e.g. 09:00 PM)"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saveLoading}
              className="flex items-center justify-center gap-2 w-full bg-[#0f766e] hover:bg-[#0d5e58] disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-300 hover:shadow-[0_8px_20px_rgba(15,118,110,0.3)]"
            >
              {saveLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Profile Settings...
                </>
              ) : (
                "Save Profile Settings"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* KYC Verification Status Card */}
      <div {...fadeUp(140)} className={`${fadeUp(140).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e]">KYC Verification Status</h3>
            <p className="text-xs text-gray-400 mt-1">Government-mandated identity & business verification</p>
          </div>
          {kyc && (
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                kyc.kycStatus === "approved"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : kyc.kycStatus === "rejected"
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-amber-50 text-amber-600 border border-amber-100"
              }`}
            >
              {kyc.kycStatus === "approved" ? <ShieldCheck size={13} /> : kyc.kycStatus === "rejected" ? <ShieldX size={13} /> : <Clock size={13} />}
              {kyc.kycStatus === "approved" ? "Verified" : kyc.kycStatus === "rejected" ? "Rejected" : "Pending Review"}
            </span>
          )}
        </div>
        <div className="p-6">
          {!kyc ? (
            <div className="flex items-center gap-4 p-4 bg-rose-50/60 border border-rose-100 rounded-xl flex-wrap">
              <ShieldX size={22} className="text-rose-500 shrink-0" />
              <div className="flex-1 min-w-[200px]">
                <p className="font-bold text-rose-700 mb-0.5">KYC Not Submitted</p>
                <p className="text-[0.8125rem] text-gray-500">You must submit KYC documents to get your salon approved.</p>
              </div>
              <Link
                to="/owner/dashboard?register=true"
                className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[0.8125rem] font-bold whitespace-nowrap hover:bg-amber-100 transition-colors"
              >
                Submit KYC →
              </Link>
            </div>
          ) : kyc.kycStatus === "approved" ? (
            <div className="flex items-center gap-4 p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <ShieldCheck size={22} className="text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-emerald-700 mb-0.5">KYC Approved ✓</p>
                <p className="text-[0.8125rem] text-gray-500">
                  Verified on {new Date(kyc.reviewedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
                  Your salon is live and discoverable by customers.
                </p>
              </div>
            </div>
          ) : kyc.kycStatus === "rejected" ? (
            <div className="flex items-start gap-4 p-4 bg-rose-50/60 border border-rose-100 rounded-xl flex-wrap">
              <ShieldX size={22} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-[200px]">
                <p className="font-bold text-rose-700 mb-0.5">KYC Rejected</p>
                {kyc.rejectionReason && (
                  <p className="text-[0.8125rem] text-rose-500">Reason: {kyc.rejectionReason}</p>
                )}
              </div>
              <Link
                to="/owner/dashboard?register=true"
                className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[0.8125rem] font-bold whitespace-nowrap hover:bg-amber-100 transition-colors"
              >
                Re-submit →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
              <Clock size={22} className="text-amber-500 shrink-0" />
              <div>
                <p className="font-bold text-amber-700 mb-0.5">KYC Under Review</p>
                <p className="text-[0.8125rem] text-gray-500">
                  Submitted on {new Date(kyc.submittedAt).toLocaleDateString("en-IN")}. Our team will verify your documents within 1–2 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div {...fadeUp(200)} className={`${fadeUp(200).className} bg-rose-50/50 border border-rose-100 rounded-2xl p-6`}>
        <h4 className="flex items-center gap-2 font-['Outfit'] text-base font-extrabold text-rose-600 mb-2">
          <ShieldAlert size={19} /> Danger Zone
        </h4>
        <p className="text-sm text-rose-500/90 leading-relaxed mb-4">
          Once you delete your salon profile, there is no going back. All appointments and lists will be permanently lost.
        </p>
        <button
          type="button"
          onClick={() => {
            setTypedSalonName("");
            setShowDeleteModal(true);
          }}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
          Delete Salon Profile
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.25s_ease]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] text-lg font-extrabold text-gray-800">Delete Salon Profile</h3>
                  <p className="text-xs text-gray-400 mt-0.5">This action is permanent and cannot be reversed.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              All bookings, queue lines, and services for <strong className="text-gray-800">{salon?.name}</strong> will be permanently deleted.
            </p>

            <div className="my-5">
              <label className="text-[0.8125rem] font-semibold text-gray-600 mb-2 block">
                Type salon name <strong className="text-gray-800">{salon?.name}</strong> to confirm:
              </label>
              <input
                type="text"
                value={typedSalonName}
                onChange={(e) => setTypedSalonName(e.target.value)}
                placeholder={salon?.name}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTypedSalonName("");
                }}
                className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSalon}
                disabled={typedSalonName !== salon?.name || deleteLoading}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all duration-200"
              >
                {deleteLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Permanently Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonProfile;
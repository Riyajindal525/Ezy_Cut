import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { getAllSalons, updateSalon, deleteSalon } from "../../api/salon.api";
import { getSalonKyc } from "../../api/kyc.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Building, Trash2, ShieldAlert, X, ShieldCheck, Clock, ShieldX } from "lucide-react";

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

  if (loading) {
    return <Loader message="Retrieving salon registry settings..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0 || error === "register_needed") {
    return (
      <div className="owner-welcome-card">
        <div className="owner-welcome-icon">
          <Building size={36} style={{ color: "var(--brand-accent)" }} />
        </div>
        <h3 className="owner-welcome-title">Salon Setup Required</h3>
        <p className="owner-welcome-desc">
          You have not registered a salon profile yet. Please complete your salon setup first.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <Link
            to="/owner/dashboard?register=true"
            className="owner-btn owner-btn-solid-gold"
            style={{ padding: "0.875rem 2rem", fontSize: "0.875rem", borderRadius: "12px", textDecoration: "none", display: "inline-flex" }}
          >
            Go to Onboarding Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Page Header */}
      <div className="owner-page-header">
        <div>
          <h3 className="owner-page-title">Salon Profile Settings</h3>
          <p className="owner-page-desc">Configure your salon details, opening hours, and location</p>
        </div>
        <span className={`owner-badge ${salon?.isApproved ? "owner-badge-green" : "owner-badge-amber"}`}>
          {salon?.isApproved ? "Approved & Live" : "Pending Review"}
        </span>
      </div>

      {/* Profile Form Card */}
      <div className="owner-card">
        <div className="owner-card-header">
          <div>
            <h3 className="owner-card-title">Profile Configuration</h3>
            <p className="owner-card-subtitle">Update your salon details and operational settings</p>
          </div>
        </div>
        <div className="owner-card-pad">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Basic Info */}
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
                  placeholder="Salon Name"
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
                  placeholder="Phone Number"
                />
              </div>
            </div>

            {/* Description */}
            <div className="owner-form-group">
              <label className="owner-form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="owner-form-textarea"
                placeholder="Tell customers about your salon services..."
              />
            </div>

            {/* Image URL */}
            <div className="owner-form-group">
              <label className="owner-form-label">Salon Showcase Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="owner-form-input"
                placeholder="e.g. https://images.unsplash.com/photo-... (optional)"
              />
            </div>

            {/* Street Address */}
            <div className="owner-form-group">
              <label className="owner-form-label">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="owner-form-input"
                placeholder="Street Address"
              />
            </div>

            {/* City, State, Pincode */}
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

            {/* Geolocation */}
            <div className="owner-location-box">
              <div className="owner-location-box-header">
                <span className="owner-form-label">Geolocation Coordinates</span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="owner-btn owner-btn-outline"
                >
                  Capture Current Coordinates 📍
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
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="owner-form-input"
                  placeholder="Longitude"
                />
              </div>
            </div>

            {/* Opening / Closing Time */}
            <div className="owner-form-grid-2">
              <div className="owner-form-group">
                <label className="owner-form-label">Opening Time</label>
                <input
                  type="text"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  className="owner-form-input"
                  placeholder="Opening Time (e.g. 09:00 AM)"
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
                  placeholder="Closing Time (e.g. 09:00 PM)"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saveLoading}
              className="owner-submit-btn"
            >
              {saveLoading ? "Saving Profile Settings..." : "Save Profile Settings"}
            </button>
          </form>
        </div>
      </div>

      {/* KYC Verification Status Card */}
      <div className="owner-card">
        <div className="owner-card-header">
          <div>
            <h3 className="owner-card-title">KYC Verification Status</h3>
            <p className="owner-card-subtitle">Government-mandated identity & business verification</p>
          </div>
          {kyc && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.4rem 0.875rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700,
              ...(kyc.kycStatus === "approved"
                ? { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
                : kyc.kycStatus === "rejected"
                ? { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                : { background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }),
            }}>
              {kyc.kycStatus === "approved" ? <ShieldCheck size={13} /> : kyc.kycStatus === "rejected" ? <ShieldX size={13} /> : <Clock size={13} />}
              {kyc.kycStatus === "approved" ? "Verified" : kyc.kycStatus === "rejected" ? "Rejected" : "Pending Review"}
            </span>
          )}
        </div>
        <div className="owner-card-pad">
          {!kyc ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px" }}>
              <ShieldX size={22} style={{ color: "#f87171", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: "#fca5a5", marginBottom: "0.25rem" }}>KYC Not Submitted</p>
                <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>You must submit KYC documents to get your salon approved.</p>
              </div>
              <Link to="/owner/dashboard?register=true" style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                Submit KYC →
              </Link>
            </div>
          ) : kyc.kycStatus === "approved" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "10px" }}>
              <ShieldCheck size={22} style={{ color: "#22c55e", flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, color: "#4ade80", marginBottom: "0.2rem" }}>KYC Approved ✓</p>
                <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                  Verified on {new Date(kyc.reviewedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
                  Your salon is live and discoverable by customers.
                </p>
              </div>
            </div>
          ) : kyc.kycStatus === "rejected" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px" }}>
                <ShieldX size={22} style={{ color: "#f87171", flexShrink: 0, marginTop: "0.1rem" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "#fca5a5", marginBottom: "0.25rem" }}>KYC Rejected</p>
                  {kyc.rejectionReason && (
                    <p style={{ fontSize: "0.8125rem", color: "#f87171" }}>Reason: {kyc.rejectionReason}</p>
                  )}
                </div>
                <Link to="/owner/dashboard?register=true" style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                  Re-submit →
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "10px" }}>
              <Clock size={22} style={{ color: "#f59e0b", flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, color: "#fbbf24", marginBottom: "0.2rem" }}>KYC Under Review</p>
                <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                  Submitted on {new Date(kyc.submittedAt).toLocaleDateString("en-IN")}. Our team will verify your documents within 1–2 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="owner-danger-zone">
        <h4 className="owner-danger-title">
          <ShieldAlert size={20} /> Danger Zone
        </h4>
        <p className="owner-danger-desc">
          Once you delete your salon profile, there is no going back. All appointments and lists will be permanently lost.
        </p>
        <button
          type="button"
          onClick={() => {
            setTypedSalonName("");
            setShowDeleteModal(true);
          }}
          className="owner-btn owner-btn-red"
        >
          Delete Salon Profile
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="owner-modal-overlay">
          <div className="owner-modal owner-modal-md">
            <div className="owner-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="owner-modal-icon" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <Trash2 size={18} style={{ color: "#f87171" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--danger)" }}>Delete Salon Profile</h3>
                  <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0.125rem 0 0" }}>This action is permanent and cannot be reversed.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="owner-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#d4d4d8", lineHeight: 1.6 }}>
              All bookings, queue lines, and services for <strong>{salon?.name}</strong> will be permanently deleted.
            </p>

            <div className="owner-form-group" style={{ margin: "1.25rem 0" }}>
              <label className="owner-form-label">
                Type salon name <strong>{salon?.name}</strong> to confirm:
              </label>
              <input
                type="text"
                value={typedSalonName}
                onChange={(e) => setTypedSalonName(e.target.value)}
                placeholder={salon?.name}
                className="owner-form-input"
              />
            </div>

            <div className="owner-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTypedSalonName("");
                }}
                className="owner-btn owner-btn-outline"
                style={{ padding: "0.6rem 1.125rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSalon}
                disabled={typedSalonName !== salon?.name || deleteLoading}
                className="owner-btn owner-btn-solid-red"
                style={{ padding: "0.6rem 1.375rem" }}
              >
                {deleteLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonProfile;

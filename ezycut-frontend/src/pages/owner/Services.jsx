import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getServicesBySalon,
  createService,
  updateService,
  deleteService,
} from "../../api/service.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Wrench, Trash2, Edit2, Plus, AlertTriangle, X, Check } from "lucide-react";

const OwnerServices = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [salonLoading, setSalonLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Deletion Confirm Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "General",
  });

  const fetchSalonAndServices = async () => {
    if (!activeSalonId) {
      setSalonLoading(false);
      return;
    }
    setSalonLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const servicesResponse = await getServicesBySalon(activeSalonId);
        setServices(servicesResponse.services || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salon catalog details.");
    } finally {
      setSalonLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "General",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      category: service.category || "General",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salon) return;
    setSaveLoading(true);

    try {
      if (editingService) {
        const res = await updateService(editingService._id, {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          duration: Number(formData.duration),
          category: formData.category,
        });
        setServices(services.map((s) => (s._id === editingService._id ? res.service : s)));
        toast.success("Service catalog listing updated!");
      } else {
        const res = await createService({
          salonId: salon._id,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          duration: Number(formData.duration),
          category: formData.category,
        });
        setServices([res.service, ...services]);
        toast.success("New service appended to catalog! 🎉");
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save service catalog entry.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const res = await updateService(service._id, {
        isActive: !service.isActive,
      });
      setServices(services.map((s) => (s._id === service._id ? res.service : s)));
      toast.success(`Service is now ${res.service.isActive ? "active" : "inactive"}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const triggerDeleteConfirm = (serviceId) => {
    setTargetDeleteId(serviceId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return;
    setDeleteLoading(true);
    try {
      await deleteService(targetDeleteId);
      setServices(services.filter((s) => s._id !== targetDeleteId));
      toast.success("Service removed from catalog successfully.");
      setDeleteConfirmOpen(false);
      setTargetDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service catalog item.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (salonLoading) {
    return <Loader message="Loading service categories..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="owner-welcome-card">
        <div className="owner-welcome-icon">
          <Wrench size={28} color="#d4af37" />
        </div>
        <h3 className="owner-welcome-title">Salon Setup Required</h3>
        <p className="owner-welcome-desc" style={{ marginBottom: "1.75rem" }}>
          You have not registered a salon profile yet. Please complete your salon setup first before managing services.
        </p>
        <Link
          to="/owner/dashboard?register=true"
          className="btn btn-primary"
          style={{ display: "inline-flex", padding: "0.75rem 1.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.8125rem" }}
        >
          Go to Onboarding Form
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Page Header */}
      <div className="owner-page-header">
        <div>
          <h2 className="owner-page-title">{salon?.name} — Catalog</h2>
          <p className="owner-page-desc">Manage services, durations, and pricing for your salon</p>
        </div>
        <button onClick={handleOpenAdd} className="owner-btn owner-btn-solid-gold" style={{ padding: "0.75rem 1.25rem", fontSize: "0.8125rem" }}>
          <Plus size={15} strokeWidth={2.5} />
          Add New Service
        </button>
      </div>

      {/* Services Table Card */}
      <div className="owner-card">
        <div className="owner-card-header">
          <div>
            <p className="owner-card-title">
              <Wrench size={17} color="#d4af37" />
              Service Catalog
            </p>
            <p className="owner-card-subtitle">{services.length} service{services.length !== 1 ? "s" : ""} listed</p>
          </div>
        </div>

        <div className="owner-card-pad" style={{ paddingTop: "0" }}>
          {services.length === 0 ? (
            <div className="owner-empty">
              <div className="owner-empty-icon">
                <Wrench size={24} color="#52525b" />
              </div>
              <p className="owner-empty-title">No Catalog Services</p>
              <p className="owner-empty-desc">
                Click &quot;+ Add New Service&quot; above to start building your shop menu catalog.
              </p>
            </div>
          ) : (
            <div className="owner-table-container">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.9375rem" }}>{s.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#52525b", marginTop: "0.2rem", maxWidth: "22rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.description || "No description provided."}
                        </div>
                      </td>
                      <td>
                        <span className="owner-badge owner-badge-neutral" style={{ textTransform: "uppercase" }}>
                          {s.category}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: 600, color: "#a1a1aa" }}>
                        {s.duration} mins
                      </td>
                      <td style={{ fontWeight: 800, color: "#d4af37", fontSize: "1rem" }}>
                        ₹{s.price}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => handleToggleActive(s)}
                          className={`owner-badge ${s.isActive ? "owner-badge-green" : "owner-badge-red"}`}
                          style={{ cursor: "pointer", border: "none" }}
                          title={s.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          {s.isActive ? (
                            <><Check size={9} strokeWidth={3} /> Active</>
                          ) : (
                            <><X size={9} strokeWidth={3} /> Inactive</>
                          )}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "inline-flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="owner-btn owner-btn-outline"
                            title="Edit Service"
                            style={{ padding: "0.45rem 0.6rem" }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(s._id)}
                            className="owner-btn owner-btn-red"
                            title="Delete Service"
                            style={{ padding: "0.45rem 0.6rem" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal owner-modal-md">
            {/* Modal Header */}
            <div className="owner-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <div className="owner-modal-icon" style={{ background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.2)" }}>
                  <Wrench size={18} color="#d4af37" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#ffffff" }}>
                    {editingService ? "Edit Service" : "Add Service"}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "#71717a", marginTop: "0.125rem" }}>
                    Specify catalog product details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="owner-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Haircut & Wash"
                  className="owner-form-input"
                  required
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of what is included in the service..."
                  rows="3"
                  className="owner-form-textarea"
                />
              </div>

              <div className="owner-form-grid-2">
                <div className="owner-form-group">
                  <label className="owner-form-label">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 350"
                    min="1"
                    className="owner-form-input"
                    required
                  />
                </div>

                <div className="owner-form-group">
                  <label className="owner-form-label">Duration (Mins)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    min="1"
                    className="owner-form-input"
                    required
                  />
                </div>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Haircut, Shaving, Massage"
                  className="owner-form-input"
                />
              </div>

              <div className="owner-modal-footer" style={{ marginTop: "0" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="owner-btn owner-btn-outline"
                  style={{ padding: "0.6rem 1.125rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="owner-btn owner-btn-solid-gold"
                  style={{ padding: "0.6rem 1.375rem" }}
                >
                  {saveLoading ? (
                    <>
                      <div style={{ width: "0.75rem", height: "0.75rem", border: "2px solid rgba(9,9,11,0.3)", borderTopColor: "#09090b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal owner-modal-sm">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <div className="owner-modal-icon" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <AlertTriangle size={18} color="#f87171" />
              </div>
              <div>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#ffffff" }}>Remove Service</h3>
                <p style={{ fontSize: "0.8125rem", color: "#71717a", marginTop: "0.125rem" }}>Delete catalog listing</p>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#a1a1aa", lineHeight: 1.7, marginBottom: "0.5rem" }}>
              Are you sure you want to remove this service from your catalog? This action will prevent new reservations for this service.
            </p>

            <div className="owner-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setTargetDeleteId(null);
                }}
                className="owner-btn owner-btn-outline"
                style={{ padding: "0.6rem 1.125rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
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

export default OwnerServices;

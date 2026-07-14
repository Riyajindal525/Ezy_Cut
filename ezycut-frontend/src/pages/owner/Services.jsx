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

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const inputCls =
    "w-full bg-[#f7faf9] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#0d9488] focus:bg-white focus:ring-2 focus:ring-[#0d9488]/15";
  const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-wider";

  if (salonLoading) {
    return <Loader message="Loading service categories..." />;
  }

  if (salons.filter((s) => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white border border-gray-100 rounded-3xl shadow-sm p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center mx-auto mb-6">
          <Wrench size={26} className="text-[#0d9488]" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-800 mb-3">Salon Setup Required</h3>
        <p className="text-gray-500 text-[0.9375rem] leading-relaxed mb-7">
          You have not registered a salon profile yet. Please complete your salon setup first before managing services.
        </p>
        <Link
          to="/owner/dashboard?register=true"
          className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm uppercase tracking-wide px-7 py-3 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors"
        >
          Go to Onboarding Form
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4`}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 tracking-tight">{salon?.name} — Catalog</h2>
          <p className="text-sm text-gray-500 mt-1">Manage services, durations, and pricing for your salon</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-[0.8125rem] px-5 py-2.5 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add New Service
        </button>
      </div>

      {/* Services Table Card */}
      <div {...fadeUp(100)} className={`${fadeUp(100).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Wrench size={17} className="text-[#0d9488]" /> Service Catalog
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {services.length} service{services.length !== 1 ? "s" : ""} listed
          </p>
        </div>

        <div className="p-6">
          {services.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <Wrench size={24} className="text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">No Catalog Services</p>
              <p className="text-sm text-gray-400 max-w-sm">
                Click "+ Add New Service" above to start building your shop menu catalog.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Service</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Category</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Duration</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Price</th>
                    <th className="text-center text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Status</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr
                      key={s._id}
                      {...fadeUp(140 + i * 40)}
                      className={`${fadeUp(140 + i * 40).className} border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition-colors`}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-gray-800 text-[0.9375rem]">{s.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 max-w-[22rem] truncate">
                          {s.description || "No description provided."}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center text-[0.625rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-mono font-semibold text-gray-600">{s.duration} mins</td>
                      <td className="py-3.5 pr-4 font-extrabold text-[#0d9488] text-base">₹{s.price}</td>
                      <td className="py-3.5 pr-4 text-center">
                        <button
                          onClick={() => handleToggleActive(s)}
                          title={s.isActive ? "Click to deactivate" : "Click to activate"}
                          className={`inline-flex items-center gap-1 text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                            s.isActive
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                          }`}
                        >
                          {s.isActive ? (
                            <>
                              <Check size={10} strokeWidth={3} /> Active
                            </>
                          ) : (
                            <>
                              <X size={10} strokeWidth={3} /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Service"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-[#0d9488] hover:text-[#0d9488] transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(s._id)}
                            title="Delete Service"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.25s_ease]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0">
                  <Wrench size={18} className="text-[#0d9488]" />
                </div>
                <div>
                  <h3 className="text-[1.0625rem] font-bold text-gray-800">
                    {editingService ? "Edit Service" : "Add Service"}
                  </h3>
                  <p className="text-[0.8125rem] text-gray-400 mt-0.5">Specify catalog product details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Haircut & Wash"
                  className={inputCls}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of what is included in the service..."
                  rows="3"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 350"
                    min="1"
                    className={inputCls}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Duration (Mins)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    min="1"
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Haircut, Shaving, Massage"
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-sm px-4.5 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  {saveLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modalIn_0.25s_ease]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-[1.0625rem] font-bold text-gray-800">Remove Service</h3>
                <p className="text-[0.8125rem] text-gray-400 mt-0.5">Delete catalog listing</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed mb-1">
              Are you sure you want to remove this service from your catalog? This action will prevent new reservations for this service.
            </p>

            <div className="flex justify-end gap-3 pt-5 mt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setTargetDeleteId(null);
                }}
                className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-sm px-4.5 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="inline-flex items-center bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors"
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
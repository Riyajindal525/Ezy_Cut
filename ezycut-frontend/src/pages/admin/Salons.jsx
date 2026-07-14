import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getAllSalons,
  updateSalon,
  assignOwner,
  deleteSalon,
} from "../../api/salon.api";
import {
  getSalonKyc,
  approveKyc,
  rejectKyc,
} from "../../api/kyc.api";
import toast from "../../utils/toast";
import {
  Store,
  ShieldAlert,
  X,
  FileText,
  Eye,
  Check,
  Ban,
  Users,
  AlertCircle,
} from "lucide-react";

const AdminSalons = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // KYC review states
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Reassign Modal States
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [targetOwnerId, setTargetOwnerId] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  // Delete Salon States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salonToDelete, setSalonToDelete] = useState(null);
  const [confirmTypedText, setConfirmTypedText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSalonsList = async () => {
    try {
      const data = await getAllSalons();
      setSalons(data.salons);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch salons catalog directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonsList();
  }, []);

  const handleToggleApproval = async (salon) => {
    try {
      const res = await updateSalon(salon._id, { isApproved: !salon.isApproved });
      toast.success(`Salon status set to ${res.salon.isApproved ? "Approved" : "Pending"}`);
      fetchSalonsList();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update salon approval state.");
    }
  };

  const handleReassignOwner = (salonId) => {
    setSelectedSalonId(salonId);
    setTargetOwnerId("");
    setReassignModalOpen(true);
  };

  const submitReassignOwner = async (e) => {
    e.preventDefault();
    if (!selectedSalonId || !targetOwnerId.trim()) return;
    setReassignLoading(true);
    try {
      await assignOwner(selectedSalonId, targetOwnerId.trim());
      toast.success("Owner reassigned successfully! 🎉");
      setReassignModalOpen(false);
      setSelectedSalonId(null);
      setTargetOwnerId("");
      fetchSalonsList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign owner.");
    } finally {
      setReassignLoading(false);
    }
  };

  const handleOpenDeleteModal = (salon) => {
    setSalonToDelete(salon);
    setConfirmTypedText("");
    setDeleteModalOpen(true);
  };

  const submitDeleteSalon = async () => {
    if (confirmTypedText !== `delete ${salonToDelete.name}`) {
      toast.error("Confirmation text does not match.");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteSalon(salonToDelete._id);
      toast.success("Salon deleted successfully! 🗑️");
      setDeleteModalOpen(false);
      setSalonToDelete(null);
      setConfirmTypedText("");
      fetchSalonsList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete salon.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenKycModal = async (salonId) => {
    setKycLoading(true);
    try {
      const res = await getSalonKyc(salonId);
      setSelectedKyc(res.kyc);
      setRejectReason("");
      setKycModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "No KYC documents submitted yet or failed to fetch.");
    } finally {
      setKycLoading(false);
    }
  };

  const handleKycApprove = async (kycId) => {
    setActionLoading(true);
    try {
      await approveKyc(kycId);
      toast.success("KYC approved successfully! Salon is now live. 🎉");
      setKycModalOpen(false);
      setSelectedKyc(null);
      fetchSalonsList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleKycReject = async (kycId) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      await rejectKyc(kycId, rejectReason);
      toast.success("KYC rejected successfully.");
      setKycModalOpen(false);
      setSelectedKyc(null);
      fetchSalonsList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const inputClass =
    "w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all duration-200 focus:border-[#0d9488] focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] font-mono";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 sm:py-24">
        <span className="w-9 h-9 border-[3px] border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-sm px-4 sm:px-5 py-4 rounded-xl">
        <AlertCircle size={18} className="shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden rounded-3xl p-5 sm:p-7 lg:p-8 bg-linear-to-br from-[#0f766e] to-[#042f2e] border border-[#0d9488]/20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="adminSalonsDots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#5eead4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#adminSalonsDots)" />
        </svg>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.22)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Store size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-extrabold text-white tracking-[-0.02em]">
              Salons Controller
            </h1>
            <p className="text-white/70 text-sm mt-1">Audit platform salon profiles, approvals, and ownership mappings</p>
          </div>
        </div>

        <span className="relative inline-flex self-start items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-extrabold uppercase tracking-wide px-3.5 py-2 rounded-full">
          {salons.length} Salons
        </span>
      </div>

      {/* Salons Table */}
      <div {...fadeUp(80)} className={`${fadeUp(80).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-linear-to-r from-[#f7fdfc] to-white">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e]">Registered Salons</h3>
          <p className="text-xs text-gray-400 mt-1">Manage approval status and ownership assignments</p>
        </div>

        <div className="p-4 sm:p-6 sm:pt-4">
          {salons.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-12 sm:py-14">
              <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <Store size={24} className="text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-700 text-sm">No Salons Found</h4>
              <p className="text-xs text-gray-400 max-w-sm">Registered salons will show up here once added to the platform.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {salons.map((s, i) => (
                <div
                  key={s._id}
                  {...fadeUp(120 + i * 30)}
                  className={`${fadeUp(120 + i * 30).className} bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 hover:bg-slate-100 hover:border-teal-300 hover:shadow-[0_6px_18px_rgba(15,118,110,0.1)] transition-all duration-200`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0 text-[#0f766e] font-extrabold">
                        {s.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-black truncate">{s.name}</div>
                        <div className="text-[0.7rem] text-gray-400 font-mono truncate">ID: {s._id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleApproval(s)}
                        className={`inline-flex items-center text-[0.65rem] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                          s.isApproved
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {s.isApproved ? "Approved" : "Pending"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide mb-1">Address</p>
                      <p className="text-sm text-black">{s.address}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.city}, {s.state} – {s.pincode}</p>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide mb-1">Owner</p>
                      {s.owner ? (
                        <>
                          <p className="text-sm font-semibold text-black truncate">{s.owner.name}</p>
                          <p className="text-[0.7rem] text-gray-400 font-mono truncate">ID: {s.owner._id || s.owner}</p>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 italic text-[0.8125rem]">
                          <Users size={12} /> Unassigned
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide mb-1">Contact</p>
                      <p className="text-sm text-black">{s.phone}</p>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wide mb-1">KYC Documents</p>
                      {s.kycSubmitted ? (
                        <button
                          onClick={() => handleOpenKycModal(s._id)}
                          disabled={kycLoading}
                          className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                          <FileText size={12} /> View KYC
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Not Submitted</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 pt-3 border-t border-gray-50 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => handleReassignOwner(s._id)}
                      className="inline-flex items-center justify-center gap-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors w-full sm:w-auto"
                    >
                      Reassign Owner
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(s)}
                      className="inline-flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors w-full sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reassign Owner Modal — rendered via portal so parent transforms/animations can't break `fixed` positioning */}
      {reassignModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.25s_ease]">
              <div className="pb-4 mb-4 border-b border-gray-100">
                <h3 className="font-['Outfit'] text-lg font-extrabold text-gray-800">Reassign Salon Owner</h3>
                <p className="text-xs text-gray-400 mt-0.5">Change the owner assigned to this salon profile</p>
              </div>

              <form onSubmit={submitReassignOwner} className="flex flex-col gap-5">
                <div>
                  <label className="text-[0.8125rem] font-semibold text-gray-600 mb-2 block">Owner User ID</label>
                  <input
                    type="text"
                    value={targetOwnerId}
                    onChange={(e) => setTargetOwnerId(e.target.value)}
                    placeholder="e.g. 64b2fd9c8d19bc0012f4581a"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setReassignModalOpen(false);
                      setSelectedSalonId(null);
                      setTargetOwnerId("");
                    }}
                    className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reassignLoading}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all duration-200"
                  >
                    {reassignLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Assignment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen &&
        salonToDelete &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.25s_ease]">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <ShieldAlert size={18} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] text-lg font-extrabold text-rose-600">Delete Salon</h3>
                  <p className="text-xs text-gray-400 mt-0.5">This action is permanent and cannot be reversed.</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete <strong className="text-gray-800">{salonToDelete.name}</strong>? All associated data will be permanently removed.
              </p>

              <div className="my-5">
                <label className="text-[0.8125rem] font-semibold text-gray-600 mb-2 block">
                  Type <strong className="text-rose-500">delete {salonToDelete.name}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmTypedText}
                  onChange={(e) => setConfirmTypedText(e.target.value)}
                  placeholder={`delete ${salonToDelete.name}`}
                  className={`${inputClass} ${confirmTypedText === `delete ${salonToDelete.name}` ? "border-rose-300" : ""}`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSalonToDelete(null);
                    setConfirmTypedText("");
                  }}
                  className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitDeleteSalon}
                  disabled={confirmTypedText !== `delete ${salonToDelete.name}` || deleteLoading}
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
          </div>,
          document.body
        )}

      {/* KYC Document Review Modal */}
      {kycModalOpen &&
        selectedKyc &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-99999 flex items-center justify-center p-2 sm:p-4 animate-[fadeIn_0.2s_ease]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[min(92vw,44rem)] max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-[modalIn_0.25s_ease]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-['Outfit'] text-lg font-extrabold text-gray-800">KYC Document Review</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Verify identity and business proofs for {selectedKyc.salon?.name || "this salon"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setKycModalOpen(false);
                    setSelectedKyc(null);
                  }}
                  className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {/* Owner Info Block */}
                <div className="bg-[#f7fdfc] border border-gray-100 rounded-xl p-4">
                  <p className="text-[0.7rem] text-gray-500 uppercase tracking-wide font-bold mb-3">Owner Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Name:</span> <strong className="text-black">{selectedKyc.owner?.name}</strong></div>
                    <div><span className="text-gray-500">Email:</span> <span className="text-black">{selectedKyc.owner?.email}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="text-black">{selectedKyc.owner?.phone}</span></div>
                    <div><span className="text-gray-500">City:</span> <span className="text-black">{selectedKyc.salon?.city}</span></div>
                  </div>
                </div>

                {/* ID Proof Document */}
                <div className="bg-[#f7fdfc] border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[0.7rem] text-gray-500 uppercase tracking-wide mb-1">Identity Proof</p>
                    <p className="font-semibold text-black text-sm">
                      {selectedKyc.ownerIdProofType ? selectedKyc.ownerIdProofType.toUpperCase() : "Document"}
                    </p>
                  </div>
                  <a
                    href={selectedKyc.ownerIdProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <Eye size={13} /> View File
                  </a>
                </div>

                {/* Business Proof Document */}
                {selectedKyc.businessProof && (
                  <div className="bg-[#f7fdfc] border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[0.7rem] text-gray-500 uppercase tracking-wide mb-1">Business Proof</p>
                      <p className="font-semibold text-black text-sm">
                        {selectedKyc.businessProofType ? selectedKyc.businessProofType.toUpperCase() : "Document"}
                      </p>
                    </div>
                    <a
                      href={selectedKyc.businessProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
                    >
                      <Eye size={13} /> View File
                    </a>
                  </div>
                )}

                {/* Salon Photos Section */}
                {selectedKyc.salonImages && selectedKyc.salonImages.length > 0 && (
                  <div className="bg-[#f7fdfc] border border-gray-100 rounded-xl p-4">
                    <p className="text-[0.7rem] text-gray-500 uppercase tracking-wide font-bold mb-3">Salon Photos</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedKyc.salonImages.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                          <img
                            src={img}
                            alt={`Salon Photo ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* KYC Decisions Block */}
                {selectedKyc.kycStatus === "pending" ? (
                  <div className="flex flex-col gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => handleKycApprove(selectedKyc._id)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors"
                    >
                      <Check size={15} />
                      {actionLoading ? "Processing..." : "Approve KYC"}
                    </button>

                    <div className="border-t border-gray-100 pt-4">
                      <label className="text-[0.8125rem] text-rose-500 font-semibold block mb-2">
                        Rejection Reason (required to reject):
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows="2"
                        placeholder="Specify why documents are rejected..."
                        className={`${inputClass} font-sans mb-3 resize-y`}
                      />
                      <button
                        type="button"
                        onClick={() => handleKycReject(selectedKyc._id)}
                        disabled={actionLoading || !rejectReason.trim()}
                        className="flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-colors"
                      >
                        <Ban size={15} />
                        Reject KYC
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center py-3 rounded-xl font-bold text-sm border ${
                      selectedKyc.kycStatus === "approved"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-rose-50 border-rose-100 text-rose-600"
                    }`}
                  >
                    KYC STATUS: {selectedKyc.kycStatus ? selectedKyc.kycStatus.toUpperCase() : ""}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AdminSalons;
import { useEffect, useState } from "react";
import { getAllKyc, approveKyc, rejectKyc } from "../../api/kyc.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { ShieldCheck, ShieldX, Clock, CheckCircle2, XCircle, Eye, X } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending Review", classes: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock size={14} /> },
  approved: { label: "Approved", classes: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle2 size={14} /> },
  rejected: { label: "Rejected", classes: "bg-rose-50 text-rose-600 border-rose-100", icon: <XCircle size={14} /> },
};

const idProofLabels = {
  aadhaar: "Aadhaar Card", pan: "PAN Card", voter_id: "Voter ID",
  passport: "Passport", driving_license: "Driving License",
};

const bizProofLabels = {
  gst: "GST Certificate", trade_license: "Trade License", shop_act: "Shop & Estb. Act",
  udyam: "Udyam Registration", other: "Other", none: "—",
};

const AdminKYC = () => {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const data = await getAllKyc(statusFilter);
      setKycList(data.kycList || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load KYC submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKyc(); }, [statusFilter]);

  const handleApprove = async (kycId) => {
    setActionLoading(true);
    try {
      await approveKyc(kycId);
      toast.success("KYC approved — salon is now live! ✅");
      setSelectedKyc(null);
      fetchKyc();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (kycId) => {
    if (!rejectReason.trim()) { toast.error("Please provide a rejection reason."); return; }
    setActionLoading(true);
    try {
      await rejectKyc(kycId, rejectReason);
      toast.success("KYC rejected. Owner notified.");
      setSelectedKyc(null);
      setRejectReason("");
      fetchKyc();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject KYC.");
    } finally {
      setActionLoading(false);
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[fadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const filters = ["pending", "approved", "rejected", ""];

  if (loading) return <Loader message="Loading KYC submissions..." />;

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      {/* Page Header */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden rounded-2xl p-6 md:p-7 bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-4 flex-wrap`}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm shadow-teal-200 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              KYC Management
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Review, approve or reject salon owner KYC submissions
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2 flex-wrap">
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors border ${
                statusFilter === s
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-500 border-gray-200 hover:bg-slate-50"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KYC List */}
      <div {...fadeUp(80)} className={`${fadeUp(80).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/60">
          <h3 className="text-base font-semibold text-slate-800">KYC Submissions</h3>
          <p className="text-xs text-slate-400 mt-1">Identity and business proof review queue</p>
        </div>

        <div className="p-6 pt-4">
          {kycList.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-14">
              <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
                <ShieldCheck size={24} className="text-teal-400" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm">No Submissions Found</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                No {statusFilter || ""} KYC submissions found.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {kycList.map((kyc, i) => {
                const cfg = statusConfig[kyc.kycStatus] || statusConfig.pending;
                return (
                  <div
                    key={kyc._id}
                    {...fadeUp(120 + i * 30)}
                    className={`${fadeUp(120 + i * 30).className} bg-slate-50 border border-slate-200 rounded-xl p-5 hover:bg-slate-100 hover:border-teal-300 hover:shadow-[0_6px_18px_rgba(15,118,110,0.1)] transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                          <ShieldCheck size={18} className="text-teal-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {kyc.salon?.name || "Unknown Salon"}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {kyc.owner?.name} · {kyc.owner?.email}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Submitted: {new Date(kyc.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${cfg.classes}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <button
                          onClick={() => { setSelectedKyc(kyc); setRejectReason(""); }}
                          className="inline-flex items-center gap-1.5 border border-gray-200 text-slate-600 hover:bg-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
                        >
                          <Eye size={13} /> View Details
                        </button>
                      </div>
                    </div>

                    {kyc.kycStatus === "rejected" && kyc.rejectionReason && (
                      <div className="mt-3.5 px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600">
                        <strong>Rejection Reason:</strong> {kyc.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* KYC Detail Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="scrollbar-hide bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 animate-[modalIn_0.25s_ease]">
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">KYC Document Review</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedKyc.salon?.name} · {selectedKyc.owner?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedKyc(null)}
                className="p-2 border border-gray-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Owner Info */}
              <div className="bg-slate-50/60 border border-gray-100 rounded-xl p-4">
                <p className="text-[0.7rem] text-slate-500 uppercase tracking-wide font-bold mb-3">Owner Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Name:</span> <strong className="text-slate-800">{selectedKyc.owner?.name || "—"}</strong></div>
                  <div><span className="text-slate-500">Email:</span> <span className="text-slate-800">{selectedKyc.owner?.email || "—"}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="text-slate-800">{selectedKyc.owner?.phone || "—"}</span></div>
                  <div><span className="text-slate-500">Salon City:</span> <span className="text-slate-800">{selectedKyc.salon?.city || "—"}</span></div>
                </div>
              </div>

              {/* ID Proof */}
              <div className="bg-slate-50/60 border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[0.7rem] text-slate-500 uppercase tracking-wide mb-1">
                    Identity Proof <span className="text-rose-500">*</span>
                  </p>
                  <p className="font-semibold text-slate-800 text-sm">
                    {idProofLabels[selectedKyc.ownerIdProofType] || selectedKyc.ownerIdProofType}
                  </p>
                </div>
                <a
                  href={selectedKyc.ownerIdProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
                >
                  <Eye size={13} /> View File
                </a>
              </div>

              {/* Business Proof */}
              {selectedKyc.businessProof && (
                <div className="bg-slate-50/60 border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[0.7rem] text-slate-500 uppercase tracking-wide mb-1">Business Proof</p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {bizProofLabels[selectedKyc.businessProofType] || "Document"}
                    </p>
                  </div>
                  <a
                    href={selectedKyc.businessProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
                  >
                    <Eye size={13} /> View File
                  </a>
                </div>
              )}

              {/* Salon Images */}
              {selectedKyc.salonImages?.length > 0 && (
                <div className="bg-slate-50/60 border border-gray-100 rounded-xl p-4">
                  <p className="text-[0.7rem] text-slate-500 uppercase tracking-wide font-bold mb-3">
                    Salon Photos ({selectedKyc.salonImages.length})
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedKyc.salonImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img
                          src={img}
                          alt={`Salon ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Pending */}
              {selectedKyc.kycStatus === "pending" ? (
                <div className="flex flex-col gap-3 mt-1">
                  <button
                    onClick={() => handleApprove(selectedKyc._id)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors"
                  >
                    <ShieldCheck size={16} /> {actionLoading ? "Processing..." : "Approve KYC"}
                  </button>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <label className="text-[0.8125rem] font-semibold text-rose-500 block mb-2">
                      Rejection Reason (required to reject):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows="2"
                      placeholder="e.g. ID proof is blurry or incomplete..."
                      className="w-full bg-white border border-rose-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] resize-y"
                    />
                    <button
                      onClick={() => handleReject(selectedKyc._id)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="mt-3 flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
                    >
                      <ShieldX size={16} /> {actionLoading ? "Processing..." : "Reject KYC"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-3 rounded-xl font-bold text-sm border ${statusConfig[selectedKyc.kycStatus]?.classes}`}>
                  This KYC has already been {selectedKyc.kycStatus}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYC;
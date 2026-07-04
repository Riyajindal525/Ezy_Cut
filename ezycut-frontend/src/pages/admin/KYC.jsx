import { useEffect, useState } from "react";
import { getAllKyc, approveKyc, rejectKyc } from "../../api/kyc.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { ShieldCheck, ShieldX, Clock, CheckCircle2, XCircle, Eye, X, FileText, User } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <Clock size={14} /> },
  approved: { label: "Approved", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: <CheckCircle2 size={14} /> },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: <XCircle size={14} /> },
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

  if (loading) return <Loader message="Loading KYC submissions..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div className="owner-page-header">
        <div>
          <h3 className="owner-page-title">KYC Management</h3>
          <p className="owner-page-desc">Review, approve or reject salon owner KYC submissions</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["pending", "approved", "rejected", ""].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                background: statusFilter === s ? "var(--brand-accent)" : "rgba(255,255,255,0.04)",
                color: statusFilter === s ? "#09090b" : "#a1a1aa",
                border: `1px solid ${statusFilter === s ? "var(--brand-accent)" : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.2s",
              }}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KYC Cards */}
      {kycList.length === 0 ? (
        <div className="owner-card" style={{ textAlign: "center", padding: "3rem" }}>
          <ShieldCheck size={40} style={{ color: "var(--brand-accent)", margin: "0 auto 1rem" }} />
          <p style={{ color: "#71717a", fontSize: "0.9375rem" }}>
            No {statusFilter || ""} KYC submissions found.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {kycList.map((kyc) => {
            const cfg = statusConfig[kyc.kycStatus] || statusConfig.pending;
            return (
              <div key={kyc._id} className="owner-card" style={{ padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShieldCheck size={18} style={{ color: "var(--brand-accent)" }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "white", fontSize: "0.9375rem", marginBottom: "0.2rem" }}>
                        {kyc.salon?.name || "Unknown Salon"}
                      </p>
                      <p style={{ fontSize: "0.8125rem", color: "#a1a1aa" }}>
                        {kyc.owner?.name} · {kyc.owner?.email}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.15rem" }}>
                        Submitted: {new Date(kyc.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "99px", background: cfg.bg, color: cfg.color, fontSize: "0.75rem", fontWeight: 600, border: `1px solid ${cfg.color}30` }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <button
                      onClick={() => { setSelectedKyc(kyc); setRejectReason(""); }}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", fontSize: "0.8125rem", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>

                {kyc.kycStatus === "rejected" && kyc.rejectionReason && (
                  <div style={{ marginTop: "0.875rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", fontSize: "0.8125rem", color: "#fca5a5" }}>
                    <strong>Rejection Reason:</strong> {kyc.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* KYC Detail Modal */}
      {selectedKyc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", padding: "1.75rem" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>KYC Document Review</h3>
                <p style={{ fontSize: "0.8125rem", color: "#71717a" }}>{selectedKyc.salon?.name} · {selectedKyc.owner?.name}</p>
              </div>
              <button onClick={() => setSelectedKyc(null)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Owner Info */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem", fontWeight: 600 }}>Owner Information</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {[
                  { label: "Name", val: selectedKyc.owner?.name },
                  { label: "Email", val: selectedKyc.owner?.email },
                  { label: "Phone", val: selectedKyc.owner?.phone },
                  { label: "Salon City", val: selectedKyc.salon?.city },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <span style={{ fontSize: "0.75rem", color: "#52525b" }}>{label}</span>
                    <p style={{ fontSize: "0.875rem", color: "white", fontWeight: 500 }}>{val || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {/* ID Proof */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Identity Proof <span style={{ color: "#f87171" }}>*</span></p>
                    <p style={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>{idProofLabels[selectedKyc.ownerIdProofType] || selectedKyc.ownerIdProofType}</p>
                  </div>
                  <a href={selectedKyc.ownerIdProof} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.875rem", borderRadius: "8px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                    <Eye size={14} /> View File
                  </a>
                </div>
              </div>

              {/* Business Proof */}
              {selectedKyc.businessProof && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Business Proof</p>
                      <p style={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>{bizProofLabels[selectedKyc.businessProofType] || "Document"}</p>
                    </div>
                    <a href={selectedKyc.businessProof} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.875rem", borderRadius: "8px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "var(--brand-accent)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                      <Eye size={14} /> View File
                    </a>
                  </div>
                </div>
              )}

              {/* Salon Images */}
              {selectedKyc.salonImages?.length > 0 && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Salon Photos ({selectedKyc.salonImages.length})</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {selectedKyc.salonImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt={`Salon ${i + 1}`} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons for Pending */}
            {selectedKyc.kycStatus === "pending" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleApprove(selectedKyc._id)}
                    disabled={actionLoading}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", borderRadius: "10px", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                  >
                    <ShieldCheck size={16} /> {actionLoading ? "Processing..." : "Approve KYC"}
                  </button>
                </div>
                <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "1rem" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fca5a5", display: "block", marginBottom: "0.5rem" }}>
                    Rejection Reason (required to reject):
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="2"
                    placeholder="e.g. ID proof is blurry or incomplete..."
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "0.625rem 0.875rem", color: "white", fontSize: "0.875rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  />
                  <button
                    onClick={() => handleReject(selectedKyc._id)}
                    disabled={actionLoading || !rejectReason.trim()}
                    style={{ marginTop: "0.75rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
                  >
                    <ShieldX size={16} /> {actionLoading ? "Processing..." : "Reject KYC"}
                  </button>
                </div>
              </div>
            )}

            {selectedKyc.kycStatus !== "pending" && (
              <div style={{ textAlign: "center", padding: "0.75rem", background: statusConfig[selectedKyc.kycStatus]?.bg, borderRadius: "10px", border: `1px solid ${statusConfig[selectedKyc.kycStatus]?.color}30` }}>
                <p style={{ color: statusConfig[selectedKyc.kycStatus]?.color, fontWeight: 600, fontSize: "0.875rem" }}>
                  This KYC has already been {selectedKyc.kycStatus}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYC;

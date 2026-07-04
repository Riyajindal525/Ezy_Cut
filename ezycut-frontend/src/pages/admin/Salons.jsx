import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div className="admin-loader">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-wrapper">
        <div className="admin-danger-notice">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper">

      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Salons Controller</div>
          <div className="admin-page-desc">
            Audit platform salon profiles, approvals, and ownership mappings
          </div>
        </div>
        <span className="admin-page-badge">{salons.length} Salons</span>
      </div>

      {/* ── Salons Table ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">Registered Salons</div>
            <div className="admin-card-subtitle">Manage approval status and ownership assignments</div>
          </div>
        </div>

        <div className="admin-card-pad" style={{ paddingTop: "1rem" }}>
          {salons.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">🏪</div>
              <div className="admin-empty-title">No Salons Found</div>
              <div className="admin-empty-desc">Registered salons will show up here once added to the platform.</div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Salon Info</th>
                    <th>Address</th>
                    <th>Owner Details</th>
                    <th>Contact</th>
                    <th style={{ textAlign: "center" }}>KYC Documents</th>
                    <th style={{ textAlign: "center" }}>Approval Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salons.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="admin-cell-primary">{s.name}</div>
                        <div className="admin-cell-secondary admin-cell-mono" style={{ fontSize: "0.7rem" }}>
                          ID: {s._id}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: "#d4d4d8", fontSize: "0.875rem" }}>{s.address}</div>
                        <div className="admin-cell-secondary">
                          {s.city}, {s.state} – {s.pincode}
                        </div>
                      </td>
                      <td>
                        {s.owner ? (
                          <>
                            <div className="admin-cell-primary">{s.owner.name}</div>
                            <div className="admin-cell-secondary admin-cell-mono" style={{ fontSize: "0.7rem" }}>
                              ID: {s.owner._id || s.owner}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "#f87171", fontStyle: "italic", fontSize: "0.8125rem" }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>{s.phone}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {s.kycSubmitted ? (
                          <button
                            onClick={() => handleOpenKycModal(s._id)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: "rgba(251,191,36,0.1)",
                              color: "var(--brand-accent)",
                              border: "1px solid rgba(251,191,36,0.2)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              transition: "all 0.2s"
                            }}
                          >
                            <span>📄 View KYC</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#71717a", fontWeight: 500 }}>
                            Not Submitted
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => handleToggleApproval(s)}
                          className={`admin-approval-btn ${
                            s.isApproved ? "admin-approval-approved" : "admin-approval-pending"
                          }`}
                        >
                          {s.isApproved ? "Approved" : "Pending"}
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleReassignOwner(s._id)}
                            className="admin-btn admin-btn-outline"
                          >
                            Reassign Owner
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(s)}
                            className="admin-btn admin-btn-solid-red"
                          >
                            Delete
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

      {/* ── Reassign Owner Modal ── */}
      {reassignModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div>
              <div className="admin-modal-title">Reassign Salon Owner</div>
              <div className="admin-modal-desc">
                Change the owner assigned to this salon profile
              </div>
            </div>

            <form onSubmit={submitReassignOwner} className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Owner User ID</label>
                <input
                  type="text"
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
                  placeholder="e.g. 64b2fd9c8d19bc0012f4581a"
                  required
                  className="admin-form-input admin-cell-mono"
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setReassignModalOpen(false);
                    setSelectedSalonId(null);
                    setTargetOwnerId("");
                  }}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassignLoading}
                  className="admin-btn admin-btn-amber"
                >
                  {reassignLoading ? (
                    <>
                      <div style={{ width: "0.875rem", height: "0.875rem", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    "Save Assignment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalOpen && salonToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-danger">
            <div>
              <div className="admin-modal-danger-title">⚠️ Delete Salon</div>
              <div className="admin-modal-desc">
                This action is permanent and cannot be reversed.
              </div>
            </div>

            <div className="admin-modal-body">
              <p style={{ fontSize: "0.9375rem", color: "#d4d4d8", lineHeight: 1.6 }}>
                Are you sure you want to delete <strong style={{ color: "#ffffff" }}>{salonToDelete.name}</strong>?
                All associated data will be permanently removed.
              </p>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Type <strong style={{ color: "#f87171" }}>delete {salonToDelete.name}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmTypedText}
                  onChange={(e) => setConfirmTypedText(e.target.value)}
                  placeholder={`delete ${salonToDelete.name}`}
                  className="admin-form-input admin-cell-mono"
                  style={{ borderColor: confirmTypedText === `delete ${salonToDelete.name}` ? "rgba(239,68,68,0.5)" : undefined }}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSalonToDelete(null);
                    setConfirmTypedText("");
                  }}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitDeleteSalon}
                  disabled={confirmTypedText !== `delete ${salonToDelete.name}` || deleteLoading}
                  className="admin-btn admin-btn-solid-red"
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KYC Document Review Modal ── */}
      {kycModalOpen && selectedKyc && (
        <div className="admin-modal-overlay" style={{ zIndex: 99999 }}>
          <div className="admin-modal" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <div className="admin-modal-title">KYC Document Review</div>
                <div className="admin-modal-desc">
                  Verify identity and business proofs for {selectedKyc.salon?.name || "this salon"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setKycModalOpen(false);
                  setSelectedKyc(null);
                }}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", fontSize: "1.25rem", fontWeight: "bold" }}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", color: "#d4d4d8" }}>
              
              {/* Owner Info Block */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "1rem" }}>
                <p style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem", fontWeight: 600 }}>
                  Owner Information
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.875rem" }}>
                  <div>
                    <span style={{ color: "#71717a" }}>Name:</span> <strong style={{ color: "#ffffff" }}>{selectedKyc.owner?.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#71717a" }}>Email:</span> <span style={{ color: "#ffffff" }}>{selectedKyc.owner?.email}</span>
                  </div>
                  <div>
                    <span style={{ color: "#71717a" }}>Phone:</span> <span style={{ color: "#ffffff" }}>{selectedKyc.owner?.phone}</span>
                  </div>
                  <div>
                    <span style={{ color: "#71717a" }}>City:</span> <span style={{ color: "#ffffff" }}>{selectedKyc.salon?.city}</span>
                  </div>
                </div>
              </div>

              {/* ID Proof Document */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.25rem", textTransform: "uppercase" }}>Identity Proof</p>
                  <p style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.875rem" }}>
                    {selectedKyc.ownerIdProofType ? selectedKyc.ownerIdProofType.toUpperCase() : "Document"}
                  </p>
                </div>
                <a
                  href={selectedKyc.ownerIdProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn-outline"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  👁️ View File
                </a>
              </div>

              {/* Business Proof Document */}
              {selectedKyc.businessProof && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.25rem", textTransform: "uppercase" }}>Business Proof</p>
                    <p style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.875rem" }}>
                      {selectedKyc.businessProofType ? selectedKyc.businessProofType.toUpperCase() : "Document"}
                    </p>
                  </div>
                  <a
                    href={selectedKyc.businessProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-outline"
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    👁️ View File
                  </a>
                </div>
              )}

              {/* Salon Photos Section */}
              {selectedKyc.salonImages && selectedKyc.salonImages.length > 0 && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.75rem", textTransform: "uppercase" }}>Salon Photos</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {selectedKyc.salonImages.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                        <img
                          src={img}
                          alt={`Salon Photo ${idx + 1}`}
                          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* KYC Decisions Block */}
              {selectedKyc.kycStatus === "pending" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => handleKycApprove(selectedKyc._id)}
                    disabled={actionLoading}
                    className="admin-btn admin-btn-amber"
                    style={{ width: "100%", padding: "0.75rem" }}
                  >
                    {actionLoading ? "Processing..." : "✓ Approve KYC"}
                  </button>
                  
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                    <label style={{ fontSize: "0.8125rem", color: "#f87171", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                      Rejection Reason (required to reject):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows="2"
                      placeholder="Specify why documents are rejected..."
                      className="admin-form-input"
                      style={{ width: "100%", boxSizing: "border-box", marginBottom: "0.75rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleKycReject(selectedKyc._id)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="admin-btn admin-btn-solid-red"
                      style={{ width: "100%", padding: "0.75rem" }}
                    >
                      ✗ Reject KYC
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "0.75rem",
                    background: selectedKyc.kycStatus === "approved" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${selectedKyc.kycStatus === "approved" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                    borderRadius: "8px",
                    color: selectedKyc.kycStatus === "approved" ? "#22c55e" : "#ef4444",
                    fontWeight: 700,
                    fontSize: "0.875rem"
                  }}
                >
                  KYC STATUS: {selectedKyc.kycStatus ? selectedKyc.kycStatus.toUpperCase() : ""}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSalons;

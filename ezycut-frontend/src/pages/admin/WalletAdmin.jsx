import { useEffect, useState } from "react";
import {
  getAdminCustomerWallet,
  adjustPoints,
  freezeWallet,
  getReconciliationInfo,
  getRedemptions,
  getRules,
  createRule,
  updateRule,
  getAdminRewardTiers,
  createAdminRewardTier,
  updateAdminRewardTier,
} from "../../api/wallet.api";
import { getAdminRecentUsers } from "../../api/dashboard.api";
import {
  Search,
  Gift,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  Settings,
  History,
  AlertCircle,
  CheckCircle,
  Database,
  ArrowRight,
  ShieldAlert,
  User,
  Ticket,
  Sliders,
} from "lucide-react";
import toast from "../../utils/toast";

const WalletAdmin = () => {
  // Tab states
  const [subTab, setSubTab] = useState("customers"); // customers, rules, reward-tiers, redemptions, reconciliation

  // Data states
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [customerWallet, setCustomerWallet] = useState(null);
  const [customerLedger, setCustomerLedger] = useState([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);

  const [rules, setRules] = useState([]);
  const [rewardTiers, setRewardTiers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [redPage, setRedPage] = useState(1);
  const [redTotalPages, setRedTotalPages] = useState(1);
  const [recon, setRecon] = useState(null);

  // Loadings
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [loadingRecon, setLoadingRecon] = useState(false);

  // Forms
  const [adjustmentForm, setAdjustmentForm] = useState({
    points: "",
    direction: "CREDIT",
    reason: "",
    reference: "",
  });
  const [ruleForm, setRuleForm] = useState({
    name: "",
    isActive: true,
    minAmount: 0,
    pointsPercentage: 10,
    multiplier: 1.0,
  });

  const [adjusting, setAdjusting] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [creatingRule, setCreatingRule] = useState(false);

  const [tierForm, setTierForm] = useState({
    pointsRequired: 100,
    discountAmount: 50,
    minimumBookingAmount: 0,
    validityDays: 30,
    isActive: true,
  });
  const [creatingTier, setCreatingTier] = useState(false);

  // Initial fetches
  useEffect(() => {
    fetchUsers();
    fetchRules();
    fetchRewardTiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subTab === "rules") fetchRules();
    if (subTab === "reward-tiers") fetchRewardTiers();
    if (subTab === "redemptions") fetchRedemptions();
    if (subTab === "reconciliation") fetchReconciliation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab, redPage]);

  const fetchRewardTiers = async () => {
    setLoadingTiers(true);
    try {
      const data = await getAdminRewardTiers();
      setRewardTiers(data.tiers || []);
    } catch {
      toast.error("Failed to load reward discount tiers.");
    } finally {
      setLoadingTiers(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAdminRecentUsers();
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load user directory.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRules = async () => {
    setLoadingRules(true);
    try {
      const data = await getRules();
      if (data.success) {
        setRules(data.rules || []);
      }
    } catch {
      toast.error("Failed to fetch reward rules.");
    } finally {
      setLoadingRules(false);
    }
  };

  const fetchRedemptions = async () => {
    setLoadingRedemptions(true);
    try {
      const data = await getRedemptions(redPage);
      if (data.success) {
        setRedemptions(data.redemptions || []);
        setRedTotalPages(data.pagination?.pages || 1);
      }
    } catch {
      toast.error("Failed to load redemption registry.");
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const fetchReconciliation = async () => {
    setLoadingRecon(true);
    try {
      const data = await getReconciliationInfo();
      if (data.success) {
        setRecon(data.reconciliation);
      }
    } catch {
      toast.error("Failed to fetch reconciliation metrics.");
    } finally {
      setLoadingRecon(false);
    }
  };

  // Select customer & fetch details
  const handleSelectCustomer = async (userId) => {
    setSelectedUserId(userId);
    if (!userId) {
      setCustomerWallet(null);
      setCustomerLedger([]);
      return;
    }
    await fetchCustomerWalletDetails(userId, 1);
  };

  const fetchCustomerWalletDetails = async (userId, pageNum = 1) => {
    setLoadingWallet(true);
    try {
      const data = await getAdminCustomerWallet(userId, pageNum);
      if (data.success) {
        setCustomerWallet(data.wallet);
        setCustomerLedger(data.ledger || []);
        setLedgerPage(pageNum);
        setLedgerTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user wallet accounts.");
    } finally {
      setLoadingWallet(false);
    }
  };

  // Adjust balance
  const handleAdjustPointsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    const { points, direction, reason, reference } = adjustmentForm;
    if (!points || points <= 0 || !reason || !reference) {
      toast.error("Please fill in all adjustment fields.");
      return;
    }

    setAdjusting(true);
    try {
      const data = {
        customerId: selectedUserId,
        points: parseInt(points),
        direction,
        reason,
        reference,
      };
      const res = await adjustPoints(data);
      if (res.success) {
        toast.success(res.message);
        setAdjustmentForm({ points: "", direction: "CREDIT", reason: "", reference: "" });
        await fetchCustomerWalletDetails(selectedUserId, 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Manual adjustment failed.");
    } finally {
      setAdjusting(false);
    }
  };

  // Freeze / Unfreeze
  const handleFreezeToggle = async () => {
    if (!selectedUserId || !customerWallet) return;
    const targetStatus = customerWallet.status === "frozen" ? "active" : "frozen";
    const reason = window.prompt(`Enter reason to ${targetStatus === "frozen" ? "freeze" : "unfreeze"} this customer points account:`);
    if (reason === null) return; // cancel
    if (!reason.trim()) {
      toast.error("Reason is mandatory to freeze/unfreeze wallets.");
      return;
    }

    setFreezing(true);
    try {
      const res = await freezeWallet({
        customerId: selectedUserId,
        status: targetStatus,
        reason,
      });
      if (res.success) {
        toast.success(res.message);
        await fetchCustomerWalletDetails(selectedUserId, ledgerPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update account status.");
    } finally {
      setFreezing(false);
    }
  };

  // Create rule
  const handleCreateRuleSubmit = async (e) => {
    e.preventDefault();
    const { name, isActive, minAmount, pointsPercentage, multiplier } = ruleForm;
    if (!name || pointsPercentage === undefined) {
      toast.error("Name and Points Percentage are required.");
      return;
    }

    setCreatingRule(true);
    try {
      const res = await createRule({
        name,
        isActive,
        minAmount: parseFloat(minAmount),
        pointsPercentage: parseInt(pointsPercentage),
        multiplier: parseFloat(multiplier),
      });
      if (res.success) {
        toast.success("Reward rule created successfully!");
        setRuleForm({ name: "", isActive: true, minAmount: 0, pointsPercentage: 10, multiplier: 1.0 });
        await fetchRules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create rule.");
    } finally {
      setCreatingRule(false);
    }
  };

  // Toggle rule status
  const handleRuleToggleStatus = async (rule) => {
    try {
      const res = await updateRule(rule._id, { isActive: !rule.isActive });
      if (res.success) {
        toast.success("Rule status updated.");
        await fetchRules();
      }
    } catch {
      toast.error("Failed to update rule status.");
    }
  };

  // Create tier
  const handleCreateTierSubmit = async (e) => {
    e.preventDefault();
    const { pointsRequired, discountAmount, minimumBookingAmount, validityDays, isActive } = tierForm;
    if (!pointsRequired || !discountAmount) {
      toast.error("Points Required and Discount Amount are required.");
      return;
    }

    setCreatingTier(true);
    try {
      const res = await createAdminRewardTier({
        pointsRequired: parseInt(pointsRequired),
        discountAmount: parseInt(discountAmount),
        minimumBookingAmount: parseInt(minimumBookingAmount || 0),
        validityDays: parseInt(validityDays || 30),
        isActive,
      });
      if (res.success) {
        toast.success("Reward tier created successfully!");
        setTierForm({ pointsRequired: 100, discountAmount: 50, minimumBookingAmount: 0, validityDays: 30, isActive: true });
        await fetchRewardTiers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create reward tier.");
    } finally {
      setCreatingTier(false);
    }
  };

  // Toggle tier status
  const handleTierToggleStatus = async (tier) => {
    try {
      const res = await updateAdminRewardTier(tier._id, { isActive: !tier.isActive });
      if (res.success) {
        toast.success("Tier status updated.");
        await fetchRewardTiers();
      }
    } catch {
      toast.error("Failed to update tier status.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        {[
          { key: "customers", label: "Manage Customers" },
          { key: "reward-tiers", label: "Reward Discount Tiers" },
          { key: "rules", label: "Earning Rules" },
          { key: "redemptions", label: "Vouchers Registry" },
          { key: "reconciliation", label: "Reconciliation & Health" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`pb-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              subTab === tab.key
                ? "border-[#0d9488] text-[#0d9488]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ TAB: MANAGE CUSTOMERS ============ */}
      {subTab === "customers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar selector */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-fit flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
              <Search size={16} /> Search User Account
            </h3>
            <div className="relative">
              <select
                value={selectedUserId}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488] bg-[#f7f9f8] text-[#022525]"
              >
                <option value="">-- Select Customer --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedUserId && customerWallet && (
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0d9488] flex items-center justify-center font-bold">
                    {customerWallet.customer?.name?.[0] || <User size={16} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#022525]">{customerWallet.customer?.name}</h4>
                    <p className="text-xs text-gray-400">{customerWallet.customer?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#f7f9f8] p-3.5 rounded-xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Available Points</span>
                    <span className="text-xl font-extrabold text-[#022525]">{customerWallet.available_balance}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Wallet Status</span>
                    <span className={`text-xs font-bold w-fit uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                      customerWallet.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {customerWallet.status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFreezeToggle}
                  disabled={freezing}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    customerWallet.status === "active"
                      ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {customerWallet.status === "active" ? <Lock size={13} /> : <Unlock size={13} />}
                  {freezing ? "Processing..." : customerWallet.status === "active" ? "Freeze Wallet Account" : "Unfreeze Wallet Account"}
                </button>
              </div>
            )}
          </div>

          {/* Details / Action panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {!selectedUserId ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm flex flex-col items-center gap-2">
                <Database size={32} className="text-gray-300" />
                <h4 className="font-bold text-sm text-[#022525]">No Customer Selected</h4>
                <p className="text-xs text-gray-400">Select a customer from the left panel to review points ledger and perform manual adjustments.</p>
              </div>
            ) : loadingWallet ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 flex items-center justify-center">
                <span className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Manual Adjustment Form */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
                    <Settings size={16} /> Perform Manual Points Adjustment
                  </h3>

                  <form onSubmit={handleAdjustPointsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Points Amount</label>
                      <input
                        type="number"
                        value={adjustmentForm.points}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, points: e.target.value })}
                        placeholder="e.g. 50"
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488]"
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Adjustment Direction</label>
                      <select
                        value={adjustmentForm.direction}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, direction: e.target.value })}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488] bg-white"
                      >
                        <option value="CREDIT">CREDIT (+)</option>
                        <option value="DEBIT">DEBIT (-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Audit Reason (Reason)</label>
                      <input
                        type="text"
                        value={adjustmentForm.reason}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                        placeholder="e.g. Compensation for failed booking #1234"
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Audit Reference (Reference)</label>
                      <input
                        type="text"
                        value={adjustmentForm.reference}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reference: e.target.value })}
                        placeholder="e.g. REF-12345"
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488]"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={adjusting}
                        className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white py-2.5 rounded-xl font-bold text-xs transition-colors"
                      >
                        {adjusting ? "Processing Adjustment..." : "Apply Manual Adjustment"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Ledger Entries */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
                    <History size={16} /> Customer Points Ledger Log
                  </h3>

                  {customerLedger.length === 0 ? (
                    <p className="text-gray-400 text-xs py-4 text-center">No transaction records found in ledger.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-bold">
                              <th className="pb-3">Event Type</th>
                              <th className="pb-3">Reference ID</th>
                              <th className="pb-3 text-center">Expiry</th>
                              <th className="pb-3 text-right">Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerLedger.map((entry) => (
                              <tr key={entry._id} className="border-b border-gray-50 hover:bg-[#fafbfa]">
                                <td className="py-3">
                                  <span className="flex flex-col">
                                    <span className="font-bold text-[#022525] uppercase text-[10px]">{entry.eventType}</span>
                                    <span className="text-[10px] text-gray-400">{entry.notes || "-"}</span>
                                  </span>
                                </td>
                                <td className="py-3 font-mono text-[10px] uppercase text-gray-500">{entry.referenceId.slice(-12)}</td>
                                <td className="py-3 text-center text-gray-400 text-[10px]">
                                  {entry.expiryDate ? new Date(entry.expiryDate).toLocaleDateString() : "-"}
                                </td>
                                <td className={`py-3 text-right font-bold ${entry.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                                  {entry.direction === "CREDIT" ? "+" : "-"}{entry.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {ledgerTotalPages > 1 && (
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                          <button
                            onClick={() => fetchCustomerWalletDetails(selectedUserId, Math.max(ledgerPage - 1, 1))}
                            disabled={ledgerPage === 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold hover:bg-gray-50 disabled:opacity-50"
                          >
                            Prev
                          </button>
                          <span className="text-[10px] text-gray-500">Page {ledgerPage} of {ledgerTotalPages}</span>
                          <button
                            onClick={() => fetchCustomerWalletDetails(selectedUserId, Math.min(ledgerPage + 1, ledgerTotalPages))}
                            disabled={ledgerPage === ledgerTotalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold hover:bg-gray-50 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ TAB: REWARD DISCOUNT TIERS ============ */}
      {subTab === "reward-tiers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Tier Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-fit flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
              <Plus size={16} /> Create Reward Discount Tier
            </h3>
            <form onSubmit={handleCreateTierSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Points Required</label>
                <input
                  type="number"
                  placeholder="e.g. 100, 250, 500"
                  value={tierForm.pointsRequired}
                  onChange={(e) => setTierForm({ ...tierForm, pointsRequired: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488] bg-[#f7f9f8]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Discount Amount (₹ OFF)</label>
                <input
                  type="number"
                  placeholder="e.g. 50, 150, 350"
                  value={tierForm.discountAmount}
                  onChange={(e) => setTierForm({ ...tierForm, discountAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488] bg-[#f7f9f8]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Minimum Booking Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0 = any booking amount"
                  value={tierForm.minimumBookingAmount}
                  onChange={(e) => setTierForm({ ...tierForm, minimumBookingAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488] bg-[#f7f9f8]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Validity Days</label>
                <input
                  type="number"
                  placeholder="30"
                  value={tierForm.validityDays}
                  onChange={(e) => setTierForm({ ...tierForm, validityDays: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488] bg-[#f7f9f8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tierIsActive"
                  checked={tierForm.isActive}
                  onChange={(e) => setTierForm({ ...tierForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#0d9488] rounded"
                />
                <label htmlFor="tierIsActive" className="text-xs font-bold text-gray-700">Set as Active Tier</label>
              </div>

              <button
                type="submit"
                disabled={creatingTier}
                className="w-full py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {creatingTier ? "Creating..." : "Save Reward Tier"}
              </button>
            </form>
          </div>

          {/* List Tiers */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
                <Sliders size={16} /> Configured Reward Tiers
              </h3>
              <button onClick={fetchRewardTiers} className="text-xs text-[#0d9488] hover:underline flex items-center gap-1 font-bold">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {loadingTiers ? (
              <p className="text-xs text-gray-400 py-8 text-center">Loading reward discount tiers...</p>
            ) : rewardTiers.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No reward discount tiers configured.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewardTiers.map((tier) => (
                  <div key={tier._id} className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between gap-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-black text-xl text-[#0f766e]">{tier.pointsRequired} Points</div>
                        <div className="text-sm font-bold text-[#022525] mt-0.5">₹{tier.discountAmount} OFF Discount</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          tier.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {tier.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-2.5 rounded-xl">
                      <div>Min Booking: {tier.minimumBookingAmount > 0 ? `₹${tier.minimumBookingAmount}` : "None"}</div>
                      <div>Validity: {tier.validityDays} days</div>
                    </div>

                    <button
                      onClick={() => handleTierToggleStatus(tier)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                        tier.isActive ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {tier.isActive ? "Disable Tier" : "Enable Tier"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ TAB: RULES ============ */}
      {subTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Rule Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-fit flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
              <Plus size={16} /> Configure New Rule
            </h3>

            <form onSubmit={handleCreateRuleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rule Name</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g. Festival 15% Reward Bonus"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Points %</label>
                  <input
                    type="number"
                    value={ruleForm.pointsPercentage}
                    onChange={(e) => setRuleForm({ ...ruleForm, pointsPercentage: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488]"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Multiplier</label>
                  <input
                    type="number"
                    value={ruleForm.multiplier}
                    onChange={(e) => setRuleForm({ ...ruleForm, multiplier: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488]"
                    required
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Minimum Booking ₹</label>
                <input
                  type="number"
                  value={ruleForm.minAmount}
                  onChange={(e) => setRuleForm({ ...ruleForm, minAmount: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0d9488]"
                  required
                  min="0"
                />
              </div>

              <button
                type="submit"
                disabled={creatingRule}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white py-2.5 rounded-xl font-bold text-xs transition-colors"
              >
                {creatingRule ? "Creating..." : "Save Reward Rule"}
              </button>
            </form>
          </div>

          {/* Rules List */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
              <Gift size={16} /> Active Earning Rules Configuration
            </h3>

            {loadingRules ? (
              <div className="py-8 flex justify-center">
                <span className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
              </div>
            ) : rules.length === 0 ? (
              <p className="text-gray-400 text-xs py-4 text-center">No rules configured in the database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold">
                      <th className="pb-3">Rule Name</th>
                      <th className="pb-3 text-center">Earning %</th>
                      <th className="pb-3 text-center">Min Booking</th>
                      <th className="pb-3 text-center">Multiplier</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule._id} className="border-b border-gray-50 hover:bg-[#fafbfa]">
                        <td className="py-3.5 font-bold text-[#022525]">{rule.name}</td>
                        <td className="py-3.5 text-center font-extrabold text-teal-600">{rule.pointsPercentage}%</td>
                        <td className="py-3.5 text-center text-gray-600 font-medium">₹{rule.minAmount}</td>
                        <td className="py-3.5 text-center text-gray-600 font-semibold">{rule.multiplier}x</td>
                        <td className="py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRuleToggleStatus(rule)}
                            className={`px-3 py-1 rounded-full font-bold text-[10px] transition-colors border ${
                              rule.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {rule.isActive ? "ACTIVE" : "DISABLED"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ TAB: REDEMPTIONS ============ */}
      {subTab === "redemptions" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
            <Gift size={16} /> Global Voucher Redemptions Log
          </h3>

          {loadingRedemptions ? (
            <div className="py-12 flex justify-center">
              <span className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            </div>
          ) : redemptions.length === 0 ? (
            <p className="text-gray-400 text-xs py-4 text-center">No redemptions registered.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold">
                      <th className="pb-3">Voucher Reference Code</th>
                      <th className="pb-3">Customer Profile</th>
                      <th className="pb-3 text-center">Points Redeemed</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Issued At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map((red) => (
                      <tr key={red._id} className="border-b border-gray-50 hover:bg-[#fafbfa]">
                        <td className="py-3.5 font-mono font-bold text-[#0d9488] uppercase tracking-wide">
                          {red.referenceCode}
                        </td>
                        <td className="py-3.5">
                          <div className="font-bold text-[#022525]">{red.customer?.name}</div>
                          <div className="text-[10px] text-gray-400">{red.customer?.email} · {red.customer?.phone}</div>
                        </td>
                        <td className="py-3.5 text-center font-extrabold text-[#022525]">
                          {red.pointsRedeemed} pts
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                            red.status === "used"
                              ? "bg-gray-100 text-gray-500 border-gray-200"
                              : red.status === "reversed"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-[#f0fdfa] text-[#0d9488] border-[#ccfbf1]"
                          }`}>
                            {red.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-gray-400 text-[10px]">
                          {new Date(red.createdAt).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {redTotalPages > 1 && (
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <button
                    onClick={() => setRedPage((p) => Math.max(p - 1, 1))}
                    disabled={redPage === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-[10px] text-gray-500">Page {redPage} of {redTotalPages}</span>
                  <button
                    onClick={() => setRedPage((p) => Math.min(p + 1, redTotalPages))}
                    disabled={redPage === redTotalPages}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ TAB: RECONCILIATION ============ */}
      {subTab === "reconciliation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Stats */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-fit flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-amber-500" /> System Integrity Check
            </h3>

            {loadingRecon ? (
              <div className="py-6 flex justify-center">
                <span className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
              </div>
            ) : recon ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-[#f7f9f8] rounded-xl border border-gray-100">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    recon.reconciled ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {recon.reconciled ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#022525]">Reconciliation Status</h4>
                    <p className="text-[10px] text-gray-500">
                      {recon.reconciled ? "Balances match ledger log." : "Ledger discrepancy detected!"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Total Wallets Balance</span>
                    <span className="font-extrabold text-[#022525]">{recon.totalWalletBalance} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Net Ledger (Credits - Debits)</span>
                    <span className="font-extrabold text-[#022525]">{recon.netLedgerBalance} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2">
                    <span className="text-gray-400">Gross System Credits</span>
                    <span className="font-bold text-emerald-600">+{recon.totalCredits} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Gross System Debits</span>
                    <span className="font-bold text-rose-600">-{recon.totalDebits} pts</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-xs text-center py-4">No reconciliation data available.</p>
            )}
          </div>

          {/* Suspicious / rejected logic */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#022525] flex items-center gap-1.5">
              <RefreshCw size={16} /> Sync & Audit Controls
            </h3>
            <div className="text-xs text-gray-500 leading-relaxed flex flex-col gap-3">
              <p>The Points engine audits active ledger accounts against sum total transactions dynamically. If discrepancy is found, check system audit logs for administrative interventions or reversal conflicts.</p>
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={15} />
                <p className="text-amber-800 text-[11px]">System jobs automatically run points expiration audits hourly. Ledger adjustments performed by workers are labeled as eventType <span className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px] font-bold">EXPIRED</span>.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletAdmin;

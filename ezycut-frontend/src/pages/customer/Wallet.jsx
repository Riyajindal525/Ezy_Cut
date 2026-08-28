import { useEffect, useState } from "react";
import { getWalletBalance, getLedger, getRewardTiers, getMyVouchers, redeemPoints } from "../../api/wallet.api";
import { Gift, History, Award, AlertCircle, Copy, Check, Clock, Ticket } from "lucide-react";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";

const Wallet = () => {
  const [balance, setBalance] = useState({ balance: 0, pending: 0, blocked: 0 });
  const [ledger, setLedger] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedCode, setCopiedCode] = useState("");
  const [activeTab, setActiveTab] = useState("redeem"); // redeem, ledger, vouchers
  const [latestIssuedVoucher, setLatestIssuedVoucher] = useState(null);

  const fetchWalletData = async () => {
    try {
      const balData = await getWalletBalance();
      if (balData.success) {
        setBalance(balData);
      }
      const ledgerData = await getLedger(page, 10);
      if (ledgerData.success) {
        setLedger(ledgerData.entries || []);
        setTotalPages(ledgerData.pagination?.pages || 1);
      }
      const tiersData = await getRewardTiers();
      if (tiersData.success) {
        setTiers(tiersData.tiers || []);
      }
      const vouchersData = await getMyVouchers();
      if (vouchersData.success) {
        setVouchers(vouchersData.vouchers || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRedeemTier = async (tier) => {
    if (balance.balance < tier.pointsRequired) {
      toast.error(`Insufficient points balance. You need ${tier.pointsRequired} points.`);
      return;
    }

    setRedeeming(true);
    setLatestIssuedVoucher(null);
    try {
      const res = await redeemPoints({ tierId: tier._id, points: tier.pointsRequired });
      if (res.success) {
        toast.success(res.message || "Points successfully redeemed!");
        setLatestIssuedVoucher({
          code: res.referenceCode,
          discountAmount: res.discountAmount,
          expiresAt: res.expiresAt,
        });

        // Refresh wallet, ledger & vouchers
        const balData = await getWalletBalance();
        if (balData.success) setBalance(balData);
        const ledgerData = await getLedger(1, 10);
        if (ledgerData.success) {
          setLedger(ledgerData.entries || []);
          setPage(1);
        }
        const vouchersData = await getMyVouchers();
        if (vouchersData.success) setVouchers(vouchersData.vouchers || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to redeem points.");
    } finally {
      setRedeeming(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success("Voucher code copied!");
    setTimeout(() => setCopiedCode(""), 3000);
  };

  if (loading) return <Loader message="Loading EzyCut Points Wallet..." />;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:pb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 self-start bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-[#5eead4]">
              <Award size={14} /> EzyCut Rewards
            </span>
            <h1 className="text-3xl font-extrabold text-white leading-tight">EZYCUT Points</h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Earn 10% points on completed bookings and redeem for automatic discounts on your next appointment.
            </p>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT CONTAINER ============ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        {/* ============ BALANCE METRICS CARDS ============ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Active Balance Card */}
          <div className="bg-gradient-to-br from-[#0f766e] to-[#042f2e] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3 text-white/10">
              <Award size={64} />
            </div>
            <div>
              <span className="text-[#5eead4] text-[10px] font-bold uppercase tracking-wider">Available Points</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight">{balance.balance}</span>
                <span className="text-xs text-emerald-200 font-medium">pts</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-300 mt-4">Available to convert into booking discounts.</p>
          </div>

          {/* Pending Balance Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Pending Points</span>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#022525]">{balance.pending}</span>
              <span className="text-xs text-gray-500 font-semibold">Points</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <Clock size={12} className="text-amber-500 shrink-0" />
              <span>Awaiting service completion</span>
            </div>
          </div>

          {/* Blocked / Expiring Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Blocked / Frozen</span>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#022525]">{balance.blocked}</span>
              <span className="text-xs text-gray-500 font-semibold">Points</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <AlertCircle size={12} className="text-rose-500 shrink-0" />
              <span>Expiring points (6 mos expiry)</span>
            </div>
          </div>
        </div>

        {/* Voucher Success Alert Banner */}
        {latestIssuedVoucher && (
          <div className="bg-[#f0fdfa] border-2 border-[#5eead4] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ccfbf1] flex items-center justify-center text-[#0d9488] shrink-0">
                <Gift size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#042f2e]">₹{latestIssuedVoucher.discountAmount} OFF Voucher Issued! 🎉</h3>
                <p className="text-sm text-[#0f766e] mt-1">Use this code on your next booking screen to get ₹{latestIssuedVoucher.discountAmount} OFF automatically.</p>
                <div className="mt-3 flex items-center gap-3 bg-white border border-[#ccfbf1] px-4 py-2 rounded-xl w-fit">
                  <span className="font-mono text-base font-bold text-[#0f766e] tracking-wider">{latestIssuedVoucher.code}</span>
                  <button
                    onClick={() => copyToClipboard(latestIssuedVoucher.code)}
                    className="text-[#0d9488] hover:text-[#0f766e] p-1 rounded transition-colors"
                  >
                    {copiedCode === latestIssuedVoucher.code ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ TABS ============ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 bg-[#fafbfa]">
            <button
              onClick={() => setActiveTab("redeem")}
              className={`flex-1 py-4 px-4 text-center font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 ${
                activeTab === "redeem"
                  ? "border-[#0d9488] text-[#0d9488] bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Gift size={16} />
              Redeem Rewards
            </button>
            <button
              onClick={() => setActiveTab("vouchers")}
              className={`flex-1 py-4 px-4 text-center font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 ${
                activeTab === "vouchers"
                  ? "border-[#0d9488] text-[#0d9488] bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Ticket size={16} />
              My Vouchers ({vouchers.length})
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`flex-1 py-4 px-4 text-center font-bold text-sm flex items-center justify-center gap-2 transition-colors border-b-2 ${
                activeTab === "ledger"
                  ? "border-[#0d9488] text-[#0d9488] bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History size={16} />
              Points Ledger
            </button>
          </div>

          <div className="p-6">
            {/* ============ TAB: REDEEM REWARDS ============ */}
            {activeTab === "redeem" && (
              <div className="flex flex-col gap-6">
                <div className="bg-[#ccfbf1]/20 border border-[#ccfbf1] rounded-2xl p-4 flex gap-3 items-start">
                  <Award className="text-[#0d9488] shrink-0 mt-0.5" size={18} />
                  <div className="text-xs text-[#0f766e] leading-relaxed">
                    <p className="font-bold mb-0.5">How Reward Redemption Works:</p>
                    <p>Redeem your active EZYCUT Points for a discount voucher code. Enter your code at checkout on your next booking to get an instant price reduction!</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {tiers.map((tier) => {
                    const isAffordable = balance.balance >= tier.pointsRequired;
                    return (
                      <div
                        key={tier._id}
                        className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
                          isAffordable
                            ? "border-gray-200 hover:border-[#0d9488]/40 hover:shadow-md bg-white"
                            : "border-gray-100 bg-gray-50/50 opacity-75"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="font-black text-2xl text-[#0f766e]">{tier.pointsRequired} <span className="text-xs text-gray-500 font-semibold">pts</span></span>
                            <span className="bg-[#f0fdfa] border border-[#ccfbf1] text-[#0d9488] font-black text-sm px-2.5 py-1 rounded-full">
                              ₹{tier.discountAmount} OFF
                            </span>
                          </div>
                          <h4 className="font-bold text-[#022525] text-base">Next-Booking Discount</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {tier.minimumBookingAmount > 0
                              ? `Valid on bookings ₹${tier.minimumBookingAmount}+. Expires in ${tier.validityDays} days.`
                              : `Valid on any booking. Expires in ${tier.validityDays} days.`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRedeemTier(tier)}
                          disabled={!isAffordable || redeeming}
                          className={`w-full py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                            isAffordable
                              ? "bg-[#0d9488] hover:bg-[#0f766e] text-white hover:-translate-y-0.5 shadow-sm"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {redeeming ? "Redeeming..." : `Redeem for ${tier.pointsRequired} pts`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============ TAB: MY VOUCHERS ============ */}
            {activeTab === "vouchers" && (
              <div className="flex flex-col gap-4">
                {vouchers.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Ticket size={20} />
                    </div>
                    <p className="text-gray-400 text-sm">No vouchers issued yet. Redeem your points above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vouchers.map((v) => {
                      const isIssued = v.status === "issued";
                      const isUsed = v.status === "used";
                      const isExpired = v.status === "expired";
                      return (
                        <div key={v._id} className="border border-gray-200 rounded-2xl p-5 bg-white flex flex-col justify-between gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs text-gray-400 font-medium">Voucher Code</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-base font-extrabold text-[#022525]">{v.referenceCode}</span>
                                {isIssued && (
                                  <button
                                    onClick={() => copyToClipboard(v.referenceCode)}
                                    className="text-[#0d9488] hover:text-[#0f766e]"
                                  >
                                    {copiedCode === v.referenceCode ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                )}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                isIssued
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isUsed
                                  ? "bg-gray-100 text-gray-600 border border-gray-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {v.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                            <div>
                              <div className="text-lg font-black text-[#0d9488]">₹{v.discountAmount} OFF</div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                {v.expiresAt ? `Expires: ${new Date(v.expiresAt).toLocaleDateString("en-IN")}` : "No expiry"}
                              </div>
                            </div>
                            {isIssued && (
                              <span className="text-xs font-bold text-[#0f766e] bg-[#f0fdfa] px-3 py-1.5 rounded-lg border border-[#ccfbf1]">
                                Ready for next booking
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ============ TAB: LEDGER ============ */}
            {activeTab === "ledger" && (
              <div className="flex flex-col gap-4">
                {ledger.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <History size={20} />
                    </div>
                    <p className="text-gray-400 text-sm">No transaction entries found in ledger.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold">
                          <th className="pb-3 font-semibold">Type</th>
                          <th className="pb-3 font-semibold">Reference</th>
                          <th className="pb-3 font-semibold">Date</th>
                          <th className="pb-3 font-semibold text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.map((entry) => {
                          const isCredit = entry.direction === "CREDIT";
                          return (
                            <tr key={entry._id} className="border-b border-gray-50 hover:bg-[#fafbfa] transition-colors">
                              <td className="py-4">
                                <span className="flex flex-col">
                                  <span className="font-bold text-[#022525] text-sm">
                                    {entry.eventType === "EARN" && "Booking Reward"}
                                    {entry.eventType === "REDEEM" && "Voucher Redemption"}
                                    {entry.eventType === "EXPIRED" && "Points Expired"}
                                    {entry.eventType === "ADJUSTMENT" && "System Adjustment"}
                                    {entry.eventType === "REVERSAL" && "Reversal adjustment"}
                                  </span>
                                  {entry.notes && <span className="text-[11px] text-gray-500 line-clamp-1">{entry.notes}</span>}
                                </span>
                              </td>
                              <td className="py-4 font-mono text-xs text-gray-500 uppercase">
                                {entry.referenceId.slice(-12)}
                              </td>
                              <td className="py-4 text-xs text-gray-400">
                                {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className={`py-4 text-right font-black text-sm ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                                {isCredit ? "+" : "-"}{entry.points}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

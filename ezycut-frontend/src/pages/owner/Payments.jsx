import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonPayments,
  refundPayment,
} from "../../api/payment.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Wallet, AlertTriangle, CreditCard, X, TrendingUp, Receipt, ArrowDownRight } from "lucide-react";

const OwnerPayments = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refund Modal States
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchSalonAndPayments = async () => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const paymentsResponse = await getSalonPayments(activeSalonId);
        setPayments(paymentsResponse.payments || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load salon transaction ledgers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleRefund = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setRefundReason("");
    setRefundModalOpen(true);
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    if (!selectedPaymentId) return;
    setRefundLoading(true);
    try {
      await refundPayment(selectedPaymentId, refundReason);
      toast.success("Refund processed successfully! 🎉. The booking has been cancelled.");
      setRefundModalOpen(false);
      setSelectedPaymentId(null);
      setRefundReason("");
      fetchSalonAndPayments();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  // Aggregates
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const netEarnings = totalPaid - totalRefunded;

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":     return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "refunded": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "failed":   return "bg-rose-50 text-rose-600 border border-rose-100";
      default:         return "bg-gray-50 text-gray-500 border border-gray-100";
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) {
    return <Loader message="Compiling ledger records..." />;
  }

  if (salons.filter(s => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white border border-gray-100 rounded-3xl shadow-sm p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center mx-auto mb-6">
          <Wallet size={32} className="text-[#0d9488]" />
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
      {/* Page heading */}
      <div {...fadeUp(0)} className={fadeUp(0).className}>
        <h1 className="font-['Outfit'] text-2xl md:text-[1.75rem] font-extrabold text-[#042f2e] tracking-[-0.02em] flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center">
            <Wallet size={18} />
          </span>
          Payments & Earnings
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">Track transactions, revenue and refunds for your salon.</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Gross Earnings */}
        <div
          {...fadeUp(60)}
          className={`${fadeUp(60).className} group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_14px_32px_rgba(13,148,136,0.12)] hover:-translate-y-1 hover:border-[#0d9488]/25 transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.1)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <span className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">Gross Earnings</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#f0fdfa] text-[#0d9488] group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="relative">
            <h3 className="font-['Outfit'] text-3xl font-extrabold text-[#042f2e] tracking-tight">₹{totalPaid}</h3>
            <p className="text-xs font-semibold text-[#0d9488] mt-1.5">Total revenue collected</p>
          </div>
        </div>

        {/* Total Refunded */}
        <div
          {...fadeUp(120)}
          className={`${fadeUp(120).className} group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_14px_32px_rgba(244,63,94,0.1)] hover:-translate-y-1 hover:border-rose-200 transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <span className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">Total Refunded</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-500 group-hover:scale-110 transition-transform duration-300">
              <ArrowDownRight size={17} />
            </div>
          </div>
          <div className="relative">
            <h3 className="font-['Outfit'] text-3xl font-extrabold text-[#042f2e] tracking-tight">₹{totalRefunded}</h3>
            <p className="text-xs font-semibold text-rose-500 mt-1.5">Returned transaction funds</p>
          </div>
        </div>

        {/* Net Income */}
        <div
          {...fadeUp(180)}
          className={`${fadeUp(180).className} group relative bg-gradient-to-br from-[#0f766e] to-[#042f2e] border border-[#0d9488]/20 rounded-2xl shadow-[0_10px_28px_rgba(15,118,110,0.25)] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,118,110,0.35)] transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.2)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <span className="text-[0.6875rem] font-bold text-white/60 uppercase tracking-wider">Net Income</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/10 border border-white/20 text-white group-hover:scale-110 transition-transform duration-300">
              <Wallet size={17} />
            </div>
          </div>
          <div className="relative">
            <h3 className="font-['Outfit'] text-3xl font-extrabold text-white tracking-tight">₹{netEarnings}</h3>
            <p className="text-xs font-semibold text-[#5eead4] mt-1.5">Net profit after refunds</p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div {...fadeUp(240)} className={`${fadeUp(240).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap bg-gradient-to-r from-[#f7fdfc] to-white">
          <div>
            <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center">
                <Receipt size={16} />
              </span>
              Payment Transactions — {salon?.name}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-1 ml-10">
              {payments.length} transaction{payments.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>
        <div className="p-6">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-14">
              <div className="relative w-20 h-20 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <CreditCard size={26} className="text-gray-300" />
              </div>
              <h4 className="font-['Outfit'] text-lg font-bold text-gray-700">No Transactions Recorded</h4>
              <p className="text-sm text-gray-400 max-w-sm">
                Any online checkout transactions completed by clients will populate here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Customer</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Service</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Amount</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Paid Date</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Payment ID</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Status</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr
                      key={p._id}
                      {...fadeUp(280 + i * 50)}
                      className={`${fadeUp(280 + i * 50).className} border-b border-gray-50 last:border-none hover:bg-[#f7fdfc] transition-colors duration-200`}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-[#042f2e]">{p.customer?.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.customer?.email}</div>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-gray-700">{p.service?.name}</td>
                      <td className="py-3.5 pr-4 font-extrabold text-[#0d9488] text-base">₹{p.amount}</td>
                      <td className="py-3.5 pr-4 text-gray-500">
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-gray-400">{p.razorpayPaymentId || "N/A"}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full ${getStatusClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {p.status === "paid" ? (
                          <button
                            onClick={() => handleRefund(p._id)}
                            className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 hover:scale-105 active:scale-95 text-amber-600 font-bold text-[0.6875rem] px-3 py-1.5 rounded-lg transition-all duration-200"
                          >
                            Issue Refund
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.25s_ease]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] text-lg font-extrabold text-gray-800">Issue Refund</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Initiate payment chargeback</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitRefund} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[0.8125rem] font-semibold text-gray-600">Reason (Optional)</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Salon closed today, customer requested cancellation..."
                  rows="3"
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none resize-y transition-all duration-200 focus:border-[#0d9488] focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setRefundModalOpen(false);
                    setSelectedPaymentId(null);
                    setRefundReason("");
                  }}
                  className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all duration-200"
                >
                  {refundLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Refund"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPayments;
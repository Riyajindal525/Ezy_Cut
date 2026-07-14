import { useEffect, useState } from "react";
import {
  getAllPayments,
  refundPayment,
} from "../../api/payment.api";
import toast from "../../utils/toast";
import {
  Wallet,
  Receipt,
  CalendarClock,
  Store,
  AlertCircle,
  RotateCcw,
  X,
} from "lucide-react";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Refund Modal States
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPaymentsList = async () => {
    try {
      const data = await getAllPayments();
      setPayments(data.payments);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch platform transaction logs ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsList();
  }, []);

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
      toast.success("Refund processed successfully! 🎉");
      setRefundModalOpen(false);
      setSelectedPaymentId(null);
      setRefundReason("");
      fetchPaymentsList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  const statusStyles = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "refunded":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "failed":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[fadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const inputClass =
    "w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)]";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-9 h-9 border-[3px] border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-sm px-5 py-4 rounded-xl">
        <AlertCircle size={18} className="shrink-0" />
        {error}
      </div>
    );
  }

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
            <Wallet size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              Global Payments Ledger
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Audit all online transaction logs, Razorpay references, and issue universal refunds
            </p>
          </div>
        </div>

        <span className="relative inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3.5 py-1.5 rounded-full ring-1 ring-inset ring-teal-200">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          {payments.length} Transactions
        </span>
      </div>

      {/* Transactions List */}
      <div {...fadeUp(80)} className={`${fadeUp(80).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/60">
          <h3 className="text-base font-semibold text-slate-800">Transaction Records</h3>
          <p className="text-xs text-slate-400 mt-1">Payment status and refund actions per order</p>
        </div>

        <div className="p-6 pt-4">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-14">
              <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Receipt size={24} className="text-teal-400" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm">No Transactions Found</h4>
              <p className="text-xs text-slate-400 max-w-sm">Platform transactions ledger is currently empty.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {payments.map((p, i) => (
                <div
                  key={p._id}
                  {...fadeUp(120 + i * 30)}
                  className={`${fadeUp(120 + i * 30).className} bg-slate-50 border border-slate-200 rounded-xl p-5 hover:bg-slate-100 hover:border-teal-300 hover:shadow-[0_6px_18px_rgba(15,118,110,0.1)] transition-all duration-200`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                        {p.customer?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{p.customer?.name}</div>
                        <div className="text-xs text-slate-400 truncate">{p.customer?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-lg font-extrabold text-slate-800">₹{p.amount}</span>
                      <span
                        className={`inline-flex items-center text-[0.65rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full whitespace-nowrap border capitalize ${statusStyles(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-wide mb-1">Salon & Service</p>
                      <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                        <Store size={13} className="text-teal-500 shrink-0" />
                        {p.salon?.name || "N/A"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.service?.name}</p>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-wide mb-1">Paid Date</p>
                      <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                        <CalendarClock size={13} className="text-teal-500 shrink-0" />
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : "Pending"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-wide mb-1">Payment ID</p>
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-500 break-all">
                        {p.razorpayPaymentId || "N/A"}
                      </span>
                    </div>

                    <div className="flex sm:justify-end items-start">
                      {p.status === "paid" ? (
                        <button
                          onClick={() => handleRefund(p._id)}
                          className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
                        >
                          <RotateCcw size={13} /> Refund
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No action available</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.25s_ease]">
            <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Issue Refund</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provide a reason for initiating this refund (optional)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRefundModalOpen(false);
                  setSelectedPaymentId(null);
                  setRefundReason("");
                }}
                className="p-2 border border-gray-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitRefund} className="flex flex-col gap-5">
              <div>
                <label className="text-[0.8125rem] font-semibold text-slate-600 mb-2 block">Reason (Optional)</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Booking cancelled, duplicate transaction..."
                  rows="3"
                  className={`${inputClass} resize-y`}
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
                  className="border border-gray-200 text-slate-600 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
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

export default AdminPayments;
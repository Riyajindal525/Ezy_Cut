import { useEffect, useState } from "react";
import { getAllPayments } from "../../api/payment.api";
import {
  Wallet,
  Receipt,
  CalendarClock,
  Store,
  AlertCircle,
} from "lucide-react";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const statusStyles = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "refunded":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "failed":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "pending":
        return "bg-orange-50 text-orange-600 border-orange-100";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[fadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

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
              Audit all online transaction logs and Razorpay references.
              Refund requests are handled via the{" "}
              <span className="text-teal-600 font-semibold">Refund Requests</span>{" "}
              panel.
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
          <p className="text-xs text-slate-400 mt-1">Read-only payment ledger — view status and Razorpay references</p>
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
                        {p.status === "refunded" && p.refundStatus === "pending"
                          ? "Refund Pending"
                          : p.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      {p.refundReason && (
                        <p className="text-xs text-amber-600 italic mt-1 truncate" title={p.refundReason}>
                          {p.refundReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
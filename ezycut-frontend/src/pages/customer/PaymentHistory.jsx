import { useEffect, useState } from "react";
import {
  IndianRupee,
  Calendar,
  MapPin,
  ReceiptText,
  RefreshCw,
  Wallet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getMyPayments } from "../../api/payment.api";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";
import avatarIcon from "../../assets/sidefacesilhouette.png";

const statusConfig = {
  paid: { label: "Paid", class: "badge-paid" },
  created: { label: "Pending", class: "badge-pending" },
  failed: { label: "Failed", class: "badge-cancelled" },
  refunded: { label: "Refunded", class: "badge-refunded" },
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "paid", label: "Completed" },
  { key: "created", label: "Pending" },
  { key: "refunded", label: "Refunded" },
];

const statusIconStyles = {
  paid: { bg: "bg-emerald-50", text: "text-emerald-600", hex: "#059669" },
  refunded: { bg: "bg-violet-50", text: "text-violet-600", hex: "#7c3aed" },
  failed: { bg: "bg-red-50", text: "text-red-600", hex: "#dc2626" },
  created: { bg: "bg-amber-50", text: "text-amber-600", hex: "#d97706" },
};

// Custom Recharts tooltip — matches the light card / teal-accent theme
const SpendTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3.5 py-2.5">
      <p className="text-[0.7rem] font-semibold text-[#9ca3af] uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm font-extrabold text-[#022525]">
        ₹{payload[0].value}
      </p>
    </div>
  );
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getMyPayments();
        setPayments(data.payments);
      } catch (err) {
        toast.error("Failed to load payment history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Summary
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  if (loading) return <Loader message="Loading payment history..." />;

  const filteredPayments = activeFilter === "all"
    ? payments
    : payments.filter((p) => p.status === activeFilter);

  // Derived monthly spend trend (paid transactions only) — purely presentational, no new data source
  const monthlyTrend = (() => {
    const map = {};
    payments
      .filter((p) => p.status === "paid")
      .forEach((p) => {
        const d = new Date(p.createdAt);
        const key = d.toLocaleDateString("en-IN", { month: "short" });
        map[key] = (map[key] || 0) + p.amount;
      });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  })();

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP (with inline stats) ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:pb-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">Payment History</h1>
            <p className="text-white/60 text-sm">
              {payments.length} transaction{payments.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Inline stat pills (desktop) */}
          {payments.length > 0 && (
            <div className="hidden lg:flex gap-4">
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-4 min-w-[150px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/60">Total Spent</span>
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <IndianRupee size={13} className="text-white" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white leading-none">₹{totalPaid}</div>
                <div className="text-xs font-semibold text-white/40 mt-1.5">Paid transactions</div>
              </div>

              <div className="bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-4 min-w-[150px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/60">Refunded</span>
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <TrendingDown size={13} className="text-violet-300" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white leading-none">₹{totalRefunded}</div>
                <div className="text-xs font-semibold text-white/40 mt-1.5">Returned to you</div>
              </div>

              <div className="bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-4 min-w-[150px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/60">Net Spent</span>
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <TrendingUp size={13} className="text-[#5eead4]" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white leading-none">₹{totalPaid - totalRefunded}</div>
                <div className="text-xs font-semibold text-white/40 mt-1.5">After refunds</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">

        {/* Mobile-only stat grid (hidden on desktop, shown in hero instead) */}
        {payments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:hidden">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5b6b68]">Total Spent</span>
                <div className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center">
                  <IndianRupee size={15} />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-[#022525] leading-none">₹{totalPaid}</span>
              <span className="text-xs font-semibold text-[#9ca3af]">Paid transactions</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5b6b68]">Refunded</span>
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <TrendingDown size={15} />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-violet-600 leading-none">₹{totalRefunded}</span>
              <span className="text-xs font-semibold text-[#9ca3af]">Returned to you</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5b6b68]">Net Spent</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={15} />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-emerald-600 leading-none">₹{totalPaid - totalRefunded}</span>
              <span className="text-xs font-semibold text-[#9ca3af]">After refunds</span>
            </div>
          </div>
        )}

        {/* Two column: transaction list + spend trend chart */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">

          {/* Transaction list */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col gap-5">
            {/* Filter tabs */}
            <div className="inline-flex flex-wrap items-center gap-1 bg-[#f7f9f8] border border-gray-100 rounded-xl p-1 w-fit">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    activeFilter === tab.key
                      ? "bg-white text-[#022525] shadow-sm"
                      : "text-[#5b6b68] hover:text-[#022525]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-4 py-10">
                <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
                  <ReceiptText size={26} className="text-[#0d9488]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-[#022525]">No transactions found</h3>
                  <p className="text-[#5b6b68] text-sm max-w-sm">
                    {payments.length === 0
                      ? "Your payment transactions will appear here after you book a service."
                      : "No payments match this filter yet."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredPayments.map((payment) => {
                  const status = statusConfig[payment.status] || { label: payment.status, class: "badge-pending" };
                  const iconStyle = statusIconStyles[payment.status] || statusIconStyles.created;

                  return (
                    <div
                      key={payment._id}
                      className="group flex items-center gap-4 flex-wrap sm:flex-nowrap rounded-xl px-3 py-3 hover:bg-[#f7f9f8] transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconStyle.bg}`}>
                        <span
                          aria-hidden="true"
                          style={{
                            display: "inline-block",
                            width: 23,
                            height: 23,
                            backgroundColor: iconStyle.hex,
                            WebkitMaskImage: `url(${avatarIcon})`,
                            maskImage: `url(${avatarIcon})`,
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                          }}
                        />
                      </div>

                      <div className="min-w-[160px]">
                        <div className="text-[0.9375rem] font-bold text-[#022525]">{payment.salon?.name}</div>
                        <div className="text-sm text-[#5b6b68]">{payment.service?.name}</div>
                      </div>

                      <div className="flex flex-col gap-1 text-[0.8125rem] text-[#9ca3af] font-medium min-w-[150px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RefreshCw size={12} />
                          Refund: {payment.refundStatus && payment.refundStatus !== "none" ? payment.refundStatus : "not_requested"}
                        </div>
                      </div>

                      {payment.salon?.city && (
                        <div className="hidden md:flex items-center gap-1.5 text-[0.8125rem] text-[#9ca3af] font-medium">
                          <MapPin size={12} />
                          {payment.salon.city}
                        </div>
                      )}

                      <div className="ml-auto flex flex-col items-end gap-1.5">
                        <span className="text-lg font-extrabold text-[#022525]">₹{payment.amount}</span>
                        <span className={`badge ${status.class}`}>{status.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Spend trend chart — Recharts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-[#022525]">Spend Trend</h3>
              <p className="text-sm text-[#5b6b68]">Your spend over time</p>
            </div>

            {monthlyTrend.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <TrendingUp size={22} className="text-[#0d9488]" />
                <p className="text-sm text-[#5b6b68]">No spend data yet</p>
              </div>
            ) : (
              <div className="h-[220px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="spendTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip content={<SpendTooltip />} cursor={{ stroke: "#0d9488", strokeWidth: 1, strokeDasharray: "4 4" }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fill="url(#spendTrendFill)"
                      dot={{ r: 3.5, fill: "#0d9488", stroke: "#fff", strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
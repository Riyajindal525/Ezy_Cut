import { useEffect, useState } from "react";
import { getPnlReport } from "../../api/invoice.api";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  IndianRupee,
  Wallet,
  Clock,
  AlertCircle,
  BarChart2,
} from "lucide-react";

const PnlTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 min-w-[160px]">
      <p className="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-bold flex items-center justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span>₹{p.value.toLocaleString("en-IN")}</span>
        </p>
      ))}
    </div>
  );
};

const PnLReport = () => {
  const [monthly, setMonthly] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getPnlReport();
        setMonthly(data.monthly || []);
        setTotals(data.totals);
      } catch (err) {
        console.error(err);
        setError("Error loading P&L report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-9 h-9 border-[3px] border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
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

  const statCards = [
    {
      label: "Net Profit",
      value: `₹${totals?.netProfit?.toLocaleString("en-IN") || 0}`,
      sub: "Commission − gateway charges",
      subColor: "text-emerald-500",
      icon: TrendingUp,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Cash Collected",
      value: `₹${totals?.grossRevenue?.toLocaleString("en-IN") || 0}`,
      sub: "Total customer payments",
      subColor: "text-gray-400",
      icon: IndianRupee,
      tint: "bg-[#f0fdfa] text-[#0d9488]",
    },
    {
      label: "Paid to Salons",
      value: `₹${totals?.settlementsPaid?.toLocaleString("en-IN") || 0}`,
      sub: "Settlements completed",
      subColor: "text-sky-500",
      icon: Wallet,
      tint: "bg-sky-50 text-sky-600",
    },
    {
      label: "Pending Payouts",
      value: `₹${totals?.settlementsPending?.toLocaleString("en-IN") || 0}`,
      sub: "Still owed to salons",
      subColor: "text-amber-500",
      icon: Clock,
      tint: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div {...fadeUp(0)} className={fadeUp(0).className}>
        <h1 className="font-['Outfit'] text-2xl md:text-[1.75rem] font-extrabold text-[#042f2e] tracking-[-0.02em]">
          Cash Flow & P&L
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">
          Monthly profit & loss, cash inflow, and payout position — computed from all raised invoices.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            {...fadeUp(60 + i * 40)}
            className={`${fadeUp(60 + i * 40).className} group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_14px_32px_rgba(15,118,110,0.1)] hover:-translate-y-1 hover:border-[#0d9488]/25 transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.07)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative flex justify-between items-start">
              <span className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.tint} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={17} />
              </div>
            </div>
            <div className="relative">
              <h3 className="font-['Outfit'] text-3xl font-extrabold text-[#042f2e] tracking-tight">{card.value}</h3>
              <p className={`text-xs font-semibold mt-1.5 ${card.subColor}`}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Combined Chart: Revenue bars + Net Profit line */}
      <div {...fadeUp(220)} className={`${fadeUp(220).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-4 sm:px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
              <BarChart2 size={16} />
            </span>
            Monthly Cash Flow Trend
          </h3>
          <p className="text-xs text-gray-400 mt-1 ml-10">Cash collected (bars) vs net profit (line), month by month</p>
        </div>
        <div className="p-3 sm:p-6">
          {monthly.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-10">
              <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <BarChart2 size={22} className="text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-700 text-sm">No Data Yet</h4>
              <p className="text-xs text-gray-400">Chart will populate once invoices are raised.</p>
            </div>
          ) : (
            <div className="h-[260px] sm:h-[320px] -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthly} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
                  <Tooltip content={<PnlTooltip />} cursor={{ fill: "rgba(13,148,136,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: "0.7rem", fontWeight: 600 }} />
                  <Bar dataKey="grossRevenue" name="Cash Collected" fill="#99f6e4" radius={[6, 6, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="netProfit"
                    name="Net Profit"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#0d9488" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown Table */}
       <div {...fadeUp(280)} className={`${fadeUp(280).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-4 sm:px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
              <IndianRupee size={16} />
            </span>
            Month-wise P&L Breakdown
          </h3>
          <span className="sm:hidden text-[0.65rem] font-semibold text-gray-400">← swipe to see more →</span>
        </div>
        <div className="p-6 pt-4">
          {monthly.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No data available yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Month</th>
                    <th className="text-center text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Invoices</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Cash Collected</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Commission</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Gateway Fees</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m, i) => (
                    <tr
                      key={m.month}
                      {...fadeUp(320 + i * 30)}
                      className={`${fadeUp(320 + i * 30).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                    >
                      <td className="py-3.5 px-2 font-bold text-gray-700 whitespace-nowrap">{m.month}</td>
                      <td className="py-3.5 px-2 text-center text-gray-500 font-semibold">{m.invoiceCount}</td>
                      <td className="py-3.5 px-2 text-right font-semibold text-gray-600">₹{m.grossRevenue.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-2 text-right font-semibold text-[#0d9488]">₹{m.commissionEarned.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-2 text-right font-semibold text-amber-600">− ₹{m.gatewayCharges.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 text-right font-extrabold text-[#042f2e]">₹{m.netProfit.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PnLReport;
import { useEffect, useState } from "react";
import { getPlatformRevenue } from "../../api/invoice.api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  Percent,
  TrendingDown,
  Receipt,
  Building,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

const RevTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3.5 py-2.5">
      <p className="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-extrabold text-[#042f2e]">₹{payload[0].value.toLocaleString("en-IN")}</p>
    </div>
  );
};

const RevenueDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salonBreakdown, setSalonBreakdown] = useState([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const data = await getPlatformRevenue();
        setSummary(data.summary);
        setSalonBreakdown(data.salonBreakdown || []);
        setInvoiceCount(data.invoiceCount || 0);
      } catch (err) {
        console.error(err);
        setError("Error loading platform revenue data.");
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
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
      label: "Total Platform Revenue",
      value: `₹${summary?.totalRevenue?.toLocaleString("en-IN") || 0}`,
      sub: `From ${invoiceCount} raised invoice${invoiceCount !== 1 ? "s" : ""}`,
      subColor: "text-gray-400",
      icon: IndianRupee,
      tint: "bg-[#f0fdfa] text-[#0d9488]",
    },
    {
      label: "Commission Earned",
      value: `₹${summary?.totalCommission?.toLocaleString("en-IN") || 0}`,
      sub: "EzyCut's platform revenue",
      subColor: "text-red-500",
      icon: Percent,
      tint: "bg-red-50 text-red-600",
    },
    {
      label: "Gateway Charges",
      value: `₹${summary?.totalGatewayCharges?.toLocaleString("en-IN") || 0}`,
      sub: "Payment processing fees",
      subColor: "text-amber-500",
      icon: TrendingDown,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "GST Collected",
      value: `₹${summary?.totalGST?.toLocaleString("en-IN") || 0}`,
      sub: "Across all invoices",
      subColor: "text-violet-500",
      icon: Receipt,
      tint: "bg-violet-50 text-violet-600",
    },
  ];

  const chartData = salonBreakdown.slice(0, 8).map((s) => ({
    name: s.salonName?.length > 14 ? s.salonName.slice(0, 14) + "…" : s.salonName,
    revenue: s.totalRevenue,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div {...fadeUp(0)} className={fadeUp(0).className}>
        <h1 className="font-['Outfit'] text-2xl md:text-[1.75rem] font-extrabold text-[#042f2e] tracking-[-0.02em]">
          Revenue & Finance
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">Platform-wide commission, GST, and settlement overview.</p>
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

      {/* Net settlement banner */}
      <div
        {...fadeUp(220)}
        className={`${fadeUp(220).className} bg-gradient-to-r from-[#031715] via-[#042f2e] to-[#0f766e] rounded-2xl shadow-sm px-6 py-6 flex flex-wrap items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Wallet size={20} className="text-[#5eead4]" />
          </div>
          <div>
            <p className="text-white font-bold text-base">Total Salon Settlements</p>
            <p className="text-white/60 text-xs">Net amount owed to salons after commission & gateway deductions</p>
          </div>
        </div>
        <span className="text-2xl font-['Outfit'] font-extrabold text-white">
          ₹{summary?.totalSalonSettlements?.toLocaleString("en-IN") || 0}
        </span>
      </div>

      {/* Revenue by salon chart */}
      <div {...fadeUp(260)} className={`${fadeUp(260).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
              <Building size={16} />
            </span>
            Revenue by Salon
          </h3>
          <p className="text-xs text-gray-400 mt-1 ml-10">Top salons by total invoiced revenue</p>
        </div>
        <div className="p-6">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-10">
              <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <Building size={22} className="text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-700 text-sm">No Revenue Data</h4>
              <p className="text-xs text-gray-400">Chart will populate once invoices are raised.</p>
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<RevTooltip />} cursor={{ fill: "rgba(13,148,136,0.06)" }} />
                  <Bar dataKey="revenue" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Salon-wise breakdown table */}
      <div {...fadeUp(320)} className={`${fadeUp(320).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
              <Receipt size={16} />
            </span>
            Salon-wise Revenue Register
          </h3>
          <p className="text-xs text-gray-400 mt-1 ml-10">All salons ranked by total invoiced revenue</p>
        </div>
        <div className="p-6 pt-4">
          {salonBreakdown.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-10">
              <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <Building size={22} className="text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-700 text-sm">No Salon Revenue Yet</h4>
              <p className="text-xs text-gray-400">Data will appear once invoices are raised across salons.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2 w-12">#</th>
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Salon</th>
                    <th className="text-center text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Invoices</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Revenue</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {salonBreakdown.map((s, idx) => (
                    <tr
                      key={s.salonId}
                      {...fadeUp(360 + idx * 40)}
                      className={`${fadeUp(360 + idx * 40).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                    >
                      <td className="py-3.5 px-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1]">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-[#042f2e] whitespace-nowrap">{s.salonName}</div>
                        <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{s.salonCity}</div>
                      </td>
                      <td className="py-3.5 px-2 text-center text-gray-500 font-semibold">{s.invoiceCount}</td>
                      <td className="py-3.5 px-2 text-right font-extrabold text-[#042f2e]">
                        ₹{s.totalRevenue.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-red-500">
                        − ₹{s.totalCommission.toLocaleString("en-IN")}
                      </td>
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

export default RevenueDashboard;
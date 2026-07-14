import { useEffect, useRef, useState } from "react";
import {
  getNetRevenue,
  getPlatformMonthlyRevenue,
} from "../../api/payment.api";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  AlertCircle,
  CalendarRange,
} from "lucide-react";

const AdminAnalytics = () => {
  const [netRevenue, setNetRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const analyticsFetched = useRef(false);

  useEffect(() => {
    if (analyticsFetched.current) return;
    analyticsFetched.current = true;

    const fetchAnalytics = async () => {
      try {
        const [netData, monthlyData] = await Promise.all([
          getNetRevenue(),
          getPlatformMonthlyRevenue(),
        ]);
        setNetRevenue(netData.revenue);
        setMonthlyRevenue(monthlyData.revenue || []);
      } catch (err) {
        console.error(err);
        setError("Error loading system revenue analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const getMonthShort = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "short" });
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

  const maxRevenue =
    monthlyRevenue.length > 0
      ? Math.max(...monthlyRevenue.map((m) => m.revenue))
      : 1;

  const avgRevenue =
    monthlyRevenue.length > 0
      ? monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / monthlyRevenue.length
      : 0;

  const chartCeiling = maxRevenue > 0 ? maxRevenue * 1.15 : 1;
  const avgLinePct = chartCeiling > 0 ? (avgRevenue / chartCeiling) * 100 : 0;

  const refundRate =
    netRevenue?.paidRevenue > 0
      ? ((netRevenue.refundedRevenue / netRevenue.paidRevenue) * 100).toFixed(1)
      : 0;

  const gridLevels = [0, 25, 50, 75, 100];

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes growUp { from { height: 0%; } }
        @keyframes drawLine { from { width: 0%; opacity: 0; } to { opacity: 1; } }
        .col-fill { animation: growUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .avg-line { animation: drawLine 1s ease-out 0.6s both; }
      `}</style>

      {/* Page Header */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden rounded-2xl p-6 md:p-7 bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-4 flex-wrap`}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm shadow-teal-200 flex items-center justify-center shrink-0">
            <BarChart3 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              Revenue Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Platform-wide financial overview — gross sales, refunds, and net earnings
            </p>
          </div>
        </div>

        <span className="relative inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3.5 py-1.5 rounded-full ring-1 ring-inset ring-teal-200">
          <CalendarRange size={13} />
          {new Date().getFullYear()} Report
        </span>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div
          {...fadeUp(80)}
          className={`${fadeUp(80).className} relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Gross Platform Sales</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            ₹{(netRevenue?.paidRevenue || 0).toLocaleString()}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            Total transactions captured
          </div>
        </div>

        <div
          {...fadeUp(140)}
          className={`${fadeUp(140).className} relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Platform Refunds</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
              <TrendingDown size={16} className="text-rose-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            ₹{(netRevenue?.refundedRevenue || 0).toLocaleString()}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-rose-500">
            {refundRate}% of gross sales returned
          </div>
        </div>

        <div
          {...fadeUp(200)}
          className={`${fadeUp(200).className} relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-br from-teal-600 to-teal-700`}
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wide">Net Platform Earnings</span>
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
          </div>
          <div className="relative text-2xl font-extrabold text-white">
            ₹{(netRevenue?.netRevenue || 0).toLocaleString()}
          </div>
          <div className="relative mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-teal-100">
            Earnings net after refunds
          </div>
        </div>

      </div>

      {/* Monthly Revenue Chart — vertical column chart */}
      <div
        {...fadeUp(260)}
        className={`${fadeUp(260).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}
      >
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-5 border-b border-gray-100 bg-slate-50/60">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Monthly Revenue Comparison ({new Date().getFullYear()})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Monthly breakdown of platform revenue and booking counts
            </p>
          </div>
          {monthlyRevenue.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-teal-400 to-teal-600" />
                Revenue
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span
                  className="w-3 h-[2px]"
                  style={{ backgroundImage: "repeating-linear-gradient(90deg,#f59e0b 0 4px,transparent 4px 7px)" }}
                />
                Average
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {monthlyRevenue.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-14">
              <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
                <BarChart3 size={24} className="text-teal-400" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm">No Revenue Data Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Monthly revenue aggregates will appear once transactions are completed.
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-72 pb-8 text-[0.65rem] font-medium text-slate-400 text-right shrink-0">
                {[...gridLevels].reverse().map((lvl) => (
                  <span key={lvl}>
                    ₹{Math.round((chartCeiling * lvl) / 100).toLocaleString()}
                  </span>
                ))}
              </div>

              {/* Chart area — flex-col: bars grow, labels always visible below */}
              <div className="flex-1 flex flex-col h-72">
                {/* Bars + grid + avg line (fills remaining space) */}
                <div className="relative flex-1 min-h-0">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {gridLevels.map((lvl) => (
                      <div key={lvl} className="border-t border-dashed border-slate-100 w-full" />
                    ))}
                  </div>

                  {/* Average reference line */}
                  {avgRevenue > 0 && (
                    <div
                      className="avg-line absolute left-0 right-0 flex items-center pointer-events-none"
                      style={{ bottom: `${avgLinePct}%` }}
                    >
                      <div className="w-full border-t-2 border-dashed border-amber-400/70" />
                      <span className="absolute right-0 -top-4 text-[0.6rem] font-bold text-amber-500 bg-white px-1">
                        AVG ₹{Math.round(avgRevenue).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Bars */}
                  <div className="relative flex items-end justify-between gap-2 sm:gap-4 h-full">
                    {monthlyRevenue.map((m, idx) => {
                      const pct = chartCeiling > 0 ? (m.revenue / chartCeiling) * 100 : 0;
                      const isTop = m.revenue === maxRevenue;
                      const isHovered = hoveredIdx === idx;
                      return (
                        <div
                          key={idx}
                          className="relative flex-1 h-full flex flex-col justify-end items-center group"
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          {/* Tooltip */}
                          <div
                            className={`absolute -top-2 -translate-y-full z-10 whitespace-nowrap rounded-lg bg-slate-800 text-white text-xs font-medium px-3 py-2 shadow-lg transition-all duration-150 ${
                              isHovered ? "opacity-100 -translate-y-full" : "opacity-0 translate-y-0 pointer-events-none"
                            }`}
                            style={{ bottom: `${pct}%` }}
                          >
                            <div className="font-bold">{getMonthName(m._id.month)} — ₹{m.revenue.toLocaleString()}</div>
                            <div className="text-slate-300 text-[0.7rem]">{m.bookings} bookings</div>
                            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                          </div>

                          {/* Best month marker */}
                          {isTop && (
                            <span
                              className="absolute -translate-x-1/2 left-1/2 text-[0.55rem] font-bold uppercase tracking-wide text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full ring-1 ring-inset ring-teal-200 whitespace-nowrap"
                              style={{ bottom: `calc(${pct}% + 8px)` }}
                            >
                              Best
                            </span>
                          )}

                          {/* Column */}
                          <div
                            className={`col-fill w-full max-w-[2.75rem] rounded-t-md transition-all duration-200 ${
                              isHovered
                                ? "bg-gradient-to-t from-teal-500 to-teal-400 shadow-lg shadow-teal-200"
                                : "bg-gradient-to-t from-teal-600 to-teal-400"
                            }`}
                            style={{ height: `${pct}%`, animationDelay: `${300 + idx * 60}ms` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-axis labels — fixed height row, always visible */}
                <div className="flex justify-between gap-2 sm:gap-4 h-8 mt-2 border-t border-slate-100 pt-2 shrink-0">
                  {monthlyRevenue.map((m, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <span className="text-[0.7rem] font-semibold text-slate-500">
                        {getMonthShort(m._id.month)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
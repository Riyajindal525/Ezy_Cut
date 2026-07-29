import { useEffect, useState } from "react";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { getSalonWallet } from "../../api/invoice.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import {
  Wallet,
  TrendingDown,
  Percent,
  IndianRupee,
  Receipt,
  Calendar,
  User,
} from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80";

const SalonWallet = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!activeSalonId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const activeSalon = salons.find((s) => s._id === activeSalonId);
        setSalon(activeSalon);
        const data = await getSalonWallet(activeSalonId);
        setSummary(data.summary);
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load wallet summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) return <Loader message="Loading wallet summary..." />;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Panel */}
      <div {...fadeUp(0)} className={`${fadeUp(0).className} relative overflow-hidden rounded-3xl shadow-xl`}>
        <img src={HERO_IMG} alt="Wallet" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#16231d]/95 via-[#1d302a]/90 to-[#2a4238]/70" />
        <div className="relative px-6 sm:px-10 py-8 sm:py-10">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#a8dcc4] mb-3">
            <Wallet size={12} /> Salon Wallet
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {salon?.name} Settlement Summary
          </h3>
          <p className="text-[#c3d9cd] text-sm mt-1">
            Your revenue, commission, and settlement breakdown across all raised invoices
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div {...fadeUp(100)} className={`${fadeUp(100).className} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center">
              <IndianRupee size={15} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-[#022525]">
            ₹{summary?.totalRevenue?.toLocaleString("en-IN") || 0}
          </span>
          <span className="text-xs text-gray-400">From all raised invoices</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Platform Commission</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Percent size={15} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-red-600">
            − ₹{summary?.totalCommission?.toLocaleString("en-IN") || 0}
          </span>
          <span className="text-xs text-gray-400">EzyCut's platform fee</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Gateway Charges</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown size={15} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-amber-600">
            − ₹{summary?.totalGatewayCharges?.toLocaleString("en-IN") || 0}
          </span>
          <span className="text-xs text-gray-400">Payment processing fees</span>
        </div>

        <div className="bg-gradient-to-br from-[#0d9488] to-[#042f2e] rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Your Settlement</span>
            <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center">
              <Wallet size={15} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white">
            ₹{summary?.totalSettlement?.toLocaleString("en-IN") || 0}
          </span>
          <span className="text-xs text-white/60">Net amount credited to you</span>
        </div>
      </div>

      {/* Settlement table */}
      <div {...fadeUp(200)} className={`${fadeUp(200).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Receipt size={17} className="text-[#0d9488]" /> Settlement Breakdown
          </h3>
        </div>
        <div className="p-6">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-4 py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
                <Wallet size={26} className="text-[#0d9488]" />
              </div>
              <h4 className="text-lg font-bold text-gray-700">No Settlements Yet</h4>
              <p className="text-sm text-gray-400 max-w-sm">
                Settlement details will appear here once invoices are raised.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Invoice #</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Customer</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Date</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Gross</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Commission</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Gateway</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Net Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr
                      key={inv._id}
                      {...fadeUp(240 + i * 40)}
                      className={`${fadeUp(240 + i * 40).className} border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition-colors`}
                    >
                      <td className="py-3.5 pr-4 font-mono font-bold text-gray-700">
                        {inv.invoiceNumber || `#${inv._id.slice(-8).toUpperCase()}`}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <User size={13} className="text-gray-400" />
                          {inv.customer?.name || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-right font-bold text-gray-800">
                        ₹{inv.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-semibold text-red-500">
                        − ₹{inv.commissionAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 pr-4 text-right font-semibold text-amber-600">
                        − ₹{inv.gatewayChargeAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-[#0d9488] text-base">
                        ₹{inv.salonSettlementAmount?.toLocaleString("en-IN")}
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

export default SalonWallet;
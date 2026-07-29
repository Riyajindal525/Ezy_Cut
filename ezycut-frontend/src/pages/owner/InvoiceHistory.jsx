import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import { getSalonInvoices } from "../../api/invoice.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { FileText, Receipt, Eye, Calendar, User } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80";

const statusStyles = {
  draft: "bg-amber-50 text-amber-600 border border-amber-200",
  raised: "bg-sky-50 text-sky-600",
  paid: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-rose-50 text-rose-600",
};

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!activeSalonId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const activeSalon = salons.find((s) => s._id === activeSalonId);
        setSalon(activeSalon);
        const data = await getSalonInvoices(activeSalonId);
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load invoice history.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) return <Loader message="Loading invoice history..." />;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Panel */}
      <div
        {...fadeUp(0)}
        className={`${fadeUp(0).className} relative overflow-hidden rounded-3xl shadow-xl`}
      >
        <img
          src={HERO_IMG}
          alt="Invoices"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#16231d]/95 via-[#1d302a]/90 to-[#2a4238]/70" />
        <div className="relative px-6 sm:px-10 py-8 sm:py-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#a8dcc4] mb-3">
              <Receipt size={12} /> Invoice Register
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {salon?.name} Invoices
            </h3>
            <p className="text-[#c3d9cd] text-sm mt-1">
              All raised and draft invoices for your salon
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-white/10 text-white border border-white/20">
            {invoices.length} Total
          </span>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div
        {...fadeUp(120)}
        className={`${fadeUp(120).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FileText size={17} className="text-[#0d9488]" /> Invoice Register
          </h3>
        </div>
        <div className="p-6">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-4 py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
                <Receipt size={26} className="text-[#0d9488]" />
              </div>
              <h4 className="text-lg font-bold text-gray-700">
                No Invoices Yet
              </h4>
              <p className="text-sm text-gray-400 max-w-sm">
                Invoices raised from completed bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                      Invoice #
                    </th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                      Customer
                    </th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                      Date
                    </th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                      Amount
                    </th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr
                      key={inv._id}
                      {...fadeUp(160 + i * 40)}
                      className={`${fadeUp(160 + i * 40).className} border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition-colors`}
                    >
                      <td className="py-3.5 pr-4 font-mono font-bold text-gray-700">
                        {inv.invoiceNumber ||
                          `#${inv._id.slice(-8).toUpperCase()}`}
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
                          {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-extrabold text-gray-800 text-base">
                        ₹{inv.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusStyles[inv.status] || "bg-gray-100 text-gray-500"}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              inv.status === "draft"
                                ? `/owner/invoices/${inv._id}/preview`
                                : `/owner/invoices/${inv._id}/details`,
                            )
                          }
                          className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-colors border border-teal-200"
                        >
                          <Eye size={12} /> View
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
    </div>
  );
};

export default InvoiceHistory;

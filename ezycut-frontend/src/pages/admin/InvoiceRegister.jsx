import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInvoices } from "../../api/invoice.api";
import {
  Search,
  Receipt,
  Eye,
  Calendar,
  User,
  Store,
  AlertCircle,
} from "lucide-react";

const statusStyles = {
  draft: "bg-amber-50 text-amber-600 border border-amber-200",
  raised: "bg-sky-50 text-sky-600",
  paid: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-rose-50 text-rose-600",
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "raised", label: "Raised" },
  { key: "paid", label: "Paid" },
  { key: "cancelled", label: "Cancelled" },
];

const InvoiceRegister = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getAllInvoices();
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error(err);
        setError("Error loading invoice register.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (activeFilter !== "all") {
      result = result.filter((inv) => inv.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber?.toLowerCase().includes(q) ||
          inv.salon?.name?.toLowerCase().includes(q) ||
          inv.customer?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [invoices, activeFilter, search]);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div {...fadeUp(0)} className={fadeUp(0).className}>
        <h1 className="font-['Outfit'] text-2xl md:text-[1.75rem] font-extrabold text-[#042f2e] tracking-[-0.02em]">
          Invoice Register
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">
          All invoices across every salon on the platform — {invoices.length} total.
        </p>
      </div>

      {/* Search + Filters */}
      <div {...fadeUp(80)} className={`${fadeUp(80).className} flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between`}>
        <div className="inline-flex flex-wrap items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeFilter === tab.key
                  ? "bg-[#0d9488] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#042f2e]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80 lg:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, salon, or customer"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#042f2e] font-medium outline-none transition-all focus:border-[#0d9488] focus:ring-4 focus:ring-[#0d9488]/10"
          />
        </div>
      </div>

      {/* Table */}
      <div {...fadeUp(140)} className={`${fadeUp(140).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
              <Receipt size={16} />
            </span>
            {filteredInvoices.length} Invoice{filteredInvoices.length !== 1 ? "s" : ""}
          </h3>
        </div>
        <div className="p-6 pt-4">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                <Receipt size={22} className="text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-700 text-sm">No Invoices Found</h4>
              <p className="text-xs text-gray-400">
                {search || activeFilter !== "all"
                  ? "Try adjusting your search or filter."
                  : "Invoices will appear here once salons start raising them."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Invoice #</th>
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Salon</th>
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Customer</th>
                    <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Date</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Amount</th>
                    <th className="text-center text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Status</th>
                    <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, i) => (
                    <tr
                      key={inv._id}
                      {...fadeUp(180 + i * 30)}
                      className={`${fadeUp(180 + i * 30).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                    >
                      <td className="py-3.5 px-2 font-mono font-bold text-gray-700 whitespace-nowrap">
                        {inv.invoiceNumber || `#${inv._id.slice(-8).toUpperCase()}`}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-700 whitespace-nowrap">
                          <Store size={13} className="text-gray-400 shrink-0" />
                          {inv.salon?.name || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium whitespace-nowrap">
                          <User size={13} className="text-gray-400 shrink-0" />
                          {inv.customer?.name || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-right font-extrabold text-[#042f2e] whitespace-nowrap">
                        ₹{inv.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`inline-flex items-center text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles[inv.status] || "bg-gray-100 text-gray-500"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              inv.status === "draft"
                                ? `/owner/invoices/${inv._id}/preview`
                                : `/owner/invoices/${inv._id}/details`
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

export default InvoiceRegister;
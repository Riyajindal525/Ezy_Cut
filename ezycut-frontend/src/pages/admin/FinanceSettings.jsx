import { useEffect, useState } from "react";
import {
  getSettlementReport,
  markSettlementPaid,
  getGstReport,
  getPlatformSettings,
  updatePlatformSettings,
} from "../../api/invoice.api";
import toast from "../../utils/toast";
import {
  Wallet,
  Receipt,
  Settings,
  CheckCircle2,
  Clock,
  Calendar,
  Store,
  AlertCircle,
  Save,
} from "lucide-react";

const tabs = [
  { key: "settlement", label: "Settlement Report", icon: Wallet },
  { key: "gst", label: "GST Report", icon: Receipt },
  { key: "commission", label: "Commission Settings", icon: Settings },
];

const FinanceSettings = () => {
  const [activeTab, setActiveTab] = useState("settlement");

  // Settlement state
  const [settlementReport, setSettlementReport] = useState([]);
  const [settlementLoading, setSettlementLoading] = useState(true);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  // GST state
  const [gstReport, setGstReport] = useState([]);
  const [gstLoading, setGstLoading] = useState(true);

  // Settings state
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({ commissionRate: 0, gatewayChargeRate: 0, gstRate: 0 });

  useEffect(() => {
    fetchSettlement();
    fetchGst();
    fetchSettings();
  }, []);

  const fetchSettlement = async () => {
    setSettlementLoading(true);
    try {
      const data = await getSettlementReport();
      setSettlementReport(data.report || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settlement report.");
    } finally {
      setSettlementLoading(false);
    }
  };

  const fetchGst = async () => {
    setGstLoading(true);
    try {
      const data = await getGstReport();
      setGstReport(data.report || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load GST report.");
    } finally {
      setGstLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await getPlatformSettings();
      setSettings(data.settings);
      setFormValues({
        commissionRate: data.settings.commissionRate,
        gatewayChargeRate: data.settings.gatewayChargeRate,
        gstRate: data.settings.gstRate,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    setMarkingPaidId(invoiceId);
    try {
      await markSettlementPaid(invoiceId);
      toast.success("Marked as paid.");
      fetchSettlement();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update.");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const data = await updatePlatformSettings(formValues);
      setSettings(data.settings);
      toast.success("Platform settings updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  const pendingCount = settlementReport.filter((s) => s.settlementStatus === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div {...fadeUp(0)} className={fadeUp(0).className}>
        <h1 className="font-['Outfit'] text-2xl md:text-[1.75rem] font-extrabold text-[#042f2e] tracking-[-0.02em]">
          Finance Settings
        </h1>
        <p className="text-[#6b7280] text-sm mt-1">
          Settlement payouts, GST breakdown, and platform commission — all in one place.
        </p>
      </div>

      {/* Tabs */}
      <div {...fadeUp(60)} className={`${fadeUp(60).className} inline-flex flex-wrap items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-[#0d9488] text-white shadow-sm"
                : "text-gray-500 hover:text-[#042f2e]"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.key === "settlement" && pendingCount > 0 && (
              <span className={`ml-1 text-[0.625rem] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============ TAB: Settlement Report ============ */}
      {activeTab === "settlement" && (
        <div {...fadeUp(120)} className={`${fadeUp(120).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
            <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
                <Wallet size={16} />
              </span>
              Salon Settlement Status
            </h3>
            <p className="text-xs text-gray-400 mt-1 ml-10">Mark salon payouts as paid once transferred to their bank</p>
          </div>
          <div className="p-6 pt-4">
            {settlementLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="w-8 h-8 border-[3px] border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
              </div>
            ) : settlementReport.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-3 py-12">
                <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                  <Wallet size={22} className="text-gray-300" />
                </div>
                <h4 className="font-bold text-gray-700 text-sm">No Settlements Yet</h4>
                <p className="text-xs text-gray-400">Data will appear once invoices are raised.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm border-collapse min-w-[680px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Invoice #</th>
                      <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Salon</th>
                      <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Raised On</th>
                      <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Amount</th>
                      <th className="text-center text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Status</th>
                      <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlementReport.map((s, i) => (
                      <tr
                        key={s._id}
                        {...fadeUp(160 + i * 30)}
                        className={`${fadeUp(160 + i * 30).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                      >
                        <td className="py-3.5 px-2 font-mono font-bold text-gray-700 whitespace-nowrap">
                          {s.invoiceNumber || `#${s._id.slice(-8).toUpperCase()}`}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-700 whitespace-nowrap">
                            <Store size={13} className="text-gray-400 shrink-0" />
                            {s.salonName}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(s.raisedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right font-extrabold text-[#042f2e]">
                          ₹{s.salonSettlementAmount?.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${
                              s.settlementStatus === "paid"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            {s.settlementStatus === "paid" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            {s.settlementStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {s.settlementStatus === "pending" ? (
                            <button
                              onClick={() => handleMarkPaid(s._id)}
                              disabled={markingPaidId === s._id}
                              className="inline-flex items-center gap-1 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-50 text-white font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              {markingPaidId === s._id ? "Saving..." : "Mark Paid"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Done</span>
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
      )}

      {/* ============ TAB: GST Report ============ */}
      {activeTab === "gst" && (
        <div {...fadeUp(120)} className={`${fadeUp(120).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
            <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
                <Receipt size={16} />
              </span>
              Monthly GST Breakdown
            </h3>
            <p className="text-xs text-gray-400 mt-1 ml-10">GST collected across all raised invoices, grouped by month</p>
          </div>
          <div className="p-6 pt-4">
            {gstLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="w-8 h-8 border-[3px] border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
              </div>
            ) : gstReport.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-3 py-12">
                <div className="w-16 h-16 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center">
                  <Receipt size={22} className="text-gray-300" />
                </div>
                <h4 className="font-bold text-gray-700 text-sm">No GST Data Yet</h4>
                <p className="text-xs text-gray-400">Data will populate as invoices are raised each month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm border-collapse min-w-[520px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Month</th>
                      <th className="text-center text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Invoices</th>
                      <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3 px-2">Taxable Amount</th>
                      <th className="text-right text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider pb-3">GST Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstReport.map((row, i) => (
                      <tr
                        key={row.month}
                        {...fadeUp(160 + i * 30)}
                        className={`${fadeUp(160 + i * 30).className} border-b border-gray-50 last:border-none hover:bg-[#ccfbf1] transition-colors`}
                      >
                        <td className="py-3.5 px-2 font-bold text-gray-700">{row.month}</td>
                        <td className="py-3.5 px-2 text-center text-gray-500 font-semibold">{row.invoiceCount}</td>
                        <td className="py-3.5 px-2 text-right font-semibold text-gray-600">
                          ₹{row.taxableAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 text-right font-extrabold text-[#0d9488]">
                          ₹{row.gstAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ TAB: Commission Settings ============ */}
      {activeTab === "commission" && (
        <div {...fadeUp(120)} className={`${fadeUp(120).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#f7fdfc] to-white">
            <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center shrink-0">
                <Settings size={16} />
              </span>
              Platform Rates
            </h3>
            <p className="text-xs text-gray-400 mt-1 ml-10">
              These rates apply to all new invoices going forward — existing invoices are not affected
            </p>
          </div>

          {settingsLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-8 h-8 border-[3px] border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-5 max-w-md">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Changing these rates only affects invoices raised after saving. Already-raised invoices keep their original rates.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formValues.commissionRate}
                  onChange={(e) => setFormValues((v) => ({ ...v, commissionRate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#f7f9f8] text-sm font-semibold text-[#042f2e] outline-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#0d9488]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Payment Gateway Charge (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formValues.gatewayChargeRate}
                  onChange={(e) => setFormValues((v) => ({ ...v, gatewayChargeRate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#f7f9f8] text-sm font-semibold text-[#042f2e] outline-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#0d9488]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formValues.gstRate}
                  onChange={(e) => setFormValues((v) => ({ ...v, gstRate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#f7f9f8] text-sm font-semibold text-[#042f2e] outline-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#0d9488]/10"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] disabled:bg-gray-300 text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 mt-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceSettings;
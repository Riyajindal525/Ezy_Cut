import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, resendInvoiceEmail } from "../../api/invoice.api";
import useAuthStore from "../../store/auth.store";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  Scissors,
  Phone,
  MapPin,
  Calendar,
  Hash,
  User,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingDown,
  Wallet,
  Percent,
  Mail, 
} from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  raised: { label: "Raised", icon: CheckCircle2, className: "bg-sky-50 text-sky-700 border-sky-200" },
  paid: { label: "Paid", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "salon_owner" || user?.role === "admin";

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getInvoiceById(invoiceId);
        console.log("Invoice data:", data.invoice);
        setInvoice(data.invoice);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load invoice.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
  if (invoice?.pdfUrl) {
    const backendBase = import.meta.env.VITE_API_URL.replace("/api", "");
    window.open(`${backendBase}${invoice.pdfUrl}`, "_blank");
  } else {
    toast.info("PDF is being generated. Please check back shortly.");
  }
};

const handleResendEmail = async () => {
  setResending(true);
  try {
    const data = await resendInvoiceEmail(invoice._id);
    toast.success(data.message);
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to resend email.");
  } finally {
    setResending(false);
  }
};

  if (loading) return <Loader message="Loading invoice..." />;

  if (!invoice) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-white">
        <FileText size={32} className="text-gray-300" />
        <p className="text-gray-500 font-semibold">Invoice not found</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[#0d9488] text-sm font-semibold hover:underline"
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const status = statusConfig[invoice.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8] print:bg-white">
      {/* ============ HEADER STRIP (hidden on print) ============ */}
      <div className="print:hidden relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-8 sm:pb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200 mb-5"
            >
              <ArrowLeft size={13} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-[#5eead4]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Invoice {invoice.invoiceNumber || ""}
                </h1>
                <p className="text-white/60 text-sm">Full invoice details and download</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            {isOwner && (
    <button
      onClick={handleResendEmail}
      disabled={resending}
      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
    >
      <Mail size={14} />
      {resending ? "Sending..." : "Resend Email"}
    </button>
  )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg transition-colors duration-200"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg transition-colors duration-200"
            >
              <Download size={14} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* ============ INVOICE DOCUMENT ============ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 print:py-0 print:px-0 flex flex-col gap-6 print:gap-0">
        <div className="bg-white rounded-2xl print:rounded-none border border-gray-200 print:border-0 shadow-sm print:shadow-none overflow-hidden">

          {/* ---- Top brand band ---- */}
          <div className="relative px-6 sm:px-10 py-8 border-b-2 border-[#0d9488]/15">
            <div className="flex flex-wrap items-start justify-between gap-6">
              {/* Salon identity */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#042f2e] flex items-center justify-center shrink-0 shadow-md">
                  <Scissors size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xl font-['Outfit'] font-extrabold text-[#022525] tracking-tight">
                    {invoice.salon?.name}
                  </p>
                  <p className="text-xs text-[#5b6b68] flex items-center gap-1 mt-1">
                    <MapPin size={11} className="shrink-0" />
                    {invoice.salon?.address}
                    {invoice.salon?.city ? `, ${invoice.salon.city}` : ""}
                  </p>
                  {invoice.salon?.phone && (
                    <p className="text-xs text-[#5b6b68] flex items-center gap-1 mt-0.5">
                      <Phone size={11} />
                      {invoice.salon.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Invoice meta + status */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border ${status.className}`}
                >
                  <StatusIcon size={12} />
                  {status.label}
                </span>
                <div className="mt-3 flex flex-col gap-1 items-end">
                  <p className="text-xs text-[#9ca3af] font-semibold flex items-center gap-1.5">
                    <Hash size={11} />
                    <span className="font-mono text-[#022525] font-bold">
                      {invoice.invoiceNumber || "Not raised yet"}
                    </span>
                  </p>
                  <p className="text-xs text-[#9ca3af] font-semibold flex items-center gap-1.5">
                    <Calendar size={11} />
                    {new Date(invoice.raisedAt || invoice.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Bill To + QR ---- */}
          <div className="px-6 sm:px-10 py-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[#9ca3af] mb-2">Billed To</p>
              <p className="text-base font-bold text-[#022525] flex items-center gap-1.5">
                <User size={14} className="text-[#0d9488]" />
                {invoice.customer?.name}
              </p>
              <p className="text-sm text-[#5b6b68] flex items-center gap-1.5 mt-1">
                <Phone size={13} />
                {invoice.customer?.phone}
              </p>
            </div>

            {/* QR code block */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 rounded-xl bg-[#f7f9f8] border border-gray-200 flex items-center justify-center">
                {invoice.qrCodeUrl ? (
                  <img src={invoice.qrCodeUrl} alt="Invoice QR" className="w-full h-full object-contain p-2" />
                ) : (
                  <QrCode size={36} className="text-gray-300" />
                )}
              </div>
              <p className="text-[0.625rem] text-[#9ca3af] font-semibold uppercase tracking-wide">
                Scan to verify
              </p>
            </div>
          </div>

          {/* ---- Line items ---- */}
          <div className="px-6 sm:px-10 py-6">
            <div className="hidden sm:grid grid-cols-[1fr_70px_100px_110px] gap-3 pb-3 mb-3 border-b-2 border-gray-100 text-[0.6875rem] font-bold uppercase tracking-wide text-[#9ca3af]">
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="flex flex-col divide-y divide-gray-50">
              {invoice.lineItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_70px_100px_110px] gap-2 py-3.5 text-sm"
                >
                  <span className="col-span-2 sm:col-span-1 font-semibold text-[#022525]">{item.name}</span>
                  <span className="text-left sm:text-center text-[#5b6b68]">
                    <span className="sm:hidden text-[#9ca3af]">Qty: </span>
                    {item.qty}
                  </span>
                  <span className="text-right text-[#5b6b68]">
                    <span className="sm:hidden text-[#9ca3af]">Rate: </span>
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-right font-bold text-[#022525]">
                    ₹{(item.qty * item.price).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Totals ---- */}
          <div className="px-6 sm:px-10 py-6 bg-[#f7f9f8] border-t border-gray-100">
            <div className="ml-auto w-full sm:w-80 flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between text-[#5b6b68]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#022525]">₹{invoice.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#5b6b68]">
                  <span>Discount</span>
                  <span className="font-semibold text-red-500">
                    − ₹{invoice.discountAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#5b6b68]">
                <span>GST ({invoice.gstRate}%)</span>
                <span className="font-semibold text-[#022525]">₹{invoice.gstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-px bg-gray-200 my-1.5" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#022525]">Total Paid</span>
                <span className="text-2xl font-['Outfit'] font-extrabold text-[#0d9488]">
                  ₹{invoice.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* ---- Owner-only revenue breakdown ---- */}
          {isOwner && (
            <div className="px-6 sm:px-10 py-6 border-t border-gray-100 print:hidden">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[#9ca3af] mb-3 flex items-center gap-1.5">
                <Wallet size={12} />
                Settlement Breakdown (visible to salon owner only)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#fef2f2] border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-red-600 text-[0.6875rem] font-bold uppercase tracking-wide mb-1.5">
                    <Percent size={11} />
                    Platform Commission
                  </div>
                  <p className="text-lg font-extrabold text-red-600">
                    − ₹{invoice.commissionAmount?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[0.6875rem] text-red-400 font-medium mt-0.5">
                    {invoice.commissionRate}% of total
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-amber-600 text-[0.6875rem] font-bold uppercase tracking-wide mb-1.5">
                    <TrendingDown size={11} />
                    Gateway Charges
                  </div>
                  <p className="text-lg font-extrabold text-amber-600">
                    − ₹{invoice.gatewayChargeAmount?.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[0.6875rem] font-bold uppercase tracking-wide mb-1.5">
                    <Wallet size={11} />
                    Your Settlement
                  </div>
                  <p className="text-lg font-extrabold text-emerald-600">
                    ₹{invoice.salonSettlementAmount?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---- Notes ---- */}
          {invoice.notes && (
            <div className="px-6 sm:px-10 py-5 border-t border-gray-100">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[#9ca3af] mb-1.5">Notes</p>
              <p className="text-sm text-[#5b6b68] leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* ---- Footer ---- */}
          <div className="px-6 sm:px-10 py-5 border-t border-gray-100 bg-[#f7f9f8] print:bg-white">
            <p className="text-[0.6875rem] text-center text-[#9ca3af] leading-relaxed">
              This is a computer-generated invoice issued via EzyCut Solutions Private Limited.
              For queries, contact the salon directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
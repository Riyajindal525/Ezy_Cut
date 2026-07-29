import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getInvoiceById, raiseInvoice } from "../../api/invoice.api";
import Loader from "../../components/common/Loader";
import {
  FileText,
  ArrowLeft,
  Pencil,
  CheckCircle2,
  Scissors,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  User,
} from "lucide-react";
import toast from "../../utils/toast";

// Mock data — replace with data passed from InvoiceGenerate (via navigate state) or a fresh fetch
const MOCK_INVOICE_DRAFT = {
  bookingId: "BK-20260718-0042",
  customerName: "Aarav Sharma",
  customerPhone: "+91 98765 43210",
  customerAddress: "12, Green Park Colony, Alwar, Rajasthan",
  salonName: "SV Salon",
  salonAddress: "Basement, Plot No. 1, Scheme 3, Alwar, Rajasthan 301001",
  salonPhone: "7877665769",
  salonGSTIN: "08AAAAA0000A1Z5",
  date: "18 Jul 2026",
  lineItems: [
    { id: 1, name: "Haircut & Style", qty: 1, price: 800 },
    { id: 2, name: "Beard Grooming", qty: 1, price: 250 },
  ],
  discountAmount: 50,
  gstRate: 18,
};

const InvoicePreview = () => {
 const { invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirming, setConfirming] = useState(false);
  const [invoice, setInvoice] = useState(location.state?.invoice || null);
  const [loading, setLoading] = useState(!location.state?.invoice);

  useEffect(() => {
    if (invoice) return; // already have it from navigation state
    const fetchInvoice = async () => {
      try {
        const data = await getInvoiceById(invoiceId);
        setInvoice(data.invoice);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load invoice.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId, invoice]);
 if (loading) return <Loader message="Loading invoice..." />;
  if (!invoice) return <p className="text-center py-20 text-[#5b6b68]">Invoice not found.</p>;

  const draft = invoice; // rename for minimal changes below
  const subtotal = draft.subtotal;
  const taxableAmount = draft.taxableAmount;
  const gstAmount = draft.gstAmount;
  const totalAmount = draft.totalAmount;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const data = await raiseInvoice(invoice._id);
      toast.success(`Invoice ${data.invoice.invoiceNumber} raised successfully!`);
      navigate("/owner/bookings");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to raise invoice.");
    } finally {
      setConfirming(false);
    }
  };

  const handleEdit = () => {
    navigate(`/owner/bookings/${invoice.booking}/invoice`);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-8 sm:pb-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200 mb-5"
          >
            <ArrowLeft size={13} />
            Back
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <FileText size={20} className="text-[#5eead4]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Invoice Preview
              </h1>
              <p className="text-white/60 text-sm">Review carefully before raising the final invoice</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">

        {/* Draft status banner */}
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Pencil size={13} className="text-amber-600" />
          </div>
          <p className="text-sm text-amber-700 font-medium">
            This is a <span className="font-bold">draft</span>. Once confirmed, the invoice number and amount cannot be changed.
          </p>
        </div>

        {/* ============ INVOICE DOCUMENT CARD ============ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

         {/* Document header band */}
          <div className="bg-[#f0fdfa] border-b border-[#ccfbf1] px-6 sm:px-8 py-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#99f6e4] flex items-center justify-center shrink-0">
                <Scissors size={20} className="text-[#0d9488]" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#022525]">{invoice.salon?.name}</p>
                <p className="text-xs text-[#5b6b68] flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="shrink-0" />
                  {invoice.salon?.address}{invoice.salon?.city ? `, ${invoice.salon.city}` : ""}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  {invoice.salon?.phone && (
                    <p className="text-xs text-[#5b6b68] flex items-center gap-1">
                      <Phone size={11} />
                      {invoice.salon.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[0.6875rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                {invoice.status === "raised" ? "Raised" : "Draft"}
              </span>
              <p className="text-xs text-[#9ca3af] font-semibold mt-2 flex items-center justify-end gap-1">
                <Calendar size={11} />
                {new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="text-xs text-[#9ca3af] font-semibold mt-1 flex items-center justify-end gap-1">
                <Hash size={11} />
                {invoice.invoiceNumber || `#${invoice._id.slice(-8).toUpperCase()}`}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[#9ca3af] mb-2">Billed To</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <p className="text-sm font-bold text-[#022525] flex items-center gap-1.5">
                <User size={13} className="text-[#0d9488]" />
                {invoice.customer?.name}
              </p>
              <p className="text-sm text-[#5b6b68] flex items-center gap-1.5">
                <Phone size={13} />
                {invoice.customer?.phone}
              </p>
            </div>
          </div>

          {/* Line items table */}
          <div className="px-6 sm:px-8 py-5">
            <div className="hidden sm:grid grid-cols-[1fr_70px_100px_100px] gap-3 pb-2.5 mb-2.5 border-b border-gray-100 text-[0.6875rem] font-bold uppercase tracking-wide text-[#9ca3af]">
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="flex flex-col divide-y divide-gray-50">
              {draft.lineItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_70px_100px_100px] gap-2 py-3 text-sm"
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

          {/* Totals */}
          <div className="px-6 sm:px-8 py-5 bg-[#f7f9f8] border-t border-gray-100">
            <div className="ml-auto w-full sm:w-72 flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between text-[#5b6b68]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#022525]">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-[#5b6b68]">
                <span>Discount</span>
                <span className="font-semibold text-red-500">− ₹{draft.discountAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-[#5b6b68]">
                <span>GST ({draft.gstRate}%)</span>
                <span className="font-semibold text-[#022525]">₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#022525]">Total</span>
                <span className="text-xl font-extrabold text-[#0d9488]">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ ACTION BUTTONS ============ */}
        {invoice.status === "draft" && (
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0fdfa] border border-gray-200 hover:border-[#99f6e4] text-[#022525] font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200"
            >
              <Pencil size={15} />
              Edit Details
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {confirming ? (
                "Raising Invoice..."
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm & Raise Invoice
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
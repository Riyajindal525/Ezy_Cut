import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createInvoiceDraft, getPlatformSettings } from "../../api/invoice.api";
import {
  FileText,
  Plus,
  Trash2,
  Scissors,
  Package,
  Percent,
  Receipt,
  User,
  Calendar,
  Hash,
  ArrowLeft,
  CheckCircle2,
  Tag,
  StickyNote,
} from "lucide-react";
import toast from "../../utils/toast";

const InvoiceGenerate = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;

  const [lineItems, setLineItems] = useState(
    booking
      ? [
          {
            id: Date.now(),
            name: booking.service?.name || "",
            qty: 1,
            price: booking.totalAmount || booking.service?.price || 0,
          },
        ]
      : []
  );

  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [gstRate, setGstRate] = useState(18); // fallback default while loading

  useEffect(() => {
    if (!booking) {
      toast.error("Booking details not found. Please open this page from the Bookings list.");
      navigate("/owner/bookings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) return null;

  useEffect(() => {
  const fetchSettings = async () => {
    try {
      const data = await getPlatformSettings();
      setGstRate(data.settings.gstRate);
    } catch (err) {
      console.error("Failed to fetch live GST rate, using default.", err);
    }
  };
  fetchSettings();
}, []);

  /* ---------- Line item handlers ---------- */
  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now(), name: "", qty: 1, price: 0, type: "service" },
    ]);
  };

  const updateLineItem = (id, field, value) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeLineItem = (id) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* ---------- Calculations ---------- */
  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0),
    [lineItems]
  );

  const discountAmount = useMemo(() => {
    if (discountType === "percent") {
      return Math.round((subtotal * (Number(discountValue) || 0)) / 100);
    }
    return Number(discountValue) || 0;
  }, [discountType, discountValue, subtotal]);

  const totalAmount = Math.max(subtotal - discountAmount, 0);
  const taxableAmount = Math.round((totalAmount * 100) / (100 + gstRate));
  const gstAmount = totalAmount - taxableAmount;

  /* ---------- Submit ---------- */
  const handleGenerateInvoice = async () => {
  if (lineItems.length === 0) {
    toast.error("Add at least one service or product.");
    return;
  }
  if (lineItems.some((item) => !item.name.trim())) {
    toast.error("Please name every line item before generating the invoice.");
    return;
  }

  setGenerating(true);
  try {
    const payload = {
      lineItems: lineItems.map(({ name, qty, price }) => ({ name, qty: Number(qty), price: Number(price) })),
      discountAmount: Number(discountAmount) || 0,
      notes,
    };

    const data = await createInvoiceDraft(bookingId, payload);

    toast.success("Invoice draft created!");
    navigate(`/owner/invoices/${data.invoice._id}/preview`, {
      state: { invoice: data.invoice },
    });
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to generate invoice. Please try again.");
  } finally {
    setGenerating(false);
  }
};

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-8 sm:pb-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200 mb-5"
          >
            <ArrowLeft size={13} />
            Back to Booking
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <FileText size={20} className="text-[#5eead4]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Generate Invoice
              </h1>
              <p className="text-white/60 text-sm">Review services and raise a GST invoice</p>
            </div>
          </div>

          {/* Booking context pills */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <Hash size={13} />
              {booking._id?.slice(-8).toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <User size={13} />
              {booking.customer?.name}
            </div>
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <Calendar size={13} />
              {new Date(booking.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">

          {/* ============ LEFT: Line items + discount + notes ============ */}
          <div className="flex flex-col gap-6">

            {/* Line Items Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#f0fdfa] border border-[#99f6e4] flex items-center justify-center">
                    <Scissors size={16} className="text-[#0d9488]" />
                  </div>
                  <h2 className="text-base font-bold text-[#022525]">Services & Products</h2>
                </div>
                <button
                  onClick={addLineItem}
                  className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors duration-200"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              {/* Table header (desktop) */}
              <div className="hidden sm:grid grid-cols-[1fr_70px_100px_100px_36px] gap-3 px-1 text-[0.6875rem] font-bold uppercase tracking-wide text-[#9ca3af]">
                <span>Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price (₹, incl. GST)</span>
                <span className="text-right">Amount</span>
                <span />
              </div>

              <div className="flex flex-col gap-3">
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_70px_100px_100px_36px] gap-3 items-center bg-[#f7f9f8] sm:bg-transparent rounded-xl sm:rounded-none p-3 sm:p-0 border border-gray-100 sm:border-0"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateLineItem(item.id, "name", e.target.value)}
                      placeholder="e.g. Haircut & Style"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-[#022525] font-medium outline-none transition-all focus:border-[#0d9488] focus:ring-4 focus:ring-[#0d9488]/10"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateLineItem(item.id, "qty", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-center text-[#022525] font-semibold outline-none transition-all focus:border-[#0d9488] focus:ring-4 focus:ring-[#0d9488]/10"
                    />
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateLineItem(item.id, "price", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-right text-[#022525] font-semibold outline-none transition-all focus:border-[#0d9488] focus:ring-4 focus:ring-[#0d9488]/10"
                    />
                    <div className="text-right text-sm font-extrabold text-[#022525] px-1">
                      ₹{((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString("en-IN")}
                    </div>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="justify-self-end sm:justify-self-center w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {lineItems.length === 0 && (
                  <div className="flex flex-col items-center text-center gap-2 py-8">
                    <Package size={22} className="text-gray-300" />
                    <p className="text-sm text-gray-400">No items added yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Discount Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#f0fdfa] border border-[#99f6e4] flex items-center justify-center">
                  <Tag size={16} className="text-[#0d9488]" />
                </div>
                <h2 className="text-base font-bold text-[#022525]">Discount</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex bg-[#f7f9f8] border border-gray-100 rounded-xl p-1">
                  {["flat", "percent"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setDiscountType(type)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        discountType === type
                          ? "bg-white text-[#022525] shadow-sm"
                          : "text-[#5b6b68] hover:text-[#022525]"
                      }`}
                    >
                      {type === "flat" ? "₹ Flat" : "% Percent"}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[140px]">
                  {discountType === "percent" ? (
                    <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                  )}
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#f7f9f8] text-sm text-[#022525] font-semibold outline-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#0d9488]/10"
                  />
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#f0fdfa] border border-[#99f6e4] flex items-center justify-center">
                  <StickyNote size={16} className="text-[#0d9488]" />
                </div>
                <h2 className="text-base font-bold text-[#022525]">Notes (Optional)</h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any additional notes for this invoice..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f7f9f8] text-sm text-[#022525] outline-none resize-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#0d9488]/10"
              />
            </div>
          </div>

          {/* ============ RIGHT: Sticky summary ============ */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#f0fdfa] border border-[#99f6e4] flex items-center justify-center">
                  <Receipt size={16} className="text-[#0d9488]" />
                </div>
                <h2 className="text-base font-bold text-[#022525]">Invoice Summary</h2>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between text-[#5b6b68]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#022525]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-[#5b6b68]">
                  <span>Discount</span>
                  <span className="font-semibold text-red-500">
                    − ₹{discountAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between text-[#5b6b68]">
                  <span>Taxable Amount</span>
                  <span className="font-semibold text-[#022525]">₹{taxableAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-[#5b6b68]">
                  <span>GST ({gstRate}%)</span>
                  <span className="font-semibold text-[#022525]">₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-bold text-[#022525]">Total Payable</span>
                  <span className="text-xl font-extrabold text-[#0d9488]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGenerateInvoice}
                disabled={generating}
                className="inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {generating ? (
                  "Generating..."
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Generate Invoice
                  </>
                )}
              </button>

              <p className="text-[0.6875rem] text-center text-[#9ca3af] leading-relaxed">
                Prices already include GST — customer paid this amount at booking. Once generated, the invoice number and QR code cannot be edited.
              </p>
            </div>

            {/* Customer info mini card */}
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-5 flex flex-col gap-2.5">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[#0f766e]">Billed To</p>
              <p className="text-sm font-bold text-[#022525]">{booking.customer?.name}</p>
              <p className="text-xs text-[#5b6b68]">{booking.customer?.phone}</p>
              <p className="text-xs text-[#5b6b68] mt-1">{booking.salon?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerate;
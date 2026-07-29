import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyInvoiceByCode } from "../../api/invoice.api";
import Loader from "../../components/common/Loader";
import { CheckCircle2, XCircle, Scissors, Calendar, User, MapPin } from "lucide-react";

const VerifyInvoice = () => {
  const { invoiceNumber } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await verifyInvoiceByCode(invoiceNumber);
        setInvoice(data.invoice);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceNumber]);

  if (loading) return <Loader message="Verifying invoice..." />;

  return (
    <div className="min-h-screen bg-[#f7f9f8] flex items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e] px-8 py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
            <Scissors size={22} className="text-[#5eead4]" />
          </div>
          <h1 className="text-xl font-extrabold text-white">EzyCut</h1>
          <p className="text-white/60 text-xs mt-1">Invoice Verification</p>
        </div>

        <div className="p-8">
          {notFound ? (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <XCircle size={26} className="text-rose-500" />
              </div>
              <h2 className="text-lg font-bold text-[#022525]">Invoice Not Found</h2>
              <p className="text-sm text-[#5b6b68]">
                No invoice matches code <span className="font-mono font-semibold">{invoiceNumber}</span>.
                This invoice may not exist or has been removed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={26} className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-[#022525]">Valid Invoice</h2>
                <p className="text-xs text-[#9ca3af]">
                  This invoice has been verified against EzyCut's records
                </p>
              </div>

              <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-wide">Invoice #</span>
                  <span className="font-mono font-bold text-[#022525] text-sm">{invoice.invoiceNumber}</span>
                </div>
                <div className="h-px bg-[#ccfbf1]" />
                <div className="flex items-center gap-2">
                  <Scissors size={13} className="text-[#0d9488] shrink-0" />
                  <span className="text-sm font-semibold text-[#022525]">{invoice.salonName}</span>
                </div>
                {invoice.salonCity && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-[#9ca3af] shrink-0" />
                    <span className="text-sm text-[#5b6b68]">{invoice.salonCity}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User size={13} className="text-[#9ca3af] shrink-0" />
                  <span className="text-sm text-[#5b6b68]">{invoice.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-[#9ca3af] shrink-0" />
                  <span className="text-sm text-[#5b6b68]">
                    {new Date(invoice.raisedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="h-px bg-[#ccfbf1]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#022525]">Total Amount</span>
                  <span className="text-xl font-extrabold text-[#0d9488]">
                    ₹{invoice.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <p className="text-[0.6875rem] text-center text-[#9ca3af] leading-relaxed">
                Verified via EzyCut Solutions Private Limited's invoice registry.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyInvoice;
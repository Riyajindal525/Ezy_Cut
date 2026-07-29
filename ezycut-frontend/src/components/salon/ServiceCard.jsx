import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, IndianRupee, Tag, ArrowRight, BellRing, BellOff, Sparkles } from "lucide-react";
import { subscribeToOpenReminder } from "../../api/salon.api";
import toast from "../../utils/toast";

const ServiceCard = ({ service, salon }) => {
  const navigate = useNavigate();
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const salonClosed = salon?.isOpen === false;

  const handleBookNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { redirectTo: `/booking/${service._id}` } });
      return;
    }
    navigate(`/booking/${service._id}`);
  };

  const handleNotifyMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { redirectTo: window.location.pathname } });
      return;
    }
    setNotifyLoading(true);
    try {
      await subscribeToOpenReminder(salon._id);
      setSubscribed(true);
      toast.success("We'll email you when they open! 🔔");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to set reminder.");
    } finally {
      setNotifyLoading(false);
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200/80 rounded-2xl p-6 transition-all duration-300 hover:border-[#0d9488]/40 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,118,110,0.14)]">
      {/* Top accent line on hover */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#0d9488] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />

      {/* Header: category + optional highlight icon */}
      <div className="flex items-center justify-between mb-4">
        {service.category ? (
          <div className="inline-flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-[#0f766e] bg-[#ccfbf1] px-2.5 py-1 rounded-full">
            <Tag size={10} strokeWidth={2.5} />
            {service.category}
          </div>
        ) : <span />}
        <Sparkles size={16} className="text-gray-300 group-hover:text-[#0d9488] transition-colors duration-300" />
      </div>

      {/* Title + description */}
      <h3 className="text-[1.125rem] font-bold text-[#042f2e] mb-1.5 tracking-tight">
        {service.name}
      </h3>

      {service.description && (
        <p className="text-[0.8125rem] text-[#6b7280] leading-relaxed mb-5 line-clamp-2">
          {service.description}
        </p>
      )}

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-4" />

      {/* Price + duration row, price in its own subtle box */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 bg-[#f0fdfa] px-3 py-1.5 rounded-lg">
          <IndianRupee size={15} className="text-[#0d9488]" strokeWidth={2.5} />
          <span className="text-[1.125rem] font-extrabold text-[#134e4a]">{service.price}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6b7280] text-[0.8125rem] font-medium">
          <Clock size={14} />
          {service.duration} mins
        </div>
      </div>

      {service.isActive === false && (
        <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-[0.8125rem] text-red-600 font-semibold text-center mb-3">
          Currently unavailable
        </div>
      )}

      {/* Salon closed — show Notify Me instead of Book Now */}
      {salonClosed ? (
        <button
          onClick={handleNotifyMe}
          disabled={notifyLoading || subscribed}
          className={`flex items-center justify-center gap-2.5 w-full font-semibold text-sm py-2.5 rounded-lg border transition-all duration-300 ${
            subscribed
              ? "bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4] cursor-default"
              : "bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#374151] border-gray-200 hover:border-gray-300 disabled:opacity-60"
          }`}
        >
          {subscribed ? (
            <>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ccfbf1]">
                <BellRing size={11} className="text-[#0f766e]" />
              </span>
              We'll notify you
            </>
          ) : notifyLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Setting reminder...
            </>
          ) : (
            <>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                <BellOff size={11} className="text-gray-500" />
              </span>
              Notify me when open
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleBookNow}
          disabled={service.isActive === false}
          className="relative overflow-hidden flex items-center justify-center gap-2 w-full bg-[#0f766e] hover:bg-[#0d5e58] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(15,118,110,0.3)]"
        >
          Book now
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};

export default ServiceCard;
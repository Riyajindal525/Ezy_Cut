import { useNavigate } from "react-router-dom";
import { Clock, IndianRupee, Tag, ArrowRight } from "lucide-react";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { redirectTo: `/booking/${service._id}` } });
      return;
    }
    navigate(`/booking/${service._id}`);
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:border-[#0d9488]/40 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,118,110,0.12)]">
      {service.category && (
        <div className="inline-flex items-center gap-1 text-[0.6875rem] font-bold uppercase tracking-wide text-[#0f766e] bg-[#ccfbf1] px-2 py-1 rounded-full mb-3">
          <Tag size={10} />
          {service.category}
        </div>
      )}

      <h3 className="text-[1.0625rem] font-bold text-[#042f2e] mb-2">{service.name}</h3>

      {service.description && (
        <p className="text-sm text-[#6b7280] leading-relaxed mb-4">{service.description}</p>
      )}

      <div className="flex gap-4 mb-5">
        <div className="flex items-center gap-1.5 text-[#134e4a] font-bold">
          <IndianRupee size={14} className="text-[#0d9488]" />
          <span className="text-lg">{service.price}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6b7280] text-sm">
          <Clock size={13} />
          {service.duration} mins
        </div>
      </div>

      {service.isActive === false && (
        <div className="p-2 bg-red-50 rounded-lg text-[0.8125rem] text-red-600 font-semibold text-center mb-3">
          Currently Unavailable
        </div>
      )}

      <button
        onClick={handleBookNow}
        disabled={service.isActive === false}
        className="flex items-center justify-center gap-2 w-full bg-[#0f766e] hover:bg-[#0d5e58] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-[0_6px_18px_rgba(15,118,110,0.25)]"
      >
        Book Now
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
};

export default ServiceCard;
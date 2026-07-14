import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight, Clock, Scissors } from "lucide-react";

const SalonCard = ({ salon }) => {
  const imageUrl = salon.images?.[0];

  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#0d9488]/40 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(15,118,110,0.15)]">
      <div className="relative h-40 overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={salon.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#ccfbf1] via-[#f0fdfa] to-white flex items-center justify-center overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`dots-${salon._id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.4" fill="#0d9488" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#dots-${salon._id})`} />
            </svg>
            <div className="relative w-14 h-14 rounded-xl bg-white border border-[#99f6e4] shadow-sm flex items-center justify-center">
              <Scissors size={22} className="text-[#0f766e]" />
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/45 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1 text-xs font-bold text-white">
          <Star size={12} fill="#fbbf24" className="text-[#fbbf24]" />
          {salon.rating || "New"}
        </div>

        {!salon.totalReviews && (
          <div className="absolute top-3 left-3 bg-[#0f766e] text-white text-[0.65rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
            New
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-[1.0625rem] font-bold text-[#042f2e] mb-1.5 truncate">{salon.name}</h2>

        <div className="flex items-center gap-1.5 text-[#6b7280] text-[0.8125rem] mb-4">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{salon.address}, {salon.city}</span>
        </div>

        <div className="flex gap-2.5 mb-4">
          <div className="flex-1 bg-[#f0fdfa] border border-[#ccfbf1] rounded-lg py-2 text-center">
            <div className="text-[0.65rem] text-[#0d9488] font-semibold uppercase tracking-wide">Reviews</div>
            <div className="text-sm font-bold text-[#134e4a] mt-0.5">{salon.totalReviews || 0}</div>
          </div>
          <div className="flex-1 bg-[#f0fdfa] border border-[#ccfbf1] rounded-lg py-2 text-center">
            <div className="text-[0.65rem] text-[#0d9488] font-semibold uppercase tracking-wide flex items-center justify-center gap-1">
              <Clock size={9} /> Hours
            </div>
            <div className="text-[0.7rem] font-bold text-[#134e4a] mt-0.5">
              {salon.openingTime}–{salon.closingTime}
            </div>
          </div>
        </div>

        <Link
          to={`/salons/${salon._id}`}
          className="flex items-center justify-center gap-2 w-full bg-[#0f766e] hover:bg-[#0d5e58] text-white font-bold text-sm py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-[0_6px_18px_rgba(15,118,110,0.3)]"
        >
          View Details
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default SalonCard;
import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight, Clock, Scissors, Sparkles, Navigation, Flame, Zap } from "lucide-react";

const getRelativeTime = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return null;
};

const SalonCard = ({ salon, distance }) => {
  const imageUrl = salon.images?.[0];
  const isOpen = salon.isOpen !== false;
  const isTrending = (salon.recentBookingCount || 0) >= 5;
  const lastBookedLabel = salon.lastBookedAt ? getRelativeTime(salon.lastBookedAt) : null;

  return (
    <Link
      to={`/salons/${salon._id}`}
      className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl sm:rounded-[1.5rem] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-16px_rgba(15,118,110,0.25)] shadow-[0_2px_12px_rgba(4,47,46,0.05)]"
    >
      {/* ===== Image ===== */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#f0fdfa]">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={salon.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#ccfbf1] via-[#f0fdfa] to-white flex items-center justify-center overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`dots-${salon._id}`} width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#0d9488" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#dots-${salon._id})`} />
            </svg>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[#99f6e4] shadow-md flex items-center justify-center">
              <Scissors size={26} className="text-[#0f766e]" />
            </div>
          </div>
        )}

   {/* Status ribbon — folded corner tag, top-left, flush with card corner */}
<div className="absolute top-0 left-0 z-10 overflow-hidden w-24 h-24 pointer-events-none">
  <div
    className={`absolute top-[14px] -left-[38px] w-[150px] py-1 -rotate-45 text-center shadow-[0_2px_6px_rgba(0,0,0,0.22)] ${
      isOpen ? "bg-[#0f766e]" : "bg-[#292524]"
    }`}
  >
    <span className="text-white text-[0.6rem] font-bold tracking-widest uppercase flex items-center justify-center gap-1">
      {isOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />}
      {isOpen ? "Open" : "Closed"}
    </span>
  </div>
</div>

        {/* Trending badge OR New badge — top right (mutually exclusive) */}
        {isTrending ? (
          <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 inline-flex items-center gap-1 bg-rose-500/90 backdrop-blur-md text-white text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
            <Flame size={10} />
            Trending
          </span>
        ) : (
          !salon.totalReviews && (
            <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 inline-flex items-center gap-1 bg-white/90 backdrop-blur-md text-[#0f766e] text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              <Sparkles size={10} />
              New
            </span>
          )
        )}

        {/* Rating pill — bottom right of image */}
        <div className="absolute bottom-3 right-3 sm:right-4 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1 shadow-sm">
          <Star size={11} fill="#f59e0b" className="text-[#f59e0b]" />
          <span className="text-xs font-extrabold text-[#022525]">{salon.rating || "—"}</span>
        </div>

        {/* Distance badge — bottom left of image, only when nearby search active */}
        {distance !== null && distance !== undefined && (
          <div className="absolute bottom-3 left-3 sm:left-4 z-10 flex items-center gap-1 bg-[#022525]/80 backdrop-blur-md rounded-full px-2.5 py-1 shadow-sm">
            <Navigation size={10} className="text-[#5eead4]" />
            <span className="text-[0.7rem] font-bold text-white">
              {distance < 1 ? `${Math.round(distance * 1000)} m away` : `${distance.toFixed(1)} km away`}
            </span>
          </div>
        )}
      </div>

      {/* ===== Body ===== */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Name + address */}
        <h2 className="font-['Outfit'] text-[1.05rem] sm:text-[1.15rem] font-bold text-[#042f2e] leading-tight truncate mb-1.5">
          {salon.name}
        </h2>
        <div className="flex items-start gap-1.5 text-[#6b7280] text-[0.75rem] sm:text-[0.8125rem] mb-3.5">
          <MapPin size={13} className="shrink-0 text-[#0d9488] mt-0.5" />
          <span className="line-clamp-1">{salon.address}, {salon.city}</span>
        </div>

        {/* Top service chip */}
        {salon.topServiceName && (
          <div className="inline-flex items-center gap-1 self-start bg-amber-50 border border-amber-100 text-amber-700 text-[0.65rem] sm:text-[0.7rem] font-semibold px-2 py-0.5 rounded-full mb-3.5">
            <Zap size={10} />
            Popular: {salon.topServiceName}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-3.5" />

        {/* Stat row — quieter than before, less "gradient card" heavy */}
        <div className="flex items-center justify-between text-[0.75rem] mb-4">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-amber-400" fill="#f59e0b" />
            <span className="font-bold text-[#134e4a]">{salon.totalReviews || 0}</span>
            <span className="text-gray-400">reviews</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock size={12} />
            <span className="font-medium">{salon.openingTime}–{salon.closingTime}</span>
          </div>
        </div>

        {/* Last booked social proof */}
        {lastBookedLabel && (
          <p className="text-[0.7rem] text-gray-400 font-medium mb-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            Last booked {lastBookedLabel}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between gap-2 bg-[#022525] group-hover:bg-[#0f766e] text-white font-semibold text-[0.8125rem] sm:text-sm py-3 px-4 sm:px-5 rounded-xl transition-all duration-400 group-hover:shadow-[0_10px_24px_-6px_rgba(15,118,110,0.45)]">
          <span>View details</span>
          <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-400 group-hover:translate-x-1 group-hover:bg-white/25">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SalonCard;
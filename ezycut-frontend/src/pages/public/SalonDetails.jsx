import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ArrowLeft,
  Scissors,
  Sparkles,
  Navigation,
  BadgeCheck,
  Users,
} from "lucide-react";
import { getSalonById } from "../../api/salon.api";
import { getServicesBySalon } from "../../api/service.api";
import { getSalonReviews } from "../../api/review.api";
import ServiceCard from "../../components/salon/ServiceCard";
import ReviewSection from "../../components/review/ReviewSection";
import Loader from "../../components/common/Loader";

const SalonDetails = () => {
  const { id } = useParams();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salonData, serviceData, reviewData] = await Promise.all([
          getSalonById(id),
          getServicesBySalon(id),
          getSalonReviews(id),
        ]);
        setSalon(salonData.salon);
        setServices(serviceData.services);
        setReviews(reviewData.reviews);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loader message="Loading salon details..." />;

  if (!salon) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white pt-24">
        <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
          <Scissors size={26} className="text-[#0d9488]" />
        </div>
        <h2 className="text-2xl font-bold text-[#374151]">Salon Not Found</h2>
        <p className="text-sm text-[#6b7280] -mt-2">
          This salon may have been removed or the link is incorrect.
        </p>
        <Link
          to="/salons"
          className="inline-flex items-center gap-1.5 border border-gray-200 text-[#134e4a] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#f0fdfa] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Salons
        </Link>
      </div>
    );
  }

  const images = salon.images?.length ? salon.images : [];
  const hasImages = images.length > 0;

  const avgServicePrice =
    services.length > 0
      ? Math.round(services.reduce((s, sv) => s + (sv.price || 0), 0) / services.length)
      : null;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-white pt-24 md:pt-28 pb-16">
      <div className="page-container">
        {/* Back link */}
        <Link
          to="/salons"
          className="inline-flex items-center gap-1.5 border border-gray-200 text-[#134e4a] text-sm font-semibold px-3.5 py-2 rounded-lg mb-6 hover:bg-[#f0fdfa] hover:border-[#0d9488]/30 transition-all duration-200 animate-[ezcFadeUp_0.4s_ease_forwards]"
        >
          <ArrowLeft size={14} />
          Back to Salons
        </Link>

        {/* ================= GALLERY ================= */}
        <div
          className="mb-6 animate-[ezcFadeUp_0.5s_ease_forwards]"
          style={{ opacity: 0 }}
        >
          <div className="w-full h-[300px] md:h-[380px] rounded-2xl overflow-hidden relative border border-gray-200 bg-[#f0fdfa] shadow-[0_8px_30px_rgba(13,148,136,0.08)]">
            {hasImages ? (
              <>
                <img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={`${salon.name} photo ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                  style={{ animation: "ezcKenBurns 8s ease-out forwards" }}
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {activeImage + 1} / {images.length}
                </div>
              </>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#f0fdfa] via-white to-[#ccfbf1] overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.6" fill="#0d9488" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
                <div className="relative w-16 h-16 rounded-2xl bg-white border border-[#99f6e4] shadow-sm flex items-center justify-center">
                  <Scissors size={26} className="text-[#0d9488]" />
                </div>
                <p className="relative text-sm font-semibold text-[#134e4a]">No photos uploaded yet</p>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`shrink-0 w-[88px] h-[64px] rounded-lg overflow-hidden p-0 transition-all duration-200 ${
                    idx === activeImage
                      ? "border-2 border-[#0d9488] opacity-100 scale-[1.03]"
                      : "border-2 border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <img src={img} alt={`${salon.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= HERO BANNER ================= */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 md:p-10 mb-6 bg-gradient-to-br from-[#0f766e] to-[#042f2e] border border-[#0d9488]/20 shadow-[0_10px_40px_rgba(4,47,46,0.25)] animate-[ezcFadeUp_0.5s_ease_forwards]"
          style={{ animationDelay: "100ms", opacity: 0 }}
        >
          <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.2)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.12)_0%,transparent_70%)] pointer-events-none" />
          <Sparkles size={18} className="absolute right-6 top-6 text-white/25" />

          <div className="relative flex items-start gap-5 flex-wrap">
            <div className="w-16 h-16 rounded-xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-extrabold text-white shrink-0 shadow-lg">
              {salon.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="font-['Outfit'] text-2xl md:text-3xl font-extrabold text-white tracking-[-0.02em]">
                  {salon.name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-[#ccfbf1]/15 border border-[#5eead4]/40 text-[#5eead4] text-[0.6875rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                  <BadgeCheck size={11} />
                  Verified
                </span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <div className="flex items-center gap-1.5 text-white/75 text-sm">
                  <MapPin size={14} className="shrink-0" />
                  {salon.address}, {salon.city}
                </div>
                {salon.phone && (
                  <div className="flex items-center gap-1.5 text-white/75 text-sm">
                    <Phone size={14} className="shrink-0" />
                    {salon.phone}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-white/75 text-sm">
                  <Clock size={14} className="shrink-0" />
                  {salon.openingTime} – {salon.closingTime}
                </div>
              </div>

              {salon.phone && (
                <div className="flex gap-2.5 mt-4">
                  <a
                    href={`tel:${salon.phone}`}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Phone size={13} />
                    Call Salon
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${salon.address}, ${salon.city}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Navigation size={13} />
                    Directions
                  </a>
                </div>
              )}
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-center min-w-[110px] shrink-0">
              <div className="flex items-center gap-1 justify-center mb-1 text-[#fbbf24]">
                <Star size={16} fill="currentColor" />
                <span className="text-xl font-extrabold text-white">{salon.rating || "—"}</span>
              </div>
              <div className="text-xs text-white/60 font-semibold">{salon.totalReviews || 0} reviews</div>
            </div>
          </div>
        </div>

        {/* ================= QUICK STATS ROW ================= */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 animate-[ezcFadeUp_0.5s_ease_forwards]"
          style={{ animationDelay: "140ms", opacity: 0 }}
        >
          <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#99f6e4] flex items-center justify-center shrink-0">
              <Scissors size={16} className="text-[#0d9488]" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-[#022525] leading-none">{services.length}</div>
              <div className="text-[0.6875rem] font-semibold text-[#5b6b68] uppercase tracking-wide mt-0.5">
                Services
              </div>
            </div>
          </div>

          <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#99f6e4] flex items-center justify-center shrink-0">
              <Star size={16} className="text-[#0d9488]" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-[#022525] leading-none">{salon.rating || "—"}</div>
              <div className="text-[0.6875rem] font-semibold text-[#5b6b68] uppercase tracking-wide mt-0.5">
                Rating
              </div>
            </div>
          </div>

          <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#99f6e4] flex items-center justify-center shrink-0">
              <Users size={16} className="text-[#0d9488]" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-[#022525] leading-none">{salon.totalReviews || 0}</div>
              <div className="text-[0.6875rem] font-semibold text-[#5b6b68] uppercase tracking-wide mt-0.5">
                Reviews
              </div>
            </div>
          </div>

          <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-[#99f6e4] flex items-center justify-center shrink-0">
              <Clock size={16} className="text-[#0d9488]" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-[#022525] leading-none truncate">
                {avgServicePrice ? `₹${avgServicePrice}` : "—"}
              </div>
              <div className="text-[0.6875rem] font-semibold text-[#5b6b68] uppercase tracking-wide mt-0.5">
                Avg. Price
              </div>
            </div>
          </div>
        </div>

        {/* ================= SERVICES ================= */}
        <div
          className="mb-10 animate-[ezcFadeUp_0.5s_ease_forwards]"
          style={{ animationDelay: "180ms", opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[#022525] text-2xl md:text-3xl font-extrabold tracking-[-0.01em]">Services</h2>
              <span className="bg-[#ccfbf1] text-[#0f766e] text-xs font-bold px-2.5 py-1 rounded-full">
                {services.length}
              </span>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-10 text-center">
              <Scissors size={28} className="text-[#5eead4] mx-auto mb-3" />
              <p className="text-[#134e4a] font-semibold">No services registered yet</p>
              <p className="text-[#5b6b68] text-sm mt-1">Check back soon — this salon is setting up its menu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {services.map((service, i) => (
                <div
                  key={service._id}
                  className="animate-[ezcFadeUp_0.4s_ease_forwards] transition-transform duration-200 hover:-translate-y-1"
                  style={{ animationDelay: `${Math.min(i * 60, 300)}ms`, opacity: 0 }}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= REVIEWS ================= */}
        <div className="animate-[ezcFadeUp_0.5s_ease_forwards]" style={{ animationDelay: "220ms", opacity: 0 }}>
          <ReviewSection reviews={reviews} salonId={id} />
        </div>
      </div>
    </div>
  );
};

export default SalonDetails;
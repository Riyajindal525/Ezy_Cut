import { useEffect, useState } from "react";
import { Search, MapPin, Sparkles, X, SlidersHorizontal } from "lucide-react";
import { getNearbySalons } from "../../api/salon.api";
import useSalonStore from "../../store/salon.store";
import SalonCard from "../../components/salon/SalonCard";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import toast from "../../utils/toast";

const Salons = () => {
  const fetchSalonsFromStore = useSalonStore((state) => state.fetchSalons);

  const [salons, setSalons] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [useNearby, setUseNearby] = useState(false);
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchSalons = async (locationSearch = false, latitude = null, longitude = null, searchRadius = 5000) => {
    setLoading(true);
    try {
      if (locationSearch && latitude && longitude) {
        const data = await getNearbySalons(longitude, latitude, searchRadius);
        const approved = data.salons.filter((s) => s.isApproved);
        setSalons(approved);
        setFiltered(approved);
      } else {
        const storeSalons = await fetchSalonsFromStore();
        const approved = storeSalons.filter((s) => s.isApproved);
        setSalons(approved);
        setFiltered(approved);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load salons list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleToggleNearby = () => {
    if (useNearby) {
      setUseNearby(false);
      setCoords(null);
      fetchSalons(false);
    } else {
      setGeoLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            setCoords({ latitude, longitude });
            setUseNearby(true);
            toast.success("Location captured successfully!");
            fetchSalons(true, latitude, longitude, radius);
            setGeoLoading(false);
          },
          (err) => {
            console.error(err);
            toast.error("Location lookup failed. Listing all salons.");
            setGeoLoading(false);
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
        setGeoLoading(false);
      }
    }
  };

  const handleRadiusChange = (e) => {
    const val = Number(e.target.value);
    setRadius(val);
    if (useNearby && coords) {
      fetchSalons(true, coords.latitude, coords.longitude, val);
    }
  };

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(salons);
    } else {
      setFiltered(
        salons.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.city?.toLowerCase().includes(q) ||
            s.address?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, salons]);

  if (loading) return <Loader message="Fetching salons..." />;

  const radiusLabel = { 1000: "1 km", 5000: "5 km", 10000: "10 km", 25000: "25 km" }[radius];

  return (
    <div className="min-h-[calc(100vh-68px)] bg-white pb-16">
    {/* ===== Hero header ===== */}
<div className="relative overflow-hidden bg-gradient-to-b from-[#f0fdfa] to-white border-b border-[#ccfbf1] pt-24 pb-10 md:pt-28 md:pb-12">
  <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.14)_0%,transparent_70%)] pointer-events-none" />
  <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.08)_0%,transparent_70%)] pointer-events-none" />

  <div className="page-container relative">
    <h1
      className="font-['Outfit'] text-[clamp(1.875rem,3.8vw,2.75rem)] font-extrabold text-[#042f2e] tracking-[-0.02em] mb-2 animate-[ezcFadeUp_0.6s_ease_forwards]"
      style={{ animationDelay: "80ms", opacity: 0 }}
    >
      Explore Salons
    </h1>
    <p
      className="text-[#5b6b68] text-[0.9375rem] md:text-base animate-[ezcFadeUp_0.6s_ease_forwards]"
      style={{ animationDelay: "150ms", opacity: 0 }}
    >
      <span className="font-bold text-[#0f766e]">{salons.length}</span> verified salon
      {salons.length !== 1 ? "s" : ""} available for booking near you
    </p>
  </div>
</div>

      <div className="page-container py-10">
        {/* ===== Filters row ===== */}
        <div
          className="flex flex-wrap items-center gap-3 mb-6 animate-[ezcFadeUp_0.6s_ease_forwards]"
          style={{ animationDelay: "220ms", opacity: 0 }}
        >
          <div className="flex-1 min-w-[260px] max-w-[480px] relative group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none transition-colors duration-200 group-focus-within:text-[#0d9488]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city or address..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none transition-all duration-200 focus:border-[#0d9488] focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors duration-150"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleNearby}
            disabled={geoLoading}
            className={`h-[42px] inline-flex items-center gap-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
              useNearby
                ? "bg-[#0f766e] text-white shadow-[0_6px_18px_rgba(15,118,110,0.3)]"
                : "bg-white border border-gray-200 text-[#134e4a] hover:border-[#0d9488]/40 hover:bg-[#f0fdfa]"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {geoLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <MapPin size={15} className={useNearby ? "animate-none" : ""} />
                {useNearby ? "Showing Nearby Salons" : "Find Near Me"}
              </>
            )}
          </button>

          {useNearby && (
            <div className="h-[42px] flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 animate-[ezcFadeUp_0.35s_ease_forwards]">
              <SlidersHorizontal size={13} className="text-[#0d9488]" />
              <label className="text-[0.7rem] font-bold uppercase tracking-wide text-[#6b7280] whitespace-nowrap">
                Radius:
              </label>
              <select
                value={radius}
                onChange={handleRadiusChange}
                className="bg-transparent outline-none text-sm font-semibold text-[#134e4a] cursor-pointer"
              >
                <option value="1000">1 km</option>
                <option value="5000">5 km</option>
                <option value="10000">10 km</option>
                <option value="25000">25 km</option>
              </select>
            </div>
          )}
        </div>

        {/* ===== Active filter chips ===== */}
        {(useNearby || search) && (
          <div
            className="flex flex-wrap items-center gap-2 mb-8 animate-[ezcFadeUp_0.35s_ease_forwards]"
            style={{ opacity: 0 }}
          >
            <span className="text-xs font-semibold text-[#9ca3af]">Active filters:</span>
            {useNearby && (
              <span className="inline-flex items-center gap-1.5 bg-[#f0fdfa] border border-[#ccfbf1] text-[#0f766e] text-xs font-semibold px-2.5 py-1 rounded-full">
                <MapPin size={11} />
                Within {radiusLabel}
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-[#f0fdfa] border border-[#ccfbf1] text-[#0f766e] text-xs font-semibold px-2.5 py-1 rounded-full">
                <Search size={11} />"{search}"
              </span>
            )}
          </div>
        )}

        {/* ===== Result count ===== */}
        {filtered.length > 0 && (
          <div
            className="flex items-center justify-between mb-5 animate-[ezcFadeUp_0.4s_ease_forwards]"
            style={{ opacity: 0 }}
          >
            <p className="text-sm text-[#5b6b68]">
              Showing <span className="font-bold text-[#022525]">{filtered.length}</span> salon
              {filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* ===== Salon grid ===== */}
        {filtered.length === 0 ? (
          <div className="animate-[ezcFadeUp_0.4s_ease_forwards]" style={{ opacity: 0 }}>
            <EmptyState
              title="No salons found"
              description={
                search
                  ? `No results for "${search}". Try a different search.`
                  : "No approved salons are available right now."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {filtered.map((salon, i) => (
              <div
                key={salon._id}
                className="animate-[ezcFadeUp_0.5s_ease_forwards] transition-transform duration-300 hover:-translate-y-1.5"
                style={{ animationDelay: `${Math.min(i * 60, 480)}ms`, opacity: 0 }}
              >
                <SalonCard salon={salon} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Salons;
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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

  // Nearby Location States
  const [useNearby, setUseNearby] = useState(false);
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(5000); // 5km default
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchSalons = async (locationSearch = false, latitude = null, longitude = null, searchRadius = 5000) => {
    setLoading(true);
    try {
      if (locationSearch && latitude && longitude) {
        const data = await getNearbySalons(longitude, latitude, searchRadius);
        // Filter approved salons only
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

  return (
    <div style={{ minHeight: "calc(100vh - 68px)", padding: "2.5rem 0" }}>
      <div className="page-container">
        {/* Page Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="page-title">Explore Salons</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.375rem", fontSize: "0.9375rem" }}>
            {salons.length} verified salon{salons.length !== 1 ? "s" : ""} available for booking
          </p>
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem" }}>
          {/* Search bar */}
          <div style={{ flex: 1, minWidth: "260px", maxWidth: "480px" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{
                position: "absolute", left: "0.875rem", top: "50%",
                transform: "translateY(-50%)", color: "var(--gray-400)",
                pointerEvents: "none",
              }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city or address..."
                className="form-input"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          {/* Near Me Toggle Button */}
          <button
            type="button"
            onClick={handleToggleNearby}
            disabled={geoLoading}
            className={`btn ${useNearby ? "btn-primary" : "btn-outline"}`}
            style={{ height: "42px", gap: "0.5rem" }}
          >
            {geoLoading ? (
              <>
                <div className="spinner" style={{ width: "14px", height: "14px" }} />
                Locating...
              </>
            ) : (
              <>
                <span>📍</span>
                {useNearby ? "Showing Nearby Salons" : "Find Near Me"}
              </>
            )}
          </button>

          {/* Radius Selector */}
          {useNearby && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--gray-50)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--gray-200)", height: "42px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--gray-400)", whiteSpace: "nowrap" }}>Radius:</label>
              <select
                value={radius}
                onChange={handleRadiusChange}
                style={{ background: "transparent", border: "none", outline: "none", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", cursor: "pointer" }}
              >
                <option value="1000">1 km</option>
                <option value="5000">5 km</option>
                <option value="10000">10 km</option>
                <option value="25000">25 km</option>
              </select>
            </div>
          )}
        </div>

        {/* Salon Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No salons found"
            description={search ? `No results for "${search}". Try a different search.` : "No approved salons are available right now."}
          />
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}>
            {filtered.map((salon) => (
              <SalonCard key={salon._id} salon={salon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Salons;
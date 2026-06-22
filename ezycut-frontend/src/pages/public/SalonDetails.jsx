import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, Star, Clock, Phone, ArrowLeft } from "lucide-react";
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
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gray-700)" }}>Salon Not Found</h2>
        <Link to="/salons" className="btn btn-outline">← Back to Salons</Link>
      </div>
    );
  }

  const images = salon.images?.length ? salon.images : [];
  const hasImages = images.length > 0;

  return (
    <div style={{ minHeight: "calc(100vh - 68px)", padding: "2.5rem 0" }}>
      <div className="page-container">
        {/* Back button */}
        <Link
          to="/salons"
          className="btn btn-outline btn-sm"
          style={{ gap: "0.375rem", marginBottom: "1.5rem" }}
        >
          <ArrowLeft size={14} />
          Back to Salons
        </Link>

        {/* Salon Image Gallery */}
        {hasImages && (
          <div style={{ marginBottom: "1.5rem" }}>
            {/* Main image */}
            <div style={{
              width: "100%",
              height: "340px",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              position: "relative",
            }}>
              <img
                src={images[activeImage]}
                alt={`${salon.name} photo ${activeImage + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div style={{
                display: "flex",
                gap: "0.625rem",
                marginTop: "0.75rem",
                overflowX: "auto",
                paddingBottom: "0.25rem",
              }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    style={{
                      flexShrink: 0,
                      width: "84px",
                      height: "64px",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      padding: 0,
                      border: idx === activeImage
                        ? "2px solid var(--brand-accent)"
                        : "2px solid transparent",
                      opacity: idx === activeImage ? 1 : 0.6,
                      cursor: "pointer",
                      background: "none",
                      transition: "opacity 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <img
                      src={img}
                      alt={`${salon.name} thumbnail ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Salon Hero */}
        <div style={{
          background: "linear-gradient(135deg, var(--brand-primary) 0%, #312e81 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* BG decoration */}
          <div style={{
            position: "absolute", right: "-60px", top: "-60px",
            width: "240px", height: "240px",
            background: "rgba(99,102,241,0.2)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{
                width: "4rem", height: "4rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.75rem", fontWeight: 800, color: "white",
                flexShrink: 0,
              }}>
                {salon.name?.charAt(0)?.toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                  {salon.name}
                </h1>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    <MapPin size={14} />
                    {salon.address}, {salon.city}
                  </div>
                  {salon.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                      <Phone size={14} />
                      {salon.phone}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    <Clock size={14} />
                    {salon.openingTime} – {salon.closingTime}
                  </div>
                </div>
              </div>

              {/* Rating badge */}
              <div style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "var(--radius-lg)",
                padding: "0.875rem 1.25rem",
                textAlign: "center",
                minWidth: "100px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#fbbf24", justifyContent: "center", marginBottom: "0.25rem" }}>
                  <Star size={16} fill="currentColor" />
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "white" }}>{salon.rating || "—"}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                  {salon.totalReviews || 0} reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          {/* Services */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h2 className="section-title">
                Services ({services.length})
              </h2>
            </div>

            {services.length === 0 ? (
              <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--gray-500)" }}>
                No services registered yet.
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1rem",
              }}>
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <ReviewSection reviews={reviews} salonId={id} />
        </div>
      </div>
    </div>
  );
};

export default SalonDetails;
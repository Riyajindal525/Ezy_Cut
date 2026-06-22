import { useNavigate } from "react-router-dom";
import { Clock, IndianRupee, Tag, ArrowRight } from "lucide-react";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: { redirectTo: `/booking/${service._id}` },
      });
      return;
    }

    navigate(`/booking/${service._id}`);
  };

  return (
    <div className="card card-hover" style={{ padding: "1.5rem" }}>
      {/* Category tag */}
      {service.category && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.25rem",
          fontSize: "0.6875rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.05em",
          color: "var(--brand-accent)",
          background: "var(--brand-accent-light)",
          padding: "0.2rem 0.5rem",
          borderRadius: "var(--radius-full)",
          marginBottom: "0.75rem",
        }}>
          <Tag size={10} />
          {service.category}
        </div>
      )}

      <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: "0.5rem" }}>
        {service.name}
      </h3>

      {service.description && (
        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.6, marginBottom: "1rem" }}>
          {service.description}
        </p>
      )}

      {/* Price & Duration */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--gray-700)", fontWeight: 700 }}>
          <IndianRupee size={14} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: "1.125rem" }}>{service.price}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--gray-500)", fontSize: "0.875rem" }}>
          <Clock size={13} />
          {service.duration} mins
        </div>
      </div>

      {/* Active badge */}
      {service.isActive === false && (
        <div style={{
          padding: "0.5rem",
          background: "var(--danger-light)",
          borderRadius: "var(--radius)",
          fontSize: "0.8125rem",
          color: "#991b1b",
          fontWeight: 600,
          textAlign: "center",
          marginBottom: "0.75rem",
        }}>
          Currently Unavailable
        </div>
      )}

      <button
        onClick={handleBookNow}
        disabled={service.isActive === false}
        className="btn btn-primary btn-full"
        style={{ gap: "0.375rem" }}
      >
        Book Now
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default ServiceCard;
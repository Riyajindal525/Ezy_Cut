import { Star, MessageSquare } from "lucide-react";

const StarRow = ({ rating }) => {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          fill={n <= rating ? "#fbbf24" : "none"}
          style={{ color: n <= rating ? "#fbbf24" : "var(--gray-300)" }}
        />
      ))}
    </div>
  );
};

const ReviewSection = ({ reviews = [] }) => {
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h2 className="section-title">
            Customer Reviews
          </h2>
          {avgRating && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              background: "#fef9c3", borderRadius: "var(--radius-full)",
              padding: "0.25rem 0.625rem",
            }}>
              <Star size={13} fill="#ca8a04" style={{ color: "#ca8a04" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#92400e" }}>{avgRating}</span>
              <span style={{ fontSize: "0.75rem", color: "#a16207", fontWeight: 500 }}>({reviews.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
          <MessageSquare size={32} style={{ color: "var(--gray-300)", margin: "0 auto 0.75rem" }} />
          <p style={{ color: "var(--gray-500)", fontWeight: 600 }}>No reviews yet</p>
          <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Be the first to review this salon after your visit.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              className="card"
              style={{ padding: "1.25rem" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "2.25rem", height: "2.25rem",
                    borderRadius: "50%",
                    background: "var(--brand-primary)",
                    color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6875rem", fontWeight: 700, flexShrink: 0,
                  }}>
                    {review.customer?.name?.slice(0, 2).toUpperCase() || "C"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-800)" }}>
                      {review.customer?.name || "Customer"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                <StarRow rating={review.rating} />
              </div>

              {review.comment && (
                <p style={{ marginTop: "0.875rem", fontSize: "0.9rem", color: "var(--gray-600)", lineHeight: 1.65 }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
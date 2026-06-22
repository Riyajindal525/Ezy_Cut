import { useEffect, useState } from "react";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { getMyReviews } from "../../api/review.api";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import toast from "../../utils/toast";

const StarRow = ({ rating }) => (
  <div style={{ display: "flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={13} fill={n <= rating ? "#fbbf24" : "none"} style={{ color: n <= rating ? "#fbbf24" : "var(--gray-300)" }} />
    ))}
  </div>
);

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getMyReviews();
        setReviews(data.reviews);
      } catch (err) {
        toast.error("Failed to load reviews.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <Loader message="Loading your reviews..." />;

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="page-container">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="page-title">My Reviews</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} submitted
            {avgRating && ` · Average rating: ${avgRating} ⭐`}
          </p>
        </div>

        {/* Summary card */}
        {reviews.length > 0 && (
          <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--gray-800)", letterSpacing: "-0.03em" }}>{avgRating}</div>
              <StarRow rating={Math.round(parseFloat(avgRating))} />
              <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>Avg rating</div>
            </div>
            <div className="divider" style={{ width: "1px", height: "60px", margin: 0, background: "var(--gray-100)" }} />
            <div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gray-800)" }}>{reviews.length}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", fontWeight: 500 }}>Total reviews written</div>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="After completing a booking, you can share your experience with the salon."
            icon={MessageSquare}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((review) => (
              <div key={review._id} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)", marginBottom: "0.25rem" }}>
                      {review.salon?.name || "Salon"}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                      <Calendar size={12} />
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                </div>

                {review.comment && (
                  <p style={{ fontSize: "0.9rem", color: "var(--gray-600)", lineHeight: 1.7, borderLeft: "3px solid var(--brand-accent-light)", paddingLeft: "1rem" }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
import { useState } from "react";
import { Star, X } from "lucide-react";
import { createReview } from "../../api/review.api";
import toast from "../../utils/toast";

const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
        >
          <Star
            size={28}
            fill={n <= (hovered || value) ? "#fbbf24" : "none"}
            style={{
              color: n <= (hovered || value) ? "#fbbf24" : "var(--gray-300)",
              transition: "all 0.1s",
            }}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewModal = ({ bookingId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.warning("Please select a star rating.");
      return;
    }

    setLoading(true);
    try {
      await createReview({ bookingId, rating, comment });
      toast.success("Review submitted successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--gray-800)" }}>Write a Review</h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.125rem" }}>Share your experience with others</p>
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">Your Rating</label>
              <StarPicker value={rating} onChange={setRating} />
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
                {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Your Review (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                placeholder="Describe your experience — the service, ambiance, staff..."
                className="form-input form-textarea"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} /> Submitting...</> : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
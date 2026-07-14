import { useState } from "react";
import { Star, X } from "lucide-react";
import { createReview } from "../../api/review.api";
import toast from "../../utils/toast";

const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="bg-none border-none cursor-pointer p-1 transition-transform duration-150 hover:scale-110"
        >
          <Star
            size={28}
            fill={n <= (hovered || value) ? "#fbbf24" : "none"}
            className={n <= (hovered || value) ? "text-[#fbbf24]" : "text-gray-200"}
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
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-[0_25px_60px_rgba(15,118,110,0.2)] w-full max-w-[480px] max-h-[90vh] overflow-y-auto animate-[modalIn_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#042f2e]">Write a Review</h2>
            <p className="text-[0.8125rem] text-[#6b7280] mt-0.5">Share your experience with others</p>
          </div>
          <button
            className="p-2 border border-gray-200 rounded-lg text-[#134e4a] hover:bg-[#f0fdfa] transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[0.8125rem] font-semibold text-[#6b7280]">Your Rating</label>
              <StarPicker value={rating} onChange={setRating} />
              <span className="text-[0.8125rem] text-[#9ca3af]">
                {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.8125rem] font-semibold text-[#6b7280]">Your Review (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                placeholder="Describe your experience — the service, ambiance, staff..."
                className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#111827] placeholder:text-[#9ca3af] outline-none resize-y transition-all duration-200 focus:border-[#0d9488] focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="border border-gray-200 text-[#134e4a] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#f0fdfa] transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#0d5e58] disabled:opacity-60 text-white font-bold text-sm px-5 py-2 rounded-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
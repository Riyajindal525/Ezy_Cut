import { Star, MessageSquare } from "lucide-react";

const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={13} fill={n <= rating ? "#fbbf24" : "none"} className={n <= rating ? "text-[#fbbf24]" : "text-gray-200"} />
    ))}
  </div>
);

const ReviewSection = ({ reviews = [] }) => {
  const avgRating =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="section-title text-[#022525]">Customer Reviews</h2>
          {avgRating && (
            <div className="flex items-center gap-1.5 bg-[#ccfbf1] border border-[#5eead4] rounded-full px-3 py-1">
              <Star size={13} fill="#0f766e" className="text-[#0f766e]" />
              <span className="text-sm font-bold text-[#0f766e]">{avgRating}</span>
              <span className="text-xs text-[#5b6b68] font-medium">({reviews.length})</span>
            </div>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-10 text-center">
          <MessageSquare size={32} className="text-[#5eead4] mx-auto mb-3" />
          <p className="text-[#134e4a] font-semibold">No reviews yet</p>
          <p className="text-[#5b6b68] text-sm mt-1">Be the first to review this salon after your visit.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {reviews.map((review, i) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 transition-colors duration-300 hover:border-[#0d9488]/30 animate-[ezcFadeUp_0.4s_ease_forwards]"
              style={{ animationDelay: `${Math.min(i * 60, 300)}ms`, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0f766e] to-[#134e4a] text-white flex items-center justify-center text-[0.6875rem] font-extrabold shrink-0">
                    {review.customer?.name?.slice(0, 2).toUpperCase() || "C"}
                  </div>
                  <div>
                    <div className="font-bold text-[0.9375rem] text-[#042f2e]">{review.customer?.name || "Customer"}</div>
                    <div className="text-xs text-[#9ca3af]">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                <StarRow rating={review.rating} />
              </div>

              {review.comment && (
                <p className="mt-3.5 text-sm text-[#374151] leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
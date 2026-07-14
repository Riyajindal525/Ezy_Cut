import { useEffect, useState } from "react";
import { Star, MessageSquare, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { getMyReviews } from "../../api/review.api";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";

const StarRow = ({ rating, size = 13 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= rating ? "fill-amber-400 text-amber-400" : "fill-none text-gray-300"}
      />
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
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">My Reviews</h1>
          <p className="text-white/60 text-sm">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} submitted
            {avgRating && ` · Average rating ${avgRating}`}
          </p>
        </div>
      </div>

      {/* ============ MAIN CONTENT (overlaps hero bottom) ============ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 pb-12 flex flex-col gap-6">

        {/* Summary card */}
        {reviews.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#022525] to-[#0f766e] p-6 sm:p-8 flex items-center gap-6 sm:gap-10 flex-wrap shadow-lg">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.2)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative flex flex-col items-center gap-1.5">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
                {avgRating}
              </span>
              <StarRow rating={Math.round(parseFloat(avgRating))} size={15} />
              <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-white/50 mt-1">
                Avg Rating
              </span>
            </div>

            <div className="relative w-px h-16 bg-white/15 hidden sm:block" />

            <div className="relative flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white leading-none">
                {reviews.length}
              </span>
              <span className="text-sm font-semibold text-white/60">
                Total reviews written
              </span>
            </div>

            <div className="relative ml-auto hidden md:flex items-center gap-2 text-white/70 text-sm font-medium bg-white/10 border border-white/15 rounded-full px-4 py-2">
              <TrendingUp size={14} className="text-[#5eead4]" />
              Thanks for helping other customers choose better
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 sm:p-14">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
                <MessageSquare size={26} className="text-[#0d9488]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold text-[#022525]">No reviews yet</h3>
                <p className="text-[#5b6b68] text-sm max-w-sm">
                  After completing a booking, you can share your experience with the salon.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0d9488]/20 transition-all duration-200 p-5 sm:p-6"
              >
                <div className="flex justify-between items-start gap-3 flex-wrap mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-[#0d9488]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[0.9375rem] font-bold text-[#022525]">
                        {review.salon?.name || "Salon"}
                      </h2>
                      <div className="flex items-center gap-1.5 text-[0.8125rem] text-[#9ca3af] font-medium">
                        <Calendar size={12} />
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                </div>

                {review.comment && (
                  <p className="text-sm text-[#5b6b68] leading-relaxed border-l-[3px] border-[#ccfbf1] pl-4">
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
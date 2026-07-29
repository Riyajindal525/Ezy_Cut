const SalonCardSkeleton = () => {
  return (
    <div className="flex bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden shadow-[0_4px_20px_rgba(4,47,46,0.06)]">
      <div className="relative w-[42%] shrink-0 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="h-4 w-3/4 bg-gray-100 rounded-md relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
        <div className="h-3 w-1/2 bg-gray-100 rounded-md relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
        <div className="flex gap-2 mt-1">
          <div className="flex-1 h-12 bg-gray-100 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          <div className="flex-1 h-12 bg-gray-100 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
        <div className="mt-auto h-11 bg-gray-100 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default SalonCardSkeleton;
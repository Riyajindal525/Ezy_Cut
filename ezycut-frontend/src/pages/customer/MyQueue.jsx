import { useEffect, useState } from "react";
import { Clock, Hash, Timer, Key, Scissors, RefreshCw, Calendar, CheckCircle2 } from "lucide-react";
import { getMyQueue } from "../../api/queue.api";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";

const MyQueue = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchQueue = async (silent = false) => {
    try {
      const data = await getMyQueue();
      setQueues(data.queues || []);
      setLastUpdated(new Date());
    } catch (err) {
      if (!silent) toast.error("Failed to load queue status.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const interval = setInterval(() => fetchQueue(true), 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader message="Loading your queue status..." />;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-8 sm:pb-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
           
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">My Queue</h1>
            <p className="text-white/60 text-sm flex items-center gap-1.5 flex-wrap">
              <RefreshCw size={13} />
              Auto-refreshing every 15 seconds
              {lastUpdated && (
                <span>
                  &middot; Updated{" "}
                  {lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => fetchQueue()}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/[0.16] border border-white/15 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {queues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-4 py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center">
              <Clock size={26} className="text-[#0d9488]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold text-[#022525]">No active queue</h3>
              <p className="text-[#5b6b68] text-sm max-w-sm">
                You are not currently in any queue. Go to &quot;My Bookings&quot; and click &quot;Join
                Queue&quot; to check in.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {queues.map((queue, qi) => {
              const isInService = queue.status === "in_service";

              const stats = [
                { label: "Token #", value: `#${queue.tokenNumber}`, icon: Hash, accent: "text-[#0d9488]", bg: "bg-[#0d9488]/10" },
                { label: "Position", value: isInService ? "Serving" : queue.position, icon: Clock, accent: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Est. Wait", value: `${queue.estimatedWaitTime}m`, icon: Timer, accent: "text-amber-600", bg: "bg-amber-50" },
              ];

              return (
                <div
                  key={queue._id}
                  className="flex flex-col gap-5 animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0"
                  style={{ animationDelay: `${qi * 100}ms` }}
                >
                  {/* Status Banner */}
                  <div
                    className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg ${
                      isInService
                        ? "bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700"
                        : "bg-gradient-to-br from-[#031715] via-[#0f4d47] to-[#0f766e]"
                    }`}
                  >
                    <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/[0.06] pointer-events-none" />
                    <div className="absolute -bottom-16 -left-8 w-52 h-52 rounded-full bg-white/[0.04] pointer-events-none" />

                    <div className="relative flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold mb-1">{queue.salon?.name}</h2>
                        <p className="text-white/70 text-sm flex items-center gap-1.5">
                          <Scissors size={13} />
                          {queue.service?.name}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${
                          isInService
                            ? "bg-white/20 border border-white/30 text-white"
                            : "bg-amber-400/20 border border-amber-300/40 text-amber-200"
                        }`}
                      >
                        {isInService ? (
                          <>
                            <Scissors size={12} /> In Service
                          </>
                        ) : (
                          <>
                            <Clock size={12} className="animate-pulse" /> Waiting
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {stats.map(({ label, value, icon: Icon, accent, bg }, si) => (
                      <div
                        key={label}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm px-3 py-4 sm:p-5 flex flex-col items-center text-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0"
                        style={{ animationDelay: `${qi * 100 + si * 70 + 80}ms` }}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bg}`}>
                          <Icon size={16} className={accent} />
                        </div>
                        <div className={`text-xl sm:text-2xl font-extrabold ${accent}`}>{value}</div>
                        <div className="text-[0.7rem] font-bold uppercase tracking-wide text-gray-400">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Token Code + Booking Details */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0d9488]/10 flex items-center justify-center shrink-0">
                        <Key size={18} className="text-[#0d9488]" />
                      </div>
                      <div>
                        <div className="text-[0.7rem] font-bold uppercase tracking-wide text-gray-400 mb-0.5">
                          Token Code
                        </div>
                        <div className="font-mono text-lg font-extrabold text-[#022525] tracking-widest">
                          {queue.tokenCode}
                        </div>
                      </div>
                    </div>

                    {(queue.joinedAt || queue.booking?.bookingDate || queue.booking?.startTime) && (
                      <div className="mt-4 pt-4 border-t border-gray-100 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                        {queue.joinedAt && (
                          <div>
                            <div className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1">
                              Joined At
                            </div>
                            <div className="text-[0.8125rem] font-semibold text-[#5b6b68]">
                              {new Date(queue.joinedAt).toLocaleString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                          </div>
                        )}

                        {queue.booking?.bookingDate && (
                          <div>
                            <div className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1 flex items-center gap-1">
                              <Calendar size={11} />
                              Booking Date
                            </div>
                            <div className="text-[0.8125rem] font-semibold text-[#5b6b68]">
                              {new Date(queue.booking.bookingDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        )}

                        {queue.booking?.startTime && (
                          <div>
                            <div className="text-[0.65rem] font-bold uppercase tracking-wide text-gray-400 mb-1">
                              Appointment Time
                            </div>
                            <div className="text-[0.8125rem] font-semibold text-[#5b6b68]">
                              {queue.booking.startTime}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isInService && (
                    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5 text-emerald-800 font-semibold text-sm animate-[ezcFadeUp_0.5s_ease_forwards]">
                      <CheckCircle2 size={17} className="shrink-0" />
                      You are currently being served. Please stay at the salon.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQueue;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  Hash,
  Timer,
  Key,
  Scissors,
  ArrowLeft,
  RefreshCw,
  Radar,
  SearchX,
} from "lucide-react";
import { getQueueByToken } from "../../api/queue.api";
import Loader from "../../components/common/Loader";
import toast from "../../utils/toast";

const QueueTracker = () => {
  const { tokenCode: urlTokenCode } = useParams();
  const navigate = useNavigate();

  const [inputTokenCode, setInputTokenCode] = useState("");
  const [activeTokenCode, setActiveTokenCode] = useState(urlTokenCode || "");
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTokenStatus = async (token, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getQueueByToken(token);
      if (data.queue) {
        setQueue(data.queue);
        setLastUpdated(new Date());
      } else {
        toast.error("Invalid Token Code or queue completed.");
        setQueue(null);
      }
    } catch (err) {
      console.error(err);
      if (!silent) toast.error(err.response?.data?.message || "Failed to find this queue entry.");
      setQueue(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (urlTokenCode) {
      setActiveTokenCode(urlTokenCode);
      fetchTokenStatus(urlTokenCode);
    } else {
      setQueue(null);
      setActiveTokenCode("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTokenCode]);

  useEffect(() => {
    if (!activeTokenCode) return;

    // Polling status every 15 seconds in the background
    const interval = setInterval(() => {
      fetchTokenStatus(activeTokenCode, true);
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTokenCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const code = inputTokenCode.trim().toUpperCase();
    if (!code) return;
    navigate(`/track/${code}`);
  };

  const handleClear = () => {
    setInputTokenCode("");
    navigate("/track");
  };

  const isInService = queue?.status === "in_service";

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">
      <SEO
        title="Live Queue Tracker — Track Your Slot"
        description="Track your salon appointment queue position, estimated wait times, and status anonymously in real time using EzyCut queue tracking."
        canonical={activeTokenCode ? `https://www.ezycut.co.in/track/${activeTokenCode}` : "https://www.ezycut.co.in/track"}
      />
      {/* ============ DARK HERO STRIP ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-10 sm:pb-14 flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">Live Queue Status</h1>
          <p className="text-white/60 text-sm">Track salon waiting lines anonymously in real time</p>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Input Form if no queue details are loaded */}
        {!activeTokenCode && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8 animate-[ezcFadeUp_0.5s_ease_forwards]">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Enter Token Code
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={inputTokenCode}
                    onChange={(e) => setInputTokenCode(e.target.value)}
                    placeholder="e.g. EZ-ABCD1"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f7f9f8] text-[#022525] uppercase tracking-wide font-semibold text-sm outline-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#0d9488]/10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Search size={16} />
                Track Queue Status
              </button>
            </form>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && <Loader message="Searching token registry..." />}

        {/* Results view */}
        {!loading && activeTokenCode && queue && (
          <div className="flex flex-col gap-5">
            {/* Status Card Banner */}
            <div
              className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0 ${
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

            {/* Metrics Panel */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "Token #", value: `#${queue.tokenNumber}`, icon: Hash, accent: "text-[#0d9488]", bg: "bg-[#0d9488]/10" },
                { label: "Position", value: isInService ? "Serving" : queue.position, icon: Clock, accent: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Est. Wait", value: `${queue.estimatedWaitTime}m`, icon: Timer, accent: "text-amber-600", bg: "bg-amber-50" },
              ].map(({ label, value, icon: Icon, accent, bg }, si) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm px-3 py-4 sm:p-5 flex flex-col items-center text-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0"
                  style={{ animationDelay: `${si * 70 + 80}ms` }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bg}`}>
                    <Icon size={16} className={accent} />
                  </div>
                  <div className={`text-xl sm:text-2xl font-extrabold ${accent}`}>{value}</div>
                  <div className="text-[0.7rem] font-bold uppercase tracking-wide text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Refresh & Details Footer */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[0.7rem] font-bold uppercase tracking-wide text-gray-400 mb-0.5">
                  Token Code
                </div>
                <div className="font-mono text-lg font-extrabold text-[#022525] tracking-widest">
                  {activeTokenCode}
                </div>
              </div>

              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-[0.8125rem] text-gray-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0d9488] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0d9488]" />
                  </span>
                  Synced{" "}
                  {lastUpdated.toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0fdfa] text-[#022525] font-semibold text-sm py-3 rounded-xl border border-gray-200 hover:border-[#99f6e4] transition-all duration-200"
            >
              <ArrowLeft size={16} />
              Track Another Token
            </button>
          </div>
        )}

        {/* Token not found or cleared states */}
        {!loading && activeTokenCode && !queue && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-4 py-12 px-6 animate-[ezcFadeUp_0.5s_ease_forwards]">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <SearchX size={26} className="text-rose-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold text-[#022525]">Token Search Completed</h3>
              <p className="text-[#5b6b68] text-sm max-w-sm">
                No active queue entry found matching code &quot;{activeTokenCode}&quot;.
              </p>
            </div>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <ArrowLeft size={16} />
              Back to Tracker Input
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueTracker;
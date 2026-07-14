import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import useSalonStore from "../../store/salon.store";
import {
  getSalonQueue,
  startService,
  completeQueue,
  cancelQueue,
} from "../../api/queue.api";
import toast from "../../utils/toast";
import Loader from "../../components/common/Loader";
import { Clock, HelpCircle, Play, Check, Trash2, Users, Sparkles, ScanLine } from "lucide-react";

const OwnerQueue = () => {
  const user = useAuthStore((state) => state.user);
  const { activeSalonId, salons } = useSalonStore();
  const [salon, setSalon] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Queue Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetQueueId, setTargetQueueId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchSalonAndQueue = async (showLoader = false) => {
    if (!activeSalonId) {
      setLoading(false);
      return;
    }
    if (showLoader) setLoading(true);
    try {
      const activeSalon = salons.find((s) => s._id === activeSalonId);
      if (activeSalon) {
        setSalon(activeSalon);
        const queueResponse = await getSalonQueue(activeSalonId);
        setQueueItems(queueResponse.queue || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load active queue list.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonAndQueue(true);

    // Dynamic Polling every 10 seconds
    const interval = setInterval(() => {
      fetchSalonAndQueue(false);
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeSalonId, salons.length]);

  const handleQueueAction = async (queueId, actionFn, successMessage) => {
    try {
      await actionFn(queueId);
      toast.success(successMessage);
      fetchSalonAndQueue(false); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process queue action.");
    }
  };

  const triggerCancelQueue = (queueId) => {
    setTargetQueueId(queueId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancelQueue = async () => {
    if (!targetQueueId) return;
    setCancelLoading(true);
    try {
      await cancelQueue(targetQueueId);
      toast.success("Client entry removed from queue!");
      setCancelModalOpen(false);
      setTargetQueueId(null);
      fetchSalonAndQueue(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel queue entry.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Derived statistics
  const currentServing = queueItems.find((q) => q.status === "in_service");
  const waitingList = queueItems.filter((q) => q.status === "waiting");

  const fadeUp = (delayMs) => ({
    className: "opacity-0 animate-[ezcFadeUp_0.6s_ease_forwards]",
    style: { animationDelay: `${delayMs}ms` },
  });

  if (loading) {
    return <Loader message="Loading waitlist queue..." />;
  }

  if (salons.filter((s) => s.owner?._id === user?.id || s.owner === user?.id).length === 0) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white border border-gray-100 rounded-3xl shadow-sm p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center mx-auto mb-6">
          <Clock size={32} className="text-[#0d9488]" />
        </div>
        <h3 className="font-['Outfit'] text-2xl font-extrabold text-gray-800 mb-3">Salon Setup Required</h3>
        <p className="text-gray-500 text-[0.9375rem] leading-relaxed">
          You have not registered a salon profile yet. Please complete your salon setup first.
        </p>
        <div className="mt-8">
          <Link
            to="/owner/dashboard?register=true"
            className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md shadow-[#0d9488]/20 transition-colors"
          >
            Go to Onboarding Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div {...fadeUp(0)} className={`${fadeUp(0).className} flex items-center justify-between flex-wrap gap-3`}>
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-[1.75rem] font-extrabold text-[#042f2e] tracking-[-0.02em] flex items-center gap-2.5">
            Live Queue
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </h1>
          <p className="text-[#6b7280] text-sm mt-1">Real-time walk-in and appointment queue for your salon.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div
          {...fadeUp(60)}
          className={`${fadeUp(60).className} group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_14px_32px_rgba(15,118,110,0.1)] hover:-translate-y-1 hover:border-[#0d9488]/25 transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <span className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">Clients Waiting</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#f0fdfa] text-[#0d9488] group-hover:scale-110 transition-transform duration-300">
              <Users size={17} />
            </div>
          </div>
          <div className="relative">
            <h3 className="font-['Outfit'] text-4xl font-extrabold text-[#042f2e] tracking-tight">{waitingList.length}</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1.5">In line to be served</p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          {...fadeUp(120)}
          className={`${fadeUp(120).className} group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_14px_32px_rgba(2,132,199,0.1)] hover:-translate-y-1 hover:border-sky-200 transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(2,132,199,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <span className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">Currently Serving</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform duration-300">
              <Play size={16} />
            </div>
          </div>
          {currentServing ? (
            <div className="relative">
              <h3 className="font-['Outfit'] text-xl font-extrabold text-[#0d9488] truncate">{currentServing.customer?.name}</h3>
              <p className="text-xs font-semibold text-gray-400 mt-1.5">
                {currentServing.service?.name} (Token: #{currentServing.tokenNumber})
              </p>
            </div>
          ) : (
            <div className="relative">
              <h3 className="text-xl font-bold text-gray-300 italic">No Active Client</h3>
              <p className="text-xs font-semibold text-gray-400 mt-1.5">Start next client from list</p>
            </div>
          )}
        </div>

        {/* Card 3 */}
        <div
          {...fadeUp(180)}
          className={`${fadeUp(180).className} group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-[0_14px_32px_rgba(5,150,105,0.1)] hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 p-6 flex flex-col gap-4 overflow-hidden`}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <span className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider">Next In Line</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <Clock size={16} />
            </div>
          </div>
          {waitingList.length > 0 ? (
            <div className="relative">
              <h3 className="font-['Outfit'] text-xl font-extrabold text-[#042f2e] truncate">{waitingList[0].customer?.name}</h3>
              <p className="text-xs font-semibold text-gray-400 mt-1.5">Token: #{waitingList[0].tokenNumber}</p>
            </div>
          ) : (
            <div className="relative">
              <h3 className="text-xl font-bold text-gray-300 italic">No one in line</h3>
              <p className="text-xs font-semibold text-gray-400 mt-1.5">Queue is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Waitlist Table */}
      <div {...fadeUp(240)} className={`${fadeUp(240).className} bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap bg-gradient-to-r from-[#f7fdfc] to-white">
          <h3 className="font-['Outfit'] text-base font-bold text-[#042f2e] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center">
              <Clock size={16} />
            </span>
            Queue Waitlist — {salon?.name}
          </h3>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide bg-[#f7faf9] border border-gray-100 px-3 py-1.5 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Auto-refreshing
          </span>
        </div>
        <div className="p-6">
          {queueItems.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-14">
              <div className="relative w-20 h-20 rounded-full bg-[#f7faf9] border border-gray-100 flex items-center justify-center animate-[ezcFadeUp_0.6s_ease_forwards]">
                <ScanLine size={26} className="text-gray-300" />
                <Sparkles size={14} className="absolute -top-1 -right-1 text-[#0d9488]" />
              </div>
              <h4 className="font-['Outfit'] text-lg font-bold text-gray-700">Queue is Clear</h4>
              <p className="text-sm text-gray-400 max-w-sm">
                Customers will join the queue once checked-in from their bookings dashboard.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Token Code</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Token #</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Client</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Phone</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Service</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Wait time</th>
                    <th className="text-left text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">Status</th>
                    <th className="text-right text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queueItems.map((q, i) => (
                    <tr
                      key={q._id}
                      {...fadeUp(280 + i * 50)}
                      className={`${fadeUp(280 + i * 50).className} border-b border-gray-50 last:border-none transition-colors duration-200 ${
                        q.status === "in_service" ? "bg-sky-50/40 hover:bg-sky-50/70" : "hover:bg-gray-50/60"
                      }`}
                    >
                      <td className="py-3.5 pr-4 font-mono font-extrabold text-[#0d9488] text-base">{q.tokenCode}</td>
                      <td className="py-3.5 pr-4 font-bold text-gray-800">#{q.tokenNumber}</td>
                      <td className="py-3.5 pr-4 font-bold text-gray-800">{q.customer?.name}</td>
                      <td className="py-3.5 pr-4 font-semibold text-gray-500">{q.customer?.phone || "N/A"}</td>
                      <td className="py-3.5 pr-4 font-bold text-gray-700">{q.service?.name}</td>
                      <td className="py-3.5 pr-4 font-mono font-semibold text-gray-600">{q.estimatedWaitTime} mins</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[0.625rem] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                            q.status === "in_service"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {q.status === "in_service" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                          )}
                          {q.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex gap-1.5 justify-end flex-wrap">
                          {q.status === "waiting" && (
                            <button
                              onClick={() => handleQueueAction(q._id, startService, "Client service started! 💈")}
                              className="inline-flex items-center gap-1 bg-[#0d9488] hover:bg-[#0f766e] hover:scale-105 active:scale-95 text-white font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-all duration-200"
                            >
                              <Play size={10} fill="currentColor" /> Start
                            </button>
                          )}
                          {q.status === "in_service" && (
                            <button
                              onClick={() => handleQueueAction(q._id, completeQueue, "Client service completed! 🎉")}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 text-white font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-all duration-200"
                            >
                              <Check size={10} strokeWidth={3} /> Complete
                            </button>
                          )}
                          <button
                            onClick={() => triggerCancelQueue(q._id)}
                            className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 hover:scale-105 active:scale-95 text-rose-600 font-bold text-[0.6875rem] px-2.5 py-1.5 rounded-lg transition-all duration-200"
                          >
                            <Trash2 size={10} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Queue Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modalIn_0.25s_ease]">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <HelpCircle size={18} className="text-rose-500" />
              </div>
              <div>
                <h3 className="font-['Outfit'] text-lg font-extrabold text-gray-800">Cancel Entry</h3>
                <p className="text-xs text-gray-400 mt-0.5">Remove client from queue line</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to cancel and remove this client from the queue waitlist? This cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setTargetQueueId(null);
                }}
                className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelQueue}
                disabled={cancelLoading}
                className="inline-flex items-center bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                {cancelLoading ? "Removing..." : "Remove Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerQueue;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Clock, Hash, Timer, Key, Scissors, ArrowLeft, RefreshCw } from "lucide-react";
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

  return (
    <div style={{ minHeight: "calc(100vh - 68px)", padding: "3rem 0" }}>
      <div className="page-container" style={{ maxWidth: "600px" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 className="page-title">Live Queue Status</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.375rem" }}>
            Track salon waiting lines anonymously in real time
          </p>
        </div>

        {/* Input Form if no queue details are loaded */}
        {!activeTokenCode && (
          <div className="card" style={{ padding: "2rem" }}>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enter Token Code</label>
                <div style={{ position: "relative" }}>
                  <Key size={16} style={{
                    position: "absolute", left: "0.875rem", top: "50%",
                    transform: "translateY(-50%)", color: "var(--gray-400)",
                    pointerEvents: "none",
                  }} />
                  <input
                    type="text"
                    value={inputTokenCode}
                    onChange={(e) => setInputTokenCode(e.target.value)}
                    placeholder="e.g. EZ-ABCD1"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ gap: "0.5rem" }}
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
          <div className="space-y-6">
            
            {/* Status Card Banner */}
            <div style={{
              background: queue.status === "in_service"
                ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                : "linear-gradient(135deg, var(--brand-primary), #312e81)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", right: "-40px", top: "-40px",
                width: "200px", height: "200px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "50%",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                    {queue.salon?.name}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Scissors size={13} />
                    {queue.service?.name}
                  </p>
                </div>

                <span style={{
                  background: queue.status === "in_service" ? "rgba(255,255,255,0.2)" : "rgba(251,191,36,0.25)",
                  border: `1px solid ${queue.status === "in_service" ? "rgba(255,255,255,0.3)" : "rgba(251,191,36,0.4)"}`,
                  borderRadius: "var(--radius-full)",
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: queue.status === "in_service" ? "white" : "#fde68a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {queue.status === "in_service" ? "✂ In Service" : "⏳ Waiting"}
                </span>
              </div>
            </div>

            {/* Metrics Panel */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              {[
                { label: "Token #", value: `#${queue.tokenNumber}`, icon: Hash, color: "var(--brand-accent)" },
                { label: "Position", value: queue.status === "in_service" ? "Serving" : queue.position, icon: Clock, color: "var(--success)" },
                { label: "Est. Wait", value: `${queue.estimatedWaitTime}m`, icon: Timer, color: "var(--warning)" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="stat-card" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", justify: "center", marginBottom: "0.5rem" }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="stat-value" style={{ fontSize: "1.5rem", color }}>
                    {value}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Refresh & Details Footer */}
            <div className="card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--gray-400)", marginBottom: "0.15rem" }}>
                  Token Code
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "1.125rem", fontWeight: 800, color: "var(--gray-800)", letterSpacing: "0.05em" }}>
                  {activeTokenCode}
                </div>
              </div>

              {lastUpdated && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                  <RefreshCw size={12} className="animate-spin" />
                  Synced {lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
                </div>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={handleClear}
              className="btn btn-outline btn-full"
              style={{ gap: "0.375rem" }}
            >
              <ArrowLeft size={16} />
              Track Another Token
            </button>
          </div>
        )}

        {/* Token not found or cleared states */}
        {!loading && activeTokenCode && !queue && (
          <div className="card" style={{ padding: "2rem", textAlign: "center", spaceY: "1.5rem" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--gray-700)", marginBottom: "0.5rem" }}>
              Token Search Completed
            </h3>
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              No active queue entry found matching code "{activeTokenCode}".
            </p>
            <button
              onClick={handleClear}
              className="btn btn-primary"
              style={{ gap: "0.375rem", margin: "0 auto" }}
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

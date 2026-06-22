const Loader = ({ fullScreen = false, message = "" }) => {
  if (fullScreen) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.95)",
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}>
        <div className="spinner spinner-lg" />
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-500)", letterSpacing: "0.01em" }}>
          {message || "Loading EzyCut..."}
        </span>
      </div>
    );
  }

  return (
    <div className="page-loader">
      <div className="spinner spinner-lg" />
      {message && (
        <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", fontWeight: 500 }}>
          {message}
        </span>
      )}
    </div>
  );
};

export default Loader;

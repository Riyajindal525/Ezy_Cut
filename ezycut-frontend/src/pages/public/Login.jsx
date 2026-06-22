import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Scissors, LogIn, AlertCircle } from "lucide-react";
import { loginUser } from "../../api/auth.api";
import useAuthStore from "../../store/auth.store";
import toast from "../../utils/toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo;
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(formData);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === "admin") navigate("/admin/dashboard");
      else if (data.user.role === "salon_owner") navigate("/owner/dashboard");
      else navigate(redirectTo || "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--gray-50)",
    }}>
      {/* Left Panel - Brand */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorations */}
        <div style={{
          position: "absolute", top: "10%", right: "-80px",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "-60px",
          width: "240px", height: "240px",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

        <div style={{ position: "relative", maxWidth: "360px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "3rem" }}>
            <div style={{
              width: "2.5rem", height: "2.5rem",
              background: "var(--brand-accent)",
              borderRadius: "var(--radius-md)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Scissors size={18} strokeWidth={2.5} style={{ color: "white" }} />
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>EzyCut</span>
          </div>

          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1.25rem" }}>
            Welcome back
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Login to manage your bookings, track your salon queue, and stay updated on your appointments.
          </p>

          {/* Feature list */}
          {["Real-time queue tracking", "Instant booking confirmations", "Secure Razorpay payments"].map((item) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              color: "rgba(255,255,255,0.7)", fontSize: "0.875rem",
              marginBottom: "0.625rem",
            }}>
              <div style={{
                width: "1.25rem", height: "1.25rem",
                background: "rgba(99,102,241,0.3)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.625rem", color: "#a5b4fc", fontWeight: 700,
              }}>✓</div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "white",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gray-800)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              Sign in
            </h1>
            <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--brand-accent)", fontWeight: 600, textDecoration: "none" }}>
                Create one free
              </Link>
            </p>
          </div>

          {/* Redirect notice */}
          {redirectTo && (
            <div style={{
              background: "#fef9c3",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              display: "flex", alignItems: "center", gap: "0.5rem",
              fontSize: "0.875rem", color: "#92400e", fontWeight: 500,
            }}>
              <AlertCircle size={15} />
              Please log in to continue your booking.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              background: "var(--danger-light)",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              display: "flex", alignItems: "center", gap: "0.5rem",
              fontSize: "0.875rem", color: "#991b1b", fontWeight: 500,
            }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="form-input"
                  required
                  style={{ paddingRight: "2.75rem" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "0.875rem", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--gray-400)", padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ height: "2.875rem", fontSize: "0.9375rem", gap: "0.5rem", marginTop: "0.25rem" }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Signing in...</>
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
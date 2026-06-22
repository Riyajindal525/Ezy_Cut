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
    <div className="login-page">
      {/* Left Panel - Brand */}
      <div className="login-brand-panel">
        {/* Decorations */}
        <div className="login-glow login-glow-top" />
        <div className="login-glow login-glow-bottom" />

        <div className="login-brand-content">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <Scissors size={18} strokeWidth={2.5} style={{ color: "#0a0a0a" }} />
            </div>
            <span className="login-logo-text">EzyCut</span>
          </div>

          <h2 className="login-heading">
            Welcome back
          </h2>
          <p className="login-subtext">
            Login to manage your bookings, track your salon queue, and stay updated on your appointments.
          </p>

          {/* Feature list */}
          {["Real-time queue tracking", "Instant booking confirmations", "Secure Razorpay payments"].map((item) => (
            <div key={item} className="login-feature-item">
              <div className="login-feature-check">✓</div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="login-form-panel">
        <div className="login-form-wrap">
          <div style={{ marginBottom: "2rem" }}>
            <h1 className="login-form-title">
              Sign in
            </h1>
            <p className="login-form-subtitle">
              Don't have an account?{" "}
              <Link to="/register" className="login-link">
                Create one free
              </Link>
            </p>
          </div>

          {/* Redirect notice */}
          {redirectTo && (
            <div className="login-notice login-notice-warning">
              <AlertCircle size={15} />
              Please log in to continue your booking.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="login-notice login-notice-error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div className="form-group">
              <label className="form-label login-form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input login-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label login-form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="form-input login-input"
                  required
                  style={{ paddingRight: "2.75rem" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full login-submit-btn"
              disabled={loading}
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
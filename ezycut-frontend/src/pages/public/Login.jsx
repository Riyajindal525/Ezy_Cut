import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Clock,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import SEO from "../../components/common/SEO";
import { loginUser } from "../../api/auth.api";
import useAuthStore from "../../store/auth.store";
import toast from "../../utils/toast";
// import logo from "../../assets/ezycut-logo.png";
import iconWatermark from "../../assets/ezycut-icon-watermark.png";
import "../../css/Login.css";

const FEATURES = [
  { icon: Clock, label: "Real-time queue tracking" },
  { icon: CalendarCheck, label: "Instant booking confirmations" },
  { icon: ShieldCheck, label: "Secure Razorpay payments" },
];

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
    <div className="ezyauth-login-page">
      <SEO
        title="Sign In — Access Your Account"
        description="Sign in to your EzyCut account to book salon appointments and track your queue status."
        canonical="https://www.ezycut.co.in/login"
        noIndex={true}
      />
      {/* Left Panel - Brand */}
      <div className="ezyauth-login-brand-panel">
        {/* Watermark */}
        <img
          src={iconWatermark}
          alt=""
          aria-hidden="true"
          className="ezyauth-login-watermark"
        />

        <div className="ezyauth-login-brand-content">
          {/* <img src={logo} alt="EzyCut" className="ezyauth-login-logo-img" /> */}

          <h2 className="ezyauth-login-heading">Welcome back</h2>
          <p className="ezyauth-login-subtext">
            Sign in to manage your bookings, track your salon queue, and stay
            updated on every appointment.
          </p>

          <div className="ezyauth-login-feature-list">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="ezyauth-login-feature-item">
                <span className="ezyauth-login-feature-icon">
                  <Icon size={15} strokeWidth={2.25} />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="ezyauth-login-brand-footer">Smart grooming. Better prices.</p>
      </div>
      {/* Right Panel - Form */}
      <div className="ezyauth-login-form-panel">
        <div className="ezyauth-login-form-wrap">
          <div className="ezyauth-login-form-header">
            <h1 className="ezyauth-login-form-title">Sign in</h1>
            <p className="ezyauth-login-form-subtitle">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="ezyauth-login-link">
                Create one free
              </Link>
            </p>
          </div>

          {redirectTo && (
            <div className="ezyauth-login-notice ezyauth-login-notice-warning">
              <AlertCircle size={16} strokeWidth={2.25} />
              Please log in to continue your booking.
            </div>
          )}

          {error && (
            <div className="ezyauth-login-notice ezyauth-login-notice-error">
              <AlertCircle size={16} strokeWidth={2.25} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="ezyauth-login-form">
            <div className="ezyauth-login-form-group">
              <label className="ezyauth-login-form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="ezyauth-login-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="ezyauth-login-form-group">
              <label className="ezyauth-login-form-label" htmlFor="password">
                Password
              </label>
              <div className="ezyauth-login-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="ezyauth-login-input ezyauth-login-input-icon-right"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ezyauth-login-eye-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="ezyauth-login-form-meta">
              <Link to="/forgot-password" className="ezyauth-login-link ezyauth-login-link-muted">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="ezyauth-login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="ezyauth-login-spinner" /> Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} strokeWidth={2.25} /> Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
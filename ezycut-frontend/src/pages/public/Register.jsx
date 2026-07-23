import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  User,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import SEO from "../../components/common/SEO";
import { registerUser, loginUser } from "../../api/auth.api";
import useAuthStore from "../../store/auth.store";
import toast from "../../utils/toast";
import iconWatermark from "../../assets/ezycut-icon-watermark.png";
import "../../css/Register.css";

const FEATURES = [
  "Browse verified top-rated salons",
  "Book appointments in under 60 seconds",
  "Real-time queue tracking",
  "Secure online payments",
];

const ROLES = [
  { value: "customer", label: "Customer", icon: User, desc: "Book appointments" },
  { value: "salon_owner", label: "Salon Owner", icon: Briefcase, desc: "Manage my salon" },
];

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
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
      await registerUser(formData);

      const loginData = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      setAuth(loginData.user, loginData.token);
      toast.success(`Account created! Welcome, ${loginData.user.name}!`);

      if (loginData.user.role === "admin") navigate("/admin/dashboard");
      else if (loginData.user.role === "salon_owner") navigate("/owner/dashboard");
      else navigate("/salons");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ezyauth-register-page">
      <SEO
        title="Register — Create Account"
        description="Register a new EzyCut account to easily book grooming appointments and track your salon slots live."
        canonical="https://www.ezycut.co.in/register"
        noIndex={true}
      />
      {/* Left Panel - Brand */}
      <div className="ezyauth-register-brand-panel">
        <img
          src={iconWatermark}
          alt=""
          aria-hidden="true"
          className="ezyauth-register-watermark"
        />

        <div className="ezyauth-register-brand-content">
          <h2 className="ezyauth-register-heading">Join EzyCut today</h2>
          <p className="ezyauth-register-subtext">
            Create your account and start booking salon appointments in
            seconds. Free forever.
          </p>

          <div className="ezyauth-register-feature-list">
            {FEATURES.map((item) => (
              <div key={item} className="ezyauth-register-feature-item">
                <span className="ezyauth-register-feature-icon">
                  <CheckCircle2 size={15} strokeWidth={2.25} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="ezyauth-register-brand-footer">Smart grooming. Better prices.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="ezyauth-register-form-panel">
        <div className="ezyauth-register-form-wrap">
          <div className="ezyauth-register-form-header">
            <h1 className="ezyauth-register-form-title">Create Account</h1>
            <p className="ezyauth-register-form-subtitle">
              Already have an account?{" "}
              <Link to="/login" className="ezyauth-register-link">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="ezyauth-register-notice ezyauth-register-notice-error">
              <AlertCircle size={16} strokeWidth={2.25} />
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="ezyauth-register-role-section">
            <label className="ezyauth-register-form-label ezyauth-register-role-label">
              I am a...
            </label>
            <div className="ezyauth-register-role-grid">
              {ROLES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: value })}
                  className={`ezyauth-register-role-btn ${
                    formData.role === value ? "active" : ""
                  }`}
                >
                  <Icon size={18} className="ezyauth-register-role-icon" strokeWidth={2.25} />
                  <div className="ezyauth-register-role-title">{label}</div>
                  <div className="ezyauth-register-role-desc">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="ezyauth-register-form">
            <div className="ezyauth-register-form-group">
              <label className="ezyauth-register-form-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="ezyauth-register-input"
                required
                autoComplete="name"
              />
            </div>

            <div className="ezyauth-register-form-group">
              <label className="ezyauth-register-form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="ezyauth-register-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="ezyauth-register-form-group">
              <label className="ezyauth-register-form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="ezyauth-register-input"
                required
              />
            </div>

            <div className="ezyauth-register-form-group">
              <label className="ezyauth-register-form-label" htmlFor="password">
                Password
              </label>
              <div className="ezyauth-register-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="ezyauth-register-input ezyauth-register-input-icon-right"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ezyauth-register-eye-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="ezyauth-register-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ezyauth-register-spinner" /> Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={16} strokeWidth={2.25} /> Create Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
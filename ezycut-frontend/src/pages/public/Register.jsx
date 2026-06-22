import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Scissors, UserPlus, AlertCircle, User, Briefcase } from "lucide-react";
import { registerUser, loginUser } from "../../api/auth.api";
import useAuthStore from "../../store/auth.store";
import toast from "../../utils/toast";

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
    <div className="register-page">
      {/* Left Panel - Brand */}
      <div className="register-brand-panel">
        <div className="register-glow" />

        <div className="register-brand-content">
          <div className="register-logo">
            <div className="register-logo-icon">
              <Scissors size={18} strokeWidth={2.5} style={{ color: "#0a0a0a" }} />
            </div>
            <span className="register-logo-text">EzyCut</span>
          </div>

          <h2 className="register-heading">
            Join EzyCut today
          </h2>
          <p className="register-subtext">
            Create your account and start booking salon appointments in seconds. Free forever.
          </p>

          {[
            "Browse verified top-rated salons",
            "Book appointments in under 60 seconds",
            "Real-time queue tracking",
            "Secure online payments",
          ].map((item) => (
            <div key={item} className="register-feature-item">
              <div className="register-feature-check">✓</div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="register-form-panel">
        <div className="register-form-wrap">
          <div style={{ marginBottom: "2rem" }}>
            <h1 className="register-form-title">
              Create Account
            </h1>
            <p className="register-form-subtitle">
              Already have an account?{" "}
              <Link to="/login" className="register-link">
                Sign in
              </Link>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="register-notice register-notice-error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label register-form-label" style={{ marginBottom: "0.625rem", display: "block" }}>I am a...</label>
            <div className="register-role-grid">
              {[
                { value: "customer", label: "Customer", icon: User, desc: "Book appointments" },
                { value: "salon_owner", label: "Salon Owner", icon: Briefcase, desc: "Manage my salon" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: value })}
                  className={`register-role-btn ${formData.role === value ? "active" : ""}`}
                >
                  <Icon size={18} className="register-role-icon" />
                  <div className="register-role-label">{label}</div>
                  <div className="register-role-desc">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label register-form-label" htmlFor="name">Full Name</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Your full name" className="form-input register-input" required autoComplete="name" />
            </div>

            <div className="form-group">
              <label className="form-label register-form-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" className="form-input register-input" required autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label register-form-label" htmlFor="phone">Phone Number</label>
              <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+91 98765 43210" className="form-input register-input" required />
            </div>

            <div className="form-group">
              <label className="form-label register-form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="form-input register-input"
                  required
                  style={{ paddingRight: "2.75rem" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="register-eye-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full register-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Creating Account...</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
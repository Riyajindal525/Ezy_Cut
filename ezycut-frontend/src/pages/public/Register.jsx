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
        <div style={{
          position: "absolute", top: "10%", right: "-80px",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

        <div style={{ position: "relative", maxWidth: "360px" }}>
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
            Join EzyCut today
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Create your account and start booking salon appointments in seconds. Free forever.
          </p>

          {[
            "Browse verified top-rated salons",
            "Book appointments in under 60 seconds",
            "Real-time queue tracking",
            "Secure online payments",
          ].map((item) => (
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
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gray-800)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              Create Account
            </h1>
            <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--brand-accent)", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>

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

          {/* Role Selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ marginBottom: "0.625rem", display: "block" }}>I am a...</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { value: "customer", label: "Customer", icon: User, desc: "Book appointments" },
                { value: "salon_owner", label: "Salon Owner", icon: Briefcase, desc: "Manage my salon" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: value })}
                  style={{
                    padding: "0.875rem",
                    border: `2px solid ${formData.role === value ? "var(--brand-accent)" : "var(--gray-200)"}`,
                    borderRadius: "var(--radius-md)",
                    background: formData.role === value ? "var(--brand-accent-light)" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon size={18} style={{ color: formData.role === value ? "var(--brand-accent)" : "var(--gray-400)", marginBottom: "0.375rem" }} />
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: formData.role === value ? "var(--brand-accent)" : "var(--gray-700)" }}>{label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Your full name" className="form-input" required autoComplete="name" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" className="form-input" required autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+91 98765 43210" className="form-input" required />
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
                  placeholder="Create a strong password"
                  className="form-input"
                  required
                  style={{ paddingRight: "2.75rem" }}
                  autoComplete="new-password"
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
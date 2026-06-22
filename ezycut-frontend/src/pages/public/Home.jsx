import { Link } from "react-router-dom";
import { ArrowRight, Scissors, Calendar, Clock, Award, CheckCircle } from "lucide-react";
import useAuthStore from "../../store/auth.store";
import heroImg from "../../assets/hero.avif";

const Home = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#f4f4f5" }}>
      {/* Hero Section — Full-bleed background image landing */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Full-bleed background image */}
        <img
          src={heroImg}
          alt="Elite Salon Interior"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

        {/* Dark scrim for text legibility */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(9,9,11,0.75) 0%, rgba(9,9,11,0.55) 40%, rgba(9,9,11,0.85) 100%)",
          zIndex: 1,
        }} />

        {/* Subtle amber glow accent, bottom-left */}
        <div style={{
          position: "absolute", bottom: "-150px", left: "-150px",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none", zIndex: 1,
        }} />

        {/* Content */}
        <div className="page-container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.75rem",
            maxWidth: "720px",
            margin: "0 auto",
          }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
              borderRadius: "var(--radius-full)", padding: "0.4rem 0.9rem",
              fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-accent)",
              textTransform: "uppercase", letterSpacing: "0.05em",
              backdropFilter: "blur(8px)",
            }}>
              <Scissors size={12} />
              Elite Grooming Simplified
            </div>

            <h1 style={{
              fontSize: "clamp(2.75rem, 7vw, 5rem)",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              margin: 0,
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}>
              Book Salon Appointments <br />
              <span style={{ color: "var(--brand-accent)" }}>Without Waiting</span>
            </h1>

            <p style={{
              fontSize: "1.125rem",
              color: "rgba(244,244,245,0.85)",
              maxWidth: "560px",
              lineHeight: 1.65,
              margin: 0,
            }}>
              Discover elite local salons, secure immediate reservations, track waiting queue lines in real-time, and manage your styling routines flawlessly.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.75rem" }}>
              {token ? (
                <Link to="/salons" className="btn btn-primary btn-lg" style={{ gap: "0.5rem" }}>
                  Explore Salons
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: "0.5rem" }}>
                  Join EzyCut
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          color: "rgba(244,244,245,0.6)",
        }}>
          <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <div style={{
            width: "1.25rem", height: "2rem",
            border: "1.5px solid rgba(244,244,245,0.35)",
            borderRadius: "var(--radius-full)",
            display: "flex",
            justifyContent: "center",
            paddingTop: "0.375rem",
          }}>
            <span style={{
              width: "3px", height: "6px",
              background: "var(--brand-accent)",
              borderRadius: "var(--radius-full)",
              animation: "scrollDot 1.8s ease-in-out infinite",
            }} />
          </div>
        </div>

        <style>{`
          @keyframes scrollDot {
            0% { transform: translateY(0); opacity: 1; }
            60% { transform: translateY(8px); opacity: 0; }
            61% { transform: translateY(0); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section style={{ padding: "5rem 0", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              Designed for Modern Styling
            </h2>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem" }}>
              Skip the hassle of calling and waiting in crowded lounges.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[
              {
                icon: Calendar,
                title: "Instant Scheduling",
                description: "Browse through approved time slots, choose your favorite stylist, and confirm reservations in seconds.",
                color: "#fbbf24",
                iconColor: "#6366f1"
              },
              {
                icon: Clock,
                title: "Real-time Queue Pass",
                description: "Monitor your waiting line position remotely. Arrive right when the stylist is ready for you.",
                color: "#fbbf24",
                iconColor: "#f59e0b"
              },
              {
                icon: Award,
                title: "Verified Feedback",
                description: "Write and inspect ratings and reviews for local salons to ensure an elite grooming experience.",
                color: "#fbbf24",
                iconColor: "#10b981"
              }
            ].map(({ icon: Icon, title, description, iconColor }) => (
              <div key={title} className="card card-hover" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{
                  width: "2.75rem", height: "2.75rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={20} style={{ color: iconColor }} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "white" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", lineHeight: 1.65, margin: 0 }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How EzyCut Works Section */}
      <section style={{ padding: "5rem 0", background: "#0c0c0e", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 900, color: "white", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              How EzyCut Works
            </h2>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem" }}>
              Simple 3-step workflow to unlock waitless styling.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2.5rem" }}>
            {[
              {
                num: "1",
                title: "Select a Salon",
                desc: "Browse cataloged salons in your city, filtering by services and verified rating points."
              },
              {
                num: "2",
                title: "Reserve & Confirm",
                desc: "Select services, choose your preferred timing, and securely checkout your slot."
              },
              {
                num: "3",
                title: "Track & Arrive",
                desc: "Join the digital waiting line, monitor estimated wait times, and skip the crowd."
              }
            ].map(({ num, title, desc }) => (
              <div key={num} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "3rem", height: "3rem",
                  borderRadius: "var(--radius-md)",
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--brand-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.125rem", fontWeight: 800,
                }}>
                  {num}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "white", margin: 0 }}>
                  {title}
                </h3>
                <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", lineHeight: 1.65, maxWidth: "260px", margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* Join CTA Section */}
          <div style={{
            marginTop: "6rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem"
          }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "white", letterSpacing: "-0.03em", margin: 0 }}>
              Ready to Book Your Next Stylist?
            </h2>
            <p style={{ color: "var(--gray-400)", fontSize: "1rem", maxWidth: "480px", margin: 0, lineHeight: 1.65 }}>
              Create an account today and enjoy a premium, waitless grooming routine.
            </p>
            {!token && (
              <Link to="/register" className="btn btn-primary btn-lg" style={{ marginTop: "0.5rem" }}>
                Join EzyCut <ArrowRight size={16} />
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* Trust bar */}
      <section style={{ padding: "2.5rem 0", background: "#09090b", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div className="page-container" style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
          {["10,000+ Customers", "500+ Salons", "Secure Payments", "Live Queue Tracking"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gray-400)", fontSize: "0.8125rem", fontWeight: 600 }}>
              <CheckCircle size={14} style={{ color: "#10b981" }} />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
import { Link } from "react-router-dom";
import { Scissors, MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{
      background: "#09090b",
      color: "var(--gray-500)",
      padding: "4rem 0 2rem",
      marginTop: "auto",
      borderTop: "1px solid var(--gray-200)",
    }}>
      <div className="page-container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2.5rem",
          paddingBottom: "3rem",
        }}>
          {/* Brand & Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Scissors size={20} style={{ color: "var(--brand-accent)" }} strokeWidth={2.5} />
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
                Ezy<span style={{ color: "var(--brand-accent)" }}>Cut</span>
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--gray-500)" }}>
              The modern grooming reservation and queue companion. Book elite stylists, track live waiting lines, and skip the queue seamlessly.
            </p>
            {/* Social Links */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
              {[
                { icon: (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                ), href: "https://facebook.com" },
                { icon: (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                ), href: "https://instagram.com" },
                { icon: (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                ), href: "https://twitter.com" }
              ].map(({ icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--gray-500)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "var(--gray-500)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.8125rem", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Navigation
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/salons", label: "Browse Salons" },
                { to: "/my-bookings", label: "My Bookings" },
                { to: "/track", label: "Live Queue status" },
                { to: "/terms", label: "Privacy & Terms" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{ color: "var(--gray-500)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => e.target.style.color = "white"}
                  onMouseLeave={e => e.target.style.color = "var(--gray-500)"}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Features Column */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.8125rem", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Features
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
              <span>Smart Salon Scheduling</span>
              <span>Real-time Token System</span>
              <span>Contactless Payment</span>
              <span>Verified Customer Reviews</span>
            </div>
          </div>

          {/* Contact & Support Column */}
          <div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.8125rem", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Contact & Support
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <MapPin size={16} style={{ color: "var(--brand-accent)", flexShrink: 0, marginTop: "0.25rem" }} />
                <span style={{ lineHeight: 1.5 }}>101 Styling Boulevard, Suite 500, Mumbai, India</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Phone size={16} style={{ color: "var(--brand-accent)", flexShrink: 0 }} />
                <span>+91 9476363907</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Mail size={16} style={{ color: "var(--brand-accent)", flexShrink: 0 }} />
                <span>support@ezycut.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.8125rem",
          color: "var(--gray-400)"
        }}>
          <span>© 2026 EzyCut. All rights reserved. Made for elite grooming experiences.</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link to="/terms" style={{ color: "var(--gray-400)", textDecoration: "none" }} onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "var(--gray-400)"}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: "var(--gray-400)", textDecoration: "none" }} onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "var(--gray-400)"}>Terms of Service</Link>
            <Link to="#" style={{ color: "var(--gray-400)", textDecoration: "none" }} onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "var(--gray-400)"}>Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
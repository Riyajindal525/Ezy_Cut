import { Scissors, FileText, CheckCircle2, Shield } from "lucide-react";

const Terms = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#f4f4f5", padding: "6rem 0 4rem" }}>
      {/* Background radial glow */}
      <div style={{
        position: "absolute", top: "0", right: "0",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 1,
      }} />

      <div className="page-container" style={{ position: "relative", zIndex: 2, maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "rgba(251,191,36,0.1)", marginBottom: "1rem" }}>
            <Shield size={28} style={{ color: "var(--brand-accent)" }} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: "0.75rem", fontFamily: "Outfit, sans-serif" }}>
            Company Policies & Terms
          </h1>
          <p style={{ color: "var(--gray-400)", fontSize: "1rem" }}>
            Official terms, conditions, operational guidelines, and platform rules for EZYCUT.
          </p>
        </div>

        {/* Content Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* Section 1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem", transition: "border-color 0.2s" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>1.</span> Company Overview
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              EZYCUT is a BeautyTech and SaaS-enabled digital platform designed to help users discover salons, book appointments, make digital payments, and access AI-powered grooming services while helping salon businesses digitize operations.
            </p>
          </div>

          {/* Section 2 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>2.</span> User Eligibility
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Users accessing EZYCUT services must provide accurate information and comply with applicable laws and platform guidelines. The company reserves the right to suspend accounts involved in misuse or fraudulent activity.
            </p>
          </div>

          {/* Section 3 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>3.</span> Booking & Appointment Policy
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Customers may book appointments through the platform based on salon availability. Salon partners are responsible for service delivery and maintaining professional standards. EZYCUT acts as a technology facilitator between customers and salon partners.
            </p>
          </div>

          {/* Section 4 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>4.</span> Payment Policy
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Digital payments processed through the platform may include UPI, debit/credit cards, wallets, or other supported payment gateways. EZYCUT may deduct applicable commissions, platform fees, or transaction charges where applicable.
            </p>
          </div>

          {/* Section 5 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>5.</span> Cancellation & Refund Policy
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Cancellation and refund eligibility may vary depending on salon partner policies and booking timelines. Refund requests will be reviewed based on transaction records and applicable terms.
            </p>
          </div>

          {/* Section 6 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>6.</span> Data Privacy & Security
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              EZYCUT values customer privacy and implements reasonable security measures to protect user data, booking information, and transaction details. User data will not be shared unlawfully with third parties.
            </p>
          </div>

          {/* Section 7 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>7.</span> Intellectual Property
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              All platform content, branding, logos, software systems, AI modules, dashboards, and digital assets associated with EZYCUT remain the intellectual property of the company unless otherwise specified.
            </p>
          </div>

          {/* Section 8 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>8.</span> AI & Recommendation Systems
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              AI-powered recommendations and analytics are intended to improve customer experience and operational efficiency. Recommendations generated through automated systems are informational in nature and may vary based on user preferences and data inputs.
            </p>
          </div>

          {/* Section 9 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>9.</span> Salon Partner Responsibilities
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Salon partners are responsible for maintaining service quality, pricing transparency, hygiene standards, customer satisfaction, and legal compliance applicable to their business operations.
            </p>
          </div>

          {/* Section 10 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>10.</span> Limitation of Liability
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              EZYCUT shall not be held responsible for disputes, service deficiencies, delays, or damages directly caused by third-party salon partners or external service providers.
            </p>
          </div>

          {/* Section 11 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>11.</span> Employee & Team Conduct Policy
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Employees, interns, consultants, and team members associated with EZYCUT are expected to maintain confidentiality, professionalism, ethical conduct, and protection of company intellectual property.
            </p>
          </div>

          {/* Section 12 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>12.</span> Confidentiality Policy
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Any confidential information, business plans, technology architecture, AI systems, operational strategies, customer data, or internal documentation shared within the organization must remain protected and undisclosed without authorization.
            </p>
          </div>

          {/* Section 13 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>13.</span> Compliance & Legal Policy
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              EZYCUT aims to operate in compliance with applicable Indian laws, startup regulations, digital payment guidelines, and data protection standards relevant to technology-enabled service platforms.
            </p>
          </div>

          {/* Section 14 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>14.</span> Amendments & Policy Updates
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              The company reserves the right to modify or update policies, operational guidelines, and platform terms as required for business, legal, or operational purposes.
            </p>
          </div>

          {/* Section 15 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--brand-accent)" }}>15.</span> Contact & Support
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
              For official communication, support requests, partnership inquiries, or legal concerns, users may contact EZYCUT through official business communication channels at <strong>+91 9476363907</strong> or via email.
            </p>
          </div>

          {/* Company Information Table */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem", marginTop: "1rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1.25rem", fontFamily: "Outfit, sans-serif" }}>
              Company Information
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
              {[
                { label: "Company Name", val: "EZYCUT" },
                { label: "Industry", val: "AI / SaaS / BeautyTech" },
                { label: "Business Type", val: "Salon Booking & Management Platform" },
                { label: "Founder", val: "Diptodeep Karmakar" },
                { label: "Co-Founder", val: "Vishal" },
                { label: "Country", val: "India" }
              ].map(({ label, val }, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--gray-500)", letterSpacing: "0.05em" }}>{label}</span>
                  <span style={{ fontSize: "0.9375rem", color: "white", fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;

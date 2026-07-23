import {
  Shield,
  FileText,
  Users,
  Calendar,
  CreditCard,
  RotateCcw,
  Lock,
  Copyright,
  Sparkles,
  Store,
  ScaleIcon,
  Briefcase,
  EyeOff,
  Gavel,
  RefreshCw,
  Phone,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import SEO from "../../components/common/SEO";

const sections = [
  {
    icon: Building2,
    title: "Company Overview",
    text: "EZYCUT is a BeautyTech and SaaS-enabled digital platform designed to help users discover salons, book appointments, make digital payments, and access AI-powered grooming services while helping salon businesses digitize operations.",
  },
  {
    icon: Users,
    title: "User Eligibility",
    text: "Users accessing EZYCUT services must provide accurate information and comply with applicable laws and platform guidelines. The company reserves the right to suspend accounts involved in misuse or fraudulent activity.",
  },
  {
    icon: Calendar,
    title: "Booking & Appointment Policy",
    text: "Customers may book appointments through the platform based on salon availability. Salon partners are responsible for service delivery and maintaining professional standards. EZYCUT acts as a technology facilitator between customers and salon partners.",
  },
  {
    icon: CreditCard,
    title: "Payment Policy",
    text: "Digital payments processed through the platform may include UPI, debit/credit cards, wallets, or other supported payment gateways. EZYCUT may deduct applicable commissions, platform fees, or transaction charges where applicable.",
  },
  {
    icon: RotateCcw,
    title: "Cancellation & Refund Policy",
    text: "Cancellation and refund eligibility may vary depending on salon partner policies and booking timelines. Refund requests will be reviewed based on transaction records and applicable terms.",
  },
  {
    icon: Lock,
    title: "Data Privacy & Security",
    text: "EZYCUT values customer privacy and implements reasonable security measures to protect user data, booking information, and transaction details. User data will not be shared unlawfully with third parties.",
  },
  {
    icon: Copyright,
    title: "Intellectual Property",
    text: "All platform content, branding, logos, software systems, AI modules, dashboards, and digital assets associated with EZYCUT remain the intellectual property of the company unless otherwise specified.",
  },
  {
    icon: Sparkles,
    title: "AI & Recommendation Systems",
    text: "AI-powered recommendations and analytics are intended to improve customer experience and operational efficiency. Recommendations generated through automated systems are informational in nature and may vary based on user preferences and data inputs.",
  },
  {
    icon: Store,
    title: "Salon Partner Responsibilities",
    text: "Salon partners are responsible for maintaining service quality, pricing transparency, hygiene standards, customer satisfaction, and legal compliance applicable to their business operations.",
  },
  {
    icon: ScaleIcon,
    title: "Limitation of Liability",
    text: "EZYCUT shall not be held responsible for disputes, service deficiencies, delays, or damages directly caused by third-party salon partners or external service providers.",
  },
  {
    icon: Briefcase,
    title: "Employee & Team Conduct Policy",
    text: "Employees, interns, consultants, and team members associated with EZYCUT are expected to maintain confidentiality, professionalism, ethical conduct, and protection of company intellectual property.",
  },
  {
    icon: EyeOff,
    title: "Confidentiality Policy",
    text: "Any confidential information, business plans, technology architecture, AI systems, operational strategies, customer data, or internal documentation shared within the organization must remain protected and undisclosed without authorization.",
  },
  {
    icon: Gavel,
    title: "Compliance & Legal Policy",
    text: "EZYCUT aims to operate in compliance with applicable Indian laws, startup regulations, digital payment guidelines, and data protection standards relevant to technology-enabled service platforms.",
  },
  {
    icon: RefreshCw,
    title: "Amendments & Policy Updates",
    text: "The company reserves the right to modify or update policies, operational guidelines, and platform terms as required for business, legal, or operational purposes.",
  },
  {
    icon: Phone,
    title: "Contact & Support",
    text: "For official communication, support requests, partnership inquiries, or legal concerns, users may contact EZYCUT through official business communication channels at +91 94763 63907 or via email.",
  },
];

const companyInfo = [
  { label: "Company Name", val: "EZYCUT" },
  { label: "Industry", val: "AI / SaaS / BeautyTech" },
  { label: "Business Type", val: "Salon Booking & Management Platform" },
  { label: "Founder", val: "Diptodeep Karmakar" },
  { label: "Co-Founder", val: "Vishal" },
  { label: "Country", val: "India" },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Terms of Service"
        description="Review the terms and conditions governing the use of EzyCut's salon booking and queue management services."
        canonical="https://www.ezycut.co.in/terms"
      />
      {/* ================= DARK HERO ================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#09090b] via-[#0a1a18] to-[#09090b] pt-28 pb-20 md:pt-32 md:pb-24">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.22)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.14)_0%,transparent_70%)] pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="termsDots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="#2dd4bf" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#termsDots)" />
        </svg>

        <div className="page-container relative max-w-[800px] mx-auto text-center">
          <h1
            className="font-['Outfit'] text-[clamp(2rem,4.5vw,3rem)] font-extrabold text-white tracking-[-0.02em] mb-4 animate-[ezcFadeUp_0.6s_ease_forwards]"
            style={{ animationDelay: "120ms", opacity: 0 }}
          >
            Company Policies &amp; Terms
          </h1>
          <p
            className="text-[#a1a1aa] text-[0.9375rem] md:text-base leading-relaxed max-w-[560px] mx-auto animate-[ezcFadeUp_0.6s_ease_forwards]"
            style={{ animationDelay: "180ms", opacity: 0 }}
          >
            Official terms, conditions, operational guidelines, and platform rules for EZYCUT.
          </p>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="page-container max-w-[800px] mx-auto py-14 md:py-16">
        <div className="flex flex-col gap-4">
          {sections.map(({ icon: Icon, title, text }, idx) => (
            <div
              key={title}
              className="group bg-white border border-gray-200 rounded-2xl p-6 md:p-7 transition-all duration-300 hover:border-[#0d9488]/30 hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] animate-[ezcFadeUp_0.45s_ease_forwards]"
              style={{ animationDelay: `${Math.min(idx * 45, 500)}ms`, opacity: 0 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#0d9488] group-hover:border-[#0d9488]">
                  <Icon size={18} className="text-[#0d9488] transition-colors duration-300 group-hover:text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-[1.0625rem] font-bold text-[#022525] mb-2">
                    <span className="text-[#0d9488]">{String(idx + 1).padStart(2, "0")}.</span>
                    {title}
                  </h3>
                  <p className="text-[#5b6b68] text-sm leading-relaxed">{text}</p>
                </div>
              </div>
            </div>
          ))}

          {/* ===== Company Information Card ===== */}
          <div
            className="relative overflow-hidden rounded-2xl p-7 md:p-8 mt-4 bg-gradient-to-br from-[#0f766e] to-[#042f2e] border border-[#0d9488]/20 animate-[ezcFadeUp_0.5s_ease_forwards]"
            style={{ opacity: 0 }}
          >
            <div className="absolute -right-14 -top-14 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.18)_0%,transparent_70%)] pointer-events-none" />

            <h3 className="relative flex items-center gap-2 text-lg font-extrabold text-white mb-6">
              <Building2 size={18} className="text-[#5eead4]" />
              Company Information
            </h3>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 pt-5 border-t border-white/10">
              {companyInfo.map(({ label, val }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-white/45">
                    {label}
                  </span>
                  <span className="text-[0.9375rem] font-semibold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Contact CTA strip ===== */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-6 mt-2 animate-[ezcFadeUp_0.5s_ease_forwards]"
            style={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#99f6e4] flex items-center justify-center shrink-0">
                <Phone size={17} className="text-[#0d9488]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#022525]">Have questions about these terms?</p>
                <p className="text-xs text-[#5b6b68]">Our support team is happy to help.</p>
              </div>
            </div>
            <a
              href="tel:+919476363907"
              className="inline-flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 shrink-0"
            >
              Contact Support
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
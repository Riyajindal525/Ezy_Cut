import React, { useState, useEffect, useRef } from "react";
import SEO from "../../components/common/SEO";

/**
 * EzyCut — FAQ + Terms & Conditions
 * Theme: Teal-green (#0d9488 / #0f766e) + White
 * Signature motif: a diagonal "cut line" divider (nod to the brand name EzyCut)
 *   that runs through section headers and the tab switcher, like a fresh
 *   scissor snip across the page.
 *
 * Drop this file into a React + Tailwind project (Next.js/CRA/Vite all work).
 * No external UI libraries required — just React + Tailwind core utilities.
 */

// ---------- Reveal-on-scroll wrapper ----------
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ---------- Diagonal cut divider (signature element) ----------
function CutDivider({ flip = false }) {
  return (
    <div
      className={`w-full h-8 sm:h-10 bg-white ${flip ? "rotate-180" : ""}`}
      style={{
        clipPath: "polygon(0 100%, 100% 0, 100% 100%)",
      }}
      aria-hidden="true"
    />
  );
}

// ---------- Accordion item for FAQ ----------
function FaqItem({ q, a, isOpen, onToggle }) {
  const contentRef = useRef(null);
  return (
    <div className="border border-teal-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-xl group"
      >
        <span className="font-semibold text-teal-900 text-sm sm:text-base leading-snug">
          {q}
        </span>
        <span
          className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-600 transition-transform duration-300 group-hover:bg-teal-100 ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        ref={contentRef}
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight + "px" : "0px",
        }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-teal-700/80 text-sm sm:text-[15px] leading-relaxed">
          {a}
        </p>
      </div>
    </div>
  );
}

// ---------- FAQ data (derived from EzyCut policy doc) ----------
const FAQ_DATA = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is EzyCut?",
        a: "EzyCut is an AI-powered BeautyTech and SaaS-enabled platform that helps you discover salons, book appointments, pay digitally, and access AI-driven grooming recommendations — while helping salon businesses digitize their operations.",
      },
      {
        q: "Who can use EzyCut?",
        a: "Anyone who provides accurate information and agrees to comply with applicable laws and our platform guidelines. We reserve the right to suspend accounts involved in misuse or fraudulent activity.",
      },
    ],
  },
  {
    category: "Booking & Appointments",
    items: [
      {
        q: "How do I book an appointment?",
        a: "Simply browse salons on the platform, check real-time availability, and confirm your slot. EzyCut acts as the technology facilitator connecting you with salon partners.",
      },
      {
        q: "Who is responsible for the service quality at the salon?",
        a: "Salon partners are responsible for service delivery, hygiene, pricing transparency, and maintaining professional standards. EzyCut provides the booking technology and does not directly perform salon services.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods are supported?",
        a: "You can pay via UPI, debit/credit cards, digital wallets, or other supported payment gateways integrated into the platform.",
      },
      {
        q: "Does EzyCut charge any fees?",
        a: "EzyCut may deduct applicable commissions, platform fees, or transaction charges on bookings, where applicable, as part of standard platform operations.",
      },
    ],
  },
  {
    category: "Cancellations & Refunds",
    items: [
      {
        q: "Can I cancel my appointment?",
        a: "Yes. Cancellation eligibility depends on the specific salon partner's policy and how close to the appointment time you cancel.",
      },
      {
        q: "How are refunds processed?",
        a: "Refund requests are reviewed against your transaction records and the applicable cancellation terms before approval.",
      },
    ],
  },
  {
    category: "Privacy & AI",
    items: [
      {
        q: "Is my personal data safe with EzyCut?",
        a: "Yes. We implement reasonable security measures to protect your data, booking details, and transaction information, and we do not unlawfully share your data with third parties.",
      },
      {
        q: "How accurate are the AI-powered recommendations?",
        a: "AI recommendations and analytics are designed to improve your experience, but they're informational in nature and can vary based on your preferences and the data available.",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        q: "Who do I contact for support or partnership queries?",
        a: "You can reach EzyCut through our official business communication channels for support requests, partnership inquiries, or legal concerns.",
      },
    ],
  },
];

// ---------- Terms & Conditions data ----------
const TERMS_DATA = [
  {
    title: "Company Overview",
    body: "EZYCUT is a BeautyTech and SaaS-enabled digital platform designed to help users discover salons, book appointments, make digital payments, and access AI-powered grooming services — while helping salon businesses digitize their operations.",
  },
  {
    title: "User Eligibility",
    body: "Users accessing EZYCUT services must provide accurate information and comply with applicable laws and platform guidelines. The company reserves the right to suspend accounts involved in misuse or fraudulent activity.",
  },
  {
    title: "Booking & Appointment Policy",
    body: "Customers may book appointments through the platform based on salon availability. Salon partners are responsible for service delivery and maintaining professional standards. EZYCUT acts as a technology facilitator between customers and salon partners.",
  },
  {
    title: "Payment Policy",
    body: "Digital payments processed through the platform may include UPI, debit/credit cards, wallets, or other supported payment gateways. EZYCUT may deduct applicable commissions, platform fees, or transaction charges where applicable.",
  },
  {
    title: "Cancellation & Refund Policy",
    body: "Cancellation and refund eligibility may vary depending on salon partner policies and booking timelines. Refund requests will be reviewed based on transaction records and applicable terms.",
  },
  {
    title: "Data Privacy & Security",
    body: "EZYCUT values customer privacy and implements reasonable security measures to protect user data, booking information, and transaction details. User data will not be shared unlawfully with third parties.",
  },
  {
    title: "Intellectual Property",
    body: "All platform content, branding, logos, software systems, AI modules, dashboards, and digital assets associated with EZYCUT remain the intellectual property of the company unless otherwise specified.",
  },
  {
    title: "AI & Recommendation Systems",
    body: "AI-powered recommendations and analytics are intended to improve customer experience and operational efficiency. Recommendations generated through automated systems are informational in nature and may vary based on user preferences and data inputs.",
  },
  {
    title: "Salon Partner Responsibilities",
    body: "Salon partners are responsible for maintaining service quality, pricing transparency, hygiene standards, customer satisfaction, and legal compliance applicable to their business operations.",
  },
  {
    title: "Limitation of Liability",
    body: "EZYCUT shall not be held responsible for disputes, service deficiencies, delays, or damages directly caused by third-party salon partners or external service providers.",
  },
  {
    title: "Employee & Team Conduct Policy",
    body: "Employees, interns, consultants, and team members associated with EZYCUT are expected to maintain confidentiality, professionalism, ethical conduct, and protection of company intellectual property.",
  },
  {
    title: "Confidentiality Policy",
    body: "Any confidential information, business plans, technology architecture, AI systems, operational strategies, customer data, or internal documentation shared within the organization must remain protected and undisclosed without authorization.",
  },
  {
    title: "Compliance & Legal Policy",
    body: "EZYCUT aims to operate in compliance with applicable Indian laws, startup regulations, digital payment guidelines, and data protection standards relevant to technology-enabled service platforms.",
  },
  {
    title: "Amendments & Policy Updates",
    body: "The company reserves the right to modify or update policies, operational guidelines, and platform terms as required for business, legal, or operational purposes.",
  },
  {
    title: "Contact & Support",
    body: "For official communication, support requests, partnership inquiries, or legal concerns, users may contact EZYCUT through official business communication channels.",
  },
];

// ---------- Hero ----------
function Hero({ active, setActive }) {
  return (
    <header className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500 text-white overflow-hidden">
      {/* ambient snip lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 rotate-45 border-t-2 border-white/40" />
        <div className="absolute top-1/3 -right-16 w-96 h-96 rotate-12 border-t-2 border-white/30" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 -rotate-12 border-t-2 border-white/20" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wide mb-6 animate-[fadeIn_0.8s_ease-out]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          EzyCut · BeautyTech Platform
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4 animate-[fadeInUp_0.8s_ease-out]">
          Policies, made as clean
          <br className="hidden sm:block" /> as a fresh cut.
        </h1>
        <p className="text-teal-50/90 text-sm sm:text-lg max-w-xl mx-auto mb-10 animate-[fadeInUp_0.9s_ease-out]">
          Everything you need to know about booking, payments, privacy, and
          how EzyCut works — clearly explained, no fine-print maze.
        </p>

        {/* Tab switcher */}
        <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-full p-1.5 border border-white/20 animate-[fadeInUp_1s_ease-out]">
          {[
            { key: "faq", label: "FAQs" },
            { key: "terms", label: "Terms & Conditions" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`relative px-5 sm:px-7 py-2.5 text-sm sm:text-base font-semibold rounded-full transition-colors duration-300 ${
                active === tab.key
                  ? "bg-white text-teal-700 shadow"
                  : "text-white/85 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <CutDivider />

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </header>
  );
}

// ---------- FAQ Page ----------
function FaqPage() {
  const [openKey, setOpenKey] = useState("0-0");

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <Reveal>
        <div className="text-center mb-12">
          <span className="text-teal-500 font-semibold text-xs sm:text-sm tracking-widest uppercase">
            Frequently Asked
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-teal-900 mt-2">
            Questions, answered
          </h2>
        </div>
      </Reveal>

      <div className="space-y-12">
        {FAQ_DATA.map((group, gi) => (
          <Reveal key={group.category} delay={gi * 60}>
            <div>
              <h3 className="flex items-center gap-3 text-teal-800 font-bold text-base sm:text-lg mb-4">
                <span className="w-8 h-[2px] bg-teal-400 inline-block" />
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`;
                  return (
                    <FaqItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={openKey === key}
                      onToggle={() =>
                        setOpenKey(openKey === key ? null : key)
                      }
                    />
                  );
                })}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <div className="mt-16 bg-teal-50 border border-teal-100 rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-teal-900 font-semibold mb-1 text-sm sm:text-base">
            Still have a question?
          </p>
          <p className="text-teal-700/80 text-sm">
            Reach out through EzyCut's official support channels — we're
            happy to help.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

// ---------- Terms Page ----------
function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <Reveal>
        <div className="text-center mb-4">
          <span className="text-teal-500 font-semibold text-xs sm:text-sm tracking-widest uppercase">
            Legal
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-teal-900 mt-2">
            Terms &amp; Conditions
          </h2>
          <p className="text-teal-700/70 text-sm mt-3">
            Official policies governing the use of the EzyCut platform.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-10 grid sm:grid-cols-2 gap-4 mb-14">
          {[
            { label: "Company", value: "EZYCUT" },
            { label: "Industry", value: "AI / SaaS / BeautyTech" },
            {
              label: "Business Type",
              value: "Salon Booking & Management Platform",
            },
            { label: "Founder", value: "Diptodeep Karmakar" },
            { label: "Co-Founder", value: "Vishal" },
            { label: "Country", value: "India" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between bg-white border border-teal-100 rounded-lg px-4 py-3 text-sm hover:border-teal-300 transition-colors duration-300"
            >
              <span className="text-teal-500 font-medium">{f.label}</span>
              <span className="text-teal-900 font-semibold">{f.value}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="relative border-l-2 border-teal-100 ml-3 sm:ml-4">
        {TERMS_DATA.map((section, i) => (
          <Reveal key={section.title} delay={(i % 6) * 60}>
            <div className="relative pl-8 sm:pl-10 pb-10 last:pb-0">
              <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-teal-500" />
              <h3 className="text-teal-900 font-bold text-base sm:text-lg mb-2">
                {i + 1}. {section.title}
              </h3>
              <p className="text-teal-700/80 text-sm sm:text-[15px] leading-relaxed">
                {section.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={150}>
        <div className="mt-8 bg-teal-700 text-white rounded-2xl p-6 sm:p-8 text-center">
          <p className="font-semibold mb-1 text-sm sm:text-base">
            EzyCut reserves the right to update these terms.
          </p>
          <p className="text-teal-50/80 text-sm">
            Continued use of the platform after changes means you accept the
            revised terms.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="bg-teal-900 text-teal-100/80 py-8 mt-4">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <p>© {new Date().getFullYear()} EzyCut. All rights reserved.</p>
        <p className="text-teal-300/70">
          Technology facilitator for salon discovery &amp; booking · India
        </p>
      </div>
    </footer>
  );
}

// ---------- Root ----------
export default function PolicyPages() {
  const [active, setActive] = useState("faq");

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO
        title={active === "faq" ? "Frequently Asked Questions (FAQ)" : "Platform Policies & Terms"}
        description="Find answers to common questions about salon booking, queue management, refunds, and user terms on the EzyCut platform."
        canonical="https://www.ezycut.co.in/policy"
      />
      <Hero active={active} setActive={setActive} />
      <main className="bg-white">
        {active === "faq" ? <FaqPage /> : <TermsPage />}
      </main>
      <Footer />
    </div>
  );
}
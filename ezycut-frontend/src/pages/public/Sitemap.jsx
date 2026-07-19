import React, { useEffect, useRef, useState } from "react";

/**
 * EzyCut — Site Map
 * Same design language as the FAQ / Terms & Conditions pages:
 * teal-green + white, diagonal "cut line" signature divider,
 * scroll-reveal animation, fully responsive.
 *
 * Update the `href` values below to your real routes.
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

function CutDivider({ flip = false }) {
  return (
    <div
      className={`w-full h-8 sm:h-10 bg-white ${flip ? "rotate-180" : ""}`}
      style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
      aria-hidden="true"
    />
  );
}

// ---------- Site structure ----------
const SITE_MAP = [
  {
    group: "Explore",
    icon: "🔍",
    links: [
      { label: "Home", href: "/" },
      { label: "Find Salons", href: "/salons" },
      { label: "Services", href: "/services" },
      { label: "AI Recommendations", href: "/recommendations" },
      { label: "Offers & Deals", href: "/offers" },
    ],
  },
  {
    group: "Book & Manage",
    icon: "📅",
    links: [
      { label: "Book Appointment", href: "/book" },
      { label: "My Bookings", href: "/account/bookings" },
      { label: "Payments & Invoices", href: "/account/payments" },
      { label: "My Profile", href: "/account/profile" },
    ],
  },
  {
    group: "For Salon Partners",
    icon: "✂️",
    links: [
      { label: "Partner With Us", href: "/partner" },
      { label: "Salon Dashboard", href: "/partner/dashboard" },
      { label: "Pricing & Commission", href: "/partner/pricing" },
    ],
  },
  {
    group: "Company",
    icon: "🏢",
    links: [
      { label: "About EzyCut", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    group: "Legal & Support",
    icon: "📄",
    links: [
      { label: "FAQs", href: "/policy" },
      { label: "Terms & Conditions", href: "/policy" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cancellation & Refunds", href: "/policy#refunds" },
      { label: "Help Center", href: "/support" },
      { label: "Email Support", href: "mailto:support@ezycut.co.in" },
    ],
  },
  {
    group: "Account Access",
    icon: "🔐",
    links: [
      { label: "Login", href: "/login" },
      { label: "Sign Up", href: "/signup" },
      { label: "Forgot Password", href: "/forgot-password" },
    ],
  },
];

function SitemapCard({ group, icon, links, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="bg-white border border-teal-100 rounded-2xl p-6 sm:p-7 h-full hover:border-teal-300 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 text-lg group-hover:bg-teal-100 transition-colors duration-300">
            {icon}
          </span>
          <h3 className="text-teal-900 font-bold text-base sm:text-lg">
            {group}
          </h3>
        </div>
        <ul className="space-y-2.5">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="flex items-center gap-2 text-teal-700/80 text-sm sm:text-[15px] hover:text-teal-600 transition-colors duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300 shrink-0 group-hover:bg-teal-500 transition-colors duration-200" />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function EzyCutSitemap() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 rotate-45 border-t-2 border-white/40" />
          <div className="absolute top-1/3 -right-16 w-96 h-96 rotate-12 border-t-2 border-white/30" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-20 sm:pt-20 sm:pb-28 text-center mt-7 sm:mt-5">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Site Map
          </h1>
          <p className="text-teal-50/90 text-sm sm:text-lg max-w-xl mx-auto">
            Every page on EzyCut, laid out in one place — so you always find
            your way in a snip.
          </p>
        </div>
        <CutDivider />
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SITE_MAP.map((section, i) => (
            <SitemapCard
              key={section.group}
              group={section.group}
              icon={section.icon}
              links={section.links}
              delay={i * 70}
            />
          ))}
        </div>

        <Reveal delay={SITE_MAP.length * 70}>
          <div className="mt-14 bg-teal-50 border border-teal-100 rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-teal-900 font-semibold mb-1 text-sm sm:text-base">
              Can't find what you're looking for?
            </p>
            <p className="text-teal-700/80 text-sm">
              Check the{" "}
              <a href="/policy" className="underline hover:text-teal-600">
                FAQs
              </a>
              , or email us at{" "}
              <a
                href="mailto:support@ezycut.co.in"
                className="underline hover:text-teal-600"
              >
                support@ezycut.co.in
              </a>
              .
            </p>
          </div>
        </Reveal>
      </main>

      {/* Footer */}
      <footer className="bg-teal-900 text-teal-100/80 py-8">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} EzyCut. All rights reserved.</p>
          <p className="text-teal-300/70">
            Technology facilitator for salon discovery &amp; booking · India
          </p>
        </div>
      </footer>
    </div>
  );
}
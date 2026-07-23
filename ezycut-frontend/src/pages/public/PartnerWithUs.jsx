import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";
import {
  Users,
  Store,
  Briefcase,
  Sparkles,
  Search,
  BarChart3,
  Gift,
  CheckCircle2,
  UserPlus,
  MapPin,
  SlidersHorizontal,
  CalendarCheck,
  Star,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  HeartHandshake,
  Building2,
} from "lucide-react";

import customerBooking from "../../assets/customer-booking-phone.jpg";
import salonOwnerDesk from "../../assets/salon-owner-desk.jpg";
import stylistHomeVisit from "../../assets/stylist-home-visit.jpg";
import beauticianTreatment from "../../assets/beautician-facial-treatment.jpg";

/* ---------- Scroll reveal hook ---------- */
function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* ---------- Animated counter ---------- */
function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(null);
  const match = value.match(/^([\d,]+)(.*)$/);
  const numeric = match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    const node = ref.current;
    if (!node || numeric === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(node);
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
          setDisplay(numeric.toLocaleString());
          return;
        }
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * numeric).toLocaleString());
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [numeric]);

  if (numeric === null) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {display ?? "0"}
      {suffix}
    </span>
  );
}

/* ---------- Persona data (the page's signature element) ---------- */
const PERSONAS = [
  {
    key: "customer",
    label: "Customers",
    icon: Users,
    image: customerBooking,
    title: "Discover, Compare & Book — All in One Place",
    desc: "Discover trusted salons, barber shops, and beauty parlours, compare services, check reviews, book appointments instantly, receive AI-powered recommendations, earn rewards, and enjoy a seamless grooming experience.",
    points: ["Verified salons near you", "AI-powered recommendations", "Instant booking & rewards"],
  },
  {
    key: "owner",
    label: "Business Owners",
    icon: Store,
    image: salonOwnerDesk,
    title: "Run Your Salon, Barber Shop or Parlour Smarter",
    desc: "Whether you own a salon, barber shop, or beauty parlour, EzyCut helps you manage appointments, staff, payments, customer relationships, marketing campaigns, and business analytics from a single platform.",
    points: ["Unified appointments & staff", "Digital payments & analytics", "Built-in marketing tools"],
  },
  {
    key: "pro",
    label: "Independent Professionals",
    icon: Briefcase,
    image: stylistHomeVisit,
    title: "Build Your Business Without a Physical Shop",
    desc: "Join EzyCut to offer home services, manage bookings, grow your customer base, and increase your earnings through a trusted digital platform — no storefront required.",
    points: ["Offer home services", "Grow your own client base", "Trusted digital earnings"],
  },
];

const AI_FEATURES = [
  { icon: Sparkles, title: "AI Grooming Assistant", desc: "Get personalized hairstyle and beauty recommendations." },
  { icon: Search, title: "Smart Search", desc: "Find the perfect grooming service based on location, budget, and preferences." },
  { icon: BarChart3, title: "Intelligent Analytics", desc: "Business insights powered by AI to help improve customer retention and revenue." },
  { icon: Gift, title: "Personalized Offers", desc: "Receive customized deals based on your preferences and booking history." },
];

const STEPS = [
  { icon: UserPlus, title: "Create your account" },
  { icon: MapPin, title: "Choose your city and explore nearby salons, barber shops, and beauty parlours" },
  { icon: SlidersHorizontal, title: "Compare services, prices, ratings, and reviews" },
  { icon: CalendarCheck, title: "Book your preferred time slot" },
  { icon: Star, title: "Enjoy your service and earn rewards" },
];

const WHY_BUSINESS = [
  "Increase customer reach",
  "Reduce no-shows",
  "Manage appointments efficiently",
  "Improve customer retention",
  "AI-powered business insights",
  "Digital payments",
  "Marketing automation",
  "Business analytics",
  "Staff management",
  "Inventory tracking",
  "Loyalty programs",
];

const VALUES = [
  { icon: Lightbulb, title: "Innovation", desc: "Building technology that solves real-world problems." },
  { icon: ShieldCheck, title: "Trust", desc: "Ensuring transparency and reliability for customers and businesses." },
  { icon: TrendingUp, title: "Growth", desc: "Helping businesses and professionals achieve sustainable success." },
  { icon: HeartHandshake, title: "Customer First", desc: "Delivering exceptional experiences through intelligent technology." },
];

const IMPACT = [
  { icon: Building2, value: "100,000+", label: "Salons, barber shops & beauty parlours" },
  { icon: Briefcase, value: "50,000+", label: "Independent professionals" },
  { icon: Users, value: "10,000,000+", label: "Customers" },
  { icon: Sparkles, value: "1000s", label: "Employment opportunities across India" },
];

const PartnerWithUs = () => {
  const [activePersona, setActivePersona] = useState("customer");
  const persona = PERSONAS.find((p) => p.key === activePersona);

  const [heroRef, heroVisible] = useRevealOnScroll();
  const [aiRef, aiVisible] = useRevealOnScroll();
  const [stepsRef, stepsVisible] = useRevealOnScroll();
  const [whyRef, whyVisible] = useRevealOnScroll();
  const [empowerRef, empowerVisible] = useRevealOnScroll();
  const [valuesRef, valuesVisible] = useRevealOnScroll();
  const [impactRef, impactVisible] = useRevealOnScroll();
  const [ctaRef, ctaVisible] = useRevealOnScroll();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SEO
        title="Partner With Us — Grow Your Salon Business"
        description="Join EzyCut as a salon partner, barber shop, or independent grooming professional. Get more bookings, manage staff, accept digital payments, and grow your brand."
        canonical="https://www.ezycut.co.in/partner-with-us"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(20,184,166,0.35); }
          100% { box-shadow: 0 0 0 10px rgba(20,184,166,0); }
        }
      `}</style>

      {/* ============ HERO + PERSONA SWITCHER ============ */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#f0fdfa] to-white overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="page-container relative">
          <div
            className={`text-center max-w-2xl mx-auto mb-12 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-[#ccfbf1] border border-[#5eead4] rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold text-[#0f766e] uppercase tracking-[0.08em] mb-5">
              <Sparkles size={12} />
              Partner With EzyCut
            </div>
            <h1 className="font-['Fraunces'] text-[clamp(2rem,4.5vw,3.2rem)] font-semibold text-[#042f2e] tracking-[-0.02em] leading-[1.15] mb-4">
              One Platform. Three Ways
              <span className="bg-gradient-to-r from-[#0d9488] to-[#14b8a6] bg-clip-text text-transparent"> to Grow.</span>
            </h1>
            <p className="text-[#3f4b49] text-[0.9375rem] md:text-base leading-relaxed">
              Whichever side of the chair you're on, EzyCut is built for how you actually work.
            </p>
          </div>

          {/* Persona tabs */}
          <div
            className={`flex flex-wrap justify-center gap-3 mb-10 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 ${
              heroVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: "120ms" }}
          >
            {PERSONAS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActivePersona(key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activePersona === key
                    ? "bg-[#0f766e] text-white shadow-[0_8px_20px_rgba(15,118,110,0.3)] scale-105"
                    : "bg-white text-[#134e4a] border border-[#99f6e4] hover:border-[#0d9488] hover:bg-[#f0fdfa]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Persona content panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <div key={persona.key} className="motion-safe:animate-[float-slow_0.01s] order-2 lg:order-1">
              <h2 className="font-['Fraunces'] text-2xl md:text-[1.75rem] font-semibold text-[#042f2e] tracking-[-0.01em] mb-3">
                {persona.title}
              </h2>
              <p className="text-[#3f4b49] text-[0.9375rem] leading-relaxed mb-5">{persona.desc}</p>
              <ul className="flex flex-col gap-2.5 mb-6">
                {persona.points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-[#134e4a]">
                    <CheckCircle2 size={16} className="text-[#0d9488] shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white font-bold text-sm px-6 py-3 rounded-xl no-underline shadow-[0_8px_24px_rgba(15,118,110,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,118,110,0.4)]"
              >
                Get Started <ArrowRight size={15} />
              </Link>
            </div>

            <div className="relative h-[280px] md:h-[340px] order-1 lg:order-2">
              <div
                key={persona.image}
                className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(4,47,46,0.18)] border-4 border-white motion-safe:animate-[float-slow_6s_ease-in-out_infinite]"
              >
                <img src={persona.image} alt={persona.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl bg-white shadow-[0_8px_24px_rgba(4,47,46,0.15)] flex items-center justify-center motion-safe:animate-[pulse-ring_2.4s_ease-in-out_infinite]">
                <persona.icon size={26} className="text-[#0d9488]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AI FEATURES ============ */}
      <section ref={aiRef} className="py-16 md:py-24 bg-[#042f2e]">
        <div className="page-container">
          <div
            className={`text-center mb-14 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              aiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-[rgba(94,234,212,0.12)] border border-[rgba(94,234,212,0.3)] rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold text-[#5eead4] uppercase tracking-[0.08em] mb-4">
              <Sparkles size={12} />
              AI Features
            </div>
            <h2 className="font-['Fraunces'] text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-white tracking-[-0.02em]">
              Intelligence Built Into Every Booking
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AI_FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`bg-[#0b3d38] border border-white/5 rounded-2xl p-6 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 hover:border-[#14b8a6]/40 hover:-translate-y-1.5 group ${
                  aiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[rgba(20,184,166,0.15)] border border-[rgba(20,184,166,0.3)] text-[#5eead4] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-white text-[0.9375rem] mb-1.5">{title}</h3>
                <p className="text-[#a8bfba] text-[0.8125rem] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW EZYCUT WORKS ============ */}
      <section ref={stepsRef} className="py-16 md:py-24 bg-white">
        <div className="page-container">
          <div
            className={`text-center mb-16 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="font-['Fraunces'] text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-[#042f2e] tracking-[-0.02em] mb-3">
              How EzyCut Works
            </h2>
            <p className="text-[#5b6b68] text-[0.9375rem]">Five simple steps from sign-up to service.</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="hidden md:block absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-[#14b8a6] via-[#5eead4] to-transparent" />
            <div className="flex flex-col gap-8">
              {STEPS.map(({ icon: Icon, title }, i) => (
                <div
                  key={title}
                  className={`flex items-start gap-5 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-x-0 ${
                    stepsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
                  }`}
                  style={{ transitionDelay: `${i * 130}ms` }}
                >
                  <div className="relative z-10 shrink-0 w-12 h-12 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-bold shadow-[0_6px_16px_rgba(15,118,110,0.3)]">
                    {i + 1}
                  </div>
                  <div className="flex items-center gap-3 bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl px-5 py-4 flex-1">
                    <Icon size={18} className="text-[#0d9488] shrink-0" />
                    <p className="text-[#134e4a] text-sm md:text-[0.9375rem] font-medium">{title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY BUSINESSES CHOOSE EZYCUT ============ */}
      <section ref={whyRef} className="py-16 md:py-24 bg-[#f0fdfa] border-t border-[#ccfbf1]">
        <div className="page-container">
          <div
            className={`text-center mb-12 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="font-['Fraunces'] text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-[#042f2e] tracking-[-0.02em]">
              Why Businesses Choose EzyCut
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {WHY_BUSINESS.map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-3 bg-white border border-[#ccfbf1] rounded-xl px-4 py-3.5 motion-safe:transition-all motion-safe:duration-500 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 hover:border-[#14b8a6] hover:shadow-[0_6px_16px_rgba(15,118,110,0.1)] ${
                  whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <CheckCircle2 size={18} className="text-[#0d9488] shrink-0" />
                <span className="text-[#134e4a] text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EMPLOYMENT & EMPOWERMENT ============ */}
      <section ref={empowerRef} className="py-16 md:py-24 bg-white border-t border-[#ccfbf1]">
        <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`relative h-[300px] md:h-[360px] motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-x-0 ${
              empowerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="absolute rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(4,47,46,0.15)] border-4 border-white w-full h-full">
              <img src={beauticianTreatment} alt="Beautician giving a facial treatment" className="w-full h-full object-cover" />
            </div>
          </div>

          <div
            className={`motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-x-0 ${
              empowerVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="inline-flex items-center gap-2 bg-[#ccfbf1] border border-[#5eead4] rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold text-[#0f766e] uppercase tracking-[0.08em] mb-5">
              <Briefcase size={12} />
              Employment &amp; Empowerment
            </div>
            <h2 className="font-['Fraunces'] text-[clamp(1.4rem,3vw,2.1rem)] font-semibold text-[#042f2e] tracking-[-0.02em] mb-4">
              Building Sustainable Careers, Not Just Bookings
            </h2>
            <p className="text-[#3f4b49] text-[0.9375rem] leading-relaxed mb-4">
              EzyCut is committed to creating sustainable employment opportunities by
              enabling skilled hairstylists, barbers, beauticians, and makeup artists
              to provide home services — even without owning a salon or beauty parlour.
            </p>
            <p className="text-[#3f4b49] text-[0.9375rem] leading-relaxed">
              We believe technology should empower entrepreneurs and create inclusive
              economic growth.
            </p>
          </div>
        </div>
      </section>

      {/* ============ OUR VALUES ============ */}
      <section ref={valuesRef} className="py-16 md:py-24 bg-[#f0fdfa] border-t border-[#ccfbf1]">
        <div className="page-container">
          <div
            className={`text-center mb-14 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="font-['Fraunces'] text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-[#042f2e] tracking-[-0.02em]">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`bg-white border border-[#ccfbf1] rounded-2xl p-7 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 hover:border-[#14b8a6] hover:shadow-[0_12px_32px_rgba(15,118,110,0.1)] hover:-translate-y-1.5 group ${
                  valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[#ccfbf1] border border-[#5eead4] text-[#0f766e] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12">
                  <Icon size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#042f2e] mb-1.5">{title}</h3>
                <p className="text-[#5b6b68] text-[0.8125rem] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OUR IMPACT ============ */}
      <section ref={impactRef} className="py-16 md:py-24 bg-[#042f2e]">
        <div className="page-container">
          <div
            className={`text-center mb-14 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              impactVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="font-['Fraunces'] text-[clamp(1.6rem,3vw,2.3rem)] font-semibold text-white tracking-[-0.02em] mb-3">
              Our Impact
            </h2>
            <p className="text-[#a8bfba] text-[0.9375rem] max-w-xl mx-auto">
              Our goal is to empower a nationwide grooming ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className={`bg-[#0b3d38] border border-white/5 rounded-2xl p-6 text-center motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 hover:border-[#14b8a6]/40 hover:-translate-y-1 ${
                  impactVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[rgba(20,184,166,0.15)] border border-[rgba(20,184,166,0.3)] text-[#5eead4] flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} />
                </div>
                <div className="font-['Fraunces'] text-2xl md:text-3xl font-semibold text-white tracking-[-0.02em] mb-1">
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-[#a8bfba] text-[0.75rem] leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ JOIN CTA ============ */}
      <section ref={ctaRef} className="py-16 md:py-24 bg-white border-t border-[#ccfbf1]">
        <div className="page-container">
          <div
            className={`rounded-[28px] p-[2px] bg-gradient-to-r from-[#0f766e] via-[#14b8a6] to-[#5eead4] max-w-3xl mx-auto motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-white rounded-[26px] px-8 py-12 md:px-14 md:py-14 text-center flex flex-col items-center gap-5">
              <h2 className="font-['Fraunces'] text-[clamp(1.4rem,3vw,2.1rem)] font-semibold text-[#042f2e] tracking-[-0.02em] m-0">
                Join EzyCut
              </h2>
              <p className="text-[#5b6b68] text-[0.9375rem] max-w-md m-0 leading-relaxed">
                Whether you are a customer looking for quality grooming services, a
                business owner seeking digital transformation, or an independent
                professional ready to grow your career — EzyCut is your trusted
                partner. Experience the future of beauty and grooming.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white font-bold text-base px-8 py-3.5 rounded-xl no-underline shadow-[0_8px_24px_rgba(15,118,110,0.3)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(15,118,110,0.4)]"
              >
                Join EzyCut <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerWithUs;
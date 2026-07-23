import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";
import {
  Target,
  Eye,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  HeartHandshake,
  Building2,
  Users,
  Sparkles,
  Briefcase,
  ArrowRight,
} from "lucide-react";

import salonInterior from "../../assets/salon-interior-luxury.jpg";
import barberCloseup from "../../assets/barber-styling-closeup.jpg";
import mobileGroomer from "../../assets/mobile-groomer-home.jpg";
import stylistPortrait from "../../assets/stylist-portrait-work.jpg";

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

/* ---------- Animated counter (counts up when in view) ---------- */
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

        const prefersReduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
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

  if (numeric === null) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      {display ?? "0"}
      {suffix}
    </span>
  );
}

/* ---------- Signature wave divider ---------- */
function WaveDivider({ flip = false, fromColor = "#f7f9f8", toColor = "#0c0c0e" }) {
  return (
    <div
      className={`relative h-16 md:h-24 overflow-hidden ${flip ? "rotate-180" : ""}`}
      style={{ background: flip ? toColor : fromColor }}
      aria-hidden="true"
    >
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-full motion-safe:animate-[wave-drift_22s_linear_infinite] motion-reduce:animate-none"
        viewBox="0 0 2400 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 C1400,120 1600,0 1800,60 C2000,120 2200,0 2400,60 L2400,120 L0,120 Z"
          fill={flip ? fromColor : toColor}
        />
      </svg>
    </div>
  );
}

const AboutUs = () => {
  const [heroRef, heroVisible] = useRevealOnScroll();
  const [mvRef, mvVisible] = useRevealOnScroll();
  const [valuesRef, valuesVisible] = useRevealOnScroll();
  const [impactRef, impactVisible] = useRevealOnScroll();
  const [empowerRef, empowerVisible] = useRevealOnScroll();
  const [ctaRef, ctaVisible] = useRevealOnScroll();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SEO
        title="About Us — Our Story & Mission"
        description="Learn about EzyCut's mission to digitize India's grooming industry. We bridge the gap between customers and salons with smart appointment booking and queue tracking."
        canonical="https://www.ezycut.co.in/about"
      />
      {/* Distinctive display font, loaded once for this page */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
        @keyframes wave-drift {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        @keyframes shimmer-badge {
          0%, 100% { box-shadow: 0 0 0 0 rgba(163,196,179,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(163,196,179,0); }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#09090b] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(111,148,131,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(163,196,179,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="page-container relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div
              className="inline-flex items-center gap-2 bg-[rgba(111,148,131,0.12)] border border-[rgba(111,148,131,0.35)] rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold text-[#a3c4b3] uppercase tracking-[0.08em] mb-5 motion-safe:animate-[shimmer-badge_2.4s_ease-in-out_infinite]"
            >
              <Sparkles size={12} />
              About EzyCut
            </div>
            <h1 className="font-['Fraunces'] text-[clamp(2rem,4.5vw,3.4rem)] font-semibold text-white tracking-[-0.02em] leading-[1.15] mb-5">
              Transforming the Beauty &amp; Grooming
              <span className="bg-gradient-to-r from-[#6f9483] to-[#a3c4b3] bg-clip-text text-transparent italic"> Industry</span>
              , One Cut at a Time
            </h1>
            <p className="text-[rgba(244,244,245,0.75)] text-[0.9375rem] md:text-base leading-relaxed max-w-xl">
              EzyCut Solutions Private Limited is building India's next-generation
              AI-powered platform for salons, barber shops, beauty parlours, and
              independent grooming professionals — simplifying business operations,
              enhancing customer experiences, and creating new employment
              opportunities through innovative technology.
            </p>
          </div>

          <div
            className={`relative h-[320px] md:h-[400px] motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!scale-100 ${
              heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="absolute rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-4 border-white/10 w-[70%] h-[85%] top-0 right-0 motion-safe:animate-[float-slow_7s_ease-in-out_infinite] group">
              <img
                src={salonInterior}
                alt="EzyCut partner salon interior"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div
              className="absolute rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)] border-4 border-white/10 w-[46%] h-[55%] bottom-0 left-0 motion-safe:animate-[float-slow_8s_ease-in-out_infinite] group"
              style={{ animationDelay: "1.2s" }}
            >
              <img
                src={barberCloseup}
                alt="Barber styling a client"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fromColor="#f7f9f8" toColor="#09090b" />

      {/* ============ MISSION & VISION ============ */}
      <section ref={mvRef} className="pt-2 pb-16 md:pb-24 bg-[#f7f9f8]">
        <div className="page-container grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "To digitally transform the salon, barber shop, and beauty parlour ecosystem by delivering innovative technology that empowers businesses, creates employment, and makes grooming services accessible, transparent, and convenient for everyone.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              desc: "To build India's most trusted AI-powered beauty and grooming ecosystem, connecting millions of customers, salon businesses, barber shops, beauty parlours, and independent professionals on one intelligent platform while expanding globally.",
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`rounded-[28px] p-[2px] bg-gradient-to-br from-[#6f9483] via-[#a3c4b3] to-[#4d6c5c] motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 hover:shadow-[0_16px_40px_rgba(111,148,131,0.25)] ${
                mvVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="bg-white rounded-[26px] p-8 md:p-10 h-full group">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(111,148,131,0.12)] border border-[rgba(111,148,131,0.3)] text-[#4d6c5c] flex items-center justify-center mb-5 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Icon size={26} />
                </div>
                <h3 className="font-['Fraunces'] text-xl font-semibold text-[#1a1a1a] mb-3">{title}</h3>
                <p className="text-[#52525b] text-[0.9375rem] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ OUR VALUES ============ */}
      <section ref={valuesRef} className="py-16 md:py-24 bg-white border-t border-black/5">
        <div className="page-container">
          <div
            className={`text-center mb-14 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="font-['Fraunces'] text-[clamp(1.6rem,3vw,2.4rem)] font-semibold text-[#1a1a1a] tracking-[-0.02em] mb-3">
              Our Values
            </h2>
            <p className="text-[#71717a] text-[0.9375rem] max-w-xl mx-auto">
              The principles that guide everything we build at EzyCut.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lightbulb, title: "Innovation", desc: "Building technology that solves real-world problems." },
              { icon: ShieldCheck, title: "Trust", desc: "Ensuring transparency and reliability for customers and businesses." },
              { icon: TrendingUp, title: "Growth", desc: "Helping businesses and professionals achieve sustainable success." },
              { icon: HeartHandshake, title: "Customer First", desc: "Delivering exceptional experiences through intelligent technology." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`bg-[#f7f9f8] border border-black/5 rounded-2xl p-7 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 hover:border-[rgba(111,148,131,0.35)] hover:shadow-[0_12px_32px_rgba(23,24,26,0.08)] hover:-translate-y-1.5 group ${
                  valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[rgba(111,148,131,0.12)] border border-[rgba(111,148,131,0.3)] text-[#4d6c5c] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12">
                  <Icon size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#1a1a1a] mb-1.5">{title}</h3>
                <p className="text-[#71717a] text-[0.8125rem] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider flip fromColor="#ffffff" toColor="#0c0c0e" />

      {/* ============ OUR IMPACT ============ */}
      <section ref={impactRef} className="pt-2 pb-16 md:pb-24 bg-[#0c0c0e]">
        <div className="page-container">
          <div
            className={`text-center mb-14 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              impactVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h2 className="font-['Fraunces'] text-[clamp(1.6rem,3vw,2.4rem)] font-semibold text-white tracking-[-0.02em] mb-3">
              Our Impact
            </h2>
            <p className="text-[#a1a1aa] text-[0.9375rem] max-w-xl mx-auto">
              Our goal is to empower a nationwide grooming ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, value: "100,000+", label: "Salons, Barber Shops & Parlours" },
              { icon: Briefcase, value: "50,000+", label: "Independent Professionals" },
              { icon: Users, value: "10,000,000+", label: "Customers" },
              { icon: Sparkles, value: "1000s", label: "Employment Opportunities" },
            ].map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className={`bg-[#111113] border border-white/5 rounded-2xl p-6 text-center motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 hover:border-[rgba(212,175,55,0.2)] hover:-translate-y-1 ${
                  impactVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[rgba(111,148,131,0.12)] border border-[rgba(111,148,131,0.3)] text-[#6f9483] flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} />
                </div>
                <div className="font-['Fraunces'] text-2xl md:text-3xl font-semibold text-white tracking-[-0.02em] mb-1">
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-[#a1a1aa] text-[0.75rem] leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EMPLOYMENT & EMPOWERMENT ============ */}
      <section ref={empowerRef} className="py-16 md:py-24 bg-white border-t border-black/5">
        <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`relative h-[300px] md:h-[380px] order-2 lg:order-1 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-x-0 ${
              empowerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="absolute rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(23,24,26,0.18)] border-4 border-white w-[75%] h-full left-0 top-0 group">
              <img
                src={mobileGroomer}
                alt="Independent grooming professional visiting a client"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(23,24,26,0.2)] border-4 border-white w-[45%] h-[55%] right-0 bottom-0 group">
              <img
                src={stylistPortrait}
                alt="Professional stylist at work"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          <div
            className={`order-1 lg:order-2 motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-x-0 ${
              empowerVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="inline-flex items-center gap-2 bg-[rgba(111,148,131,0.1)] border border-[rgba(111,148,131,0.3)] rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold text-[#4d6c5c] uppercase tracking-[0.08em] mb-5">
              <Briefcase size={12} />
              Employment &amp; Empowerment
            </div>
            <h2 className="font-['Fraunces'] text-[clamp(1.4rem,3vw,2.1rem)] font-semibold text-[#1a1a1a] tracking-[-0.02em] mb-4">
              Empowering Professionals, Creating Opportunities
            </h2>
            <p className="text-[#52525b] text-[0.9375rem] leading-relaxed mb-4">
              EzyCut is committed to creating sustainable employment opportunities
              by enabling skilled hairstylists, barbers, beauticians, and makeup
              artists to provide home services — even without owning a salon or
              beauty parlour.
            </p>
            <p className="text-[#52525b] text-[0.9375rem] leading-relaxed">
              We believe technology should empower entrepreneurs and create
              inclusive economic growth across India.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section ref={ctaRef} className="py-16 md:py-24 bg-[#f7f9f8] border-t border-black/5">
        <div className="page-container">
          <div
            className={`rounded-[28px] p-[2px] bg-gradient-to-r from-[#4d6c5c] via-[#6f9483] to-[#a3c4b3] max-w-3xl mx-auto motion-safe:transition-all motion-safe:duration-700 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
              ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-white rounded-[26px] px-8 py-12 md:px-14 md:py-14 text-center flex flex-col items-center gap-5">
              <h2 className="font-['Fraunces'] text-[clamp(1.4rem,3vw,2.1rem)] font-semibold text-[#1a1a1a] tracking-[-0.02em] m-0">
                Join the EzyCut Movement
              </h2>
              <p className="text-[#71717a] text-[0.9375rem] max-w-md m-0 leading-relaxed">
                Whether you're a customer, a business owner, or an independent
                professional — EzyCut is your trusted partner in the future of
                beauty and grooming.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4d6c5c] to-[#6f9483] text-white font-bold text-base px-8 py-3.5 rounded-xl no-underline shadow-[0_8px_24px_rgba(77,108,92,0.3)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(77,108,92,0.4)]"
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

export default AboutUs;
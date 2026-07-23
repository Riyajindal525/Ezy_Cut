import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/common/SEO";
import {
  ArrowRight,
  Scissors,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  CreditCard,
  LayoutDashboard,
  Home as HomeIcon,
  UserPlus,
  MapPin,
  ListChecks,
  CalendarCheck,
  Gift,
  Users,
  Store,
  Radar
} from "lucide-react";
import useAuthStore from "../../store/auth.store";
import { useNavigate } from "react-router-dom";

import video1 from "../../assets/videos/3996906-uhd_4096_2160_25fps.mp4";
import video2 from "../../assets/videos/4177951-hd_1920_1080_30fps.mp4";
import video3 from "../../assets/videos/7426317-uhd_2560_1080_25fps.mp4";
import video4 from "../../assets/videos/7426389-uhd_2560_1080_25fps.mp4";
import video5 from "../../assets/videos/7754402-hd_1920_1080_30fps.mp4";

import womenMakeup from "../../assets/womnmakeup.jpg";
import hairTreatment from "../../assets/hairtreatment.jpg";
import menGrooming from "../../assets/mengrooming.jpg";
import spaTreatment from "../../assets/spatreatment.jpg";
import barberImg from "../../assets/Barberimg.png";

const slides = [
  { video: video1, badge: "Elite Grooming Simplified", title: "Book Salon Appointments", highlight: "Without Waiting", desc: "Discover elite local salons and secure your slot in seconds." },
  { video: video2, badge: "Real-Time Experience", title: "Track Your Queue", highlight: "Live, Anywhere", desc: "Know exactly when it's your turn — no more waiting rooms." },
  { video: video3, badge: "Verified & Trusted", title: "Handpicked Stylists", highlight: "Near You", desc: "Every salon is verified for quality, hygiene, and service." },
  { video: video4, badge: "Seamless Booking", title: "Reserve In Seconds", highlight: "Anytime, Anywhere", desc: "Pick your service, choose your time, and you're all set." },
  { video: video5, badge: "Premium Experience", title: "Style That", highlight: "Fits Your Life", desc: "Join thousands who've made grooming effortless with EzyCut." },
];

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

const Home = () => {
  const token = useAuthStore((state) => state.token);
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => setActiveSlide(index);

  const [featuresRef, featuresVisible] = useRevealOnScroll();
  const [stepsRef, stepsVisible] = useRevealOnScroll();
  const [ctaRef, ctaVisible] = useRevealOnScroll();
  const [trustRef, trustVisible] = useRevealOnScroll();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] overflow-x-hidden pb-10">
      <SEO
        title="Smart Salon Booking & Queue Management"
        description="Book salon appointments online, skip the queue, and get AI-powered grooming recommendations. Find top salons near you — EzyCut, India's smartest salon platform."
        canonical="https://www.ezycut.co.in/"
      />
      {/* ============ HERO VIDEO SLIDESHOW ============ */}
<section className="relative w-full h-[100svh] min-h-[560px] max-h-[900px] overflow-hidden bg-[#09090b]">
  {/* Background video slides */}
  {slides.map((slide, index) => (
    <div
      key={index}
      className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
        index === activeSlide ? "opacity-100 z-[1]" : "opacity-0 z-0"
      }`}
    >
      <video
        className="w-full h-full object-cover absolute inset-0 animate-[ezcKenBurns_12s_ease-in-out_infinite_alternate]"
        src={slide.video}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(9,9,11,0.8)] via-[rgba(9,20,17,0.55)] to-[rgba(9,9,11,0.9)]" />
    </div>
  ))}

  <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-[radial-gradient(circle,rgba(111,148,131,0.18)_0%,transparent_70%)] pointer-events-none z-[2]" />

  {/* Text content overlay — sits ON TOP of the video, never pushes section height */}
  <div className="absolute inset-0 z-[3] flex flex-col justify-center pointer-events-none">
    <div className="w-full px-5 sm:px-8 md:px-12 lg:px-20 max-w-screen-2xl mx-auto flex flex-col items-start text-left gap-4 sm:gap-6 md:gap-7">
      <div className="relative w-full max-w-[90%] sm:max-w-[520px] md:max-w-[620px] lg:max-w-[700px] min-h-[190px] xs:min-h-[210px] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[340px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex flex-col items-start text-left justify-center gap-3 sm:gap-4 md:gap-5 transition-opacity duration-[900ms] ease-in-out pointer-events-auto ${
              index === activeSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-[rgba(111,148,131,0.12)] border border-[rgba(111,148,131,0.35)] rounded-full px-3 py-1.5 text-[0.625rem] sm:text-[0.6875rem] font-semibold text-[#a3c4b3] uppercase tracking-[0.08em] backdrop-blur-[8px] animate-[ezcFadeUp_0.8s_ease_both]">
              <Scissors size={12} />
              {slide.badge}
            </div>
            <h1 className="text-[clamp(1.5rem,6vw,3.25rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.2] m-0 [text-shadow:0_6px_24px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.4)] animate-[ezcFadeUp_0.9s_ease_0.1s_both]">
              {slide.title} <br />
              <span className="bg-gradient-to-r from-[#6f9483] to-[#a3c4b3] bg-clip-text text-transparent [text-shadow:none]">
                {slide.highlight}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[rgba(244,244,245,0.8)] max-w-[90%] sm:max-w-[480px] md:max-w-[520px] leading-relaxed m-0 animate-[ezcFadeUp_1s_ease_0.2s_both]">
              {slide.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="relative z-[4] mt-2 sm:mt-4 md:mt-6 pointer-events-auto">
        {token ? (
          <Link
            to="/salons"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4d6c5c] to-[#6f9483] text-white font-bold text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl no-underline shadow-[0_8px_24px_rgba(77,108,92,0.35)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(77,108,92,0.45)]"
          >
            Explore Salons <ArrowRight size={18} />
          </Link>
        ) : (
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4d6c5c] to-[#6f9483] text-white font-bold text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl no-underline shadow-[0_8px_24px_rgba(77,108,92,0.35)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(77,108,92,0.45)]"
          >
            Join EzyCut <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  </div>

  {/* Slide dots */}
  <div className="absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-9 flex gap-2 z-[4] pointer-events-auto">
    {slides.map((_, index) => (
      <button
        key={index}
        className={`rounded-full border-none cursor-pointer transition-all duration-300 p-0 ${
          index === activeSlide ? "w-6 sm:w-7 h-[0.3rem] bg-[#6f9483]" : "w-[0.3rem] h-[0.3rem] bg-[rgba(255,255,255,0.3)]"
        }`}
        onClick={() => goToSlide(index)}
        aria-label={`Go to slide ${index + 1}`}
      />
    ))}
  </div>

  {/* Scroll indicator — hidden on very small screens to avoid crowding */}
  <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[4] flex-col items-center gap-2 text-[rgba(244,244,245,0.6)]">
    <span className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase">Scroll</span>
    <div className="w-5 h-8 border-[1.5px] border-[rgba(244,244,245,0.35)] rounded-full flex justify-center pt-1.5">
      <span className="w-[3px] h-[6px] bg-[#6f9483] rounded-full animate-[ezcScrollDot_1.8s_ease-in-out_infinite]" />
    </div>
  </div>
</section>

     {/* ============ WHY EZYCUT SECTION ============ */}
      <section
        ref={featuresRef}
        className="py-14 md:py-24 bg-[#f7f9f8] border-t border-black/5 overflow-hidden"
      >
        <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: description card */}
          <div
            className={`rounded-[28px] p-[2px] bg-gradient-to-br from-[#6f9483] via-[#a3c4b3] to-[#4d6c5c] transition-all duration-700 ${
              featuresVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="bg-white rounded-[26px] p-7 md:p-11">
              <div className="inline-flex items-center gap-2 bg-[rgba(111,148,131,0.1)] border border-[rgba(111,148,131,0.3)] rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold text-[#4d6c5c] uppercase tracking-[0.08em] mb-5">
                <Sparkles size={12} />
                Why EzyCut
              </div>
              <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-[#1a1a1a] tracking-[-0.02em] leading-[1.3] mb-4">
                India's AI-Powered Platform for
                <span className="bg-gradient-to-r from-[#4d6c5c] to-[#6f9483] bg-clip-text text-transparent"> Salons &amp; Grooming</span>
              </h2>
              <p className="text-[#52525b] text-[0.9375rem] leading-relaxed mb-8">
                EzyCut simplifies business operations, enhances customer
                experiences, and creates new employment opportunities through
                innovative technology — from booking and payments to AI-driven
                insights.
              </p>

              <div className="flex flex-col gap-5">
                {[
                  { icon: Calendar, title: "Smart Appointment Booking", desc: "Book instantly with real-time availability." },
                  { icon: Sparkles, title: "AI Recommendations", desc: "Personalized suggestions for hairstyles & grooming." },
                  { icon: ShieldCheck, title: "Trusted Professionals", desc: "Connect with verified salons & experts." },
                  { icon: CreditCard, title: "Secure Payments", desc: "Pay via UPI, cards, wallets & more." },
                  { icon: LayoutDashboard, title: "Business Dashboard", desc: "Manage bookings, CRM & analytics with ease." },
                  { icon: HomeIcon, title: "Home Services", desc: "Trusted professionals at your doorstep." },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className={`flex items-start gap-3.5 transition-all duration-500 ${
                      featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[rgba(111,148,131,0.12)] border border-[rgba(111,148,131,0.3)] text-[#4d6c5c] flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-[0.9375rem] font-bold text-[#1a1a1a] mb-0.5">{title}</h4>
                      <p className="text-[0.8125rem] text-[#71717a] leading-snug m-0">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: image showcase */}
         {/* Right: image showcase */}
          <div className="relative min-h-[420px] md:min-h-[500px] lg:min-h-[580px] mb-8 lg:mb-0">
            <div className="absolute w-[280px] h-[280px] rounded-full blur-[50px] pointer-events-none z-0 bg-[rgba(111,148,131,0.25)] -top-10 -right-5" />
            <div className="absolute w-[220px] h-[220px] rounded-full blur-[50px] pointer-events-none z-0 bg-[rgba(163,196,179,0.3)] -bottom-8 -left-8" />

            <div
              className={`absolute rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(23,24,26,0.18)] border-4 border-white z-[1] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-[68%] h-[260px] md:h-[300px] lg:h-[380px] top-10 left-0 group ${
                featuresVisible ? "opacity-100 translate-y-0 scale-100 rotate-0" : "opacity-0 translate-y-14 scale-90 -rotate-2"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <img src={womenMakeup} alt="Makeup & styling service" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
            </div>

            <div
              className={`absolute rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(23,24,26,0.18)] border-4 border-white z-[1] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-[42%] h-[150px] md:h-[170px] lg:h-[190px] -top-5 right-0 group ${
                featuresVisible ? "opacity-100 translate-y-0 translate-x-0 rotate-0" : "opacity-0 -translate-y-10 translate-x-8 rotate-3"
              }`}
              style={{ transitionDelay: "320ms" }}
            >
              <img src={hairTreatment} alt="Hair treatment service" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
            </div>

            <div
              className={`absolute rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(23,24,26,0.18)] border-4 border-white z-[1] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-[42%] h-[150px] md:h-[170px] lg:h-[190px] top-[260px] md:top-[300px] lg:top-[380px] right-5 group ${
                featuresVisible ? "opacity-100 translate-y-0 translate-x-0 rotate-0" : "opacity-0 translate-y-10 translate-x-8 -rotate-3"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <img src={menGrooming} alt="Men's grooming service" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
            </div>

            <div
              className={`absolute rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(23,24,26,0.18)] border-4 border-white z-[2] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-[38%] h-[110px] md:h-[130px] lg:h-[150px] top-[210px] md:top-[250px] lg:top-[320px] left-[6%] group ${
                featuresVisible ? "opacity-100 translate-y-0 scale-100 rotate-0" : "opacity-0 translate-y-10 scale-90 rotate-2"
              }`}
              style={{ transitionDelay: "680ms" }}
            >
              <img src={spaTreatment} alt="Spa treatment service" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
            </div>
          </div>
        </div>
      </section>

     {/* ============ HOW EZYCUT WORKS ============ */}
      <section
        ref={stepsRef}
        className="py-14 md:py-24 bg-white border-t border-black/5 overflow-hidden"
      >
        <div className="page-container">
          <div
            className={`text-center mb-14 md:mb-20 transition-all duration-700 ${
              stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-[rgba(111,148,131,0.1)] border border-[rgba(111,148,131,0.3)] rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold text-[#4d6c5c] uppercase tracking-[0.08em] mb-4">
              <ListChecks size={12} />
              How It Works
            </div>
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-[#1a1a1a] tracking-[-0.02em] mb-3">
              5 Simple Steps to
              <span className="bg-gradient-to-r from-[#4d6c5c] to-[#6f9483] bg-clip-text text-transparent"> Waitless Styling</span>
            </h2>
            <p className="text-[#71717a] text-[0.9375rem] max-w-xl mx-auto">
              From signup to your appointment — EzyCut makes every step effortless.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-[38px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#a3c4b3] to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6 relative z-10">
              {[
                { icon: UserPlus, title: "Create Account", desc: "Sign up in seconds and set up your profile." },
                { icon: MapPin, title: "Choose Your City", desc: "Explore nearby salons, barbers & parlours." },
                { icon: ListChecks, title: "Compare & Choose", desc: "Check services, prices, ratings & reviews." },
                { icon: CalendarCheck, title: "Book Your Slot", desc: "Pick your preferred time and confirm instantly." },
                { icon: Gift, title: "Enjoy & Earn", desc: "Get styled and earn rewards on every visit." },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className={`flex flex-col items-center text-center transition-all duration-700 ${
                    stepsVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                  }`}
                  style={{ transitionDelay: `${i * 130}ms` }}
                >
                  <div className="relative mb-5">
                    <div className="w-[76px] h-[76px] rounded-full bg-white border-2 border-[rgba(111,148,131,0.3)] shadow-[0_8px_24px_rgba(23,24,26,0.08)] flex items-center justify-center text-[#4d6c5c] transition-all duration-300 hover:border-[#6f9483] hover:shadow-[0_12px_32px_rgba(111,148,131,0.25)] hover:-translate-y-1">
                      <Icon size={26} />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-[#4d6c5c] to-[#6f9483] text-white text-[0.6875rem] font-extrabold flex items-center justify-center shadow-[0_2px_8px_rgba(77,108,92,0.4)]">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-base text-[#1a1a1a] mb-1.5">{title}</h3>
                  <p className="text-[#71717a] text-[0.8125rem] leading-relaxed max-w-[200px]">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={ctaRef}
            className={`mt-20 md:mt-24 transition-all duration-[800ms] ${
              ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="rounded-[28px] p-[2px] bg-gradient-to-r from-[#4d6c5c] via-[#6f9483] to-[#a3c4b3] max-w-3xl mx-auto">
              <div className="bg-white rounded-[26px] px-8 py-12 md:px-14 md:py-14 text-center flex flex-col items-center gap-5">
                <h2 className="text-[clamp(1.375rem,3vw,2rem)] font-black text-[#1a1a1a] tracking-[-0.02em] m-0">
                  Ready to Book Your Next Stylist?
                </h2>
                <p className="text-[#71717a] text-[0.9375rem] max-w-md m-0 leading-relaxed">
                  Create an account today and enjoy a premium, waitless grooming routine.
                </p>
                {!token && (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4d6c5c] to-[#6f9483] text-white font-bold text-base px-8 py-3.5 rounded-xl no-underline shadow-[0_8px_24px_rgba(77,108,92,0.3)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(77,108,92,0.4)]"
                  >
                    Join EzyCut <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
<section
  ref={trustRef}
  className="relative overflow-hidden py-14 md:py-20 bg-white border-t border-gray-100"
>
  {/* subtle teal glows */}
  <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.06)_0%,transparent_70%)] pointer-events-none" />
  <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.06)_0%,transparent_70%)] pointer-events-none" />

  <div className="page-container relative">

    <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
      {[
        { icon: Users, value: "10,000+", label: "Happy Customers" },
        { icon: Store, value: "500+", label: "Partner Salons" },
        { icon: ShieldCheck, value: "100%", label: "Secure Payments" },
        { icon: Radar, value: "Live", label: "Queue Tracking" },
      ].map(({ icon: Icon, value, label }, i) => (
        <div
          key={label}
          className={`group flex items-center gap-3.5 bg-white border border-gray-200 rounded-2xl px-5 py-4 min-w-[220px] transition-all duration-500 hover:border-[#0d9488]/30 hover:shadow-[0_8px_24px_rgba(13,148,136,0.1)] hover:-translate-y-1 ${
            trustVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <div className="w-11 h-11 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#0d9488] group-hover:border-[#0d9488]">
            <Icon size={19} className="text-[#0d9488] transition-colors duration-300 group-hover:text-white" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-[#022525] leading-none">{value}</div>
            <div className="text-xs font-semibold text-[#5b6b68] mt-1">{label}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* ============ ILLUSTRATION + MESSAGE STRIP ============ */}
<section className="relative overflow-hidden bg-gradient-to-br from-[#f0fdfa] via-white to-[#f0fdfa] py-16 md:py-20 border-t border-gray-100">
  <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.08)_0%,transparent_70%)] pointer-events-none" />

  <div className="page-container relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
{/* Barber photo illustration */}
<div
  className={`relative flex justify-center transition-all duration-700 ${
    trustVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
  }`}
>
  <style>{`
    @keyframes ezcFloatSlow {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-14px); }
    }
    @keyframes ezcSparkle {
      0%, 100% { opacity: 0.25; transform: scale(0.85); }
      50% { opacity: 1; transform: scale(1.15); }
    }
  `}</style>

  <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center isolate">
    {/* teal backdrop circles */}
    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.22)_0%,transparent_70%)]" />

    {/* isolated blend group — teal base + photo blended together, contained */}
    <div className="absolute inset-[8%] rounded-full overflow-hidden isolate">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f766e] to-[#134e4a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(94,234,212,0.35)_0%,transparent_60%)]" />

      {/* barber photo — floats gently, white bg blended into teal via multiply */}
      <div
        className="absolute inset-0 flex items-end justify-center"
        style={{ animation: "ezcFloatSlow 5s ease-in-out infinite" }}
      >
        <img
          src={barberImg}
          alt="EzyCut barber"
          className="w-full h-full object-cover object-top scale-[1.15] mix-blend-multiply"
          style={{ height: "100%", width: "100%" }}
        />
      </div>

      {/* soft bottom fade so feet/edges blend into the teal circle */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_-30px_50px_-10px_rgba(4,47,46,0.35)] pointer-events-none" />
    </div>

    {/* floating sparkle dots — sit outside the blend group so they stay crisp */}
    <span
      className="absolute top-[8%] left-[10%] w-3 h-3 rounded-full bg-[#5eead4] z-[2]"
      style={{ animation: "ezcSparkle 2.4s ease-in-out infinite" }}
    />
    <span
      className="absolute top-[18%] right-[6%] w-2.5 h-2.5 rounded-full bg-[#2dd4bf] z-[2]"
      style={{ animation: "ezcSparkle 2s ease-in-out infinite 0.4s" }}
    />
    <span
      className="absolute bottom-[10%] right-[10%] w-3 h-3 rounded-full bg-[#99f6e4] z-[2]"
      style={{ animation: "ezcSparkle 2.8s ease-in-out infinite 0.8s" }}
    />
    <span
      className="absolute bottom-[16%] left-[6%] w-2 h-2 rounded-full bg-[#5eead4] z-[2]"
      style={{ animation: "ezcSparkle 2.2s ease-in-out infinite 1.1s" }}
    />

    {/* thin ring accent */}
    <div className="absolute inset-[8%] rounded-full border border-white/15 pointer-events-none z-[2]" />
  </div>
</div>
    {/* Message box */}
    <div
      className={`transition-all duration-700 ${
        trustVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
      style={{ transitionDelay: "150ms" }}
    >
      <span className="inline-flex items-center gap-1.5 bg-white border border-[#ccfbf1] text-[#0f766e] text-[0.6875rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4 shadow-sm">
        <Scissors size={11} />
        Crafted For Grooming Lovers
      </span>

      <h2 className="font-['Outfit'] text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-[#022525] tracking-[-0.02em] mb-4 leading-tight">
        Every seat, every stylist,
        <br className="hidden md:block" /> booked in seconds.
      </h2>

      <p className="text-[#5b6b68] text-sm md:text-[0.9375rem] leading-relaxed mb-6 max-w-[440px]">
        No more waiting in line or calling ahead. EzyCut connects you with verified salons near
        you, shows real-time availability, and lets you walk in exactly when your turn comes up.
      </p>

      <div className="flex flex-col gap-3 mb-7">
        {[
          "Verified salons with real reviews",
          "Live token tracking — know your wait time",
          "Secure, contactless checkout",
        ].map((point) => (
          <div key={point} className="flex items-center gap-2.5 text-sm text-[#134e4a] font-medium">
            <div className="w-5 h-5 rounded-full bg-[#0d9488] flex items-center justify-center shrink-0">
              <CheckCircle size={12} className="text-white" strokeWidth={3} />
            </div>
            {point}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate("/salons")}
        className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(13,148,136,0.25)]"
      >
        Explore Salons Near You
        <ArrowRight size={15} />
      </button>
    </div>
  </div>
</section>
    </div>
  );
};

export default Home;
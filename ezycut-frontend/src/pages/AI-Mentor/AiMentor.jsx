import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Scissors,
  User,
  Briefcase,
  PartyPopper,
  Sun,
  Loader2,
  RefreshCw,
  MessageSquareText,
  ShieldCheck,
  Zap,
  ArrowRight,
  LockKeyhole,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ */
/* Static config                                                       */
/* ------------------------------------------------------------------ */

const FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Long"];
const HAIR_TYPES = ["Straight", "Wavy", "Curly", "Coily", "Thin", "Thick"];
const OCCASIONS = [
  { label: "Everyday", icon: Sun },
  { label: "Work / Formal", icon: Briefcase },
  { label: "Wedding / Party", icon: PartyPopper },
  { label: "Low Maintenance", icon: Zap },
];

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Tell us about you",
    desc: "Face shape, hair type, and the vibe you're going for — takes 30 seconds.",
  },
  {
    icon: Wand2,
    title: "AI analyzes your input",
    desc: "Our model matches your profile against thousands of styling outcomes.",
  },
  {
    icon: Scissors,
    title: "Get tailored looks",
    desc: "Walk into any EZYCUT partner salon and book the exact look, instantly.",
  },
];

/* ------------------------------------------------------------------ */
/* Mock recommendation engine                                          */
/* Replace this with your real Grok API call — see comment below.      */
/* ------------------------------------------------------------------ */

const MOCK_RECOMMENDATIONS = [
  {
    name: "Textured Crop Fade",
    match: 96,
    image: "https://picsum.photos/seed/ezycut-style-1/480/560",
    tags: ["Low maintenance", "Modern", "Oval & Round faces"],
    desc: "A tapered fade with textured, tousled length on top — sharp at the sides, effortless up top. Reads professional but never boring.",
  },
  {
    name: "Soft Layered Waves",
    match: 91,
    image: "https://picsum.photos/seed/ezycut-style-2/480/560",
    tags: ["Versatile", "Adds volume", "Heart & Long faces"],
    desc: "Face-framing layers that add movement and soften angular features. Styles fast with just a blow-dry brush.",
  },
  {
    name: "Classic Side Part",
    match: 87,
    image: "https://picsum.photos/seed/ezycut-style-3/480/560",
    tags: ["Formal-ready", "Timeless", "Square faces"],
    desc: "A polished, structured cut that works from boardroom to weekend. Minimal daily styling required.",
  },
];

const AiMentor = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [faceShape, setFaceShape] = useState(null);
  const [hairType, setHairType] = useState(null);
  const [occasion, setOccasion] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const canSubmit = faceShape && hairType && occasion && !loading;

  const handleCloseModal = () => {
    setShowModal(false);
    navigate(-1);
  };

  const loadingMessages = [
    "Reading your preferences...",
    "Matching against style library...",
    "Fine-tuning recommendations...",
  ];

  const handleGetRecommendation = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResults(null);
    setLoadingStep(0);

    // ------------------------------------------------------------------
    // TODO: Replace this simulated block with your real Grok API call.
    // Example shape:
    //
    // const res = await fetch("/api/ai-mentor/recommend", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ faceShape, hairType, occasion, notes }),
    // });
    // const data = await res.json();
    // setResults(data.recommendations);
    // ------------------------------------------------------------------
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingStep(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    setResults(MOCK_RECOMMENDATIONS);
    setLoading(false);
  };

  const handleReset = () => {
    setFaceShape(null);
    setHairType(null);
    setOccasion(null);
    setNotes("");
    setResults(null);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f7f9f8]">

      {/* ============ COMING SOON MODAL ============ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-[ezcFadeUp_0.3s_ease_forwards]"
          >
            {/* Close × */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Lock icon */}
            <div className="w-14 h-14 rounded-full bg-[#e6f7f5] flex items-center justify-center mb-5">
              <LockKeyhole size={26} className="text-[#0d9488]" />
            </div>

            {/* Title */}
            <h2 className="text-[1.125rem] font-extrabold text-gray-900 mb-2">
              This feature isn&apos;t available yet
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-7">
              AI Mentor is currently unavailable to make your experience even better.
              We&apos;re working on it &mdash; check back soon!
            </p>

            {/* Got it button */}
            <button
              onClick={handleCloseModal}
              className="w-full py-3 rounded-2xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-base transition-colors shadow-md hover:shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#031715] via-[#042f2e] to-[#0f766e]">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.25)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 grid lg:grid-cols-2 gap-10 items-center">
          {/* Copy */}
          <div className="flex flex-col gap-5 animate-[ezcFadeUp_0.5s_ease_forwards]">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.1]">
              Not sure what style suits you? <span className="text-[#5eead4]">Let AI decide.</span>
            </h1>
            <p className="text-white/65 text-base leading-relaxed max-w-md">
              Answer a few quick questions about your face shape, hair type, and lifestyle —
              our AI mentor recommends looks tailored to you, ready to book at any EZYCUT
              partner salon.
            </p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white">12k+</span>
                <span className="text-xs text-white/50 font-semibold">Styles matched</span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white">94%</span>
                <span className="text-xs text-white/50 font-semibold">Satisfaction rate</span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white">30s</span>
                <span className="text-xs text-white/50 font-semibold">To get results</span>
              </div>
            </div>
          </div>

          {/* Image collage */}
          <div className="relative hidden lg:block animate-[ezcFadeUp_0.6s_ease_forwards]">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://plus.unsplash.com/premium_photo-1669675936121-6d3d42244ab5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2Fsb258ZW58MHx8MHx8fDA%3D"
                alt="Styled haircut example"
                className="rounded-2xl object-cover w-full h-64 shadow-2xl translate-y-6"
              />
              <img
                src="https://plus.unsplash.com/premium_photo-1663050860891-82b5fec7e0bf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fHNhbG9ufGVufDB8fDB8fHww"
                alt="Styled haircut example"
                className="rounded-2xl object-cover w-full h-64 shadow-2xl -translate-y-4"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-5 py-3.5 flex items-center gap-3 border border-gray-100">
              <div className="w-9 h-9 rounded-full bg-[#0d9488]/10 flex items-center justify-center">
                <Wand2 size={16} className="text-[#0d9488]" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#022525]">AI-Powered Matching</div>
                <div className="text-[0.7rem] text-gray-400">Personalized in seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ CONSULTATION PANEL ============ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10 pb-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8 animate-[ezcFadeUp_0.5s_ease_forwards]">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#0d9488]/10 flex items-center justify-center shrink-0">
              <User size={16} className="text-[#0d9488]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#022525]">Tell us about yourself</h2>
              <p className="text-sm text-gray-500">The more accurate, the better your matches.</p>
            </div>
          </div>

          {/* Face shape */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
              Face Shape
            </label>
            <div className="flex flex-wrap gap-2">
              {FACE_SHAPES.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => setFaceShape(shape)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    faceShape === shape
                      ? "bg-[#0d9488] border-[#0d9488] text-white shadow-sm"
                      : "bg-[#f7f9f8] border-gray-200 text-gray-600 hover:border-[#0d9488]/40"
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Hair type */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
              Hair Type
            </label>
            <div className="flex flex-wrap gap-2">
              {HAIR_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setHairType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    hairType === type
                      ? "bg-[#0d9488] border-[#0d9488] text-white shadow-sm"
                      : "bg-[#f7f9f8] border-gray-200 text-gray-600 hover:border-[#0d9488]/40"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
              What's it for?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {OCCASIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setOccasion(label)}
                  className={`flex flex-col items-center gap-2 px-3 py-3.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    occasion === label
                      ? "bg-[#0d9488] border-[#0d9488] text-white shadow-sm"
                      : "bg-[#f7f9f8] border-gray-200 text-gray-600 hover:border-[#0d9488]/40"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-7">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
              Anything else? <span className="normal-case font-medium text-gray-300">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I want something low-maintenance, I'm growing my hair out, I have a cowlick..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f7f9f8] text-sm text-[#022525] outline-none transition-all focus:border-[#0d9488] focus:bg-white focus:ring-4 focus:ring-[#0d9488]/10 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleGetRecommendation}
            disabled={!canSubmit}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                {loadingMessages[loadingStep]}
              </>
            ) : (
              <>
                <Wand2 size={17} />
                Get My Recommendation
              </>
            )}
          </button>
          {!canSubmit && !loading && (
            <p className="text-center text-xs text-gray-400 mt-2.5">
              Pick a face shape, hair type, and occasion to continue.
            </p>
          )}
        </div>
      </div>

      {/* ============ RESULTS ============ */}
      {results && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#022525]">Your Matches</h2>
              <p className="text-sm text-gray-500">Based on your {faceShape.toLowerCase()} face &amp; {hairType.toLowerCase()} hair</p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0d9488] hover:text-[#0f766e] transition-colors"
            >
              <RefreshCw size={14} />
              Start Over
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((style, i) => (
              <div
                key={style.name}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur text-[#0d9488] text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                    <Sparkles size={11} />
                    {style.match}% match
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <h3 className="text-base font-bold text-[#022525]">{style.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{style.desc}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {style.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to="/salons"
                    className="mt-1 inline-flex items-center justify-center gap-1.5 bg-[#022525] hover:bg-[#0f766e] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Book This Look
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ HOW IT WORKS ============ */}
      {!results && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#022525]">How It Works</h2>
            <p className="text-sm text-gray-500 mt-1">Three steps between you and your next great look</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center gap-3 animate-[ezcFadeUp_0.5s_ease_forwards] opacity-0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="absolute top-4 left-4 text-[0.7rem] font-extrabold text-gray-200">
                  0{i + 1}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#0d9488]/10 flex items-center justify-center">
                  <Icon size={22} className="text-[#0d9488]" />
                </div>
                <h3 className="text-sm font-bold text-[#022525]">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
            <ShieldCheck size={14} className="text-[#0d9488]" />
            Your answers are only used to generate style suggestions — never shared or stored.
          </div>
        </div>
      )}
    </div>
  );
};

export default AiMentor;
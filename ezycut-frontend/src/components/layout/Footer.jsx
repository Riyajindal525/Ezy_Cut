import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Globe, Sparkles } from "lucide-react";
import ezycutIcon from "../../assets/ezycut-icon.png";

const socialLinks = [
  {
    href: "https://facebook.com",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
  },
  {
    href: "https://twitter.com",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/salons", label: "Services" },
  { to: "/partner-with-us", label: "Partner With Us" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/policy", label: "FAQs & Policies" },
];

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#050505] text-[#a1a1aa] pt-10 sm:pt-12 pb-5 sm:pb-6 border-t border-white/10"
    >
      {/* ambient glow accents */}
      <div className="absolute -top-24 -left-24 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.07)_0%,transparent_70%)] pointer-events-none" />

      <div className="page-container relative">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-7 sm:gap-8 pb-6 sm:pb-8">
          {/* Brand & Description */}
          <div className="flex flex-col gap-3.5 sm:gap-4 xs:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img
                src={ezycutIcon}
                alt="EzyCut logo"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_0_10px_rgba(13,148,136,0.35)]"
              />
              <span className="text-base sm:text-lg font-extrabold text-white tracking-[-0.02em]">
                EZY<span className="text-[#2dd4bf]">CUT</span>
              </span>
            </div>
            <p className="text-[0.8125rem] leading-relaxed text-[#8b8b93] max-w-[280px]">
              The modern grooming reservation and queue companion. Book elite stylists, track live
              waiting lines, and skip the queue seamlessly.
            </p>

            <div className="flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-wide text-[#2dd4bf] bg-[#0d9488]/10 border border-[#0d9488]/25 w-fit px-2.5 py-1 rounded-full">
              <Sparkles size={10} />
              Trusted by 1,000+ customers
            </div>

            <div className="flex gap-2 mt-1">
              {socialLinks.map(({ icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/[0.07] text-[#a1a1aa] flex items-center justify-center transition-all duration-200 hover:bg-[#0d9488]/15 hover:border-[#0d9488]/40 hover:text-[#2dd4bf] hover:-translate-y-0.5"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-[0.6875rem] sm:text-xs mb-3 sm:mb-3.5 uppercase tracking-[0.08em]">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2 sm:gap-2">
              {quickLinks.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-[0.8125rem] text-[#8b8b93] hover:text-[#2dd4bf] transition-colors duration-150 w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-bold text-[0.6875rem] sm:text-xs mb-3 sm:mb-3.5 uppercase tracking-[0.08em]">
              Features
            </h4>
            <div className="flex flex-col gap-2 text-[0.8125rem] text-[#8b8b93]">
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#2dd4bf] shrink-0" />
                Smart Salon Scheduling
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#2dd4bf] shrink-0" />
                Real-time Token System
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#2dd4bf] shrink-0" />
                Contactless Payment
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#2dd4bf] shrink-0" />
                Verified Customer Reviews
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="xs:col-span-2 lg:col-span-1">
            <h4 className="text-white font-bold text-[0.6875rem] sm:text-xs mb-3 sm:mb-3.5 uppercase tracking-[0.08em]">
              Contact
            </h4>
            <div className="flex flex-col gap-2.5 text-[0.8125rem] text-[#8b8b93]">
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#2dd4bf] shrink-0 mt-0.5" />
                <span className="leading-relaxed">EZYCUT Solutions Private Limited</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-[#2dd4bf] shrink-0" />
                <a href="tel:+919476363907" className="hover:text-[#2dd4bf] transition-colors duration-150 break-all">
                  +91 94763 63907
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#2dd4bf] shrink-0" />
                <a href="mailto:support@ezycut.co.in" className="hover:text-[#2dd4bf] transition-colors duration-150 break-all">
                  support@ezycut.co.in
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-[#2dd4bf] shrink-0" />
                <a
                  href="https://www.ezycut.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2dd4bf] transition-colors duration-150 break-all"
                >
                  www.ezycut.co.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 pt-5 border-t border-white/[0.06] text-[0.6875rem] sm:text-xs text-[#71717a]">
          <span className="leading-relaxed">© 2026 EzyCut. All rights reserved. Made for elite grooming experiences.</span>
          <div className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2">
            <Link to="/policy" className="hover:text-white transition-colors duration-150 whitespace-nowrap">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors duration-150 whitespace-nowrap">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="hover:text-white transition-colors duration-150 whitespace-nowrap">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
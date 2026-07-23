/**
 * SEO.jsx — Reusable SEO metadata component for EzyCut
 *
 * Uses react-helmet-async to inject per-page metadata into <head>.
 * All public routes use this component. Protected/private routes do NOT use it
 * (Google cannot crawl them anyway since they require authentication).
 *
 * Props:
 *   title       — Page title. Appended with " | EzyCut" automatically.
 *   description — Meta description (max 160 chars recommended).
 *   canonical   — Canonical URL (full absolute URL).
 *   ogImage     — Open Graph image URL. Defaults to production logo.
 *   ogType      — OG type. Defaults to "website".
 *   noIndex     — If true, adds <meta name="robots" content="noindex,nofollow">.
 *                 Use for login/register pages.
 */

import { Helmet } from "react-helmet-async";

const SITE_NAME = "EzyCut";
const DEFAULT_OG_IMAGE = "https://www.ezycut.co.in/ezycutLogo-icon.png";
const TWITTER_HANDLE = "@ezycut_in";

const SEO = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Smart Salon Booking & Queue Management`;
  const metaDescription =
    description ||
    "Book salon appointments online, track your queue in real time, and manage your grooming experience with EzyCut — India's smart salon platform.";

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;

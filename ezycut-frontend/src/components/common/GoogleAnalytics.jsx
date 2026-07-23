/**
 * GoogleAnalytics.jsx
 *
 * A null-rendering component that fires a GA4 `page_view` event on every
 * React Router navigation. Must be rendered inside <BrowserRouter> so it
 * can call useLocation().
 *
 * The gtag.js loader in index.html initialises GA4 with send_page_view:false
 * to prevent the double-counting that would otherwise occur on the initial
 * page load. This component fires the first (and every subsequent) page_view.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = "G-F8EBMHFZVQ";

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Guard: gtag may not be defined if an ad-blocker strips the script.
    if (typeof window.gtag !== "function") return;

    window.gtag("config", GA_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  // Renders nothing — pure side-effect component.
  return null;
};

export default GoogleAnalytics;

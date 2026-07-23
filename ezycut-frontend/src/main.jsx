import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import "./index.css";

console.log("main.jsx running, loader element:", document.getElementById("app-loader"));

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// ── Hide the initial splash loader once React has mounted ──
const MIN_DISPLAY_TIME = 2500; // forced minimum visible time in ms — remove later if not needed
const loadStart = window.__loaderStart || Date.now();

const loader = document.getElementById("app-loader");
if (loader) {
  const elapsed = Date.now() - loadStart;
  const remaining = Math.max(MIN_DISPLAY_TIME - elapsed, 0);

  setTimeout(() => {
    loader.classList.add("hide");
    setTimeout(() => loader.remove(), 400);
  }, remaining);
} else {
  console.warn("app-loader element not found in DOM — check index.html");
}
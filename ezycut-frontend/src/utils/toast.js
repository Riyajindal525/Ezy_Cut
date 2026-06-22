/* =============================================
   EZYCUT TOAST NOTIFICATION SYSTEM
   ============================================= */

let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

function show(message, type = "info", duration = 3500) {
  const c = getContainer();
  const el = document.createElement("div");
  el.className = `toast ${type}`;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  el.innerHTML = `
    <span style="font-size:1rem;font-weight:700;flex-shrink:0">${icons[type] || "ℹ"}</span>
    <span style="flex:1;line-height:1.4">${message}</span>
  `;

  c.appendChild(el);

  setTimeout(() => {
    el.style.animation = "toastOut 0.3s ease forwards";
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }, duration);

  return el;
}

const toast = {
  success: (msg, d) => show(msg, "success", d),
  error: (msg, d) => show(msg, "error", d),
  warning: (msg, d) => show(msg, "warning", d),
  info: (msg, d) => show(msg, "info", d),
};

export default toast;

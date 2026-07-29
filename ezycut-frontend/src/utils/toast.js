/* =============================================
   EZYCUT TOAST NOTIFICATION SYSTEM (Tailwind)
   v4 — adds notification sound per toast type
   ============================================= */

let container = null;
let audioCtx = null;

function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className =
      "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 px-4 pointer-events-none";
    document.body.appendChild(container);
  }
  return container;
}

// ---- sound engine (no mp3 files needed) ----
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

const soundProfiles = {
  success: [{ freq: 880, time: 0, dur: 0.1 }, { freq: 1175, time: 0.09, dur: 0.14 }],
  error: [{ freq: 300, time: 0, dur: 0.16 }, { freq: 220, time: 0.13, dur: 0.18 }],
  warning: [{ freq: 600, time: 0, dur: 0.12 }, { freq: 500, time: 0.1, dur: 0.12 }],
  info: [{ freq: 700, time: 0, dur: 0.12 }],
};

function playSound(type) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const notes = soundProfiles[type] || soundProfiles.info;
    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const start = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch (e) {
    // audio not supported/blocked — fail silently
  }
}

const typeConfig = {
  success: {
    solid: "#10b981",
    dark: "#059669",
    tint: "#ecfdf5",
    icon: `<path d="M20 6 9 17l-5-5" stroke="white" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  error: {
    solid: "#f43f5e",
    dark: "#e11d48",
    tint: "#fff1f2",
    icon: `<path d="M18 6 6 18M6 6l12 12" stroke="white" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  warning: {
    solid: "#f59e0b",
    dark: "#d97706",
    tint: "#fffbeb",
    icon: `<path d="M12 9v4m0 4h.01" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>`,
  },
  info: {
    solid: "#0ea5e9",
    dark: "#0284c7",
    tint: "#f0f9ff",
    icon: `<circle cx="12" cy="8.5" r="1.15" fill="white"/><path d="M12 12v5" stroke="white" stroke-width="2.4" stroke-linecap="round"/>`,
  },
};

function show(title, { description = "", type = "info", duration = 3000, actions = null, sound = true } = {}) {
  const c = getContainer();
  const cfg = typeConfig[type] || typeConfig.info;
  const hasProgress = !actions;

  if (sound) playSound(type);

  const el = document.createElement("div");
  el.className = `
    pointer-events-auto relative w-full max-w-sm bg-white rounded-2xl
    shadow-2xl overflow-hidden
    opacity-0 scale-90 -translate-y-3
    transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
  `.replace(/\s+/g, " ").trim();

  el.style.boxShadow = `0 10px 40px -5px ${cfg.solid}33, 0 4px 12px rgba(0,0,0,0.08)`;

 el.innerHTML = `
    <div class="absolute left-0 top-0 h-full w-1.5" style="background:${cfg.solid}"></div>

    <div class="flex items-start gap-3 p-4 pl-5" style="background:${cfg.tint}">
      <span class="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style="background:linear-gradient(135deg, ${cfg.solid}, ${cfg.dark}); box-shadow:0 4px 10px ${cfg.solid}55;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">${cfg.icon}</svg>
      </span>

      <div class="flex-1 min-w-0 pt-0.5">
        <p class="text-[0.875rem] font-bold text-gray-900 leading-snug tracking-tight">${title}</p>
        ${description ? `<p class="text-[0.75rem] text-gray-500 mt-0.5 leading-relaxed">${description}</p>` : ""}
        ${
          actions
            ? `<div class="flex items-center gap-4 mt-2.5">
                ${actions
                  .map(
                    (a, i) =>
                      `<button data-action="${i}" class="text-sm font-bold ${
                        i === 0 ? "" : "text-gray-400 hover:text-gray-600"
                      } transition-colors" ${i === 0 ? `style="color:${cfg.dark}"` : ""}>${a.label}</button>`
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>

      <button data-close class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <button data-dismiss-btn class="w-full text-center text-[0.75rem] font-semibold py-2 border-t transition-colors"
            style="color:${cfg.dark}; border-color:${cfg.tint}; background:white;"
            onmouseover="this.style.background='${cfg.tint}'" onmouseout="this.style.background='white'">
      Dismiss
    </button>

    ${
      hasProgress
        ? `<div class="h-[2.5px] w-full bg-black/5">
            <div data-progress class="h-full origin-left" style="background:${cfg.solid};transform:scaleX(1);transition:transform ${duration}ms linear"></div>
          </div>`
        : ""
    }
  `;

  c.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.remove("opacity-0", "scale-90", "-translate-y-3");
      el.classList.add("opacity-100", "scale-100", "translate-y-0");
      if (hasProgress) el.querySelector("[data-progress]").style.transform = "scaleX(0)";
    });
  });

  const dismiss = () => {
    el.classList.remove("opacity-100", "scale-100", "translate-y-0");
    el.classList.add("opacity-0", "scale-90", "translate-y-2");
    setTimeout(() => el.remove(), 300);
  };

  el.querySelector("[data-close]").addEventListener("click", dismiss);
   el.querySelector("[data-dismiss-btn]").addEventListener("click", dismiss);

  if (actions) {
    actions.forEach((a, i) => {
      el.querySelector(`[data-action="${i}"]`).addEventListener("click", () => {
        a.onClick?.();
        if (a.dismissOnClick !== false) dismiss();
      });
    });
  }

  let timer;
  if (hasProgress) {
    timer = setTimeout(dismiss, duration);

    const progressBar = el.querySelector("[data-progress]");
    el.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      progressBar.style.transition = "none";
      progressBar.style.transform = getComputedStyle(progressBar).transform;
    });
    el.addEventListener("mouseleave", () => {
      const remaining = duration * 0.4;
      progressBar.style.transition = `transform ${remaining}ms linear`;
      progressBar.style.transform = "scaleX(0)";
      timer = setTimeout(dismiss, remaining);
    });
  }

  return el;
}

const toast = {
  success: (title, opts) => show(title, { ...opts, type: "success" }),
  error: (title, opts) => show(title, { ...opts, type: "error" }),
  warning: (title, opts) => show(title, { ...opts, type: "warning" }),
  info: (title, opts) => show(title, { ...opts, type: "info" }),
};

export default toast;
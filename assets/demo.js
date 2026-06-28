/* Focusline live demo.
 *
 * Recreates the macOS app's real behaviour in the browser: a reading guide
 * that follows the pointer, in each of the four Modes, with the same
 * customisation the app exposes (style, colour, opacity, size, dim strength).
 * The maths mirrors the app — the bar sits just under the pointer line, the
 * highlight is a wide translucent band, Focus/Spotlight dim everything but a
 * clear region, Night lays a warm wash over the page.
 */
(function () {
  const reader = document.getElementById("reader");
  const band = document.getElementById("band");
  const bar = document.getElementById("bar");
  const dim = document.getElementById("dim");
  if (!reader) return;

  const state = {
    mode: "reading",          // reading | focus | spotlight | night
    style: "bar",             // bar | highlight (line modes only)
    shape: "round",           // round | bar (spotlight only)
    color: "#ffd15c",
    opacity: 0.9,             // bar/band opacity
    size: 6,                  // bar thickness / band height (px)
    spot: 150,                // spotlight radius (px)
    strength: 0.55,           // dim strength
    x: 0,
    y: 0,
  };

  // Follow the pointer; default to the middle before first move.
  function setFromEvent(e) {
    const r = reader.getBoundingClientRect();
    state.x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    state.y = Math.max(0, Math.min(r.height, e.clientY - r.top));
    render();
  }
  reader.addEventListener("pointermove", setFromEvent);
  reader.addEventListener("pointerleave", () => {
    const r = reader.getBoundingClientRect();
    state.x = r.width / 2;
    state.y = r.height / 2;
    render();
  });

  function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  function render() {
    const { mode, style, x, y, color, size } = state;
    // Reset layers each frame.
    band.style.cssText = "";
    bar.style.cssText = "";
    dim.style.cssText = "";
    dim.className = "layer";
    band.className = "layer";
    bar.className = "layer";

    const lineMode = mode === "reading" || mode === "focus" || mode === "night";

    // --- Reading guide (bar or highlight band) ---
    if (lineMode) {
      if (style === "highlight") {
        const h = Math.max(18, size * 4);
        Object.assign(band.style, {
          position: "absolute", left: "0", right: "0",
          top: `${y - h / 2}px`, height: `${h}px`,
          background: hexToRgba(color, 0.32),
          borderRadius: "4px",
        });
      } else {
        // Thin solid hairline that sits just under the pointer line.
        Object.assign(bar.style, {
          position: "absolute", left: "8%", right: "8%",
          top: `${y + 9}px`, height: `${size}px`,
          background: hexToRgba(color, state.opacity),
          borderRadius: "999px",
          boxShadow: `0 0 10px ${hexToRgba(color, 0.6)}`,
        });
      }
    }

    // --- Dim layers (Focus / Spotlight / Night) ---
    if (mode === "focus") {
      // Dim everything but a clear horizontal band around the line.
      const clear = 34;
      dim.style.background = `rgba(17, 17, 20, ${state.strength})`;
      const m = `linear-gradient(to bottom,
        #000 ${y - clear}px, transparent ${y - clear}px,
        transparent ${y + clear}px, #000 ${y + clear}px)`;
      dim.style.webkitMaskImage = m;
      dim.style.maskImage = m;
    } else if (mode === "spotlight") {
      dim.style.background = `rgba(8, 8, 10, ${state.strength})`;
      if (state.shape === "bar") {
        const clear = 30;
        const m = `linear-gradient(to bottom,
          #000 ${y - clear}px, transparent ${y - clear}px,
          transparent ${y + clear}px, #000 ${y + clear}px)`;
        dim.style.webkitMaskImage = m;
        dim.style.maskImage = m;
      } else {
        const m = `radial-gradient(circle ${state.spot}px at ${x}px ${y}px,
          transparent 0, transparent 70%, #000 72%)`;
        dim.style.webkitMaskImage = m;
        dim.style.maskImage = m;
      }
    } else if (mode === "night") {
      // Warm dark wash over the whole page (multiply), bar still guiding.
      dim.classList.add("night");
      dim.style.background = `rgba(40, 22, 0, ${0.35 + state.strength * 0.5})`;
    }
  }

  // ---- Controls wiring ----
  function bindSeg(name, key, after) {
    document.querySelectorAll(`[data-seg="${name}"] button`).forEach((b) => {
      b.addEventListener("click", () => {
        state[key] = b.dataset.val;
        document.querySelectorAll(`[data-seg="${name}"] button`)
          .forEach((x) => x.classList.toggle("on", x === b));
        if (after) after();
        render();
      });
    });
  }

  bindSeg("mode", "mode", syncControls);
  bindSeg("style", "style");
  bindSeg("shape", "shape");

  document.querySelectorAll(".swatch").forEach((s) => {
    s.addEventListener("click", () => {
      state.color = s.dataset.color;
      document.querySelectorAll(".swatch").forEach((x) => x.classList.toggle("on", x === s));
      render();
    });
  });

  function bindRange(id, key, fmt) {
    const el = document.getElementById(id);
    if (!el) return;
    const out = document.getElementById(id + "-val");
    const update = () => {
      state[key] = parseFloat(el.value);
      if (out && fmt) out.textContent = fmt(state[key]);
      render();
    };
    el.addEventListener("input", update);
    update();
  }
  bindRange("opacity", "opacity", (v) => `${Math.round(v * 100)}%`);
  bindRange("size", "size", (v) => `${Math.round(v)} px`);
  bindRange("spot", "spot", (v) => `${Math.round(v)} px`);
  bindRange("strength", "strength", (v) => `${Math.round(v * 100)}%`);

  // Show only the controls that matter for the current Mode (mirrors the app).
  function syncControls() {
    const line = state.mode === "reading" || state.mode === "focus" || state.mode === "night";
    show("g-style", line);
    show("g-color", line);
    show("g-opacity", line && state.style === "bar");
    show("g-size", line);
    show("g-shape", state.mode === "spotlight");
    show("g-spot", state.mode === "spotlight" && state.shape === "round");
    show("g-strength", state.mode !== "reading");
  }
  function show(id, on) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !on);
  }
  // Re-sync spot visibility when shape changes too.
  bindSeg("shape", "shape", syncControls);

  // Initial paint: centre the guide, set defaults.
  const r0 = reader.getBoundingClientRect();
  state.x = r0.width / 2;
  state.y = r0.height * 0.42;
  syncControls();
  render();
})();

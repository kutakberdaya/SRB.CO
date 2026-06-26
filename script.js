const products = [
  {
    name: "Baju 1",
    price: "Rp. -",
    tag: "New",
    front: "assets/baju1-depan.png",
    back: "assets/baju1-belakang.png"
  },
  {
    name: "Baju 2",
    price: "Rp. -",
    tag: "New",
    front: "assets/baju2-depan.png",
    back: "assets/baju2-belakang.png"
  },
  {
    name: "Baju 3",
    price: "Rp. -",
    tag: "New",
    front: "assets/baju3-depan.png",
    back: "assets/baju3-belakang.png"
  }
];

const productGrid = document.querySelector("#productGrid");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const spotlight = document.querySelector("#productSpotlight");
const spotlightCard = spotlight.querySelector(".spotlight-card");
const spotlightClose = spotlight.querySelector(".spotlight-close");
const spotlightImageButton = spotlight.querySelector(".spotlight-image-button");
const spotlightImage = document.querySelector("#spotlightImage");
const spotlightView = document.querySelector("#spotlightView");
const spotlightTag = document.querySelector("#spotlightTag");
const spotlightTitle = document.querySelector("#spotlightTitle");
const spotlightPrice = document.querySelector("#spotlightPrice");
let activeProduct = null;
let modalState = "front";
let modalSwapLocked = false;
let closeTimer = null;

function createProductCard(product, index) {
  const card = document.createElement("article");
  card.className = "product-card reveal";
  card.style.transitionDelay = `${index * 85}ms`;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Open spotlight for ${product.name}`);

  card.innerHTML = `
    <div class="product-media">
      <div class="product-view">
        <img class="product-image" src="${product.front}" alt="${product.name} front view" loading="lazy" />
        <span class="product-view-label">Front</span>
      </div>
      <div class="product-view">
        <img class="product-image" src="${product.back}" alt="${product.name} back view" loading="lazy" />
        <span class="product-view-label">Back</span>
      </div>
    </div>
    <div class="product-info">
      <div class="product-topline">
        <span class="badge">${product.tag}</span>
        <span class="price">${product.price}</span>
      </div>
      <h3 class="product-name">${product.name}</h3>
    </div>
  `;

  card.addEventListener("click", () => openModal(product));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(product);
    }
  });

  return card;
}

function openModal(product) {
  activeProduct = product;
  modalState = "front";
  modalSwapLocked = false;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  window.clearTimeout(closeTimer);
  spotlight.classList.remove("is-closing");
  spotlightImage.classList.remove("is-swapping");
  spotlightImage.src = product.front;
  spotlightImage.alt = `${product.name} front view`;
  spotlightView.textContent = "Front";
  spotlightTag.textContent = product.tag;
  spotlightTitle.textContent = product.name;
  spotlightPrice.textContent = product.price;
  spotlightImageButton.setAttribute("aria-label", `Show back view of ${product.name}`);

  spotlight.setAttribute("aria-hidden", "false");
  document.body.classList.add("spotlight-open");
  spotlight.classList.add("is-active");
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
  spotlightClose.focus({ preventScroll: true });
}

function closeModal() {
  if (!spotlight.classList.contains("is-active")) return;

  spotlight.classList.add("is-closing");
  spotlight.classList.remove("is-active");
  document.body.classList.remove("spotlight-open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";

  closeTimer = window.setTimeout(() => {
    spotlight.classList.remove("is-closing");
    spotlight.setAttribute("aria-hidden", "true");
    activeProduct = null;
  }, prefersReducedMotion ? 1 : 560);
}

function toggleModalImage() {
  if (!activeProduct || modalSwapLocked) return;

  modalSwapLocked = true;
  const isFront = modalState === "front";
  const nextState = isFront ? "back" : "front";
  spotlightImage.classList.add("is-swapping");

  window.setTimeout(() => {
    modalState = nextState;
    spotlightImage.src = isFront ? activeProduct.back : activeProduct.front;
    spotlightImage.alt = `${activeProduct.name} ${nextState} view`;
    spotlightView.textContent = isFront ? "Back" : "Front";
    spotlightImageButton.setAttribute(
      "aria-label",
      `Show ${isFront ? "front" : "back"} view of ${activeProduct.name}`
    );
    spotlightImage.classList.remove("is-swapping");

    window.setTimeout(() => { modalSwapLocked = false; }, 360);
  }, 260);
}

function setupScrollReveal() {
  const revealItems = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
        window.setTimeout(() => { entry.target.style.transitionDelay = ""; }, 1100);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function setupDepthMotion() {
  if (prefersReducedMotion) return;

  const depthLayer = document.querySelector(".depth-bg");
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      const shift = Math.min(window.scrollY * 0.035, 46);
      depthLayer.style.setProperty("--depth-shift", `${shift}px`);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

// ─── Frost Orbs ───────────────────────────────────────────────────────────────
function setupFrostOrbs() {
  if (prefersReducedMotion) return;

  const canvas = document.getElementById("frostCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Each orb: x, y position (as 0-1 fractions), radius, speed (very slow), phase offset
  const orbs = [
    { xf: 0.18, yf: 0.22, r: 110, speedX:  0.00008, speedY:  0.00006, phase: 0.00 },
    { xf: 0.72, yf: 0.14, r:  74, speedX: -0.00006, speedY:  0.00009, phase: 1.80 },
    { xf: 0.85, yf: 0.60, r:  92, speedX:  0.00007, speedY: -0.00005, phase: 3.20 },
    { xf: 0.32, yf: 0.78, r:  58, speedX: -0.00009, speedY:  0.00007, phase: 4.60 },
    { xf: 0.55, yf: 0.45, r:  46, speedX:  0.00005, speedY: -0.00008, phase: 2.10 },
    { xf: 0.08, yf: 0.55, r:  80, speedX:  0.00006, speedY:  0.00004, phase: 5.40 },
    { xf: 0.62, yf: 0.88, r:  64, speedX: -0.00007, speedY: -0.00006, phase: 0.90 },
  ];

  let time = 0;
  let rafId = null;

  function drawOrbs(ts) {
    time = ts * 0.001; // seconds
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    orbs.forEach((orb) => {
      const dx = Math.sin(time * orb.speedX * 6000 + orb.phase) * 60;
      const dy = Math.cos(time * orb.speedY * 6000 + orb.phase + 1.2) * 44;
      const x = orb.xf * canvas.width + dx;
      const y = orb.yf * canvas.height + dy;
      const r = orb.r;

      // Outer soft haze
      const hazeGrad = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 1.6);
      hazeGrad.addColorStop(0, "rgba(200, 224, 255, 0.07)");
      hazeGrad.addColorStop(1, "rgba(200, 224, 255, 0.00)");
      ctx.beginPath();
      ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = hazeGrad;
      ctx.fill();

      // Frosted glass circle
      const glassGrad = ctx.createRadialGradient(x - r * 0.28, y - r * 0.28, r * 0.05, x, y, r);
      glassGrad.addColorStop(0, "rgba(242, 250, 255, 0.22)");
      glassGrad.addColorStop(0.55, "rgba(210, 232, 255, 0.10)");
      glassGrad.addColorStop(1, "rgba(180, 214, 255, 0.04)");
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = glassGrad;
      ctx.fill();

      // Thin rim highlight (top-left arc)
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.9);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner highlight flare
      const flareGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x - r * 0.3, y - r * 0.3, r * 0.42);
      flareGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      flareGrad.addColorStop(1, "rgba(255, 255, 255, 0.00)");
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = flareGrad;
      ctx.fill();
    });

    rafId = requestAnimationFrame(drawOrbs);
  }

  rafId = requestAnimationFrame(drawOrbs);

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); }
    else { rafId = requestAnimationFrame(drawOrbs); }
  });
}

// ─── Snow Particles ────────────────────────────────────────────────────────────
function setupSnow() {
  if (prefersReducedMotion) return;

  const canvas = document.getElementById("snowCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    // Tall enough to cover scrolling content (capped for perf)
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Sparse, slow snowflakes — mix of tiny and slightly larger
  const FLAKE_COUNT = 38;
  const flakes = [];

  for (let i = 0; i < FLAKE_COUNT; i++) {
    flakes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() < 0.65 ? Math.random() * 1.4 + 0.6 : Math.random() * 2.8 + 1.8,
      speed: Math.random() * 0.22 + 0.08,     // very slow fall
      drift: (Math.random() - 0.5) * 0.06,    // gentle side drift
      opacity: Math.random() * 0.38 + 0.12,
      twinkleSpeed: Math.random() * 0.0006 + 0.0002,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }

  let lastTs = 0;
  let rafId = null;

  function drawSnow(ts) {
    const dt = Math.min(ts - lastTs, 50); // cap delta to avoid jumps
    lastTs = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    flakes.forEach((f) => {
      // Subtle twinkle
      const twinkle = Math.sin(ts * f.twinkleSpeed + f.twinklePhase) * 0.12;
      const alpha = Math.max(0.04, f.opacity + twinkle);

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 244, 255, ${alpha.toFixed(3)})`;
      ctx.shadowBlur = f.r > 2 ? 4 : 2;
      ctx.shadowColor = "rgba(200, 230, 255, 0.5)";
      ctx.fill();
      ctx.shadowBlur = 0;

      // Move
      f.y += f.speed * (dt / 16);
      f.x += f.drift;

      // Wrap
      if (f.y > canvas.height + 10) {
        f.y = -10;
        f.x = Math.random() * canvas.width;
      }
      if (f.x < -10) f.x = canvas.width + 10;
      if (f.x > canvas.width + 10) f.x = -10;
    });

    rafId = requestAnimationFrame(drawSnow);
  }

  rafId = requestAnimationFrame(drawSnow);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); lastTs = 0; }
    else { rafId = requestAnimationFrame(drawSnow); }
  });
}

// ─── Gloss Shimmer on Cards ────────────────────────────────────────────────────
function setupGlossShimmer() {
  if (prefersReducedMotion) return;

  // Stagger shimmer across visible product cards, then cycle slowly
  function triggerGloss() {
    const cards = document.querySelectorAll(".product-card.is-visible");
    if (cards.length === 0) return;

    // Pick a random card that isn't already animating
    const eligible = Array.from(cards).filter(c => !c.classList.contains("gloss-active"));
    if (eligible.length === 0) return;

    const card = eligible[Math.floor(Math.random() * eligible.length)];
    card.classList.add("gloss-active");

    // Remove after animation completes
    setTimeout(() => card.classList.remove("gloss-active"), 2500);
  }

  // Fire first shimmer after cards have had time to reveal
  setTimeout(() => {
    triggerGloss();
    // Then repeat on a slow, irregular cadence
    function scheduleNext() {
      const delay = Math.random() * 5000 + 4000; // 4–9 s between shimmers
      setTimeout(() => { triggerGloss(); scheduleNext(); }, delay);
    }
    scheduleNext();
  }, 2800);
}

// ─── Ice Bubbles ──────────────────────────────────────────────────────────────
function setupIceBubbles() {
  if (prefersReducedMotion) return;
  const canvas = document.getElementById("bubbleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const BUBBLE_COUNT = 14;
  const bubbles = [];

  function makeBubble(randomY) {
    const r = Math.random() * 28 + 10;
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : window.innerHeight + r + 10,
      r,
      speedY: -(Math.random() * 0.18 + 0.06),
      driftSpeed: Math.random() * 0.0004 + 0.0001,
      driftAmp: Math.random() * 22 + 8,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.13 + 0.06,
      born: performance.now(),
    };
  }

  for (let i = 0; i < BUBBLE_COUNT; i++) bubbles.push(makeBubble(true));

  function drawBubble(b, t) {
    const x = b.x + Math.sin(t * b.driftSpeed * 1000 + b.phase) * b.driftAmp;
    const y = b.y;
    const r = b.r;
    const a = b.alpha;

    // Outer haze
    const haze = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.4);
    haze.addColorStop(0, `rgba(210, 235, 255, ${(a * 0.4).toFixed(3)})`);
    haze.addColorStop(1, "rgba(210, 235, 255, 0)");
    ctx.beginPath(); ctx.arc(x, y, r * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = haze; ctx.fill();

    // Main sphere — frosted glass body
    const body = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.05, x, y, r);
    body.addColorStop(0, `rgba(240, 250, 255, ${(a * 1.6).toFixed(3)})`);
    body.addColorStop(0.4, `rgba(210, 235, 255, ${(a * 0.9).toFixed(3)})`);
    body.addColorStop(0.8, `rgba(180, 218, 255, ${(a * 0.5).toFixed(3)})`);
    body.addColorStop(1, `rgba(160, 206, 255, ${(a * 0.2).toFixed(3)})`);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = body; ctx.fill();

    // Rim edge highlight
    ctx.beginPath(); ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${(a * 1.1).toFixed(3)})`;
    ctx.lineWidth = 1.0; ctx.stroke();

    // Top-left flare
    const flare = ctx.createRadialGradient(x - r * 0.36, y - r * 0.36, 0, x - r * 0.36, y - r * 0.36, r * 0.48);
    flare.addColorStop(0, `rgba(255, 255, 255, ${(a * 1.8).toFixed(3)})`);
    flare.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath(); ctx.arc(x - r * 0.36, y - r * 0.36, r * 0.48, 0, Math.PI * 2);
    ctx.fillStyle = flare; ctx.fill();

    // Bottom-right secondary reflection
    const refl = ctx.createRadialGradient(x + r * 0.28, y + r * 0.30, 0, x + r * 0.28, y + r * 0.30, r * 0.28);
    refl.addColorStop(0, `rgba(200, 230, 255, ${(a * 0.9).toFixed(3)})`);
    refl.addColorStop(1, "rgba(200,230,255,0)");
    ctx.beginPath(); ctx.arc(x + r * 0.28, y + r * 0.30, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = refl; ctx.fill();
  }

  let rafId = null;

  function tick(ts) {
    const t = ts * 0.001;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y += b.speedY;
      drawBubble(b, t);
      if (b.y + b.r < -20) {
        bubbles.splice(i, 1);
        bubbles.push(makeBubble(false));
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(tick);
  });
}

// ─── Crystal Sparkles ─────────────────────────────────────────────────────────
function setupSparkles() {
  if (prefersReducedMotion) return;
  const canvas = document.getElementById("sparkleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const sparkles = [];

  function addSparkle() {
    sparkles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2.5,
      alpha: 0,
      maxAlpha: Math.random() * 0.55 + 0.2,
      phase: 0,
      speed: Math.random() * 0.008 + 0.005,
      rotation: Math.random() * Math.PI,
    });
  }

  // Seed initial sparkles
  for (let i = 0; i < 18; i++) {
    addSparkle();
    sparkles[i].phase = Math.random() * Math.PI * 2;
  }

  function drawSparkle(s) {
    const { x, y, size, alpha, rotation } = s;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    // 4-point star
    ctx.beginPath();
    for (let arm = 0; arm < 4; arm++) {
      const angle = (arm / 4) * Math.PI * 2;
      const tip = size;
      const mid = size * 0.18;
      const midAngle = angle + Math.PI / 4;
      if (arm === 0) {
        ctx.moveTo(Math.cos(angle) * tip, Math.sin(angle) * tip);
      } else {
        ctx.lineTo(Math.cos(angle) * tip, Math.sin(angle) * tip);
      }
      ctx.lineTo(Math.cos(midAngle) * mid, Math.sin(midAngle) * mid);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    g.addColorStop(0, "rgba(255, 255, 255, 1)");
    g.addColorStop(0.5, "rgba(210, 238, 255, 0.8)");
    g.addColorStop(1, "rgba(180, 220, 255, 0)");
    ctx.fillStyle = g;
    ctx.fill();

    // Tiny center dot
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();

    ctx.restore();
  }

  let rafId = null;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.phase += s.speed;
      s.alpha = s.maxAlpha * Math.max(0, Math.sin(s.phase));
      drawSparkle(s);

      // Respawn when cycle completes
      if (s.phase > Math.PI) {
        sparkles.splice(i, 1);
        addSparkle();
      }
    }

    // Occasionally add an extra sparkle (keep density low)
    if (sparkles.length < 22 && Math.random() < 0.012) addSparkle();

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(tick);
  });
}

// ─── Hero Title Shimmer ────────────────────────────────────────────────────────
function setupHeroShimmer() {
  if (prefersReducedMotion) return;
  const title = document.querySelector("h1");
  if (!title) return;

  title.style.position = "relative";
  title.style.display = "inline-block";

  const shimmer = document.createElement("span");
  shimmer.setAttribute("aria-hidden", "true");
  shimmer.style.cssText = `
    position:absolute; inset:0; pointer-events:none; border-radius:4px;
    background: linear-gradient(
      105deg,
      transparent 0%, transparent 28%,
      rgba(255,255,255,0.55) 44%,
      rgba(210,240,255,0.35) 50%,
      transparent 62%, transparent 100%
    );
    background-size: 260% 100%;
    background-position: 200% center;
    opacity: 0;
  `;
  title.appendChild(shimmer);

  function animate() {
    shimmer.style.transition = "none";
    shimmer.style.backgroundPosition = "200% center";
    shimmer.style.opacity = "0";
    setTimeout(() => {
      shimmer.style.transition = "background-position 1.6s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease";
      shimmer.style.opacity = "1";
      shimmer.style.backgroundPosition = "-40% center";
      setTimeout(() => { shimmer.style.opacity = "0"; }, 1400);
    }, 60);
  }

  // Fire after hero animation lands, then periodically
  setTimeout(() => {
    animate();
    setInterval(animate, 7000);
  }, 1800);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
products.forEach((product, index) => {
  productGrid.appendChild(createProductCard(product, index));
});

spotlightClose.addEventListener("click", closeModal);
spotlightImageButton.addEventListener("click", toggleModalImage);

spotlight.addEventListener("click", (event) => {
  if (!spotlightCard.contains(event.target)) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

setupScrollReveal();
setupDepthMotion();
setupFrostOrbs();
setupSnow();
setupGlossShimmer();
setupIceBubbles();
setupSparkles();
setupHeroShimmer();

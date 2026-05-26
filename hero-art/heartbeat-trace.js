// ═══════════════════════════════════════════════════════════════════════
// HEARTBEAT TRACE — backstop hero art
//
// A slow athletic ECG waveform (48 BPM resting) scrolling across the canvas
// in gold against a faint ECG grid. The wave is recomputed every frame from
// current time — perfectly smooth scroll, no buffer.
//
// TO REVERT: paste this IIFE back into src/pages/index.astro inside the main
// <script> block (replacing the current hero-art IIFE), and swap the
//   <div class="hero-figure">...</div>
// in the hero section back to:
//   <canvas id="hero-art"></canvas>
// ═══════════════════════════════════════════════════════════════════════

(function() {
  const canvas = document.getElementById('hero-art');
  if (!canvas) return;
  if (canvas.offsetParent === null) return; // mobile (hidden)
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ─── Tunables ───
  const HEART_RATE_BPM = 48;        // slow, athletic resting heart
  const SWEEP_SECONDS  = 4.6;       // seconds for a beat to traverse the canvas
  const WAVE_AMP_FRAC  = 0.30;      // R-spike height as fraction of canvas height
  const SEGMENTS       = 240;       // resolution of the redrawn wave each frame
  const GRID_CELL      = 22;        // px per ECG grid cell
  const GRID_ALPHA     = 0.035;     // grid line opacity

  let W = 0, H = 0, DPR = 1;
  let running = false;
  let rafId = null;
  let startMs = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // ECG waveform value at phase t (0 → 1 = one heartbeat).
  // Returns -0.25 to +1.0 (R-spike peaks at 1).
  function ecg(t) {
    t = ((t % 1) + 1) % 1;
    if (t < 0.10)         return Math.sin(t * Math.PI / 0.10) * 0.14;            // P wave
    if (t < 0.16)         return 0;                                               // PR segment
    if (t < 0.18) { const u = (t - 0.16) / 0.02; return -0.10 * u; }              // Q wave
    if (t < 0.21) { const u = (t - 0.18) / 0.03; return -0.10 + u * 1.10; }       // R spike up
    if (t < 0.24) { const u = (t - 0.21) / 0.03; return 1.00 - u * 1.22; }        // R fall + S dip
    if (t < 0.27) { const u = (t - 0.24) / 0.03; return -0.22 + u * 0.22; }       // S recovery
    if (t < 0.40)         return 0;                                               // ST segment
    if (t < 0.58) { const u = (t - 0.40) / 0.18; return Math.sin(u * Math.PI) * 0.22; } // T wave
    return 0;
  }

  function drawGrid() {
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(201, 168, 76, ' + GRID_ALPHA + ')';
    ctx.beginPath();
    for (let x = 0; x <= W; x += GRID_CELL) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += GRID_CELL) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'rgba(201, 168, 76, ' + (GRID_ALPHA * 1.9) + ')';
    ctx.beginPath();
    for (let x = 0; x <= W; x += GRID_CELL * 5) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += GRID_CELL * 5) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function frame(now) {
    if (!running) return;
    if (!startMs) startMs = now;
    const t = (now - startMs) / 1000;

    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);
    drawGrid();

    const cyclesPerSec = HEART_RATE_BPM / 60;
    const phaseNow = t * cyclesPerSec;
    const cyclesPerScreen = SWEEP_SECONDS * cyclesPerSec;

    const baseY = H * 0.55;
    const amp   = H * WAVE_AMP_FRAC;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let prevX = 0;
    let prevY = baseY - ecg(phaseNow - cyclesPerScreen) * amp;

    for (let i = 1; i <= SEGMENTS; i++) {
      const frac = i / SEGMENTS;
      const xPx = frac * W;
      const phase = phaseNow - (1 - frac) * cyclesPerScreen;
      const yPx = baseY - ecg(phase) * amp;

      const ageWeight = Math.pow(frac, 1.5);
      const alpha = 0.04 + ageWeight * 0.82;

      let r, g, b;
      if (ageWeight < 0.55) {
        const k = ageWeight / 0.55;
        r = 109 + (201 - 109) * k;
        g = 85  + (168 - 85)  * k;
        b = 36  + (76  - 36)  * k;
      } else {
        const k = (ageWeight - 0.55) / 0.45;
        r = 201 + (245 - 201) * k;
        g = 168 + (214 - 168) * k;
        b = 76  + (132 - 76)  * k;
      }

      ctx.strokeStyle = 'rgba(' + (r|0) + ',' + (g|0) + ',' + (b|0) + ',' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1.2 + ageWeight * 0.9;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(xPx, yPx);
      ctx.stroke();

      prevX = xPx;
      prevY = yPx;
    }

    const yHead = baseY - ecg(phaseNow) * amp;
    const xHead = W - 1;

    const grd = ctx.createRadialGradient(xHead, yHead, 0, xHead, yHead, 22);
    grd.addColorStop(0,    'rgba(245, 214, 132, 0.85)');
    grd.addColorStop(0.4,  'rgba(201, 168, 76, 0.35)');
    grd.addColorStop(1,    'rgba(201, 168, 76, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(xHead, yHead, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 214, 132, 1)';
    ctx.beginPath();
    ctx.arc(xHead, yHead, 2.6, 0, Math.PI * 2);
    ctx.fill();

    rafId = requestAnimationFrame(frame);
  }

  function start() { if (running) return; running = true; startMs = 0; rafId = requestAnimationFrame(frame); }
  function stop()  { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

  resize();

  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mqReduced.matches) {
    startMs = performance.now() - 1200;
    frame(performance.now());
    stop();
    return;
  }

  start();

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) start();
        else stop();
      }
    }, { threshold: 0 });
    io.observe(canvas);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasRunning = running;
      stop();
      resize();
      if (wasRunning) start();
    }, 180);
  });
})();

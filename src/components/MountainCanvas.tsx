"use client";

import { useEffect, useRef } from "react";

interface Segment {
  x1: number; y1: number;
  x2: number; y2: number;
  depth: number;
}

interface Bug {
  seg: number;
  t: number;
  speed: number;
  gold: boolean;
  size: number;
  alpha: number;
  trail: { x: number; y: number }[];
}

function grow(
  x: number, y: number,
  angle: number, len: number, depth: number,
  out: Segment[]
) {
  if (depth === 0 || len < 4) return;
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  out.push({ x1: x, y1: y, x2, y2, depth });
  const spread = 0.3 + Math.random() * 0.2;
  grow(x2, y2, angle - spread, len * 0.68, depth - 1, out);
  grow(x2, y2, angle + spread, len * 0.65, depth - 1, out);
  if (depth > 3 && Math.random() > 0.5)
    grow(x2, y2, angle + (Math.random() - 0.5) * 0.5, len * 0.52, depth - 2, out);
}

function hex(h: string, a: number) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function MountainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    let segs: Segment[] = [];
    let bugs: Bug[] = [];

    const GOLD   = "#ffe100";
    const PURPLE = "#490e6f";

    // Wide mountain polygon — low peak, broad base spanning full width
    function mountainPoly(w: number, h: number) {
      const base = h * 0.92;
      const peak = { x: w * 0.5, y: h * 0.22 };
      return [
        [0, h + 4],
        [0, base],
        // Left far foothill — very gradual rise
        [w * 0.04, base - h * 0.015],
        [w * 0.10, base - h * 0.04],
        [w * 0.17, base - h * 0.09],
        [w * 0.24, base - h * 0.17],
        // Left mid-slope — steady wide angle
        [w * 0.31, base - h * 0.26],
        [w * 0.37, base - h * 0.36],
        [w * 0.42, base - h * 0.46],
        [w * 0.46, base - h * 0.54],
        // Near-peak approach
        [peak.x - w * 0.025, peak.y + h * 0.04],
        [peak.x, peak.y],           // PEAK
        [peak.x + w * 0.025, peak.y + h * 0.04],
        // Right side mirror
        [w * 0.54, base - h * 0.54],
        [w * 0.58, base - h * 0.46],
        [w * 0.63, base - h * 0.36],
        [w * 0.69, base - h * 0.26],
        [w * 0.76, base - h * 0.17],
        [w * 0.83, base - h * 0.09],
        [w * 0.90, base - h * 0.04],
        [w * 0.96, base - h * 0.015],
        [w, base],
        [w, h + 4],
      ];
    }

    function build() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      segs = [];

      const base = H * 0.92;
      const peakX = W * 0.5;
      const peakY = H * 0.22;

      // Dense branch networks spread across the wide mountain face
      const roots = [
        // Summit — straight up, longest
        { x: peakX,     y: peakY + H * 0.03, a: -Math.PI / 2,         l: H * 0.22, d: 8 },
        // Upper-left slope
        { x: W * 0.40,  y: base - H * 0.48,  a: -Math.PI / 2 - 0.18,  l: H * 0.17, d: 7 },
        // Upper-right slope
        { x: W * 0.60,  y: base - H * 0.48,  a: -Math.PI / 2 + 0.18,  l: H * 0.17, d: 7 },
        // Left mid-slope
        { x: W * 0.30,  y: base - H * 0.28,  a: -Math.PI / 2 - 0.28,  l: H * 0.16, d: 7 },
        // Right mid-slope
        { x: W * 0.70,  y: base - H * 0.28,  a: -Math.PI / 2 + 0.28,  l: H * 0.16, d: 7 },
        // Left lower-slope
        { x: W * 0.20,  y: base - H * 0.14,  a: -Math.PI / 2 - 0.22,  l: H * 0.13, d: 6 },
        // Right lower-slope
        { x: W * 0.80,  y: base - H * 0.14,  a: -Math.PI / 2 + 0.22,  l: H * 0.13, d: 6 },
        // Left foothill
        { x: W * 0.10,  y: base - H * 0.05,  a: -Math.PI / 2 - 0.12,  l: H * 0.09, d: 5 },
        // Right foothill
        { x: W * 0.90,  y: base - H * 0.05,  a: -Math.PI / 2 + 0.12,  l: H * 0.09, d: 5 },
      ];

      for (const r of roots) grow(r.x, r.y, r.a, r.l, r.d, segs);

      bugs = [];
      for (let i = 0; i < 130; i++) {
        const isGold = Math.random() < 0.4;
        bugs.push({
          seg:   Math.floor(Math.random() * segs.length),
          t:     Math.random(),
          speed: 0.0015 + Math.random() * 0.003,
          gold:  isGold,
          size:  isGold ? 2.8 + Math.random() * 2.2 : 2 + Math.random() * 1.6,
          alpha: 0.65 + Math.random() * 0.35,
          trail: [],
        });
      }
    }

    function drawMountain() {
      const poly = mountainPoly(W, H);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
      ctx.closePath();

      const peakY = H * 0.22;
      const grad = ctx.createLinearGradient(W * 0.5, peakY, W * 0.5, H);
      grad.addColorStop(0,    "rgba(100, 25, 160, 0.95)");
      grad.addColorStop(0.3,  "rgba(70,  12, 110, 0.93)");
      grad.addColorStop(0.65, "rgba(40,   6,  70, 0.95)");
      grad.addColorStop(1,    "rgba(12,   0,  22, 0.98)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Rim highlight
      ctx.strokeStyle = "rgba(255,225,0,0.10)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Summit glow — wide radial corona
      const peakX = W * 0.5;
      const sg = ctx.createRadialGradient(peakX, peakY, 0, peakX, peakY, W * 0.22);
      sg.addColorStop(0,    "rgba(255,225,0, 0.32)");
      sg.addColorStop(0.15, "rgba(255,225,0, 0.14)");
      sg.addColorStop(0.45, "rgba(100,30,180,0.06)");
      sg.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(peakX, peakY, W * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPaths() {
      for (const s of segs) {
        const a = 0.055 + s.depth * 0.02;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.strokeStyle = s.depth > 5 ? hex(GOLD, a * 0.75) : hex(PURPLE, a + 0.04);
        ctx.lineWidth = Math.max(0.3, s.depth * 0.28 - 0.4);
        ctx.stroke();
      }
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Stars
      for (let i = 0; i < 180; i++) {
        const sx = (i * 137.508 + 17) % W;
        const sy = (i * 83.1   + 31) % (H * 0.72);
        const sr = 0.3 + (i % 4) * 0.16;
        ctx.globalAlpha = 0.12 + (i % 6) * 0.05;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = i % 4 === 0 ? GOLD : "#c084fc";
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawMountain();
      drawPaths();

      // Lightning bugs
      for (const bug of bugs) {
        bug.t += bug.speed;
        if (bug.t >= 1) {
          bug.t = 0;
          bug.seg = Math.floor(Math.random() * segs.length);
          bug.trail = [];
        }
        const s = segs[bug.seg];
        if (!s) continue;
        const x = lerp(s.x1, s.x2, bug.t);
        const y = lerp(s.y1, s.y2, bug.t);

        bug.trail.push({ x, y });
        if (bug.trail.length > 16) bug.trail.shift();

        const col = bug.gold ? GOLD : "#9333ea";

        for (let i = 0; i < bug.trail.length; i++) {
          const tp = bug.trail[i];
          ctx.globalAlpha = (i / bug.trail.length) * bug.alpha * 0.45;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, bug.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Glow halo
        const glow = ctx.createRadialGradient(x, y, 0, x, y, bug.size * 5.5);
        glow.addColorStop(0,   hex(col, bug.alpha * 0.85));
        glow.addColorStop(0.4, hex(col, bug.alpha * 0.28));
        glow.addColorStop(1,   hex(col, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, bug.size * 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.globalAlpha = bug.alpha;
        ctx.fillStyle = bug.gold ? "#fffde7" : "#ede9fe";
        ctx.beginPath();
        ctx.arc(x, y, bug.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(tick);
    }

    build();
    tick();
    window.addEventListener("resize", build);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", build); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

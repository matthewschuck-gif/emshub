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

// Recursively grow a branch tree from (x,y) in direction `angle`
function grow(
  x: number, y: number,
  angle: number, len: number, depth: number,
  out: Segment[]
) {
  if (depth === 0 || len < 5) return;
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  out.push({ x1: x, y1: y, x2, y2, depth });
  const spread = 0.28 + Math.random() * 0.22;
  grow(x2, y2, angle - spread, len * 0.7, depth - 1, out);
  grow(x2, y2, angle + spread, len * 0.65, depth - 1, out);
  if (depth > 3 && Math.random() > 0.45)
    grow(x2, y2, angle + (Math.random() - 0.5) * 0.4, len * 0.5, depth - 2, out);
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

    const PURPLE = "#490e6f";
    const GOLD   = "#ffe100";

    function hex(h: string, a: number) {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    // Mountain silhouette as a polygon (canvas coords)
    function mountainPoly(w: number, h: number) {
      const base = h * 0.88;
      const peak = { x: w * 0.5, y: h * 0.12 };
      return [
        [0, h],
        [0, base],
        [w * 0.06, base - h * 0.02],
        [w * 0.14, base - h * 0.06],
        [w * 0.22, base - h * 0.12],
        [w * 0.30, base - h * 0.20],
        [w * 0.38, base - h * 0.30],
        [w * 0.43, base - h * 0.42],
        [peak.x - w * 0.03, peak.y + h * 0.06],
        [peak.x, peak.y],                          // PEAK
        [peak.x + w * 0.03, peak.y + h * 0.06],
        [w * 0.57, base - h * 0.42],
        [w * 0.62, base - h * 0.30],
        [w * 0.70, base - h * 0.20],
        [w * 0.78, base - h * 0.12],
        [w * 0.86, base - h * 0.06],
        [w * 0.94, base - h * 0.02],
        [w, base],
        [w, h],
      ];
    }

    function build() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      segs = [];

      const base = H * 0.88;
      const peakX = W * 0.5;
      const peakY = H * 0.12;

      // Branch clusters: peak + left/right shoulders + foothills
      const roots = [
        // Summit — tallest, most prominent
        { x: peakX,        y: peakY + H * 0.04,  a: -Math.PI / 2,        l: H * 0.28, d: 8 },
        // Left shoulder
        { x: W * 0.38,     y: base - H * 0.30,   a: -Math.PI / 2 - 0.15, l: H * 0.18, d: 7 },
        // Right shoulder
        { x: W * 0.62,     y: base - H * 0.30,   a: -Math.PI / 2 + 0.15, l: H * 0.18, d: 7 },
        // Left mid-slope
        { x: W * 0.28,     y: base - H * 0.18,   a: -Math.PI / 2 - 0.25, l: H * 0.13, d: 6 },
        // Right mid-slope
        { x: W * 0.72,     y: base - H * 0.18,   a: -Math.PI / 2 + 0.25, l: H * 0.13, d: 6 },
        // Left foothill
        { x: W * 0.16,     y: base - H * 0.07,   a: -Math.PI / 2 - 0.1,  l: H * 0.09, d: 5 },
        // Right foothill
        { x: W * 0.84,     y: base - H * 0.07,   a: -Math.PI / 2 + 0.1,  l: H * 0.09, d: 5 },
      ];

      for (const r of roots) grow(r.x, r.y, r.a, r.l, r.d, segs);

      // Populate lightning bugs
      bugs = [];
      for (let i = 0; i < 110; i++) {
        const isGold = Math.random() < 0.38;
        bugs.push({
          seg:   Math.floor(Math.random() * segs.length),
          t:     Math.random(),
          speed: 0.0018 + Math.random() * 0.0035,
          gold:  isGold,
          size:  isGold ? 2.5 + Math.random() * 2 : 1.8 + Math.random() * 1.5,
          alpha: 0.7 + Math.random() * 0.3,
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

      // Fill — deep purple body
      const grad = ctx.createLinearGradient(W * 0.5, H * 0.12, W * 0.5, H * 0.88);
      grad.addColorStop(0,    "rgba(90, 20, 140, 0.92)");
      grad.addColorStop(0.35, "rgba(55, 10, 95,  0.88)");
      grad.addColorStop(0.7,  "rgba(30,  5, 55,  0.92)");
      grad.addColorStop(1,    "rgba(10,  0, 20,  0.97)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Edge highlight
      ctx.strokeStyle = "rgba(255,225,0,0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Summit crown glow
      const peakX = W * 0.5, peakY = H * 0.12;
      const sg = ctx.createRadialGradient(peakX, peakY, 0, peakX, peakY, W * 0.18);
      sg.addColorStop(0,    "rgba(255,225,0, 0.30)");
      sg.addColorStop(0.25, "rgba(255,225,0, 0.12)");
      sg.addColorStop(0.6,  "rgba(100,30,180,0.06)");
      sg.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(peakX, peakY, W * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawPaths() {
      for (const s of segs) {
        const a = 0.06 + s.depth * 0.022;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.strokeStyle = s.depth > 5
          ? hex(GOLD, a * 0.7)
          : hex(PURPLE, a + 0.05);
        ctx.lineWidth = Math.max(0.4, s.depth * 0.3 - 0.5);
        ctx.stroke();
      }
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Sky stars
      for (let i = 0; i < 160; i++) {
        const sx = (i * 137.508 + 17) % W;
        const sy = (i * 83.1   + 31) % (H * 0.75);
        const sr = 0.3 + (i % 4) * 0.18;
        ctx.globalAlpha = 0.15 + (i % 5) * 0.06;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = i % 4 === 0 ? GOLD : "#c084fc";
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawMountain();
      drawPaths();

      // Bugs
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
        if (bug.trail.length > 14) bug.trail.shift();

        const col = bug.gold ? GOLD : PURPLE;

        // Trail fade
        for (let i = 0; i < bug.trail.length; i++) {
          const tp = bug.trail[i];
          const ta = (i / bug.trail.length) * bug.alpha * 0.5;
          ctx.globalAlpha = ta;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, bug.size * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Glow halo
        const glow = ctx.createRadialGradient(x, y, 0, x, y, bug.size * 5);
        glow.addColorStop(0,   hex(col, bug.alpha * 0.9));
        glow.addColorStop(0.4, hex(col, bug.alpha * 0.3));
        glow.addColorStop(1,   hex(col, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, bug.size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.globalAlpha = bug.alpha;
        ctx.fillStyle = bug.gold ? "#fff9c4" : "#e9d5ff";
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

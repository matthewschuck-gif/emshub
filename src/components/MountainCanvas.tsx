"use client";

import { useEffect, useRef } from "react";

interface Branch {
  x1: number; y1: number;
  x2: number; y2: number;
  children: Branch[];
  depth: number;
}

interface Firefly {
  branchIdx: number;
  t: number;       // 0..1 along path
  speed: number;
  color: string;
  alpha: number;
  size: number;
  trail: { x: number; y: number; a: number }[];
}

function buildBranch(
  x: number, y: number,
  angle: number, length: number, depth: number,
  branches: { x1: number; y1: number; x2: number; y2: number; depth: number }[]
) {
  if (depth === 0 || length < 4) return;
  const x2 = x + Math.cos(angle) * length;
  const y2 = y + Math.sin(angle) * length;
  branches.push({ x1: x, y1: y, x2, y2, depth });
  const spread = 0.35 + Math.random() * 0.2;
  buildBranch(x2, y2, angle - spread, length * 0.72, depth - 1, branches);
  buildBranch(x2, y2, angle + spread, length * 0.68, depth - 1, branches);
  if (depth > 3 && Math.random() > 0.5)
    buildBranch(x2, y2, angle + (Math.random() - 0.5) * 0.5, length * 0.55, depth - 2, branches);
}

export default function MountainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;

    type FlatBranch = { x1: number; y1: number; x2: number; y2: number; depth: number };
    let branches: FlatBranch[] = [];
    let fireflies: Firefly[] = [];

    function buildMountain() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      branches = [];

      // Mountain silhouette points
      const baseY = H * 0.82;
      const peakX = W * 0.5;
      const peakY = H * 0.15;

      // Three tree clusters: left slope, peak, right slope
      const roots = [
        { x: peakX - W * 0.22, y: baseY - H * 0.05, baseAngle: -Math.PI / 2 - 0.3, len: H * 0.18 },
        { x: peakX, y: peakY + H * 0.04, baseAngle: -Math.PI / 2, len: H * 0.24 },
        { x: peakX + W * 0.18, y: baseY - H * 0.04, baseAngle: -Math.PI / 2 + 0.25, len: H * 0.16 },
        { x: peakX - W * 0.38, y: baseY, baseAngle: -Math.PI / 2 - 0.1, len: H * 0.12 },
        { x: peakX + W * 0.34, y: baseY, baseAngle: -Math.PI / 2 + 0.1, len: H * 0.13 },
      ];

      for (const r of roots) {
        buildBranch(r.x, r.y, r.baseAngle, r.len, 7, branches);
      }

      // Spawn fireflies along branches
      fireflies = [];
      const GOLD = "#eab308";
      const PURPLE = "#a855f7";
      const LAVENDER = "#c084fc";

      for (let i = 0; i < 80; i++) {
        const branchIdx = Math.floor(Math.random() * branches.length);
        const colorRoll = Math.random();
        fireflies.push({
          branchIdx,
          t: Math.random(),
          speed: 0.002 + Math.random() * 0.004,
          color: colorRoll < 0.35 ? GOLD : colorRoll < 0.65 ? PURPLE : LAVENDER,
          alpha: 0.6 + Math.random() * 0.4,
          size: 1.5 + Math.random() * 2.5,
          trail: [],
        });
      }
    }

    function drawMountain() {
      const peakX = W * 0.5;
      const peakY = H * 0.15;
      const baseY = H * 0.82;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, baseY + 80);
      // Left foot
      ctx.lineTo(W * 0.05, baseY);
      ctx.lineTo(W * 0.18, baseY - H * 0.04);
      ctx.lineTo(W * 0.28, baseY - H * 0.07);
      // Left shoulder
      ctx.lineTo(W * 0.38, baseY - H * 0.14);
      ctx.lineTo(peakX - W * 0.04, peakY + H * 0.05);
      // Peak
      ctx.lineTo(peakX, peakY);
      ctx.lineTo(peakX + W * 0.04, peakY + H * 0.05);
      // Right shoulder
      ctx.lineTo(W * 0.62, baseY - H * 0.14);
      ctx.lineTo(W * 0.72, baseY - H * 0.05);
      ctx.lineTo(W * 0.84, baseY - H * 0.01);
      // Right foot
      ctx.lineTo(W, baseY);
      ctx.lineTo(W, baseY + 80);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, peakY, 0, baseY + 80);
      grad.addColorStop(0, "rgba(60,20,110,0.72)");
      grad.addColorStop(0.5, "rgba(30,10,60,0.82)");
      grad.addColorStop(1, "rgba(8,6,18,0.95)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Subtle mountain edge glow
      ctx.save();
      ctx.strokeStyle = "rgba(147,51,234,0.18)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    function drawBranches() {
      for (const b of branches) {
        const alpha = 0.04 + (7 - b.depth) * 0.015;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
        ctx.lineWidth = Math.max(0.3, b.depth * 0.25);
        ctx.stroke();
      }
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Stars / ambient noise
      ctx.save();
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 120; i++) {
        // deterministic scatter using index as seed
        const sx = ((i * 137.508 + 42) % W);
        const sy = ((i * 97.3 + 13) % (H * 0.75));
        const sr = 0.4 + (i % 5) * 0.15;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? "#fbbf24" : "#c084fc";
        ctx.fill();
      }
      ctx.restore();

      drawMountain();
      drawBranches();

      // Fireflies
      for (const ff of fireflies) {
        ff.t += ff.speed;
        if (ff.t > 1) {
          ff.t = 0;
          ff.branchIdx = Math.floor(Math.random() * branches.length);
          ff.trail = [];
        }

        const b = branches[ff.branchIdx];
        if (!b) continue;

        const x = lerp(b.x1, b.x2, ff.t);
        const y = lerp(b.y1, b.y2, ff.t);

        ff.trail.push({ x, y, a: ff.alpha });
        if (ff.trail.length > 12) ff.trail.shift();

        // Draw trail
        for (let i = 0; i < ff.trail.length; i++) {
          const tp = ff.trail[i];
          const ta = (i / ff.trail.length) * tp.a * 0.6;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, ff.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = ff.color.replace(")", `,${ta})`).replace("rgb(", "rgba(").replace("#", "").replace(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, (_, r, g, bh) =>
            `rgba(${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(bh, 16)},${ta})`
          );
          // simpler approach
          ctx.globalAlpha = ta;
          ctx.fillStyle = ff.color;
          ctx.fill();
        }

        ctx.globalAlpha = 1;

        // Glow head
        const glow = ctx.createRadialGradient(x, y, 0, x, y, ff.size * 4);
        glow.addColorStop(0, ff.color + "cc");
        glow.addColorStop(0.4, ff.color + "55");
        glow.addColorStop(1, ff.color + "00");
        ctx.beginPath();
        ctx.arc(x, y, ff.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, ff.size, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = ff.alpha * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Summit glow
      const peakX = W * 0.5;
      const peakY = H * 0.15;
      const sg = ctx.createRadialGradient(peakX, peakY, 0, peakX, peakY, 120);
      sg.addColorStop(0, "rgba(234,179,8,0.18)");
      sg.addColorStop(0.5, "rgba(168,85,247,0.08)");
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(peakX, peakY, 120, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    }

    buildMountain();
    tick();

    const onResize = () => { buildMountain(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

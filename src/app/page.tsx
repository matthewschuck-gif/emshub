"use client";

import { useEffect, useState, useRef } from "react";
import ToolCard, { type Tool } from "@/components/ToolCard";

const SUPABASE_URL = "https://yvutgnpgnthvnonhgdux.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dXRnbnBnbnRodnbub25oZ2R1eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ1ODgwNDUzLCJleHAiOjIwNjE0NTY0NTN9.gFkH7MLSmC1-3YCFkEBoHZJRQmYaruBY4j9MVH9jIDM";

const DEFAULT_TOOLS: Tool[] = [
  { id: "bic",      name: "Behavior Intervention Center", abbr: "BIC", url: "https://behaviorinterventioncenter.com",                                                                                   desc: "Behavior tracking & intervention logging",         color: "#7c3aed" },
  { id: "trail",    name: "Trail Journal",                abbr: "TJ",  url: "https://trailjournal.org",                                                                                                  desc: "Student growth & reflection portal",               color: "#490e6f" },
  { id: "coc",      name: "Clash of Classes",             abbr: "CoC", url: "https://clashofclasses.org",                                                                                                desc: "Gamified squad competition & LRG points",          color: "#c47f00" },
  { id: "report",   name: "Report Logger",                abbr: "RL",  url: "https://bit.ly/reportlogger",                                                                                               desc: "PIN-protected incident report generation",         color: "#6d28d9" },
  { id: "followup", name: "Trailback Panel",              abbr: "TB",  url: "https://trailjournal.org/panel",                                                                                            desc: "Follow-up tracking & panel completion → CoC",      color: "#9333ea" },
  { id: "comms",    name: "EMS Comms",                    abbr: "EC",  url: "#",                                                                                                                          desc: "Communication output & announcements",             color: "#b45309" },
  { id: "actbus",   name: "Activity Bus",                 abbr: "AB",  url: "#",                                                                                                                          desc: "Activity bus selector & scheduling",               color: "#d97706" },
  { id: "mtss",     name: "MTSS",                         abbr: "MT",  url: "https://matthewschuck-gif.github.io/mtss/",                                                                                  desc: "Tier framework, team meetings, referral tracker",  color: "#4c1d95" },
  { id: "traitdough",     name: "Trait Dough",            abbr: "TD",  url: "https://bit.ly/traitdough",                                                                                                  desc: "Log LRG traits → live squad points in CoC",        color: "#16a34a" },
  { id: "accountability", name: "Accountability Log",     abbr: "AL",  url: "https://docs.google.com/spreadsheets/d/1IVFnkQQvSvNSY_OZPMutPzkTqmJ1j5XYRoT9YvNy-v4/edit",                               desc: "Intervention & consequence log (staff only)",       color: "#dc2626" },
  { id: "mlc-handbooks",  name: "MLC Handbooks",          abbr: "MLC", url: "https://bit.ly/emsstudentleaders",                                                                                            desc: "All 5 leadership track handbooks — Generals, Ambassadors, Delegates, Vanguard & MLC overview", color: "#0891b2" },
];

const STORAGE_KEY  = "emsmountain_tools";
const LOGO_KEY     = "emsmountain_logo";
const TAGLINE_KEY  = "emsmountain_tagline";
const DEFAULT_TAGLINE = "Every path leads here. Every tool fires from the summit.";

function load(): Tool[] {
  if (typeof window === "undefined") return DEFAULT_TOOLS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TOOLS;
    const saved: Tool[] = JSON.parse(raw);
    const savedIds = new Set(saved.map((t) => t.id));
    const merged = [...saved];
    for (const d of DEFAULT_TOOLS) if (!savedIds.has(d.id)) merged.push(d);
    return merged;
  } catch { return DEFAULT_TOOLS; }
}

function save(tools: Tool[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
}

async function loadLogoFromSupabase(): Promise<string | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/app_data?key=eq.mountain_logo&select=value`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const rows = await res.json();
    if (rows?.[0]?.value?.url) return rows[0].value.url;
  } catch { /* fall through */ }
  return null;
}

async function saveLogoToSupabase(dataUrl: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ key: "mountain_logo", value: { url: dataUrl } }),
  });
}

// ── Fireflies canvas ──
function Fireflies() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cnv: HTMLCanvasElement = canvas;
    const ctx = cnv.getContext("2d")!;

    const resize = () => {
      cnv.width = window.innerWidth;
      cnv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const flies = Array.from({ length: 32 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1.2 + Math.random() * 1.6,
      alpha: Math.random(),
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      alphaSpeed: 0.006 + Math.random() * 0.012,
      hue: 58 + Math.random() * 28,
      glowR: 8 + Math.random() * 14,
    }));

    let animId: number;
    function draw() {
      ctx.clearRect(0, 0, cnv.width, cnv.height);
      flies.forEach((f) => {
        f.x += f.vx + Math.sin(Date.now() * 0.0004 + f.r) * 0.15;
        f.y += f.vy + Math.cos(Date.now() * 0.0003 + f.r) * 0.12;
        if (f.x < 0) f.x = cnv.width;
        if (f.x > cnv.width) f.x = 0;
        if (f.y < 0) f.y = cnv.height;
        if (f.y > cnv.height) f.y = 0;
        f.alpha += f.alphaDir * f.alphaSpeed;
        if (f.alpha >= 1) { f.alpha = 1; f.alphaDir = -1; }
        if (f.alpha <= 0) { f.alpha = 0; f.alphaDir = 1; }

        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowR);
        grd.addColorStop(0, `hsla(${f.hue},100%,72%,${f.alpha * 0.55})`);
        grd.addColorStop(1, `hsla(${f.hue},100%,72%,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${f.hue},100%,92%,${f.alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 6,
      }}
    />
  );
}

let nextId = 100;

export default function Home() {
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [editing, setEditing] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
  const [editingTagline, setEditingTagline] = useState(false);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTools(load());
    loadLogoFromSupabase().then((url) => {
      if (url) { setLogo(url); return; }
      const local = localStorage.getItem(LOGO_KEY);
      if (local) setLogo(local);
    });
    const savedTag = localStorage.getItem(TAGLINE_KEY);
    if (savedTag) setTagline(savedTag);
  }, []);

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogo(dataUrl);
      localStorage.setItem(LOGO_KEY, dataUrl);
      await saveLogoToSupabase(dataUrl).catch(() => {});
    };
    reader.readAsDataURL(file);
  }

  function startTaglineEdit(e: React.MouseEvent) {
    e.preventDefault();
    setEditingTagline(true);
    setTimeout(() => {
      taglineRef.current?.focus();
      const range = document.createRange();
      range.selectNodeContents(taglineRef.current!);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }, 0);
  }

  function commitTagline() {
    const val = taglineRef.current?.innerText?.trim() || DEFAULT_TAGLINE;
    setTagline(val);
    setEditingTagline(false);
    localStorage.setItem(TAGLINE_KEY, val);
  }

  function update(updated: Tool) {
    setTools((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      save(next);
      return next;
    });
  }

  function addPath() {
    const newTool: Tool = {
      id: `tool_${nextId++}`,
      name: "New Path",
      abbr: "NEW",
      url: "#",
      desc: "Double-click any field to edit",
      color: "#490e6f",
    };
    setTools((prev) => { const next = [...prev, newTool]; save(next); return next; });
  }

  function remove(id: string) {
    setTools((prev) => { const next = prev.filter((t) => t.id !== id); save(next); return next; });
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", ...parseForestBg() }}>
      <Fireflies />
      <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoFile} style={{ display: "none" }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1.5rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: "4rem", paddingBottom: "3rem", animation: "fade-in-up 0.8s ease both" }}>

          {/* Logo upload spot */}
          <div
            onClick={() => fileRef.current?.click()}
            title="Click to upload mountain logo"
            style={{
              width: 110, height: 110,
              borderRadius: "50%",
              background: logo ? "transparent" : "rgba(73,14,111,0.06)",
              border: logo ? "3px solid rgba(73,14,111,0.15)" : "2.5px dashed rgba(73,14,111,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.75rem",
              cursor: "pointer",
              overflow: "hidden",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: logo ? "0 2px 18px rgba(73,14,111,0.12)" : "none",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(73,14,111,0.6)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = logo ? "rgba(73,14,111,0.15)" : "rgba(73,14,111,0.3)"; }}
          >
            {logo ? (
              <img src={logo} alt="Mountain logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 28, marginBottom: 2, opacity: 0.4 }}>⛰</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(73,14,111,0.5)", textTransform: "uppercase" }}>Add Logo</div>
              </div>
            )}
          </div>

          <h1 style={{
            fontSize: "clamp(3rem,8vw,5.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "0.75rem",
            color: "#490e6f",
          }}>
            The Mountain
          </h1>

          {/* Editable tagline */}
          <p
            ref={taglineRef}
            contentEditable={editingTagline}
            suppressContentEditableWarning
            onDoubleClick={startTaglineEdit}
            onBlur={commitTagline}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commitTagline(); }
              if (e.key === "Escape") { setEditingTagline(false); }
            }}
            title={editingTagline ? "" : "Double-click to edit tagline"}
            style={{
              fontSize: "1.05rem", color: "#7c5fa0", maxWidth: 480, margin: "0 auto",
              outline: editingTagline ? "1px solid rgba(73,14,111,0.35)" : "none",
              borderRadius: 6, padding: editingTagline ? "2px 6px" : 0,
              cursor: editingTagline ? "text" : "default",
              transition: "outline 0.15s",
              userSelect: editingTagline ? "text" : "none",
              WebkitUserSelect: editingTagline ? "text" : "none",
            }}
          >
            {tagline}
          </p>

          {/* Edit toggle */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setEditing((e) => !e)}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: 20,
                border: `1px solid ${editing ? "rgba(73,14,111,0.7)" : "rgba(73,14,111,0.25)"}`,
                background: editing ? "rgba(73,14,111,0.1)" : "rgba(73,14,111,0.05)",
                color: editing ? "#490e6f" : "#7c5fa0",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {editing ? "✓ Done Editing" : "✎ Edit Cards"}
            </button>
            {editing && (
              <button
                onClick={addPath}
                style={{
                  padding: "0.45rem 1.1rem",
                  borderRadius: 20,
                  border: "1px solid rgba(73,14,111,0.3)",
                  background: "rgba(73,14,111,0.08)",
                  color: "#490e6f",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                + Add Path
              </button>
            )}
          </div>
          {editing && (
            <p style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "#9b87b5" }}>
              Double-click any text to edit · Click logo square to upload image · Color swatch on hover
            </p>
          )}
        </div>

        {/* Tool Grid */}
        <div style={{
          display: "grid",
          gap: "1rem",
          width: "100%",
          maxWidth: 1100,
          paddingBottom: "5rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}>
          {tools.map((tool, i) => (
            <div key={tool.id} style={{ position: "relative" }}>
              <ToolCard tool={tool} index={i} onUpdate={update} />
              {editing && (
                <button
                  onClick={() => remove(tool.id)}
                  title="Remove this path"
                  style={{
                    position: "absolute",
                    top: 8, right: 8,
                    width: 22, height: 22,
                    borderRadius: "50%",
                    border: "1px solid rgba(239,68,68,0.4)",
                    background: "rgba(239,68,68,0.1)",
                    color: "#dc2626",
                    fontSize: 13,
                    lineHeight: "20px",
                    cursor: "pointer",
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function parseForestBg(): React.CSSProperties {
  const svgRaw = `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'>
    <!-- Trail paths -->
    <path d='M0 120 Q80 70 180 130 Q280 190 400 150 Q450 132 500 140' stroke='%23c4b49a' stroke-width='3' fill='none' opacity='0.5'/>
    <path d='M0 310 Q100 265 220 320 Q330 368 500 340' stroke='%23c4b49a' stroke-width='2.5' fill='none' opacity='0.4'/>
    <path d='M0 440 Q80 410 170 448 Q280 490 500 462' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.35'/>
    <path d='M60 0 Q90 80 70 200 Q50 320 90 500' stroke='%23c4b49a' stroke-width='2.5' fill='none' opacity='0.42'/>
    <path d='M300 0 Q270 90 300 220 Q330 340 290 500' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.32'/>
    <path d='M440 0 Q420 70 450 180 Q475 280 440 500' stroke='%23c4b49a' stroke-width='1.5' fill='none' opacity='0.28'/>

    <!-- Pine trees -->
    <polygon points='38,108 58,62 78,108' fill='%234a6a3a' opacity='0.16'/>
    <polygon points='32,128 58,72 84,128' fill='%23395830' opacity='0.13'/>
    <rect x='52' y='128' width='12' height='20' fill='%23705030' opacity='0.12'/>

    <polygon points='148,95 172,44 196,95' fill='%234a6a3a' opacity='0.15'/>
    <polygon points='142,118 172,55 202,118' fill='%23395830' opacity='0.12'/>
    <rect x='165' y='118' width='12' height='18' fill='%23705030' opacity='0.11'/>

    <polygon points='348,78 374,28 400,78' fill='%234a6a3a' opacity='0.17'/>
    <polygon points='342,105 374,38 406,105' fill='%23395830' opacity='0.14'/>
    <rect x='367' y='105' width='12' height='20' fill='%23705030' opacity='0.12'/>

    <polygon points='62,298 86,248 110,298' fill='%234a6a3a' opacity='0.14'/>
    <polygon points='56,322 86,258 116,322' fill='%23395830' opacity='0.11'/>
    <rect x='79' y='322' width='12' height='18' fill='%23705030' opacity='0.10'/>

    <polygon points='258,280 284,228 310,280' fill='%234a6a3a' opacity='0.15'/>
    <polygon points='252,306 284,238 316,306' fill='%23395830' opacity='0.12'/>
    <rect x='277' y='306' width='12' height='20' fill='%23705030' opacity='0.11'/>

    <polygon points='418,260 440,214 462,260' fill='%234a6a3a' opacity='0.14'/>
    <polygon points='412,284 440,222 468,284' fill='%23395830' opacity='0.11'/>
    <rect x='433' y='284' width='12' height='18' fill='%23705030' opacity='0.10'/>

    <polygon points='168,390 190,345 212,390' fill='%234a6a3a' opacity='0.13'/>
    <polygon points='162,412 190,352 218,412' fill='%23395830' opacity='0.10'/>
    <rect x='183' y='412' width='12' height='18' fill='%23705030' opacity='0.09'/>

    <!-- Scattered leaves -->
    <ellipse cx='120' cy='200' rx='7' ry='4' fill='%236a8a5a' opacity='0.2' transform='rotate(-28 120 200)'/>
    <ellipse cx='230' cy='175' rx='6' ry='3.5' fill='%235a7a4a' opacity='0.18' transform='rotate(18 230 175)'/>
    <ellipse cx='380' cy='200' rx='7' ry='4' fill='%236a8a5a' opacity='0.17' transform='rotate(-42 380 200)'/>
    <ellipse cx='200' cy='370' rx='6' ry='3.5' fill='%235a7a4a' opacity='0.19' transform='rotate(12 200 370)'/>
    <ellipse cx='340' cy='380' rx='7' ry='4' fill='%236a8a5a' opacity='0.16' transform='rotate(-22 340 380)'/>
    <ellipse cx='80' cy='240' rx='5' ry='3' fill='%237a9a6a' opacity='0.18' transform='rotate(35 80 240)'/>
    <ellipse cx='460' cy='150' rx='6' ry='3.5' fill='%235a7a4a' opacity='0.16' transform='rotate(-15 460 150)'/>
    <ellipse cx='140' cy='460' rx='7' ry='4' fill='%236a8a5a' opacity='0.15' transform='rotate(25 140 460)'/>
    <ellipse cx='420' cy='420' rx='6' ry='3.5' fill='%235a7a4a' opacity='0.14' transform='rotate(-38 420 420)'/>

    <!-- Fern fronds -->
    <path d='M200 240 Q212 225 224 236 Q236 225 248 236' stroke='%235a7a4a' stroke-width='1.5' fill='none' opacity='0.22'/>
    <path d='M200 242 Q210 255 222 248 Q232 258 244 250' stroke='%235a7a4a' stroke-width='1.2' fill='none' opacity='0.18'/>
    <path d='M340 170 Q352 158 364 168 Q376 158 388 168' stroke='%235a7a4a' stroke-width='1.5' fill='none' opacity='0.2'/>
    <path d='M450 350 Q462 337 474 347 Q486 337 498 347' stroke='%235a7a4a' stroke-width='1.3' fill='none' opacity='0.18'/>

    <!-- Mushrooms -->
    <ellipse cx='316' cy='258' rx='10' ry='5' fill='%23c47050' opacity='0.18'/>
    <rect x='312' y='258' width='8' height='10' fill='%23d8c0a8' opacity='0.14'/>
    <ellipse cx='132' cy='355' rx='8' ry='4' fill='%23c47050' opacity='0.16'/>
    <rect x='128' y='355' width='8' height='8' fill='%23d8c0a8' opacity='0.12'/>

    <!-- Pebbles / rocks -->
    <ellipse cx='175' cy='270' rx='9' ry='6' fill='%23b0a090' opacity='0.2'/>
    <ellipse cx='305' cy='165' rx='7' ry='4.5' fill='%23b0a090' opacity='0.18'/>
    <ellipse cx='430' cy='310' rx='8' ry='5' fill='%23b0a090' opacity='0.16'/>
    <ellipse cx='80' cy='410' rx='10' ry='6' fill='%23b0a090' opacity='0.15'/>
  </svg>`;

  const encoded = svgRaw.replace(/\n\s*/g, " ").replace(/'/g, "%27");

  return {
    backgroundColor: "#eef0e8",
    backgroundImage: `url("data:image/svg+xml,${encoded}")`,
    backgroundRepeat: "repeat",
    backgroundSize: "500px 500px",
  };
}

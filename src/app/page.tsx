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
  { id: "followup", name: "Trailback Panel",              abbr: "TB",  url: "https://trailjournal.org/panel",                                                                               desc: "Follow-up tracking & panel completion → CoC",      color: "#9333ea" },
  { id: "comms",    name: "EMS Comms",                    abbr: "EC",  url: "#",                                                                                                                          desc: "Communication output & announcements",             color: "#b45309" },
  { id: "actbus",   name: "Activity Bus",                 abbr: "AB",  url: "#",                                                                                                                          desc: "Activity bus selector & scheduling",               color: "#d97706" },
  { id: "mtss",     name: "MTSS",                         abbr: "MT",  url: "#",                                                                                                                          desc: "Multi-Tiered System of Supports",                  color: "#4c1d95", coming: true },
  { id: "traitdough",     name: "Trait Dough",            abbr: "TD",  url: "https://bit.ly/traitdough",                                                                           desc: "Log LRG traits → live squad points in CoC",        color: "#16a34a" },
  { id: "accountability", name: "Accountability Log",     abbr: "AL",  url: "https://docs.google.com/spreadsheets/d/1IVFnkQQvSvNSY_OZPMutPzkTqmJ1j5XYRoT9YvNy-v4/edit",                               desc: "Intervention & consequence log (staff only)",       color: "#dc2626" },
  { id: "mlc-handbooks",  name: "MLC Handbooks",          abbr: "MLC", url: "https://bit.ly/emsstudentleaders",                                                                                            desc: "All 5 leadership track handbooks — Generals, Ambassadors, Delegates, Vanguard & MLC overview", color: "#0891b2" },
];

const STORAGE_KEY = "emsmountain_tools";
const LOGO_KEY    = "emsmountain_logo";

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

const TRAILS_BG = `
  background-color: #f2ede6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cpath d='M0 75 Q75 45 150 90 Q225 135 300 105' stroke='%23c4b49a' stroke-width='2.5' fill='none' opacity='0.55'/%3E%3Cpath d='M0 180 Q90 150 180 195 Q255 232 300 210' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.4'/%3E%3Cpath d='M-30 255 Q45 225 120 262 Q210 307 300 278' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.45'/%3E%3Cpath d='M30 0 Q60 60 45 150 Q30 225 75 300' stroke='%23c4b49a' stroke-width='2.5' fill='none' opacity='0.5'/%3E%3Cpath d='M195 -15 Q165 75 210 150 Q240 210 225 300' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.38'/%3E%3Cpath d='M105 -10 Q90 55 120 130 Q145 195 110 300' stroke='%23c4b49a' stroke-width='1.5' fill='none' opacity='0.3'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 300px 300px;
`.trim().replace(/\n\s*/g, " ");

let nextId = 100;

export default function Home() {
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [editing, setEditing] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTools(load());
    // Try Supabase first, fall back to localStorage
    loadLogoFromSupabase().then((url) => {
      if (url) { setLogo(url); return; }
      const local = localStorage.getItem(LOGO_KEY);
      if (local) setLogo(local);
    });
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
    <main style={{ minHeight: "100vh", position: "relative", ...parseTrailsBg() }}>
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
          <p style={{ fontSize: "1.05rem", color: "#7c5fa0", maxWidth: 480, margin: "0 auto" }}>
            Every path leads here. Every tool fires from the summit.
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
              Double-click any text to edit · Color swatch on hover · Delete appears on hover
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

function parseTrailsBg(): React.CSSProperties {
  return {
    backgroundColor: "#f2ede6",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cpath d='M0 75 Q75 45 150 90 Q225 135 300 105' stroke='%23c4b49a' stroke-width='2.5' fill='none' opacity='0.55'/%3E%3Cpath d='M0 180 Q90 150 180 195 Q255 232 300 210' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.4'/%3E%3Cpath d='M-30 255 Q45 225 120 262 Q210 307 300 278' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.45'/%3E%3Cpath d='M30 0 Q60 60 45 150 Q30 225 75 300' stroke='%23c4b49a' stroke-width='2.5' fill='none' opacity='0.5'/%3E%3Cpath d='M195 -15 Q165 75 210 150 Q240 210 225 300' stroke='%23c4b49a' stroke-width='2' fill='none' opacity='0.38'/%3E%3Cpath d='M105 -10 Q90 55 120 130 Q145 195 110 300' stroke='%23c4b49a' stroke-width='1.5' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
    backgroundSize: "300px 300px",
  };
}

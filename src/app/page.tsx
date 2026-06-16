"use client";

import { useEffect, useState } from "react";
import MountainCanvas from "@/components/MountainCanvas";
import ToolCard, { type Tool } from "@/components/ToolCard";

const DEFAULT_TOOLS: Tool[] = [
  { id: "bic",     name: "Behavior Intervention Center", abbr: "BIC", url: "https://behaviorinterventioncenter.com", desc: "Behavior tracking & intervention logging",    color: "#7c3aed" },
  { id: "trail",   name: "Trail Journal",                abbr: "TJ",  url: "https://trailjournal.org",             desc: "Student growth & reflection portal",          color: "#490e6f" },
  { id: "coc",     name: "Clash of Classes",             abbr: "CoC", url: "https://clashofclasses.org",           desc: "Gamified class competition & points",          color: "#ffe100" },
  { id: "report",  name: "Report Logger",                abbr: "RL",  url: "https://bit.ly/reportlogger",          desc: "Incident report generation & logging",         color: "#6d28d9" },
  { id: "followup",name: "Trailback Panel",              abbr: "TB",  url: "#",                                    desc: "Follow-up tracking & panel completion",        color: "#9333ea" },
  { id: "comms",   name: "EMS Comms",                    abbr: "EC",  url: "#",                                    desc: "Communication output & announcements",         color: "#b45309" },
  { id: "actbus",  name: "Activity Bus",                 abbr: "AB",  url: "#",                                    desc: "Activity bus selector & scheduling",           color: "#d97706" },
  { id: "mtss",    name: "MTSS",                         abbr: "MT",  url: "#",                                    desc: "Multi-Tiered System of Supports",              color: "#4c1d95", coming: true },
];

const STORAGE_KEY = "emsmountain_tools";

function load(): Tool[] {
  if (typeof window === "undefined") return DEFAULT_TOOLS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TOOLS;
    const saved: Tool[] = JSON.parse(raw);
    // Merge: keep defaults for any new ids not yet saved
    const savedIds = new Set(saved.map((t) => t.id));
    const merged = [...saved];
    for (const d of DEFAULT_TOOLS) if (!savedIds.has(d.id)) merged.push(d);
    return merged;
  } catch { return DEFAULT_TOOLS; }
}

function save(tools: Tool[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
}

let nextId = 100;

export default function Home() {
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setTools(load()); }, []);

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
    <main style={{ minHeight: "100vh", background: "#0a0014", position: "relative" }}>
      <MountainCanvas />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1.5rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: "5rem", paddingBottom: "3rem", animation: "fade-in-up 0.8s ease both" }}>
          <h1 style={{
            fontSize: "clamp(3rem,8vw,6rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "0.75rem",
            background: "linear-gradient(135deg, #f5f0ff 0%, #c084fc 35%, #ffe100 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 40px rgba(255,225,0,0.25))",
          }}>
            The Mountain
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#9b7fc0", maxWidth: 480, margin: "0 auto" }}>
            Every path leads here. Every tool fires from the summit.
          </p>

          {/* Edit toggle */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setEditing((e) => !e)}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: 20,
                border: `1px solid ${editing ? "#ffe100" : "rgba(73,14,111,0.6)"}`,
                background: editing ? "rgba(255,225,0,0.1)" : "rgba(73,14,111,0.2)",
                color: editing ? "#ffe100" : "#9b7fc0",
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
                  border: "1px solid rgba(255,225,0,0.4)",
                  background: "rgba(255,225,0,0.08)",
                  color: "#ffe100",
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
            <p style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "#4b5563" }}>
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
                    border: "1px solid rgba(239,68,68,0.5)",
                    background: "rgba(239,68,68,0.15)",
                    color: "#f87171",
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

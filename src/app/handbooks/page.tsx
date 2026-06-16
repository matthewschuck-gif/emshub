"use client";

import { useState } from "react";
import MountainCanvas from "@/components/MountainCanvas";

const STORAGE_KEY = "emsmountain_handbooks";

interface Handbook {
  id: string;
  track: string;
  name: string;
  role: string;
  desc: string;
  url: string;
  color: string;
}

const DEFAULTS: Handbook[] = [
  {
    id: "mlc",
    track: "All Tracks",
    name: "MLC Handbook",
    role: "Every MLC Member",
    desc: "The full Mountaineer Leadership Corps overview — five parallel tracks, shared mission, selection processes, and the Life Ready Graduate framework that connects them all.",
    url: "https://docs.google.com/document/d/1IiUT0W1rpREqMdoWrHuVbziU8R9pqXOthQo3_1lIiqk/edit",
    color: "#0891b2",
  },
  {
    id: "generals",
    track: "Track 1",
    name: "Squad Generals Handbook",
    role: "Generals & Captains",
    desc: "The operating guide for squad Generals — year-round leadership beyond Clash of Classes events, squad culture, monthly LRG trait focus, and Kick Off through closing assembly.",
    url: "#",
    color: "#ffe100",
  },
  {
    id: "ambassadors",
    track: "Track 2",
    name: "Ambassador Handbook",
    role: "Ambassadors & Pathfinders",
    desc: "Owns the new student experience from Day 1 through the first month of belonging. Ambassadors are peer-elected 8th graders; Pathfinders are staff-recommended builders from any grade.",
    url: "#",
    color: "#06b6d4",
  },
  {
    id: "delegates",
    track: "Track 3",
    name: "Delegates Handbook",
    role: "Delegates (Student Council)",
    desc: "EMS student council — renamed to reflect what the role actually does. Delegates gather student voice, facilitate lessons, connect with Generals, and drive a service project that makes a real difference.",
    url: "#",
    color: "#10b981",
  },
  {
    id: "vanguard",
    track: "Standalone",
    name: "Vanguard Handbook",
    role: "Trailback Panel Members",
    desc: "Vanguard members serve on the Trailback Panel — EMS's restorative alternative to traditional discipline. Focused on reflection, responsibility, and reconnection, not punishment.",
    url: "#",
    color: "#f59e0b",
  },
];

function loadHandbooks(): Handbook[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const saved: Handbook[] = JSON.parse(raw);
    const savedIds = new Set(saved.map((h) => h.id));
    const merged = [...saved];
    for (const d of DEFAULTS) if (!savedIds.has(d.id)) merged.push(d);
    return merged;
  } catch { return DEFAULTS; }
}

function saveHandbooks(books: Handbook[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function InlineEdit({
  value,
  onChange,
  style,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    onChange(draft.trim() || value);
  };

  if (editing) {
    const Tag = multiline ? "textarea" : "input";
    return (
      <Tag
        autoFocus
        value={draft}
        onChange={(e) => setDraft((e.target as HTMLInputElement).value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !multiline) { e.preventDefault(); commit(); }
          if (e.key === "Escape") { setEditing(false); setDraft(value); }
        }}
        placeholder={placeholder}
        style={{
          ...style,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,225,0,0.5)",
          borderRadius: 6,
          outline: "none",
          padding: "2px 6px",
          color: "inherit",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          width: "100%",
          resize: multiline ? "vertical" : undefined,
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => { setEditing(true); setDraft(value); }}
      title="Double-click to edit"
      style={{ ...style, cursor: "default", display: "block" }}
    >
      {value || <span style={{ opacity: 0.35 }}>{placeholder}</span>}
    </span>
  );
}

export default function HandbooksPage() {
  const [books, setBooks] = useState<Handbook[]>(() => typeof window !== "undefined" ? loadHandbooks() : DEFAULTS);
  const [editing, setEditing] = useState(false);

  function update(id: string, patch: Partial<Handbook>) {
    setBooks((prev) => {
      const next = prev.map((h) => h.id === id ? { ...h, ...patch } : h);
      saveHandbooks(next);
      return next;
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0014", position: "relative" }}>
      <MountainCanvas />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 860, margin: "0 auto", padding: "0 1.5rem 5rem" }}>

        {/* Back */}
        <div style={{ paddingTop: "1.75rem", marginBottom: "2rem" }}>
          <a
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em",
              color: "#9b7fc0", textDecoration: "none", textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ffe100")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9b7fc0")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            The Mountain
          </a>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", animation: "fade-in-up 0.7s ease both" }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: "0.75rem",
              background: "rgba(8,145,178,0.1)", border: "1px solid rgba(8,145,178,0.3)",
              borderRadius: 20, padding: "3px 12px 3px 8px",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#67e8f9", textTransform: "uppercase",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0891b2", boxShadow: "0 0 6px #0891b2", animation: "pulse-dot 2s ease-in-out infinite" }} />
            Mountaineer Leadership Corps
          </div>
          <h1 style={{
            fontSize: "clamp(2rem,5vw,3.25rem)", fontWeight: 900, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #f5f0ff 0%, #67e8f9 50%, #ffe100 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: "0.5rem",
          }}>
            MLC Handbooks
          </h1>
          <p style={{ color: "#9b7fc0", fontSize: "1rem", maxWidth: 520 }}>
            Five parallel tracks. One shared mission. Every role connected to the Life Ready Graduate we&apos;re building together.
          </p>

          <div style={{ marginTop: "1.25rem", display: "flex", gap: 10 }}>
            <button
              onClick={() => setEditing(e => !e)}
              style={{
                padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
                border: `1px solid ${editing ? "#ffe100" : "rgba(73,14,111,0.6)"}`,
                background: editing ? "rgba(255,225,0,0.1)" : "rgba(73,14,111,0.2)",
                color: editing ? "#ffe100" : "#9b7fc0",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", transition: "all 0.2s",
              }}
            >
              {editing ? "✓ Done" : "✎ Edit Links"}
            </button>
          </div>
          {editing && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.72rem", color: "#4b5563" }}>
              Double-click any URL field to paste the Google Doc link
            </p>
          )}
        </div>

        {/* Handbook cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "fade-in-up 0.7s ease 0.1s both" }}>
          {books.map((book) => (
            <HandbookCard key={book.id} book={book} editing={editing} onUpdate={(p) => update(book.id, p)} />
          ))}
        </div>
      </div>
    </main>
  );
}

function HandbookCard({ book, editing, onUpdate }: { book: Handbook; editing: boolean; onUpdate: (p: Partial<Handbook>) => void }) {
  const [hovered, setHovered] = useState(false);
  const isLive = book.url !== "#";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: "1.25rem", alignItems: "flex-start",
        background: hovered ? "#1a0530" : "#120020",
        border: `1px solid ${hovered ? book.color + "66" : "rgba(73,14,111,0.4)"}`,
        borderRadius: 16, padding: "1.25rem 1.5rem",
        boxShadow: hovered ? `0 0 24px ${book.color}22, 0 8px 32px rgba(0,0,0,0.4)` : "0 2px 12px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{ width: 3, flexShrink: 0, borderRadius: 3, background: book.color, alignSelf: "stretch", minHeight: 60, opacity: 0.7 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.4rem", flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            color: book.color, background: book.color + "18", border: `1px solid ${book.color}33`,
            borderRadius: 20, padding: "2px 8px",
          }}>{book.track}</span>
          <span style={{ fontSize: 10, color: "#4b5563", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {book.role}
          </span>
        </div>

        <div style={{ fontSize: "1.05rem", fontWeight: 800, color: hovered ? "#f5f0ff" : "#d8b4fe", marginBottom: "0.4rem" }}>
          {book.name}
        </div>

        <div style={{ fontSize: "0.85rem", color: "#7c6a9e", lineHeight: 1.55, marginBottom: "0.75rem" }}>
          {book.desc}
        </div>

        {/* URL field — editable when in edit mode, clickable otherwise */}
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.7rem", color: "#4b5563", flexShrink: 0 }}>URL:</span>
            <InlineEdit
              value={book.url}
              onChange={(v) => onUpdate({ url: v })}
              placeholder="Paste Google Doc URL…"
              style={{ fontSize: "0.72rem", color: book.url === "#" ? "#4b5563" : "#67e8f9" }}
            />
          </div>
        ) : (
          <a
            href={isLive ? book.url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (!isLive) e.preventDefault(); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: isLive ? book.color : "#374151",
              textDecoration: "none",
              opacity: hovered && isLive ? 1 : isLive ? 0.6 : 0.35,
              transition: "opacity 0.2s, transform 0.2s",
              transform: hovered && isLive ? "translateX(3px)" : "translateX(0)",
              cursor: isLive ? "pointer" : "default",
            }}
          >
            {isLive ? "Open Handbook" : "URL needed — click Edit Links"}
            {isLive && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </a>
        )}
      </div>
    </div>
  );
}

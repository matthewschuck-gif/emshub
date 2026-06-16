"use client";

import { useState, useRef, useEffect } from "react";

export interface Tool {
  id: string;
  name: string;
  abbr: string;
  url: string;
  desc: string;
  color: string;
  coming?: boolean;
}

function EditableField({
  value,
  onChange,
  tag = "span",
  style,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: "span" | "div";
  style?: React.CSSProperties;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);

  const start = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      ref.current?.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current!);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }, 0);
  };

  const commit = () => {
    setEditing(false);
    onChange(ref.current?.innerText?.trim() ?? value);
  };

  const Tag = tag as "span";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement>}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={start}
      onBlur={commit}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { setEditing(false); }
      }}
      style={{
        ...style,
        outline: editing ? "1px solid rgba(73,14,111,0.4)" : "none",
        borderRadius: 4,
        cursor: editing ? "text" : "default",
        transition: "outline 0.15s",
        userSelect: editing ? "text" : "none",
        WebkitUserSelect: editing ? "text" : "none",
        whiteSpace: multiline ? "pre-wrap" : "nowrap",
        overflow: "hidden",
        textOverflow: editing ? "unset" : "ellipsis",
        display: "block",
      }}
      title={editing ? "" : "Double-click to edit"}
    >
      {value}
    </Tag>
  );
}

export default function ToolCard({
  tool: initial,
  index,
  onUpdate,
}: {
  tool: Tool;
  index: number;
  onUpdate: (updated: Tool) => void;
}) {
  const [tool, setTool] = useState(initial);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { setTool(initial); }, [initial]);

  function update(patch: Partial<Tool>) {
    const next = { ...tool, ...patch };
    setTool(next);
    onUpdate(next);
  }

  const isLive = !tool.coming && tool.url !== "#";
  const isInternal = isLive && tool.url.startsWith("/");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        padding: "1.25rem",
        background: hovered ? "#f3eeff" : "#ffffff",
        border: `1px solid ${hovered ? tool.color + "44" : "rgba(73,14,111,0.12)"}`,
        boxShadow: hovered
          ? `0 4px 24px rgba(73,14,111,0.1), 0 0 0 1px ${tool.color}22`
          : "0 1px 6px rgba(73,14,111,0.07)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative",
        overflow: "hidden",
        animation: `fade-in-up 0.6s ease ${index * 55}ms both`,
      }}
    >
      {/* ambient glow */}
      <div style={{
        position: "absolute", top: -24, left: -24, width: 96, height: 96,
        borderRadius: "50%", background: tool.color + "18",
        filter: "blur(24px)", opacity: hovered ? 1 : 0.4,
        pointerEvents: "none", transition: "opacity 0.3s",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
          <EditableField
            value={tool.abbr}
            onChange={(v) => update({ abbr: v.slice(0, 4).toUpperCase() })}
            style={{
              width: 42, height: 42, lineHeight: "42px", textAlign: "center",
              borderRadius: 10, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em",
              background: `linear-gradient(135deg,${tool.color}22,${tool.color}0d)`,
              border: `1px solid ${tool.color}33`,
              color: tool.color,
              flexShrink: 0,
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: tool.coming ? "#d1d5db" : "#16a34a",
              boxShadow: tool.coming ? "none" : "0 0 6px #16a34a88",
              animation: tool.coming ? "none" : "pulse-dot 2.5s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 10, color: tool.coming ? "#9ca3af" : "#15803d", fontWeight: 700, letterSpacing: "0.06em" }}>
              {tool.coming ? "SOON" : "LIVE"}
            </span>
          </div>
        </div>

        {/* Name */}
        <EditableField
          value={tool.name}
          onChange={(v) => update({ name: v })}
          style={{ fontSize: "0.95rem", fontWeight: 700, color: hovered ? "#1a0030" : "#490e6f", marginBottom: "0.3rem" }}
        />

        {/* Desc */}
        <EditableField
          value={tool.desc}
          onChange={(v) => update({ desc: v })}
          multiline
          tag="div"
          style={{ fontSize: "0.8rem", color: "#7c5fa0", lineHeight: 1.55 }}
        />

        {/* URL editor */}
        <EditableField
          value={tool.url}
          onChange={(v) => update({ url: v })}
          style={{ fontSize: "0.72rem", color: "#b0a0c8", marginTop: "0.5rem" }}
        />

        {/* Launch */}
        {!tool.coming && (
          <a
            href={tool.url !== "#" ? tool.url : undefined}
            target={isInternal ? "_self" : "_blank"}
            rel={isInternal ? undefined : "noopener noreferrer"}
            onClick={(e) => { if (tool.url === "#") e.preventDefault(); }}
            style={{
              marginTop: "0.8rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: tool.color,
              textDecoration: "none",
              opacity: hovered ? 1 : 0.55,
              transition: "opacity 0.2s, transform 0.2s",
              transform: hovered ? "translateX(3px)" : "translateX(0)",
              textTransform: "uppercase",
            }}
          >
            Launch
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}

        {/* Color picker */}
        <div style={{ position: "absolute", bottom: "1.25rem", right: "1.25rem", opacity: hovered ? 0.7 : 0, transition: "opacity 0.2s" }}>
          <input
            type="color"
            value={tool.color}
            onChange={(e) => update({ color: e.target.value })}
            title="Card accent color"
            style={{ width: 18, height: 18, borderRadius: 4, border: "none", padding: 0, cursor: "pointer", background: "none" }}
          />
        </div>
      </div>
    </div>
  );
}

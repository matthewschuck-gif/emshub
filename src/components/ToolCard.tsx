"use client";

import { useState } from "react";

interface Tool {
  id: string;
  name: string;
  abbr: string;
  url: string;
  desc: string;
  color: string;
  coming?: boolean;
}

export default function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const [hovered, setHovered] = useState(false);

  const isLive = !tool.coming && tool.url !== "#";

  return (
    <a
      href={tool.url}
      target={isLive ? "_blank" : undefined}
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        borderRadius: "16px",
        padding: "1.25rem",
        background: hovered
          ? `linear-gradient(135deg, #100d22 0%, #160e2e 100%)`
          : "#100d22",
        border: `1px solid ${hovered ? tool.color + "66" : "rgba(147,51,234,0.15)"}`,
        boxShadow: hovered
          ? `0 0 24px ${tool.color}28, 0 8px 32px rgba(0,0,0,0.4)`
          : "0 2px 12px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: tool.coming ? "default" : "pointer",
        animationDelay: `${index * 60}ms`,
        animation: "fade-in-up 0.7s ease both",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow smear top-left */}
      <div
        style={{
          position: "absolute",
          top: -20,
          left: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: tool.color + "22",
          filter: "blur(20px)",
          transition: "opacity 0.3s",
          opacity: hovered ? 1 : 0.3,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          {/* Abbr badge */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${tool.color}33, ${tool.color}11)`,
              border: `1px solid ${tool.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: tool.color,
            }}
          >
            {tool.abbr}
          </div>

          {/* Status pip */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: tool.coming ? "#4b5563" : "#22c55e",
                boxShadow: tool.coming ? "none" : "0 0 6px #22c55e",
                animation: tool.coming ? "none" : "pulse-dot 2.5s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 10, color: tool.coming ? "#4b5563" : "#6ee7b7", fontWeight: 600, letterSpacing: "0.05em" }}>
              {tool.coming ? "SOON" : "LIVE"}
            </span>
          </div>
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: hovered ? "#f0ebff" : "#c4b5fd",
            marginBottom: "0.3rem",
            transition: "color 0.2s",
            lineHeight: 1.3,
          }}
        >
          {tool.name}
        </div>

        {/* Desc */}
        <div style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.5 }}>
          {tool.desc}
        </div>

        {/* Launch arrow */}
        {!tool.coming && (
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: tool.color,
              opacity: hovered ? 1 : 0.5,
              transition: "opacity 0.2s, transform 0.2s",
              transform: hovered ? "translateX(3px)" : "translateX(0)",
              textTransform: "uppercase",
            }}
          >
            Launch
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </a>
  );
}

"use client";

import MountainCanvas from "@/components/MountainCanvas";
import ToolCard from "@/components/ToolCard";

const TOOLS = [
  {
    id: "bic",
    name: "Behavior Intervention Center",
    abbr: "BIC",
    url: "https://behaviorinterventioncenter.com",
    desc: "Behavior tracking & intervention logging",
    color: "#9333ea",
  },
  {
    id: "trail",
    name: "Trail Journal",
    abbr: "TJ",
    url: "https://trailjournal.org",
    desc: "Student growth & reflection portal",
    color: "#a855f7",
  },
  {
    id: "coc",
    name: "Clash of Classes",
    abbr: "CoC",
    url: "https://clashofclasses.org",
    desc: "Gamified class competition & points",
    color: "#eab308",
  },
  {
    id: "report",
    name: "Report Logger",
    abbr: "RL",
    url: "https://bit.ly/reportlogger",
    desc: "Incident report generation & logging",
    color: "#7c3aed",
  },
  {
    id: "followup",
    name: "Trailback Panel",
    abbr: "TB",
    url: "#",
    desc: "Follow-up tracking & panel completion",
    color: "#c084fc",
  },
  {
    id: "comms",
    name: "EMS Comms",
    abbr: "EC",
    url: "#",
    desc: "Communication output & announcements",
    color: "#fbbf24",
  },
  {
    id: "actbus",
    name: "Activity Bus",
    abbr: "AB",
    url: "#",
    desc: "Activity bus selector & scheduling",
    color: "#d97706",
  },
  {
    id: "mtss",
    name: "MTSS",
    abbr: "MT",
    url: "#",
    desc: "Multi-Tiered System of Supports",
    color: "#6d28d9",
    coming: true,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen relative" style={{ background: "#080612" }}>
      <MountainCanvas />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6">
        {/* Hero */}
        <div className="text-center pt-20 pb-12" style={{ animation: "fade-in-up 0.9s ease both" }}>
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              background: "rgba(234,179,8,0.1)",
              border: "1px solid rgba(234,179,8,0.3)",
              color: "#fbbf24",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#eab308",
                boxShadow: "0 0 6px #eab308",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            East Mifflin School District
          </div>

          <h1
            className="text-6xl font-black tracking-tight mb-3"
            style={{
              background: "linear-gradient(135deg, #f0ebff 0%, #c084fc 40%, #eab308 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(168,85,247,0.4))",
            }}
          >
            The Mountain
          </h1>
          <p className="text-lg" style={{ color: "#8b7fb5" }}>
            Every path leads here. Every tool fires from the summit.
          </p>
        </div>

        {/* Tool Grid */}
        <div
          className="grid gap-4 w-full max-w-5xl pb-20"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            animation: "fade-in-up 0.9s ease 0.2s both",
          }}
        >
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

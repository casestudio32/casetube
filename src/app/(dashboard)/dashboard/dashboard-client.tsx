"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CreatorProfile, CreatorBlueprint, Project } from "@prisma/client";

interface Props {
  userName: string;
  profile: (CreatorProfile & { blueprint: CreatorBlueprint | null }) | null;
  blueprint: CreatorBlueprint | null;
  recentProjects: Project[];
}

const QUICK_ACTIONS = [
  {
    href: "/seo",
    icon: "🔍",
    label: "Research Keywords",
    desc: "Find high-opportunity topics for your niche",
    color: "from-blue-600/20 to-blue-900/10 border-blue-500/20 hover:border-blue-500/40",
  },
  {
    href: "/studio",
    icon: "✍️",
    label: "Generate Content",
    desc: "Write scripts, hooks, titles, and descriptions",
    color: "from-purple-600/20 to-purple-900/10 border-purple-500/20 hover:border-purple-500/40",
  },
  {
    href: "/projects",
    icon: "📋",
    label: "New Project",
    desc: "Start planning your next video",
    color: "from-green-600/20 to-green-900/10 border-green-500/20 hover:border-green-500/40",
  },
  {
    href: "/blueprint",
    icon: "🗺️",
    label: "View Blueprint",
    desc: "Review your YouTube growth strategy",
    color: "from-red-600/20 to-red-900/10 border-red-500/20 hover:border-red-500/40",
  },
];

const STAGE_COLORS: Record<string, string> = {
  RESEARCH: "bg-blue-500/20 text-blue-400",
  PLANNING: "bg-yellow-500/20 text-yellow-400",
  WRITING: "bg-purple-500/20 text-purple-400",
  THUMBNAIL: "bg-pink-500/20 text-pink-400",
  EDITING: "bg-orange-500/20 text-orange-400",
  PUBLISHING: "bg-green-500/20 text-green-400",
  ANALYSIS: "bg-zinc-500/20 text-zinc-400",
};

export function DashboardClient({ userName, profile, blueprint, recentProjects }: Props) {
  const firstName = userName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-zinc-400 mt-1">
          {blueprint
            ? `Your niche: ${blueprint.niche.slice(0, 80)}...`
            : "Complete your onboarding to get your Creator Blueprint."}
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Projects", value: recentProjects.length, icon: "📋" },
          { label: "Blueprint", value: blueprint ? "Ready" : "Pending", icon: "🗺️" },
          { label: "Content Pillars", value: blueprint?.contentPillars.length ?? 0, icon: "🏛️" },
          { label: "AI Tools", value: "10+", icon: "🤖" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4"
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-zinc-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`bg-gradient-to-br ${action.color} border rounded-2xl p-5 transition-all hover:scale-[1.02] group`}
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <div className="text-white font-semibold text-sm mb-1">{action.label}</div>
              <div className="text-zinc-400 text-xs leading-relaxed">{action.desc}</div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Blueprint summary */}
      {blueprint && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Blueprint Summary</h2>
            <Link href="/blueprint" className="text-red-400 text-xs hover:text-red-300">
              View full blueprint →
            </Link>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wide">Your Niche</p>
                <p className="text-white text-sm leading-relaxed">{blueprint.niche.slice(0, 120)}...</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wide">Content Pillars</p>
                <ul className="space-y-1">
                  {blueprint.contentPillars.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-zinc-300 text-xs flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">▸</span>
                      {p.slice(0, 50)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wide">Posting Schedule</p>
                <p className="text-white text-sm leading-relaxed">{blueprint.postingSchedule.slice(0, 100)}...</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent projects */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Projects</h2>
          <Link href="/projects" className="text-red-400 text-xs hover:text-red-300">
            View all →
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 border-dashed rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">🎬</div>
            <h3 className="text-white font-semibold mb-1">No projects yet</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Each video you plan becomes a project. Start your first one.
            </p>
            <Link href="/projects" className="btn-primary text-sm">
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 rounded-xl px-5 py-4 transition-all group"
              >
                <div>
                  <div className="text-white font-medium text-sm group-hover:text-red-400 transition-colors">
                    {project.title}
                  </div>
                  {project.videoTopic && (
                    <div className="text-zinc-500 text-xs mt-0.5">{project.videoTopic}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${STAGE_COLORS[project.stage]}`}>
                    {project.stage.charAt(0) + project.stage.slice(1).toLowerCase()}
                  </span>
                  <span className="text-zinc-600 text-xs">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

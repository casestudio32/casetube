"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STAGES = ["RESEARCH", "PLANNING", "WRITING", "THUMBNAIL", "EDITING", "PUBLISHING", "ANALYSIS"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_COLORS: Record<Stage, string> = {
  RESEARCH: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PLANNING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  WRITING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  THUMBNAIL: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  EDITING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  PUBLISHING: "bg-green-500/20 text-green-400 border-green-500/30",
  ANALYSIS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const STAGE_ICONS: Record<Stage, string> = {
  RESEARCH: "🔍",
  PLANNING: "📋",
  WRITING: "✍️",
  THUMBNAIL: "🖼️",
  EDITING: "✂️",
  PUBLISHING: "🚀",
  ANALYSIS: "📊",
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  stage: Stage;
  status: string;
  videoTopic: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { sections: number };
};

export function ProjectsClient({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", videoTopic: "" });
  const [activeFilter, setActiveFilter] = useState<Stage | "ALL">("ALL");

  const fetchProjects = async () => {
    const res = await fetch(`/api/projects/list?userId=${userId}`);
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userId }),
    });
    const data = await res.json();
    if (data.project) {
      setProjects(prev => [{ ...data.project, _count: { sections: 0 } }, ...prev]);
      setForm({ title: "", description: "", videoTopic: "" });
      setShowCreate(false);
    }
    setCreating(false);
  };

  const filtered = activeFilter === "ALL" ? projects : projects.filter(p => p.stage === activeFilter);

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = projects.filter(p => p.stage === s).length;
    return acc;
  }, {} as Record<Stage, number>);

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">Each video gets its own workspace</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> New Project
        </button>
      </div>

      {/* Stage filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            activeFilter === "ALL"
              ? "bg-indigo-600 text-white border-indigo-500"
              : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
          }`}
        >
          All ({projects.length})
        </button>
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => setActiveFilter(stage)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeFilter === stage
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
            }`}
          >
            {STAGE_ICONS[stage]} {stage.charAt(0) + stage.slice(1).toLowerCase()} ({stageCounts[stage]})
          </button>
        ))}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-semibold text-white mb-4">New Video Project</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Video Title *</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g. How to Start a YouTube Channel in 2025"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Topic / Angle</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g. beginner guide for people with no gear"
                    value={form.videoTopic}
                    onChange={e => setForm(f => ({ ...f, videoTopic: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Notes (optional)</label>
                  <textarea
                    className="input-field w-full resize-none"
                    rows={3}
                    placeholder="Any extra context, deadlines, ideas..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={createProject} disabled={creating || !form.title.trim()} className="btn-primary flex-1 disabled:opacity-50">
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 animate-pulse h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            {activeFilter === "ALL" ? "No projects yet" : `No projects in ${activeFilter}`}
          </h3>
          <p className="text-gray-500 text-sm mb-6">Every video starts as a project. Create one to begin.</p>
          {activeFilter === "ALL" && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              + Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/projects/${project.id}`} className="block group">
                <div className="bg-gray-900/60 border border-white/8 rounded-2xl p-5 hover:border-indigo-500/40 hover:bg-gray-900/80 transition-all duration-200 h-full">
                  {/* Stage badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STAGE_COLORS[project.stage]}`}>
                      {STAGE_ICONS[project.stage]} {project.stage.charAt(0) + project.stage.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-600">{project._count.sections} sections</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {project.title}
                  </h3>

                  {project.videoTopic && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-1">{project.videoTopic}</p>
                  )}

                  {/* Stage progress bar */}
                  <div className="mt-4">
                    <div className="flex gap-0.5">
                      {STAGES.map((s, i) => {
                        const stageIdx = STAGES.indexOf(project.stage);
                        return (
                          <div
                            key={s}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i <= stageIdx ? "bg-indigo-500" : "bg-white/10"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5">
                      Stage {STAGES.indexOf(project.stage) + 1} of {STAGES.length}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

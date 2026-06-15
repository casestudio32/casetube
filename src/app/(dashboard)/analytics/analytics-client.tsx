"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const STAGES = ["RESEARCH", "PLANNING", "WRITING", "THUMBNAIL", "EDITING", "PUBLISHING", "ANALYSIS"];
const STAGE_ICONS: Record<string, ReactNode> = {
  RESEARCH: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  PLANNING: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  WRITING: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  THUMBNAIL: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  EDITING: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><polyline points="8 6 6 6 6 8"/><polyline points="16 18 18 18 18 16"/></svg>,
  PUBLISHING: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  ANALYSIS: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};
const STAGE_COLORS: Record<string, string> = {
  RESEARCH: "bg-blue-500", PLANNING: "bg-purple-500", WRITING: "bg-yellow-500",
  THUMBNAIL: "bg-pink-500", EDITING: "bg-orange-500", PUBLISHING: "bg-green-500", ANALYSIS: "bg-cyan-500",
};

const SECTION_LABELS: Record<string, string> = {
  IDEAS: "Ideas", HOOK: "Hooks", TITLE: "Titles", SEO_PACKAGE: "SEO",
  SCRIPT: "Scripts", DESCRIPTION: "Descriptions", THUMBNAIL: "Thumbnails",
  SHORTS: "Shorts", COMMUNITY_POST: "Community",
};

type Stats = {
  totalProjects: number;
  totalSections: number;
  published: number;
  regens: number;
  avgSectionsPerProject: number;
  niche: string | null;
};

type RecentProject = {
  id: string;
  title: string;
  stage: string;
  sections: number;
  createdAt: string;
};

type AnalyticsData = {
  stats: Stats;
  stageCount: Record<string, number>;
  sectionTypeCount: Record<string, number>;
  projectsOverTime: { label: string; count: number }[];
  recentProjects: RecentProject[];
};

function StatCard({ label, value, sub, icon, delay = 0 }: { label: string; value: string | number; sub?: string; icon: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-gray-900/60 border border-white/8 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400">{icon}</span>
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}

const AnaIcons = {
  projects: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  sections: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  publish: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  regens: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
};

export function AnalyticsClient({ userId }: { userId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/summary?userId=${userId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, stageCount, sectionTypeCount, projectsOverTime, recentProjects } = data;

  // Bar chart max
  const maxWeekCount = Math.max(...projectsOverTime.map(w => w.count), 1);
  const maxStageCount = Math.max(...Object.values(stageCount), 1);
  const maxSectionCount = Math.max(...Object.values(sectionTypeCount), 1);

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">
          {stats.niche ? `Your ${stats.niche} channel overview` : "Your creator activity overview"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={AnaIcons.projects} label="Total Projects" value={stats.totalProjects} delay={0} />
        <StatCard icon={AnaIcons.sections} label="AI Sections Generated" value={stats.totalSections} sub="across all projects" delay={0.08} />
        <StatCard icon={AnaIcons.publish} label="Ready to Publish" value={stats.published} sub="in Publishing or Analysis" delay={0.16} />
        <StatCard icon={AnaIcons.regens} label="Regenerations" value={stats.regens} sub="times you refined AI output" delay={0.24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Projects over time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/60 border border-white/8 rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold mb-5">Projects Created (last 8 weeks)</h2>
          <div className="flex items-end gap-1.5 h-32">
            {projectsOverTime.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(week.count / maxWeekCount) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                    className="w-full rounded-t-md bg-indigo-600 min-h-[3px]"
                  />
                </div>
                <span className="text-xs text-gray-600 -rotate-45 origin-left whitespace-nowrap" style={{ fontSize: "9px" }}>
                  {week.label}
                </span>
              </div>
            ))}
          </div>
          {stats.totalProjects === 0 && (
            <p className="text-center text-gray-600 text-xs mt-4">Create your first project to see activity here</p>
          )}
        </motion.div>

        {/* Stage distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gray-900/60 border border-white/8 rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold mb-5">Projects by Stage</h2>
          <div className="space-y-3">
            {STAGES.map(stage => {
              const count = stageCount[stage] || 0;
              const pct = maxStageCount > 0 ? (count / maxStageCount) * 100 : 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-sm w-4">{STAGE_ICONS[stage]}</span>
                  <span className="text-xs text-gray-400 w-20 shrink-0">{stage.charAt(0) + stage.slice(1).toLowerCase()}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className={`h-full rounded-full ${STAGE_COLORS[stage]}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section types generated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/60 border border-white/8 rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold mb-5">Most Generated Content</h2>
          {Object.keys(sectionTypeCount).length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Generate content in a project to see this</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(sectionTypeCount)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const pct = (count / maxSectionCount) * 100;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24 shrink-0">{SECTION_LABELS[type] || type}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          className="h-full rounded-full bg-indigo-500"
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </motion.div>

        {/* Recent projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gray-900/60 border border-white/8 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Recent Projects</h2>
            <Link href="/projects" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm mb-3">No projects yet</p>
              <Link href="/projects" className="btn-primary text-sm">Create your first project</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate group-hover:text-indigo-300 transition-colors">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.sections} sections generated</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-gray-500">{STAGE_ICONS[p.stage]}</span>
                    <span className="text-xs text-gray-600">{p.stage.charAt(0) + p.stage.slice(1).toLowerCase()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Productivity score */}
      {stats.totalProjects > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">Creator Productivity Score</h2>
              <p className="text-gray-400 text-sm">Based on your projects, sections generated, and workflow progress</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-white">
                {Math.min(100, Math.round(
                  (stats.totalProjects * 10) +
                  (stats.totalSections * 3) +
                  (stats.published * 15) +
                  (stats.avgSectionsPerProject * 5)
                ))}
                <span className="text-lg text-gray-400">/100</span>
              </p>
              <p className="text-indigo-400 text-sm mt-1">
                {stats.totalProjects === 0 ? "Just getting started" :
                  stats.totalSections < 5 ? "Building momentum" :
                  stats.totalSections < 20 ? "Getting consistent" :
                  stats.published > 0 ? "Shipping content" : "Power creator"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

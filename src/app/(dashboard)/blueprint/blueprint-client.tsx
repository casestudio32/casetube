"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Blueprint = {
  id: string;
  profileId: string;
  niche: string;
  targetAudience: string;
  contentPillars: string[];
  brandVoice: string;
  videoFormats: string[];
  postingSchedule: string;
  growthRoadmap: string;
  monetization: string;
  weaknesses: string;
  advantages: string;
  rawJson: unknown;
  createdAt: Date;
  updatedAt: Date;
};

interface RoadmapPhase {
  number: number;
  label: string;
  days: string;
  tasks: string[];
}

interface Props {
  userId: string;
  userName: string;
  existingBlueprint: Blueprint | null;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_ALIASES: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
  fri: "Fri", sat: "Sat", sun: "Sun",
};

function parseRoadmap(text: string): RoadmapPhase[] {
  if (!text) return [];
  const phases: RoadmapPhase[] = [];
  // Split on "Phase N" boundaries
  const phaseBlocks = text.split(/(?=Phase\s+\d)/i).filter(Boolean);
  for (const block of phaseBlocks) {
    const headerMatch = block.match(/Phase\s+(\d+)[^(]*\(([^)]+)\)/i);
    if (!headerMatch) continue;
    const number = parseInt(headerMatch[1]);
    const days = headerMatch[2];
    const label = `Phase ${number}`;
    // Everything after the header is tasks/content
    const body = block.slice(headerMatch[0].length).trim();
    // Split on bullets, numbered items, dashes, or newlines
    const rawTasks = body
      .split(/\n|•|–|-|\d+\.\s/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    phases.push({ number, label, days, tasks: rawTasks.slice(0, 6) });
  }
  return phases;
}

function parseScheduleDays(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [alias, canonical] of Object.entries(DAY_ALIASES)) {
    if (lower.includes(alias) && !found.includes(canonical)) {
      found.push(canonical);
    }
  }
  return found;
}

function parseScheduleTime(text: string): string {
  const match = text.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/i);
  return match ? match[0] : "";
}

function getStorageKey(userId: string, phase: number) {
  return `bp_tasks_${userId}_phase${phase}`;
}

function loadTasksDone(userId: string, phase: number, total: number): boolean[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId, phase));
    if (!raw) return Array(total).fill(false);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === total) return parsed;
    return Array(total).fill(false);
  } catch {
    return Array(total).fill(false);
  }
}

function saveTasksDone(userId: string, phase: number, done: boolean[]) {
  try {
    localStorage.setItem(getStorageKey(userId, phase), JSON.stringify(done));
  } catch { /* ignore */ }
}

function getBlueprintStartDate(userId: string): Date {
  const key = `bp_start_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) return new Date(stored);
  const now = new Date();
  localStorage.setItem(key, now.toISOString());
  return now;
}

const BpIcons: Record<string, ReactNode> = {
  niche: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  audience: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  pillars: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="4"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  voice: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  formats: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  schedule: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  roadmap: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  monetize: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  weakness: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  advantage: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

export function BlueprintClient({ userId, userName, existingBlueprint }: Props) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(existingBlueprint);
  const [loading, setLoading] = useState(!existingBlueprint);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!existingBlueprint) {
      generateBlueprint();
    }
  }, []);

  async function generateBlueprint() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blueprint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBlueprint(data.blueprint);
    } catch (e) {
      setError("Failed to generate blueprint. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState userName={userName} />;
  if (error) return <ErrorState error={error} onRetry={generateBlueprint} />;
  if (!blueprint) return null;

  const phases = parseRoadmap(blueprint.growthRoadmap);
  const scheduleDays = parseScheduleDays(blueprint.postingSchedule);
  const scheduleTime = parseScheduleTime(blueprint.postingSchedule);

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          Case<span className="text-red-500">Tube</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Go to Dashboard →
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            ✦ Your Creator Blueprint
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {userName.split(" ")[0]}&apos;s YouTube Strategy
          </h1>
          <p className="text-zinc-400">
            AI-generated based on your profile. This is your personal roadmap to YouTube success.
          </p>
        </motion.div>

        {/* Progress Nudge */}
        {phases.length > 0 && (
          <ProgressNudge userId={userId} phases={phases} />
        )}

        <div className="space-y-6">
          <BlueprintCard index={0} icon={BpIcons.niche} title="Your Niche" content={blueprint.niche} />
          <BlueprintCard index={1} icon={BpIcons.audience} title="Target Audience" content={blueprint.targetAudience} />
          <BlueprintCard index={2} icon={BpIcons.pillars} title="Content Pillars" content={blueprint.contentPillars} isList />
          <BlueprintCard index={3} icon={BpIcons.voice} title="Brand Voice" content={blueprint.brandVoice} />
          <BlueprintCard index={4} icon={BpIcons.formats} title="Video Formats" content={blueprint.videoFormats} isList />

          {/* Posting Schedule Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5 * 0.07 }}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-zinc-400">{BpIcons.schedule}</span>
              <h3 className="text-white font-semibold text-lg">Posting Schedule</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">{blueprint.postingSchedule}</p>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = scheduleDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`rounded-xl py-3 flex flex-col items-center gap-1 transition-all ${
                      active
                        ? "bg-red-500/15 border border-red-500/30"
                        : "bg-zinc-800/40 border border-zinc-700/30"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${active ? "text-red-400" : "text-zinc-500"}`}>
                      {day}
                    </span>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
            {scheduleTime && (
              <p className="text-zinc-500 text-xs mt-3">
                Recommended upload time: <span className="text-zinc-300">{scheduleTime}</span>
              </p>
            )}
          </motion.div>

          {/* Roadmap Phase Cards */}
          {phases.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 6 * 0.07 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-zinc-400">{BpIcons.roadmap}</span>
                <h3 className="text-white font-semibold text-lg">90-Day Growth Roadmap</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {phases.map((phase) => (
                  <PhaseCard key={phase.number} phase={phase} userId={userId} niche={blueprint.niche} />
                ))}
              </div>
            </motion.div>
          ) : (
            <BlueprintCard index={6} icon={BpIcons.roadmap} title="90-Day Growth Roadmap" content={blueprint.growthRoadmap} large />
          )}

          <BlueprintCard index={7} icon={BpIcons.monetize} title="Monetization Strategy" content={blueprint.monetization} large />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlueprintCard index={8} icon={BpIcons.weakness} title="Potential Weaknesses" content={blueprint.weaknesses} />
            <BlueprintCard index={9} icon={BpIcons.advantage} title="Your Advantages" content={blueprint.advantages} />
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-2">Ready to start creating?</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Your blueprint is saved. Head to the dashboard to start researching keywords, generating scripts, and building your channel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard →
            </Link>
            <button onClick={generateBlueprint} className="btn-secondary text-sm">
              Regenerate Blueprint
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PhaseCard({ phase, userId, niche }: { phase: RoadmapPhase; userId: string; niche: string }) {
  const [tasksDone, setTasksDone] = useState<boolean[]>([]);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTasksDone(loadTasksDone(userId, phase.number, phase.tasks.length));
  }, [userId, phase.number, phase.tasks.length]);

  const toggleTask = useCallback((i: number) => {
    setTasksDone((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      saveTasksDone(userId, phase.number, next);
      return next;
    });
  }, [userId, phase.number]);

  const completed = tasksDone.filter(Boolean).length;
  const total = phase.tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const phaseColors: Record<number, { bg: string; border: string; text: string; bar: string }> = {
    1: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", bar: "bg-blue-500" },
    2: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", bar: "bg-purple-500" },
    3: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", bar: "bg-red-500" },
  };
  const colors = phaseColors[phase.number] || phaseColors[1];

  async function handleStart() {
    setCreating(true);
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: `${niche} — ${phase.label}`,
          description: `Project created from Blueprint ${phase.label} (${phase.days})`,
          videoTopic: niche,
        }),
      });
      if (res.ok) {
        setCreated(true);
        setTimeout(() => router.push("/projects"), 800);
      }
    } catch { /* ignore */ }
    finally { setCreating(false); }
  }

  return (
    <div className={`rounded-xl border ${colors.border} p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{phase.label}</span>
        <span className="text-xs text-zinc-500">{phase.days}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-500">{completed}/{total} tasks</span>
          <span className={`text-xs font-semibold ${colors.text}`}>{progress}%</span>
        </div>
        <div className="h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task checklist */}
      <ul className="space-y-2 flex-1">
        {phase.tasks.map((task, i) => (
          <li key={i} className="flex items-start gap-2 cursor-pointer group" onClick={() => toggleTask(i)}>
            <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center ${
              tasksDone[i]
                ? `${colors.bg} ${colors.border}`
                : "border-zinc-600 bg-transparent"
            }`}>
              {tasksDone[i] && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={colors.text} />
                </svg>
              )}
            </span>
            <span className={`text-xs leading-relaxed transition-colors ${tasksDone[i] ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-white"}`}>
              {task}
            </span>
          </li>
        ))}
      </ul>

      {/* Start Phase button */}
      <button
        onClick={handleStart}
        disabled={creating || created}
        className={`w-full text-xs font-semibold py-2 rounded-lg transition-all border ${
          created
            ? "bg-green-500/10 border-green-500/30 text-green-400 cursor-default"
            : `${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`
        }`}
      >
        {created ? "✓ Project Created" : creating ? "Creating..." : `Start ${phase.label} →`}
      </button>
    </div>
  );
}

function ProgressNudge({ userId, phases }: { userId: string; phases: RoadmapPhase[] }) {
  const [mounted, setMounted] = useState(false);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    setMounted(true);
    const start = getBlueprintStartDate(userId);
    const elapsed = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
    setDaysElapsed(elapsed);

    let done = 0;
    let total = 0;
    for (const phase of phases) {
      const saved = loadTasksDone(userId, phase.number, phase.tasks.length);
      done += saved.filter(Boolean).length;
      total += phase.tasks.length;
    }
    setTotalDone(done);
    setTotalTasks(total);
  }, [userId, phases]);

  if (!mounted) return null;

  const currentPhase = daysElapsed < 30 ? 1 : daysElapsed < 60 ? 2 : 3;
  const expectedDone = Math.min(totalTasks, Math.round((daysElapsed / 90) * totalTasks));
  const isBehind = totalDone < expectedDone && daysElapsed > 3;
  const isAhead = totalDone >= totalTasks && totalTasks > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 rounded-xl border px-5 py-4 flex items-center justify-between gap-4 flex-wrap ${
          isAhead
            ? "bg-green-500/10 border-green-500/20"
            : isBehind
            ? "bg-amber-500/10 border-amber-500/20"
            : "bg-zinc-800/60 border-zinc-700/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            isAhead ? "bg-green-500/20 text-green-400" : isBehind ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700 text-zinc-300"
          }`}>
            {isAhead ? "✓" : isBehind ? "!" : "→"}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              {isAhead
                ? "All tasks complete — great work!"
                : `Phase ${currentPhase} · Day ${daysElapsed} of 90`}
            </p>
            <p className={`text-xs ${isBehind ? "text-amber-400" : "text-zinc-400"}`}>
              {isAhead
                ? "Your blueprint goals are all checked off."
                : isBehind
                ? `You're behind — ${expectedDone - totalDone} tasks to catch up on.`
                : `${totalDone}/${totalTasks} tasks completed`}
            </p>
          </div>
        </div>
        {isBehind && (
          <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg font-medium">
            Catch up now ↓
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function BlueprintCard({
  icon, title, content, isList, large, index,
}: {
  icon: ReactNode;
  title: string;
  content: string | string[];
  isList?: boolean;
  large?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-zinc-400">{icon}</span>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
      {isList && Array.isArray(content) ? (
        <ul className="space-y-2">
          {content.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-zinc-300 text-sm">
              <span className="text-red-400 mt-1 flex-shrink-0">▸</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className={`text-zinc-300 text-sm leading-relaxed ${large ? "whitespace-pre-line" : ""}`}>
          {Array.isArray(content) ? content.join("\n") : content}
        </p>
      )}
    </motion.div>
  );
}

function LoadingState({ userName }: { userName: string }) {
  const steps = [
    "Analyzing your profile...",
    "Researching your niche...",
    "Building your content strategy...",
    "Crafting your growth roadmap...",
    "Finalizing your blueprint...",
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 border-4 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-8" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Building {userName.split(" ")[0]}&apos;s Blueprint
        </h2>
        <p className="text-zinc-400 text-sm mb-8">
          Our AI is analyzing your profile and crafting a personalized YouTube strategy. This takes about 15–20 seconds.
        </p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i < currentStep
                  ? "text-green-400"
                  : i === currentStep
                  ? "text-white"
                  : "text-zinc-700"
              }`}
            >
              <span className="flex-shrink-0">
                {i < currentStep ? "✓" : i === currentStep ? "›" : "○"}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <button onClick={onRetry} className="btn-primary">Try Again</button>
      </div>
    </div>
  );
}

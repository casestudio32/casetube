"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STAGES = ["RESEARCH", "PLANNING", "WRITING", "THUMBNAIL", "EDITING", "PUBLISHING", "ANALYSIS"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_ICONS: Record<Stage, string> = {
  RESEARCH: "🔍",
  PLANNING: "📋",
  WRITING: "✍️",
  THUMBNAIL: "🖼️",
  EDITING: "✂️",
  PUBLISHING: "🚀",
  ANALYSIS: "📊",
};

const SECTION_TYPES = [
  { type: "IDEAS", label: "Video Ideas", icon: "💡", stage: "RESEARCH" },
  { type: "HOOK", label: "Hooks", icon: "🎣", stage: "RESEARCH" },
  { type: "TITLE", label: "Title & SEO", icon: "🏷️", stage: "PLANNING" },
  { type: "SEO_PACKAGE", label: "SEO Package", icon: "🔎", stage: "PLANNING" },
  { type: "SCRIPT", label: "Full Script", icon: "📝", stage: "WRITING" },
  { type: "DESCRIPTION", label: "Description", icon: "📄", stage: "WRITING" },
  { type: "THUMBNAIL", label: "Thumbnail Concepts", icon: "🖼️", stage: "THUMBNAIL" },
  { type: "SHORTS", label: "Shorts Ideas", icon: "⚡", stage: "PUBLISHING" },
  { type: "COMMUNITY_POST", label: "Community Post", icon: "📢", stage: "PUBLISHING" },
] as const;

type SectionType = (typeof SECTION_TYPES)[number]["type"];

type Section = {
  id: string;
  type: SectionType;
  content: Record<string, unknown>;
  version: number;
  updatedAt: string;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  stage: Stage;
  videoTopic: string | null;
  status: string;
  sections: Section[];
};

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

function CopyBtn({ text, label = "Copy", id }: { text: string; label?: string; id: string }) {
  const { copied, copy } = useCopy();
  return (
    <button onClick={() => copy(text, id)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10">
      {copied === id ? "✓ Copied!" : label}
    </button>
  );
}

function SectionContent({ section }: { section: Section }) {
  const c = section.content as Record<string, unknown>;
  const type = section.type;

  if (type === "IDEAS") {
    const ideas = (c.ideas as { title: string; angle: string; targetAudience: string; estimatedViews: string }[]) || [];
    return (
      <div className="space-y-3">
        {ideas.map((idea, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-white text-sm font-medium">{idea.title}</h4>
              <CopyBtn text={idea.title} id={`idea-${i}`} />
            </div>
            <p className="text-gray-400 text-xs mb-1">{idea.angle}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-500">Audience: {idea.targetAudience}</span>
              <span className="text-xs text-indigo-400">Est. {idea.estimatedViews}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "HOOK") {
    const hooks = (c.hooks as { hook: string; type: string; psychology: string; bestFor: string }[]) || [];
    return (
      <div className="space-y-3">
        {hooks.map((h, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{h.type}</span>
              <CopyBtn text={h.hook} id={`hook-${i}`} />
            </div>
            <p className="text-white text-sm mb-2 leading-relaxed">"{h.hook}"</p>
            <p className="text-gray-500 text-xs">{h.psychology}</p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "TITLE") {
    const titles = (c.titles as { title: string; type: string; charCount: number; score: number }[]) || [];
    const keywords = (c.keywords as string[]) || [];
    return (
      <div className="space-y-3">
        {titles.map((t, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm leading-snug">{t.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{t.charCount || t.title.length} chars</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-indigo-400">{t.type}</span>
                {t.score > 0 && <span className="text-xs text-green-400">Score: {t.score}/100</span>}
              </div>
            </div>
            <CopyBtn text={t.title} id={`title-${i}`} />
          </div>
        ))}
        {keywords.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3 mt-2">
            <p className="text-xs text-gray-400 mb-2">Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">{k}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "SCRIPT") {
    const script = c.script as {
      hook: string;
      intro: string;
      sections: { title: string; timestamp: string; script: string; patternInterrupt: string }[];
      cta: string;
      outro: string;
      chapters: string[];
      totalWordCount: number;
      speakingNotes: string;
    };
    if (!script) return null;
    const parts = [
      { label: "Hook", content: script.hook },
      { label: "Intro", content: script.intro },
      ...(script.sections || []).map(s => ({ label: s.title, content: s.script, timestamp: s.timestamp })),
      { label: "CTA", content: script.cta },
      { label: "Outro", content: script.outro },
    ];
    return (
      <div className="space-y-3">
        {script.chapters && script.chapters.length > 0 && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
            <p className="text-xs text-indigo-400 font-medium mb-2">Chapters</p>
            <div className="space-y-0.5">
              {script.chapters.map((ch, i) => (
                <p key={i} className="text-xs text-gray-300">{ch}</p>
              ))}
            </div>
          </div>
        )}
        {parts.map((part, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                {part.label} {(part as { timestamp?: string }).timestamp ? `— ${(part as { timestamp?: string }).timestamp}` : ""}
              </span>
              <CopyBtn text={part.content} id={`script-${i}`} />
            </div>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{part.content}</p>
          </div>
        ))}
        {script.speakingNotes && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <p className="text-xs text-yellow-400 font-medium mb-1">Speaking Notes</p>
            <p className="text-gray-300 text-sm">{script.speakingNotes}</p>
          </div>
        )}
      </div>
    );
  }

  if (type === "DESCRIPTION") {
    const desc = c.description as { full: string; short: string; timestamps: string[]; hashtags: string[]; cta: string };
    const tags = (c.tags as string[]) || [];
    if (!desc) return null;
    return (
      <div className="space-y-3">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Full Description</span>
            <CopyBtn text={desc.full} id="desc-full" />
          </div>
          <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{desc.full}</p>
        </div>
        {desc.timestamps && desc.timestamps.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Timestamps</p>
            {desc.timestamps.map((t, i) => (
              <p key={i} className="text-gray-300 text-xs font-mono">{t}</p>
            ))}
          </div>
        )}
        {tags.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Tags</p>
              <CopyBtn text={tags.join(", ")} id="tags" label="Copy all" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "THUMBNAIL") {
    const concepts = (c.concepts as { concept: string; textOverlay: string; visualElements: string; colorScheme: string; emotion: string }[]) || [];
    return (
      <div className="space-y-3">
        {concepts.map((con, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">{i + 1}</span>
              <span className="text-white text-sm font-medium">{con.concept}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Text Overlay</p>
                <p className="text-gray-300">{con.textOverlay}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Color Scheme</p>
                <p className="text-gray-300">{con.colorScheme}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Emotion</p>
                <p className="text-gray-300">{con.emotion}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Visual Elements</p>
                <p className="text-gray-300 line-clamp-2">{con.visualElements}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "SHORTS") {
    const shorts = (c.shorts as { title: string; concept: string; hook: string; script: string }[]) || [];
    return (
      <div className="space-y-3">
        {shorts.map((s, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-white text-sm font-medium">{s.title}</h4>
              <CopyBtn text={`${s.hook}\n\n${s.script}`} id={`short-${i}`} />
            </div>
            <p className="text-gray-400 text-xs mb-3">{s.concept}</p>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-indigo-400 mb-1">Hook</p>
              <p className="text-gray-300 text-xs">{s.hook}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "COMMUNITY_POST") {
    const post = c.communityPost as string;
    const poll = c.pollOptions as string[];
    return (
      <div className="space-y-3">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Community Post</span>
            <CopyBtn text={post} id="community" />
          </div>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{post}</p>
        </div>
        {poll && poll.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Poll Options</p>
            {poll.map((opt, i) => (
              <div key={i} className="text-sm text-gray-300 py-1 px-2 rounded bg-white/5 mb-1">{opt}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === "SEO_PACKAGE") {
    const pkg = c as { primaryKeyword: string; secondaryKeywords: string[]; tags: string[]; searchIntent: string; seoScore: number; suggestions: string[] };
    return (
      <div className="space-y-3">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-xs text-indigo-400 mb-1">Primary Keyword</p>
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">{pkg.primaryKeyword}</p>
            <CopyBtn text={pkg.primaryKeyword} id="primary-kw" />
          </div>
        </div>
        {pkg.secondaryKeywords?.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Secondary Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {pkg.secondaryKeywords.map((k, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">{k}</span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Search Intent</p>
            <p className="text-gray-200 text-sm">{pkg.searchIntent}</p>
          </div>
          {pkg.seoScore > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">SEO Score</p>
              <p className="text-green-400 text-xl font-bold">{pkg.seoScore}<span className="text-xs text-gray-500">/100</span></p>
            </div>
          )}
        </div>
        {pkg.suggestions?.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Optimization Tips</p>
            <ul className="space-y-1">
              {pkg.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400">→</span>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return <pre className="text-xs text-gray-400 bg-white/5 rounded-xl p-3 overflow-auto">{JSON.stringify(c, null, 2)}</pre>;
}

export function ProjectClient({ projectId, userId }: { projectId: string; userId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);
  const [updatingStage, setUpdatingStage] = useState(false);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    setProject(data.project);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const generate = async (type: SectionType) => {
    setGenerating(type);
    const res = await fetch(`/api/projects/${projectId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, userId }),
    });
    const data = await res.json();
    if (data.section) {
      setProject(prev => {
        if (!prev) return prev;
        const existing = prev.sections.find(s => s.type === type);
        const sections = existing
          ? prev.sections.map(s => s.type === type ? data.section : s)
          : [...prev.sections, data.section];
        return { ...prev, sections };
      });
      setActiveSection(type);
    }
    setGenerating(null);
  };

  const advanceStage = async () => {
    if (!project) return;
    const idx = STAGES.indexOf(project.stage);
    if (idx >= STAGES.length - 1) return;
    const nextStage = STAGES[idx + 1];
    setUpdatingStage(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    setProject(prev => prev ? { ...prev, stage: nextStage } : prev);
    setUpdatingStage(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Project not found.</p>
          <Link href="/projects" className="btn-secondary">Back to Projects</Link>
        </div>
      </div>
    );
  }

  const stageIdx = STAGES.indexOf(project.stage);
  const sectionsByType: Record<string, Section> = {};
  project.sections.forEach(s => { sectionsByType[s.type] = s; });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-white/8 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/projects" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              ← Projects
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{project.title}</h1>
              {project.videoTopic && (
                <p className="text-gray-400 text-sm mt-0.5">{project.videoTopic}</p>
              )}
            </div>
            {stageIdx < STAGES.length - 1 && (
              <button onClick={advanceStage} disabled={updatingStage} className="btn-primary text-sm shrink-0 disabled:opacity-50">
                {updatingStage ? "Updating..." : `Move to ${STAGES[stageIdx + 1].charAt(0) + STAGES[stageIdx + 1].slice(1).toLowerCase()} →`}
              </button>
            )}
          </div>

          {/* Stage progress */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-1 shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  i === stageIdx
                    ? "bg-indigo-600 text-white"
                    : i < stageIdx
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "bg-white/5 text-gray-600"
                }`}>
                  {STAGE_ICONS[stage]}
                  <span className="hidden sm:inline">{stage.charAt(0) + stage.slice(1).toLowerCase()}</span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`w-4 h-px ${i < stageIdx ? "bg-indigo-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Section menu */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden sticky top-[160px]">
              <div className="p-4 border-b border-white/8">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">AI Content Sections</p>
              </div>
              <div className="p-2">
                {SECTION_TYPES.map(({ type, label, icon }) => {
                  const has = !!sectionsByType[type];
                  const isActive = activeSection === type;
                  const isGenerating = generating === type;
                  return (
                    <div key={type} className={`flex items-center justify-between p-3 rounded-xl mb-1 transition-all cursor-pointer ${
                      isActive ? "bg-indigo-600/20 border border-indigo-500/30" : "hover:bg-white/5"
                    }`} onClick={() => has && setActiveSection(type)}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{icon}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-gray-300"}`}>{label}</p>
                          {has && <p className="text-xs text-gray-500">v{sectionsByType[type].version}</p>}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); generate(type); }}
                        disabled={!!generating}
                        className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-all disabled:opacity-50 ${
                          has
                            ? "bg-white/10 text-gray-400 hover:bg-white/15"
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                        }`}
                      >
                        {isGenerating ? "..." : has ? "Regen" : "Generate"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Section content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeSection && sectionsByType[activeSection] ? (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="bg-gray-900/60 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-white/8">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{SECTION_TYPES.find(s => s.type === activeSection)?.icon}</span>
                        <h2 className="text-white font-semibold">{SECTION_TYPES.find(s => s.type === activeSection)?.label}</h2>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                          v{sectionsByType[activeSection].version}
                        </span>
                      </div>
                      <button
                        onClick={() => generate(activeSection)}
                        disabled={!!generating}
                        className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {generating === activeSection ? "Regenerating..." : "↻ Regenerate"}
                      </button>
                    </div>
                    <div className="p-5">
                      <SectionContent section={sectionsByType[activeSection]} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900/40 border border-white/5 border-dashed rounded-2xl p-12 text-center"
                >
                  {generating ? (
                    <div>
                      <div className="text-4xl mb-4 animate-bounce">✨</div>
                      <p className="text-white font-medium mb-1">Generating content...</p>
                      <p className="text-gray-500 text-sm">AI is writing for you</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-5xl mb-4">👈</div>
                      <p className="text-white font-medium mb-2">Select a section</p>
                      <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        Click Generate on any section on the left to have AI create content for this video.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STAGES = ["RESEARCH", "PLANNING", "WRITING", "THUMBNAIL", "EDITING", "PUBLISHING", "ANALYSIS"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_META: Record<Stage, { icon: string; label: string; description: string }> = {
  RESEARCH:   { icon: "🔍", label: "Research",   description: "Nail your concept — generate video ideas and hooks" },
  PLANNING:   { icon: "📋", label: "Planning",   description: "Plan your SEO — optimise your title before you write" },
  WRITING:    { icon: "✍️", label: "Writing",    description: "Write your full script and video description" },
  THUMBNAIL:  { icon: "🖼️", label: "Thumbnail",  description: "Brief your thumbnail — concepts, text, and colour" },
  EDITING:    { icon: "✂️", label: "Editing",    description: "Your video is being edited — come back when it's ready" },
  PUBLISHING: { icon: "🚀", label: "Publishing", description: "Go live — create Shorts and a community post" },
  ANALYSIS:   { icon: "📊", label: "Analysis",   description: "Video is published — review everything you created" },
};

type SectionType =
  | "IDEAS" | "HOOK" | "TITLE" | "SEO_PACKAGE"
  | "SCRIPT" | "DESCRIPTION" | "THUMBNAIL" | "SHORTS" | "COMMUNITY_POST";

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

// ─── Copy helper ────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy", id }: { text: string; label?: string; id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10 shrink-0">
      {copied ? "✓ Copied!" : label}
    </button>
  );
}

// ─── Generate button ─────────────────────────────────────────────────────────
function GenBtn({ onClick, loading, hasContent }: { onClick: () => void; loading: boolean; hasContent: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 ${
        hasContent
          ? "bg-white/10 text-gray-300 hover:bg-white/15"
          : "bg-indigo-600 text-white hover:bg-indigo-500"
      }`}
    >
      {loading ? (
        <><span className="animate-spin">⟳</span> Generating...</>
      ) : hasContent ? (
        <>⟳ Regenerate</>
      ) : (
        <>✨ Generate</>
      )}
    </button>
  );
}

// ─── Section renderers ────────────────────────────────────────────────────────
function IdeasView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const ideas = (section?.content?.ideas as { title: string; angle: string; targetAudience: string; estimatedViews: string }[]) || [];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Video Ideas</h3><p className="text-gray-400 text-sm">5 angle ideas for your topic</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {section ? (
        <div className="space-y-3">
          {ideas.map((idea, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h4 className="text-white text-sm font-medium">{idea.title}</h4>
                <CopyBtn text={idea.title} id={`idea-${i}`} />
              </div>
              <p className="text-gray-400 text-xs mb-2">{idea.angle}</p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>👥 {idea.targetAudience}</span>
                <span className="text-indigo-400">📈 Est. {idea.estimatedViews}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="Generate 5 video ideas tailored to your niche and creator profile." />
      )}
    </div>
  );
}

function HookView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const hooks = (section?.content?.hooks as { hook: string; type: string; psychology: string }[]) || [];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Hooks</h3><p className="text-gray-400 text-sm">Opening lines that keep viewers watching</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {section ? (
        <div className="space-y-3">
          {hooks.map((h, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{h.type}</span>
                <CopyBtn text={h.hook} id={`hook-${i}`} />
              </div>
              <p className="text-white text-sm leading-relaxed mb-1">"{h.hook}"</p>
              <p className="text-gray-500 text-xs">{h.psychology}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="Generate 5 powerful opening hooks written for your specific video." />
      )}
    </div>
  );
}

function TitleView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const titles = (section?.content?.titles as { title: string; type: string; charCount: number; score: number }[]) || [];
  const keywords = (section?.content?.keywords as string[]) || [];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Title & SEO</h3><p className="text-gray-400 text-sm">10 optimised YouTube titles</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {section ? (
        <div className="space-y-3">
          {titles.map((t, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{t.title}</p>
                <div className="flex gap-2 mt-1 text-xs text-gray-500">
                  <span>{t.title.length} chars</span><span>•</span><span className="text-indigo-400">{t.type}</span>
                  {t.score > 0 && <><span>•</span><span className="text-green-400">{t.score}/100</span></>}
                </div>
              </div>
              <CopyBtn text={t.title} id={`title-${i}`} />
            </div>
          ))}
          {keywords.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((k, i) => <span key={i} className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">{k}</span>)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState text="Generate 10 SEO-optimised titles with keyword suggestions." />
      )}
    </div>
  );
}

function SeoView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const pkg = section?.content as { primaryKeyword?: string; secondaryKeywords?: string[]; tags?: string[]; searchIntent?: string; seoScore?: number; suggestions?: string[] } | undefined;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">SEO Package</h3><p className="text-gray-400 text-sm">Keywords, tags and search intent</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {pkg ? (
        <div className="space-y-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
            <p className="text-xs text-indigo-400 mb-1">Primary Keyword</p>
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">{pkg.primaryKeyword}</p>
              <CopyBtn text={pkg.primaryKeyword || ""} id="pkw" />
            </div>
          </div>
          {pkg.secondaryKeywords && pkg.secondaryKeywords.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">Secondary Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {pkg.secondaryKeywords.map((k, i) => <span key={i} className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">{k}</span>)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {pkg.searchIntent && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Search Intent</p><p className="text-gray-200 text-sm">{pkg.searchIntent}</p></div>}
            {pkg.seoScore && pkg.seoScore > 0 && <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">SEO Score</p><p className="text-green-400 text-2xl font-bold">{pkg.seoScore}<span className="text-xs text-gray-500">/100</span></p></div>}
          </div>
          {pkg.tags && pkg.tags.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-gray-400">Tags</p><CopyBtn text={pkg.tags.join(", ")} id="tags" label="Copy all" /></div>
              <div className="flex flex-wrap gap-1.5">{pkg.tags.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-full">{t}</span>)}</div>
            </div>
          )}
          {pkg.suggestions && pkg.suggestions.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">Optimisation Tips</p>
              <ul className="space-y-1">{pkg.suggestions.map((s, i) => <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400">→</span>{s}</li>)}</ul>
            </div>
          )}
        </div>
      ) : (
        <EmptyState text="Generate a full SEO package with primary keyword, tags, and search intent." />
      )}
    </div>
  );
}

function ScriptView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({0: true});
  const script = section?.content?.script as {
    hook: string; intro: string;
    sections: { title: string; timestamp: string; script: string; patternInterrupt: string }[];
    cta: string; outro: string; chapters: string[]; totalWordCount: number; speakingNotes: string;
  } | undefined;

  const toggle = (i: number) => setOpenSections(prev => ({ ...prev, [i]: !prev[i] }));
  const parts = script ? [
    { label: "Hook", content: script.hook },
    { label: "Intro", content: script.intro },
    ...(script.sections || []).map(s => ({ label: s.title, content: s.script, timestamp: s.timestamp })),
    { label: "CTA", content: script.cta },
    { label: "Outro", content: script.outro },
  ] : [];

  const fullScript = parts.map(p => `[${p.label}]\n${p.content}`).join("\n\n");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Full Script</h3><p className="text-gray-400 text-sm">{script ? `~${script.totalWordCount || "?"} words` : "Word-for-word script"}</p></div>
        <div className="flex gap-2">
          {script && <CopyBtn text={fullScript} id="full-script" label="Copy all" />}
          <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
        </div>
      </div>
      {script ? (
        <div className="space-y-2">
          {script.chapters && script.chapters.length > 0 && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mb-3">
              <p className="text-xs text-indigo-400 font-medium mb-2">Chapters</p>
              {script.chapters.map((ch, i) => <p key={i} className="text-xs text-gray-300 font-mono">{ch}</p>)}
            </div>
          )}
          {parts.map((part, i) => (
            <div key={i} className="bg-white/5 rounded-xl overflow-hidden">
              <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">{part.label}</span>
                  {(part as {timestamp?: string}).timestamp && <span className="text-xs text-gray-500">{(part as {timestamp?: string}).timestamp}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <CopyBtn text={part.content} id={`script-${i}`} />
                  <span className="text-gray-500 text-xs">{openSections[i] ? "▲" : "▼"}</span>
                </div>
              </button>
              {openSections[i] && (
                <div className="px-4 pb-4">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{part.content}</p>
                </div>
              )}
            </div>
          ))}
          {script.speakingNotes && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-xs text-yellow-400 font-medium mb-1">Speaking Notes</p>
              <p className="text-gray-300 text-sm">{script.speakingNotes}</p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState text="Generate a complete word-for-word script with hook, sections, CTA and outro." />
      )}
    </div>
  );
}

function DescriptionView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const desc = section?.content?.description as { full: string; short: string; timestamps: string[]; hashtags: string[]; cta: string } | undefined;
  const tags = (section?.content?.tags as string[]) || [];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Description</h3><p className="text-gray-400 text-sm">SEO-optimised video description + tags</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {desc ? (
        <div className="space-y-3">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400">Full Description</span><CopyBtn text={desc.full} id="desc-full" /></div>
            <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{desc.full}</p>
          </div>
          {desc.timestamps && desc.timestamps.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-gray-400">Timestamps</p><CopyBtn text={desc.timestamps.join("\n")} id="timestamps" /></div>
              {desc.timestamps.map((t, i) => <p key={i} className="text-gray-300 text-xs font-mono">{t}</p>)}
            </div>
          )}
          {tags.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-gray-400">Tags</p><CopyBtn text={tags.join(", ")} id="tags-desc" label="Copy all" /></div>
              <div className="flex flex-wrap gap-1.5">{tags.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-full">{t}</span>)}</div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState text="Generate a full description with timestamps, hashtags, and tags ready to paste." />
      )}
    </div>
  );
}

function ThumbnailView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const concepts = (section?.content?.concepts as { concept: string; textOverlay: string; visualElements: string; colorScheme: string; emotion: string }[]) || [];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Thumbnail Concepts</h3><p className="text-gray-400 text-sm">3 visual concepts to brief your designer</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {section ? (
        <div className="space-y-4">
          {concepts.map((con, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">{i + 1}</span>
                <span className="text-white text-sm font-medium">{con.concept}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[["Text Overlay", con.textOverlay], ["Color Scheme", con.colorScheme], ["Emotion", con.emotion], ["Visual Elements", con.visualElements]].map(([k, v]) => (
                  <div key={k} className="bg-black/20 rounded-lg p-2"><p className="text-gray-500 mb-0.5">{k}</p><p className="text-gray-300">{v}</p></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState text="Generate 3 thumbnail concepts with text, colour scheme, and visual direction." />
      )}
    </div>
  );
}

function EditingView() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">✂️</div>
      <h3 className="text-white font-semibold text-xl mb-2">Video is in Editing</h3>
      <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
        Your script and assets are ready. Once editing is done, move to Publishing to create your Shorts and community content.
      </p>
      <div className="bg-white/5 rounded-xl p-4 max-w-sm mx-auto text-left">
        <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Editing checklist</p>
        {["Script exported to editor", "B-roll collected", "Chapters added in editor", "Thumbnail created", "Captions / subtitles added"].map((item, i) => (
          <label key={i} className="flex items-center gap-2 py-1.5 cursor-pointer group">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ShortsView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const shorts = (section?.content?.shorts as { title: string; concept: string; hook: string; script: string }[]) || [];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Shorts Ideas</h3><p className="text-gray-400 text-sm">3 YouTube Shorts to extend your reach</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {section ? (
        <div className="space-y-4">
          {shorts.map((s, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
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
      ) : (
        <EmptyState text="Generate 3 Shorts ideas clipped from your main video." />
      )}
    </div>
  );
}

function CommunityView({ section, onGen, loading }: { section?: Section; onGen: () => void; loading: boolean }) {
  const post = section?.content?.communityPost as string | undefined;
  const poll = section?.content?.pollOptions as string[] | undefined;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-white font-semibold text-lg">Community Post</h3><p className="text-gray-400 text-sm">Promote your video to your subscribers</p></div>
        <GenBtn onClick={onGen} loading={loading} hasContent={!!section} />
      </div>
      {section ? (
        <div className="space-y-3">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-400">Community Post</span><CopyBtn text={post || ""} id="community" /></div>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{post}</p>
          </div>
          {poll && poll.length > 0 && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">Poll Options</p>
              {poll.map((opt, i) => <div key={i} className="text-sm text-gray-300 py-1.5 px-3 rounded-lg bg-white/5 mb-1">{opt}</div>)}
            </div>
          )}
        </div>
      ) : (
        <EmptyState text="Generate a community post to promote your video to subscribers." />
      )}
    </div>
  );
}

function AnalysisView({ sections, project }: { sections: Record<string, Section>; project: Project }) {
  const sectionList = [
    { type: "IDEAS", label: "Video Ideas", icon: "💡" },
    { type: "HOOK", label: "Hooks", icon: "🎣" },
    { type: "TITLE", label: "Titles", icon: "🏷️" },
    { type: "SEO_PACKAGE", label: "SEO Package", icon: "🔎" },
    { type: "SCRIPT", label: "Script", icon: "📝" },
    { type: "DESCRIPTION", label: "Description", icon: "📄" },
    { type: "THUMBNAIL", label: "Thumbnail", icon: "🖼️" },
    { type: "SHORTS", label: "Shorts", icon: "⚡" },
    { type: "COMMUNITY_POST", label: "Community Post", icon: "📢" },
  ];
  const generated = sectionList.filter(s => sections[s.type]).length;
  return (
    <div>
      <div className="text-center py-8 mb-6">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-white font-bold text-xl mb-1">"{project.title}" is live!</h3>
        <p className="text-gray-400 text-sm">You generated {generated} of {sectionList.length} content sections for this video.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sectionList.map(({ type, label, icon }) => {
          const has = !!sections[type];
          return (
            <div key={type} className={`flex items-center gap-3 p-3 rounded-xl border ${has ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5 opacity-50"}`}>
              <span className="text-xl">{icon}</span>
              <span className={`text-sm ${has ? "text-white" : "text-gray-500"}`}>{label}</span>
              {has && <span className="ml-auto text-green-400 text-xs">✓ Done</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
      <p className="text-gray-500 text-sm max-w-xs mx-auto">{text}</p>
    </div>
  );
}

// ─── Stage view router ────────────────────────────────────────────────────────
function StageView({
  stage, sections, project, onGenerate, generating,
}: {
  stage: Stage;
  sections: Record<string, Section>;
  project: Project;
  onGenerate: (type: SectionType) => void;
  generating: string | null;
}) {
  const props = (type: SectionType) => ({
    section: sections[type],
    onGen: () => onGenerate(type),
    loading: generating === type,
  });

  if (stage === "RESEARCH") return (
    <div className="space-y-8">
      <IdeasView {...props("IDEAS")} />
      <div className="border-t border-white/8 pt-8"><HookView {...props("HOOK")} /></div>
    </div>
  );
  if (stage === "PLANNING") return (
    <div className="space-y-8">
      <TitleView {...props("TITLE")} />
      <div className="border-t border-white/8 pt-8"><SeoView {...props("SEO_PACKAGE")} /></div>
    </div>
  );
  if (stage === "WRITING") return (
    <div className="space-y-8">
      <ScriptView {...props("SCRIPT")} />
      <div className="border-t border-white/8 pt-8"><DescriptionView {...props("DESCRIPTION")} /></div>
    </div>
  );
  if (stage === "THUMBNAIL") return <ThumbnailView {...props("THUMBNAIL")} />;
  if (stage === "EDITING") return <EditingView />;
  if (stage === "PUBLISHING") return (
    <div className="space-y-8">
      <ShortsView {...props("SHORTS")} />
      <div className="border-t border-white/8 pt-8"><CommunityView {...props("COMMUNITY_POST")} /></div>
    </div>
  );
  if (stage === "ANALYSIS") return <AnalysisView sections={sections} project={project} />;
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProjectClient({ projectId, userId }: { projectId: string; userId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [viewStage, setViewStage] = useState<Stage | null>(null);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    setProject(data.project);
    setViewStage(data.project?.stage ?? "RESEARCH");
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
    }
    setGenerating(null);
  };

  const advanceStage = () => {
    if (!project) return;
    const idx = STAGES.indexOf(project.stage);
    if (idx >= STAGES.length - 1) return;
    const nextStage = STAGES[idx + 1];
    setProject(prev => prev ? { ...prev, stage: nextStage } : prev);
    setViewStage(nextStage);
    fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading project...</div>
    </div>
  );

  if (!project || !viewStage) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Project not found.</p>
        <Link href="/projects" className="btn-secondary">Back to Projects</Link>
      </div>
    </div>
  );

  const currentStageIdx = STAGES.indexOf(project.stage);
  const viewStageIdx = STAGES.indexOf(viewStage);
  const sectionsByType: Record<string, Section> = {};
  project.sections.forEach(s => { sectionsByType[s.type] = s; });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-white/8 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/projects" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Projects</Link>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{project.title}</h1>
              {project.videoTopic && <p className="text-gray-400 text-sm mt-0.5">{project.videoTopic}</p>}
            </div>
            {currentStageIdx < STAGES.length - 1 && viewStage === project.stage && (
              <button onClick={advanceStage} className="btn-primary text-sm shrink-0">
                Done — Move to {STAGE_META[STAGES[currentStageIdx + 1]].label} →
              </button>
            )}
            {project.stage === STAGES[STAGES.length - 1] && (
              <span className="text-green-400 text-sm font-medium">✓ Complete</span>
            )}
          </div>

          {/* Stage pipeline — clickable */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {STAGES.map((stage, i) => {
              const isActive = viewStage === stage;
              const isPast = i <= currentStageIdx;
              const isCurrent = stage === project.stage;
              return (
                <div key={stage} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setViewStage(stage)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1 ring-offset-gray-900"
                        : isPast
                        ? "bg-indigo-600/25 text-indigo-300 hover:bg-indigo-600/40 cursor-pointer"
                        : "bg-white/5 text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!isPast}
                    title={!isPast ? "Not reached yet" : undefined}
                  >
                    {STAGE_META[stage].icon}
                    <span className="hidden sm:inline">{STAGE_META[stage].label}</span>
                    {isCurrent && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-0.5" />}
                  </button>
                  {i < STAGES.length - 1 && (
                    <div className={`w-4 h-px ${i < currentStageIdx ? "bg-indigo-500" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage description bar */}
      <div className="border-b border-white/5 bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{STAGE_META[viewStage].icon}</span>
            <span className="text-sm text-gray-300">{STAGE_META[viewStage].description}</span>
          </div>
          {viewStage !== project.stage && (
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">Viewing past stage</span>
          )}
        </div>
      </div>

      {/* Stage content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewStage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <StageView
              stage={viewStage}
              sections={sectionsByType}
              project={project}
              onGenerate={generate}
              generating={generating}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

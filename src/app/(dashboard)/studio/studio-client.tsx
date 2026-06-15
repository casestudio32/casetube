"use client";

import { useState } from "react";
import React from "react";

type Tab = "ideas" | "hooks" | "script" | "repurpose";

export function StudioClient({ userId }: { userId: string }) {
  const [tab, setTab] = useState<Tab>("ideas");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ideas", label: "Ideas", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { id: "hooks", label: "Hooks", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg> },
    { id: "script", label: "Script", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id: "repurpose", label: "Repurpose", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> },
  ];

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Content Studio
        </div>
        <h1 className="text-3xl font-bold text-white">Content Studio</h1>
        <p className="text-zinc-400 mt-1">Generate ideas, hooks, scripts, and repurposed content with AI.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-2">{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

      {/* Panels — all stay mounted so state is preserved */}
      <div className={tab === "ideas" ? "block" : "hidden"}><IdeasTab userId={userId} /></div>
      <div className={tab === "hooks" ? "block" : "hidden"}><HooksTab userId={userId} /></div>
      <div className={tab === "script" ? "block" : "hidden"}><ScriptTab userId={userId} /></div>
      <div className={tab === "repurpose" ? "block" : "hidden"}><RepurposeTab userId={userId} /></div>
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState("");
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }
  return { copied, copy };
}

function Spinner({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      {text}
    </span>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
      ⚠️ {message}
    </div>
  );
}

function CopyBtn({ text, id, copied, copy }: { text: string; id: string; copied: string; copy: (t: string, k: string) => void }) {
  return (
    <button
      onClick={() => copy(text, id)}
      className="text-xs text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
    >
      {copied === id ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── Ideas Tab ───────────────────────────────────────────────────────

interface Idea {
  title: string; hook: string; angle: string; format: string;
  estimatedLength: string; difficulty: string; potential: string; whyItWorks: string;
}

function IdeasTab({ userId }: { userId: string }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopy();

  async function generate() {
    setLoading(true); setError(""); setIdeas([]);
    try {
      const res = await fetch("/api/studio/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setIdeas(json.data.ideas);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate ideas.");
    } finally { setLoading(false); }
  }

  const POTENTIAL_COLOR: Record<string, string> = {
    High: "bg-green-500/20 text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    Low: "bg-zinc-500/20 text-zinc-400",
  };

  return (
    <div>
      <div className="flex gap-3 mb-8">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Topic or leave blank to generate from your niche (e.g. 'AI tools for students')"
          className="input-field flex-1"
        />
        <button onClick={generate} disabled={loading} className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
          {loading ? <Spinner text="Generating..." /> : "Generate Ideas →"}
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      {ideas.length > 0 && (
        <div className="space-y-4">
          {ideas.map((idea, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-white font-semibold leading-snug flex-1">{idea.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${POTENTIAL_COLOR[idea.potential] ?? "bg-zinc-700 text-zinc-400"}`}>
                    {idea.potential} potential
                  </span>
                  <CopyBtn text={idea.title} id={`idea-${i}`} copied={copied} copy={copy} />
                </div>
              </div>

              <p className="text-zinc-400 text-sm mb-3 italic">&quot;{idea.hook}&quot;</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-zinc-600 text-xs mb-1">Unique Angle</p>
                  <p className="text-zinc-300 text-sm">{idea.angle}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs mb-1">Why It Works</p>
                  <p className="text-zinc-300 text-sm">{idea.whyItWorks}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{idea.format}</span>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{idea.estimatedLength}</span>
                <span className={`text-xs px-2 py-1 rounded-md ${idea.difficulty === "Easy" ? "bg-green-500/10 text-green-500" : idea.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}`}>
                  {idea.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hooks Tab ───────────────────────────────────────────────────────

interface Hook {
  hook: string; type: string; psychology: string; bestFor: string;
}

function HooksTab({ userId }: { userId: string }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [error, setError] = useState("");
  const { copied, copy } = useCopy();

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setError(""); setHooks([]);
    try {
      const res = await fetch("/api/studio/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setHooks(json.data.hooks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate hooks.");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex gap-3 mb-8">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="What is your video about? (e.g. 'Why most people never build wealth')"
          className="input-field flex-1"
        />
        <button onClick={generate} disabled={loading || !topic.trim()} className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
          {loading ? <Spinner text="Writing..." /> : "Write Hooks →"}
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      {hooks.length > 0 && (
        <div className="space-y-4">
          {hooks.map((h, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md font-medium">
                  {h.type}
                </span>
                <CopyBtn text={h.hook} id={`hook-${i}`} copied={copied} copy={copy} />
              </div>

              <blockquote className="text-white text-base leading-relaxed border-l-2 border-red-500 pl-4 mb-4 italic">
                &quot;{h.hook}&quot;
              </blockquote>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-zinc-600 text-xs mb-1">Psychology</p>
                  <p className="text-zinc-400 text-sm">{h.psychology}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs mb-1">Best For</p>
                  <p className="text-zinc-400 text-sm">{h.bestFor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Script Tab ──────────────────────────────────────────────────────

interface ScriptSection { title: string; timestamp: string; script: string; patternInterrupt: string; }
interface Script {
  hook: string; intro: string; sections: ScriptSection[];
  cta: string; outro: string; chapters: string[];
  totalWordCount: number; speakingNotes: string;
}

function ScriptTab({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [duration, setDuration] = useState("8-10");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const { copied, copy } = useCopy();

  async function generate() {
    if (!title.trim()) return;
    setLoading(true); setError(""); setScript(null);
    try {
      const res = await fetch("/api/studio/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, keyPoints, duration, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setScript(json.data.script);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate script.");
    } finally { setLoading(false); }
  }

  function fullScript() {
    if (!script) return "";
    return `HOOK\n${script.hook}\n\nINTRO\n${script.intro}\n\n${script.sections.map((s) => `${s.title.toUpperCase()} (${s.timestamp})\n${s.script}`).join("\n\n")}\n\nCTA\n${script.cta}\n\nOUTRO\n${script.outro}`;
  }

  return (
    <div>
      <div className="space-y-3 mb-8">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title (e.g. 'How I went from 0 to 10K subscribers in 6 months')" className="input-field" />
        <textarea value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="Key points to cover (optional, one per line)" rows={3} className="input-field resize-none" />
        <div className="flex gap-3">
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input-field flex-1">
            <option value="3-5">Short (3-5 mins)</option>
            <option value="8-10">Standard (8-10 mins)</option>
            <option value="15-20">Long (15-20 mins)</option>
          </select>
          <button onClick={generate} disabled={loading || !title.trim()} className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
            {loading ? <Spinner text="Writing script..." /> : "Write Script →"}
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {script && (
        <div className="space-y-5">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 text-sm">~{script.totalWordCount?.toLocaleString()} words</p>
            <CopyBtn text={fullScript()} id="full-script" copied={copied} copy={copy} />
          </div>

          {/* Hook */}
          <ScriptBlock title="🎣 Hook (First 30 seconds)" content={script.hook} id="hook" copied={copied} copy={copy} highlight />

          {/* Intro */}
          <ScriptBlock title="👋 Intro" content={script.intro} id="intro" copied={copied} copy={copy} />

          {/* Sections */}
          {script.sections?.map((s, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs">{s.timestamp}</span>
                  <span className="text-white font-medium">{s.title}</span>
                </div>
                <span className={`text-zinc-500 transition-transform ${open[i] ? "rotate-180" : ""}`}>▼</span>
              </button>
              {open[i] && (
                <div className="px-5 pb-5 border-t border-zinc-800 pt-4">
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line mb-4">{s.script}</p>
                  {s.patternInterrupt && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-yellow-400 text-xs">
                      ⚡ Pattern interrupt: {s.patternInterrupt}
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <CopyBtn text={s.script} id={`sec-${i}`} copied={copied} copy={copy} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* CTA */}
          <ScriptBlock title="📣 Mid-Video CTA" content={script.cta} id="cta" copied={copied} copy={copy} />

          {/* Outro */}
          <ScriptBlock title="🎬 Outro" content={script.outro} id="outro" copied={copied} copy={copy} />

          {/* Chapters */}
          {script.chapters?.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">📑 Chapters</h3>
                <CopyBtn text={script.chapters.join("\n")} id="chapters" copied={copied} copy={copy} />
              </div>
              <pre className="text-zinc-300 text-sm leading-relaxed">{script.chapters.join("\n")}</pre>
            </div>
          )}

          {/* Speaking notes */}
          {script.speakingNotes && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
              <h3 className="text-blue-400 font-semibold mb-2">🎙️ Speaking Notes</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">{script.speakingNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScriptBlock({ title, content, id, copied, copy, highlight }: {
  title: string; content: string; id: string;
  copied: string; copy: (t: string, k: string) => void; highlight?: boolean;
}) {
  return (
    <div className={`border rounded-xl p-5 ${highlight ? "bg-red-500/5 border-red-500/20" : "bg-zinc-900 border-zinc-800"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold ${highlight ? "text-red-400" : "text-white"}`}>{title}</h3>
        <CopyBtn text={content} id={id} copied={copied} copy={copy} />
      </div>
      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

// ─── Repurpose Tab ───────────────────────────────────────────────────

interface RepurposeData {
  shorts: { title: string; concept: string; hook: string; script: string }[];
  xPosts: { post: string; type: string }[];
  linkedIn: { post: string; hook: string };
  communityPost: string;
  emailSubject: string;
  emailPreview: string;
}

function RepurposeTab({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepurposeData | null>(null);
  const [error, setError] = useState("");
  const { copied, copy } = useCopy();

  async function generate() {
    if (!title.trim()) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch("/api/studio/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to repurpose content.");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="space-y-3 mb-8">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" className="input-field" />
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary of your video (optional — helps the AI write better content)" rows={3} className="input-field resize-none" />
        <button onClick={generate} disabled={loading || !title.trim()} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? <Spinner text="Repurposing..." /> : "Repurpose This Video →"}
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      {data && (
        <div className="space-y-6">
          {/* Shorts */}
          <div>
            <h3 className="text-white font-semibold mb-3">📱 YouTube Shorts (3 ideas)</h3>
            <div className="space-y-3">
              {data.shorts?.map((s, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium">{s.title}</p>
                    <CopyBtn text={`${s.title}\n\n${s.script}`} id={`short-${i}`} copied={copied} copy={copy} />
                  </div>
                  <p className="text-zinc-500 text-xs mb-3">{s.concept}</p>
                  <p className="text-red-400 text-sm italic mb-2">&quot;{s.hook}&quot;</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{s.script}</p>
                </div>
              ))}
            </div>
          </div>

          {/* X Posts */}
          <div>
            <h3 className="text-white font-semibold mb-3">𝕏 X / Twitter Posts</h3>
            <div className="space-y-3">
              {data.xPosts?.map((p, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-zinc-300 text-sm leading-relaxed flex-1">{p.post}</p>
                    <CopyBtn text={p.post} id={`x-${i}`} copied={copied} copy={copy} />
                  </div>
                  <span className="text-xs text-zinc-600 mt-2 block">{p.type} · {p.post.length} chars</span>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn */}
          {data.linkedIn && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">💼 LinkedIn Post</h3>
                <CopyBtn text={data.linkedIn.post} id="linkedin" copied={copied} copy={copy} />
              </div>
              <pre className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{data.linkedIn.post}</pre>
            </div>
          )}

          {/* Community + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.communityPost && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">💬 Community Post</h3>
                  <CopyBtn text={data.communityPost} id="community" copied={copied} copy={copy} />
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{data.communityPost}</p>
              </div>
            )}
            {data.emailSubject && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">📧 Email Newsletter</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-zinc-600 text-xs mb-1">Subject line</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium flex-1">{data.emailSubject}</p>
                      <CopyBtn text={data.emailSubject} id="email-sub" copied={copied} copy={copy} />
                    </div>
                  </div>
                  {data.emailPreview && (
                    <div>
                      <p className="text-zinc-600 text-xs mb-1">Preview text</p>
                      <p className="text-zinc-400 text-sm">{data.emailPreview}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

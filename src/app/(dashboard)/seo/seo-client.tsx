"use client";

import { useState } from "react";

type Tab = "keywords" | "titles" | "description";

interface KeywordData {
  primaryKeyword: string;
  searchVolume: string;
  competition: string;
  opportunityScore: number;
  keywords: { keyword: string; intent: string; difficulty: string; opportunity: string }[];
  longTail: { keyword: string; why: string }[];
  questions: string[];
  contentAngles: { angle: string; hook: string }[];
  searchIntent: string;
  competitorTip: string;
}

interface TitleData {
  titles: { title: string; type: string; score: number; reasoning: string; keyword: string }[];
  tips: string[];
}

interface DescriptionData {
  description: string;
  tags: string[];
  hashtags: string[];
}

export function SEOClient({ userId }: { userId: string }) {
  const [tab, setTab] = useState<Tab>("keywords");

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> SEO Center
        </div>
        <h1 className="text-3xl font-bold text-white">SEO Research Center</h1>
        <p className="text-zinc-400 mt-1">
          AI-powered keyword research, title optimization, and description writing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8 w-fit">
        {(["keywords", "titles", "description"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "keywords" ? (
              <span className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>Keyword Explorer</span>
            ) : t === "titles" ? (
              <span className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Title Generator</span>
            ) : (
              <span className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Description</span>
            )}
          </button>
        ))}
      </div>

      {/* All panels stay mounted — only visibility toggles so state is preserved */}
      <div className={tab === "keywords" ? "block" : "hidden"}>
        <KeywordExplorer userId={userId} />
      </div>
      <div className={tab === "titles" ? "block" : "hidden"}>
        <TitleGenerator userId={userId} />
      </div>
      <div className={tab === "description" ? "block" : "hidden"}>
        <DescriptionGenerator userId={userId} />
      </div>
    </div>
  );
}

// ─── Shared copy hook ────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState("");
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }
  return { copied, copy };
}

// ─── Keyword Explorer ────────────────────────────────────────────────

function KeywordExplorer({ userId }: { userId: string }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordData | null>(null);
  const [error, setError] = useState("");
  const { copied, copy } = useCopy();

  async function research() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to research. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-8">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && research()}
          placeholder="Enter a topic or niche (e.g. 'personal finance for beginners')"
          className="input-field flex-1"
        />
        <button
          onClick={research}
          disabled={loading || !topic.trim()}
          className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? <Spinner text="Researching..." /> : "Research →"}
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      {data && (
        <div className="space-y-6">
          {/* Score cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Opportunity Score</p>
              <div className="flex items-end gap-1">
                <span className={`text-4xl font-bold ${data.opportunityScore >= 70 ? "text-green-400" : data.opportunityScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                  {data.opportunityScore}
                </span>
                <span className="text-zinc-500 text-sm mb-1">/100</span>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Search Volume</p>
              <p className="text-white font-bold text-lg">{data.searchVolume}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Competition</p>
              <p className={`font-bold text-lg ${data.competition === "Low" ? "text-green-400" : data.competition === "Medium" ? "text-yellow-400" : "text-red-400"}`}>
                {data.competition}
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Primary Keyword</p>
              <p className="text-white font-semibold text-sm leading-tight">{data.primaryKeyword}</p>
            </div>
          </div>

          {/* Search Intent */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">🎯 Search Intent</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{data.searchIntent}</p>
          </div>

          {/* Keywords table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">📊 Keywords</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              {data.keywords.map((kw, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex-1">
                    <button onClick={() => copy(kw.keyword, `kw-${i}`)} className="text-white text-sm font-medium hover:text-red-400 transition-colors text-left">
                      {copied === `kw-${i}` ? "✓ Copied" : kw.keyword}
                    </button>
                    <span className="ml-3 text-zinc-600 text-xs">{kw.intent}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${kw.difficulty === "Easy" ? "bg-green-500/20 text-green-400" : kw.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                      {kw.difficulty}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${kw.opportunity === "High" ? "bg-blue-500/20 text-blue-400" : "bg-zinc-700/50 text-zinc-500"}`}>
                      {kw.opportunity} opp
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Long tail */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">🎣 Long-Tail Keywords</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              {data.longTail.map((lt, i) => (
                <div key={i} className="px-5 py-4">
                  <button onClick={() => copy(lt.keyword, `lt-${i}`)} className="text-white text-sm font-medium hover:text-red-400 transition-colors block mb-1">
                    {copied === `lt-${i}` ? "✓ Copied" : lt.keyword}
                  </button>
                  <p className="text-zinc-500 text-xs">{lt.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions + Angles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">❓ Questions People Ask</h3>
              <ul className="space-y-2">
                {data.questions.map((q, i) => (
                  <li key={i}>
                    <button onClick={() => copy(q, `q-${i}`)} className="text-zinc-300 text-sm hover:text-white transition-colors text-left">
                      {copied === `q-${i}` ? "✓ Copied" : q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Content Angles</h3>
              <div className="space-y-3">
                {data.contentAngles.map((ca, i) => (
                  <div key={i} className="border border-zinc-800 rounded-lg p-3">
                    <p className="text-white text-sm font-medium mb-1">{ca.angle}</p>
                    <p className="text-zinc-500 text-xs">{ca.hook}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competitor tip */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <h3 className="text-blue-400 font-semibold mb-2">⚡ How to Outrank Competitors</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{data.competitorTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Title Generator ─────────────────────────────────────────────────

function TitleGenerator({ userId }: { userId: string }) {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TitleData | null>(null);
  const [error, setError] = useState("");
  const { copied, copy } = useCopy();

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/seo/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keyword, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate titles.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="space-y-3 mb-8">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="What is your video about? (e.g. 'how to invest in stocks as a beginner')"
          className="input-field"
        />
        <div className="flex gap-3">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Target keyword (optional)"
            className="input-field flex-1"
          />
          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? <Spinner text="Generating..." /> : "Generate Titles →"}
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {data && (
        <div className="space-y-4">
          {data.titles.map((t, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-white font-semibold leading-snug flex-1">{t.title}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm font-bold ${t.score >= 80 ? "text-green-400" : t.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                    {t.score}
                  </span>
                  <button
                    onClick={() => copy(t.title, `t-${i}`)}
                    className="text-xs text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {copied === `t-${i}` ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{t.type}</span>
                <p className="text-zinc-500 text-xs">{t.reasoning}</p>
              </div>
            </div>
          ))}

          {data.tips?.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-2">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Title Tips</h3>
              <ul className="space-y-2">
                {data.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300 text-sm">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">▸</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Description Generator ───────────────────────────────────────────

function DescriptionGenerator({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DescriptionData | null>(null);
  const [error, setError] = useState("");
  const { copied, copy } = useCopy();

  async function generate() {
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/seo/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, keywords, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Server error");
      if (!json.data) throw new Error("No data returned from AI");
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate description. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="space-y-3 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Your video title (e.g. '5 Personal Finance Mistakes Beginners Make')"
          className="input-field"
        />
        <div className="flex gap-3">
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Keywords to include, comma separated (optional)"
            className="input-field flex-1"
          />
          <button
            onClick={generate}
            disabled={loading || !title.trim()}
            className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? <Spinner text="Writing..." /> : "Generate →"}
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {data && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold flex items-center gap-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Video Description</h3>
              <button
                onClick={() => copy(data.description, "desc")}
                className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all"
              >
                {copied === "desc" ? "✓ Copied!" : "Copy All"}
              </button>
            </div>
            <pre className="px-5 py-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {data.description}
            </pre>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">🏷️ Tags</h3>
              <button
                onClick={() => copy(data.tags.join(", "), "tags")}
                className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all"
              >
                {copied === "tags" ? "✓ Copied!" : "Copy All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg">{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold"># Hashtags</h3>
              <button
                onClick={() => copy(data.hashtags.join(" "), "hash")}
                className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all"
              >
                {copied === "hash" ? "✓ Copied!" : "Copy All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.hashtags.map((tag, i) => (
                <span key={i} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared UI helpers ───────────────────────────────────────────────

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

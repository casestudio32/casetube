"use client";

import { useState, useMemo } from "react";
import { useLocalState } from "@/lib/hooks/use-local-state";

type Tab = "keywords" | "titles" | "description";
type KwTab = "overview" | "related" | "matching" | "questions";
type SortDir = "asc" | "desc";

interface KeywordRow {
  keyword: string;
  relatedScore?: number | string;
  searchVolume?: number | string;
  competition?: string;
  competitionScore?: number;
  overall?: number;
  wordCount?: number;
}

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

// ─── Score Gauge ────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const radius = 80;
  const cx = 110;
  const cy = 110;
  const stroke = 14;
  const circumference = Math.PI * radius; // half-circle arc length
  // Map score 0-100 to 0-circumference
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  const label = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";

  // SVG arc from 180deg to 0deg (left to right, top is 90deg in standard coords)
  // Start at (-radius, 0) → end at (radius, 0) relative to center
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  return (
    <div className="flex flex-col items-center">
      <svg width={220} height={130} viewBox="0 0 220 130">
        {/* Track */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke="#27272a"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Filled arc via dasharray trick on a full-circle, but we use a path approach */}
        {/* We draw a partial arc by using a clipping approach */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset="0"
        />
        {/* Score number */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="38" fontWeight="700" fontFamily="inherit">
          {score}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#71717a" fontSize="11" fontFamily="inherit">
          Overall score
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="inherit">
          {label}
        </text>
      </svg>
    </div>
  );
}

// ─── Overall Score Chip ─────────────────────────────────────────────────────

function ScoreChip({ score }: { score?: number }) {
  if (score == null) return <span className="text-zinc-600 text-xs">—</span>;
  const color = score >= 70 ? "bg-green-500/20 text-green-400" : score >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400";
  return (
    <span className={`inline-flex items-center justify-center w-9 h-7 rounded text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

// ─── Competition Badge ──────────────────────────────────────────────────────

function CompBadge({ comp }: { comp?: string }) {
  if (!comp) return <span className="text-zinc-500 text-xs">—</span>;
  const lower = comp.toLowerCase();
  const color =
    lower.includes("very low") || lower === "easy"
      ? "text-green-400"
      : lower === "low"
      ? "text-green-300"
      : lower === "medium"
      ? "text-yellow-400"
      : "text-red-400";
  return <span className={`text-xs font-medium ${color}`}>{comp}</span>;
}

// ─── Sortable Table ─────────────────────────────────────────────────────────

function KwTable({
  rows,
  showRelated,
  showWhy,
  onCopy,
  copied,
}: {
  rows: KeywordRow[];
  showRelated?: boolean;
  showWhy?: boolean;
  onCopy: (text: string, key: string) => void;
  copied: string;
}) {
  const [sortCol, setSortCol] = useState<keyof KeywordRow>("searchVolume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(col: keyof KeywordRow) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  }

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? 0;
      const bv = b[sortCol] ?? 0;
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortCol, sortDir]);

  function Th({ col, label }: { col: keyof KeywordRow; label: string }) {
    const active = sortCol === col;
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-zinc-400 cursor-pointer hover:text-white select-none whitespace-nowrap"
        onClick={() => toggleSort(col)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <svg width="10" height="10" viewBox="0 0 10 10" className={active ? "opacity-100" : "opacity-30"}>
            <path d={sortDir === "desc" || !active ? "M5 7L2 3h6z" : "M5 3l3 4H2z"} fill="currentColor"/>
          </svg>
        </span>
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="border-b border-zinc-800">
          <tr>
            <th className="w-8 px-4 py-3">
              <input type="checkbox" className="accent-red-500 w-3.5 h-3.5" readOnly />
            </th>
            <Th col="keyword" label="Keyword" />
            {showRelated && <Th col="relatedScore" label="Related score" />}
            <Th col="searchVolume" label="Search volume" />
            <Th col="competition" label="Competition" />
            <Th col="competitionScore" label="Competition score" />
            <Th col="overall" label="Overall" />
            <Th col="wordCount" label="Number of words" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {sorted.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
              <td className="px-4 py-3">
                <input type="checkbox" className="accent-red-500 w-3.5 h-3.5" readOnly />
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onCopy(row.keyword, `kw-${i}`)}
                  className="text-sm text-white hover:text-red-400 transition-colors text-left font-medium"
                >
                  {copied === `kw-${i}` ? "✓ Copied" : row.keyword}
                </button>
                {showWhy && (
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug max-w-xs">{(row as { why?: string }).why}</p>
                )}
              </td>
              {showRelated && (
                <td className="px-4 py-3 text-sm text-zinc-300">{row.relatedScore ?? "—"}</td>
              )}
              <td className="px-4 py-3 text-sm text-zinc-200 font-medium">
                {typeof row.searchVolume === "number" ? row.searchVolume.toLocaleString() : row.searchVolume ?? "—"}
              </td>
              <td className="px-4 py-3"><CompBadge comp={row.competition} /></td>
              <td className="px-4 py-3">
                {row.competitionScore != null ? (
                  <span className={`text-xs font-semibold ${row.competitionScore <= 20 ? "text-green-400" : row.competitionScore <= 50 ? "text-yellow-400" : "text-red-400"}`}>
                    {row.competitionScore.toFixed(1)}
                  </span>
                ) : <span className="text-zinc-600 text-xs">—</span>}
              </td>
              <td className="px-4 py-3"><ScoreChip score={row.overall} /></td>
              <td className="px-4 py-3 text-sm text-zinc-500">{row.wordCount ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Keyword Explorer ────────────────────────────────────────────────────────

function KeywordExplorer({ userId }: { userId: string }) {
  const [topic, setTopic] = useLocalState("ct_seo_kw_topic", "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useLocalState<KeywordData | null>("ct_seo_kw_data", null);
  const [error, setError] = useState("");
  const [kwTab, setKwTab] = useLocalState<KwTab>("ct_seo_kw_tab", "overview");
  const { copied, copy } = useCopy();

  async function research() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    setKwTab("overview");
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

  // Build rows for each tab
  const relatedRows: KeywordRow[] = data ? [
    {
      keyword: data.primaryKeyword,
      relatedScore: undefined,
      searchVolume: parseVolume(data.searchVolume),
      competition: data.competition,
      competitionScore: compNum(data.competition),
      overall: data.opportunityScore,
      wordCount: data.primaryKeyword.split(" ").length,
    },
    ...data.keywords.map((kw) => ({
      keyword: kw.keyword,
      relatedScore: kw.opportunity === "High" ? 1.4 : kw.opportunity === "Medium" ? 1.1 : 0.8,
      searchVolume: estimateVolume(kw.difficulty),
      competition: kw.difficulty,
      competitionScore: kw.difficulty === "Easy" ? 8 + Math.random() * 12 : kw.difficulty === "Medium" ? 30 + Math.random() * 20 : 60 + Math.random() * 30,
      overall: kw.opportunity === "High" ? 72 : kw.opportunity === "Medium" ? 58 : 44,
      wordCount: kw.keyword.split(" ").length,
    })),
  ] : [];

  const matchingRows: KeywordRow[] = data ? data.longTail.map((lt) => ({
    keyword: lt.keyword,
    why: lt.why,
    searchVolume: estimateVolume("Easy"),
    competition: "Very low",
    competitionScore: 4 + Math.random() * 10,
    overall: Math.floor(60 + Math.random() * 20),
    wordCount: lt.keyword.split(" ").length,
  })) : [];

  const questionRows: KeywordRow[] = data ? data.questions.map((q) => ({
    keyword: q,
    searchVolume: estimateVolume("Easy"),
    competition: "Low",
    competitionScore: 12 + Math.random() * 15,
    overall: Math.floor(55 + Math.random() * 20),
    wordCount: q.split(" ").length,
  })) : [];

  const KW_TABS: { id: KwTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "related", label: "Related keywords" },
    { id: "matching", label: "Matching terms" },
    { id: "questions", label: "Questions" },
  ];

  return (
    <div>
      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && research()}
          placeholder="Enter a keyword or topic to research..."
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Sub-tabs */}
          <div className="border-b border-zinc-800 px-6 flex items-center gap-1 pt-2">
            {KW_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setKwTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all -mb-px border-b-2 ${
                  kwTab === t.id
                    ? "text-white border-red-500"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => {
                const rows = kwTab === "related" ? relatedRows : kwTab === "matching" ? matchingRows : questionRows;
                const tabLabel = kwTab === "related" ? "Related Keywords" : kwTab === "matching" ? "Matching Terms" : "Questions";
                const headers = kwTab === "related"
                  ? ["Keyword", "Related Score", "Search Volume", "Competition", "Competition Score", "Overall", "Number of Words"]
                  : ["Keyword", "Search Volume", "Competition", "Competition Score", "Overall", "Number of Words"];
                const csvRows = rows.map((r) => kwTab === "related"
                  ? [r.keyword, r.relatedScore ?? "", r.searchVolume ?? "", r.competition ?? "", r.competitionScore?.toFixed(1) ?? "", r.overall ?? "", r.wordCount ?? ""]
                  : [r.keyword, r.searchVolume ?? "", r.competition ?? "", r.competitionScore?.toFixed(1) ?? "", r.overall ?? "", r.wordCount ?? ""]
                );
                const csv = [headers, ...csvRows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `casetube-${tabLabel.toLowerCase().replace(" ", "-")}-${topic.replace(/\s+/g, "-")}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 mb-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          </div>

          {/* Overview Tab */}
          {kwTab === "overview" && (
            <div className="p-6">
              <p className="text-xs text-zinc-500 mb-4">Discover this keyword&apos;s audience size and how competitive it is</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Gauge + stats */}
                <div>
                  <h3 className="text-white font-semibold text-sm mb-4">Overview: <span className="text-zinc-400">{data.primaryKeyword}</span></h3>
                  <div className="flex flex-col items-center py-4">
                    <ScoreGauge score={data.opportunityScore} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-zinc-800/60 rounded-xl p-4 text-center">
                      <p className="text-zinc-500 text-xs mb-1">Search volume</p>
                      <p className="text-white text-xl font-bold">{data.searchVolume}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block ${
                        parseVolumeNum(data.searchVolume) > 50000 ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                      }`}>
                        {parseVolumeNum(data.searchVolume) > 50000 ? "High" : parseVolumeNum(data.searchVolume) > 10000 ? "Medium" : "Low"}
                      </span>
                    </div>
                    <div className="bg-zinc-800/60 rounded-xl p-4 text-center">
                      <p className="text-zinc-500 text-xs mb-1">Competition</p>
                      <p className="text-white text-xl font-bold">{compNum(data.competition)}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block ${
                        data.competition === "Low" ? "bg-green-500/20 text-green-400" : data.competition === "Medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {data.competition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Related keywords preview */}
                <div>
                  <p className="text-xs text-zinc-500 mb-4">Keywords that are related to your searched keyword or phrase</p>
                  <div className="mb-3">
                    <div className="grid grid-cols-3 text-xs text-zinc-500 font-medium px-3 py-2 border-b border-zinc-800">
                      <span>Keyword</span>
                      <span className="text-right">Search volume</span>
                      <span className="text-right">Overall</span>
                    </div>
                    {relatedRows.slice(1, 4).map((row, i) => (
                      <div key={i} className="grid grid-cols-3 items-center px-3 py-2.5 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <span className="text-sm text-white font-medium truncate">{row.keyword}</span>
                        <span className="text-sm text-zinc-300 text-right">{typeof row.searchVolume === "number" ? row.searchVolume.toLocaleString() : row.searchVolume}</span>
                        <span className="text-right"><ScoreChip score={row.overall} /></span>
                      </div>
                    ))}
                  </div>
                  {/* Search Intent */}
                  <div className="bg-zinc-800/40 rounded-xl p-4 mt-4">
                    <p className="text-xs font-semibold text-zinc-400 mb-1">Search Intent</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{data.searchIntent}</p>
                  </div>
                </div>
              </div>

              {/* Competitor tip */}
              <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-xs font-semibold mb-1">⚡ How to Outrank Competitors</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{data.competitorTip}</p>
              </div>

              {/* Content angles */}
              {data.contentAngles?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-zinc-400 mb-3">Content Angles</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.contentAngles.map((ca, i) => (
                      <div key={i} className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-3">
                        <p className="text-white text-sm font-medium mb-1">{ca.angle}</p>
                        <p className="text-zinc-500 text-xs">{ca.hook}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Keywords Tab */}
          {kwTab === "related" && (
            <div>
              <div className="px-6 py-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold text-sm">Related keywords</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Keywords that are related to your searched keyword or phrase</p>
              </div>
              <KwTable rows={relatedRows} showRelated onCopy={copy} copied={copied} />
            </div>
          )}

          {/* Matching Terms Tab */}
          {kwTab === "matching" && (
            <div>
              <div className="px-6 py-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold text-sm">Matching keywords</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Keywords that contain your searched keyword or phrase in any order</p>
              </div>
              <KwTable rows={matchingRows} showWhy onCopy={copy} copied={copied} />
            </div>
          )}

          {/* Questions Tab */}
          {kwTab === "questions" && (
            <div>
              <div className="px-6 py-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold text-sm">Questions</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Question type keywords that contain your searched keyword or phrase</p>
              </div>
              <KwTable rows={questionRows} onCopy={copy} copied={copied} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function parseVolume(v: string): number {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  if (v.toLowerCase().includes("m")) return Math.round(n * 1_000_000);
  if (v.toLowerCase().includes("k")) return Math.round(n * 1_000);
  return Math.round(n) || 0;
}

function parseVolumeNum(v: string): number { return parseVolume(v); }

function compNum(c: string): number {
  const lower = (c || "").toLowerCase();
  if (lower.includes("very low")) return 8;
  if (lower === "low") return 20;
  if (lower === "medium") return 50;
  return 80;
}

function estimateVolume(difficulty: string): number {
  if (difficulty === "Easy") return Math.floor(2000 + Math.random() * 12000);
  if (difficulty === "Medium") return Math.floor(10000 + Math.random() * 40000);
  return Math.floor(40000 + Math.random() * 100000);
}

// ─── SEO Client ──────────────────────────────────────────────────────────────

export function SEOClient({ userId }: { userId: string }) {
  const [tab, setTab] = useLocalState<Tab>("ct_seo_tab", "keywords");

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

// ─── Shared copy hook ────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState("");
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }
  return { copied, copy };
}

// ─── Title Generator ─────────────────────────────────────────────────────────

function TitleGenerator({ userId }: { userId: string }) {
  const [topic, setTopic] = useLocalState("ct_seo_title_topic", "");
  const [keyword, setKeyword] = useLocalState("ct_seo_title_keyword", "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useLocalState<TitleData | null>("ct_seo_title_data", null);
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
                  <ScoreChip score={t.score} />
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
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Title Tips
              </h3>
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

// ─── Description Generator ────────────────────────────────────────────────────

function DescriptionGenerator({ userId }: { userId: string }) {
  const [title, setTitle] = useLocalState("ct_seo_desc_title", "");
  const [keywords, setKeywords] = useLocalState("ct_seo_desc_keywords", "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useLocalState<DescriptionData | null>("ct_seo_desc_data", null);
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
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Video Description
              </h3>
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
              <h3 className="text-white font-semibold">Tags</h3>
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
              <h3 className="text-white font-semibold">Hashtags</h3>
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

// ─── Shared UI helpers ────────────────────────────────────────────────────────

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

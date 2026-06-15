"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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

interface Props {
  userId: string;
  userName: string;
  existingBlueprint: Blueprint | null;
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

        <div className="space-y-6">
          <BlueprintCard index={0} icon={BpIcons.niche} title="Your Niche" content={blueprint.niche} />
          <BlueprintCard index={1} icon={BpIcons.audience} title="Target Audience" content={blueprint.targetAudience} />
          <BlueprintCard index={2} icon={BpIcons.pillars} title="Content Pillars" content={blueprint.contentPillars} isList />
          <BlueprintCard index={3} icon={BpIcons.voice} title="Brand Voice" content={blueprint.brandVoice} />
          <BlueprintCard index={4} icon={BpIcons.formats} title="Video Formats" content={blueprint.videoFormats} isList />
          <BlueprintCard index={5} icon={BpIcons.schedule} title="Posting Schedule" content={blueprint.postingSchedule} />
          <BlueprintCard index={6} icon={BpIcons.roadmap} title="90-Day Growth Roadmap" content={blueprint.growthRoadmap} large />
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
            <button
              onClick={generateBlueprint}
              className="btn-secondary text-sm"
            >
              Regenerate Blueprint
            </button>
          </div>
        </motion.div>
      </div>
    </div>
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

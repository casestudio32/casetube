"use client";

import { useState, useEffect } from "react";
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
          <BlueprintCard
            index={0}
            icon="🎯"
            title="Your Niche"
            content={blueprint.niche}
          />
          <BlueprintCard
            index={1}
            icon="👥"
            title="Target Audience"
            content={blueprint.targetAudience}
          />
          <BlueprintCard
            index={2}
            icon="🏛️"
            title="Content Pillars"
            content={blueprint.contentPillars}
            isList
          />
          <BlueprintCard
            index={3}
            icon="🎙️"
            title="Brand Voice"
            content={blueprint.brandVoice}
          />
          <BlueprintCard
            index={4}
            icon="🎬"
            title="Video Formats"
            content={blueprint.videoFormats}
            isList
          />
          <BlueprintCard
            index={5}
            icon="📅"
            title="Posting Schedule"
            content={blueprint.postingSchedule}
          />
          <BlueprintCard
            index={6}
            icon="🗺️"
            title="90-Day Growth Roadmap"
            content={blueprint.growthRoadmap}
            large
          />
          <BlueprintCard
            index={7}
            icon="💰"
            title="Monetization Strategy"
            content={blueprint.monetization}
            large
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlueprintCard
              index={8}
              icon="⚠️"
              title="Potential Weaknesses"
              content={blueprint.weaknesses}
            />
            <BlueprintCard
              index={9}
              icon="⚡"
              title="Your Advantages"
              content={blueprint.advantages}
            />
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
  icon: string;
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
        <span className="text-2xl">{icon}</span>
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

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface OnboardingData {
  country: string;
  experience: string;
  channelUrl: string;
  channelDesc: string;
  goals: string[];
  availableHours: number;
  skills: string[];
  interests: string[];
  brandType: string;
  editingAbility: string;
  budget: string;
}

const EMPTY: OnboardingData = {
  country: "",
  experience: "",
  channelUrl: "",
  channelDesc: "",
  goals: [],
  availableHours: 5,
  skills: [],
  interests: [],
  brandType: "",
  editingAbility: "",
  budget: "",
};

const GOALS = [
  "Make money from YouTube",
  "Build a personal brand",
  "Grow a business / sell products",
  "Educate or inspire others",
  "Become a full-time creator",
  "Build an audience for a niche",
  "Create a faceless channel",
  "Express my creativity",
];

const SKILLS = [
  "Writing", "Storytelling", "Research", "Teaching",
  "Comedy / Entertainment", "Design", "Marketing", "Public Speaking",
  "Video Editing", "Animation", "Music / Audio", "Programming",
];

const INTERESTS = [
  "Finance & Investing", "Health & Fitness", "Technology", "Gaming",
  "Travel", "Food & Cooking", "Education", "Business & Entrepreneurship",
  "Lifestyle", "Beauty & Fashion", "Sports", "Music", "Movies & TV",
  "Self Improvement", "Parenting", "Politics & News",
];

const COUNTRIES = [
  "Nigeria", "United States", "United Kingdom", "Canada", "Australia",
  "India", "Ghana", "South Africa", "Kenya", "Germany", "France",
  "Brazil", "Philippines", "Other",
];

export function OnboardingFlow({ userName, userId }: { userName: string; userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const totalSteps = data.experience === "existing" ? 8 : 7;

  function next() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function back() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function toggle(field: "goals" | "skills" | "interests", value: string) {
    setData((d) => ({
      ...d,
      [field]: d[field].includes(value)
        ? d[field].filter((v) => v !== value)
        : [...d[field], value],
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
      });
      if (res.ok) {
        router.push("/blueprint");
      }
    } catch {
      setLoading(false);
    }
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  const progress = ((step + 1) / (totalSteps + 1)) * 100;

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-white">
            Case<span className="text-red-500">Tube</span>
          </span>
          <span className="text-sm text-zinc-500">Step {step + 1} of {totalSteps + 1}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 0 && <StepWelcome name={userName} onNext={next} />}
            {step === 1 && (
              <StepCountry data={data} setData={setData} onNext={next} onBack={back} />
            )}
            {step === 2 && (
              <StepExperience data={data} setData={setData} onNext={next} onBack={back} />
            )}
            {step === 3 && data.experience === "existing" && (
              <StepChannel data={data} setData={setData} onNext={next} onBack={back} />
            )}
            {step === (data.experience === "existing" ? 4 : 3) && (
              <StepGoals data={data} toggle={(v) => toggle("goals", v)} onNext={next} onBack={back} />
            )}
            {step === (data.experience === "existing" ? 5 : 4) && (
              <StepTime data={data} setData={setData} onNext={next} onBack={back} />
            )}
            {step === (data.experience === "existing" ? 6 : 5) && (
              <StepSkillsInterests data={data} toggle={toggle} onNext={next} onBack={back} />
            )}
            {step === (data.experience === "existing" ? 7 : 6) && (
              <StepBrandStyle data={data} setData={setData} onNext={next} onBack={back} />
            )}
            {step === (data.experience === "existing" ? 8 : 7) && (
              <StepReview data={data} loading={loading} onSubmit={handleSubmit} onBack={back} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Step Components ────────────────────────────────────────────────

function StepWelcome({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="text-5xl mb-6">👋</div>
      <h1 className="text-3xl font-bold text-white mb-3">
        Welcome, {name.split(" ")[0]}!
      </h1>
      <p className="text-zinc-400 mb-8 leading-relaxed">
        Let&apos;s take 2 minutes to learn about you. At the end, our AI will generate
        a personalized Creator Blueprint — your complete YouTube growth strategy.
      </p>
      <button onClick={onNext} className="btn-primary w-full">
        Let&apos;s Build My Blueprint →
      </button>
    </div>
  );
}

function StepCountry({
  data, setData, onNext, onBack,
}: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>>; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="step-title">Where are you based?</h2>
      <p className="step-sub">This helps us tailor your niche and monetization strategy.</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {COUNTRIES.map((c) => (
          <button
            key={c}
            onClick={() => setData((d) => ({ ...d, country: c }))}
            className={`choice-btn ${data.country === c ? "choice-active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.country} />
    </div>
  );
}

function StepExperience({
  data, setData, onNext, onBack,
}: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>>; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="step-title">What&apos;s your YouTube experience?</h2>
      <p className="step-sub">Be honest — there&apos;s no wrong answer.</p>
      <div className="space-y-3 mb-8">
        {[
          { value: "beginner", label: "Complete Beginner", desc: "I haven't started yet or have very few videos" },
          { value: "existing", label: "Existing Creator", desc: "I already have a channel with videos" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setData((d) => ({ ...d, experience: opt.value }))}
            className={`w-full text-left p-5 rounded-xl border transition-all ${
              data.experience === opt.value
                ? "border-red-500 bg-red-500/10"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
            }`}
          >
            <div className="text-white font-semibold">{opt.label}</div>
            <div className="text-zinc-400 text-sm mt-1">{opt.desc}</div>
          </button>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.experience} />
    </div>
  );
}

function StepChannel({
  data, setData, onNext, onBack,
}: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>>; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="step-title">Tell us about your channel</h2>
      <p className="step-sub">Share your channel link or describe what it&apos;s about.</p>
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-zinc-400 text-sm block mb-2">YouTube Channel URL (optional)</label>
          <input
            type="url"
            value={data.channelUrl}
            onChange={(e) => setData((d) => ({ ...d, channelUrl: e.target.value }))}
            placeholder="https://youtube.com/@yourchannel"
            className="input-field"
          />
        </div>
        <div>
          <label className="text-zinc-400 text-sm block mb-2">Describe your channel</label>
          <textarea
            value={data.channelDesc}
            onChange={(e) => setData((d) => ({ ...d, channelDesc: e.target.value }))}
            placeholder="e.g. I make personal finance videos for young Nigerians who want to build wealth..."
            rows={4}
            className="input-field resize-none"
          />
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.channelDesc && !data.channelUrl} />
    </div>
  );
}

function StepGoals({
  data, toggle, onNext, onBack,
}: { data: OnboardingData; toggle: (v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="step-title">What are your goals?</h2>
      <p className="step-sub">Select all that apply.</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {GOALS.map((g) => (
          <button
            key={g}
            onClick={() => toggle(g)}
            className={`choice-btn text-left ${data.goals.includes(g) ? "choice-active" : ""}`}
          >
            {g}
          </button>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={data.goals.length === 0} />
    </div>
  );
}

function StepTime({
  data, setData, onNext, onBack,
}: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>>; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="step-title">How much time can you dedicate?</h2>
      <p className="step-sub">Hours per week you can spend on your YouTube channel.</p>
      <div className="space-y-6 mb-8">
        <div className="text-center">
          <span className="text-5xl font-bold text-white">{data.availableHours}</span>
          <span className="text-zinc-400 ml-2 text-lg">hrs / week</span>
        </div>
        <input
          type="range"
          min={1}
          max={40}
          value={data.availableHours}
          onChange={(e) => setData((d) => ({ ...d, availableHours: Number(e.target.value) }))}
          className="w-full accent-red-500"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>1 hr</span><span>10 hrs</span><span>20 hrs</span><span>40 hrs</span>
        </div>

        <div>
          <p className="text-zinc-400 text-sm mb-3">What&apos;s your monthly budget for the channel?</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "zero", label: "₦0 — Bootstrap" },
              { value: "low", label: "Under $50/mo" },
              { value: "medium", label: "$50–$200/mo" },
              { value: "high", label: "$200+/mo" },
            ].map((b) => (
              <button
                key={b.value}
                onClick={() => setData((d) => ({ ...d, budget: b.value }))}
                className={`choice-btn ${data.budget === b.value ? "choice-active" : ""}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.budget} />
    </div>
  );
}

function StepSkillsInterests({
  data, toggle, onNext, onBack,
}: { data: OnboardingData; toggle: (field: "goals" | "skills" | "interests", v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="step-title">Your skills & interests</h2>
      <p className="step-sub">This shapes your content strategy and niche recommendation.</p>

      <div className="mb-6">
        <p className="text-zinc-400 text-sm mb-3 font-medium">Skills you have</p>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <button
              key={s}
              onClick={() => toggle("skills", s)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                data.skills.includes(s)
                  ? "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-zinc-400 text-sm mb-3 font-medium">Topics you&apos;re interested in</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <button
              key={interest}
              onClick={() => toggle("interests", interest)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                data.interests.includes(interest)
                  ? "bg-red-500/20 border-red-500 text-red-300"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} disabled={data.interests.length === 0} />
    </div>
  );
}

function StepBrandStyle({
  data, setData, onNext, onBack,
}: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>>; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="step-title">What type of creator are you?</h2>
      <p className="step-sub">This shapes your content format and thumbnail style.</p>

      <div className="space-y-3 mb-6">
        {[
          { value: "personal", label: "Personal Brand", desc: "I show my face and build a connection with my audience" },
          { value: "faceless", label: "Faceless Channel", desc: "I prefer to stay behind the camera — voiceover or text-based" },
          { value: "undecided", label: "Not Sure Yet", desc: "Help me decide based on my goals and interests" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setData((d) => ({ ...d, brandType: opt.value }))}
            className={`w-full text-left p-5 rounded-xl border transition-all ${
              data.brandType === opt.value
                ? "border-red-500 bg-red-500/10"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
            }`}
          >
            <div className="text-white font-semibold">{opt.label}</div>
            <div className="text-zinc-400 text-sm mt-1">{opt.desc}</div>
          </button>
        ))}
      </div>

      <div className="mb-8">
        <p className="text-zinc-400 text-sm mb-3 font-medium">Editing ability</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "none", label: "None" },
            { value: "basic", label: "Basic" },
            { value: "advanced", label: "Advanced" },
          ].map((e) => (
            <button
              key={e.value}
              onClick={() => setData((d) => ({ ...d, editingAbility: e.value }))}
              className={`choice-btn ${data.editingAbility === e.value ? "choice-active" : ""}`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.brandType || !data.editingAbility} />
    </div>
  );
}

function StepReview({
  data, loading, onSubmit, onBack,
}: { data: OnboardingData; loading: boolean; onSubmit: () => void; onBack: () => void }) {
  return (
    <div className="text-center">
      <div className="text-5xl mb-6">🚀</div>
      <h2 className="text-3xl font-bold text-white mb-3">You&apos;re all set!</h2>
      <p className="text-zinc-400 mb-8 leading-relaxed">
        Our AI is about to analyze your profile and generate a personalized Creator Blueprint
        — your complete YouTube strategy, niche recommendation, and 90-day growth roadmap.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-left mb-8 space-y-2">
        {data.country && <ReviewRow label="Country" value={data.country} />}
        <ReviewRow label="Experience" value={data.experience === "existing" ? "Existing Creator" : "Beginner"} />
        <ReviewRow label="Goals" value={`${data.goals.length} selected`} />
        <ReviewRow label="Time available" value={`${data.availableHours} hrs/week`} />
        <ReviewRow label="Interests" value={`${data.interests.length} topics`} />
        <ReviewRow label="Brand type" value={data.brandType} />
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="btn-primary w-full mb-4"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving your profile...
          </span>
        ) : (
          "Generate My Creator Blueprint →"
        )}
      </button>
      <button onClick={onBack} className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
        ← Go back
      </button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-white capitalize">{value}</span>
    </div>
  );
}

function NavButtons({ onBack, onNext, disabled }: { onBack: () => void; onNext: () => void; disabled: boolean }) {
  return (
    <div className="flex gap-3">
      <button onClick={onBack} className="btn-secondary flex-1">← Back</button>
      <button onClick={onNext} disabled={disabled} className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
        Continue →
      </button>
    </div>
  );
}

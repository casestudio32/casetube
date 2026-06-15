"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Complete Your Onboarding",
    description:
      "Tell CaseTube about yourself — your goals, experience level, available time, and interests. Takes less than 3 minutes.",
  },
  {
    number: "02",
    title: "Get Your Creator Blueprint",
    description:
      "AI analyzes your profile and generates a personalized niche strategy, content pillars, brand voice, and 90-day growth roadmap.",
  },
  {
    number: "03",
    title: "Research & Plan Your Content",
    description:
      "Use the SEO Center to find winning keywords, research competitors, and identify content gaps you can dominate.",
  },
  {
    number: "04",
    title: "Create With AI Assistance",
    description:
      "Generate hooks, scripts, thumbnails, descriptions, and tags. Every output is tailored to your brand voice and audience.",
  },
  {
    number: "05",
    title: "Publish & Improve",
    description:
      "Track your projects from idea to published. Analyze performance. CaseTube learns and gets smarter with every video.",
  },
];

function StepItem({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-30% 0px -30% 0px" });
  const isLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`flex items-center gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Content side */}
      <motion.div
        className="flex-1"
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0.25, x: isLeft ? -16 : 16 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={`max-w-xs ${isLeft ? "ml-auto text-right pr-10" : "text-left pl-10"}`}>
          <motion.div
            className="text-sm font-bold mb-2"
            animate={{ color: isInView ? "#ef4444" : "#52525b" }}
            transition={{ duration: 0.3 }}
          >
            {step.number}
          </motion.div>
          <motion.h3
            className="text-xl font-semibold mb-2"
            animate={{ color: isInView ? "#ffffff" : "#52525b" }}
            transition={{ duration: 0.3 }}
          >
            {step.title}
          </motion.h3>
          <motion.p
            className="text-sm leading-relaxed"
            animate={{ color: isInView ? "#a1a1aa" : "#3f3f46" }}
            transition={{ duration: 0.3 }}
          >
            {step.description}
          </motion.p>
        </div>
      </motion.div>

      {/* Center dot */}
      <div className="relative flex-shrink-0 flex items-center justify-center w-8">
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          animate={isInView
            ? { opacity: 1, scale: 1, boxShadow: "0 0 0 6px rgba(239,68,68,0.2), 0 0 20px rgba(239,68,68,0.4)" }
            : { opacity: 0, scale: 0.5, boxShadow: "0 0 0 0px rgba(239,68,68,0)" }
          }
          transition={{ duration: 0.4 }}
          style={{ width: 16, height: 16, background: "transparent" }}
        />
        {/* Dot */}
        <motion.div
          className="w-4 h-4 rounded-full border-4 z-10 relative"
          animate={isInView
            ? { backgroundColor: "#ef4444", borderColor: "#080808", scale: 1.2 }
            : { backgroundColor: "#27272a", borderColor: "#080808", scale: 1 }
          }
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Empty opposite side */}
      <div className="flex-1" />
    </div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 20%"],
  });

  // Line grows from 0% to 100% as section scrolls through viewport
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            From zero to consistent
            <br />
            <span className="text-zinc-500">YouTube growth.</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div ref={sectionRef} className="relative hidden md:block">

          {/* Track line (static background) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2" />

          {/* Animated fill line */}
          <motion.div
            className="absolute left-1/2 top-0 w-px bg-white origin-top -translate-x-1/2"
            style={{ height: lineHeight, opacity: 0.25 }}
          />

          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, i) => (
              <StepItem key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>

        {/* Mobile fallback — simple list */}
        <div className="md:hidden space-y-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                {i < steps.length - 1 && <div className="w-px flex-1 bg-zinc-800 mt-2" />}
              </div>
              <div className="pb-8">
                <div className="text-red-500 text-xs font-bold mb-1">{step.number}</div>
                <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

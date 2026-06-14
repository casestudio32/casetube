"use client";

import { motion } from "framer-motion";

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

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-5xl mx-auto">
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

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  i % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 md:text-right" style={{ textAlign: i % 2 !== 0 ? "left" : undefined }}>
                  <div className="text-red-500 text-sm font-bold mb-2">{step.number}</div>
                  <h3 className="text-white text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-sm ml-auto">
                    {step.description}
                  </p>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex w-4 h-4 rounded-full bg-red-500 border-4 border-[#080808] z-10 flex-shrink-0" />

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

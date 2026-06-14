"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Marcus T.",
    handle: "@marcustech",
    avatar: "M",
    color: "bg-blue-500",
    subs: "12K subscribers",
    text: "I went from 200 to 12,000 subscribers in 6 months using CaseTube's blueprint. The keyword research alone changed everything for me.",
  },
  {
    name: "Aisha K.",
    handle: "@aishacooks",
    avatar: "A",
    color: "bg-orange-500",
    subs: "47K subscribers",
    text: "The script generator saves me 4-5 hours per video. And the thumbnail concepts are actually creative — not generic AI garbage.",
  },
  {
    name: "David R.",
    handle: "@davidfinance",
    avatar: "D",
    color: "bg-green-500",
    subs: "8K subscribers",
    text: "As a beginner I had no idea what niche to pick. The Creator Blueprint gave me a complete strategy in minutes. Game changer.",
  },
  {
    name: "Sofia M.",
    handle: "@sofiavlogs",
    avatar: "S",
    color: "bg-purple-500",
    subs: "31K subscribers",
    text: "The competitor analyzer showed me exactly what was working in my niche and where the gaps were. I built my entire content plan around it.",
  },
  {
    name: "James O.",
    handle: "@jamesfitness",
    avatar: "J",
    color: "bg-red-500",
    subs: "5K subscribers",
    text: "Finally a tool that understands YouTube creators. Not just another ChatGPT wrapper. This is purpose-built and it shows.",
  },
  {
    name: "Priya N.",
    handle: "@priyatech",
    avatar: "P",
    color: "bg-cyan-500",
    subs: "22K subscribers",
    text: "The retention engine caught 3 drop-off points in my script before I even filmed. My average view duration went up 40% that month.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Creator Stories
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Creators are growing.
            <br />
            <span className="text-zinc-500">Faster than ever.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.handle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-zinc-500 text-xs">{t.handle} · {t.subs}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

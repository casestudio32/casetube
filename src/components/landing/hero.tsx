"use client";

import { motion, type Easing } from "framer-motion";
import Link from "next/link";

const ease: Easing = "easeOut";
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-40">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-red-900/10 rounded-full blur-[80px]" />
      </div>

      {/* Badge */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-6 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-2 rounded-full"
      >
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        The AI Operating System for YouTube Creators
      </motion.div>

      {/* Headline */}
      <motion.h1
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl"
      >
        Grow Your YouTube
        <br />
        Channel with{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
          AI Precision
        </span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
      >
        Research keywords, generate scripts, design thumbnails, analyze competitors,
        and plan your content — all in one place. Like having an entire YouTube
        growth team working for you 24/7.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          href="/signup"
          className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
        >
          Get My Free Blueprint →
        </Link>
        <a
          href="#how-it-works"
          className="w-full sm:w-auto border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
        >
          See How It Works
        </a>
      </motion.div>

      {/* Social proof */}
      <motion.p
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-6 text-sm text-zinc-600"
      >
        Free to start · No credit card required · Setup in 2 minutes
      </motion.p>

      {/* Stats */}
      <motion.div
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-20 grid grid-cols-3 gap-8 md:gap-16 border-t border-zinc-800 pt-10"
      >
        {[
          { value: "10+", label: "AI Tools" },
          { value: "∞", label: "Content Ideas" },
          { value: "1", label: "Platform" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function MonetizationCTA() {
  return (
    <section className="relative w-full bg-[#080808] py-20 px-8 md:px-16 lg:px-24 overflow-hidden">

      {/* Subtle red glow behind image */}
      <div className="absolute right-0 top-0 w-[50%] h-full bg-red-900/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-xl"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.08] mb-6">
            Grow your channel<br />faster than ever.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-md">
            CaseTube gives you a personalised AI roadmap — real keyword data, daily content ideas, competitor intel, and a full video workflow. Everything a YouTube creator needs, in one place.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-base px-8 py-4 rounded-full transition-colors"
          >
            Get Started Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </motion.div>

        {/* Right — image + 2 floating cards */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex-1 relative flex justify-center items-end min-h-[420px] md:min-h-[500px]"
        >
          {/* Person */}
          <div className="relative h-[420px] md:h-[500px] w-[320px] md:w-[400px]">
            <Image
              src="/Images/Man.png"
              alt="Creator using CaseTube"
              fill
              className="object-contain object-bottom"
              sizes="400px"
            />
          </div>

          {/* Card 1 — Subscribers — top left */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="absolute top-[6%] -left-4 md:left-4 bg-zinc-900/95 border border-zinc-700/60 rounded-2xl px-5 py-4 min-w-[180px] shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <span className="text-zinc-400 text-xs font-medium">Subscribers</span>
            </div>
            <p className="text-white text-base font-bold">
              12,400 <span className="text-zinc-500 font-normal text-sm">/ 25K</span>
            </p>
            <div className="mt-2.5 h-1.5 bg-zinc-700 rounded-full overflow-hidden w-40">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: "50%" }} />
            </div>
          </motion.div>

          {/* Card 2 — Watch Hours — bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute bottom-[12%] -right-4 md:right-0 bg-zinc-900/95 border border-zinc-700/60 rounded-2xl px-5 py-4 min-w-[190px] shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-zinc-400 text-xs font-medium">Watch Hours</span>
            </div>
            <p className="text-white text-base font-bold">
              3,820 <span className="text-zinc-500 font-normal text-sm">/ 4,000</span>
            </p>
            <div className="mt-2.5 h-1.5 bg-zinc-700 rounded-full overflow-hidden w-40">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }} />
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}

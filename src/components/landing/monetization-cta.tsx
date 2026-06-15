"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const glassCard = {
  background: "rgba(20, 20, 25, 0.65)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
};

export function MonetizationCTA() {
  return (
    <section className="relative w-full bg-[#080808] overflow-hidden">
      <div
        className="max-w-7xl mx-auto flex items-center px-8 md:px-16 lg:px-24"
        style={{ minHeight: "480px" }}
      >

        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center py-16 z-10"
          style={{ flex: "0 0 52%" }}
        >
          <h2 className="text-5xl font-black text-white leading-[1.08] mb-5">
            Grow your channel faster<br />than ever.
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md">
            CaseTube gives you a personalised AI roadmap — real keyword data, daily content ideas, competitor intel, and a full video workflow. Everything a YouTube creator needs, in one place.
          </p>
          <div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
            >
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Right — fixed-width container, image + cards */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
          style={{ flex: "0 0 48%", height: "480px" }}
        >
          {/* Person — contained, bottom-aligned, fixed width so position is predictable */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: "340px", height: "440px" }}>
            <Image
              src="/Images/Man.png"
              alt="Creator using CaseTube"
              fill
              className="object-contain object-bottom"
              sizes="340px"
            />
            {/* Bottom fade */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{ height: "100px", background: "linear-gradient(to top, #080808 15%, transparent)" }}
            />
          </div>

          {/* Card 1 — Subscribers — left side, at shoulder height (~30% down) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="absolute z-20 rounded-2xl px-4 py-3.5"
            style={{ top: "22%", left: "0%", minWidth: "175px", ...glassCard }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <span className="text-zinc-300 text-xs font-medium">Subscribers</span>
            </div>
            <p className="text-white text-[15px] font-bold leading-none mb-2.5">
              12,400<span className="text-zinc-500 font-normal text-xs ml-1">/ 25K</span>
            </p>
            <div className="h-[3px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: "50%" }} />
            </div>
          </motion.div>

          {/* Card 2 — Watch Hours — right side, at hand/phone height (~55% down) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute z-20 rounded-2xl px-4 py-3.5"
            style={{ top: "52%", right: "0%", minWidth: "175px", ...glassCard }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-zinc-300 text-xs font-medium">Watch Hours</span>
            </div>
            <p className="text-white text-[15px] font-bold leading-none mb-2.5">
              6,000<span className="text-zinc-500 font-normal text-xs ml-1">/ 4,000</span>
            </p>
            <div className="h-[3px] rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

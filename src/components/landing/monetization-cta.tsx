"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const FLOAT_CARDS = [
  {
    top: "12%",
    left: "-4%",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      </svg>
    ),
    label: "Subscribers",
    value: "12,400",
    target: "/ 25,000",
    bar: 50,
    color: "#818cf8",
  },
  {
    top: "58%",
    left: "8%",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    label: "Avg Views",
    value: "48,200",
    target: "↑ 34% this month",
    bar: 74,
    color: "#34d399",
  },
];

export function MonetizationCTA() {
  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">

          {/* Subtle glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-10 px-10 py-16 md:py-20">

            {/* Left — copy */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1 max-w-lg"
            >
              <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-5">
                Start Growing Today
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6">
                Grow your channel
                <br />
                <span className="text-zinc-500">faster than ever.</span>
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md">
                CaseTube gives you a personalised AI roadmap — real keyword data, daily content ideas, competitor intel, and a full video workflow. Everything a YouTube creator needs, in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors"
                >
                  Get Started Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors"
                >
                  See all features
                </Link>
              </div>
              <p className="text-zinc-600 text-xs mt-4">No credit card required · Free forever plan available</p>
            </motion.div>

            {/* Right — image + floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1 relative flex justify-center items-end min-h-[380px] md:min-h-[460px] w-full"
            >
              {/* Person image */}
              <div className="relative h-[360px] md:h-[440px] w-[280px] md:w-[340px]">
                <Image
                  src="/Images/Man with Phone.png"
                  alt="Creator using CaseTube"
                  fill
                  className="object-contain object-bottom"
                  sizes="340px"
                />
              </div>

              {/* Floating card — top left */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute top-[8%] -left-2 md:left-0 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-xl px-4 py-3 min-w-[160px] shadow-xl"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                  <span className="text-zinc-400 text-xs">Subscribers</span>
                </div>
                <p className="text-white text-sm font-bold">
                  12,400 <span className="text-zinc-500 font-normal text-xs">/ 25K</span>
                </p>
                <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden w-36">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "50%" }} />
                </div>
              </motion.div>

              {/* Floating card — bottom right */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="absolute bottom-[10%] -right-2 md:right-0 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-xl px-4 py-3 min-w-[170px] shadow-xl"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                  </svg>
                  <span className="text-zinc-400 text-xs">Avg Views</span>
                </div>
                <p className="text-white text-sm font-bold">48,200</p>
                <p className="text-emerald-400 text-xs mt-0.5">↑ 34% this month</p>
              </motion.div>

              {/* Floating card — mid right */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute top-[42%] -right-4 md:-right-6 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-xl px-4 py-3 min-w-[150px] shadow-xl"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <span className="text-zinc-400 text-xs">Keyword Score</span>
                </div>
                <p className="text-white text-sm font-bold">94 <span className="text-emerald-400 text-xs font-normal">· Rising</span></p>
                <p className="text-zinc-500 text-xs mt-0.5">"ai tools 2025"</p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-500/20 rounded-3xl p-12 text-center relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-red-600/5 rounded-3xl" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/10 rounded-full blur-[60px]" />

        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to grow your channel?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Join creators who are using AI to research smarter, create faster, and grow consistently.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded-xl text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
          >
            Get My Free Blueprint →
          </Link>
          <p className="text-zinc-600 text-sm mt-4">
            Free to start · No credit card required
          </p>
        </div>
      </motion.div>
    </section>
  );
}

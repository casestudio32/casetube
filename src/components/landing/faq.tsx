"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Do I need a YouTube channel to use CaseTube?",
    a: "No. CaseTube is perfect for complete beginners. Our Creator Blueprint will help you find your niche, build your strategy, and launch your channel from scratch.",
  },
  {
    q: "How is CaseTube different from ChatGPT?",
    a: "ChatGPT is a general-purpose tool. CaseTube is purpose-built for YouTube creators. Every tool, prompt, and workflow is specifically designed to help you grow on YouTube — not write emails or code.",
  },
  {
    q: "Will the AI content sound like me?",
    a: "Yes. CaseTube builds a Creator Memory profile that stores your brand voice, audience, niche, and style. The longer you use it, the more personalized every output becomes.",
  },
  {
    q: "How is CaseTube different from VidIQ or TubeBuddy?",
    a: "VidIQ and TubeBuddy are primarily analytics and keyword tools. CaseTube is a full content creation system — from strategy to script to thumbnail. Think of it as your AI YouTube team, not just a research tool.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no lock-ins. Cancel anytime from your account settings. Your data is yours.",
  },
  {
    q: "What AI model does CaseTube use?",
    a: "CaseTube uses multiple best-in-class AI models and routes requests to the fastest, most capable option available. We're provider-agnostic so you always get the best performance.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-white font-medium pr-8">{q}</span>
        <span className={`text-red-500 text-xl transition-transform flex-shrink-0 ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-zinc-400 text-sm pb-5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Common questions.
          </h2>
        </motion.div>

        <div>
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

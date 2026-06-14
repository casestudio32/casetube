"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for getting started and testing the platform.",
    features: [
      "Creator Blueprint (1)",
      "SEO Research (10 searches/mo)",
      "Content Studio (5 generations/mo)",
      "1 Active Project",
      "Basic Keyword Research",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Creator",
    price: "$19",
    period: "per month",
    description: "For serious creators who publish consistently.",
    features: [
      "Everything in Starter",
      "Unlimited SEO Research",
      "Unlimited AI Generations",
      "Unlimited Projects",
      "Competitor Analyzer",
      "Thumbnail Engine",
      "Retention Engine",
      "Creator Memory",
      "Priority AI Speed",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$49",
    period: "per month",
    description: "For agencies and creators managing multiple channels.",
    features: [
      "Everything in Creator",
      "Up to 5 Channel Profiles",
      "Team Collaboration",
      "White-label Reports",
      "YouTube API Analytics",
      "Dedicated Support",
    ],
    cta: "Coming Soon",
    href: "/signup",
    highlight: false,
    comingSoon: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-zinc-400">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`rounded-2xl p-8 border relative ${
                plan.highlight
                  ? "bg-red-600/10 border-red-500/50 scale-105"
                  : "bg-zinc-900/50 border-zinc-800"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm mb-1">/{plan.period}</span>
                </div>
                <p className="text-zinc-400 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-red-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center font-semibold py-3 rounded-xl transition-colors text-sm ${
                  plan.comingSoon
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed pointer-events-none"
                    : plan.highlight
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

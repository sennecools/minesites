"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, Zap, Shield, Globe, Clock, Server } from "lucide-react";
import { useState } from "react";

// Fun button with click effect for popular plan
function FunButton({
  children,
  href,
  className = ""
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    setParticles(newParticles);
    setIsPressed(true);

    setTimeout(() => setParticles([]), 600);
    setTimeout(() => setIsPressed(false), 150);

    // Navigate after animation plays
    setTimeout(() => {
      window.location.href = href;
    }, 300);
  };

  return (
    <Link href={href} onClick={handleClick}>
      <motion.button
        animate={isPressed ? { scale: [1, 0.95, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.15 } }}
        className={`relative overflow-visible ${className}`}
      >
        {children}
        <AnimatePresence>
          {particles.map((particle, i) => (
            <motion.span
              key={particle.id}
              initial={{ opacity: 1, scale: 0, x: particle.x - 4, y: particle.y - 4 }}
              animate={{
                opacity: 0,
                scale: 1,
                x: particle.x + (Math.cos(i * 45 * Math.PI / 180) * 50) - 4,
                y: particle.y + (Math.sin(i * 45 * Math.PI / 180) * 50) - 4,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute w-2 h-2 rounded-full bg-white pointer-events-none z-50"
              style={{ boxShadow: "0 0 6px 2px rgba(255,255,255,0.8)" }}
            />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {isPressed && (
            <motion.span
              initial={{ opacity: 0.4, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-xl bg-white/30 pointer-events-none z-40"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </Link>
  );
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Get started with the basics",
    features: [
      "1 server site",
      "Basic templates",
      "minesites.net subdomain",
      "Live player count",
      "Community support",
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Starter",
    price: "$5",
    period: "/month",
    description: "For growing servers",
    features: [
      "3 server sites",
      "All templates",
      "Custom subdomain",
      "Remove MineSites branding",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get started",
    href: "/signup?plan=starter",
  },
  {
    name: "Pro",
    price: "$10",
    period: "/month",
    description: "For serious server owners",
    popular: true,
    features: [
      "10 server sites",
      "All templates + early access",
      "Custom domain",
      "Advanced analytics",
      "Custom CSS",
      "Priority support",
      "Discord widget",
      "Announcements",
    ],
    cta: "Get started",
    href: "/signup?plan=pro",
  },
  {
    name: "Network",
    price: "$25",
    period: "/month",
    description: "For networks and communities",
    features: [
      "Unlimited server sites",
      "Everything in Pro",
      "White-label branding",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "Team members",
      "SLA guarantee",
    ],
    cta: "Get started",
    href: "/signup?plan=network",
  },
];

const includedFeatures = [
  { icon: Shield, label: "SSL certificate" },
  { icon: Globe, label: "Fast global CDN" },
  { icon: Zap, label: "Automatic updates" },
  { icon: Clock, label: "99.9% uptime" },
  { icon: Server, label: "DDoS protection" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 via-white to-white" />

        {/* Animated blobs */}
        <motion.div
          className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-1/4 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/3 w-72 h-72 bg-violet-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.span>
            Simple pricing
          </motion.span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
            Start free and upgrade as your server grows. All plans include SSL and fast hosting.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.2 }
              }}
              className={`relative flex flex-col rounded-2xl p-6 bg-white border transition-shadow ${
                plan.popular
                  ? "border-cyan-500 shadow-lg shadow-cyan-100"
                  : "border-zinc-200 hover:shadow-xl hover:shadow-zinc-200/50"
              }`}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 inset-x-0 flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs font-semibold shadow-lg"
                    animate={{
                      boxShadow: [
                        "0 10px 15px -3px rgba(6, 182, 212, 0.3)",
                        "0 10px 25px -3px rgba(6, 182, 212, 0.5)",
                        "0 10px 15px -3px rgba(6, 182, 212, 0.3)",
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Most popular
                  </motion.span>
                </motion.div>
              )}

              <div className="mb-6 pt-2">
                <h3 className="text-lg font-semibold text-zinc-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <motion.span
                    className="font-display text-5xl font-extrabold text-zinc-900"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {plan.price}
                  </motion.span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-zinc-500">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + featureIndex * 0.05 + 0.3 }}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5"
                      whileHover={{ scale: 1.2, backgroundColor: "rgb(34 211 238 / 0.3)" }}
                    >
                      <Check className="w-3 h-3 text-cyan-600" />
                    </motion.div>
                    <span className="text-sm text-zinc-600">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {plan.popular ? (
                <FunButton
                  href={plan.href}
                  className="w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 group bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-200/50"
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </FunButton>
              ) : (
                <Link href={plan.href}>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 group bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200 transition-colors duration-150"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* All plans include */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-20 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-zinc-900 mb-8">
            All plans include
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {includedFeatures.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="text-cyan-500"
                >
                  <item.icon className="w-4 h-4" />
                </motion.div>
                <span className="text-sm text-zinc-600 font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-zinc-50 to-cyan-50/30 text-center border border-zinc-100"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h3 className="font-semibold text-zinc-900 mb-2">Have questions?</h3>
            <p className="text-zinc-500 mb-4">
              We&apos;re here to help you choose the right plan for your server.
            </p>
          </motion.div>
          <Link href="/support">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-sm font-medium hover:border-cyan-300 hover:shadow-md transition-all"
            >
              Contact support
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

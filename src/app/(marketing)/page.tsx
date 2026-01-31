"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  Globe,
  ArrowRight,
  Users,
  Activity,
  Copy,
  MessageCircle,
  Link2,
  Smartphone,
  Layers,
  Palette,
  Rocket,
  ChevronDown,
  Zap,
  BarChart3,
  Image,
  Bell,
  Sparkles,
  Shield,
  MousePointer2,
} from "lucide-react";

// Fun button with click effect
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

    // Create particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    setParticles(newParticles);
    setIsPressed(true);

    // Clear particles after animation
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

        {/* Particle burst effect */}
        <AnimatePresence>
          {particles.map((particle, i) => (
            <motion.span
              key={particle.id}
              initial={{
                opacity: 1,
                scale: 0,
                x: particle.x - 4,
                y: particle.y - 4,
              }}
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

        {/* Ripple glow */}
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

const steps = [
  { icon: Layers, title: "Pick a template", desc: "Choose from designs made for servers", gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", color: "#06b6d4", bg: "from-cyan-50 to-sky-50", border: "border-cyan-200" },
  { icon: Palette, title: "Make it yours", desc: "Add your info, colors, and images", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", color: "#8b5cf6", bg: "from-violet-50 to-purple-50", border: "border-violet-200" },
  { icon: Rocket, title: "Go live", desc: "Publish to your free subdomain", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#10b981", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200" },
];

function StepsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "center center"]
  });


  return (
    <section ref={ref} className="relative py-24">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Live in three steps
          </h2>
        </motion.div>

        {/* Progress line - simple loading bar */}
        <div className="hidden md:block relative h-1.5 bg-zinc-200 rounded-full mb-12 mx-16 overflow-hidden">
          {/* Filled progress */}
          <motion.div
            style={{ width: useTransform(scrollYProgress, [0, 0.7], ["0%", "100%"]) }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
          />
          {/* Subtle glow at the leading edge */}
          <motion.div
            style={{ left: useTransform(scrollYProgress, [0, 0.7], ["0%", "100%"]) }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-4 bg-emerald-400/50 blur-md rounded-full"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0.5, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4 }}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${step.bg} border ${step.border} hover:shadow-xl transition-all group cursor-pointer`}
            >
              {/* Step number badge */}
              <div
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shadow-sm"
                style={{ borderColor: step.color }}
              >
                <span className="text-sm font-bold" style={{ color: step.color }}>
                  {i + 1}
                </span>
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: step.gradient }}
              >
                <step.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{step.title}</h3>
              <p className="text-zinc-500 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  // Mouse position for parallax - tracks across entire page
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  // Scroll-based animation for the dragged element
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Transform scroll to animate the dragged hero element into the drop zone
  // Animation happens between 0-20% scroll (much faster)
  const draggedX = useTransform(scrollYProgress, [0, 0.15, 0.2], [60, 10, 0]);
  const draggedY = useTransform(scrollYProgress, [0, 0.15, 0.2], [0, 140, 175]);
  const draggedScale = useTransform(scrollYProgress, [0, 0.17, 0.2], [1, 1, 0.8]);
  const draggedRotate = useTransform(scrollYProgress, [0, 0.15, 0.2], [-2, 0, 0]);
  const cursorOpacity = useTransform(scrollYProgress, [0, 0.15, 0.18], [1, 1, 0]);
  const droppedOpacity = useTransform(scrollYProgress, [0, 0.18, 0.2], [0, 0, 1]);
  const draggedOpacity = useTransform(scrollYProgress, [0, 0.17, 0.2], [1, 1, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePosition({ x, y });
  };

  return (
    <div className="bg-white" onMouseMove={handleMouseMove}>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-emerald-50" />

        {/* Animated decorative blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-[5%] w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-6"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                />
                Now in public beta
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="block"
                >
                  Websites for
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 block"
                >
                  Minecraft servers
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-lg text-zinc-600 max-w-lg leading-relaxed"
              >
                Create a stunning landing page for your server in minutes.
                No coding needed. Just drag, drop, and publish.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <FunButton
                  href="/signup"
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium hover:shadow-xl hover:shadow-cyan-200/50 flex items-center gap-2 transition-shadow duration-150"
                >
                  Start for free
                  <span className="group-hover:translate-x-1 transition-transform duration-150">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </FunButton>
                <Link href="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl bg-white text-zinc-700 font-medium border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors duration-150"
                  >
                    View pricing
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex items-center gap-4 text-sm text-zinc-500"
              >
                <span>Free tier available</span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span>No credit card</span>
              </motion.div>
            </motion.div>

            {/* Right - 3D Parallax Website Builder */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
              style={{ perspective: "1000px" }}
            >
              {/* Website Canvas - Light themed */}
              <motion.div
                animate={{
                  rotateY: mousePosition.x * 6,
                  rotateX: mousePosition.y * -6,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="rounded-2xl overflow-hidden shadow-2xl shadow-zinc-300/50 border border-zinc-200 bg-white"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 border-b border-zinc-100">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-5 rounded bg-white border border-zinc-200 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-500">epiccraft.minesites.net</span>
                    </div>
                  </div>
                </div>

                {/* Light Minecraft server website */}
                <div className="p-4 min-h-[280px] bg-gradient-to-b from-emerald-50 to-white">
                  {/* Nav */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-cyan-500" />
                      <span className="text-xs font-bold text-zinc-800">EpicCraft</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-zinc-500">
                      <span>Home</span>
                      <span>Store</span>
                      <span>Vote</span>
                    </div>
                  </div>

                  {/* Hero */}
                  <div className="rounded-xl bg-white border border-zinc-100 shadow-sm p-4 mb-3 text-center">
                    <div className="text-sm font-bold text-zinc-800 mb-1">Welcome to EpicCraft</div>
                    <div className="text-[10px] text-zinc-500 mb-2">The best survival experience</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-[10px] text-white font-medium">
                      play.epiccraft.net
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-lg bg-white border border-zinc-100 p-2 text-center">
                      <div className="text-sm font-bold text-emerald-600">247</div>
                      <div className="text-[8px] text-zinc-400">online</div>
                    </div>
                    <div className="rounded-lg bg-white border border-zinc-100 p-2 text-center">
                      <div className="text-sm font-bold text-zinc-700">1.20</div>
                      <div className="text-[8px] text-zinc-400">version</div>
                    </div>
                    <div className="rounded-lg bg-white border border-zinc-100 p-2 text-center">
                      <div className="text-sm font-bold text-cyan-600">15k</div>
                      <div className="text-[8px] text-zinc-400">players</div>
                    </div>
                  </div>

                  {/* Drop zone - shows empty state or dropped component */}
                  <div className="relative h-16">
                    {/* Empty drop zone */}
                    <motion.div
                      style={{ opacity: useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0]) }}
                      className="absolute inset-0 rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50/50 flex items-center justify-center gap-2"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-5 h-5 rounded border-2 border-dashed border-cyan-400 flex items-center justify-center"
                      >
                        <span className="text-cyan-500 text-xs">+</span>
                      </motion.div>
                      <span className="text-[11px] text-cyan-600">Drop component here</span>
                    </motion.div>

                    {/* Dropped Hero component - matches the dragged one */}
                    <motion.div
                      style={{ opacity: droppedOpacity }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-100 to-emerald-100 p-3 text-center"
                    >
                      <div className="w-20 h-2 bg-zinc-300 rounded mx-auto mb-1.5" />
                      <div className="w-14 h-1.5 bg-zinc-200 rounded mx-auto mb-2" />
                      <div className="w-16 h-4 bg-emerald-400 rounded-lg mx-auto" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Block - Discord Widget */}
              <motion.div
                animate={{
                  x: mousePosition.x * 40,
                  y: mousePosition.y * 40,
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                className="absolute -right-16 top-8"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-xl bg-white shadow-lg border border-zinc-200 p-3"
                >
                  <div className="text-[9px] font-medium text-zinc-400 mb-2">Discord</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-zinc-700">Join us</div>
                      <div className="text-[9px] text-zinc-400">1.2k online</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Block - Feature Cards */}
              <motion.div
                animate={{
                  x: mousePosition.x * 30,
                  y: mousePosition.y * 30,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="absolute -left-20 top-16"
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="rounded-xl bg-white shadow-lg border border-zinc-200 p-3"
                >
                  <div className="text-[9px] font-medium text-zinc-400 mb-2">Features</div>
                  <div className="flex gap-1.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-violet-600" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Block - Copy IP */}
              <motion.div
                animate={{
                  x: mousePosition.x * 35,
                  y: mousePosition.y * 35,
                }}
                transition={{ type: "spring", stiffness: 130, damping: 16 }}
                className="absolute -left-12 bottom-8"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="rounded-xl bg-white shadow-lg border border-zinc-200 p-3"
                >
                  <div className="text-[9px] font-medium text-zinc-400 mb-2">Copy IP</div>
                  <div className="flex items-center gap-1.5">
                    <div className="px-2 py-1 rounded bg-zinc-100 text-[9px] font-mono text-zinc-600">
                      play.mc.net
                    </div>
                    <div className="w-5 h-5 rounded bg-cyan-500 flex items-center justify-center">
                      <Copy className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Block - Screenshots */}
              <motion.div
                animate={{
                  x: mousePosition.x * 25,
                  y: mousePosition.y * 25,
                }}
                transition={{ type: "spring", stiffness: 140, damping: 17 }}
                className="absolute right-4 top-1/2"
              >
                <motion.div
                  animate={{ y: [0, 7, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="rounded-xl bg-white shadow-lg border border-zinc-200 p-3"
                >
                  <div className="text-[9px] font-medium text-zinc-400 mb-2">Screenshots</div>
                  <div className="flex gap-1">
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-emerald-200 to-cyan-200" />
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200 to-orange-200" />
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-violet-200 to-purple-200" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Cursor dragging Hero Section - animates on scroll into drop zone */}
              <motion.div
                animate={{
                  x: mousePosition.x * 20,
                  y: mousePosition.y * 20,
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                className="absolute left-1/2 -translate-x-1/2 top-8 z-10"
              >
                <motion.div
                  style={{
                    x: draggedX,
                    y: draggedY,
                    scale: draggedScale,
                    rotate: draggedRotate,
                    opacity: draggedOpacity,
                  }}
                >
                  <motion.div className="relative">
                    <motion.div className="rounded-xl bg-white shadow-xl border-2 border-cyan-400 p-3 w-36">
                      <div className="text-[9px] font-medium text-zinc-400 mb-2">Hero Section</div>
                      <div className="rounded-lg bg-gradient-to-r from-cyan-100 to-emerald-100 p-2 text-center">
                        <div className="w-14 h-1.5 bg-zinc-300 rounded mx-auto mb-1" />
                        <div className="w-10 h-1 bg-zinc-200 rounded mx-auto mb-1.5" />
                        <div className="w-12 h-3 bg-emerald-400 rounded mx-auto" />
                      </div>
                    </motion.div>
                    {/* Cursor - positioned on top of the card */}
                    <motion.div
                      style={{ opacity: cursorOpacity }}
                      className="absolute -top-1 left-6"
                    >
                      <MousePointer2 className="w-5 h-5 text-zinc-700 fill-white drop-shadow-md" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-zinc-400">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <StepsSection />

      {/* Features */}
      <section className="relative py-24 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-4"
            >
              Features
            </motion.span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Everything your server needs
            </h2>
            <p className="mt-4 text-zinc-500 max-w-xl mx-auto">
              From live stats to custom branding, we've got the tools to make your server stand out
            </p>
          </motion.div>

          {/* Main features - larger cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-emerald-50 border border-cyan-100 cursor-pointer transition-shadow hover:shadow-xl"
            >
              <motion.div
                whileHover={{ rotate: -10, scale: 1.1 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mb-4"
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="font-display text-xl font-bold text-zinc-900 mb-2">Live Server Stats</h3>
              <p className="text-zinc-600 mb-4">Real-time player count, server status, and version info. Automatically syncs with your Minecraft server every minute.</p>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Player count</span>
                <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> Online status</span>
                <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Auto-sync</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 cursor-pointer transition-shadow hover:shadow-xl"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4"
              >
                <Palette className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="font-display text-xl font-bold text-zinc-900 mb-2">Full Customization</h3>
              <p className="text-zinc-600 mb-4">Drag-and-drop editor with custom colors, fonts, and layouts. Make your site match your server's unique style.</p>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1"><Image className="w-4 h-4" /> Custom images</span>
                <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Themes</span>
                <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> Layouts</span>
              </div>
            </motion.div>
          </div>

          {/* Secondary features - smaller cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Copy IP", desc: "One-click copy button for your server address", icon: Copy, gradient: "from-amber-500 to-orange-500" },
              { title: "Discord Widget", desc: "Show your community Discord server", icon: MessageCircle, gradient: "from-indigo-500 to-blue-500" },
              { title: "Custom Domain", desc: "Use your own domain or free subdomain", icon: Link2, gradient: "from-emerald-500 to-teal-500" },
              { title: "Mobile Ready", desc: "Responsive design for all devices", icon: Smartphone, gradient: "from-rose-500 to-pink-500" },
              { title: "Fast & Secure", desc: "SSL included, lightning fast hosting", icon: Shield, gradient: "from-cyan-500 to-blue-500" },
              { title: "Announcements", desc: "Post news and updates for players", icon: Bell, gradient: "from-purple-500 to-violet-500" },
              { title: "SEO Optimized", desc: "Get found on Google easily", icon: Globe, gradient: "from-teal-500 to-cyan-500" },
              { title: "Analytics", desc: "Track visitors and page views", icon: BarChart3, gradient: "from-orange-500 to-red-500" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ y: -5, scale: 1.03, transition: { duration: 0.15 } }}
                className="group p-4 rounded-xl bg-white border border-zinc-200/50 cursor-pointer hover:shadow-lg hover:border-zinc-300"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-150`}
                >
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-900 text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-zinc-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-900"
            >
              Ready to get started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-zinc-500"
            >
              Create your server's website in minutes. Free forever.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <FunButton
                href="/signup"
                className="group px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium hover:shadow-xl hover:shadow-cyan-200/50 inline-flex items-center gap-2 transition-shadow duration-150"
              >
                Start building
                <span className="group-hover:translate-x-1 transition-transform duration-150">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </FunButton>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

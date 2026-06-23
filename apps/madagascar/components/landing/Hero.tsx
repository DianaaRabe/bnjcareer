"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";

// ─── Animated dot grid for the CTA button ─────────────────────────────────────
function DotGrid() {
  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-[2px]">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] w-[3px] rounded-full bg-black/80"
        />
      ))}
    </div>
  );
}

// ─── Scale lines (thin decorative border frame) ────────────────────────────────
function ScaleLines() {
  return (
    <>
      {/* Top */}
      <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {/* Bottom */}
      <div className="pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {/* Left */}
      <div className="pointer-events-none absolute bottom-8 left-0 top-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      {/* Right */}
      <div className="pointer-events-none absolute bottom-8 right-0 top-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
    </>
  );
}

export function Hero() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black"
    >
      {/* Background image with mask/vignette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Scale lines */}
      <ScaleLines />

      {/* Content anchored to bottom */}
      <div className="relative z-10 mt-auto px-6 pb-16 pt-40 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Votre carrière
            <br />
            <span className="text-yellow-400">commence ici</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg"
          >
            La plateforme d'accompagnement qui centralise les offres d'emploi,
            optimise votre CV, et connecte les talents malgaches aux meilleures
            opportunités locales et internationales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            {/* Primary CTA with animated dot grid */}
            <a
              href="/signup"
              className="group relative inline-flex items-center gap-3 text-sm font-bold text-black transition-colors"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.span
                className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-400"
                animate={{
                  rotate: isHovered ? 90 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <DotGrid />
              </motion.span>
              <span className="rounded-md bg-yellow-400 px-5 py-2.5 transition-all group-hover:bg-yellow-300">
                Commencer gratuitement
              </span>
            </a>

            {/* Secondary CTA */}
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              Découvrir les fonctionnalités
              <span aria-hidden="true">&rarr;</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

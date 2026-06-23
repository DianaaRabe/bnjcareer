"use client";

import { motion } from "motion/react";
import Image from "next/image";

// ─── Gradient line decoration ─────────────────────────────────────────────────
function GradientLines({ position }: { position: "top" | "bottom" }) {
  const placement = position === "top" ? "top-0" : "bottom-0";
  return (
    <div className={`absolute left-0 right-0 ${placement} pointer-events-none`}>
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #7c3aed 25%, #6366f1 50%, #38bdf8 75%, transparent 100%)",
          opacity: 0.6,
        }}
      />
      <div
        className="mt-px h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, #6366f1 35%, #7c3aed 60%, transparent 90%)",
          opacity: 0.4,
        }}
      />
      <div
        className="mt-px h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 20%, #38bdf8 45%, #6366f1 70%, transparent 100%)",
          opacity: 0.25,
        }}
      />
    </div>
  );
}

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-gray-900 py-20 sm:py-28">
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/noise.svg')",
          backgroundRepeat: "repeat",
          opacity: 0.1,
          maskImage:
            "radial-gradient(ellipse at center, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 50%, transparent 100%)",
        }}
      />

      {/* Gradient border lines */}
      <GradientLines position="top" />
      <GradientLines position="bottom" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Prêt à transformer
              <br />
              votre avenir
              <br />
              <span className="text-yellow-400">professionnel ?</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-300">
              Rejoignez des milliers de candidats malgaches qui ont déjà boosté
              leur employabilité. Accédez aux offres, optimisez votre CV et
              connectez-vous avec des coachs certifiés.
            </p>
            <a
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20"
            >
              Rejoindre la plateforme
              <span aria-hidden="true">+</span>
            </a>
          </motion.div>

          {/* Right: staggered product images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex items-center justify-center gap-4 lg:justify-end"
          >
            {/* Card 1 */}
            <div className="relative w-56 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 shadow-2xl backdrop-blur-sm sm:w-64">
              <div className="p-4">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-yellow-400">
                  Tableau de bord
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-neutral-700/60" />
                  <div className="h-3 w-4/5 rounded bg-neutral-700/60" />
                  <div className="h-3 w-3/5 rounded bg-neutral-700/60" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-16 w-1/2 rounded-lg bg-yellow-400/10" />
                  <div className="h-16 w-1/2 rounded-lg bg-indigo-400/10" />
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="h-2.5 w-full rounded bg-neutral-700/40" />
                  <div className="h-2.5 w-3/4 rounded bg-neutral-700/40" />
                </div>
              </div>
            </div>

            {/* Card 2 (offset down) */}
            <div className="relative mt-12 w-48 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 shadow-2xl backdrop-blur-sm sm:mt-20 sm:w-56">
              <div className="p-4">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Score CV
                </div>
                <div className="flex items-center justify-center py-6">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-400/30">
                    <span className="text-2xl font-black text-yellow-400">
                      87
                    </span>
                    <span className="absolute -bottom-1 text-[10px] font-medium text-neutral-400">
                      /100
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded bg-green-500/40" />
                    <span className="text-[10px] text-neutral-500">ATS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-4/5 rounded bg-yellow-400/40" />
                    <span className="text-[10px] text-neutral-500">Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-3/5 rounded bg-indigo-400/40" />
                    <span className="text-[10px] text-neutral-500">Visa</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

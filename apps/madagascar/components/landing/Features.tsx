"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import {
  IconBriefcase,
  IconFileDescription,
  IconTargetArrow,
  IconSchool,
  IconMessages,
  IconWorldSearch,
} from "@tabler/icons-react";
import React, { useRef, useCallback } from "react";

// ─── Feature data ─────────────────────────────────────────────────────────────

const features = [
  {
    title: "Agrégateur d'offres d'emploi",
    description:
      "Centralisez les offres d'Indeed, LinkedIn et du Guichet Emplois Canada en un seul endroit. Filtrez, triez et trouvez le poste idéal en quelques clics.",
    icon: IconBriefcase,
    span: "md:col-span-4",
  },
  {
    title: "Optimisation CV & ATS",
    description:
      "Obtenez un CV adapté à chaque offre, optimisé pour les systèmes ATS. Scoring automatique et suggestions d'amélioration en temps réel.",
    icon: IconFileDescription,
    span: "md:col-span-2",
  },
  {
    title: "Matching intelligent",
    description:
      "Notre IA évalue votre adéquation poste-profil et votre éligibilité aux programmes d'immigration (PEQ, PSTQ) pour maximiser vos chances.",
    icon: IconTargetArrow,
    span: "md:col-span-3",
  },
  {
    title: "Formations & Ateliers",
    description:
      "Accédez à des formations certifiantes et à des ateliers pratiques animés par des coachs professionnels pour renforcer vos compétences.",
    icon: IconSchool,
    span: "md:col-span-3",
  },
  {
    title: "Immigration internationale",
    description:
      "Explorez les opportunités à l'international avec un accompagnement dédié : visas de travail, résidence permanente, sponsorship entreprise.",
    icon: IconWorldSearch,
    span: "md:col-span-4",
  },
  {
    title: "Messagerie & Chatbot IA",
    description:
      "Échangez directement avec vos coachs et obtenez des réponses instantanées grâce à notre assistant IA disponible 24h/24.",
    icon: IconMessages,
    span: "md:col-span-2",
  },
];

// ─── Tilt card component ──────────────────────────────────────────────────────

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = feature.icon;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 200, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 30 });

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotateX.set(-py * 10);
      rotateY.set(px * 10);
    },
    [rotateX, rotateY]
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      className={`${feature.span} group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Subtle gradient glow on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(250,204,21,0.08), transparent 40%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
          <Icon size={24} stroke={1.5} />
        </div>
        <h3 className="text-lg font-bold text-white">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-neutral-400">
          {feature.description}
        </p>
      </div>

      {/* Grid lines connecting panels */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent" />
    </motion.div>
  );
}

// ─── Main Features section ────────────────────────────────────────────────────

export function Features() {
  return (
    <section id="features" className="relative bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Tout ce qu'il faut pour{" "}
            <span className="text-yellow-400">booster</span> votre employabilité
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400 sm:text-lg">
            De l'agrégation d'offres à l'optimisation CV, en passant par le
            coaching et l'accompagnement immigration — tout est intégré.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

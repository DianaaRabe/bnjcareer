"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { IconBrandLinkedin, IconPlayerPlayFilled } from "@tabler/icons-react";

// ─── Video data ───────────────────────────────────────────────────────────────

interface VideoSlide {
  /** Local path in /public/videos/ */
  src: string;
  /** Short label shown below the video */
  title: string;
  /** LinkedIn post URL */
  linkedinUrl: string;
}

const slides: VideoSlide[] = [
  {
    src: "/videos/video-1.mp4",
    title: "Comment mieux résumer — BNJ Team Maker",
    linkedinUrl:
      "https://www.linkedin.com/posts/bnjteammaker_comment-mieux-r%C3%A9sumer-bnj-team-maker-activity-7442812609625509888-JMJv?utm_source=share&utm_medium=member_desktop&rcm=ACoAAGODkzUBM9kFD8GFsYxyEcYTOknTTGINOXs",
  },
  {
    src: "/videos/video-2.mp4",
    title: "Le recrutement seul ne suffit plus",
    linkedinUrl:
      "https://www.linkedin.com/posts/bnjteammaker_le-recrutement-seul-ne-suffit-plus-cest-activity-7456970281673396224-34wK?utm_source=share&utm_medium=member_desktop&rcm=ACoAAGODkzUBM9kFD8GFsYxyEcYTOknTTGINOXs",
  },
];

// ─── Single video player ──────────────────────────────────────────────────────

function VideoPlayer({
  slide,
  isActive,
  onEnded,
}: {
  slide: VideoSlide;
  isActive: boolean;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [progress, setProgress] = useState(0);

  // Reset & autoplay when this slide becomes active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().then(() => {
        setIsPlaying(true);
        setShowPlayButton(false);
      }).catch(() => {
        // Autoplay blocked — show play button
        setShowPlayButton(true);
      });
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setShowPlayButton(true);
      setProgress(0);
    }
  }, [isActive]);

  // Track progress for the progress bar
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => {
      setIsPlaying(true);
      setShowPlayButton(false);
    });
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    setShowPlayButton(true);
    setProgress(100);
    onEnded();
  }, [onEnded]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        setShowPlayButton(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
      setShowPlayButton(true);
    }
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-950">
      {/* Video element */}
      <video
        ref={videoRef}
        src={slide.src}
        className="aspect-video w-full object-cover"
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onClick={togglePlayPause}
      />

      {/* Play button overlay */}
      <AnimatePresence>
        {showPlayButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
            aria-label="Lancer la vidéo"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 shadow-xl shadow-yellow-400/20 transition-transform hover:scale-110">
              <IconPlayerPlayFilled size={28} className="ml-1 text-black" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
        <motion.div
          className="h-full bg-yellow-400"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      {/* LinkedIn link — top-right */}
      <a
        href={slide.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-neutral-300 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
      >
        <IconBrandLinkedin size={14} className="text-[#0A66C2]" />
        Voir sur LinkedIn
      </a>
    </div>
  );
}

// ─── Main VideoSlider ─────────────────────────────────────────────────────────

export function VideoSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleVideoEnded = useCallback(() => {
    // Advance to next slide, loop back to first
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section className="relative bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-6 sm:px-12 lg:px-20">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Découvrez <span className="text-yellow-400">notre vision</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-neutral-400">
            Regardez comment nous transformons l'accompagnement à l'emploi à
            Madagascar.
          </p>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          {/* Slides */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              <VideoPlayer
                slide={slides[activeIndex]}
                isActive={true}
                onEnded={handleVideoEnded}
              />
            </motion.div>
          </AnimatePresence>

          {/* Title + dots below video */}
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Video title */}
            <p className="text-sm font-medium text-neutral-400">
              {slides[activeIndex].title}
            </p>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  aria-label={`Aller à la vidéo ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-6 bg-yellow-400"
                      : "w-2 bg-neutral-700 hover:bg-neutral-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

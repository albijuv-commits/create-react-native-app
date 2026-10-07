"use client";

import Image, { type StaticImageData } from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Illustrazione «tattile»: segue il dito o il mouse inclinandosi come un oggetto di argilla,
 * con un riflesso lucido che scorre sulla superficie, e si schiaccia appena quando la tocchi.
 * Si muove solo mentre la persona interagisce; con meno movimento resta ferma.
 */
export function TiltIllustration({
  src,
  alt = "",
  sizes,
  priority,
  maxTilt = 14,
  className,
}: {
  src: StaticImageData;
  /** Vuoto per le immagini decorative */
  alt?: string;
  sizes: string;
  priority?: boolean;
  maxTilt?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 170, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 170, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const glareX = useTransform(sx, [0, 1], ["18%", "82%"]);
  const glareY = useTransform(sy, [0, 1], ["12%", "88%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.55), rgb(255 255 255 / 0) 52%)`;
  const glareOpacity = useMotionValue(0);
  const glareFade = useSpring(glareOpacity, { stiffness: 120, damping: 20 });

  const track = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    glareOpacity.set(1);
  };
  const release = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };
  const mask = `url(${src.src})`;

  return (
    <motion.div
      className={cn("relative touch-pan-y [perspective:900px]", className)}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={release}
      onPointerCancel={release}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
    >
      <motion.div className="relative" style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <Image src={src} alt={alt} sizes={sizes} priority={priority} draggable={false} className="h-auto w-full select-none" />
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              backgroundImage: glare,
              opacity: glareFade,
              WebkitMaskImage: mask,
              maskImage: mask,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

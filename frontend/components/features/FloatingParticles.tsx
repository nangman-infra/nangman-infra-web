"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  PARTICLE_COUNT,
  PARTICLE_SIZE_MIN,
  PARTICLE_SIZE_MAX,
  PARTICLE_DURATION_MIN,
  PARTICLE_DURATION_MAX,
  PARTICLE_OPACITY_MIN,
  PARTICLE_OPACITY_MAX,
} from "@/constants/particles";

interface Particle {
  x: number;
  y: number;
  size: number;
  targetX: number;
  targetY: number;
  duration: number;
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[] | null>(null);

  useEffect(() => {
    // Use requestAnimationFrame to defer state update and avoid setState in effect warning
    // This ensures particles are only generated on client to avoid hydration mismatch
    const frameId = requestAnimationFrame(() => {
      const width = window.innerWidth || DEFAULT_WINDOW_WIDTH;
      const height = window.innerHeight || DEFAULT_WINDOW_HEIGHT;
      
      setParticles(
        Array.from({ length: PARTICLE_COUNT }).map(() => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
          targetX: Math.random() * width,
          targetY: Math.random() * height,
          duration: Math.random() * (PARTICLE_DURATION_MAX - PARTICLE_DURATION_MIN) + PARTICLE_DURATION_MIN,
        }))
      );
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Don't render until particles are generated on client to prevent hydration mismatch
  if (!particles || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-1 pointer-events-none overflow-hidden">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20 blur-sm"
          initial={{
            x: particle.x,
            y: particle.y,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [null, particle.targetY],
            x: [null, particle.targetX],
            opacity: [PARTICLE_OPACITY_MIN, PARTICLE_OPACITY_MAX, PARTICLE_OPACITY_MIN],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}


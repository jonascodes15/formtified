"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";

/**
 * Turns on Motion animations for everything inside it (the app and admin areas).
 * - LazyMotion + `m.*` components keep the download small; domMax adds layout (gliding) animations.
 * - reducedMotion="user" switches movement off for people who turned on "reduce motion".
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={SPRING}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

/** The default spring: quick and settled, with a tiny overshoot (matches ease-spring in globals.css). */
export const SPRING = { type: "spring", stiffness: 520, damping: 38, mass: 0.9 } as const;

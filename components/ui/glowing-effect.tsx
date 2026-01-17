"use client";

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

export const GlowingEffect = ({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  variant = "default",
  glow = false,
  className,
  movementDuration = 2,
  borderWidth = 1,
  disabled = false,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const handleMouseMove = (e: MouseEvent) => {
       if (disabled) return;
       const rect = parent.getBoundingClientRect();
       mouseX.set(e.clientX - rect.left);
       mouseY.set(e.clientY - rect.top);
    };

    parent.addEventListener("mousemove", handleMouseMove);
    return () => {
        parent.removeEventListener("mousemove", handleMouseMove);
    };
  }, [disabled, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        className
      )}
    >
      <motion.div
        className={cn(
          "absolute inset-0 rounded-[inherit] opacity-60",
          variant === "white" && "bg-white",
          variant === "default" && "bg-gradient-to-br from-mc-gold via-yellow-400 to-amber-600"
        )}
         style={{
          maskImage: useMotionTemplate`radial-gradient(${spread}px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(${spread}px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
        }}
      />
    </div>
  );
};

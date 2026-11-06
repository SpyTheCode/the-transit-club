"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (motionPreference.matches || !("IntersectionObserver" in window)) {
      return;
    }

    element.style.setProperty("--reveal-delay", `${delay}ms`);
    element.classList.add("reveal-pending");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.classList.remove("reveal-pending");
          element.classList.add("reveal-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div className={`reveal ${className}`} ref={ref}>
      {children}
    </div>
  );
}

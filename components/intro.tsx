"use client";

import { motion } from "framer-motion";

export function Intro() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="eyebrow">A uniform for the in-between</p>
      <h1 className="hero-title" id="hero-heading">
        Made for
        <br />
        <span>the way there.</span>
      </h1>
      <p className="hero-copy">
        A small collection inspired by the places, people and journeys that
        move us.
      </p>
    </motion.div>
  );
}

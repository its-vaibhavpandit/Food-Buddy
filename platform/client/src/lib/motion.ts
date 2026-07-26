import type { Variants, Transition } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   FAST FOOD BUDDY — MOTION SYSTEM
   
   Centralized animation presets for consistent motion language.
   All components should import from here rather than defining
   inline animation objects.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Transitions ───────────────────────────────────────────── */

export const spring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const easeOut: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};

export const easeInOut: Transition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1],
};

/* ─── Fade Variants ─────────────────────────────────────────── */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Scale Variants ────────────────────────────────────────── */

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const springIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

/* ─── Stagger Container ────────────────────────────────────── */

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

/* ─── Stagger Item ─────────────────────────────────────────── */

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

/* ─── Interaction Variants ──────────────────────────────────── */

export const hoverLift = {
  whileHover: {
    y: -4,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  whileTap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

export const tapScale = {
  whileTap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

export const hoverScale = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/* ─── Page Transition ───────────────────────────────────────── */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/* ─── Drawer / Sheet ────────────────────────────────────────── */

export const drawerSlideRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 35 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

export const drawerSlideLeft: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 35 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

export const drawerSlideBottom: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 35 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/* ─── Modal ─────────────────────────────────────────────────── */

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

/* ─── Image Reveal ──────────────────────────────────────────── */

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Nav Indicator (Shared Layout) ─────────────────────────── */

export const navIndicatorTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

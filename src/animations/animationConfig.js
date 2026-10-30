/**
 * MeeSeva DQMS - Centralized Animation Configuration
 * Provides consistent rhythm, durations, easing curves, and accessibility compliance.
 */

import { cubicBezier } from 'animejs';

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
};

export const ANIMATION_CONFIG = {
  // Standardized duration tiers (in ms)
  duration: {
    instant: 0,
    micro: 150,     // Button clicks, micro-interactions
    fast: 280,      // Quick badge/icon reveals, tab switches
    normal: 450,    // Card expansions, dialogs, form transitions
    slow: 750,      // Page entries, major panel shifts
    cinematic: 1200 // 3D intro camera sync, title choreography
  },

  // High-performance native cubic-bezier easing functions (Anime.js 4.x native)
  easing: {
    smooth: cubicBezier(0.25, 0.1, 0.25, 1),
    outExpo: cubicBezier(0.16, 1, 0.3, 1),
    outBack: cubicBezier(0.2, 1.02, 0.4, 1), // Subtle institutional arrival, no bouncy rubber
    inOutQuad: cubicBezier(0.45, 0, 0.55, 1),
    linear: (t) => t
  },

  // Stagger delays for lists and grids
  stagger: {
    fast: 35,
    normal: 65,
    slow: 110
  }
};

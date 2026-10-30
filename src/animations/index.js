/**
 * MeeSeva DQMS - Animation Subsystem Index
 */

export { anime, createTimeline, cleanupAnimation } from './utils/animeCompat.js';
export { ANIMATION_CONFIG, prefersReducedMotion } from './animationConfig.js';
export {
  fadeIn,
  fadeOut,
  slideIn,
  scaleIn,
  staggerIn,
  textReveal,
  counterAnimation
} from './presets/primitives.js';
export {
  pageEnter,
  pageExit,
  modalEnter,
  modalExit
} from './transitions/pageTransitions.js';
export { createLandingTimeline } from './timelines/landingTimeline.js';
export { useAnime } from './hooks/useAnime.js';

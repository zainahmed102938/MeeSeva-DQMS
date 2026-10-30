/**
 * Universal Anime.js 4.x Wrapper & Safety Utilities
 * Harmonizes API signatures, supports reduced-motion, and guarantees leak-free cleanup.
 */

import { animate, createTimeline as animeCreateTimeline, cleanInlineStyles } from 'animejs';
import { prefersReducedMotion, ANIMATION_CONFIG } from '../animationConfig.js';

/**
 * Universal safe animation caller
 * Accepts both anime(targets, params) and anime({ targets, ...params })
 */
export function anime(targetsOrParams, maybeParams) {
  const isReduced = prefersReducedMotion();

  let targetElements;
  let animParams;

  if (maybeParams !== undefined) {
    targetElements = targetsOrParams;
    animParams = { ...maybeParams };
  } else if (targetsOrParams && typeof targetsOrParams === 'object' && targetsOrParams.targets) {
    const { targets, ...rest } = targetsOrParams;
    targetElements = targets;
    animParams = rest;
  } else {
    targetElements = targetsOrParams;
    animParams = {};
  }

  // Accessibility override: instant duration when user prefers reduced motion
  if (isReduced) {
    animParams.duration = 0;
    animParams.delay = 0;
    // Suppress large translational transforms for vestibular comfort
    delete animParams.translateX;
    delete animParams.translateY;
    delete animParams.translateZ;
    delete animParams.scale;
    delete animParams.rotate;
  }

  if (!animParams.ease && !animParams.easing) {
    animParams.ease = ANIMATION_CONFIG.easing.smooth;
  }

  return animate(targetElements, animParams);
}

/**
 * Universal Timeline Creator with reduced-motion support
 */
export function createTimeline(params = {}) {
  const isReduced = prefersReducedMotion();
  const timelineParams = { ...params };

  if (isReduced) {
    timelineParams.duration = 0;
    timelineParams.delay = 0;
  }

  return animeCreateTimeline(timelineParams);
}

/**
 * Safely stop and cleanup inline styles from animated DOM elements
 */
export function cleanupAnimation(targets) {
  try {
    if (!targets) return;
    cleanInlineStyles(targets);
  } catch (e) {
    // Graceful no-op if element was detached from DOM
  }
}

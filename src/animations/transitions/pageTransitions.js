/**
 * MeeSeva DQMS - Standardized Page and Modal Transitions
 */

import { anime } from '../utils/animeCompat.js';
import { ANIMATION_CONFIG } from '../animationConfig.js';

/**
 * Standard page entrance transition
 */
export const pageEnter = (target, options = {}) => {
  return anime(target, {
    opacity: [0, 1],
    translateY: [15, 0],
    duration: options.duration || ANIMATION_CONFIG.duration.slow,
    ease: options.ease || ANIMATION_CONFIG.easing.outExpo,
    ...options
  });
};

/**
 * Standard page exit transition
 */
export const pageExit = (target, options = {}) => {
  return anime(target, {
    opacity: [1, 0],
    translateY: [0, -10],
    duration: options.duration || ANIMATION_CONFIG.duration.fast,
    ease: options.ease || ANIMATION_CONFIG.easing.smooth,
    ...options
  });
};

/**
 * Dialog / Modal entrance transition
 */
export const modalEnter = (target, options = {}) => {
  return anime(target, {
    opacity: [0, 1],
    scale: [0.94, 1],
    translateY: [20, 0],
    duration: options.duration || ANIMATION_CONFIG.duration.normal,
    ease: options.ease || ANIMATION_CONFIG.easing.outBack,
    ...options
  });
};

/**
 * Dialog / Modal exit transition
 */
export const modalExit = (target, options = {}) => {
  return anime(target, {
    opacity: [1, 0],
    scale: [1, 0.95],
    duration: options.duration || ANIMATION_CONFIG.duration.fast,
    ease: options.ease || ANIMATION_CONFIG.easing.smooth,
    ...options
  });
};

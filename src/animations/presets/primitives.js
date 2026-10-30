/**
 * MeeSeva DQMS - Reusable Animation Primitives
 * Standardized entrance, reveal, and counter animations built on Anime.js.
 */

import { anime } from '../utils/animeCompat.js';
import { ANIMATION_CONFIG } from '../animationConfig.js';

/**
 * Fade an element in
 */
export const fadeIn = (target, options = {}) => {
  return anime(target, {
    opacity: [0, 1],
    duration: options.duration || ANIMATION_CONFIG.duration.normal,
    ease: options.ease || ANIMATION_CONFIG.easing.smooth,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Fade an element out
 */
export const fadeOut = (target, options = {}) => {
  return anime(target, {
    opacity: [1, 0],
    duration: options.duration || ANIMATION_CONFIG.duration.fast,
    ease: options.ease || ANIMATION_CONFIG.easing.smooth,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Slide an element into view from a given direction
 */
export const slideIn = (target, options = {}) => {
  const { direction = 'up', distance = 24, ...rest } = options;
  const translationProp = direction === 'up' || direction === 'down' ? 'translateY' : 'translateX';
  const initialOffset = direction === 'up' ? distance : direction === 'down' ? -distance : direction === 'left' ? distance : -distance;

  return anime(target, {
    opacity: [0, 1],
    [translationProp]: [initialOffset, 0],
    duration: rest.duration || ANIMATION_CONFIG.duration.normal,
    ease: rest.ease || ANIMATION_CONFIG.easing.outExpo,
    delay: rest.delay || 0,
    ...rest
  });
};

/**
 * Scale an element in (pop-in effect for tickets, badges, modals)
 */
export const scaleIn = (target, options = {}) => {
  return anime(target, {
    opacity: [0, 1],
    scale: [0.98, 1],
    duration: options.duration || ANIMATION_CONFIG.duration.fast,
    ease: options.ease || ANIMATION_CONFIG.easing.outExpo,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Stagger entrance for collections of cards, list items, or nodes
 */
export const staggerIn = (targets, options = {}) => {
  const staggerDelay = options.staggerDelay || ANIMATION_CONFIG.stagger.normal;

  return anime(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: options.duration || ANIMATION_CONFIG.duration.normal,
    ease: options.ease || ANIMATION_CONFIG.easing.outExpo,
    delay: (el, i) => (options.delay || 0) + i * staggerDelay,
    ...options
  });
};

/**
 * Text reveal animation (splitting words or letter reveal)
 */
export const textReveal = (target, options = {}) => {
  return anime(target, {
    opacity: [0, 1],
    translateY: [16, 0],
    filter: ['blur(6px)', 'blur(0px)'],
    duration: options.duration || ANIMATION_CONFIG.duration.slow,
    ease: options.ease || ANIMATION_CONFIG.easing.outExpo,
    delay: options.delay || 0,
    ...options
  });
};

/**
 * Mathematical counter animation for queue metrics (People Ahead, Wait Times, Token Numbers)
 * Strictly animates between real database values without generating fake numbers.
 */
export const counterAnimation = (targetObject, propName, fromVal, toVal, options = {}) => {
  targetObject[propName] = fromVal;

  return anime(targetObject, {
    [propName]: toVal,
    duration: options.duration || ANIMATION_CONFIG.duration.slow,
    ease: options.ease || ANIMATION_CONFIG.easing.outExpo,
    round: options.round !== undefined ? options.round : 1, // Whole integers
    onUpdate: options.onUpdate,
    ...options
  });
};

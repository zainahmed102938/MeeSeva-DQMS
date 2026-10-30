/**
 * MeeSeva DQMS - useAnime React Lifecycle Hook
 * Automatically manages Anime.js animation lifecycles and cleanup to prevent memory leaks.
 */

import { useRef, useEffect, useCallback } from 'react';
import { anime, createTimeline, cleanupAnimation } from '../utils/animeCompat.js';

export function useAnime() {
  const activeAnimationsRef = useRef(new Set());
  const activeTimelinesRef = useRef(new Set());
  const animatedElementsRef = useRef(new Set());

  // Safe animate helper that registers with lifecycle tracker
  const safeAnimate = useCallback((targets, params) => {
    const anim = anime(targets, params);
    if (anim) {
      activeAnimationsRef.current.add(anim);
      if (targets instanceof HTMLElement || (Array.isArray(targets) && targets[0] instanceof HTMLElement)) {
        animatedElementsRef.current.add(targets);
      }
    }
    return anim;
  }, []);

  // Safe timeline helper that registers with lifecycle tracker
  const safeTimeline = useCallback((params) => {
    const tl = createTimeline(params);
    if (tl) {
      activeTimelinesRef.current.add(tl);
    }
    return tl;
  }, []);

  // Stop a specific animation or timeline
  const stopAnimation = useCallback((animOrTimeline) => {
    if (!animOrTimeline) return;
    try {
      animOrTimeline.pause?.();
    } catch (e) {
      // Graceful no-op
    }
    activeAnimationsRef.current.delete(animOrTimeline);
    activeTimelinesRef.current.delete(animOrTimeline);
  }, []);

  // Stop all active animations registered in this hook
  const stopAll = useCallback(() => {
    activeAnimationsRef.current.forEach((anim) => {
      try {
        anim.pause?.();
      } catch (e) {}
    });
    activeTimelinesRef.current.forEach((tl) => {
      try {
        tl.pause?.();
      } catch (e) {}
    });
    activeAnimationsRef.current.clear();
    activeTimelinesRef.current.clear();
  }, []);

  // Unmount cleanup: cancel and stop all animations
  useEffect(() => {
    return () => {
      stopAll();
      animatedElementsRef.current.forEach((el) => {
        cleanupAnimation(el);
      });
      animatedElementsRef.current.clear();
    };
  }, [stopAll]);

  return {
    safeAnimate,
    safeTimeline,
    stopAnimation,
    stopAll
  };
}

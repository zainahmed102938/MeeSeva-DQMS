/**
 * MeeSeva DQMS - 4-Scene Cinematic Intro Choreography Timeline (6.5s)
 *
 * Restrained, hardware-accelerated (transform & opacity) 4-scene sequence:
 *   Scene 1 (0ms - 1600ms):    Opening Identity — State Emblem & MeeSeva Civic Tech Reveal
 *   Scene 2 (1600ms - 3400ms): Community & Civic Needs — Coherent representation of civic & citizen issues
 *   Scene 3 (3400ms - 5400ms): Intelligent Coordination — Citizen Report -> Verification -> Multi-Sector Resolution
 *   Scene 4 (5400ms - 6500ms): Seamless Transition — Focus identity & handoff to Split-Screen Login Page
 */

import { stagger } from 'animejs';
import { createTimeline } from '../utils/animeCompat.js';
import { ANIMATION_CONFIG, prefersReducedMotion } from '../animationConfig.js';

export function createLandingTimeline({ targets = {}, sceneProxy, callbacks = {} }) {
  const isReduced = prefersReducedMotion();

  if (isReduced) {
    if (sceneProxy) {
      sceneProxy.particleOpacity = 0.2;
      sceneProxy.nodeScale = 1.0;
      sceneProxy.glowIntensity = 0.35;
    }
    callbacks.onSceneChange?.(4);
    callbacks.onProgress?.(100);
    return {
      duration: 6500,
      pause: () => {},
      revert: () => {},
      completed: true
    };
  }

  const tl = createTimeline({
    onUpdate: (self) => {
      if (typeof self.progress === 'number') {
        const pct = Math.min(100, Math.max(0, Math.floor(self.progress * 100)));
        callbacks.onProgress?.(pct);

        if (pct < 25) {
          callbacks.onSceneChange?.(1);
        } else if (pct < 52) {
          callbacks.onSceneChange?.(2);
        } else if (pct < 83) {
          callbacks.onSceneChange?.(3);
        } else {
          callbacks.onSceneChange?.(4);
        }
      }
    }
  });

  // Legacy proxy compatibility for automated test verification
  if (sceneProxy) {
    tl.add(
      sceneProxy,
      {
        particleOpacity: [0, 0.2],
        nodeScale: [0, 1],
        glowIntensity: [0, 0.35],
        duration: 800,
        ease: ANIMATION_CONFIG.easing.smooth
      },
      0
    );
  }

  // =========================================================================
  // SCENE 1 (0ms - 1600ms): Opening Identity
  // =========================================================================
  if (targets.emblem) {
    tl.add(
      targets.emblem,
      {
        opacity: [0, 1],
        translateY: [-8, 0],
        duration: 500,
        ease: ANIMATION_CONFIG.easing.outExpo
      },
      100
    );
  }

  if (targets.titleChars && targets.titleChars.length > 0) {
    tl.add(
      targets.titleChars,
      {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 500,
        ease: ANIMATION_CONFIG.easing.outExpo
      },
      stagger(22, { start: 250 })
    );
  }

  if (targets.subtitle) {
    tl.add(
      targets.subtitle,
      {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 500,
        ease: ANIMATION_CONFIG.easing.outExpo
      },
      650
    );
  }

  if (targets.telugu) {
    tl.add(
      targets.telugu,
      {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 450,
        ease: ANIMATION_CONFIG.easing.smooth
      },
      900
    );
  }

  if (targets.controls) {
    tl.add(
      targets.controls,
      {
        opacity: [0, 1],
        translateY: [4, 0],
        duration: 400,
        ease: ANIMATION_CONFIG.easing.outExpo
      },
      400
    );
  }

  // =========================================================================
  // SCENE 2 (1600ms - 3400ms): Community & Civic Service Needs
  // =========================================================================
  if (targets.scene2Cards && targets.scene2Cards.length > 0) {
    tl.add(
      targets.scene2Cards,
      {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        ease: ANIMATION_CONFIG.easing.outExpo
      },
      stagger(90, { start: 1600 })
    );
  }

  // =========================================================================
  // SCENE 3 (3400ms - 5400ms): Intelligent Coordination Workflow
  // =========================================================================
  if (targets.scene3Nodes && targets.scene3Nodes.length > 0) {
    tl.add(
      targets.scene3Nodes,
      {
        opacity: [0, 1],
        scale: [0.96, 1],
        duration: 480,
        ease: ANIMATION_CONFIG.easing.outExpo
      },
      stagger(110, { start: 3400 })
    );
  }

  if (targets.telemetryBadges && targets.telemetryBadges.length > 0) {
    tl.add(
      targets.telemetryBadges,
      {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 450,
        ease: ANIMATION_CONFIG.easing.outExpo
      },
      stagger(60, { start: 4200 })
    );
  }

  // =========================================================================
  // SCENE 4 (5400ms - 6500ms): Focus & Seamless Transition to Login
  // =========================================================================
  tl.call(() => {
    callbacks.onTransitionStart?.();
  }, 5600);

  if (targets.overlay) {
    tl.add(
      targets.overlay,
      {
        opacity: [1, 0],
        scale: [1, 0.99],
        duration: 550,
        ease: ANIMATION_CONFIG.easing.smooth
      },
      5850
    );
  }

  tl.call(() => {
    callbacks.onComplete?.();
  }, 6500);

  return tl;
}


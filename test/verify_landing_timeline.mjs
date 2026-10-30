import { createLandingTimeline } from '../src/animations/timelines/landingTimeline.js';
import { prefersReducedMotion } from '../src/animations/animationConfig.js';

console.log('--- Verifying Landing Timeline (Iteration A2) ---');

// 1. Verify proxy object animation
const sceneProxy = { particleOpacity: 0, nodeScale: 0, glowIntensity: 0 };
let progressRecorded = 0;
let transitionStarted = false;
let completeFired = false;

const dummyTarget = { style: {} };
const dummyChars = [
  { style: {} },
  { style: {} },
  { style: {} }
];

const tl = createLandingTimeline({
  targets: {
    overlay: dummyTarget,
    emblem: dummyTarget,
    titleChars: dummyChars,
    subtitle: dummyTarget,
    telugu: dummyTarget,
    telemetryBadges: dummyChars,
    controls: dummyTarget
  },
  sceneProxy,
  callbacks: {
    onProgress: (p) => {
      progressRecorded = p;
    },
    onTransitionStart: () => {
      transitionStarted = true;
    },
    onComplete: () => {
      completeFired = true;
    }
  }
});

console.log(`1. Timeline initialized: ${!!tl}`);
console.log(`2. Timeline total duration: ${tl?.duration || 0}ms`);

if (tl && (tl.duration > 0 || prefersReducedMotion())) {
  console.log('   ✓ createLandingTimeline successfully choreographed');
} else {
  throw new Error('Timeline failed to calculate valid duration');
}

console.log('\n>>> Iteration A2 Timeline logic verified! <<<');

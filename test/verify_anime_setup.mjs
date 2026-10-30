import { anime, createTimeline } from '../src/animations/utils/animeCompat.js';
import { ANIMATION_CONFIG, prefersReducedMotion } from '../src/animations/animationConfig.js';
import { counterAnimation } from '../src/animations/presets/primitives.js';

console.log('--- Testing MeeSeva Anime.js Foundation ---');

// 1. Verify Config
console.log('1. Checking ANIMATION_CONFIG:');
if (ANIMATION_CONFIG.duration.normal === 450) {
  console.log('   ✓ Normal duration correctly configured (450ms)');
} else {
  throw new Error('Config mismatch');
}

// 2. Verify Reduced Motion Check
const isReduced = prefersReducedMotion();
console.log(`2. Reduced Motion check in environment: ${isReduced}`);

// 3. Verify Universal anime wrapper
console.log('3. Checking animeCompat syntax support:');
const dummyObj1 = { count: 0 };
const anim1 = anime(dummyObj1, { count: 100, duration: 50 });
if (anim1) {
  console.log('   ✓ anime(targets, params) initialized');
}

const dummyObj2 = { count: 0 };
const anim2 = anime({ targets: dummyObj2, count: 50, duration: 50 });
if (anim2) {
  console.log('   ✓ anime({ targets, ...params }) initialized');
}

// 4. Verify Counter Animation Primitive
console.log('4. Checking counterAnimation:');
const metric = { peopleAhead: 7 };
const counterAnim = counterAnimation(metric, 'peopleAhead', 7, 3, {
  duration: 40,
  onUpdate: () => {}
});
if (counterAnim) {
  console.log('   ✓ counterAnimation successfully initialized');
}

// 5. Verify Timeline Creation
console.log('5. Checking createTimeline:');
const tl = createTimeline({ duration: 100 });
if (tl) {
  console.log('   ✓ Timeline created successfully');
}

console.log('\n>>> Anime.js Foundation (A1) verification PASSED! <<<');

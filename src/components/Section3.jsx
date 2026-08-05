import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import SpeechBubble from './SpeechBubble.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';

// Per-bubble constants that never change across breakpoints: which quote,
// what color pairing, which side the tail points, and where it sits in the
// staggered reveal order. Array order is DOM order, which is what drives
// screen-reader reading order -- fixed per an explicit request, and it does
// NOT match the visual top-to-bottom/left-to-right order (that's what
// staggerIndex is for, a separate fixed 0-6 sequence for the reveal
// animation's timing, top-to-bottom/left-to-right per the original design
// spec, so reordering this array for reading order doesn't reshuffle it).
// Position (left/top/size) is deliberately NOT here -- see
// POSITIONS_BY_TIER below, since that's the part that actually varies per
// breakpoint; keeping the two concerns in separate objects means adding a
// breakpoint's positions never risks drifting the color/text/tail data out
// of sync between tiers.
const BUBBLE_META = [
  {
    key: 'shoes',
    text: 'I always wear the same shoes',
    bg: 'bg-black-950',
    textColor: 'text-heading-inverted',
    tailSide: 'right',
    staggerIndex: 0,
  },
  {
    key: 'dont-care',
    text: 'I don’t care',
    bg: 'bg-bg-light-green',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 1,
  },
  {
    key: 'teacher-lazy',
    text: 'My teacher said I’m lazy',
    bg: 'bg-bg-white',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 2,
  },
  {
    key: 'play-games',
    text: 'I just want to play games',
    bg: 'bg-bg-white',
    textColor: 'text-heading-default',
    tailSide: 'right',
    staggerIndex: 4,
  },
  {
    key: 'no-money',
    text: 'I have no money',
    bg: 'bg-bg-light-blue',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 6,
  },
  {
    key: 'no-point',
    text: 'There’s no point',
    bg: 'bg-black-950',
    textColor: 'text-heading-inverted',
    tailSide: 'right',
    staggerIndex: 3,
  },
  {
    key: 'enough',
    text: 'Am I enough?',
    bg: 'bg-bg-pink',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 5,
  },
];

// left/top/size per bubble per breakpoint tier, copied directly from the
// Figma dev-mode exports for XS (364x1003 reference frame) and M (528x869),
// in the same coordinate space Figma itself used. "hug" bubbles below have
// no explicit width/height in the source export at all -- true auto-sized
// boxes, not a value we're choosing to omit.
const POSITIONS_XS = {
  shoes: { left: 81.5, top: 0.5, size: { width: 200, height: 200 } },
  'dont-care': { left: 0.5, top: 209, size: { width: 180.5, height: 204.84 } },
  'teacher-lazy': { left: 76, top: 398, size: 'hug' },
  'play-games': { left: 48, top: 506, size: 'hug' },
  'no-money': { left: 0.5, top: 907, size: 'hug' },
  'no-point': { left: 1, top: 591, size: { width: 176.5, height: 303.58 } },
  enough: { left: 187, top: 644, size: { width: 176.5, height: 199.77 } },
};

const POSITIONS_M = {
  shoes: { left: 248, top: 0.5, size: { width: 200, height: 200 } },
  'dont-care': { left: 0, top: 116.5, size: { width: 240, height: 240 } },
  'teacher-lazy': { left: 248, top: 232, size: 'hug' },
  'play-games': { left: 18, top: 389, size: 'hug' },
  'no-money': { left: 98, top: 497, size: 'hug' },
  'no-point': { left: 312, top: 316, size: { width: 200, height: 320 } },
  enough: { left: 164, top: 644.5, size: { width: 200, height: 200 } },
};

// Unchanged from the original desktop-only build -- no separate L export
// was given for this section, so (same as Section 1/2's backgrounds) this
// one dataset just covers the whole merged L/XL range, 992px and up.
// teacher-lazy/play-games keep their fixed-width (not hug) workaround here
// specifically -- see SpeechBubble's own doc comment -- because this is
// the one tier where the PINNED scroll-scrubbed crossfade (below) actually
// swaps their text mid-animation; a hug box would visibly resize at that
// swap. XS/M never do that swap in their own (static) rendering, so hug is
// safe there -- but note the M tier IS also used while pinned (768-992px,
// see isPinned below), where this same resize risk technically still
// applies and isn't compensated for -- Figma's own M export shows hug with
// no fixed width, and there's no measured-safe width to substitute the
// way there was for desktop (its 344/352 were tuned for this tier's own
// 22px heading-3 rendering, not the 18px used everywhere below xl -- see
// index.css). Flagging rather than guessing a number.
const POSITIONS_XL = {
  shoes: { left: 317.5, top: 0.5, size: { width: 200, height: 200 } },
  'dont-care': { left: 69, top: 117, size: { width: 240, height: 240 } },
  'teacher-lazy': { left: 317, top: 232.5, size: { width: 344 } },
  'play-games': { left: 0, top: 389, size: { width: 352 } },
  'no-money': { left: 103.42, top: 529, size: 'hug' },
  'no-point': { left: 381, top: 349, size: { width: 200, height: 320 } },
  enough: { left: 589, top: 409, size: { width: 200, height: 200 } },
};

const POSITIONS_BY_TIER = { xs: POSITIONS_XS, m: POSITIONS_M, xl: POSITIONS_XL };
const CONTAINERS = {
  xs: { width: 364, height: 1003 },
  m: { width: 528, height: 869 },
  xl: { width: 789, height: 693 },
};

function buildBubbles(tier) {
  const positions = POSITIONS_BY_TIER[tier];
  return BUBBLE_META.map((meta) => ({ ...meta, ...positions[meta.key] }));
}

// Each bg/textColor class's underlying color, so the scroll-driven crossfade
// (a MotionValue) has real hex strings to interpolate between -- Framer
// Motion can't animate a CSS class swap, only actual color values. Same
// source tokens as index.css, just duplicated here as literals because
// framer-motion needs them at call time, not as a var() reference.
const BG_HEX = {
  'bg-black-950': '#000000',
  'bg-bg-light-green': '#CFE7CD',
  'bg-bg-white': '#FFFFFF',
  'bg-bg-pink': '#FFE1E3',
  'bg-bg-light-blue': '#C3E2F4',
};
const TEXT_HEX = {
  'text-heading-inverted': '#FFFFFF',
  'text-heading-default': '#3D3D3D',
};
// Scene 2's crossfade target for each BUBBLE is --color-black-900 (#3D3D3D),
// distinct from the SECTION background, which crossfades to true black-950
// (#000000) -- see bg-black-950 on the section/overlay below. Also distinct
// from the two bubbles that start out bg-black-950 in Scene 1 (their real
// Figma-sourced color, unrelated to this crossfade destination).
const TARGET_BG = '#3D3D3D';
const WHITE = '#FFFFFF';

const REVEAL_START = 0;
const REVEAL_END = 0.4;
const REVEAL_FADE_DURATION = 0.15;
// Evenly staggers all 7 bubbles' fade-in windows across [REVEAL_START,
// REVEAL_END] so the last one finishes exactly at REVEAL_END.
const REVEAL_STAGGER_STEP = (REVEAL_END - REVEAL_FADE_DURATION) / (BUBBLE_META.length - 1);

const CROSSFADE_START = 0.4;
const CROSSFADE_END = 0.6;
// The bubble text/background swap to the "Am I enough?" black state is a
// discrete, instant change (not a crossfade of two text layers), per spec.
// It fires at the midpoint of the background crossfade window -- an
// explicit choice, not given directly: the spec ties it to "the same
// threshold" as the 0.4-0.6 background crossfade without naming an exact
// instant within that range, and the midpoint is the natural point since
// the page background is itself halfway between blue and black there.
const SWAP_POINT = 0.5;

function AnimatedBubble({ bubble, index, scrollYProgress, isSwapped }) {
  const revealStart = REVEAL_START + index * REVEAL_STAGGER_STEP;
  const revealEnd = revealStart + REVEAL_FADE_DURATION;
  const opacity = useTransform(scrollYProgress, [revealStart, revealEnd], [0, 1]);
  const y = useTransform(scrollYProgress, [revealStart, revealEnd], [24, 0]);
  const bgColor = useTransform(
    scrollYProgress,
    [CROSSFADE_START, CROSSFADE_END],
    [BG_HEX[bubble.bg], TARGET_BG],
  );
  const textColorValue = useTransform(
    scrollYProgress,
    [CROSSFADE_START, CROSSFADE_END],
    [TEXT_HEX[bubble.textColor], WHITE],
  );

  return (
    <motion.div className="absolute" style={{ left: `${bubble.left}px`, top: `${bubble.top}px`, opacity, y }}>
      <SpeechBubble
        text={isSwapped ? 'Am I enough?' : bubble.text}
        srText={bubble.text}
        size={bubble.size}
        bg={bubble.bg}
        textColor={bubble.textColor}
        tailSide={bubble.tailSide}
        bgColor={bgColor}
        textColorValue={textColorValue}
      />
    </motion.div>
  );
}

export default function Section3() {
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef(null);
  const [isSwapped, setIsSwapped] = useState(false);

  // Three independent breakpoint checks rather than one combined tier
  // state, because the two things they answer are genuinely different
  // questions: `tier` picks WHICH position dataset to render (XS below
  // 640px, M from 640-992px, XL from 992px up -- S has no dataset of
  // its own, it just reuses M, same as the background images), while
  // `isPinned` picks WHETHER the scroll-scrubbed pin interaction runs at
  // all (768px up only, per explicit request -- "keep the stick up to M
  // screen size"). The M tier's own position data straddles that 768px
  // pin boundary: 640-768px renders it statically, 768-992px renders the
  // exact same positions but pinned/animated.
  const isAtLeast640 = useMediaQuery('(min-width: 640px)');
  const isAtLeast768 = useMediaQuery('(min-width: 768px)');
  const isAtLeast992 = useMediaQuery('(min-width: 992px)');
  const tier = isAtLeast992 ? 'xl' : isAtLeast640 ? 'm' : 'xs';
  const isPinned = isAtLeast768 && !prefersReducedMotion;

  const container = CONTAINERS[tier];
  const bubbles = buildBubbles(tier);

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] });

  const bgOverlayOpacity = useTransform(scrollYProgress, [CROSSFADE_START, CROSSFADE_END], [0, 1]);

  // The text/bg swap is genuine content, not a purely visual effect (the
  // paragraph's actual wording changes), so it's driven into real React
  // state rather than left as a MotionValue-only style -- unlike the
  // aria-hidden-toggling mistake made earlier in this project, nothing is
  // removed from the DOM or hidden from accessibility here, just recolored
  // and re-worded while staying mounted and visible throughout. Harmless
  // to still run this when !isPinned -- scrollYProgress just never departs
  // from 0 in that case (wrapperRef's own h-[200vh]/sticky scroll track
  // isn't rendered), so isSwapped never flips and stays unused.
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setIsSwapped(value >= SWAP_POINT);
  });

  if (!isPinned) {
    // Static start-state: below 768px (XS/S -- S reuses the M dataset, same
    // as the backgrounds), OR prefers-reduced-motion at ANY size. Shows
    // every bubble in its ORIGINAL color/text -- the actual "start" of the
    // scroll-driven version below, not the "Am I enough?"/black end state
    // -- collapsing straight to the punchline would skip the real content
    // (each distinct worry) for anyone who can't or won't scroll through
    // the scrubbed reveal to see it unfold. No scroll-pin, no crossfade --
    // just each bubble's own plain ScrollSection fade-up-into-view (itself
    // a no-op under prefers-reduced-motion). No h-dvh here (unlike the pin
    // branch) -- the XS/M containers (1003px/869px tall) can run taller
    // than one viewport, so this is left auto-height/normal document flow
    // (py-page-margin-y -- 64px at S, growing to 96px at xl -- gives it
    // breathing room instead) rather than force-fit into one screen's
    // worth of height, which would clip the bubble stack.
    return (
      <section
        id="section-3"
        className="relative flex w-full flex-col items-center justify-center bg-bg-blue px-page-margin-x py-page-margin-y"
      >
        <div className="relative max-w-full" style={{ width: `${container.width}px`, height: `${container.height}px` }}>
          {bubbles.map((bubble) => (
            <ScrollSection key={bubble.key} className="absolute" style={{ left: `${bubble.left}px`, top: `${bubble.top}px` }}>
              <SpeechBubble text={bubble.text} size={bubble.size} bg={bubble.bg} textColor={bubble.textColor} tailSide={bubble.tailSide} />
            </ScrollSection>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="section-3" ref={wrapperRef} className="relative h-[200vh]">
      {/* No py-page-margin-y here (unlike the static branch above) -- this
          is the "Dvh group" treatment (h-dvh, purely flex-centered, no
          vertical padding fighting that centering), matching every other
          Dvh-group section site-wide. */}
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-bg-blue px-page-margin-x">
        <motion.div
          aria-hidden="true"
          style={{ opacity: bgOverlayOpacity }}
          className="pointer-events-none absolute inset-0 bg-black-950"
        />

        <div className="relative max-w-full" style={{ width: `${container.width}px`, height: `${container.height}px` }}>
          {bubbles.map((bubble) => (
            <AnimatedBubble
              key={bubble.key}
              bubble={bubble}
              index={bubble.staggerIndex}
              scrollYProgress={scrollYProgress}
              isSwapped={isSwapped}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

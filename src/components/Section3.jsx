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
// swap. XS never pins (always static), so its own hug bubbles are safe --
// but M-tier CAN now pin on a tall-enough viewport (see isPinned below,
// gated by height >=1024px there), where this same resize risk technically
// applies to every 'hug' entry in POSITIONS_M and isn't compensated for --
// Figma's own M export shows hug with no fixed width, and there's no
// measured-safe width to substitute the way there was for desktop (its
// 344/352 were tuned for this tier's own 22px heading-3 rendering, not the
// 18px used everywhere below xl -- see index.css). Flagging rather than
// guessing a number.
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

// The bubble canvas is a fixed-size composition of absolutely-positioned
// children (left/top, plus explicit width/height on some) -- exactly the
// kind of layout that overflows once its own container is squeezed
// narrower than its reference width by max-w-full (a real bug: at very
// narrow phones, "enough"/"no-point"'s explicit widths pushed past the
// actual viewport edge, since their pixel positions never adapted to
// the shrunk container). Fixed the same way Section 11's speech-bubble/
// post-it canvas was: convert every left/top/width/height from a literal
// px number to a container-query-width percentage (cqw), relative to
// that TIER's own reference canvas width (CONTAINERS[tier].width) --
// cqw is relative to the nearest ancestor with `container-type:
// inline-size` (set below), so using it for every axis (not just
// horizontal ones) makes the whole composition scale together as one
// unit, preserving every bubble's relative position/size regardless of
// how much the container actually shrinks. At each tier's own reference
// width (the common case, no squeeze), this resolves to the exact same
// pixel values as before -- it only changes anything once max-w-full
// actually kicks in.
function cqw(px, tier) {
  return `${(px / CONTAINERS[tier].width) * 100}cqw`;
}

function scaledSize(size, tier) {
  if (size === 'hug') return 'hug';
  const scaled = { width: cqw(size.width, tier) };
  if (size.height !== undefined) scaled.height = cqw(size.height, tier);
  return scaled;
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

function AnimatedBubble({ bubble, index, scrollYProgress, isSwapped, tier }) {
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
    <motion.div className="absolute" style={{ left: cqw(bubble.left, tier), top: cqw(bubble.top, tier), opacity, y }}>
      <SpeechBubble
        text={isSwapped ? 'Am I enough?' : bubble.text}
        srText={bubble.text}
        size={scaledSize(bubble.size, tier)}
        bg={bubble.bg}
        textColor={bubble.textColor}
        tailSide={bubble.tailSide}
        bgColor={bgColor}
        textColorValue={textColorValue}
      />
    </motion.div>
  );
}

// Static start-state: XS width always (never pins), M width with
// viewport height below 1024px (not enough vertical scroll track for the
// pin to feel good, see Section3's own isPinned comment), OR
// prefers-reduced-motion at ANY size/tier (XL included). Shows every
// bubble in its ORIGINAL color/text -- the actual "start" of the
// scroll-driven version below, not the "Am I enough?"/black end state --
// collapsing straight to the punchline would skip the real content (each
// distinct worry) for anyone who can't or won't scroll through the
// scrubbed reveal to see it unfold. No scroll-pin, no crossfade -- just
// each bubble's own plain ScrollSection fade-up-into-view (itself a
// no-op under prefers-reduced-motion). No h-dvh here (unlike Section3Pinned)
// -- the XS/M containers (1003px/869px tall) can run taller than one
// viewport, so this is left auto-height/normal document flow
// (py-page-margin-y -- 64px at S, growing to 96px at xl -- gives it
// breathing room instead) rather than force-fit into one screen's worth
// of height, which would clip the bubble stack.
function Section3Static({ tier }) {
  const container = CONTAINERS[tier];
  const bubbles = buildBubbles(tier);

  return (
    <section
      id="section-3"
      className="relative flex w-full flex-col items-center justify-center bg-bg-blue px-page-margin-x py-page-margin-y"
    >
      {/* Two nested divs, not one -- an element with container-type
          can't use cqw for its OWN size (that's circular/self-
          referential), so the height has to live on an INNER div
          that queries this OUTER one instead. Collapsing them into a
          single div was a real bug: per spec, cqw on the same element
          that declares container-type falls back to the next
          container context up -- with none available here, that's the
          viewport, not this canvas's own 789px, so the canvas rendered
          far too tall (a Section 3 XL regression from that mistake). */}
      <div className="max-w-full" style={{ width: `${container.width}px`, containerType: 'inline-size' }}>
        <div className="relative w-full" style={{ height: cqw(container.height, tier) }}>
          {bubbles.map((bubble) => (
            <ScrollSection key={bubble.key} className="absolute" style={{ left: cqw(bubble.left, tier), top: cqw(bubble.top, tier) }}>
              <SpeechBubble text={bubble.text} size={scaledSize(bubble.size, tier)} bg={bubble.bg} textColor={bubble.textColor} tailSide={bubble.tailSide} />
            </ScrollSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pinned scroll-scrubbed version -- XL always, M when tall enough (see
// Section3's own isPinned comment). Split into its own component (mounted
// only while isPinned is true) rather than a conditional branch inside
// one shared component, same fix already applied to Section 16's own
// XL/S split: useScroll's internal setup effect only correctly attaches
// if wrapperRef is already populated WHEN THAT EFFECT FIRST RUNS. With
// a single component branching on isPinned internally, wrapperRef is
// created once via useRef and stays the same object across renders --
// so if the page loads on (or live-resizes into) the static branch first,
// then crosses into this one, wrapperRef only gets attached to a DOM
// node well after useScroll's setup effect already ran against null,
// and a plain ref mutation doesn't retrigger that effect. scrollYProgress
// then stays permanently stuck at its initial value, so the whole pinned
// section reads as frozen -- reported live ("when i resize the browser by
// dragging it, section 3 won't scroll past a point"), not reproducible by
// loading fresh at one fixed size (where the correct branch is already
// live before useScroll ever runs). Making this a genuinely separate
// component means crossing the isPinned boundary unmounts the old
// instance and mounts a fresh one, so useScroll always initializes
// against an already-attached ref, exactly like a cold load.
function Section3Pinned({ tier }) {
  const wrapperRef = useRef(null);
  const [isSwapped, setIsSwapped] = useState(false);
  const container = CONTAINERS[tier];
  const bubbles = buildBubbles(tier);

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] });

  const bgOverlayOpacity = useTransform(scrollYProgress, [CROSSFADE_START, CROSSFADE_END], [0, 1]);

  // The text/bg swap is genuine content, not a purely visual effect (the
  // paragraph's actual wording changes), so it's driven into real React
  // state rather than left as a MotionValue-only style -- unlike the
  // aria-hidden-toggling mistake made earlier in this project, nothing is
  // removed from the DOM or hidden from accessibility here, just recolored
  // and re-worded while staying mounted and visible throughout.
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setIsSwapped(value >= SWAP_POINT);
  });

  return (
    <section id="section-3" ref={wrapperRef} className="relative h-[200vh]">
      {/* No py-page-margin-y here (unlike Section3Static above) -- this
          is the "Dvh group" treatment (h-dvh, purely flex-centered, no
          vertical padding fighting that centering), matching every other
          Dvh-group section site-wide. */}
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-bg-blue px-page-margin-x">
        <motion.div
          aria-hidden="true"
          style={{ opacity: bgOverlayOpacity }}
          className="pointer-events-none absolute inset-0 bg-black-950"
        />

        {/* Same two-nested-divs fix as Section3Static above -- see its
            own comment for why the container-type element and the cqw
            height can't be the same div. */}
        <div className="max-w-full" style={{ width: `${container.width}px`, containerType: 'inline-size' }}>
          <div className="relative w-full" style={{ height: cqw(container.height, tier) }}>
            {bubbles.map((bubble) => (
              <AnimatedBubble
                key={bubble.key}
                bubble={bubble}
                index={bubble.staggerIndex}
                scrollYProgress={scrollYProgress}
                isSwapped={isSwapped}
                tier={tier}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Section3() {
  const prefersReducedMotion = useReducedMotion();

  // `tier` picks WHICH position dataset to render, purely by available
  // WIDTH (XS below 640px, M from 640-992px, XL from 992px up -- S has
  // no dataset of its own, it just reuses M, same as the background
  // images). `isPinned` picks WHETHER the scroll-scrubbed pin interaction
  // runs at all, and its rule is tier-dependent rather than one flat
  // width check: XL keeps its original, unconditional pin (that's the
  // established desktop experience, untouched here) -- but M-tier is
  // gated by viewport HEIGHT (>=1024px) instead of always pinning. The
  // pin's scroll track is h-[200vh] with a sticky h-dvh viewport inside,
  // so the actual scrollable distance driving the whole reveal+crossfade
  // is ~100vh -- on a short M-tier viewport (a small tablet in landscape,
  // or a resized browser window) that's too little travel for the
  // animation to read as anything but an instant, jarring snap, so those
  // fall back to the static hugging/stagger layout instead. XS never
  // pins either way, matching its original always-static behavior.
  const isAtLeast640 = useMediaQuery('(min-width: 640px)');
  const isAtLeast992 = useMediaQuery('(min-width: 992px)');
  const isAtLeastHeight1024 = useMediaQuery('(min-height: 1024px)');
  const tier = isAtLeast992 ? 'xl' : isAtLeast640 ? 'm' : 'xs';
  const isPinned = !prefersReducedMotion && (tier === 'xl' || (tier === 'm' && isAtLeastHeight1024));

  return isPinned ? <Section3Pinned tier={tier} /> : <Section3Static tier={tier} />;
}

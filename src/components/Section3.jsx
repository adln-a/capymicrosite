import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import SpeechBubble from './SpeechBubble.jsx';

// Array order here is DOM order, which is what drives screen-reader
// reading order (via each bubble's sr-only text) -- fixed per an explicit
// request, and it does NOT match the visual top-to-bottom/left-to-right
// order. staggerIndex is the separate, fixed 0-6 sequence for the reveal
// animation's timing (top-to-bottom, left-to-right per the original
// design spec), so reordering this array for reading order doesn't also
// reshuffle the fade-in stagger.
const BUBBLES = [
  {
    text: 'I always wear the same shoes',
    left: 317.5,
    top: 0.5,
    size: { width: 200, height: 200 },
    bg: 'bg-black-950',
    textColor: 'text-heading-inverted',
    tailSide: 'right',
    staggerIndex: 0,
  },
  {
    text: 'I don’t care',
    left: 69,
    top: 117,
    size: { width: 240, height: 240 },
    bg: 'bg-bg-light-green',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 1,
  },
  {
    text: 'My teacher said I’m lazy',
    left: 317,
    top: 232.5,
    // Fixed width -- height still hug -- so the box doesn't visibly
    // shrink when Scene 2 swaps the text to the much shorter "Am I
    // enough?". Re-measured at 336.6px natural single-line width (the
    // previous 334.72 was a couple px too narrow, wrapping the text to
    // two lines); bumped to 344px for a safety margin against sub-pixel
    // font-rendering differences across browsers.
    size: { width: 344 },
    bg: 'bg-bg-white',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 2,
  },
  {
    text: 'I just want to play games',
    left: 0,
    top: 389,
    // Same fixed-width-only treatment as "My teacher said I'm lazy" above.
    // Re-measured at 346.5px natural single-line width (was 340.78,
    // wrapping to two lines); bumped to 352px for the same safety margin.
    size: { width: 352 },
    bg: 'bg-bg-white',
    textColor: 'text-heading-default',
    tailSide: 'right',
    staggerIndex: 4,
  },
  {
    text: 'I have no money',
    left: 103.42,
    top: 529,
    size: 'hug',
    bg: 'bg-bg-light-blue',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 6,
  },
  {
    text: 'There’s no point',
    left: 381,
    top: 349,
    size: { width: 200, height: 320 },
    bg: 'bg-black-950',
    textColor: 'text-heading-inverted',
    tailSide: 'right',
    staggerIndex: 3,
  },
  {
    text: 'Am I enough?',
    left: 589,
    top: 409,
    size: { width: 200, height: 200 },
    bg: 'bg-bg-pink',
    textColor: 'text-heading-default',
    tailSide: 'left',
    staggerIndex: 5,
  },
];

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
const REVEAL_STAGGER_STEP = (REVEAL_END - REVEAL_FADE_DURATION) / (BUBBLES.length - 1);

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

  if (prefersReducedMotion) {
    return (
      <section id="section-3" className="relative flex h-dvh w-full items-center justify-center bg-black-950 px-page-margin-x py-3xl">
        <div className="relative h-[693px] w-[789px]">
          {BUBBLES.map((bubble) => (
            <ScrollSection
              key={bubble.text}
              className="absolute"
              style={{ left: `${bubble.left}px`, top: `${bubble.top}px` }}
            >
              <SpeechBubble
                text="Am I enough?"
                srText={bubble.text}
                size={bubble.size}
                bg="bg-bg-black"
                textColor="text-heading-inverted"
                tailSide={bubble.tailSide}
              />
            </ScrollSection>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="section-3" ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-bg-blue px-page-margin-x py-3xl">
        <motion.div
          aria-hidden="true"
          style={{ opacity: bgOverlayOpacity }}
          className="pointer-events-none absolute inset-0 bg-black-950"
        />

        <div className="relative h-[693px] w-[789px]">
          {BUBBLES.map((bubble) => (
            <AnimatedBubble
              key={bubble.text}
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

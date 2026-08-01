import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import greenScribble from '../assets/Green-Scribble.svg';
import speechBubbleWhiteEllipse1 from '../assets/Speech-Bubble-White-Ellipse1.svg';
import speechBubbleWhiteEllipse2 from '../assets/Speech-Bubble-White-Ellipse2.svg';
import speechBubbleWhiteEllipse2Tail1 from '../assets/Speech-Bubble-White-Ellipse2-Tail1.svg';
import speechBubbleWhiteEllipse2Tail2 from '../assets/Speech-Bubble-White-Ellipse2-Tail2.svg';
import postItCircleBlue from '../assets/Group1--Post-It-Circle-Blue.svg';
import postItGreen1 from '../assets/Group1--Post-It-Green.svg';
import postItLightPink from '../assets/Group1--Post-It-Light-Pink.svg';
import postItRed2 from '../assets/Group2--Post-It-Red.svg';
import postItPurple2 from '../assets/Group2--Post-It-Purple.svg';
import postItPurple3 from '../assets/Group3--Post-It-Purple.svg';
import postItWhite3 from '../assets/Group3--Post-It-White.svg';
import postItRedCircle3 from '../assets/Group3--Post-It-Red-Circle.svg';
import postItPink4 from '../assets/Group4--Post-It-Pink.svg';
import postItGreen4 from '../assets/Group4--Post-It-Green.svg';
import postItHeart4 from '../assets/Group4--Post-It-Heart.svg';

// Every left/top/width value below (both the group offsets and each item's
// own image position) is copied directly from the Figma dev-mode export,
// in the SAME nested group-relative coordinate space Figma itself used --
// group.left/top position each group against the 1440px-wide reference
// frame, and each item's own itemLeft/itemTop are relative to ITS group's
// origin, not the page. Each post-it's quote text is drawn directly into
// its own SVG as a vectorized path (not a live DOM text node) -- there's
// no separate text-position data here because there's no separate live
// text to position; `quote` exists purely as the accessible-name string
// (see the img's alt text below), not for rendering. `index` is each
// item's fixed DOM/reading-order position (0-10, left-to-right,
// group-by-group) -- kept as an explicit field rather than relying on
// array order so the shuffled animation rank (see `ranks` below) can
// never accidentally get tied back to DOM order.
//
// NOTE: this is 11 items, not 9 -- the request's four group breakdowns
// list 11 quotes total (3+2+3+3) and there are 11 matching asset files in
// src/assets, so this builds all 11 rather than silently dropping two to
// force a count of 9.
const GROUPS = [
  {
    key: 'group1',
    left: 80,
    top: 50,
    width: 470,
    height: 327,
    items: [
      {
        key: 'bright-future',
        index: 0,
        asset: postItCircleBlue,
        width: 185,
        height: 185,
        itemLeft: 89.38,
        itemTop: 17.56,
        quote: 'I want them to have a bright future.',
      },
      {
        key: 'opportunities',
        index: 1,
        asset: postItGreen1,
        width: 210,
        height: 184,
        itemLeft: 265,
        itemTop: 45.99,
        quote: 'I want to give them more opportunities than I had.',
      },
      {
        key: 'school',
        index: 2,
        asset: postItLightPink,
        width: 190,
        height: 190,
        itemLeft: 23.38,
        itemTop: 137,
        quote: 'I want my kids to do well in school.',
      },
    ],
  },
  {
    key: 'group2',
    left: 80,
    top: 447,
    width: 339,
    height: 273.45,
    items: [
      {
        key: 'fall-behind',
        index: 3,
        asset: postItRed2,
        width: 190,
        height: 190,
        itemLeft: 23.38,
        itemTop: 0,
        quote: 'I worry my kids will fall behind.',
      },
      {
        key: 'keep-up',
        index: 4,
        asset: postItPurple2,
        width: 199,
        height: 196,
        itemLeft: 144.38,
        itemTop: 108,
        quote: 'I worry I can’t keep up.',
      },
    ],
  },
  {
    key: 'group3',
    left: 946,
    top: 50,
    width: 415,
    height: 322,
    items: [
      {
        key: 'energy-left',
        index: 5,
        asset: postItPurple3,
        width: 174,
        height: 174,
        itemLeft: 130.94,
        itemTop: 6.06,
        quote: 'I don’t have the energy left.',
      },
      {
        key: 'tired-shifts',
        index: 6,
        asset: postItWhite3,
        width: 179,
        height: 174,
        itemLeft: 0,
        itemTop: 133.61,
        quote: 'I’m tired from working long shifts.',
      },
      {
        key: 'more-expensive',
        index: 7,
        asset: postItRedCircle3,
        width: 185,
        height: 185,
        itemLeft: 247,
        itemTop: 137,
        quote: 'Things are getting more expensive.',
      },
    ],
  },
  {
    key: 'group4',
    left: 983,
    top: 415.8,
    width: 377,
    height: 305,
    items: [
      {
        key: 'stable-income',
        index: 8,
        asset: postItPink4,
        width: 165,
        height: 165,
        itemLeft: 18.87,
        itemTop: 47,
        quote: 'I need a stable income to pay rent.',
        // Renders in front of stay-strong at their overlap -- a z-index
        // bump rather than a DOM reorder, since DOM/reading order (see
        // `index` above) must stay fixed regardless of visual stacking.
        zIndex: 1,
      },
      {
        key: 'stay-strong',
        index: 9,
        asset: postItGreen4,
        width: 147,
        height: 147,
        itemLeft: 94,
        itemTop: 158.2,
        quote: 'I have to stay strong for my family.',
      },
      {
        key: 'kids-loved',
        index: 10,
        asset: postItHeart4,
        width: 189,
        height: 232,
        itemLeft: 188,
        itemTop: 0,
        quote: 'I want my kids to know they are loved.',
      },
    ],
  },
];

const TOTAL_ITEMS = GROUPS.reduce((sum, g) => sum + g.items.length, 0);

const BUBBLE_START = 0;
const BUBBLE_END = 0.25;
const POSTITS_START = 0.3;
const POSTITS_END = 0.9;
const POSTIT_FADE_DURATION = 0.15;
const POSTIT_STAGGER_STEP = (POSTITS_END - POSTITS_START - POSTIT_FADE_DURATION) / (TOTAL_ITEMS - 1);

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function RealProblemHighlight() {
  // Same span-wrap technique as the other scribble highlights, reusing
  // Green-Scribble.svg (already used for "FOUR" in Section 1) at the same
  // w-full/hug-the-word sizing that asset already uses there, rather than
  // a fixed pixel size.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={greenScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 h-auto w-full max-w-none -translate-x-1/2 -translate-y-1/2"
      />
      <span className="relative">REAL PROBLEM</span>
    </span>
  );
}

function SpeechBubbleContent() {
  return (
    <div className="relative h-[325px] w-[711px]">
      {/* Bubble 1: "But by listening," -- Speech-Bubble-White-Ellipse1.svg
          is 488x140 natively, an exact match for this container, so it's
          just stretched to inset-0 with no distortion. */}
      <div className="absolute left-0 top-0 flex h-[140px] w-[488px] items-center justify-center">
        <img
          src={speechBubbleWhiteEllipse1}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <h2 className="relative heading-2 text-heading-default">But by listening,</h2>
      </div>

      {/* Bubble 2: "we learned what the REAL PROBLEM was." -- built from
          Speech-Bubble-White-Ellipse2.svg (677x186 natively, placed at
          its own natural size, not stretched to the container's full
          241.5 height) plus two separate tail assets that overlap into
          the ellipse's lower portion. Positions are user-confirmed
          pixel values, not measured/estimated. No CSS rotation on the
          tails -- their shape is final as authored. Outer group position
          (relative to bubble 1) is still a separate, deferred task. */}
      <div className="absolute bottom-0 right-0 h-[241.5px] w-[677px]">
        <img
          src={speechBubbleWhiteEllipse2}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0"
          style={{ width: '677px', height: '186px' }}
        />
        <img
          src={speechBubbleWhiteEllipse2Tail1}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ width: '112px', height: '75px', left: '146px', top: '167px' }}
        />
        <img
          src={speechBubbleWhiteEllipse2Tail2}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ width: '45px', height: '42px', left: '404px', bottom: '32.5px' }}
        />
        <div className="absolute left-0 top-0 flex h-[186px] w-[677px] items-center justify-center text-center">
          {/* Plain natural text wrap, not a forced two-line break --
              explicit line breaks read poorly to screen readers, and
              heading-2's own line-height already spaces wrapped lines
              correctly with no extra gap needed. */}
          <h2 className="heading-2 text-heading-default">
            {/* Same VoiceOver nested-"items" issue as Section 5's
                ScribbleHighlight and Section 1's FourHighlight -- same
                fix: aria-hidden the visual run, sr-only carries the one
                flat string assistive tech reads. */}
            <span aria-hidden="true">
              we learned what the <RealProblemHighlight /> was.
            </span>
            <span className="sr-only">we learned what the REAL PROBLEM was.</span>
          </h2>
        </div>
      </div>
    </div>
  );
}

function AnimatedPostIt({ item, scrollYProgress, rank }) {
  const start = POSTITS_START + rank * POSTIT_STAGGER_STEP;
  const end = start + POSTIT_FADE_DURATION;
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [24, 0]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity, y, zIndex: item.zIndex }}>
      <img
        src={item.asset}
        // The quote text is drawn directly into the SVG itself (a
        // vectorized path, not a live DOM text node) -- alt carries it
        // for screen readers instead of aria-hidden, since this is real
        // content, not decoration.
        alt={item.quote}
        // No CSS rotate here -- each post-it's tilt is baked into its own
        // SVG's internal shape transforms, not applied as a wrapper style.
        className="absolute block"
        style={{ width: `${item.width}px`, height: `${item.height}px`, left: `${item.itemLeft}px`, top: `${item.itemTop}px` }}
      />
    </motion.div>
  );
}

export default function Section11() {
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef(null);
  // Shuffled once per mount ("once per session" -- a fresh page load gets
  // a fresh shuffle, but it doesn't re-shuffle on every re-render). ranks[i]
  // is DOM item i's animation rank (0 = animates first ... 10 = last),
  // fully decoupled from `index`, which fixes DOM/reading order.
  const [ranks] = useState(() => shuffle([...Array(TOTAL_ITEMS).keys()]));

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] });

  const bubbleOpacity = useTransform(scrollYProgress, [BUBBLE_START, BUBBLE_END], [0, 1]);
  const bubbleScale = useTransform(scrollYProgress, [BUBBLE_START, BUBBLE_END], [0.8, 1]);

  if (prefersReducedMotion) {
    return (
      <section
        id="section-11"
        className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-bg-yellow"
      >
        <div className="relative h-[800px] w-[1440px] max-w-full">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <SpeechBubbleContent />
          </div>
          {GROUPS.map((group) => (
            <div key={group.key} className="absolute" style={{ left: `${group.left}px`, top: `${group.top}px` }}>
              {group.items.map((item) => (
                <img
                  key={item.key}
                  src={item.asset}
                  alt={item.quote}
                  // max-w-none: this group wrapper has no explicit size
                  // (unlike the animated version's), so Tailwind's
                  // preflight max-width:100% would otherwise clamp every
                  // post-it to 0 width against that undefined containing
                  // block.
                  className="absolute block max-w-none"
                  style={{
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    left: `${item.itemLeft}px`,
                    top: `${item.itemTop}px`,
                    zIndex: item.zIndex,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="section-11" ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-bg-yellow">
        <div className="relative h-[800px] w-[1440px] max-w-full">
          <motion.div
            style={{ opacity: bubbleOpacity, scale: bubbleScale }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <SpeechBubbleContent />
          </motion.div>

          {GROUPS.map((group) => (
            <div
              key={group.key}
              className="absolute"
              style={{ left: `${group.left}px`, top: `${group.top}px`, width: `${group.width}px`, height: `${group.height}px` }}
            >
              {group.items.map((item) => (
                <AnimatedPostIt key={item.key} item={item} scrollYProgress={scrollYProgress} rank={ranks[item.index]} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

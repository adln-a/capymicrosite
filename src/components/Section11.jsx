import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import greenScribble from '../assets/Green-Scribble.svg';
import speechBubbleWhiteEllipse1 from '../assets/Speech-Bubble-White-Ellipse1.svg';
import speechBubbleWhiteEllipse2 from '../assets/Speech-Bubble-White-Ellipse2.svg';
import speechBubbleWhiteEllipse2Tail1 from '../assets/Speech-Bubble-White-Ellipse2-Tail1.svg';
import speechBubbleWhiteEllipse2Tail2 from '../assets/Speech-Bubble-White-Ellipse2-Tail2.svg';
import sSpeechBubbleEllipse1 from '../assets/s/S--Speech-Bubble-White-Ellipse1.svg';
import sSpeechBubbleEllipse2 from '../assets/s/S--Speech-Bubble-White-Ellipse2.svg';
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
        s: { width: 150.81, height: 150.81, left: 97, top: 15.76 },
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
        s: { width: 150.81, height: 150.81, left: 176.5, top: 120 },
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
        s: { width: 150.81, height: 150.81, left: 21, top: 74 },
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
        s: { width: 150.81, height: 150.81, left: 57, top: 219 },
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
        s: { width: 150.81, height: 150.81, left: 166.5, top: 316 },
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
        // No `s` field -- not part of the curated 7-of-11 subset the S
        // reference (S--Post-it Group.svg) shows; omitted at S entirely.
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
        s: { width: 168, height: 162.18, left: 17.9, top: 389.05 },
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
        // No `s` field -- see energy-left's comment above.
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
        // No `s` field -- see energy-left's comment above.
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
        // No `s` field -- see energy-left's comment above.
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
        s: { width: 167, height: 206, left: 193.5, top: 423.05 },
      },
    ],
  },
];

const TOTAL_ITEMS = GROUPS.reduce((sum, g) => sum + g.items.length, 0);

// GROUPS is already authored group-by-group in ascending `index` order
// (0-10), so flattening it preserves DOM/reading order without an
// explicit sort.
const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

// S renders a curated 7 of the 11 items (energy-left, more-expensive,
// stable-income, and stay-strong are dropped), not all 11 -- confirmed
// by S--Post-it Group.svg, which is the authoritative S-tier reference
// (unlike the earlier Section 11 S.html mockup's placeholder shapes/
// quotes, this SVG uses the real assets and real current quotes). Items
// that don't appear at S simply have no `s` field on them above; this
// filters GROUPS' own single source of truth down to just the ones that
// do, rather than maintaining a separate duplicate list.
const S_POSTITS = ALL_ITEMS.filter((item) => item.s);

// Every `s` position above was extracted directly from that SVG's own
// shapes via getBBox() (each item's pre-rotation local x/y/width/height
// -- rotation itself is already baked into each real asset's own artwork,
// same as XL, so no separate CSS rotate is needed here either) against
// its own 361x630 viewBox.
//
// Like the speech bubble above, this whole layout is authored against
// that fixed reference width and then converted to container-query-width
// percentages (see `pxToCqw`/`postItCqw` below) so it fills 100% of
// whatever the actual container width is while every item keeps its
// position/size relative to the others -- not just centered at a fixed
// 361px regardless of the real device width.
const S_CANVAS_WIDTH = 361;
const S_CANVAS_HEIGHT = 630;
const S_POSTIT_STAGGER_DELAY = 0.08;

function pxToCqw(px, referenceWidth) {
  return `${(px / referenceWidth) * 100}cqw`;
}

function postItCqw(px) {
  return pxToCqw(px, S_CANVAS_WIDTH);
}

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

function RealProblemHighlight({ children }) {
  // Same span-wrap technique as the other scribble highlights, reusing
  // Green-Scribble.svg (already used for "FOUR" in Section 1). Kept at its
  // own native 138x26 (not stretched to the wrapped words' rendered width).
  // top: var(--scribble-offset-default) is the shared offset used across
  // most of the underline/loop scribbles -- a fixed 10px pull-up from the
  // span's own line-box bottom, same value everywhere.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={greenScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 max-w-none -translate-x-1/2"
        style={{ width: '138px', height: '26px', top: 'var(--scribble-offset-default)' }}
      />
      <span className="heading-2-accent relative">{children}</span>
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
            <AccessibleHighlightText before="we learned what the " highlight={<RealProblemHighlight>REAL PROBLEM</RealProblemHighlight>} after=" was." />
          </h2>
        </div>
      </div>
    </div>
  );
}

// S-only bubble geometry -- user-confirmed pixel values, not measured/
// estimated, all authored against a 361px-wide reference (393px device
// minus the usual 16px page margins). Both ellipses are dedicated S-tier
// assets (S--Speech-Bubble-White-Ellipse1/2.svg, pure ellipse shapes at
// 260x104 and 361x158 natively) rather than the XL ellipse art resized/
// stretched to fit -- resizing the XL assets to odd aspect ratios is what
// made earlier passes look distorted/disconnected. The two tails still
// reuse XL's own tail assets (no dedicated S versions exist), placed at
// their near-native size at explicit offsets within the bubble 2
// container, same as XL's own structure just with new S-specific numbers.
//
// The whole thing needs to stay proportional at any device width, not
// just 393px -- so every value below is converted from its reference px
// to a container-query-width percentage (cqw) via the `cqw` helper
// rather than used as a literal px. cqw is relative to the nearest
// ancestor with `container-type: inline-size` (set on the wrapper below),
// so using it for BOTH widths and heights makes the whole composition
// scale together as one unit, preserving every internal proportion,
// exactly like scaling a single image would.
const S_BUBBLE_REFERENCE_WIDTH = 361;
const S_BUBBLE_CANVAS_HEIGHT = 273;
const S_BUBBLE_1 = { width: 260, height: 104, left: 0, top: 0 };
const S_BUBBLE_2 = { width: 361, height: 158 };
const S_BUBBLE_2_TOP = 96;
const S_BUBBLE_2_TAIL_1 = { width: 111.5, height: 74.5, top: 102, left: 28 };
const S_BUBBLE_2_TAIL_2 = { width: 45, height: 42, top: 102, right: 24 };

function cqw(px) {
  return pxToCqw(px, S_BUBBLE_REFERENCE_WIDTH);
}

function SpeechBubbleContentMobile() {
  return (
    <div className="relative w-full" style={{ containerType: 'inline-size' }}>
      <div className="relative w-full" style={{ height: cqw(S_BUBBLE_CANVAS_HEIGHT) }}>
        {/* Bubble 1: "But by listening," -- S--Speech-Bubble-White-
            Ellipse1.svg at its own native 260x104 proportions. */}
        <div
          className="absolute flex items-center justify-center"
          style={{ width: cqw(S_BUBBLE_1.width), height: cqw(S_BUBBLE_1.height), left: cqw(S_BUBBLE_1.left), top: cqw(S_BUBBLE_1.top) }}
        >
          <img
            src={sSpeechBubbleEllipse1}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <h2 className="relative heading-2 text-center text-heading-default">But by listening,</h2>
        </div>

        {/* Bubble 2: "we learned what the REAL PROBLEM was." --
            S--Speech-Bubble-White-Ellipse2.svg at its own native
            361x158 proportions, positioned 96px (of the 361px
            reference) from the canvas top. The two tails are children
            of THIS div, positioned relative to it (not the outer
            canvas), same as XL's own structure. */}
        <div className="absolute left-0" style={{ width: cqw(S_BUBBLE_2.width), top: cqw(S_BUBBLE_2_TOP) }}>
          <img
            src={sSpeechBubbleEllipse2}
            alt=""
            aria-hidden="true"
            className="pointer-events-none block w-full"
            style={{ height: cqw(S_BUBBLE_2.height) }}
          />
          <img
            src={speechBubbleWhiteEllipse2Tail1}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              width: cqw(S_BUBBLE_2_TAIL_1.width),
              height: cqw(S_BUBBLE_2_TAIL_1.height),
              top: cqw(S_BUBBLE_2_TAIL_1.top),
              left: cqw(S_BUBBLE_2_TAIL_1.left),
            }}
          />
          <img
            src={speechBubbleWhiteEllipse2Tail2}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              width: cqw(S_BUBBLE_2_TAIL_2.width),
              height: cqw(S_BUBBLE_2_TAIL_2.height),
              top: cqw(S_BUBBLE_2_TAIL_2.top),
              right: cqw(S_BUBBLE_2_TAIL_2.right),
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <h2 className="heading-2 text-heading-default">
              <AccessibleHighlightText before="we learned what the " highlight={<RealProblemHighlight>REAL PROBLEM</RealProblemHighlight>} after=" was." />
            </h2>
          </div>
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
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  const wrapperRef = useRef(null);
  // Shuffled once per mount ("once per session" -- a fresh page load gets
  // a fresh shuffle, but it doesn't re-shuffle on every re-render). ranks[i]
  // is DOM item i's animation rank (0 = animates first ... 10 = last),
  // fully decoupled from `index`, which fixes DOM/reading order.
  const [ranks] = useState(() => shuffle([...Array(TOTAL_ITEMS).keys()]));

  // Unconditional regardless of which branch below actually renders --
  // wrapperRef stays unattached (null) on the S branch, which just means
  // scrollYProgress never updates there, not a crash. Hooks must run in
  // the same order on every render, so this can't be skipped for S.
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] });

  const bubbleOpacity = useTransform(scrollYProgress, [BUBBLE_START, BUBBLE_END], [0, 1]);
  const bubbleScale = useTransform(scrollYProgress, [BUBBLE_START, BUBBLE_END], [0.8, 1]);

  if (!isAtLeastSm) {
    // No scroll-pin here (unlike sm+ below): stacking all 11 post-its
    // legibly in a ~360px-wide column needs far more vertical space than
    // one phone screen, so this section just flows to its own natural
    // (taller) height instead of staying pinned to h-dvh -- same fix
    // Section 5 and Section 3 used for the same reason. Reveal is a
    // plain ScrollSection fade-up-on-enter instead of the scroll-scrubbed
    // per-item stagger used at sm+.
    return (
      <section
        id="section-11"
        className="relative flex w-full flex-col items-center justify-start gap-2xl overflow-hidden bg-bg-yellow px-page-margin-x py-page-margin-y"
      >
        <ScrollSection className="w-full">
          <SpeechBubbleContentMobile />
        </ScrollSection>

        <div className="relative w-full" style={{ containerType: 'inline-size' }}>
          <div className="relative w-full" style={{ height: postItCqw(S_CANVAS_HEIGHT) }}>
            {/* Each post-it fades/slides up independently (own ScrollSection,
                not one shared wrapper) with an increasing delay per item --
                same DOM-order stagger idea as XL's scroll-scrubbed reveal,
                just driven by a plain per-item transition delay instead of
                scroll position, since there's no pin/scrollYProgress at S. */}
            {S_POSTITS.map((item, i) => (
              <ScrollSection
                key={item.key}
                as="img"
                src={item.asset}
                alt={item.quote}
                className="absolute block max-w-none"
                style={{
                  width: postItCqw(item.s.width),
                  height: postItCqw(item.s.height),
                  left: postItCqw(item.s.left),
                  top: postItCqw(item.s.top),
                }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: i * S_POSTIT_STAGGER_DELAY }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (prefersReducedMotion) {
    return (
      <section id="section-11" className="relative grid h-dvh w-full overflow-hidden bg-bg-yellow">
        {/* Speech bubble: the section's real content, given the shared
            content-cap wrapper per the site-wide policy -- a no-op at its
            own 711px natural width, but keeps this section
            consistent/auditable rather than living inside the fixed
            1440px canvas below. Shares gridArea with the post-its layer
            (same overlapping-layers technique Section 8 uses for its
            background art) and paints first/underneath, matching the
            original nested DOM order (bubble div, then the groups map). */}
        <div className="relative flex items-center justify-center content-cap" style={{ gridArea: '1 / 1' }}>
          <SpeechBubbleContent />
        </div>

        {/* Post-its: decorative backdrop, deliberately NOT subject to the
            1140px content-width cap -- this is a fixed 1440px
            reference-frame composition (hand-positioned left/top per
            item, no responsive logic of its own) that's allowed to clip
            at its own edges below 1440px viewport width, same as any
            other full-bleed background graphic would. Each image still
            carries its real quote as alt text -- only the LAYOUT role
            changes here, not accessibility. */}
        <div className="flex items-center justify-center" style={{ gridArea: '1 / 1' }}>
          <div className="relative h-[800px] w-[1440px] max-w-full">
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
        </div>
      </section>
    );
  }

  return (
    <section id="section-11" ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 grid h-dvh w-full overflow-hidden bg-bg-yellow">
        {/* Speech bubble: same content-cap treatment as the reduced-motion
            branch above -- see its own comment. */}
        <div className="relative flex items-center justify-center content-cap" style={{ gridArea: '1 / 1' }}>
          <motion.div style={{ opacity: bubbleOpacity, scale: bubbleScale }}>
            <SpeechBubbleContent />
          </motion.div>
        </div>

        {/* Post-its: decorative backdrop, painted second/on top -- see the
            reduced-motion branch's own comment for why this isn't part of
            the 1140px content-width policy. */}
        <div className="flex items-center justify-center" style={{ gridArea: '1 / 1' }}>
          <div className="relative h-[800px] w-[1440px] max-w-full">
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
      </div>
    </section>
  );
}

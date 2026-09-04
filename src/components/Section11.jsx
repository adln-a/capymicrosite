import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import blueTripleHighlight2 from '../assets/Highlights/Blue-Triple-Highlight-2.svg';
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
const BUBBLE_END = 0.15;
const POSTITS_START = 0.2;
const POSTITS_END = 0.75;
const POSTIT_FADE_DURATION = 0.1;
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
  // Blue-Triple-Highlight-2.svg (224x37, a compact highlighter mark)
  // replaces Green-Scribble.svg -- same treatment as Section 13/14/15/16's
  // marks: sits just under the baseline (top-full + a small
  // downward-adjusted translate), centered. h-full/w-auto keeps it at its
  // own proportions (tied to the wrapper's height, which tracks
  // heading-2-accent's responsive font-size) instead of stretching to
  // "REAL PROBLEM" 's own rendered width.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={blueTripleHighlight2}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 h-full w-auto max-w-none -translate-x-1/2 translate-y-[calc(-33.333%+3px)]"
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

// M: reuses the exact desktop bubble geometry/assets (not S's dedicated
// ellipse art) -- "reuse the desktop speech bubble" -- converted to cqw
// against its own natural 711px width so the whole two-ellipse
// composition scales as one unit, then capped at 640px via max-w on the
// outer container ("100% width, max 640px on M"). Structurally identical
// to SpeechBubbleContent above, just every literal px swapped for
// mBubbleCqw(px) and wrapped in the same container-type trick S's bubble
// already uses.
const M_BUBBLE_REFERENCE_WIDTH = 711;
const M_BUBBLE_CANVAS_HEIGHT = 325;

function mBubbleCqw(px) {
  return pxToCqw(px, M_BUBBLE_REFERENCE_WIDTH);
}

function SpeechBubbleContentM() {
  // width: min(...) instead of w-full max-w-[640px] -- this renders
  // inside content-cap's own flex row (items-center, so its children
  // shrink-to-fit rather than stretch), one level further nested than
  // XL's fixed-711px bubble ever was (through the animated branch's
  // motion.div wrapper too). A percentage width has no definite ancestor
  // size to resolve against through that shrink-to-fit chain -- it
  // measured out to 0 rather than the intended capped width (the same
  // class of bug Section 7's shape-cluster scale wrapper hit). Deriving
  // the width straight from the viewport instead (mirroring what
  // px-page-margin-x would give this section if it had any -- it
  // doesn't, section-11 is edge-to-edge by design) sidesteps the
  // ambiguous ancestor chain entirely: always a concrete number, capped
  // at 640px, no percentage resolution involved.
  return (
    <div
      className="relative mx-auto"
      style={{ width: 'min(100vw - (var(--spacing-page-margin-x) * 2), 640px)', containerType: 'inline-size' }}
    >
      <div className="relative w-full" style={{ height: mBubbleCqw(M_BUBBLE_CANVAS_HEIGHT) }}>
        <div
          className="absolute left-0 top-0 flex items-center justify-center"
          style={{ width: mBubbleCqw(488), height: mBubbleCqw(140) }}
        >
          <img
            src={speechBubbleWhiteEllipse1}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <h2 className="relative heading-2 text-heading-default">But by listening,</h2>
        </div>

        <div className="absolute bottom-0 right-0" style={{ width: mBubbleCqw(677), height: mBubbleCqw(241.5) }}>
          <img
            src={speechBubbleWhiteEllipse2}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0"
            style={{ width: mBubbleCqw(677), height: mBubbleCqw(186) }}
          />
          <img
            src={speechBubbleWhiteEllipse2Tail1}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ width: mBubbleCqw(112), height: mBubbleCqw(75), left: mBubbleCqw(146), top: mBubbleCqw(167) }}
          />
          <img
            src={speechBubbleWhiteEllipse2Tail2}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ width: mBubbleCqw(45), height: mBubbleCqw(42), left: mBubbleCqw(404), bottom: mBubbleCqw(32.5) }}
          />
          <div
            className="absolute left-0 top-0 flex items-center justify-center text-center"
            style={{ width: mBubbleCqw(677), height: mBubbleCqw(186) }}
          >
            <h2 className="heading-2 text-heading-default">
              <AccessibleHighlightText before="we learned what the " highlight={<RealProblemHighlight>REAL PROBLEM</RealProblemHighlight>} after=" was." />
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

// M post-its: reuses all 11 existing items/assets/quotes unchanged (per
// explicit direction -- the M reference SVG's own quotes/shape
// assignments don't match this codebase's 11 items and no matching
// assets exist for them, so only its GENERAL composition is followed:
// items clustered above and below the speech bubble, not XL's left/right
// flanking columns, which need far more horizontal room than a
// 800px-capped M viewport has). Groups 1+3 (6 items) form a scaled-down
// top row; groups 2+4 (5 items) form a scaled-down bottom row, each
// group keeping its own existing INTERNAL item arrangement exactly as
// authored -- only a uniform scale and a new top-level anchor are
// applied per group, so nothing about how the 2-3 items within one
// group relate to each other changes, just the group's overall size/
// position.
//
// M_GROUP_SCALE shrinks the wider pairing (group1 470px + a 24px gap +
// group3 415px = 909px) down to exactly fill the 800px cap; the same
// factor is reused for the bottom row so every item's size stays in the
// same proportion to every other item that the original XL design had
// (not a second, independently-fitted scale that would make top/bottom
// clusters read as two different scales of art).
const M_CANVAS_WIDTH = 800;
const M_GAP = 24;
const M_GROUP_SCALE = M_CANVAS_WIDTH / (GROUPS[0].width + M_GAP + GROUPS[2].width);
// Each cluster is anchored to the CANVAS's own top/bottom edge (64px
// literal inset, not cqw-scaled -- matches the site's flat spacing
// tokens rather than growing/shrinking with the fluid width), not to a
// guessed total canvas height -- the earlier version computed one fixed
// M_CANVAS_HEIGHT from an arbitrary "gap reserved for the bubble" number,
// which didn't account for the section's own overflow-hidden clipping
// anything taller than the actual dvh viewport, cutting the bottom
// cluster off on shorter screens. Anchoring directly to the (now h-full,
// truly dvh-matched) canvas's real edges instead means it can never be
// taller than the viewport actually is.
const M_EDGE_GAP = 64;

// Generic version of the per-group scale/reposition math -- originally
// M-only (scaleGroupForM), factored out so L (own comment further below)
// can reuse the identical computation against its own scale/canvas
// instead of a second hand-copied version.
function scaleGroupForTier(group, left, scale) {
  return {
    ...group,
    left,
    top: 0, // relative to its own cluster wrapper (top-64 or bottom-64), not the whole canvas
    width: group.width * scale,
    height: group.height * scale,
    items: group.items.map((item) => ({
      ...item,
      width: item.width * scale,
      height: item.height * scale,
      itemLeft: item.itemLeft * scale,
      itemTop: item.itemTop * scale,
    })),
  };
}

const M_TOP_ROW_HEIGHT = Math.max(GROUPS[0].height, GROUPS[2].height) * M_GROUP_SCALE;
const M_BOTTOM_ROW_WIDTH = (GROUPS[1].width + M_GAP + GROUPS[3].width) * M_GROUP_SCALE;
const M_BOTTOM_ROW_HEIGHT = Math.max(GROUPS[1].height, GROUPS[3].height) * M_GROUP_SCALE;
// Bottom row's own combined width is narrower than the 800px cap (unlike
// the top row, which was the binding constraint) -- centered within the
// canvas rather than left-flush, so it doesn't read as accidentally
// offset from the top row above it.
const M_BOTTOM_ROW_LEFT = (M_CANVAS_WIDTH - M_BOTTOM_ROW_WIDTH) / 2;

const M_TOP_GROUPS = [
  scaleGroupForTier(GROUPS[0], 0, M_GROUP_SCALE),
  scaleGroupForTier(GROUPS[2], GROUPS[0].width * M_GROUP_SCALE + M_GAP, M_GROUP_SCALE),
];
const M_BOTTOM_GROUPS = [
  scaleGroupForTier(GROUPS[1], M_BOTTOM_ROW_LEFT, M_GROUP_SCALE),
  scaleGroupForTier(GROUPS[3], M_BOTTOM_ROW_LEFT + GROUPS[1].width * M_GROUP_SCALE + M_GAP, M_GROUP_SCALE),
];

function mPostItCqw(px) {
  return pxToCqw(px, M_CANVAS_WIDTH);
}

// L (992-1199px): same reference composition as the M reference SVG --
// items clustered above and below the bubble rather than XL's own
// left/right flanking columns (per "Section 11 L.svg": a 6-item top row,
// a 5-item bottom row, matching this codebase's existing group1+group3 /
// group2+group4 split exactly). Unlike M (hard-capped at 800px), L is
// passed capWidth={null} in PostItCanvas -- the rendered canvas fills all
// the way to the page margins at every L width instead of sitting
// hard-capped with growing empty space on either side, while
// L_CANVAS_WIDTH=900 still sets the cqw reference/design scale (item
// sizes grow proportionally with the wider real container, they aren't
// just repositioned within a fixed-size cluster). Per the same direction
// already established for M: the reference's own quotes/shape
// reassignments don't match this codebase's existing 11 items and no
// matching assets exist for them, so only the general top/bottom
// composition is followed, reusing all 11 existing items unchanged. The
// speech bubble is NOT given its own L-specific cap the way M's is --
// XL's original fixed 711px bubble already fits comfortably within L's
// own tightest available width (711 < 928 at 992px viewport after
// page-margin-x), so SpeechBubbleContent is reused as-is here, unlike M
// where 711px didn't fit and needed SpeechBubbleContentM.
const L_CANVAS_WIDTH = 900;
const L_GAP = 24;
// group3's "more-expensive" item (itemLeft 247 + width 185 = 432) actually
// extends 17px past group3's own declared `width: 415` -- loose authoring
// that stayed invisible under the old fixed-900px-cap-plus-spare-margin
// layout, but pokes past the real page margin now that L fills flush to
// it (own comment above). Using the group's real content-derived width
// here (instead of its authored one) as the scale denominator makes the
// top row's actual rightmost pixel land exactly on the canvas's real
// edge -- M is untouched, its own version of this same looseness stays
// masked by its own spare cap margin.
const L_GROUP3_CONTENT_WIDTH = Math.max(...GROUPS[2].items.map((item) => item.itemLeft + item.width));
// 95% of the edge-to-edge fill scale -- leaves a small uniform inset
// beyond the real 32px page margin on every side (both rows are
// re-centered within L_CANVAS_WIDTH below to keep that inset symmetric,
// same treatment the bottom row already had for its own narrower width).
const L_POSTIT_SCALE = 0.95;
const L_GROUP_SCALE = (L_CANVAS_WIDTH / (GROUPS[0].width + L_GAP + L_GROUP3_CONTENT_WIDTH)) * L_POSTIT_SCALE;
const L_EDGE_GAP = 64;

const L_TOP_ROW_WIDTH = (GROUPS[0].width + L_GAP + L_GROUP3_CONTENT_WIDTH) * L_GROUP_SCALE;
const L_TOP_ROW_LEFT = (L_CANVAS_WIDTH - L_TOP_ROW_WIDTH) / 2;
const L_TOP_ROW_HEIGHT = Math.max(GROUPS[0].height, GROUPS[2].height) * L_GROUP_SCALE;
const L_BOTTOM_ROW_WIDTH = (GROUPS[1].width + L_GAP + GROUPS[3].width) * L_GROUP_SCALE;
const L_BOTTOM_ROW_HEIGHT = Math.max(GROUPS[1].height, GROUPS[3].height) * L_GROUP_SCALE;
const L_BOTTOM_ROW_LEFT = (L_CANVAS_WIDTH - L_BOTTOM_ROW_WIDTH) / 2;

const L_TOP_GROUPS = [
  scaleGroupForTier(GROUPS[0], L_TOP_ROW_LEFT, L_GROUP_SCALE),
  scaleGroupForTier(GROUPS[2], L_TOP_ROW_LEFT + GROUPS[0].width * L_GROUP_SCALE + L_GAP, L_GROUP_SCALE),
];
const L_BOTTOM_GROUPS = [
  scaleGroupForTier(GROUPS[1], L_BOTTOM_ROW_LEFT, L_GROUP_SCALE),
  scaleGroupForTier(GROUPS[3], L_BOTTOM_ROW_LEFT + GROUPS[1].width * L_GROUP_SCALE + L_GAP, L_GROUP_SCALE),
];

function lPostItCqw(px) {
  return pxToCqw(px, L_CANVAS_WIDTH);
}

// Shared canvas shell for M and L's post-it layer (used by both the
// reduced-motion and scroll-jack branches below) -- h-full (not a fixed
// px height) so it always matches the section's own actual h-dvh height,
// never taller than the real viewport (the earlier fixed-height version
// could exceed a short viewport and get sliced off by the section's own
// overflow-hidden). width: min(...) is the same viewport-derived,
// ambiguous-ancestor-proof expression SpeechBubbleContentM uses (own
// comment there) -- this canvas sits in the exact same
// items-center-flex-row position one grid layer up. Two nested divs for
// container-type/cqw-height, same reason as ever (Section 3's own fix).
// topCluster/bottomCluster are pre-rendered JSX (PostItGroupsStatic or
// -Animated output for the tier's own *_TOP_GROUPS/*_BOTTOM_GROUPS) --
// this component only owns the shell/anchoring, not which reveal style
// is used inside, or which tier's numbers it's showing (canvasWidth/
// edgeGap/topRowHeight/bottomRowHeight/cqwFn carry all of that in).
// canvasWidth doubles as the cqw reference AND (by default) the rendered
// width cap; pass capWidth={null} to keep canvasWidth purely as the cqw
// reference while letting the rendered width instead fill all the way out
// to the page margins (L's own request -- item scale still comes from
// cqwFn/canvasWidth, so items grow to fill the wider real estate rather
// than just gaining empty margin around a fixed-size cluster).
function PostItCanvas({ canvasWidth, capWidth = canvasWidth, edgeGap, topRowHeight, bottomRowHeight, cqwFn, topCluster, bottomCluster }) {
  const width =
    capWidth === null
      ? 'calc(100vw - (var(--spacing-page-margin-x) * 2))'
      : `min(100vw - (var(--spacing-page-margin-x) * 2), ${capWidth}px)`;
  return (
    <div className="relative mx-auto h-full" style={{ width, containerType: 'inline-size' }}>
      <div className="relative h-full w-full">
        {/* top-Npx / bottom-Npx: literal, unscaled insets from the
            canvas's own real edges -- "top group Npx from the top,
            bottom group Npx from the bottom." Each wrapper gets an
            explicit cqw height matching its own cluster's tallest group,
            so the bottom wrapper's `bottom` anchor has a real box to
            measure from (an auto/zero-height wrapper would collapse its
            own top edge onto its bottom anchor, rendering children
            downward from the anchor instead of upward into it). */}
        <div className="absolute left-0 right-0" style={{ top: `${edgeGap}px`, height: cqwFn(topRowHeight) }}>
          {topCluster}
        </div>
        <div className="absolute left-0 right-0" style={{ bottom: `${edgeGap}px`, height: cqwFn(bottomRowHeight) }}>
          {bottomCluster}
        </div>
      </div>
    </div>
  );
}

// left/top/width/height come in as pre-formatted CSS length strings
// (plain "Npx" for XL/S, "N cqw" for M) rather than raw numbers, so this
// one component serves both unit systems without knowing which tier
// it's rendering for.
function AnimatedPostIt({ item, scrollYProgress, rank, left, top, width, height }) {
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
        style={{ width, height, left, top }}
      />
    </motion.div>
  );
}

// Shared between M and XL's static (reduced-motion) rendering -- unitFn
// converts a raw px number to whatever CSS length string this tier
// actually needs ("Npx" for XL's fixed canvas, "Ncqw" for M's fluid one),
// so the exact same JSX shape works for both without duplicating it.
function PostItGroupsStatic({ groups, unitFn }) {
  return groups.map((group) => (
    <div key={group.key} className="absolute" style={{ left: unitFn(group.left), top: unitFn(group.top) }}>
      {group.items.map((item) => (
        <img
          key={item.key}
          src={item.asset}
          alt={item.quote}
          // max-w-none: this group wrapper has no explicit size (unlike
          // the animated version's), so Tailwind's preflight
          // max-width:100% would otherwise clamp every post-it to 0
          // width against that undefined containing block.
          className="absolute block max-w-none"
          style={{
            width: unitFn(item.width),
            height: unitFn(item.height),
            left: unitFn(item.itemLeft),
            top: unitFn(item.itemTop),
            zIndex: item.zIndex,
          }}
        />
      ))}
    </div>
  ));
}

function PostItGroupsAnimated({ groups, unitFn, scrollYProgress, ranks }) {
  return groups.map((group) => (
    <div
      key={group.key}
      className="absolute"
      style={{ left: unitFn(group.left), top: unitFn(group.top), width: unitFn(group.width), height: unitFn(group.height) }}
    >
      {group.items.map((item) => (
        <AnimatedPostIt
          key={item.key}
          item={item}
          scrollYProgress={scrollYProgress}
          rank={ranks[item.index]}
          left={unitFn(item.itemLeft)}
          top={unitFn(item.itemTop)}
          width={unitFn(item.width)}
          height={unitFn(item.height)}
        />
      ))}
    </div>
  ));
}

export default function Section11() {
  const prefersReducedMotion = useReducedMotion();
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  // Only needed to tell M apart from L/XL (the speech bubble asset/size
  // and the post-it cluster layout both diverge there) -- isAtLeastSm
  // still does all the S-vs-(M-or-XL) work it always did. isAtLeastXl
  // similarly only tells L apart from XL -- the post-it cluster gets its
  // own L-specific layout (own comment above L_TOP_GROUPS), but the
  // speech bubble and the pin itself stay XL's original behavior at L
  // too (untouched, per "L is very similar to XL").
  const isAtLeastLg = useMediaQuery('(min-width: 992px)');
  const isAtLeastXl = useMediaQuery('(min-width: 1200px)');
  const isM = isAtLeastSm && !isAtLeastLg;
  const isL = isAtLeastLg && !isAtLeastXl;
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
            original nested DOM order (bubble div, then the groups map).
            M reuses the exact same desktop SpeechBubbleContent art (see
            SpeechBubbleContentM's own comment) here too -- content-cap
            already gives it the same "no-op at its natural width, capped
            wider" treatment XL relies on, and its own internal max-w-
            [640px] is what actually enforces the M-specific cap. */}
        <div className="relative flex items-center justify-center content-cap" style={{ gridArea: '1 / 1' }}>
          {isM ? <SpeechBubbleContentM /> : <SpeechBubbleContent />}
        </div>

        {/* Post-its: decorative backdrop, deliberately NOT subject to the
            1140px content-width cap -- XL's is a fixed 1440px
            reference-frame composition (hand-positioned left/top per
            item, no responsive logic of its own) that's allowed to clip
            at its own edges below 1440px viewport width, same as any
            other full-bleed background graphic would. M and L are instead
            fluid, container-query-scaled compositions capped at 800px and
            900px respectively, both top/bottom-edge-anchored (own comments
            above M_TOP_GROUPS / L_TOP_GROUPS) -- all three still just
            center as a whole within this shared gridArea layer via the
            same items-center/justify-center. Each image still carries its
            real quote as alt text -- only the LAYOUT role changes here,
            not accessibility. */}
        <div className="flex items-center justify-center" style={{ gridArea: '1 / 1' }}>
          {isM ? (
            <PostItCanvas
              canvasWidth={M_CANVAS_WIDTH}
              edgeGap={M_EDGE_GAP}
              topRowHeight={M_TOP_ROW_HEIGHT}
              bottomRowHeight={M_BOTTOM_ROW_HEIGHT}
              cqwFn={mPostItCqw}
              topCluster={<PostItGroupsStatic groups={M_TOP_GROUPS} unitFn={mPostItCqw} />}
              bottomCluster={<PostItGroupsStatic groups={M_BOTTOM_GROUPS} unitFn={mPostItCqw} />}
            />
          ) : isL ? (
            <PostItCanvas
              canvasWidth={L_CANVAS_WIDTH}
              capWidth={null}
              edgeGap={L_EDGE_GAP}
              topRowHeight={L_TOP_ROW_HEIGHT}
              bottomRowHeight={L_BOTTOM_ROW_HEIGHT}
              cqwFn={lPostItCqw}
              topCluster={<PostItGroupsStatic groups={L_TOP_GROUPS} unitFn={lPostItCqw} />}
              bottomCluster={<PostItGroupsStatic groups={L_BOTTOM_GROUPS} unitFn={lPostItCqw} />}
            />
          ) : (
            <div className="relative h-[800px] w-[1440px] max-w-full">
              <PostItGroupsStatic groups={GROUPS} unitFn={(px) => `${px}px`} />
            </div>
          )}
        </div>
      </section>
    );
  }

  // isM shares this exact structural template with XL -- "kept width at
  // dvh" -- the h-[200vh]/sticky h-dvh scroll-jack pin isn't an XL-only
  // thing that M drops down to some hugged/static layout for; only the
  // bubble asset and post-it canvas (own comments above) differ.
  return (
    <section id="section-11" ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 grid h-dvh w-full overflow-hidden bg-bg-yellow">
        {/* Speech bubble: same content-cap treatment as the reduced-motion
            branch above -- see its own comment. */}
        <div className="relative flex items-center justify-center content-cap" style={{ gridArea: '1 / 1' }}>
          <motion.div style={{ opacity: bubbleOpacity }}>
            {isM ? <SpeechBubbleContentM /> : <SpeechBubbleContent />}
          </motion.div>
        </div>

        {/* Post-its: decorative backdrop, painted second/on top -- see the
            reduced-motion branch's own comment for why this isn't part of
            the 1140px content-width policy, and for the M/L
            two-nested-divs container-query fix (PostItCanvas). */}
        <div className="flex items-center justify-center" style={{ gridArea: '1 / 1' }}>
          {isM ? (
            <PostItCanvas
              canvasWidth={M_CANVAS_WIDTH}
              edgeGap={M_EDGE_GAP}
              topRowHeight={M_TOP_ROW_HEIGHT}
              bottomRowHeight={M_BOTTOM_ROW_HEIGHT}
              cqwFn={mPostItCqw}
              topCluster={<PostItGroupsAnimated groups={M_TOP_GROUPS} unitFn={mPostItCqw} scrollYProgress={scrollYProgress} ranks={ranks} />}
              bottomCluster={<PostItGroupsAnimated groups={M_BOTTOM_GROUPS} unitFn={mPostItCqw} scrollYProgress={scrollYProgress} ranks={ranks} />}
            />
          ) : isL ? (
            <PostItCanvas
              canvasWidth={L_CANVAS_WIDTH}
              capWidth={null}
              edgeGap={L_EDGE_GAP}
              topRowHeight={L_TOP_ROW_HEIGHT}
              bottomRowHeight={L_BOTTOM_ROW_HEIGHT}
              cqwFn={lPostItCqw}
              topCluster={<PostItGroupsAnimated groups={L_TOP_GROUPS} unitFn={lPostItCqw} scrollYProgress={scrollYProgress} ranks={ranks} />}
              bottomCluster={<PostItGroupsAnimated groups={L_BOTTOM_GROUPS} unitFn={lPostItCqw} scrollYProgress={scrollYProgress} ranks={ranks} />}
            />
          ) : (
            <div className="relative h-[800px] w-[1440px] max-w-full">
              <PostItGroupsAnimated groups={GROUPS} unitFn={(px) => `${px}px`} scrollYProgress={scrollYProgress} ranks={ranks} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

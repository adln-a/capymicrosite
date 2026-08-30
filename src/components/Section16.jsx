import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import pinkScribble from '../assets/Pink-Scribble.svg';
import frameLeft from '../assets/Desktop-IMG-Frame-16-Left.svg';
import frameRight from '../assets/Desktop-IMG-Frame-16-Right.svg';
import mBgBottom from '../assets/m/M--BG-Frame16 Bottom.svg';
import lFrameLeft from '../assets/l/L--IMG-Frame16 Left.svg';
import lFrameRight from '../assets/l/L--IMG-Frame16 Right.svg';

// Content + exact colors/rotations transcribed from the reference export
// (Section 16.html) -- each card's rotation and ruled-line tint is a
// specific, non-uniform value per card, not a shared constant.
const CARDS = [
  {
    key: 'support',
    bg: 'bg-bg-blue',
    rotate: 2,
    heading: 'Support for implementation',
    body: "Create tools and resources that are easy to adopt, so they fit naturally into existing workflows and don’t create extra burden.",
    headingColor: 'text-heading-inverted',
    bodyColor: 'text-body-inverted',
    lineColor: 'var(--color-allports-500)',
  },
  {
    key: 'pilot',
    bg: 'bg-bg-purple',
    rotate: 0,
    heading: 'Pilot partnerships',
    body: "Test ideas with social service agencies, schools, and providers in real-world settings to learn what works and what doesn’t.",
    headingColor: 'text-heading-default',
    bodyColor: 'text-body-default',
    lineColor: 'var(--color-prelude-400)',
  },
  {
    key: 'shared',
    bg: 'bg-bg-red',
    rotate: -2,
    heading: 'Shared learning',
    body: 'Exchange data, feedback, and insights across stakeholders to help everyone improve together.',
    headingColor: 'text-heading-inverted',
    bodyColor: 'text-body-inverted',
    // pomegranate-500 at 50% opacity -- the standard treatment for ruled
    // lines on a red (now capy-orange-a11y, after the bg-red/orange
    // merge) background, matching Section 5/14's own RuledLines. The
    // other three cards keep RuledLines' own default 75% -- their
    // backgrounds/line colors were never affected by that merge.
    lineColor: 'var(--color-pomegranate-500)',
    lineOpacity: 50,
  },
  {
    key: 'codesign',
    bg: 'bg-bg-yellow',
    rotate: 3,
    heading: 'Co-design',
    body: 'Involve families, children, and social workers early in the design process to build solutions that truly reflect their needs.',
    headingColor: 'text-heading-default',
    bodyColor: 'text-body-default',
    lineColor: 'var(--color-sunglow-500)',
  },
];

const CARD_HEIGHT = 355;
// How much of each earlier card peeks out from behind the next one once
// it's settled -- tightened from the original 24px reference value per
// direct request.
const STACK_PEEK = 12;
// How far below its own resting spot each card starts before sliding up
// into place -- deliberately more than CARD_HEIGHT so an entering card
// starts fully clear of the previous card's text (otherwise its
// semi-transparent mid-fade state visibly bleeds over the readable card
// above it instead of rising cleanly from underneath).
const ENTER_DISTANCE = CARD_HEIGHT + 20;
// scrollYProgress is split into 4 roughly equal, non-overlapping windows,
// one per card -- useTransform's default clamping holds each card at its
// settled state once scroll passes its own window, so cards 1-3 stay put
// (rather than reversing) while later cards animate in on top of them.
const THRESHOLDS = [
  [0, 0.25],
  [0.25, 0.5],
  [0.5, 0.75],
  [0.75, 1],
];
// The fade completes early, over just a brief slice of a card's own
// window -- the card is already fully opaque well before it finishes
// sliding up into its resting spot, rather than still fading in as it
// settles.
const FADE_FRACTION = 0.12;

function RuledLines({ color, opacity = 75 }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[81px] flex flex-col gap-m"
      style={{ opacity: opacity / 100 }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="h-px w-full flex-shrink-0" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

function CardContent({ card }) {
  return (
    <>
      <RuledLines color={card.lineColor} opacity={card.lineOpacity} />
      <div className="relative flex flex-col items-center justify-start gap-s self-stretch">
        <h3 className={`heading-3 self-stretch text-center ${card.headingColor}`}>{card.heading}</h3>
        <p className={`body-paragraph self-stretch text-center ${card.bodyColor}`}>{card.body}</p>
      </div>
    </>
  );
}

function StackCard({ card, index, scrollYProgress }) {
  const [start, end] = THRESHOLDS[index];
  const fadeEnd = start + (end - start) * FADE_FRACTION;
  const restY = index * STACK_PEEK;
  const opacity = useTransform(scrollYProgress, [start, fadeEnd], [0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [restY + ENTER_DISTANCE, restY]);

  return (
    <motion.div
      style={{ opacity, y, rotate: card.rotate, transformOrigin: 'center', zIndex: index + 1 }}
      className={`absolute inset-x-0 top-0 flex h-[355px] flex-col items-center justify-center gap-m overflow-hidden rounded-large px-l ${card.bg}`}
    >
      <CardContent card={card} />
    </motion.div>
  );
}

function TogetherHighlight({ children }) {
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={pinkScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 h-auto max-w-none -translate-x-1/2"
        style={{ top: 'var(--scribble-offset-default)' }}
      />
      <span className="heading-2-accent relative">{children}</span>
    </span>
  );
}

function Header() {
  return (
    <h2 className="heading-2 text-center text-heading-default">
      {/* 3 separate top-level spans (for the flex-wrap layout) plus
          TogetherHighlight's own nested span/image is even more nesting
          than Section 5/1/11's single-highlight case -- same VoiceOver
          nested-"items" risk, same fix: aria-hidden the whole visual
          layout, sr-only carries the one flat string. The flex-wrap
          layout itself moves onto the visual span (an h2 can host a
          flex/inline-flex-styled child same as any other element) so the
          h2 itself stays a plain block -- only its child needs to be a
          flex container for these 3 pieces. `before`/`after` carry their
          own explicit spaces below (unlike the other AccessibleHighlightText
          call sites) because the sr-only string needs real spaces where the
          visual layout instead relies on the flex gap -- visualClassName
          tells the component to trim those spaces back off before
          rendering the visual spans, so gap-xs isn't doubled up with them. */}
      <AccessibleHighlightText
        before="Ways we can work "
        highlight={<TogetherHighlight>TOGETHER</TogetherHighlight>}
        after=" to make meaningful change"
        visualClassName="flex w-full max-w-full flex-wrap items-center justify-center gap-xs text-center sm:w-[800px]"
      />
    </h2>
  );
}

// XL-only now -- S no longer overlays its illustration absolutely at the
// bottom of a pinned h-dvh section; it renders its own single image
// in-flow, stacked below the card stack (see the !isAtLeastSm branch
// below), so it doesn't need this component at all. M gets its own
// IllustrationsM below instead of this two-image spread, and L gets its
// own IllustrationsL (own comment below) instead of reusing these XL
// assets.
function Illustrations() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-xs z-30 flex items-end justify-between px-2xl">
      <img src={frameLeft} alt="" aria-hidden="true" className="h-auto w-[535px] max-w-none" />
      <img src={frameRight} alt="" aria-hidden="true" className="h-auto w-[452px] max-w-none" />
    </div>
  );
}

// L (992-1199px): its own dedicated pair of exports (L--IMG-Frame16
// Left/Right.svg, native 418x227 / 339x206) rather than XL's larger
// 535/452 frameLeft/frameRight -- same two-image spread shell/positioning
// as Illustrations above, just swapped assets sized at their own native
// dimensions.
function IllustrationsL() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-xs z-30 flex items-end justify-between px-2xl">
      <img src={lFrameLeft} alt="" aria-hidden="true" className="h-auto w-[418px] max-w-none" />
      <img src={lFrameRight} alt="" aria-hidden="true" className="h-auto w-[339px] max-w-none" />
    </div>
  );
}

// M: a single dedicated 704x300 export replacing XL's two separate
// frameLeft/frameRight images -- centered as one piece rather than
// spread to the two page edges (there's no matching two-piece M export,
// and XL's own wide left/right spread doesn't have room to work at M's
// narrower widths anyway). w-full max-w-[700px]: fluid down to 700px,
// capped there, same "100% width up to Npx" pattern used for every
// other M illustration this pass. pb-l (not the previous bottom-xs, a
// much tighter raw inset): flex items-end packs the image against this
// box's own bottom PADDING edge rather than its bottom:0 border edge,
// so the image sits pb-l of real breathing room above the true section
// bottom instead of almost flush against it.
//
// Only rendered when the viewport is tall enough (>=1024px, checked by
// the caller) -- same rationale as Section 3's own height gate: this
// sits inside a scroll-jacked h-[300vh]/sticky h-dvh pin, and a short
// viewport leaves little room for both the card stack settling AND this
// illustration to read cleanly at the same time, so it's dropped
// entirely rather than cramped in.
function IllustrationsM() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-center px-2xl pb-l">
      <img src={mBgBottom} alt="" aria-hidden="true" className="h-auto w-full max-w-[700px]" />
    </div>
  );
}

// Split into two genuinely separate components (mounted/unmounted via
// the isAtLeastSm check in the default export below), each with its OWN
// useScroll/useRef instance, rather than one component whose JSX branches
// conditionally while sharing hooks. That split matters specifically for
// useScroll: dragging the window from XL to S live (not a fresh page
// load) previously left the S-side scroll-jack malfunctioning -- Framer
// Motion's own console warning explained why ("the provided ref is not
// yet hydrated... call useScroll() in the same component as the ref").
// sWrapperRef started at null (its branch wasn't rendered at initial XL
// mount), and useScroll's setup effect ran once against that null target
// on Section16's OWN mount; it never re-ran just because the ref's
// `.current` was filled in later when the S branch started rendering,
// since a ref mutation alone doesn't retrigger an effect. Making these
// two fully separate components sidesteps the issue entirely: crossing
// the breakpoint now unmounts one and mounts the other, so useScroll
// always initializes fresh with an already-attached ref, exactly like a
// cold page load.

function Section16Desktop() {
  const prefersReducedMotion = useReducedMotion();
  // Only needed to tell M/L/XL apart -- the bottom/side illustration is
  // the one thing that diverges there (own comments on Illustrations/
  // IllustrationsL/IllustrationsM above); everything else about this
  // "desktop" branch (card stack, scroll-jack, padding) is already
  // shared correctly.
  const isAtLeastLg = useMediaQuery('(min-width: 992px)');
  const isAtLeastXl = useMediaQuery('(min-width: 1200px)');
  const isL = isAtLeastLg && !isAtLeastXl;
  // M-only gate on the illustration, same technique as Section 3's own
  // height check: below 1024px tall, there isn't enough vertical room in
  // this pinned h-dvh for the card stack AND the illustration to both
  // read cleanly, so it's dropped entirely rather than shown cramped.
  // L/XL's own illustrations are intentionally NOT gated by this -- they
  // were already showing unconditionally before today and weren't asked
  // to change.
  const isAtLeastHeight1024 = useMediaQuery('(min-height: 1024px)');
  const showMIllustration = !isAtLeastLg && isAtLeastHeight1024;
  const wrapperRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] });

  if (prefersReducedMotion) {
    return (
      <section
        id="section-16"
        className="relative flex min-h-dvh w-full flex-col items-center justify-start gap-l overflow-hidden bg-bg-linen-dark px-page-margin-x py-page-margin-y"
      >
        {/* content-cap: the site-wide desktop content cap, wrapping the
            heading + card stack only -- Illustrations below stays OUTSIDE
            this wrapper (a sibling, not a child) so its two
            frameLeft/frameRight images keep their own inset-x-0 full-bleed
            positioning against the section itself, same as a background
            image, free to overflow past the 1140px cap rather than being
            confined to it. */}
        <div className="relative flex w-full flex-col items-center gap-l content-cap">
          <Header />
          <div className="relative w-[640px] max-w-full" style={{ height: `${CARD_HEIGHT + 3 * STACK_PEEK}px` }}>
            {CARDS.map((card, index) => (
              <div
                key={card.key}
                style={{ transform: `translateY(${index * STACK_PEEK}px) rotate(${card.rotate}deg)`, transformOrigin: 'center', zIndex: index + 1 }}
                className={`absolute inset-x-0 top-0 flex h-[355px] flex-col items-center justify-center gap-m overflow-hidden rounded-large px-l ${card.bg}`}
              >
                <CardContent card={card} />
              </div>
            ))}
          </div>
        </div>
        {isAtLeastXl ? <Illustrations /> : isL ? <IllustrationsL /> : showMIllustration ? <IllustrationsM /> : null}
      </section>
    );
  }

  return (
    <section id="section-16" ref={wrapperRef} className="relative h-[300vh]">
      {/* min-h-dvh (not h-dvh): under high zoom, if the header/card stack
          ever needs more than one viewport's worth of height, this grows
          to fit instead of clipping content. The pin's "stuck" window is
          just h-[300vh]'s own height minus this element's height -- a
          taller sticky child shortens that window somewhat, but doesn't
          break it, since scrollYProgress itself is computed from the
          wrapper's own 300vh height, not this element's. */}
      <div className="sticky top-0 flex min-h-dvh w-full flex-col items-center justify-start gap-l overflow-hidden bg-bg-linen-dark px-page-margin-x py-page-margin-y">
        {/* Same content-cap treatment as the reduced-motion branch above --
            see its own comment. */}
        <div className="relative flex w-full flex-col items-center gap-l content-cap">
          <Header />
          <div className="relative w-[640px] max-w-full" style={{ height: `${CARD_HEIGHT + 3 * STACK_PEEK}px` }}>
            {CARDS.map((card, index) => (
              <StackCard key={card.key} card={card} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
        {isAtLeastXl ? <Illustrations /> : isL ? <IllustrationsL /> : showMIllustration ? <IllustrationsM /> : null}
      </div>
    </section>
  );
}

function Section16Mobile() {
  const prefersReducedMotion = useReducedMotion();
  const sWrapperRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sWrapperRef, offset: ['start start', 'end end'] });

  // Card stack keeps the exact same scroll-jack mechanism as XL (StackCard,
  // same CARDS/STACK_PEEK/CARD_HEIGHT) -- no illustration at S at all (per
  // direct instruction, for a cleaner mobile look with just the cards),
  // unlike XL's Illustrations() overlay.
  if (prefersReducedMotion) {
    // No pin at all here -- consistent with XL's own reduced-motion
    // branch, which also skips the scroll-jack entirely and just settles
    // every card at its resting position immediately.
    return (
      <section id="section-16" className="relative flex w-full flex-col items-center bg-bg-linen-dark">
        <div className="relative flex w-full flex-col items-center gap-l px-page-margin-x py-page-margin-y">
          <Header />
          <div className="relative w-full max-w-full" style={{ height: `${CARD_HEIGHT + 3 * STACK_PEEK}px` }}>
            {CARDS.map((card, index) => (
              <div
                key={card.key}
                style={{ transform: `translateY(${index * STACK_PEEK}px) rotate(${card.rotate}deg)`, transformOrigin: 'center', zIndex: index + 1 }}
                className={`absolute inset-x-0 top-0 flex h-[355px] flex-col items-center justify-center gap-m overflow-hidden rounded-large px-l ${card.bg}`}
              >
                <CardContent card={card} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="section-16" className="relative flex w-full flex-col items-center bg-bg-linen-dark">
      <div ref={sWrapperRef} className="relative w-full" style={{ height: '300vh' }}>
        {/* min-h-dvh -- same fix and same reasoning as the desktop
            branch's own sticky child above. */}
        <div className="sticky top-0 flex min-h-dvh w-full flex-col items-center justify-center gap-l overflow-hidden bg-bg-linen-dark px-page-margin-x py-page-margin-y">
          <Header />
          <div className="relative w-full max-w-full" style={{ height: `${CARD_HEIGHT + 3 * STACK_PEEK}px` }}>
            {CARDS.map((card, index) => (
              <StackCard key={card.key} card={card} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Section16() {
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  return isAtLeastSm ? <Section16Desktop /> : <Section16Mobile />;
}

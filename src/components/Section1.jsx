import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import bgFrame1Xl from '../assets/Desktop-BG--Frame-1.svg';
import bgFrame1M from '../assets/m/M--BG-Frame1.svg';
import bgFrame1Xs from '../assets/s/S--BG-Frame1.svg';
import fourScribble from '../assets/Green-Scribble.svg';

const CARD_SHADOW = 'shadow-[0_8px_16px_rgba(0,0,0,0.08)]';
// White box's ScrollSection starts its own whileInView animation this much
// after the pink box's, so the two are a staggered pair rather than one
// simultaneous fade.
const WHITE_BOX_DELAY = 0.18;

function PinkPunchHoles() {
  // Fixed-width column sized to exactly one hole's diameter (20px) — no
  // explicit column width was given in the export, just "fixed-width".
  return (
    <div
      aria-hidden="true"
      className="flex w-5 min-h-[200px] shrink-0 flex-col items-center justify-between self-stretch"
    >
      <span className="h-5 w-5 rounded-full bg-white-linen-200" />
      <div className="flex flex-col items-center gap-s">
        <span className="h-5 w-5 rounded-full bg-white-linen-200" />
        <span className="h-5 w-5 rounded-full bg-white-linen-200" />
      </div>
      <span className="h-5 w-5 rounded-full bg-white-linen-200" />
    </div>
  );
}

// Which of the 18 white-card punch holes is visible starting at which
// breakpoint. Indices are hand-picked (not a formula) so each tier is an
// evenly-spread subset of the next: 8 always-visible holes at indices
// [0,2,5,7,10,12,15,17], +3 more from sm (indices 3,8,13 -> 11 total),
// +3 more from md (indices 1,9,16 -> 14 total), +4 more from lg (indices
// 4,6,11,14 -> all 18). See WhitePunchHoles() below for why this needs to
// scale down at all.
const HOLE_VISIBILITY = [
  '', // 0
  'hidden md:block', // 1
  '', // 2
  'hidden sm:block', // 3
  'hidden lg:block', // 4
  '', // 5
  'hidden lg:block', // 6
  '', // 7
  'hidden sm:block', // 8
  'hidden md:block', // 9
  '', // 10
  'hidden lg:block', // 11
  '', // 12
  'hidden sm:block', // 13
  'hidden lg:block', // 14
  '', // 15
  'hidden md:block', // 16
  '', // 17
];

function WhitePunchHoles() {
  // Normal flex-flow child now, not absolutely positioned -- it's the first
  // item in the same flex column as the paragraph text, so the box's own
  // top padding and the column's gap-[24px] space it out naturally. mx-[-40px]
  // exactly cancels the parent's pr-[40px]/pl-[40px]. IMPORTANT: this row is
  // a flex ITEM inside that column, and the column is `items-center` (not
  // `items-stretch`), so it does NOT get 100% width for free -- without an
  // explicit width it shrinks to its own content (18 holes = 360px) and
  // `justify-between` has no extra space to distribute, collapsing all the
  // holes together instead of spreading them. w-[calc(100%+80px)] fixes
  // that: 100% resolves against the column's own width (the box's
  // padding-inset content width), and +80px cancels back out the
  // mx-[-40px] bleed on both sides, landing this row at the box's full
  // outer width -- fluid with the box itself, not a fixed number.
  // justify-between (not a fixed gap-[24px]) -- the box's own width is now
  // fluid, so the fixed 20px holes are spaced evenly across whatever width
  // is actually available rather than at a hardcoded gap that only ever
  // fit one constant box width.
  //
  // Below the md breakpoint the box itself keeps shrinking (down to real
  // phone widths, well under the 640px "sm" tier) -- packing all 18 holes
  // that far down would just cram them shoulder-to-shoulder instead of
  // staying proportional, and eventually overflow again. So not every
  // hole is visible at every width: 8 below 640px, 11 from 640-768px, 14
  // from 768-992px, all 18 from 992px+ -- a gradual, roughly-even step up
  // rather than a steep jump. Each tier's holes are a hand-picked, evenly
  // spread SUBSET of the next tier's (visible ones stay visible as the row
  // grows, new ones fill the gaps between them) rather than holes just
  // being chopped off one end. HOLE_VISIBILITY[i] gives hole i's minimum
  // breakpoint -- '' means always visible (part of the base 8).
  // justify-between then spaces however many are currently visible evenly
  // across the row either way.
  return (
    <div aria-hidden="true" className="mx-[-40px] flex w-[calc(100%+80px)] items-center justify-between px-s">
      {HOLE_VISIBILITY.map((visibleFrom, i) => (
        <span key={i} className={`h-5 w-5 shrink-0 rounded-full bg-bg-linen-dark ${visibleFrom}`} />
      ))}
    </div>
  );
}

function FourHighlight({ children }) {
  // Same stacking pattern as before: z-0 on this wrapping span gives it its
  // own stacking context, so -z-10 on the image is scoped safely within it
  // (rather than escaping to some ancestor context, as bit us with the nav
  // shape earlier).
  //
  // Sizing/position: rendered at Green-Scribble.svg's own native size (no
  // w-full stretch). top: var(--scribble-offset-default) is the shared
  // offset used across most of the underline/loop scribbles -- a fixed
  // 10px pull-up from the span's own line-box bottom, same value
  // everywhere rather than a per-font-metric calculation.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={fourScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 h-auto max-w-none -translate-x-1/2"
        style={{ top: 'var(--scribble-offset-default)' }}
      />
      <span className="heading-1-accent relative">{children}</span>
    </span>
  );
}

export default function Section1({ sectionRef }) {
  return (
    <section
      ref={sectionRef}
      id="section-1"
      className="relative flex h-dvh items-center bg-white-linen-200"
    >
      {/* Background image layer, sitting on top of the section's own
          bg-white-linen-200 color and behind everything else. As the
          section's first child with no z-index, it paints above the
          section's own background/border by default (children always
          paint above their parent's background) but below every later
          sibling here, since none of them set a competing negative
          z-index -- z-stacking is background color -> this image -> the
          pink/white boxes, purely from DOM order.

          <picture> picks ONE matching <source> (first, top-to-bottom, that
          matches its media query) rather than rendering all four and
          hiding three with CSS -- same breakpoints as the rest of the
          fluid work (640/992, matching sm/lg). The plain <img> fallback
          (no media query, lowest priority) is the S asset, covering
          anything below 640px (mobile). No separate L asset: the L
          export was dropped in favor of just reusing XL from 992px up,
          one fewer breakpoint-specific file to maintain where the
          artwork already reads fine shared across a wider range.
          className/alt/aria-hidden all live on the <img>, not <picture>
          itself (a non-rendered wrapper with no styling of its own) --
          `position: absolute` on the <img> still resolves against the
          <section>'s own `relative` since <picture> establishes no
          containing block of its own.

          object-position: below lg (XS/S/M -- everything using the two
          portrait-ish exports), top-center via object-top so the crop
          favors the top of the illustration rather than the crop
          centering that tends to lose it at narrower/taller aspect
          ratios; lg:object-center reverts to plain center-center for the
          XL asset, which was already exported/composed to look right
          centered. */}
      <picture>
        <source media="(min-width: 992px)" srcSet={bgFrame1Xl} />
        <source media="(min-width: 640px)" srcSet={bgFrame1M} />
        <img
          src={bgFrame1Xs}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-top pointer-events-none lg:object-center"
        />
      </picture>

      {/* px-page-margin-x lives here (not on the section itself) so the
          background image above -- absolute inset-0 relative to this
          section's padding box -- stays full-bleed edge-to-edge instead of
          getting inset by the same horizontal padding. content-cap: the
          site-wide desktop content cap -- caps this wrapper (and
          everything inside it) at 1140px from 1200px up, centered,
          regardless of what fixed widths the cards inside already use on
          their own. */}
      <div className="relative flex w-full flex-col items-center content-cap px-page-margin-x">
        {/* Pink box (heading). Animates in first -- this ScrollSection uses
            the wrapper's own default transition (no delay). */}
        <ScrollSection className="flex w-[800px] max-w-full min-h-[200px] flex-wrap items-center justify-center gap-s rounded-medium bg-bg-pink p-s origin-top-left rotate-1 md:w-[var(--width-card-content-md)] lg:w-[var(--width-card-content-lg)]">
          <PinkPunchHoles />
          <h1 className="heading-1 flex-1 px-s text-center text-heading-red">
            <AccessibleHighlightText
              before="Children from low-income families in Singapore are over "
              highlight={<FourHighlight>FOUR</FourHighlight>}
              after=" times more likely to underperform in school compared to their wealthier peers*"
            />
          </h1>
        </ScrollSection>

        {/* White box (body) + the tape, staggered ~180ms after the pink
            box. Directly below the pink box -- no gap value was given
            between them, so the two sit flush; the slight visual overlap
            comes from their opposing 1deg/-1deg rotations. */}
        <div className="relative w-[800px] max-w-full md:w-[var(--width-card-content-md)] lg:w-[var(--width-card-content-lg)]">
          <ScrollSection
            transition={{ duration: 0.6, ease: 'easeOut', delay: WHITE_BOX_DELAY }}
            className={`w-full origin-top-left -rotate-1 rounded-medium bg-bg-white pt-s pr-l pb-l pl-l ${CARD_SHADOW}`}
          >
            <div className="flex flex-col items-center gap-l">
              <WhitePunchHoles />
              <p className="body-paragraph text-center text-body-default">
                Not because they&rsquo;re any less capable, but because
                they&rsquo;re starting from further behind, with fewer chances to
                catch up.
              </p>
              <p className="body-paragraph text-center text-body-default">
                Without meaningful support, the gap widens. Poor grades lead to
                fewer opportunities. Fewer opportunities lead to lower-paying
                jobs. And the cycle of inequality continues, generation after
                generation.
              </p>
              <p className="caption text-center text-body-default">
                *Organisation for Economic Cooperation and Development (OECD)
                Report 2016
              </p>
            </div>
          </ScrollSection>

          {/* Rendered as its own independently-animated sibling rather than
              nested inside the card's ScrollSection -- a mix-blend-mode
              element whose ANCESTOR has opacity/transform actively tweening
              renders with the wrong, un-blended flat color for a frame or
              two (same isolated-compositing-layer issue as Section 6's
              tape). Same transition/delay as the card keeps them visually
              in sync. IMPORTANT: this wrapper (`.relative w-[800px]
              max-w-full` above) deliberately carries NO transform of its
              own -- a static rotate on a shared ancestor would ALSO wall
              the tape off from blending with whatever's behind/around the
              box (the pink box above, in this case), same isolation bug,
              just permanent instead of transient. So instead of inheriting
              the box's -1deg tilt via a shared wrapper, the tape carries
              the FULL composed rotation itself (originally 10deg on the
              tape nested inside a -1deg box == 9deg total on an
              independent sibling). `right` (not `left`): the wrapper's own
              width is now fluid (640px-800px across breakpoints); the
              original left:709.4px was only ever correct at the old
              constant 800px width, and became a fixed distance from the
              LEFT edge that increasingly overshot past the box's own
              (now-narrower) right edge as the box shrank -- anchoring from
              the right edge instead keeps the tape pinned the same ~16.4px
              past the box's corner (its original, intentional overhang
              into the pink box's seam) at any width in the fluid range. */}
          <ScrollSection
            as="span"
            transition={{ duration: 0.6, ease: 'easeOut', delay: WHITE_BOX_DELAY }}
            aria-hidden="true"
            className="pointer-events-none absolute origin-top-left rotate-[9deg] bg-prelude-300 mix-blend-multiply"
            style={{ width: '107px', height: '38px', right: '-16.4px', top: '-40.39px' }}
          />
        </div>
      </div>
    </section>
  );
}

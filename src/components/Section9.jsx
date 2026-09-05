import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import ArrowButton from './ArrowButton.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import paperClipBlack from '../assets/Paper-Clip-Black.png';
import slide1 from '../assets/section-9/Capy-Slide-Item-1.jpg';
import slide2 from '../assets/section-9/Capy-Slide-Item-2.jpg';
import slide3 from '../assets/section-9/Capy-Slide-Item-3.jpg';
import slide4 from '../assets/section-9/Capy-Slide-Item-4.jpg';
import slide5 from '../assets/section-9/Capy-Slide-Item-5.jpg';

// alt text transcribed directly from each screenshot's own on-screen
// content (verified by reading the actual images, not placeholder text).
// Deliberately doesn't lead with "Laptop screen showing" -- the section's
// own "Capy Activity Hub" heading already establishes these are app
// screenshots, and repeating that same lead-in 5 times in a row through a
// screen reader (one slide after another in this carousel) reads like a
// stutter/stuck-loop error rather than 5 distinct images.
const SLIDES = [
  {
    src: slide1,
    alt: "Capy's credit system explainer page, alongside activity listings including ZooKeeper for a Day and Paper Marbling on a Rooftop Garden.",
  },
  {
    src: slide2,
    alt: "Capy's Browse Activities page with category filters and activity cards for Super Kids Sports Mash-up, Paper Marbling on a Rooftop Garden, and ZooKeeper for a Day.",
  },
  {
    src: slide3,
    alt: "Capy's Pick a Plan page with a 'Get 1 month FREE!' offer, next to a photo of a family playing together in an indoor ball-pit playground.",
  },
  {
    src: slide4,
    alt: "Capy's Available Plans page listing four membership tiers, from a free plan to a 50-credit SGD 20 per month plan.",
  },
  {
    src: slide5,
    alt: "Capy's homepage with the headline 'Find your perfect adventure!' alongside photos of children ziplining, crafting, and playing with toy blasters.",
  },
];

// XL keeps its fixed pixel slide size (unchanged). M gets its own 560px
// width, same 3:2 aspect ratio as XL (720/480) rather than a different
// crop -- 560 * (480/720) = 373.33. At S each slide fills the full
// viewport width instead (see the slide `<div>` below) -- `s` here only
// supplies that slide's own aspect ratio, so a narrower or wider phone
// still gets a proportional (not stretched/cropped) image.
const SLIDE_SIZES = {
  s: { width: 365.15, height: 246.93 },
  m: { width: 560, height: 373.33 },
  xl: { width: 720, height: 480 },
};
const SLIDE_GAP = 16;

// Seamless infinite loop, the standard "clone slides onto each end"
// carousel trick: EXTENDED_SLIDES duplicates the last LEADING_CLONES
// slides onto the front and the first TRAILING_CLONES onto the back, so
// there's always real (if duplicate) slide art to animate onto when
// stepping past either end -- a plain modulo wrap has nothing to show
// mid-animation for "one step past the last slide" and either has to
// jump backward across the whole row or skip the animation outright.
// 2 on each side (not 1) covers wide viewports where more than one
// neighbor can peek past the pink column at once (own comment on that
// column further down) -- harmless extra DOM nodes if only one would've
// been visible. Real accessibility content (role/label/aria-hidden) is
// keyed off each slide's own realIndex, never off its position in this
// extended array -- own comment further down on why clones stay
// permanently aria-hidden regardless of which one is "showing."
const LEADING_CLONES = 2;
const TRAILING_CLONES = 2;
const EXTENDED_SLIDES = [
  ...SLIDES.slice(-LEADING_CLONES).map((slide, i) => ({
    ...slide,
    isClone: true,
    realIndex: SLIDES.length - LEADING_CLONES + i,
  })),
  ...SLIDES.map((slide, i) => ({ ...slide, isClone: false, realIndex: i })),
  ...SLIDES.slice(0, TRAILING_CLONES).map((slide, i) => ({ ...slide, isClone: true, realIndex: i })),
];
// The array's own true middle position -- where a slide sits with zero
// translateX needed, purely by the row's own flex-centering (own
// comment on offsetX further down). Always an integer: LEADING_CLONES
// and TRAILING_CLONES are equal, so the total length is always odd.
const NATURAL_CENTER = (EXTENDED_SLIDES.length - 1) / 2;

// Same story for the paper clip -- a deliberate per-tier resize and
// reposition, not a fluid scale (both sizes share the same ~0.875 aspect
// ratio, but the S position isn't derivable from the XL one by any
// simple formula).
const PAPERCLIP = {
  s: { width: 38, height: 43.43, left: 323, top: 31.94 },
  // m: self-adjusting via `right` (not a literal left px) -- the pink
  // text box is no longer a fixed 960px at M (now 100% width, see the
  // wrapper's own comment below), so a fixed left offset tuned against
  // one specific width can't stay flush with the box's actual right
  // edge across the whole fluid M range. `right: 0` reproduces the same
  // flush-with-zero-overhang position xl always had (904+56=960, i.e.
  // exactly the box's own edge) at any width instead. Size/top unchanged
  // from xl -- nothing about this shape or its vertical anchor depends
  // on the box's width.
  m: { width: 56, height: 64, right: 0, top: 16 },
  xl: { width: 56, height: 64, left: 904, top: 16 },
};

function PillDot() {
  return <span aria-hidden="true" className="h-[11.62px] w-[11.62px] flex-shrink-0 origin-top-left rotate-3 rounded-full bg-bg-pink" />;
}

function HolePunchDot() {
  return <span aria-hidden="true" className="h-5 w-5 flex-shrink-0 rounded-full bg-bg-linen-dark" />;
}


export default function Section9() {
  // Centered on slide 1 (index 0) when the section is first reached --
  // LEADING_CLONES + 0 is that slide's own position within
  // EXTENDED_SLIDES (own comment on it above).
  const [trackIndex, setTrackIndex] = useState(LEADING_CLONES);
  const shouldReduceMotion = useReducedMotion();
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  // Only needed to tell M apart from L/XL (the pink text box width, the
  // Capy Activity Hub tag/paragraph stacking, and the slide size all
  // diverge there) -- isAtLeastSm still does all the S-vs-(M-or-XL)
  // work it always did (px-based slide math vs. 100vw math, etc).
  const isAtLeastLg = useMediaQuery('(min-width: 992px)');
  const tier = !isAtLeastSm ? 's' : !isAtLeastLg ? 'm' : 'xl';

  const { width: SLIDE_WIDTH, height: SLIDE_HEIGHT } = tier === 'xl' ? SLIDE_SIZES.xl : SLIDE_SIZES.m;
  const paperclip = PAPERCLIP[tier];

  // Real slide currently exposed to the accessibility tree/live region --
  // derived from trackIndex, not tracked separately, so it's always in
  // sync even mid-transition onto a clone (a clone's realIndex is the
  // same slide it's a duplicate of, own comment on EXTENDED_SLIDES).
  // True modulo (the extra `+ SLIDES.length) %` ) since trackIndex can
  // briefly sit one step outside [LEADING_CLONES, LEADING_CLONES +
  // SLIDES.length) while animating onto a clone, and JS's `%` alone
  // returns negative results for negative input.
  const realIndex = ((trackIndex - LEADING_CLONES) % SLIDES.length + SLIDES.length) % SLIDES.length;

  // isAnimatingRef (a ref, not state -- it doesn't need to trigger a
  // render, just gate the next click) ignores Prev/Next while a step is
  // in flight, so trackIndex can never advance more than one position
  // past the real zone before settleStep resets it -- without this, a
  // fast double-click could push trackIndex past the clone buffer
  // entirely and index past the end of EXTENDED_SLIDES.
  const isAnimatingRef = useRef(false);
  // Set right before the RESET step only (real clone position -> its
  // real-slide equivalent) -- own comment on the transition prop further
  // down explains why that specific step must be instant.
  const [skipAnimation, setSkipAnimation] = useState(false);
  // Matches the real transition's own duration below, plus a small
  // buffer so the reset (own comment on settleStep) never fires a beat
  // before the CSS transition has actually finished settling.
  const STEP_DURATION_MS = 400;

  // Settling logic runs off a plain setTimeout keyed to the CSS
  // transition's own duration, NOT Framer's onAnimationComplete --
  // that was the first approach here, and it turned out to be
  // genuinely unreliable for this specific animation: confirmed via
  // production build (`npm run build && npm run preview`, not just dev
  // mode -- this wasn't a StrictMode artifact) that it fired
  // consistently for every step in one direction (Next) but silently
  // never fired at all after stepping toward a clone in the other
  // direction (Prev), permanently stuck on the isAnimatingRef gate with
  // nothing to release it. A plain timer has no such dependency on
  // Framer's internal completion bookkeeping. `next` is captured at
  // call time (not read back from state later), so there's no stale-
  // closure risk the way reading trackIndex inside a delayed callback
  // would have.
  function settleStep(next) {
    window.setTimeout(
      () => {
        isAnimatingRef.current = false;
        const inRealZone = next >= LEADING_CLONES && next < LEADING_CLONES + SLIDES.length;
        if (!inRealZone) {
          const nextRealIndex = ((next - LEADING_CLONES) % SLIDES.length + SLIDES.length) % SLIDES.length;
          setSkipAnimation(true);
          setTrackIndex(LEADING_CLONES + nextRealIndex);
        }
      },
      shouldReduceMotion ? 0 : STEP_DURATION_MS,
    );
  }

  const goToPrev = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    const next = trackIndex - 1;
    setSkipAnimation(false);
    setTrackIndex(next);
    settleStep(next);
  };
  const goToNext = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    const next = trackIndex + 1;
    setSkipAnimation(false);
    setTrackIndex(next);
    settleStep(next);
  };

  // Shifts the row so trackIndex's own slide sits where the row's
  // natural (unshifted) center already is -- the row is flex-centered
  // via the parent's `justify-center`, so at NATURAL_CENTER (the
  // extended row's own middle item) no shift is needed at all; every
  // step away from it shifts by one slide-and-gap. At S each slide is a
  // full 100vw with no gap between them (one slide fills the screen at a
  // time), so the step is expressed in vw rather than a measured pixel
  // width -- this stays correct at any device width, not just the 375px
  // the reference was drawn at.
  const offsetX = isAtLeastSm
    ? (NATURAL_CENTER - trackIndex) * (SLIDE_WIDTH + SLIDE_GAP)
    : `${(NATURAL_CENTER - trackIndex) * 100}vw`;

  return (
    <section
      id="section-9"
      // overflow-x-clip, not overflow-x-hidden -- see Section13's own
      // comment on the identical fix: `hidden` on just one axis silently
      // auto-pairs the other to `auto`, turning the section into its own
      // nested scroll container. `clip` clips the same decorative bleed
      // without that side effect.
      className="relative flex w-full flex-col items-center justify-center overflow-x-clip bg-white-linen-100 px-page-margin-x py-page-margin-y"
    >
      {/* w-full carries through S AND M now (was sm:w-[960px], applying
          from 640px up unconditionally) -- "width of the pink text box
          is 100%" is specifically an M-tier ask; lg:w-[960px] restores
          the original fixed value from 992px up, unchanged from before.
          lg:max-w-full stays paired with it (960px is already wider than
          the available column at the low end of L, e.g. 992-64=928), same
          safety net the old sm:max-w-full provided. */}
      <div className="flex w-full flex-col items-start justify-start lg:w-[960px] lg:max-w-full">
        {/* Header tab + text block animate together as one unit (was two
            separately-staggered ScrollSections) -- the paper clip is
            absolutely positioned against this same wrapper, so it stays
            anchored to the pink block regardless of its content height. */}
        <ScrollSection className="relative flex w-full flex-col items-start justify-start self-stretch">
          <div className="flex items-start justify-end rounded-t-large bg-bg-pink px-l py-s sm:rounded-t-medium">
            <h2 className="heading-2 text-heading-red">We built and tested ideas</h2>
          </div>

          <div className="flex w-full items-start justify-end gap-m bg-bg-pink pb-l pl-l pr-s pt-l sm:pb-m sm:pt-m">
            <div className="flex flex-1 flex-col items-start justify-start gap-xl lg:gap-m">
              <p className="body-paragraph self-stretch text-body-default">
                Over the past three years, we built, tested, and refined different ideas with families. We started
                with simple prototypes, tested them with users, and used what we learned to improve them and develop
                higher-fidelity versions for further testing.
              </p>

              {/* flex-col carries through S AND M now (was sm:flex-row,
                  applying from 640px up unconditionally) -- "stack Capy
                  Activity Hub and the paragraph" is an M-tier ask;
                  lg:flex-row/lg:gap-l restores the original side-by-side
                  layout from 992px up, unchanged from before. gap-xs
                  (was gap-xl) below lg: the tag and its own description
                  read as one visual group, not two separate blocks, so
                  they sit closer together than the gap above (between
                  this group and the first paragraph, now gap-xl on the
                  outer wrapper) -- unchanged at lg+, which keeps its own
                  lg:gap-l for the side-by-side layout. */}
              <div className="flex flex-col items-start justify-start gap-xs self-stretch lg:flex-row lg:gap-l">
                {/* w-full stays S-only (unchanged, pre-existing). At M
                    the tag shouldn't stretch to the stacked column's
                    full width -- sm:w-fit hugs its own content instead,
                    staying left-aligned via the parent's items-start.
                    lg:w-[256px] restores the original fixed width for
                    the side-by-side row layout, paired with lg:flex-row
                    above. */}
                <div className="flex w-full flex-shrink-0 origin-top-left -rotate-2 items-center justify-start bg-bg-white p-xs sm:w-fit lg:w-[256px]">
                  <PillDot />
                  <h3 className="heading-3 flex-1 text-center text-heading-red">Capy Activity Hub</h3>
                  <PillDot />
                </div>
                <p className="body-paragraph flex-1 text-body-default">
                  We designed a monthly class-pass platform under the working name Capy Activity Hub, that gives
                  parents access to enrichment activities at a lower cost. The app also records children&rsquo;s
                  achievements, giving families a way to track their progress over time.
                </p>
              </div>
            </div>

            <div className="flex origin-top-left rotate-1 flex-col items-start justify-start gap-s">
              <HolePunchDot />
              <HolePunchDot />
            </div>
          </div>

          <img
            src={paperClipBlack}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              width: `${paperclip.width}px`,
              height: `${paperclip.height}px`,
              top: `${paperclip.top}px`,
              // m uses a self-adjusting `right` instead of a literal
              // `left` px (see PAPERCLIP's own comment) -- spread
              // whichever one this tier's entry actually has, rather
              // than assuming left always exists.
              ...(paperclip.right !== undefined ? { right: `${paperclip.right}px` } : { left: `${paperclip.left}px` }),
            }}
          />
        </ScrollSection>

        {/* Outer band: full-bleed to the viewport edges regardless of
            this 960px content column -- `calc(50% - 50vw)` margins break
            out to the true viewport width (the standard technique for a
            full-bleed child inside a centered fixed-width container).
            Width must be set explicitly to 100vw too: `w-full` alone
            resolves against this 960px parent, not the viewport, so the
            box stayed 960px wide even once the margins shifted its left
            edge to x=0. This band itself carries NO background and only
            exists to overflow-hidden the bleed at the true screen edge
            (preventing page-level horizontal scroll) -- the pink itself
            stays confined to the 960px column below, matching the header/
            text block above it; only the photos are meant to bleed past
            that column into the plain page background on both sides.

            role/aria-roledescription/aria-label follow the W3C ARIA APG
            carousel pattern (w3.org/WAI/ARIA/apg/patterns/carousel/):
            the region is the carousel's own accessible container --
            label deliberately doesn't include the word "carousel", since
            aria-roledescription already announces that. tabIndex={-1}
            (own explicit prop below, not covered by this comment block's
            original scope) makes the region itself a real swipe stop --
            without it, real VoiceOver swipe skips straight past this
            non-interactive container to its first focusable child (the
            Previous button), so a user never hears "Capy Activity Hub
            screenshots, carousel" at all before "Previous slide, button".
            This used to
            keep all 5 images permanently in the DOM/reading order
            regardless of which was visually centered (so linear reading
            reached all 5 without touching a control) -- reworked below
            to the APG's actual single-active-slide model instead: only
            ONE slide is exposed to the accessibility tree at a time
            (own comment on aria-hidden further down), matching how
            carousels conventionally work and how AT users expect one to
            behave, at the cost of needing Previous/Next to reach the
            other 4 rather than getting them for free while reading. */}
        <ScrollSection
          role="region"
          aria-roledescription="carousel"
          aria-label="Capy Activity Hub screenshots"
          tabIndex={-1}
          className="relative overflow-hidden"
          style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
        >
          {/* Buttons come BEFORE the slide content in DOM/reading order --
              the APG example carousel does the same ("buttons precede
              slide content in tab order"), and it matters more here than
              it might elsewhere: with only one slide exposed at a time
              (below), Previous/Next are the ONLY way to reach the other
              4, so a screen reader user should hit them immediately, not
              after already reading the one slide they'd use the buttons
              to get past. Visual position is unaffected by this reorder
              -- both are `absolute` against this same band regardless of
              where they sit in the DOM. Real, focusable, announced
              controls, never aria-hidden (see ArrowButton's own comment
              for the Chrome bug that causes when tried) -- also the only
              way for a sighted keyboard-only user to change slides at
              all, since the slides themselves carry no tabindex.

              z-10: needed now that these render BEFORE the slide track
              in the DOM (above) -- the track is a motion.div with an
              animated `x` offset, and Framer applies that as an inline
              `transform`, which creates its own stacking context. Among
              same-level (no z-index) stacking contexts, later DOM order
              wins paint order, so once the buttons moved earlier than
              the track, the track started painting over them despite
              still being `position: absolute` underneath. An explicit
              z-index decouples paint order from DOM/reading order, so
              the reorder above can serve accessibility without breaking
              visibility for sighted users.

              Inset: from sm up, the pink column below is a centered
              960px box inside this full-bleed 100vw band (own comment
              on it further down) -- calc(50% - 480px) lands exactly on
              that box's own left/right edge (half its 960px width from
              center), same breakout-math family as the full-bleed
              technique itself, just for landing ON an edge instead of
              escaping past one. Below sm there's no pink box at all (the
              image runs edge-to-edge there, own comment on the pink
              column), so this falls back to the page's own margin
              rhythm instead, matching every other section's S-tier
              inset. */}
          <ArrowButton
            direction="left"
            onClick={goToPrev}
            label="Previous slide"
            size={48}
            iconSize={32}
            bg="bg-bg-linen-light"
            className="absolute top-1/2 z-10 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            style={{ left: isAtLeastSm ? 'calc(50% - 480px)' : 'var(--spacing-page-margin-x)' }}
          />
          <ArrowButton
            direction="right"
            onClick={goToNext}
            label="Next slide"
            size={48}
            iconSize={32}
            bg="bg-bg-linen-light"
            className="absolute top-1/2 z-10 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            style={{ right: isAtLeastSm ? 'calc(50% - 480px)' : 'var(--spacing-page-margin-x)' }}
          />

          {/* Pink column: pinned to the same 960px width as the content
              above (not full-bleed), height hugging whatever the rotated
              row needs -- the row itself is wider than this box and
              isn't clipped by it (no overflow-hidden here), so the
              images still visually spill past its left/right edges even
              though the pink background doesn't. Transparent at S: below
              sm each slide is already a full 100vw image with no gap
              between them, so there's no pink to peek through by design --
              carrying the XL pink chrome down would just show as an
              unwanted strip of color past the rotated row's bounding box. */}
          <div className="mx-auto flex w-full max-w-full flex-col items-center justify-center bg-transparent sm:w-[960px] sm:bg-bg-pink">
            <div className="origin-top-left -rotate-1">
              {/* Plain <div>s for the track's own flex/gap layout and
                  Framer's translateX animation, matching W3C's own APG
                  carousel reference implementation (which uses a plain
                  div.carousel-item per slide, role="group" +
                  aria-roledescription="slide" directly on it -- no
                  ul/li at all) rather than a semantic list. An earlier
                  version of this used <ul>/<li> with role="presentation"
                  on the <ul> to strip its implicit list semantics (a
                  bare <ul> otherwise announces "list, N items" right
                  alongside the "1 of 5" slide label -- confusing, and
                  actively wrong once only one <li> is ever exposed at a
                  time). Plain divs need none of that: they carry no
                  implicit role to strip in the first place, and axe/
                  Lighthouse's aria-allowed-role check (which flagged
                  role="group" on <li> as incompatible, even though it's
                  literally the APG pattern) has nothing to flag on a div
                  either, since div accepts any role.

                  aria-live="polite"/aria-atomic="false" live here now
                  (was a separate hand-built "Slide N of 5" sr-only div,
                  removed) -- matching the W3C reference exactly, which
                  puts aria-live on the container holding the slide
                  groups, not on a standalone duplicate string. The old
                  separate live region and the active slide's own
                  aria-label ("N of 5" + aria-roledescription="slide")
                  said the exact same position in two different word
                  orders back to back for anyone who clicked Next/Prev
                  and then swiped onward -- confirmed as a real double
                  announcement, not just a theoretical one, since swiping
                  onward after a button press is the normal way screen-
                  reader touch users move through content. With aria-live
                  on the track itself, the previously-hidden slide
                  becoming un-aria-hidden IS the change the live region
                  picks up and announces via that slide's own label, so
                  there's exactly one announcement now, not two. */}
              <motion.div
                aria-live="polite"
                aria-atomic="false"
                className="flex items-start justify-start gap-0 sm:gap-s"
                animate={{ x: offsetX }}
                // skipAnimation (own comment on it above) goes instant
                // rather than animated, same as reduced-motion -- this is
                // specifically the reset step from a clone position back
                // to its real-slide equivalent, which must be an
                // invisible snap rather than a visible second slide.
                // Duration in seconds here (Framer's own unit for this
                // prop) vs. STEP_DURATION_MS above (milliseconds, for a
                // plain setTimeout) -- 0.35s vs 400ms is deliberate, not
                // drift: settleStep's timer needs to run a little AFTER
                // the visual transition actually finishes, never before.
                transition={shouldReduceMotion || skipAnimation ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
              >
                {EXTENDED_SLIDES.map((slide, i) => (
                  // Clones are unconditionally aria-hidden, full stop --
                  // never exposed regardless of realIndex, since they're
                  // purely a visual stand-in for the seamless loop (own
                  // comment on EXTENDED_SLIDES above). Only a REAL entry
                  // (isClone false) ever becomes reachable, and only the
                  // one matching realIndex -- the APG single-active-slide
                  // model, same as before this rework, just now checked
                  // against realIndex instead of activeIndex directly.
                  <div
                    key={i}
                    role={slide.isClone ? undefined : 'group'}
                    aria-roledescription={slide.isClone ? undefined : 'slide'}
                    aria-label={slide.isClone ? undefined : `${slide.realIndex + 1} of ${SLIDES.length}`}
                    aria-hidden={slide.isClone || slide.realIndex !== realIndex ? true : undefined}
                    className="flex-shrink-0"
                    style={
                      isAtLeastSm
                        ? { width: `${SLIDE_WIDTH}px`, height: `${SLIDE_HEIGHT}px` }
                        : { width: '100vw', aspectRatio: `${SLIDE_SIZES.s.width} / ${SLIDE_SIZES.s.height}` }
                    }
                  >
                    <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </ScrollSection>
      </div>
    </section>
  );
}

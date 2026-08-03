import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import ArrowButton from './ArrowButton.jsx';
import paperClipBlack from '../assets/Paper-Clip-Black.png';
import slide1 from '../assets/section-9/Capy-Slide-Item-1.jpg';
import slide2 from '../assets/section-9/Capy-Slide-Item-2.jpg';
import slide3 from '../assets/section-9/Capy-Slide-Item-3.jpg';
import slide4 from '../assets/section-9/Capy-Slide-Item-4.jpg';
import slide5 from '../assets/section-9/Capy-Slide-Item-5.jpg';

// alt text transcribed directly from each screenshot's own on-screen
// content (verified by reading the actual images, not placeholder text).
const SLIDES = [
  {
    src: slide1,
    alt: "Laptop screen showing Capy's credit system explainer page, alongside activity listings including ZooKeeper for a Day and Paper Marbling on a Rooftop Garden.",
  },
  {
    src: slide2,
    alt: "Laptop screen showing Capy's Browse Activities page with category filters and activity cards for Super Kids Sports Mash-up, Paper Marbling on a Rooftop Garden, and ZooKeeper for a Day.",
  },
  {
    src: slide3,
    alt: "Laptop screen showing Capy's Pick a Plan page with a 'Get 1 month FREE!' offer, next to a photo of a family playing together in an indoor ball-pit playground.",
  },
  {
    src: slide4,
    alt: "Laptop screen showing Capy's Available Plans page listing four membership tiers, from a free plan to a 50-credit SGD 20 per month plan.",
  },
  {
    src: slide5,
    alt: "Laptop screen showing Capy's homepage with the headline 'Find your perfect adventure!' alongside photos of children ziplining, crafting, and playing with toy blasters.",
  },
];

// One image's own width, and the row's own gap (spacing-s, fixed at 16px
// across all breakpoints) -- both feed the translateX math that centers
// the active slide.
const SLIDE_WIDTH = 720;
const SLIDE_HEIGHT = 480;
const SLIDE_GAP = 16;
const CENTER_INDEX = 2;

function PillDot() {
  return <span aria-hidden="true" className="h-[11.62px] w-[11.62px] flex-shrink-0 origin-top-left rotate-3 rounded-full bg-bg-pink" />;
}

function HolePunchDot() {
  return <span aria-hidden="true" className="h-5 w-5 flex-shrink-0 rounded-full bg-bg-linen-dark" />;
}


export default function Section9() {
  // Centered on slide 3 (index 2) when the section is first reached.
  const [activeIndex, setActiveIndex] = useState(CENTER_INDEX);
  const shouldReduceMotion = useReducedMotion();

  const goToPrev = () => setActiveIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const goToNext = () => setActiveIndex((i) => (i + 1) % SLIDES.length);

  // Shifts the row so activeIndex's own slide sits where the row's
  // natural (unshifted) center already is -- the row is flex-centered
  // via the parent's `justify-center`, so at CENTER_INDEX (the row's own
  // middle item) no shift is needed at all; every step away from it
  // shifts by one slide-and-gap.
  const offsetX = (CENTER_INDEX - activeIndex) * (SLIDE_WIDTH + SLIDE_GAP);

  return (
    <section
      id="section-9"
      className="relative flex w-full flex-col items-center justify-center bg-white-linen-100 px-page-margin-x py-page-margin-y"
    >
      <div className="flex w-[960px] max-w-full flex-col items-start justify-start">
        {/* Header tab + text block animate together as one unit (was two
            separately-staggered ScrollSections) -- the paper clip is
            absolutely positioned against this same wrapper, so it stays
            anchored to the pink block regardless of its content height. */}
        <ScrollSection className="relative flex w-full flex-col items-start justify-start self-stretch">
          <div className="flex items-start justify-end rounded-t-medium bg-bg-pink px-l py-s">
            <h2 className="heading-2 text-heading-red">We built and we tested</h2>
          </div>

          <div className="flex w-full items-start justify-end gap-m bg-bg-pink pb-m pl-l pr-s pt-m">
            <div className="flex flex-1 flex-col items-start justify-start gap-m">
              <p className="body-paragraph self-stretch text-body-default">
                Over the past three years, we built, tested, and reworked ideas. Always with families, not just for
                them. We started with lo-fi prototypes, tested them, then refined them into high-fi versions for
                further trials.
              </p>

              <div className="flex items-start justify-start gap-l self-stretch">
                <div className="flex w-[256px] flex-shrink-0 origin-top-left -rotate-2 items-center justify-start bg-bg-white p-xs">
                  <PillDot />
                  <h3 className="heading-3 flex-1 text-center text-heading-red">Capy Activity Hub</h3>
                  <PillDot />
                </div>
                <p className="body-paragraph flex-1 text-body-default">
                  A monthly class-pass platform that lets parents access enrichment activities at a low cost.
                  Achievements are logged in the app&ndash;turning small wins into long-term confidence.
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
            className="pointer-events-none absolute h-[64px] w-[56px]"
            style={{ left: '904px', top: '16px' }}
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

            All 5 images stay permanently in the DOM in fixed order --
            only the row's translateX offset changes with activeIndex, so
            a screen reader user reading through this section encounters
            all 5 images' alt text regardless of carousel state; the
            visual centering/animation is a sighted-user affordance
            layered on top, not the access mechanism. */}
        <ScrollSection
          className="relative overflow-hidden"
          style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
        >
          {/* Pink column: pinned to the same 960px width as the content
              above (not full-bleed), height hugging whatever the rotated
              row needs -- the row itself is wider than this box and
              isn't clipped by it (no overflow-hidden here), so the
              images still visually spill past its left/right edges even
              though the pink background doesn't. */}
          <div className="mx-auto flex w-[960px] max-w-full flex-col items-center justify-center bg-bg-pink">
            <div className="origin-top-left -rotate-1">
              {/* A plain <ul>/<li> list -- not just a row of <img>s -- so a
                  screen reader announces "list, 5 items" and "item N of 5"
                  as it moves through them, giving a sense of position
                  within the set that a flat sequence of images doesn't.
                  role="list" is a defensive backstop: Tailwind's preflight
                  resets list-style to none on every <ul>, and some older
                  Safari/VoiceOver versions drop the implicit list/listitem
                  semantics once list-style is none. */}
              <motion.ul
                role="list"
                className="flex items-start justify-start gap-s"
                animate={{ x: offsetX }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
              >
                {SLIDES.map((slide, i) => (
                  <li
                    key={slide.src}
                    role="listitem"
                    className="flex-shrink-0"
                    style={{ width: `${SLIDE_WIDTH}px`, height: `${SLIDE_HEIGHT}px` }}
                  >
                    <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>

          {/* Arrows sit on this outer, unrotated band (not the tilted
              image row -- matches the reference, where the buttons stay
              upright against the tilted photos) and are inset from the
              true viewport edge rather than the row's own edges: now
              that each slide (720px) is wider than half the viewport,
              insetting from the row's edges put them far off-screen (the
              row is much wider than the viewport and centered, so a
              720px inset from ITS edge no longer lands anywhere near the
              visible area). page-margin-x keeps the same rhythm as the
              rest of the page's own side margins.

              `decorative`: hidden from screen readers/Tab order -- all 5
              slides stay permanently in the DOM (see the list comment
              above), so a screen reader user already reaches every image
              in normal reading order regardless of activeIndex. These
              arrows only recenter which slide is visually highlighted;
              they don't gate access to anything an AT user couldn't
              already reach. */}
          <ArrowButton
            direction="left"
            onClick={goToPrev}
            label="Previous slide"
            size={48}
            iconSize={32}
            bg="bg-bg-linen-light"
            className="absolute top-1/2 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            style={{ left: 'var(--spacing-page-margin-x)' }}
            decorative
          />
          <ArrowButton
            direction="right"
            onClick={goToNext}
            label="Next slide"
            size={48}
            iconSize={32}
            bg="bg-bg-linen-light"
            className="absolute top-1/2 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            style={{ right: 'var(--spacing-page-margin-x)' }}
            decorative
          />
        </ScrollSection>
      </div>
    </section>
  );
}

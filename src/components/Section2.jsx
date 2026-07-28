import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import bgScene1 from '../assets/Desktop-BG--Frame-2.svg';
import bgScene2 from '../assets/Desktop-BG--Frame-2B.svg';
import pinkScribble from '../assets/Pink-Scribble.svg';
import paperClip from '../assets/Paper-Clip.png';
import paperClipBlack from '../assets/Paper-Clip-Black.png';
import paperBorderTop from '../assets/Paper-Border-Top.png';

// Crossfade window: both the background (color + image) and the card
// transition (Scene 1 rising / flattening, Scene 2 fading in) happen across
// this same slice of scroll progress, so everything reads as one coordinated
// transition rather than several independently-timed effects.
const TRANSITION_START = 0.4;
const TRANSITION_END = 0.6;

function HoleColumn({ color }) {
  // Plain even-gap stack (not Section 1's split top/pair/bottom pattern) --
  // 5 holes, gap-s between each, no special-casing of the middle ones.
  //
  // Color is a motion value (backgroundColor via inline style, not a
  // static bg-bg-blue class) so it crossfades from Scene 1's blue to
  // Scene 2's linen-dark in step with the background (see holeColumnColor
  // below).
  return (
    <div aria-hidden="true" className="flex flex-col items-start justify-center gap-s">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span key={i} style={{ backgroundColor: color }} className="h-5 w-5 rounded-full" />
      ))}
    </div>
  );
}

// Paper-Border-Top.png's native size is 760x55px -- way too large to use as
// a repeat-x tile directly (previous version left it at native size, so
// repeat-x tiled at 760px-wide, 55px-tall increments instead of a small
// texture unit). Scale it down to a proper tile: 24px tall, with width
// derived from the source's own aspect ratio so it doesn't distort.
const BORDER_TILE_HEIGHT = 24;
const BORDER_TILE_WIDTH = (760 / 55) * BORDER_TILE_HEIGHT;

function TopBorderImage() {
  // Replaces the circle-based hole-punch pattern for Scene 2's second card
  // only (Scene 1's card keeps HoleColumn's circles). A background-image
  // (not a plain <img>) so repeat-x is available. background-size sets the
  // tile to BORDER_TILE_WIDTH x BORDER_TILE_HEIGHT BEFORE repeat-x kicks
  // in, so the pattern actually repeats at a small, correctly-proportioned
  // unit rather than the source file's native resolution.
  //
  // Per the Figma reference, this strip sits ABOVE the card entirely -- the
  // card's own box (640x200 in Figma's own dev-mode annotation) starts
  // below the border, not underneath it. bottom-full (bottom: 100%)
  // positions this div's own bottom edge flush with the card's top edge,
  // so the whole strip renders above the card instead of inside it, where
  // it was getting painted underneath the card's own white background.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-full"
      style={{
        height: `${BORDER_TILE_HEIGHT}px`,
        backgroundImage: `url(${paperBorderTop})`,
        backgroundSize: `${BORDER_TILE_WIDTH}px ${BORDER_TILE_HEIGHT}px`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'left top',
      }}
    />
  );
}

function MatterHighlight() {
  // Same technique as FOUR in Section 1 and Section 2's standalone build:
  // z-0 gives this span its own stacking context so -z-10 on the image
  // stays scoped inside it; the image renders at its own natural size.
  return (
    <span className="body-paragraph-large relative z-0 inline-block whitespace-nowrap text-center text-heading-blue">
      <img
        src={pinkScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 h-auto max-w-none -translate-x-1/2 -translate-y-1/2"
      />
      <span className="relative">matter</span>
    </span>
  );
}

function Scene1Content({ holeColumnColor }) {
  return (
    <>
      {/* Paper clip 1: ~26x65px target, rotate(150deg) from its top-left
          corner. See Section 2's earlier standalone build for the
          intrinsic-ratio note -- same asset, same approximation. */}
      <img
        src={paperClip}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute origin-top-left rotate-[150deg]"
        style={{ width: '26px', height: '65px', left: '57px', top: '44px' }}
      />

      <HoleColumn color={holeColumnColor} />

      <div className="flex flex-1 flex-col items-start justify-start gap-s">
        <p className="body-paragraph self-stretch text-left text-body-default">
          In 2023, 55 Minutes started Capy, a design-led initiative focused
          on one question:
        </p>
        <div className="flex flex-wrap content-start items-start justify-center gap-x-xs self-stretch">
          <span className="body-paragraph-large text-center text-heading-blue">
            What if we could help children from
          </span>
          <span className="body-paragraph-large text-center text-heading-blue">
            low-income families feel like they{' '}
          </span>
          <MatterHighlight />
        </div>
      </div>
    </>
  );
}

function Scene2Content() {
  return (
    <>
      <TopBorderImage />

      {/* Paper clip 2: a different asset from paper clip 1 (Paper-Clip-Black.png,
          not Paper-Clip.png), rotated -90deg, poking out the card's left
          edge (negative left offset). Explicit width/height -- the source
          PNG is 250x287px natively, way larger than intended, so it must
          be constrained rather than left at natural size. */}
      <img
        src={paperClipBlack}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute origin-top-left rotate-[-90deg]"
        style={{ width: '56px', height: '64.29px', left: '-48px', top: '128px' }}
      />

      <p className="body-paragraph text-body-default">
        Many of these children grow up hearing what they can&rsquo;t do,
        what they can&rsquo;t afford, and where they don&rsquo;t belong.
        Over time, it chips away at something tender: their sense of
        self-worth.
      </p>
    </>
  );
}

export default function Section2() {
  const prefersReducedMotion = useReducedMotion();

  const wrapperRef = useRef(null);
  const stackRef = useRef(null);
  const scene2Ref = useRef(null);
  const [scene2Height, setScene2Height] = useState(0);
  const [cardGap, setCardGap] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Scene 2's rendered height is measured, not guessed, so the amount
  // Scene 1 needs to shift up by (half of it) stays correct regardless of
  // how tall Scene 2's actual content turns out to be. cardGap is read from
  // the actual computed gap-l value (not hardcoded) so it stays correct
  // even if that token's px value changes at a different breakpoint.
  useLayoutEffect(() => {
    function measure() {
      setScene2Height(scene2Ref.current?.offsetHeight ?? 0);
      setCardGap(stackRef.current ? parseFloat(getComputedStyle(stackRef.current).rowGap) || 0 : 0);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // The stack (Scene 1 + Scene 2, in one normal flex column, gap-l between
  // them) starts shifted down by half of Scene 2's height PLUS half the
  // gap -- exactly canceling the extra space Scene 2 (and the gap) occupy
  // in the column, so Scene 1 alone reads as centered at progress 0 --
  // then animates to y:0, which is what actually reads as "Scene 1 moves
  // upward" as the transition completes, ending with a real gap-l gap
  // between the two cards instead of them touching.
  const stackY = useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [(scene2Height + cardGap) / 2, 0]);
  const scene2Opacity = useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [0, 1]);
  // One motion value drives both the background-color crossfade and the
  // Scene 2 background-image fade-in, since they're meant to happen in
  // sync; scene1BgOpacity is its mirror image, fading Scene 1's background
  // OUT (see the note above the image itself for why this can't just be
  // left permanently opaque).
  const scene2BgOpacity = useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [0, 1]);
  const scene1BgOpacity = useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [1, 0]);
  // Scene 1's own hole column: starts matching Scene 1's background
  // (--color-bg-blue, #1E79AE) and crossfades to Scene 2's background
  // (--color-bg-linen-dark, #F3EEE8) -- hardcoded hex since framer-motion
  // needs literal color strings to interpolate, not CSS var references;
  // keep in sync if those tokens change. Scene 1's card stays visible
  // (shifted up, not faded out) throughout the transition, so its holes
  // need to track the current background too, same as the seam holes do.
  const holeColumnColor = useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], ['#1E79AE', '#F3EEE8']);

  if (prefersReducedMotion) {
    // No pin, no scroll-scrub: both cards stacked in normal flow, existing
    // whileInView fade-up per card, static background. Scene 2's assets are
    // used as the static backdrop since both cards are permanently visible
    // together here -- an inference, not explicitly specified either way.
    return (
      <section className="relative flex h-screen w-full flex-col items-center justify-center gap-m overflow-hidden bg-white-linen-200 px-page-margin-x py-3xl">
        <img
          src={bgScene2}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="page-container relative flex flex-col items-center">
          <ScrollSection className="relative flex w-[640px] max-w-full origin-top-left rotate-1 flex-row items-center justify-center gap-s rounded-small bg-bg-white pb-[16px] pl-[16px] pr-[40px] pt-[16px]">
            <Scene1Content holeColumnColor="#F3EEE8" />
          </ScrollSection>
          <ScrollSection className="relative w-[640px] max-w-full bg-bg-white p-[40px]">
            <Scene2Content />
          </ScrollSection>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center gap-m overflow-hidden bg-bg-blue px-page-margin-x py-3xl">
        {/* Background color crossfade: bg-bg-blue (the container's own
            class, always present underneath) -> bg-white-linen-200 (this
            overlay, fading in). */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: scene2BgOpacity }}
          className="pointer-events-none absolute inset-0 bg-white-linen-200"
        />

        {/* Background image crossfade. Scene 1's image also fades OUT
            (not left permanently opaque) -- Frame-2B.svg has its own
            transparent regions in places, so if Frame-2.svg stayed at
            opacity 1 underneath, blue would visibly bleed through those
            gaps even after the crossfade "completes". */}
        <motion.img
          src={bgScene1}
          alt=""
          aria-hidden="true"
          style={{ opacity: scene1BgOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <motion.img
          src={bgScene2}
          alt=""
          aria-hidden="true"
          style={{ opacity: scene2BgOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        <div className="page-container relative flex justify-center">
          <motion.div ref={stackRef} style={{ y: stackY }} className="flex flex-col items-center gap-l">
            <motion.div className="relative flex w-[640px] max-w-full origin-top-left rotate-1 flex-row items-center justify-center gap-s rounded-small bg-bg-white pb-[16px] pl-[16px] pr-[40px] pt-[16px]">
              <Scene1Content holeColumnColor={holeColumnColor} />
            </motion.div>

            <motion.div
              ref={scene2Ref}
              style={{ opacity: scene2Opacity }}
              className="relative w-[640px] max-w-full bg-bg-white p-[40px]"
            >
              <Scene2Content />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

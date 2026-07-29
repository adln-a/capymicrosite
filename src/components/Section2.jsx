import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import bgScene1 from '../assets/Desktop-BG--Frame-2.svg';
import bgScene2 from '../assets/Desktop-BG--Frame-2B.svg';
import bgScene3 from '../assets/Desktop-BG--Frame-2C.svg';
import pinkScribble from '../assets/Pink-Scribble.svg';
import blueScribble from '../assets/Blue-Scribble.svg';
import paperClip from '../assets/Paper-Clip.png';
import paperClipBlack from '../assets/Paper-Clip-Black.png';
import paperBorderTop from '../assets/Paper-Border-Top.png';
import greenScotchTape from '../assets/Green-Scotch-Tape.svg';

// Two crossfade windows: Scene 1 -> Scene 2 (background + card), then
// Scene 2 -> Scene 3, further down the same scroll wrapper. Everything
// within a window reads as one coordinated transition rather than several
// independently-timed effects.
const TRANSITION_1_START = 0.4;
const TRANSITION_1_END = 0.6;
const TRANSITION_2_START = 0.7;
const TRANSITION_2_END = 0.9;

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
const BORDER_TILE_WIDTH = 338;

function TopBorderImage() {
  // Replaces the circle-based hole-punch pattern for Scene 2's second card
  // only (Scene 1's card keeps HoleColumn's circles). A background-image
  // (not a plain <img>) so repeat-x is available. background-size sets the
  // tile to BORDER_TILE_WIDTH x BORDER_TILE_HEIGHT BEFORE repeat-x kicks
  // in, so the pattern actually repeats at a small, correctly-proportioned
  // unit rather than the source file's native resolution.
  //
  // Renders as a normal-flow sibling BEFORE the card box (not absolutely
  // positioned) -- it's a plain 24px-tall block, so it naturally stacks
  // above the card in the outer wrapper's flex column.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none inset-x-0 bottom-full"
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
        className="pointer-events-none absolute left-1/2 top-[120%] -z-10 h-auto max-w-none -translate-x-1/2 -translate-y-1/2"
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

function Scene3Content() {
  return (
    <>
      <p className="body-paragraph self-stretch text-body-default">
        While plenty of resources exist for middle-income families, those
        living on less often face barriers that are invisible to most:
      </p>

      {/* Rotate step of 4deg isn't in Tailwind's default scale (0,1,2,3,6,
          12...), so this needs the arbitrary-value form. There is no
          authored gap between Card 2 and this card -- the visible seam is
          an emergent side effect of Card 2 being unrotated and this card's
          own rotate(-1.5deg) (default center transform-origin). */}
      <img
        src={greenScotchTape}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute origin-top-left rotate-[4deg] mix-blend-multiply"
        style={{ width: '133px', height: '36px', left: '510px', top: '-21.5px' }}
      />

      {/* z-0 gives this block its own stacking context so the scribble's
          -z-10 stays scoped inside it and paints behind the text (same
          technique as MatterHighlight/FourHighlight, just applied to the
          whole block instead of a single wrapped word, since this scribble
          sits at a fixed offset rather than under one specific word). */}
      <div className="relative z-0 flex w-full items-center justify-center gap-xs self-stretch">
        <p className="body-paragraph-large flex-1 text-center text-body-success">
          Financial stress, unstable routines, limited enrichment, and
          emotional burnout.
        </p>
        {/* Blue-Scribble.svg is 89x23 natively -- essentially exact match
            for the ~88x22 target (within 1px), so it's used at its own
            natural size rather than an explicit override. */}
        <img
          src={blueScribble}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 h-auto max-w-none"
          style={{ left: '384px', top: '54px' }}
        />
      </div>
    </>
  );
}

export default function Section2() {
  const prefersReducedMotion = useReducedMotion();

  const wrapperRef = useRef(null);
  const stackRef = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);
  const [scene2Height, setScene2Height] = useState(0);
  const [scene3Height, setScene3Height] = useState(0);
  const [cardGap, setCardGap] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Scene 2 and Scene 3's rendered heights are measured, not guessed, so the
  // amount each earlier card needs to shift up by stays correct regardless
  // of how tall their actual content turns out to be. cardGap is read from
  // the actual computed gap-l value (not hardcoded) so it stays correct
  // even if that token's px value changes at a different breakpoint.
  useLayoutEffect(() => {
    function measure() {
      setScene2Height(scene2Ref.current?.offsetHeight ?? 0);
      setScene3Height(scene3Ref.current?.offsetHeight ?? 0);
      setCardGap(stackRef.current ? parseFloat(getComputedStyle(stackRef.current).rowGap) || 0 : 0);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // The stack (Scene 1 + Scene 2 + Scene 3, in one normal flex column,
  // gap-l between each pair) starts shifted down by half of everything
  // below Scene 1 (Scene 2 + its gap + Scene 3 + its gap) -- exactly
  // canceling that invisible-but-space-occupying content, so Scene 1 alone
  // reads as centered at progress 0. During transition 1 it eases to a
  // smaller shift that cancels only Scene 3 + its gap (centering the
  // Scene 1 + Scene 2 pair once Scene 2 is visible), holds there through
  // the plateau between the two transitions, then eases to 0 during
  // transition 2 -- which is what actually reads as "Scene 1 and Scene 2
  // continue rising" as Scene 3 fades in below them.
  const stackY = useTransform(
    scrollYProgress,
    [TRANSITION_1_START, TRANSITION_1_END, TRANSITION_2_START, TRANSITION_2_END],
    [(scene2Height + scene3Height + 2 * cardGap) / 2, (scene3Height + cardGap) / 2, (scene3Height + cardGap) / 2, 0],
  );
  const scene2Opacity = useTransform(scrollYProgress, [TRANSITION_1_START, TRANSITION_1_END], [0, 1]);
  const scene3Opacity = useTransform(scrollYProgress, [TRANSITION_2_START, TRANSITION_2_END], [0, 1]);
  // Background-image/color opacities. Scene 2's rises during transition 1
  // and falls again during transition 2 (a plateau at 1 in between) --
  // both the Frame-2B image and the linen color-overlay div reuse this
  // same value, so once Scene 3 is fully in, the linen overlay has receded
  // back to 0, revealing the sticky container's own bg-bg-blue base
  // underneath -- which conveniently matches Frame-2C's own blue-dominant
  // tone, so no third color layer is needed. Scene 1's and Scene 3's
  // background images only ever do one fade each, in their own window.
  const scene2BgOpacity = useTransform(
    scrollYProgress,
    [TRANSITION_1_START, TRANSITION_1_END, TRANSITION_2_START, TRANSITION_2_END],
    [0, 1, 1, 0],
  );
  const scene1BgOpacity = useTransform(scrollYProgress, [TRANSITION_1_START, TRANSITION_1_END], [1, 0]);
  const scene3BgOpacity = useTransform(scrollYProgress, [TRANSITION_2_START, TRANSITION_2_END], [0, 1]);
  // Scene 1's own hole column: starts matching Scene 1's background
  // (--color-bg-blue, #1E79AE) and crossfades to Scene 2's background
  // (--color-bg-linen-dark, #F3EEE8) -- hardcoded hex since framer-motion
  // needs literal color strings to interpolate, not CSS var references;
  // keep in sync if those tokens change. Scene 1's card stays visible
  // (shifted up, not faded out) throughout the transition, so its holes
  // need to track the current background too, same as the seam holes do.
  // It does not revert for Scene 3 -- by then Scene 1's card is far above
  // the current action, and ping-ponging its color back and forth wasn't
  // asked for and would look odd.
  const holeColumnColor = useTransform(scrollYProgress, [TRANSITION_1_START, TRANSITION_1_END], ['#1E79AE', '#F3EEE8']);

  if (prefersReducedMotion) {
    // No pin, no scroll-scrub: all three cards stacked in normal flow,
    // existing whileInView fade-up per card, static background. Frame-2C
    // (Scene 3's, blue-dominant per the reference) is used as the static
    // backdrop since all three cards are permanently visible together here
    // -- an inference, not explicitly specified either way. Scene 1's
    // holeColumnColor is set to blue to match this backdrop, rather than
    // the linen-dark used in the two-scene version of this fallback.
    return (
      <section id="section-2" className="relative flex h-dvh w-full flex-col items-center justify-center gap-m overflow-hidden bg-bg-blue px-page-margin-x py-3xl">
        <img
          src={bgScene3}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="page-container relative flex flex-col items-center gap-xs">
          <ScrollSection className="relative flex w-[640px] max-w-full rotate-1 flex-row items-center justify-center gap-s rounded-small bg-bg-white pb-[16px] pl-[16px] pr-[40px] pt-[16px]">
            <Scene1Content holeColumnColor="#1E79AE" />
          </ScrollSection>
          <ScrollSection className="relative w-[640px]">
            <TopBorderImage />
            <div className="max-w-full bg-bg-white p-[40px]">
              <Scene2Content />
            </div>
          </ScrollSection>
          <ScrollSection className="relative flex w-[640px] max-w-full rotate-[-1.5deg] flex-col items-center justify-start gap-s rounded-small bg-bg-white p-[40px]">
            <Scene3Content />
          </ScrollSection>
        </div>
      </section>
    );
  }

  return (
    <section id="section-2" ref={wrapperRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-dvh w-full flex-col items-center justify-center gap-m overflow-hidden bg-bg-blue px-page-margin-x py-3xl">
        {/* Background color crossfade: bg-bg-blue (the container's own
            class, always present underneath) -> bg-white-linen-200 (this
            overlay, rising then receding again as Scene 3 activates --
            see scene2BgOpacity's own comment). */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: scene2BgOpacity }}
          className="pointer-events-none absolute inset-0 bg-white-linen-200"
        />

        {/* Background image crossfade, three layers. Scene 1's and Scene 2's
            images each also fade OUT (not left permanently opaque) --
            Frame-2B.svg and Frame-2C.svg each have their own transparent
            regions in places, so leaving an earlier layer opaque
            underneath would let it visibly bleed through those gaps even
            after its own crossfade "completes". */}
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
        <motion.img
          src={bgScene3}
          alt=""
          aria-hidden="true"
          style={{ opacity: scene3BgOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        <div className="page-container relative flex justify-center">
          <motion.div ref={stackRef} style={{ y: stackY }} className="flex flex-col items-center gap-xs">
            <motion.div className="relative flex w-[640px] max-w-full rotate-1 flex-row items-center justify-center gap-s rounded-small bg-bg-white pb-[16px] pl-[16px] pr-[40px] pt-[16px]">
              <Scene1Content holeColumnColor={holeColumnColor} />
            </motion.div>

            <motion.div ref={scene2Ref} style={{ opacity: scene2Opacity }} className="relative w-[640px]">
              <TopBorderImage />
              <div className="max-w-full bg-bg-white p-[40px]">
                <Scene2Content />
              </div>
            </motion.div>

            <motion.div
              ref={scene3Ref}
              style={{ opacity: scene3Opacity }}
              className="relative flex w-[640px] max-w-full rotate-[-1.5deg] flex-col items-center justify-start gap-s rounded-small bg-bg-white p-[40px]"
            >
              <Scene3Content />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

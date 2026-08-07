import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import bgScene1Xl from '../assets/Desktop-BG--Frame-2.svg';
import bgScene1L from '../assets/l/L--BG-Frame2.svg';
import bgScene1M from '../assets/m/M--BG-Frame2.svg';
import bgScene1Xs from '../assets/s/S--BG-Frame2.svg';
import bgScene2Xl from '../assets/Desktop-BG--Frame-2B.svg';
import bgScene2L from '../assets/l/L--BG-Frame2B.svg';
import bgScene2M from '../assets/m/M--BG-Frame2B.svg';
import bgScene2Xs from '../assets/s/S--BG-Frame2B.svg';
import bgScene3Xl from '../assets/Desktop-BG--Frame-2C.svg';
import bgScene3L from '../assets/l/L--BG-Frame2C.svg';
import bgScene3M from '../assets/m/M--BG-Frame2C.svg';
import bgScene3Xs from '../assets/s/S--BG-Frame2C.svg';
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

// Same breakpoint-swap technique as Section 1's background (640/992/1200,
// matching sm/lg/xl) -- <picture> picks ONE matching source rather than
// rendering all four and hiding three with CSS. Always a motion.img (not
// a plain <img>) even for the reduced-motion fallback below, which never
// actually animates it -- motion.img renders a normal <img> either way,
// so there's one code path instead of two near-identical ones.
function SceneBackgroundPicture({ xl, l, m, xs, style, className }) {
  // absolute on <picture> itself, not just the <img> inside -- the <img>'s
  // own `absolute` only takes IT out of flow, but <picture> (its parent)
  // has no positioning of its own and stays a normal-flow flex item. Inside
  // Section 2's flex-col + gap-m sticky container, three of these
  // near-zero-height <picture> elements sitting before the content wrapper
  // each still counted for gap-m, injecting extra invisible gap above the
  // visible content and pushing it off-center.
  return (
    <picture className="absolute inset-0">
      <source media="(min-width: 1200px)" srcSet={xl} />
      <source media="(min-width: 992px)" srcSet={l} />
      <source media="(min-width: 640px)" srcSet={m} />
      <motion.img src={xs} alt="" aria-hidden="true" style={style} className={className} />
    </picture>
  );
}

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

function MatterHighlight({ children }) {
  // Same technique as FOUR in Section 1 and Section 2's standalone build:
  // z-0 gives this span its own stacking context so -z-10 on the image
  // stays scoped inside it; the image renders at its own natural size.
  // Takes `children` (not a hardcoded "matter") so AccessibleHighlightText
  // below can read the word straight off it, same as every other
  // Highlight component in the codebase.
  return (
    <span className="body-paragraph-large relative z-0 inline-block whitespace-nowrap text-center text-heading-blue">
      <img
        src={pinkScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 h-auto max-w-none -translate-x-1/2"
        style={{ top: 'var(--scribble-offset-tight)' }}
      />
      <span className="relative">{children}</span>
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
        {/* Plain flowing paragraph (not the old flex-wrap two-span row) --
            that manual split into rigid phrase-spans wrapped/overflowed
            inconsistently once the card's own width became responsive
            (each span had to move/wrap as one unit rather than the text
            reflowing naturally). AccessibleHighlightText is the same
            single-flowing-run pattern used everywhere else in the
            codebase (Section 1's "FOUR", etc.), so this just wraps like
            normal text at any width. */}
        <p className="body-paragraph-large self-stretch text-center text-heading-blue">
          <AccessibleHighlightText
            before="What if we could help children from low-income families feel like they "
            highlight={<MatterHighlight>matter</MatterHighlight>}
          />
        </p>
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

// Same span-wrap technique as MatterHighlight above/ParticipationHighlight
// (Section 13) -- anchors the scribble to this specific word via normal
// text flow, so it stays correctly centered under "burnout" regardless of
// how the surrounding paragraph wraps at any width. The previous approach
// (a paragraph-level flex row + one absolutely-positioned scribble offset
// a fixed 87px from the card's right edge) was only ever tuned for the
// card's old constant 640px width -- once the card became fluid (w-full
// below md), the paragraph could wrap across an extra line at narrower S
// widths, and the scribble stayed stranded near "and emotional" on the
// line above instead of following "burnout" down to its own line.
// Blue-Scribble.svg is 89x23 natively -- kept at that native size
// (matches Section 13's own identical-asset usage), --scribble-offset-
// default likewise matches that same sibling usage.
function BurnoutHighlight({ children }) {
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={blueScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 max-w-none -translate-x-1/2"
        style={{ width: '89px', height: '23px', top: 'var(--scribble-offset-default)' }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

function Scene3Content() {
  return (
    <>
      <p className="body-paragraph self-stretch text-body-default">
        While plenty of resources exist for middle-income families, those
        living on less often face barriers that are invisible to most:
      </p>

      <p className="body-paragraph-large self-stretch text-center text-body-success">
        Financial stress, unstable routines, limited enrichment, and emotional{' '}
        <BurnoutHighlight>burnout</BurnoutHighlight>.
      </p>
    </>
  );
}

// Extracted out of Scene3Content so it isn't nested inside the card's own
// opacity-animating wrapper -- mix-blend-multiply can't correctly composite
// against an ancestor whose opacity/transform is actively tweening or even
// just statically present (same isolated-compositing-layer issue as
// Section 1/6's tapes), and Scene 3's own crossfade-in is exactly that kind
// of tween. Rendered as a sibling instead, driven by the same opacity value
// so it still fades in in lockstep with the rest of the card.
//
// The card itself keeps its own default-center-origin rotate(-1.5deg)
// completely unchanged (it's the tape's SIBLING here, not its ancestor, so
// the card's own transform can't isolate the tape) -- but since the tape is
// no longer riding along with that rotation as a nested child, it needs its
// own compensated position + rotation to land in exactly the same on-screen
// spot: `rotate` is the composed angle (originally 4deg nested inside a
// -1.5deg card == 2.5deg standalone), and `left`/`top` are the original
// (510, -21.5) offset rotated by -1.5deg around the CARD'S OWN CENTER
// (its default transform-origin -- unlike Section 1/8/13/14's boxes, this
// card was never given origin-top-left) -- see scene3TapePosition below,
// computed from the card's actual rendered size (via scene3Width/
// scene3Height) rather than assumed, since it's not a fixed height.
function Scene3Tape({ opacity, left, top, rotate }) {
  return (
    <motion.img
      src={greenScotchTape}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute origin-top-left mix-blend-multiply"
      style={{ width: '133px', height: '36px', left: `${left}px`, top: `${top}px`, rotate: `${rotate}deg`, opacity }}
    />
  );
}

// Rotates point (x, y) by angleDeg (CSS's clockwise-positive convention)
// around (cx, cy), returning the new top-left position for an element that
// keeps the same own-rotation origin-top-left afterward.
function rotatePointAround(x, y, cx, cy, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export default function Section2() {
  const prefersReducedMotion = useReducedMotion();

  const wrapperRef = useRef(null);
  const stackRef = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);
  const [scene2Height, setScene2Height] = useState(0);
  const [scene3Height, setScene3Height] = useState(0);
  const [scene3Width, setScene3Width] = useState(0);
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
      setScene3Width(scene3Ref.current?.offsetWidth ?? 0);
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

  // Scene 3's card rotates -1.5deg around its own CENTER (its default
  // transform-origin -- it was never given origin-top-left), so the tape's
  // compensated position depends on the card's actual rendered size, not a
  // guessed constant -- see Scene3Tape's own comment for why this
  // compensation is needed at all.
  //
  // The un-rotated x anchor is `scene3Width - 130`, not a flat 510 --
  // 510 was only ever correct at the old constant 640px card width, where
  // it put the 133px-wide tape 3px past the right edge (510+133-640=3),
  // matching the intentional overhang built into the original design
  // (see the reduced-motion fallback's own tape, which keeps that same
  // 3px overhang via `right: -3px`). Since the card's width is now
  // responsive, deriving x from the CURRENT scene3Width the same way
  // (x = width - tapeWidth + 3 = width - 130) keeps that same edge
  // overhang at any width instead of the tape drifting off past a
  // narrower card's actual right edge.
  const scene3TapePosition = useMemo(
    () => rotatePointAround(scene3Width - 130, -21.5, scene3Width / 2, scene3Height / 2, -1.5),
    [scene3Width, scene3Height],
  );

  if (prefersReducedMotion) {
    // No pin, no scroll-scrub: all three cards stacked in normal flow,
    // existing whileInView fade-up per card, static background. Frame-2C
    // (Scene 3's, blue-dominant per the reference) is used as the static
    // backdrop since all three cards are permanently visible together here
    // -- an inference, not explicitly specified either way. Scene 1's
    // holeColumnColor is set to blue to match this backdrop, rather than
    // the linen-dark used in the two-scene version of this fallback.
    return (
      <section id="section-2" className="relative flex h-dvh w-full flex-col items-center justify-center gap-m overflow-hidden bg-bg-blue px-page-margin-x">
        <SceneBackgroundPicture
          xl={bgScene3Xl}
          l={bgScene3L}
          m={bgScene3M}
          xs={bgScene3Xs}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {/* content-cap: site-wide desktop content cap -- its own mx-auto
            is redundant here (this wrapper's parent is already flex-col
            items-center, which centers it regardless of width) but
            harmless, so the shared class is used as-is rather than a
            one-off variant without margin-inline. */}
        <div className="relative flex flex-col items-center gap-xs content-cap">
          <ScrollSection className="relative flex w-full rotate-1 flex-row items-center justify-center gap-s rounded-small bg-bg-white pb-s pl-s pr-l pt-s sm:w-[560px]">
            <Scene1Content holeColumnColor="#1E79AE" />
          </ScrollSection>
          <ScrollSection className="relative w-full sm:w-[560px]">
            <TopBorderImage />
            <div className="max-w-full bg-bg-white p-l">
              <Scene2Content />
            </div>
          </ScrollSection>
          {/* Reduced motion: ScrollSection is inert here (no animation is
              ever applied under prefers-reduced-motion), so there's no
              actively-tweening ancestor to isolate the tape from anything
              -- it can stay nested exactly like the original design,
              rotating together with the card as one rigid unit, no
              compensation needed. `right` (not `left`): the card's own
              width is now responsive (w-full below sm, 560px from sm up),
              and the original left:510px was only ever correct at the old
              constant 640px width -- it already intentionally overhung the
              card's right edge by 3px there (510+133-640=3), so anchoring
              from the right edge at that same -3px keeps the same
              intentional overhang at ANY width instead of overshooting
              further as the card narrows. */}
          <ScrollSection className="relative flex w-full rotate-[-1.5deg] flex-col items-center justify-start gap-s rounded-small bg-bg-white p-l sm:w-[560px]">
            <img
              src={greenScotchTape}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute origin-top-left rotate-[4deg] mix-blend-multiply"
              style={{ width: '133px', height: '36px', right: '-3px', top: '-21.5px' }}
            />
            <Scene3Content />
          </ScrollSection>
        </div>
      </section>
    );
  }

  return (
    <section id="section-2" ref={wrapperRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-dvh w-full flex-col items-center justify-center gap-m overflow-hidden bg-bg-blue px-page-margin-x">
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
        <SceneBackgroundPicture
          xl={bgScene1Xl}
          l={bgScene1L}
          m={bgScene1M}
          xs={bgScene1Xs}
          style={{ opacity: scene1BgOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <SceneBackgroundPicture
          xl={bgScene2Xl}
          l={bgScene2L}
          m={bgScene2M}
          xs={bgScene2Xs}
          style={{ opacity: scene2BgOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <SceneBackgroundPicture
          xl={bgScene3Xl}
          l={bgScene3L}
          m={bgScene3M}
          xs={bgScene3Xs}
          style={{ opacity: scene3BgOpacity }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* content-cap: site-wide desktop content cap -- its own mx-auto
            is redundant here (this wrapper's parent, the sticky
            container above, is already flex-col items-center) but
            harmless, same as Scene 1's own wrapper above. */}
        <div className="relative flex justify-center content-cap">
          <motion.div ref={stackRef} style={{ y: stackY }} className="flex flex-col items-center gap-xs">
            <motion.div className="relative flex w-full rotate-1 flex-row items-center justify-center gap-s rounded-small bg-bg-white pb-s pl-s pr-l pt-s sm:w-[560px]">
              <Scene1Content holeColumnColor={holeColumnColor} />
            </motion.div>

            <motion.div ref={scene2Ref} style={{ opacity: scene2Opacity }} className="relative w-full sm:w-[560px]">
              <TopBorderImage />
              <div className="max-w-full bg-bg-white p-l">
                <Scene2Content />
              </div>
            </motion.div>

            {/* No authored gap between Card 2 and this card -- the visible
                seam is an emergent side effect of Card 2 being unrotated
                and this card's own rotate(-1.5deg) (default center
                transform-origin). This wrapper deliberately carries NO
                transform of its own (see Scene3Tape's comment on why) --
                the card keeps its rotate directly on itself, exactly as
                before. */}
            <div className="relative w-full sm:w-[560px]">
              <motion.div
                ref={scene3Ref}
                style={{ opacity: scene3Opacity, rotate: -1.5 }}
                className="w-full origin-center flex flex-col items-center justify-start gap-s rounded-small bg-bg-white p-l"
              >
                <Scene3Content />
              </motion.div>
              <Scene3Tape
                opacity={scene3Opacity}
                left={scene3TapePosition.x}
                top={scene3TapePosition.y}
                rotate={2.5}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

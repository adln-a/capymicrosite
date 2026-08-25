import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

// Replaces the old h-[300vh] scroll-jack + continuous scrollYProgress
// scrubbing (pinned crossfade) with a plain position:sticky background +
// IntersectionObserver pattern, same as Section 8's own -- useScroll/
// useTransform recompute continuously on every scroll frame regardless of
// visibility, real main-thread work competing with the scroll compositor
// the whole time the section is pinned; an IntersectionObserver callback
// only fires on actual enter/exit, not per scroll pixel. Used at every
// breakpoint (S/M/L/XL alike) -- this used to be S-only, with M/L/XL kept
// on the old pinned crossfade, but that was jankier everywhere, not just
// mobile Safari, so there's no longer a reason to keep two interactions.
//
// Each scene is its own min-h-dvh block (own comment below) -- Card 1
// centered in the viewport on arrival, background snapped (a hard cut,
// not a crossfade) to match; scrolling moves Card 1 up and Card 2 in
// underneath it exactly like normal document flow, snapping the
// background again once Card 2 reaches center. This intentionally still
// takes roughly a full viewport of scroll per card (same rough total
// distance as the old pinned version) -- the actual complaint wasn't the
// distance itself, it was that up to 60% of the OLD 300vh (the gaps
// between its 0.4-0.6 / 0.7-0.9 crossfade windows) produced literally no
// visible change at all. Here every bit of scroll input moves something
// on screen immediately -- Card 1 sliding up, Card 2 sliding in -- there
// are no dead zones to begin with.
//
// Every scene's real text is already, always in the DOM in natural
// reading order here -- straightforwardly accessible without ever
// toggling display/visibility/aria-hidden for motion.
export default function Section2() {
  const shouldReduceMotion = useReducedMotion();
  const [activeScene, setActiveScene] = useState(1);
  const scene1Ref = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);

  // Same rootMargin trick as Section 8's own scroll-spy: shrinks the
  // observed viewport down to a single horizontal line at 50% height, so
  // "isIntersecting" fires exactly when a card crosses the vertical
  // center of the screen. Correct here (unlike an earlier draft of this
  // component, which used natural-height cards and had to bias the
  // trigger toward the top instead) because every card below is forced
  // to min-h-dvh, so exactly one is ever near center at a time -- same
  // precondition Section 8's own center-line trigger relies on.
  useEffect(() => {
    const keyByElement = new Map();
    if (scene1Ref.current) keyByElement.set(scene1Ref.current, 1);
    if (scene2Ref.current) keyByElement.set(scene2Ref.current, 2);
    if (scene3Ref.current) keyByElement.set(scene3Ref.current, 3);
    if (keyByElement.size === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.find((entry) => entry.isIntersecting);
        if (entered) setActiveScene(keyByElement.get(entered.target));
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    keyByElement.forEach((_, el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // A plain CSS opacity transition (not the pinned version's continuous
  // scroll-scrubbed one) triggered by activeScene changing -- per direct
  // request, a fade rather than a hard cut. Empty string under reduced
  // motion so the swap is instant instead of transitioning.
  const crossfadeClassName = shouldReduceMotion ? '' : 'transition-opacity duration-500';

  return (
    <section id="section-2" className="relative w-full bg-bg-blue">
      <div className="relative grid w-full">
        {/* Sticky background: three stacked SceneBackgroundPicture layers,
            only the active scene's layer opaque, fading between them as
            activeScene changes. No px-page-margin-x on this wrapper
            (unlike the content column below) -- absolute inset-0
            children of a positioned ancestor resolve against its BORDER
            edge, not its padding edge (confirmed empirically, own
            findings elsewhere in this codebase), so keeping this
            wrapper padding-free is what makes the background actually
            span 100% of the true viewport width edge to edge. bg-bg-blue
            on this wrapper is the shared base color both Scene 1's and
            Scene 3's art are dominant in -- the linen-dark overlay only
            shows while Scene 2 itself is active. */}
        <div
          className="pointer-events-none sticky top-0 z-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-bg-blue"
          style={{ gridArea: '1 / 1' }}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 bg-white-linen-200 ${crossfadeClassName}`}
            style={{ opacity: activeScene === 2 ? 1 : 0 }}
          />
          <SceneBackgroundPicture
            xl={bgScene1Xl}
            l={bgScene1L}
            m={bgScene1M}
            xs={bgScene1Xs}
            style={{ opacity: activeScene === 1 ? 1 : 0 }}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${crossfadeClassName}`}
          />
          <SceneBackgroundPicture
            xl={bgScene2Xl}
            l={bgScene2L}
            m={bgScene2M}
            xs={bgScene2Xs}
            style={{ opacity: activeScene === 2 ? 1 : 0 }}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${crossfadeClassName}`}
          />
          <SceneBackgroundPicture
            xl={bgScene3Xl}
            l={bgScene3L}
            m={bgScene3M}
            xs={bgScene3Xs}
            style={{ opacity: activeScene === 3 ? 1 : 0 }}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${crossfadeClassName}`}
          />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center px-page-margin-x" style={{ gridArea: '1 / 1' }}>
          {/* min-h-dvh + items-center/justify-center on each wrapper
              (not the card itself) -- same shape as Section 8's own
              introRef/card wrappers -- is what actually produces "Card 1
              centered in the viewport on arrival": each card gets a full
              viewport's worth of scroll room, centered within it, before
              the next one starts sliding up underneath. */}
          <div ref={scene1Ref} className="flex min-h-dvh w-full items-center justify-center py-page-margin-y">
            <ScrollSection className="relative flex w-full rotate-1 flex-row items-center justify-center gap-s rounded-small bg-bg-white pb-s pl-s pr-l pt-s sm:w-[560px]">
              <Scene1Content holeColumnColor={activeScene === 1 ? '#1E79AE' : '#F3EEE8'} />
            </ScrollSection>
          </div>

          <div ref={scene2Ref} className="flex min-h-dvh w-full items-center justify-center py-page-margin-y">
            <ScrollSection className="relative w-full sm:w-[560px]">
              <TopBorderImage />
              <div className="max-w-full bg-bg-white p-l">
                <Scene2Content />
              </div>
            </ScrollSection>
          </div>

          <div ref={scene3Ref} className="flex min-h-dvh w-full items-center justify-center py-page-margin-y">
            <div className="relative w-full sm:w-[560px]">
              <ScrollSection className="relative flex w-full rotate-[-1.5deg] flex-col items-center justify-start gap-s rounded-small bg-bg-white p-l">
                <Scene3Content />
              </ScrollSection>
              {/* Sibling of the card, not nested inside it -- a
                  mix-blend-mode element whose ancestor has a transform
                  (even just a static one, per Section 8's ContentColumn's
                  own identical tape) renders with the wrong, un-blended
                  flat color. Fixed position/rotation, eyeballed like
                  Section 8's own tape -- `right` (not `left`) keeps the
                  same intentional 3px overhang past the card's right edge
                  at any width, same as the card itself being responsive
                  (w-full below sm, capped at 560px from sm up). */}
              <img
                src={greenScotchTape}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute origin-top-left rotate-[4deg] mix-blend-multiply"
                style={{ width: '133px', height: '36px', right: '-3px', top: '-21.5px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


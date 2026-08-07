import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { useReducedMotion } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import blueScribbleMultiple from '../assets/Blue-Scribble-Multiple.svg';
import paperClipMetal from '../assets/Paper-Clip-Metal.png';
import receipt1 from '../assets/section-6/Section6--Grocery-Receipt1.png';
import receipt2 from '../assets/section-6/Section6--Grocery-Receipt2.png';
import receipt3 from '../assets/section-6/Section6--Gorcery-Receipt3.png';
import mamaLemon from '../assets/section-6/Section6--Mama-Lemon.svg';
import milk from '../assets/section-6/Section6--Milk.svg';
import soap from '../assets/section-6/Section6--Soap.svg';
import tissuePaper from '../assets/section-6/Section6--Tissue-Paper.svg';
import toothpaste from '../assets/section-6/Section6--Toothpaste.svg';
import top from '../assets/section-6/Section6--Top.svg';
import veggie from '../assets/section-6/Section6--Veggie.svg';
import egg from '../assets/section-6/Section6--Egg.svg';
import bread from '../assets/section-6/Section 6--Bread.svg';
import apple from '../assets/section-6/Section6--Apple.svg';

// White box, then pink circle -- 0.18s stagger, same convention as
// Section 1's pink/white box pair. The falling scene (below) is on its
// own independent trigger (viewport-entry IntersectionObserver, not tied
// to this timing at all).
const WHITE_BOX_DELAY = 0;
const PINK_CIRCLE_DELAY = 0.18;

const RULED_LINE_COUNT = 9;

function EssentialsHighlight({ children }) {
  // Same z-0/-z-10 span-wrap technique as the other scribble highlights.
  // Blue-Scribble-Multiple.svg is 162x28 natively -- an exact match for
  // the target size, no scaling needed.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={blueScribbleMultiple}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2"
        style={{ width: '162px', height: '28px', top: 'var(--scribble-offset-tight)' }}
      />
      <span className="heading-3-accent relative">{children}</span>
    </span>
  );
}

function RuledLines() {
  // Same technique as Section 5/14's RuledLines: an absolutely-positioned,
  // non-flow overlay of evenly-gapped border-top lines, clipped by the
  // circle's own overflow-hidden.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 flex flex-col gap-[38px]"
    >
      {Array.from({ length: RULED_LINE_COUNT }).map((_, i) => (
        <div key={i} className="h-0 self-stretch border-t border-pomegranate-200" />
      ))}
    </div>
  );
}

// Reference canvas sizes per tier -- XL matches the original static build
// exactly, a fixed 660x794. S has no fixed width: FallingScene measures
// its own actual rendered width at S instead (see its own comment), so it
// always spans the section's real 100% content width rather than a
// guessed reference number. Height still needs an explicit target (there's
// no equivalent "measure it" for height -- the section's own height is
// DERIVED from this, not the other way around): 1270px, chosen so the
// section's total height lands near the ~1350px target given in the
// reference (64px pt + 1270px canvas + 64px pb) -- items can't spread as
// wide in a narrower column, so the pile needs more vertical room to
// settle without overlapping.
const SCENE_SIZES = {
  xl: { width: 660, height: 794 },
  s: { height: 1270 },
};
const WALL_THICKNESS = 40;
// Max px/frame any body can move -- comfortably less than the ground's
// own 40px thickness, so a body travelling at the cap still can't skip
// past it within one physics step.
const MAX_BODY_SPEED = 25;

// Physics-body dimensions. Widths are the same values tuned by eye
// against the reference in the earlier static build; heights follow each
// asset's own native aspect ratio (the old raw Figma export decomposed
// every item into dozens of individually-rotated vector fragments with
// no clean per-item bounding box to read off -- these are standalone
// re-exported assets replacing that whole mess, so their own proportions,
// not the old fragments' composite bounding box, are what matter here).
// Receipts first (so they paint behind the groceries, like the earlier
// build), each sized to its precise export figures.
const FALLING_ITEMS = [
  { key: 'receipt-2', src: receipt2, width: 150, height: 310 },
  { key: 'receipt-1', src: receipt1, width: 180, height: 196, shadow: true },
  { key: 'receipt-3', src: receipt3, width: 170, height: 334 },
  { key: 'top', src: top, width: 190, height: 334 },
  { key: 'milk', src: milk, width: 110, height: 268 },
  { key: 'egg', src: egg, width: 85, height: 112 },
  { key: 'bread', src: bread, width: 150, height: 292 },
  { key: 'veggie', src: veggie, width: 110, height: 193 },
  { key: 'mama-lemon', src: mamaLemon, width: 110, height: 289 },
  { key: 'apple', src: apple, width: 90, height: 91 },
  { key: 'toothpaste', src: toothpaste, width: 55, height: 228 },
  { key: 'tissue-paper', src: tissuePaper, width: 130, height: 104 },
  { key: 'soap', src: soap, width: 130, height: 96 },
];

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Builds the order items START falling in (not their final resting
// order) such that no two receipts ever fall back-to-back -- there's
// always at least one grocery item between them. Receipts are inserted
// into 3 distinct random gap slots around the shuffled groceries (11
// possible slots for 10 groceries: before the first, between each pair,
// after the last); distinct slots guarantee a grocery sits between any
// two receipts in the result, since two receipts can only end up
// adjacent if they land in the *same* slot.
function buildSpawnOrder(items) {
  const receipts = shuffle(items.filter((item) => item.key.startsWith('receipt-')));
  const groceries = shuffle(items.filter((item) => !item.key.startsWith('receipt-')));

  const gapSlots = shuffle(Array.from({ length: groceries.length + 1 }, (_, i) => i)).slice(0, receipts.length);

  const ordered = [...groceries];
  // Insert highest gap index first so earlier splices don't shift the
  // still-pending insertion indices out from under later ones.
  gapSlots
    .map((gap, i) => ({ gap, receipt: receipts[i] }))
    .sort((a, b) => b.gap - a.gap)
    .forEach(({ gap, receipt }) => ordered.splice(gap, 0, receipt));

  return ordered;
}

// Reduced-motion resting positions -- the same hand-tuned left/top/rotate
// values from the earlier (non-physics) static build, used only when
// physics is skipped entirely.
const RESTING_POSITIONS = {
  'receipt-2': { left: 134, top: 311, rotate: -4 },
  'receipt-1': { left: 102, top: 188, rotate: 5 },
  'receipt-3': { left: 342, top: 85, rotate: -3 },
  top: { left: 90, top: 130, rotate: 0 },
  milk: { left: 330, top: 175, rotate: 0 },
  egg: { left: 460, top: 290, rotate: 0 },
  bread: { left: 430, top: 415, rotate: 0 },
  veggie: { left: 545, top: 520, rotate: 0 },
  'mama-lemon': { left: 55, top: 430, rotate: 0 },
  apple: { left: 5, top: 610, rotate: 0 },
  toothpaste: { left: 235, top: 555, rotate: 0 },
  'tissue-paper': { left: 270, top: 610, rotate: 0 },
  soap: { left: 415, top: 630, rotate: 0 },
};

/**
 * Real physics falling, via Matter.js -- not a Framer Motion/CSS fade.
 * Each item is a rectangle body dropped from off-screen above the scene
 * at a randomized x/angle/angular-velocity, so it tumbles rather than
 * drops straight down. A static ground + left/right walls keep the pile
 * contained within the visible scene. Body position/angle are synced to
 * each <img>'s transform directly via refs on every animation frame --
 * not React state, since that would re-render 13 elements 60x/second for
 * no benefit.
 *
 * Triggered by a dedicated IntersectionObserver at threshold:0 (fires the
 * instant any part of the scene enters the viewport), separate from the
 * ScrollSection reveals used for the text/circle above -- and fires only
 * once (observer disconnects after the first trigger), not replayed on
 * every re-entry, since restarting a settled physics pile on every scroll
 * pass would look wrong.
 *
 * sceneWidth/sceneHeight drive every physics dimension below -- ground/
 * wall placement, spawn-x range, out-of-bounds recovery -- so the same
 * simulation logic works at any canvas size without a second code path.
 * Named sceneWidth/sceneHeight (not just width/height) specifically to
 * avoid colliding with the per-ITEM width/height already destructured off
 * each body further down (`bodies` stores each item's own dimensions
 * under those same property names).
 *
 * fixedWidth (optional): pass a number (XL: 660) to size the canvas
 * exactly that wide, matching the original static build. Omit it (S) to
 * measure the container's own actual rendered width instead, via
 * ResizeObserver -- S has no fixed reference width at all, so the canvas
 * always spans 100% of whatever the section's real content width is, not
 * a guessed number. The physics effect below waits for a real measured
 * width (skips entirely while it's still 0) since Matter.js needs an
 * actual number to build the ground/walls against, not "100%".
 */
function FallingScene({ sceneWidth: fixedWidth, sceneHeight }) {
  const shouldReduceMotion = useReducedMotion();
  const sceneRef = useRef(null);
  const itemElsRef = useRef({});
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const sceneWidth = fixedWidth ?? measuredWidth;

  // Only runs when fixedWidth is omitted (S) -- XL already knows its exact
  // width upfront and skips this measurement entirely.
  useLayoutEffect(() => {
    if (fixedWidth) return undefined;
    const el = sceneRef.current;
    if (!el) return undefined;
    const update = () => setMeasuredWidth(el.offsetWidth);
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [fixedWidth]);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;
    if (!sceneWidth) return undefined;
    const sceneEl = sceneRef.current;
    if (!sceneEl) return undefined;

    let rafId;
    let engine;
    let started = false;
    const timeouts = [];

    function start() {
      if (started) return;
      started = true;

      engine = Matter.Engine.create();
      // Higher than the Matter.js defaults (6/4) -- with the default
      // solver quality, bodies spawned overlapping each other (likely
      // given every item's x/y is randomized independently, with no
      // spawn-collision check) occasionally got flung out at extreme
      // velocity on their first collision resolution, fast enough to
      // tunnel straight through the ground in a single physics step.
      // More iterations resolve overlaps more gently; the velocity clamp
      // in the render loop below is the hard backstop.
      engine.positionIterations = 10;
      engine.velocityIterations = 8;
      // A bit brisker than Matter's default (1) -- with the default,
      // items spawned several hundred px above the scene took upwards of
      // 7s to land, which reads as sluggish for a page-load reveal.
      engine.gravity.y = 1.4;

      const ground = Matter.Bodies.rectangle(
        sceneWidth / 2,
        sceneHeight + WALL_THICKNESS / 2,
        sceneWidth + WALL_THICKNESS * 2,
        WALL_THICKNESS,
        { isStatic: true },
      );
      const leftWall = Matter.Bodies.rectangle(
        -WALL_THICKNESS / 2,
        sceneHeight / 2,
        WALL_THICKNESS,
        sceneHeight * 2,
        { isStatic: true },
      );
      const rightWall = Matter.Bodies.rectangle(
        sceneWidth + WALL_THICKNESS / 2,
        sceneHeight / 2,
        WALL_THICKNESS,
        sceneHeight * 2,
        { isStatic: true },
      );
      Matter.Composite.add(engine.world, [ground, leftWall, rightWall]);

      const bodies = [];

      // Order items fall in (not the array's own declaration order) --
      // guarantees at least one grocery between any two receipts. Delay
      // is assigned from POSITION in this order (index * STEP + jitter,
      // jitter kept under STEP) so the guaranteed order is also the
      // guaranteed *timing* order -- shuffling groceries/receipts
      // independently but then handing out delays randomly per-item
      // (the old approach) could still land two receipts' random delays
      // next to each other by chance.
      const SPAWN_STEP = 50;
      const SPAWN_JITTER = 35;
      const spawnOrder = buildSpawnOrder(FALLING_ITEMS);

      spawnOrder.forEach((item, index) => {
        const delay = index * SPAWN_STEP + Math.random() * SPAWN_JITTER;
        timeouts.push(
          setTimeout(() => {
            const margin = item.width / 2 + 10;
            const x = margin + Math.random() * (sceneWidth - margin * 2);
            // Spread starting heights by spawn order (not just a shared
            // random range) so simultaneously-falling items are less
            // likely to spawn directly on top of one another -- the
            // other half of preventing the explosive-overlap tunneling
            // described above.
            const y = -item.height - index * 30 - Math.random() * 150;
            const angle = (Math.random() - 0.5) * 0.8;
            const body = Matter.Bodies.rectangle(x, y, item.width, item.height, {
              restitution: 0.35,
              friction: 0.5,
              frictionAir: 0.008,
              angle,
            });
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
            Matter.Composite.add(engine.world, body);
            bodies.push({ body, key: item.key, width: item.width, height: item.height });
            const el = itemElsRef.current[item.key];
            if (el) el.style.opacity = '1';
          }, delay),
        );
      });

      function loop() {
        // Hard backstop against tunneling: clamp any body's speed before
        // integrating this frame, so a collision-resolution impulse from
        // the previous step can't launch something through the ground
        // (which is why milk and toothpaste ended up thousands of px
        // below the scene before this was added -- see the comment on
        // positionIterations above for the root cause).
        bodies.forEach(({ body }) => {
          if (body.speed > MAX_BODY_SPEED) {
            const scale = MAX_BODY_SPEED / body.speed;
            Matter.Body.setVelocity(body, { x: body.velocity.x * scale, y: body.velocity.y * scale });
          }
        });
        Matter.Engine.update(engine, 1000 / 60);

        // Position-based safety net, independent of the speed clamp
        // above: an explosive resolution impulse between two bodies
        // spawned overlapping each other can happen *within* a single
        // Engine.update call (Matter resolves collisions and integrates
        // the resulting position in the same pass), so a body can still
        // tunnel through the ground on its very first frame, before the
        // speed clamp -- which only acts at the START of the next frame
        // -- ever gets a chance to catch it. This checks the actual
        // result instead of trying to prevent the cause: if a body ends
        // up outside the scene's bounds, it's snapped back to rest on
        // the ground (or against the wall it crossed) with its velocity
        // zeroed, whatever the reason it got there.
        bodies.forEach(({ body, width, height }) => {
          const halfW = width / 2;
          const bottom = body.position.y + height / 2;
          if (bottom > sceneHeight + 2) {
            Matter.Body.setPosition(body, {
              x: Math.min(Math.max(body.position.x, halfW), sceneWidth - halfW),
              y: sceneHeight - height / 2,
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
          } else if (body.position.x - halfW < -2 || body.position.x + halfW > sceneWidth + 2) {
            Matter.Body.setPosition(body, {
              x: Math.min(Math.max(body.position.x, halfW), sceneWidth - halfW),
              y: body.position.y,
            });
            Matter.Body.setVelocity(body, { x: 0, y: body.velocity.y });
          }
        });

        bodies.forEach(({ body, key, width, height }) => {
          const el = itemElsRef.current[key];
          if (!el) return;
          const x = body.position.x - width / 2;
          const y = body.position.y - height / 2;
          el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
        });
        rafId = requestAnimationFrame(loop);
      }
      rafId = requestAnimationFrame(loop);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0 },
    );
    observer.observe(sceneEl);

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      if (engine) {
        Matter.Composite.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
    };
  }, [shouldReduceMotion, sceneWidth, sceneHeight]);

  return (
    <div
      className={`relative max-w-full flex-shrink-0 ${fixedWidth ? '' : 'w-full'}`}
      style={{ width: fixedWidth ? `${fixedWidth}px` : undefined, height: `${sceneHeight}px` }}
      ref={sceneRef}
    >
      {FALLING_ITEMS.map((item) => {
        const resting = RESTING_POSITIONS[item.key];
        // RESTING_POSITIONS' left/top were hand-tuned against the XL
        // canvas specifically (660x794) -- scaled proportionally here so
        // the reduced-motion static layout still roughly holds together
        // at any other canvas size (S's 343x1270) instead of using XL's
        // raw pixel values unchanged, which would bunch everything into
        // the canvas's own left/top corner at a much narrower width.
        // Clamped afterward: the scale ratio alone doesn't shrink each
        // item's own width/height, so an item positioned near XL's right
        // or bottom edge can still land partly outside a narrower/shorter
        // canvas after scaling -- this keeps every item fully on-canvas
        // regardless of the size passed in.
        const restingLeft = Math.min(
          Math.max((resting.left / SCENE_SIZES.xl.width) * sceneWidth, 0),
          sceneWidth - item.width,
        );
        const restingTop = Math.min(
          Math.max((resting.top / SCENE_SIZES.xl.height) * sceneHeight, 0),
          sceneHeight - item.height,
        );
        return (
          <img
            key={item.key}
            ref={(el) => {
              itemElsRef.current[item.key] = el;
            }}
            src={item.src}
            alt=""
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 max-w-none ${
              item.shadow ? 'shadow-[0_4px_24px_rgba(0,0,0,0.24)]' : ''
            }`}
            style={
              shouldReduceMotion
                ? {
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    transform: `translate(${restingLeft}px, ${restingTop}px) rotate(${resting.rotate}deg)`,
                  }
                : { width: `${item.width}px`, height: `${item.height}px`, opacity: 0 }
            }
          />
        );
      })}
    </div>
  );
}

// The tape's left/top were hand-tuned against the XL card's own fixed
// 480x232 size specifically (a decorative sticker near its lower-right).
// Kept here as ratios of that original box so its position can be
// rescaled against whatever the card's ACTUAL rendered size turns out to
// be (see cardSize state below) -- needed now that the card is a fluid
// w-full box at S instead of a fixed 480px one.
const TAPE_REFERENCE_CARD = { width: 480, height: 232 };
const TAPE_REFERENCE_POSITION = { left: 189, top: 212 };

// White card + tape + pink circle, shared between the S and XL layouts --
// only the card's own width behavior actually differs between them (100%
// at S vs. a fixed 480px at XL), passed in via cardClassName rather than
// duplicating this whole block per breakpoint. columnClassName also
// varies: XL's column stays shrink-to-fit (matching the card's own fixed
// width), but S's needs to be w-full itself so the circle's items-end
// alignment has the section's actual full width to align against, not
// just whatever the column would otherwise shrink to.
//
// disableFadeIn (S only): the fade-up-into-view animation reads as
// fussy/slow on mobile scrolling, where the whole column is already
// close to the top of the viewport by the time it's noticed -- passing
// initial={false} whileInView={false} to the card and circle's own
// ScrollSections turns both into plain always-visible elements (see
// ScrollSection's own `??` override handling for why `false`, not just
// omitting the prop, is what's needed to actually cancel it out).
// circleClassName defaults to the original S/XL 320x320 circle -- only M
// passes its own override (240x240), so this stays a no-op change for
// every other caller.
const DEFAULT_CIRCLE_CLASS_NAME =
  'relative flex h-[320px] w-[320px] flex-shrink-0 origin-top-left rotate-2 flex-col items-center justify-center gap-2xs overflow-hidden rounded-full bg-bg-pink p-m';

function CardColumn({ columnClassName, cardClassName, circleClassName = DEFAULT_CIRCLE_CLASS_NAME, disableFadeIn = false }) {
  const cardRef = useRef(null);
  const [cardSize, setCardSize] = useState(TAPE_REFERENCE_CARD);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    const update = () => setCardSize({ width: el.offsetWidth, height: el.offsetHeight });
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  const tapeLeft = (TAPE_REFERENCE_POSITION.left / TAPE_REFERENCE_CARD.width) * cardSize.width;
  const tapeTop = (TAPE_REFERENCE_POSITION.top / TAPE_REFERENCE_CARD.height) * cardSize.height;

  return (
    <div className={columnClassName}>
      <ScrollSection
        ref={cardRef}
        transition={{ duration: 0.6, ease: 'easeOut', delay: WHITE_BOX_DELAY }}
        initial={disableFadeIn ? false : undefined}
        whileInView={disableFadeIn ? false : undefined}
        className={cardClassName}
      >
        <div className="flex flex-1 flex-col items-start justify-start gap-m">
          <h3 className="heading-3 self-stretch text-center text-heading-blue">
            <AccessibleHighlightText
              before="When money is tight, "
              highlight={<EssentialsHighlight>ESSENTIALS</EssentialsHighlight>}
              after=" comes first."
            />
          </h3>
          <p className="body-paragraph self-stretch text-center text-body-default">
            But parents still hope their kids can join art class, go on field trips, or just have
            time to play.
          </p>
        </div>

        {/* right:0 (not the original left:372px) -- that fixed value was
            only ever correct at the card's old constant 480px width
            (372+108=480, flush with zero overhang past the card's own
            right edge); anchoring from the right edge instead keeps that
            same flush position at any card width, including S's now-fluid
            w-full. */}
        <img
          src={paperClipMetal}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ width: '108px', height: '72px', right: '0px', top: '-55px' }}
        />
      </ScrollSection>

      {/* Rendered as its own independently-animated sibling rather than
          nested inside the card's ScrollSection -- a mix-blend-mode
          element whose ANCESTOR has opacity/transform actively tweening
          (exactly what ScrollSection's fade-up does) can render with
          the wrong, un-blended flat color for a frame or two right as
          that tween starts/settles, since opacity<1 + transform force
          the ancestor into an isolated compositing layer the blend
          mode can't correctly composite into until the layer
          "catches up". Same transition/delay as the card keeps them
          visually in sync; the outer wrapper above is `relative` (was
          static) so this absolute position still resolves against the
          same box the card itself sits in -- both share that box's
          left/top edges (the card is its widest child).
          left/top are now computed from the card's own MEASURED size
          (tapeLeft/tapeTop above), not the original fixed 189/212 --
          those were only ever correct at the card's old constant 480x232
          size. At S, the card reflows to a different (often shorter)
          height at its new fluid width, and the fixed top:212 landed
          past the card's own shorter bottom edge entirely -- the tape
          was rendering, just below the card instead of on it. Scaling by
          the card's actual measured width/height keeps it anchored to
          the same relative spot on the card at any size. */}
      <ScrollSection
        as="span"
        transition={{ duration: 0.6, ease: 'easeOut', delay: WHITE_BOX_DELAY }}
        initial={disableFadeIn ? false : undefined}
        whileInView={disableFadeIn ? false : undefined}
        aria-hidden="true"
        className="pointer-events-none absolute origin-top-left rotate-[5deg] bg-bg-purple mix-blend-multiply"
        style={{ width: '107px', height: '40px', left: `${tapeLeft}px`, top: `${tapeTop}px` }}
      />

      <ScrollSection
        transition={{ duration: 0.6, ease: 'easeOut', delay: PINK_CIRCLE_DELAY }}
        initial={disableFadeIn ? false : undefined}
        whileInView={disableFadeIn ? false : undefined}
        // flex-shrink-0: harmless where CardColumn stacks in a column
        // (S/XL, where this axis is height, not width, and there's no
        // tight height constraint pushing it to shrink anyway) but
        // required in M's own row arrangement -- without it, the
        // circle's default shrink:1 lets it get squeezed narrower
        // alongside the card under container pressure instead of
        // staying its own fixed size.
        className={circleClassName}
      >
        <RuledLines />
        <p className="body-paragraph-large relative self-stretch text-center text-heading-red">
          What would it take to make these opportunities easier to access?
        </p>
      </ScrollSection>
    </div>
  );
}

export default function Section6() {
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  const isAtLeastLg = useMediaQuery('(min-width: 992px)');
  // Only needed to tell L apart from XL -- card/circle size and the
  // FallingScene's own width behavior diverge there (own comment below).
  const isAtLeastXl = useMediaQuery('(min-width: 1200px)');
  const scene = isAtLeastSm ? SCENE_SIZES.xl : SCENE_SIZES.s;

  if (isAtLeastSm && !isAtLeastLg) {
    // M (640-991px): the exact same composited-overlay approach as S
    // below (FallingScene absolute inset-0 behind, one shared container
    // whose own explicit height is the falling-item canvas's height,
    // CardColumn painting on top via DOM order rather than z-index --
    // see S's own comment for why) -- the only thing that changes is
    // CardColumn's own internal arrangement: row instead of column, so
    // the white card and pink circle sit side by side as two columns
    // rather than stacked. SCENE_SIZES.s (not .xl) here too, same reason
    // as S: no fixed width, so FallingScene measures its own container's
    // real rendered width and always spans the true 100% content width
    // at this tier as well, not a guessed fixed number.
    //
    // items-start (not S's items-end): cross-axis is now vertical (this
    // is a row, not a column), and the card needs to stay the FIRST
    // child pinned to the wrapper's own top-left origin -- the tape's
    // left/top (computed in CardColumn from the card's own measured
    // size) assume the card's top-left corner IS the wrapper's origin,
    // an invariant items-start preserves regardless of which of the two
    // ends up taller, exactly like items-end did for S/XL's equal-width
    // stacking. flex-1 + min-w-0 on the card (not w-full, which would
    // claim the whole row): lets it fill whatever room is left beside
    // the circle's own fixed 320px, at any M width.
    return (
      <section
        id="section-6"
        className="relative flex w-full items-start justify-center overflow-hidden bg-chateau-green-600 px-page-margin-x py-page-margin-y"
      >
        <div className="relative w-full content-cap" style={{ height: `${scene.height}px` }}>
          <div className="pointer-events-none absolute inset-0 z-0">
            <FallingScene sceneHeight={scene.height} />
          </div>

          <CardColumn
            columnClassName="relative flex w-full flex-row items-start justify-start gap-l"
            cardClassName="relative flex flex-1 min-w-0 items-center justify-center gap-s rounded-medium bg-bg-white p-l"
            disableFadeIn
          />
        </div>
      </section>
    );
  }

  if (!isAtLeastSm) {
    // S: card+circle sit in normal flow at the top; FallingScene overlays
    // the ENTIRE container (absolute inset-0) BEHIND them (z-0, vs. the
    // card column's own explicit z-10), so items rain and settle in the
    // background around/behind the card and circle rather than covering
    // them -- one composited scene, not two side-by-side blocks like XL.
    // The container's own explicit height (scene.height) is what actually
    // gives FallingScene's absolute inset-0 something to fill; padding
    // lives on the <section> itself (py-page-margin-y, 64px at S) rather
    // than in here, so it doesn't eat into that fixed canvas height. No
    // sceneWidth passed here (unlike XL) -- FallingScene measures its own
    // rendered width itself, so it always spans the true 100% content
    // width rather than a guessed fixed number.
    //
    // CardColumn deliberately has NO z-index of its own (just `relative`,
    // needed regardless as the containing block for the tape/paperclip's
    // own absolute positioning) -- position:relative + a non-auto
    // z-index would establish a NEW STACKING CONTEXT, which traps the
    // tape's mix-blend-multiply inside it, cutting it off from blending
    // against anything outside that context (like this section's own
    // green background). CardColumn still paints above FallingScene's
    // wrapper without one: both are positioned elements at the same
    // z-index:auto "level", and DOM order (FallingScene's wrapper first,
    // CardColumn second) settles the tie the same way z-10 would have,
    // just without the isolation side effect.
    return (
      <section
        id="section-6"
        className="relative flex w-full items-start justify-center overflow-hidden bg-chateau-green-600 px-page-margin-x py-page-margin-y"
      >
        <div className="relative w-full content-cap" style={{ height: `${scene.height}px` }}>
          <div className="pointer-events-none absolute inset-0 z-0">
            <FallingScene sceneHeight={scene.height} />
          </div>

          <CardColumn
            columnClassName="relative flex w-full flex-col items-end justify-start"
            cardClassName="relative flex w-full items-center justify-center gap-s rounded-medium bg-bg-white p-l"
            disableFadeIn
          />
        </div>
      </section>
    );
  }

  if (isAtLeastLg && !isAtLeastXl) {
    // L (992-1199px): same overall structure as XL below (h-dvh,
    // CardColumn stacking card-above-circle, FallingScene as a row
    // sibling) but with the card (400px) and circle (240px) both scaled
    // down, and FallingScene now filling whatever width is left over
    // (flex-1) instead of XL's own fixed 660px -- content-cap's 1140px
    // cap has much less slack at the low end of L than at XL's own
    // 1200px+, so keeping XL's fixed 480+660 pairing here left no room
    // to breathe. Tape position is untouched -- CardColumn computes it
    // from the card's own measured size via ResizeObserver regardless of
    // what that size actually is, so it stays correctly anchored at 400px
    // the same way it already does at every other card width on this page.
    return (
      <section
        id="section-6"
        className="relative flex h-dvh w-full items-center justify-start overflow-hidden bg-chateau-green-600 px-page-margin-x"
      >
        <div className="relative flex w-full items-center justify-start content-cap">
          <CardColumn
            columnClassName="relative flex flex-none flex-col items-end justify-start"
            cardClassName="relative flex w-[400px] flex-none items-center justify-center gap-s rounded-medium bg-bg-white p-l"
            circleClassName="relative flex h-[240px] w-[240px] flex-none origin-top-left rotate-2 flex-col items-center justify-center gap-2xs overflow-hidden rounded-full bg-bg-pink p-m"
          />

          {/* min-w-0 overrides the flex default of min-width:auto -- same
              fix Section 8/17's own flex-1 columns needed. */}
          <div className="relative min-w-0 flex-1">
            <FallingScene sceneHeight={scene.height} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="section-6"
      // bg-chateau-green-600 directly, not the shared bg-bg-bright-green
      // token -- that token now points to the darker chateau-green-a11y
      // shade (for text-contrast reasons elsewhere), but nothing sits
      // directly on this section's own backdrop (the real content lives
      // in the white/pink cards on top of it), so there's no contrast
      // reason for it to have shifted, and the original -600 still looks
      // right here.
      className="relative flex h-dvh w-full items-center justify-start overflow-hidden bg-chateau-green-600 px-page-margin-x"
    >
      {/* Card column (480px) + FallingScene (660px) sit side by side with
          no gap, totaling exactly 1140px -- the section itself is
          row-mode flex with no justify-center (same setup as Section 1's
          own wrapper), so without this wrapper the pair would just hug
          the left page margin at any width instead of centering once the
          1140px site-wide cap actually applies at xl (1200px+). Below xl
          this is a no-op: w-full keeps the pair pinned left exactly as
          before. */}
      <div className="relative flex w-full items-center justify-start content-cap">
        <CardColumn
          columnClassName="relative flex flex-col items-end justify-start"
          cardClassName="relative flex w-[480px] items-center justify-center gap-s rounded-medium bg-bg-white p-l"
        />

        <FallingScene sceneWidth={scene.width} sceneHeight={scene.height} />
      </div>
    </section>
  );
}

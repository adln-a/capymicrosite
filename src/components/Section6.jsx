import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { useReducedMotion } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
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

function EssentialsHighlight() {
  // Same z-0/-z-10 span-wrap technique as the other scribble highlights.
  // Blue-Scribble-Multiple.svg is 162x28 natively -- an exact match for
  // the target size, no scaling needed.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={blueScribbleMultiple}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 -translate-x-1/2"
        style={{ width: '162px', height: '28px' }}
      />
      <span className="relative">ESSENTIALS</span>
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

const SCENE_WIDTH = 660;
const SCENE_HEIGHT = 794;
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
 */
function FallingScene() {
  const shouldReduceMotion = useReducedMotion();
  const sceneRef = useRef(null);
  const itemElsRef = useRef({});

  useEffect(() => {
    if (shouldReduceMotion) return undefined;
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
        SCENE_WIDTH / 2,
        SCENE_HEIGHT + WALL_THICKNESS / 2,
        SCENE_WIDTH + WALL_THICKNESS * 2,
        WALL_THICKNESS,
        { isStatic: true },
      );
      const leftWall = Matter.Bodies.rectangle(
        -WALL_THICKNESS / 2,
        SCENE_HEIGHT / 2,
        WALL_THICKNESS,
        SCENE_HEIGHT * 2,
        { isStatic: true },
      );
      const rightWall = Matter.Bodies.rectangle(
        SCENE_WIDTH + WALL_THICKNESS / 2,
        SCENE_HEIGHT / 2,
        WALL_THICKNESS,
        SCENE_HEIGHT * 2,
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
            const x = margin + Math.random() * (SCENE_WIDTH - margin * 2);
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
          if (bottom > SCENE_HEIGHT + 2) {
            Matter.Body.setPosition(body, {
              x: Math.min(Math.max(body.position.x, halfW), SCENE_WIDTH - halfW),
              y: SCENE_HEIGHT - height / 2,
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
          } else if (body.position.x - halfW < -2 || body.position.x + halfW > SCENE_WIDTH + 2) {
            Matter.Body.setPosition(body, {
              x: Math.min(Math.max(body.position.x, halfW), SCENE_WIDTH - halfW),
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
  }, [shouldReduceMotion]);

  return (
    <div ref={sceneRef} className="relative h-[794px] w-[660px] max-w-full flex-shrink-0">
      {FALLING_ITEMS.map((item) => {
        const resting = RESTING_POSITIONS[item.key];
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
                    transform: `translate(${resting.left}px, ${resting.top}px) rotate(${resting.rotate}deg)`,
                  }
                : { width: `${item.width}px`, height: `${item.height}px`, opacity: 0 }
            }
          />
        );
      })}
    </div>
  );
}

export default function Section6() {
  return (
    <section
      id="section-6"
      className="relative flex h-dvh w-full items-center justify-start overflow-hidden bg-bg-bright-green px-page-margin-x py-3xl"
    >
      <div className="flex flex-col items-end justify-start">
        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: WHITE_BOX_DELAY }}
          className="relative flex w-[480px] items-center justify-center gap-s rounded-medium bg-bg-white p-m"
        >
          <div className="flex flex-1 flex-col items-start justify-start gap-m">
            <h2 className="heading-2 self-stretch text-center text-heading-blue">
              When money is tight, <EssentialsHighlight /> comes first.
            </h2>
            <p className="body-paragraph self-stretch text-center text-body-default">
              But parents still hope their kids can join art class, go on field trips, or just have
              time to play.
            </p>
          </div>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute origin-top-left rotate-[5deg] bg-bg-purple mix-blend-multiply"
            style={{ width: '107px', height: '40px', left: '189px', top: '190px' }}
          />
          <img
            src={paperClipMetal}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ width: '108px', height: '72px', left: '372px', top: '-55px' }}
          />
        </ScrollSection>

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: PINK_CIRCLE_DELAY }}
          className="relative flex h-[320px] w-[320px] origin-top-left rotate-2 flex-col items-center justify-center gap-2xs overflow-hidden rounded-full bg-bg-pink p-m"
        >
          <RuledLines />
          <h2 className="heading-3 relative self-stretch text-center text-heading-red">
            What would it take to make these opportunities easier to access?
          </h2>
        </ScrollSection>
      </div>

      <FallingScene />
    </section>
  );
}

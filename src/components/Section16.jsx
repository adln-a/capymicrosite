import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import pinkScribble from '../assets/Pink-Scribble.svg';
import frameLeft from '../assets/Desktop-IMG-Frame-16-Left.svg';
import frameRight from '../assets/Desktop-IMG-Frame-16-Right.svg';

// Content + exact colors/rotations transcribed from the reference export
// (Section 16.html) -- each card's rotation and ruled-line tint is a
// specific, non-uniform value per card, not a shared constant.
const CARDS = [
  {
    key: 'support',
    bg: 'bg-bg-blue',
    rotate: -1,
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
    lineColor: 'var(--color-pomegranate-400)',
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
// it's settled -- matches the reference screenshots' stacked-deck look.
const STACK_PEEK = 24;
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

function RuledLines({ color }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[81px] flex flex-col gap-m opacity-75"
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
      <RuledLines color={card.lineColor} />
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
      style={{ opacity, y, rotate: card.rotate, transformOrigin: 'top left', zIndex: index + 1 }}
      className={`absolute inset-x-0 top-0 flex h-[355px] flex-col items-center justify-center gap-m overflow-hidden rounded-large px-l ${card.bg}`}
    >
      <CardContent card={card} />
    </motion.div>
  );
}

function TogetherHighlight() {
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={pinkScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[120%] -z-10 h-auto max-w-none -translate-x-1/2 -translate-y-1/2"
      />
      <span className="relative">TOGETHER</span>
    </span>
  );
}

function Header() {
  return (
    <h2 className="heading-2 flex w-[800px] max-w-full flex-wrap items-center justify-center gap-xs text-center text-heading-default">
      <span>Ways we can work</span>
      <TogetherHighlight />
      <span>to make meaningful change</span>
    </h2>
  );
}

function Illustrations() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-xs z-30 flex items-end justify-between px-2xl">
      <img src={frameLeft} alt="" aria-hidden="true" className="h-auto w-[535px] max-w-none" />
      <img src={frameRight} alt="" aria-hidden="true" className="h-auto w-[452px] max-w-none" />
    </div>
  );
}

export default function Section16() {
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] });

  if (prefersReducedMotion) {
    return (
      <section
        id="section-16"
        className="relative flex h-dvh w-full flex-col items-center justify-start gap-l overflow-hidden bg-bg-linen-dark px-page-margin-x pb-xs pt-3xl"
      >
        <Header />
        <div className="relative w-[640px] max-w-full" style={{ height: `${CARD_HEIGHT + 3 * STACK_PEEK}px` }}>
          {CARDS.map((card, index) => (
            <div
              key={card.key}
              style={{ transform: `translateY(${index * STACK_PEEK}px) rotate(${card.rotate}deg)`, transformOrigin: 'top left', zIndex: index + 1 }}
              className={`absolute inset-x-0 top-0 flex h-[355px] flex-col items-center justify-center gap-m overflow-hidden rounded-large px-l ${card.bg}`}
            >
              <CardContent card={card} />
            </div>
          ))}
        </div>
        <Illustrations />
      </section>
    );
  }

  return (
    <section id="section-16" ref={wrapperRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-dvh w-full flex-col items-center justify-start gap-l overflow-hidden bg-bg-linen-dark px-page-margin-x pb-xs pt-3xl">
        <Header />
        <div className="relative w-[640px] max-w-full" style={{ height: `${CARD_HEIGHT + 3 * STACK_PEEK}px` }}>
          {CARDS.map((card, index) => (
            <StackCard key={card.key} card={card} index={index} scrollYProgress={scrollYProgress} />
          ))}
        </div>
        <Illustrations />
      </div>
    </section>
  );
}

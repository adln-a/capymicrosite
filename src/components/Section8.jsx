import { useEffect, useRef, useState } from 'react';
import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import { ButtonPrimary } from './Navigation.jsx';
import { MaterialIcon } from './icons.jsx';
import { NODE_GRAPHICS, CONNECTOR_GRAPHICS, CONNECTOR_DOTS } from './section8ChartData.js';
import bgWhite from '../assets/Desktop-BGWhite--Frame-8.svg';
import cardBorderTop from '../assets/ChartCard--BorderTop.svg';
import cardBorderTopBigHole from '../assets/ChartCard--Big-Hole-BorderTop.svg';

const NODES = [
  {
    key: 'donors',
    cardTitle: 'Donors and Sponsors',
    bg: 'bg-bg-purple',
    colorVar: 'var(--color-bg-purple)',
    textVariant: 'default',
    body: [
      'Donors and sponsors provide the financial resources that make programmes possible. Their contributions fund not only the activities, but also the coordination, outreach, and logistics required to support low-income families. Their role is essential in sustaining long-term, inclusive access to enrichment and development opportunities for underserved children.',
    ],
  },
  {
    key: 'volunteers',
    cardTitle: 'Volunteers',
    bg: 'bg-bg-light-blue',
    colorVar: 'var(--color-bg-light-blue)',
    textVariant: 'default',
    body: [
      'Volunteers give their time, energy, and skills to run activities, mentor children, or support programme logistics. They play a hands-on role in creating positive experiences and building trust. For many families, volunteers are the human face of support — often bridging gaps with empathy, consistency, and care that money alone cannot buy.',
    ],
  },
  {
    key: 'nonprofits',
    cardTitle: 'Non-profits',
    bg: 'bg-bg-blue',
    colorVar: 'var(--color-bg-blue)',
    textVariant: 'inverted',
    body: [
      'These organisations design and run the actual programmes — from art and STEM workshops to mentorship and emotional learning. They often tailor experiences for children who may lack confidence or exposure. Beyond enrichment, their work builds self-esteem, creativity, and a sense of belonging that many low-income children rarely experience elsewhere.',
    ],
  },
  {
    key: 'ssa',
    cardTitle: 'Social Service Agencies',
    bg: 'bg-bg-red',
    colorVar: 'var(--color-bg-red)',
    textVariant: 'inverted',
    body: [
      'SSOs act as community anchors. They coordinate care, manage referrals, and link families with services, funding, and activities. They also train social workers and work closely with schools, healthcare, and grassroots groups. Their role is critical in ensuring services are holistic, responsive, and rooted in local realities.',
    ],
  },
  {
    key: 'socialworkers',
    cardTitle: 'Social Workers',
    bg: 'bg-bg-light-green',
    colorVar: 'var(--color-bg-light-green)',
    textVariant: 'default',
    body: [
      "Social workers are the frontline connectors. They assess each family's needs, recommend relevant services, and provide emotional support throughout. They navigate complex systems on behalf of families who are often overwhelmed. Their insight ensures the right help gets to the right people, especially when time, trust, and resources are limited.",
    ],
  },
  {
    key: 'beneficiaries',
    cardTitle: 'Beneficiaries',
    bg: 'bg-bg-yellow',
    colorVar: 'var(--color-bg-yellow)',
    textVariant: 'default',
    body: [
      "Low-income families are often juggling multiple jobs, tight budgets, and constant stress. They deeply value opportunities for their children but face barriers — cost, time, transport, and stigma. Many go unheard in traditional systems. Listening to their lived experience is key to designing support that's respectful, relevant, and truly empowering.",
    ],
  },
];

// Renders one extracted shape/text/connector element (see
// section8ChartData.js) with a dynamic fill swapped in.
function ChartPath({ graphic, fill }) {
  const { tag: Tag, ...props } = graphic;
  return <Tag {...props} fill={fill} />;
}

/**
 * Purely decorative flow chart -- aria-hidden, since every card already
 * states its own name in a real heading, so a screen reader user loses
 * nothing this chart alone provides. Every shape, text label, and
 * connector curve below is the exact vector geometry extracted from the
 * real exported artwork (Desktop-Stakeholder-Chart.svg via
 * section8ChartData.js) -- this file only swaps each element's fill
 * color per state, rather than re-approximating the art by hand.
 * `activeKey` null means "show every node in full color" (the intro/start
 * state, matching the reference); once scrolling reaches a node card,
 * only that node -- and its own outgoing connectors, confirmed against
 * the reference screenshots -- stay lit, the rest dim to
 * black-100/black-300/black-200.
 */
function FlowChart({ activeKey }) {
  return (
    <svg aria-hidden="true" width="518" height="612" viewBox="0 0 518 612" fill="none" className="block">
      {NODES.map((node) => {
        const isActive = activeKey === null || activeKey === node.key;
        const graphics = NODE_GRAPHICS[node.key];
        const shapeFill = isActive ? node.colorVar : 'var(--color-black-100)';
        const textFill = isActive
          ? node.textVariant === 'inverted'
            ? 'var(--color-body-inverted)'
            : 'var(--color-body-default)'
          : 'var(--color-black-300)';
        return (
          <g key={node.key}>
            <ChartPath graphic={graphics.shape} fill={shapeFill} />
            <ChartPath graphic={graphics.text} fill={textFill} />
          </g>
        );
      })}

      {CONNECTOR_GRAPHICS.map((connector, i) => {
        const isHighlighted = activeKey === null || activeKey === connector.from;
        const color = isHighlighted ? 'var(--color-black-500)' : 'var(--color-black-200)';
        return (
          <g key={i}>
            <path d={connector.line.d} fill="none" stroke={color} />
            <polygon points={connector.arrow.points} fill={color} />
          </g>
        );
      })}

      {CONNECTOR_DOTS.map((dot, i) => {
        const { tag: Tag, from, ...props } = dot;
        const isHighlighted = activeKey === null || activeKey === from;
        const color = isHighlighted ? 'var(--color-black-500)' : 'var(--color-black-200)';
        return <Tag key={i} {...props} fill="white" stroke={color} strokeWidth="1" />;
      })}
    </svg>
  );
}

// Both border-top assets bake in one fixed color each (Donors' purple,
// this card's own linen), so rather than duplicate their path data as JS
// (a snapshot that can silently go stale if the source file changes --
// exactly what happened with an earlier double-rotated version of the
// big-hole asset), each is used as a CSS mask over a plain colored div.
// That keeps the shape always in sync with the real file while still
// letting the color be swapped dynamically per card.
//
// The url() must be quoted: Vite inlines these small SVGs as
// `data:image/svg+xml,...` URIs that contain literal single quotes
// (from the SVG's own attributes, e.g. width='400'), and an unquoted
// CSS url() token can't contain a literal quote character -- the
// browser dropped the whole declaration silently when it wasn't quoted.
function MaskedBorderTop({ src, color, heightClass }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full ${heightClass}`}
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    />
  );
}

// ChartCard--BorderTop.svg is 480x8 -- exactly the node cards' fixed
// width, used at native size with no tiling needed (unlike Section
// 2/10's repeat-x border-top technique).
function CardBorderTop({ color }) {
  return <MaskedBorderTop src={cardBorderTop} color={color} heightClass="h-2" />;
}

// ChartCard--Big-Hole-BorderTop.svg is 400x20 -- a single large scallop
// rather than the repeating small ones, used for the "Here's how the
// ecosystem typically flows" linen card (also 400px wide).
function CardBorderTopBigHole({ color }) {
  return <MaskedBorderTop src={cardBorderTopBigHole} color={color} heightClass="h-5" />;
}

function EnvelopeCard({ innerRef, node, footer }) {
  const bodyColor = node.textVariant === 'inverted' ? 'text-body-inverted' : 'text-body-default';
  const headingColor = node.textVariant === 'inverted' ? 'text-heading-inverted' : 'text-heading-default';
  return (
    <div ref={innerRef} className="flex min-h-dvh w-full flex-col items-center justify-center gap-m py-3xl">
      <div className="flex w-[480px] max-w-full flex-col items-start">
        <CardBorderTop color={node.colorVar} />
        <div className={`w-full ${node.bg}`}>
          <ScrollSection className="flex w-full flex-col items-start gap-s pb-l pl-l pr-l pt-s">
            <h3 className={`heading-3 self-stretch ${headingColor}`}>{node.cardTitle}</h3>
            {node.body.map((paragraph, i) => (
              <p key={i} className={`body-paragraph self-stretch ${bodyColor}`}>
                {paragraph}
              </p>
            ))}
          </ScrollSection>
        </div>
      </div>
      {footer}
    </div>
  );
}

export default function Section8() {
  const [activeKey, setActiveKey] = useState(null);
  const introRef = useRef(null);
  const cardRefs = useRef(new Map());

  useEffect(() => {
    const keyByElement = new Map();
    if (introRef.current) keyByElement.set(introRef.current, null);
    cardRefs.current.forEach((el, key) => {
      if (el) keyByElement.set(el, key);
    });
    if (keyByElement.size === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.find((entry) => entry.isIntersecting);
        if (entered) {
          setActiveKey(keyByElement.get(entered.target));
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    keyByElement.forEach((_, el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToIntro = () => {
    introRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="section-8" className="relative w-full bg-bg-lightest-blue px-page-margin-x py-3xl">
      <div className="relative mx-auto grid w-full max-w-[1340px]">
        {/* Background artwork: a fixed-size blob (smaller than the section
            it sits in, by design), part of the backdrop rather than page
            content -- sticky like the chart, so it stays put in the
            viewport for the same whole scroll duration, with the colored
            cards scrolling past/over it rather than it scrolling away
            after the first viewport. Stacked on the row below via a
            shared grid cell (not a flex sibling of it) so its own layout
            box can't affect the row's horizontal centering. */}
        <div
          className="pointer-events-none sticky top-0 z-0 flex h-dvh items-center justify-center"
          style={{ gridArea: '1 / 1' }}
        >
          <img src={bgWhite} alt="" aria-hidden="true" width={1144} height={670} className="block" />
        </div>

        <div
          className="relative z-10 flex w-full flex-1 flex-row items-start justify-center gap-2xl px-l"
          style={{ gridArea: '1 / 1' }}
        >
          {/* Sticky chart column: plain position:sticky, no scroll-jacking
              or pinned/tall-wrapper trick -- it stays put in the viewport
              for as long as the (much taller) right column keeps
              scrolling past it, which is all `sticky` needs to do natively. */}
          <div className="sticky top-0 z-10 flex h-dvh flex-shrink-0 items-center justify-center">
            <FlowChart activeKey={activeKey} />
          </div>

          <div className="z-10 flex flex-1 flex-col items-center">
            <div ref={introRef} className="flex min-h-dvh w-full items-center justify-center py-3xl">
              <div className="flex w-[400px] max-w-full flex-col items-center">
                <div className="relative self-stretch">
                  <ScrollSection className="relative flex w-full origin-top-left rotate-3 flex-col items-center gap-m bg-bg-pink p-l">
                    {/* Even a plain nested <span> (no image, no
                        Highlight component) still reads to VoiceOver as a
                        separate "item" inside the heading -- confirmed via
                        screen-reader testing, announced as "heading level
                        2, 2 items ... level 1 MANY HANDS level 1". Same
                        fix as the scribble highlights: aria-hidden the
                        visual run, sr-only carries the one flat string. */}
                    <h2 className="heading-3 self-stretch text-center text-heading-red">
                      <AccessibleHighlightText
                        before="We learned that every family’s journey is touched by "
                        highlight={<span className="heading-3-accent">many hands</span>}
                      />
                    </h2>
                  </ScrollSection>

                  {/* Rendered as its own independently-animated sibling
                      rather than nested inside the card's ScrollSection --
                      a mix-blend-mode element whose ancestor has opacity/
                      transform actively tweening (or even just statically
                      present) renders with the wrong, un-blended flat color
                      (same isolated-compositing-layer issue as Section 6's
                      tape). This wrapper deliberately carries NO transform
                      of its own -- a static rotate on a shared ancestor
                      would ALSO wall the tape off from blending with
                      whatever's behind/around the card, same isolation bug,
                      just permanent instead of transient. So the card keeps
                      its own rotate-3 directly on itself (it's the tape's
                      SIBLING here, not its ancestor). left-1/2/-translate-x-1/2
                      centers the tape on the container regardless of its
                      actual rendered width (rather than a fixed left px
                      value tied to one specific width). */}
                  {/* bg-chateau-green-600 directly, not the shared
                      bg-bg-bright-green token -- that token now points to
                      the darker chateau-green-a11y shade (for text-
                      contrast reasons elsewhere), but this tape is purely
                      decorative (aria-hidden), so there's no contrast
                      reason for it to have shifted from its original -600. */}
                  <ScrollSection
                    as="span"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 origin-top-left -translate-x-1/2 rotate-[-4deg] bg-chateau-green-600 mix-blend-multiply"
                    style={{ width: '127px', height: '42px', top: '-8px' }}
                  />
                </div>

                <ScrollSection
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                  className="w-full origin-top-left -rotate-2 self-stretch"
                >
                  <div className="w-full">
                    <CardBorderTopBigHole color="var(--color-bg-linen-dark)" />
                  </div>
                  <div className="w-full bg-bg-linen-dark p-l text-center">
                    <p className="body-paragraph text-body-default">Here&rsquo;s how the ecosystem typically flows</p>
                  </div>
                </ScrollSection>
              </div>
            </div>

            {NODES.map((node) => {
              const isLast = node.key === 'beneficiaries';
              return (
                <EnvelopeCard
                  key={node.key}
                  node={node}
                  innerRef={(el) => {
                    if (el) cardRefs.current.set(node.key, el);
                  }}
                  // ButtonPrimary inverted (white pill, orange text/icon),
                  // not ButtonTertiary -- capy-orange-a11y as plain text
                  // on this section's own bg-bg-lightest-blue only reaches
                  // ~3.3:1, but on this button's own white surface it's
                  // back to a clean 4.52:1, since the pill isolates the
                  // text from the page background behind it.
                  footer={
                    isLast && (
                      <ButtonPrimary inverted onClick={scrollToIntro}>
                        Return to the beginning
                        <MaterialIcon name="refresh" />
                      </ButtonPrimary>
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

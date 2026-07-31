import { useEffect, useRef, useState } from 'react';
import ScrollSection from './ScrollSection.jsx';
import { ButtonTertiary } from './Navigation.jsx';
import { MaterialIcon } from './icons.jsx';
import { NODE_GRAPHICS, CONNECTOR_GRAPHICS, CONNECTOR_DOTS } from './section8ChartData.js';
import bgWhite from '../assets/Desktop-BGWhite--Frame-8.svg';

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

function NotchRow() {
  // Same hole-punch circle technique used throughout the site (Section
  // 1/5/7's HoleColumn), applied horizontally along a card's top edge --
  // white, since the sticky background blob sits behind every card (it
  // pins for the whole section, not just the intro), reading as holes
  // punched through to reveal it.
  return (
    <div aria-hidden="true" className="-mb-[10px] flex items-center justify-center gap-s overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="h-5 w-5 flex-shrink-0 rounded-full bg-bg-white" />
      ))}
    </div>
  );
}

function EnvelopeCard({ innerRef, node, footer }) {
  const bodyColor = node.textVariant === 'inverted' ? 'text-body-inverted' : 'text-body-default';
  const headingColor = node.textVariant === 'inverted' ? 'text-heading-inverted' : 'text-heading-default';
  return (
    <div ref={innerRef} className="flex min-h-dvh w-full flex-col items-center justify-center gap-xs py-3xl">
      <div className={`w-[480px] max-w-full overflow-hidden ${node.bg}`}>
        <NotchRow />
        <ScrollSection className="flex w-full flex-col items-start gap-s pb-l pl-l pr-l pt-s">
          <h2 className={`heading-3 self-stretch ${headingColor}`}>{node.cardTitle}</h2>
          {node.body.map((paragraph, i) => (
            <p key={i} className={`body-paragraph self-stretch ${bodyColor}`}>
              {paragraph}
            </p>
          ))}
        </ScrollSection>
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
    <section id="section-8" className="relative w-full bg-bg-light-blue px-page-margin-x py-3xl">
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
                <ScrollSection className="relative flex origin-top-left rotate-3 flex-col items-center gap-m self-stretch bg-bg-pink p-l">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute origin-top-left -rotate-[7deg] bg-bg-bright-green mix-blend-multiply"
                    style={{ width: '127px', height: '42px', left: '138px', top: '0px' }}
                  />
                  <h2 className="heading-3 self-stretch text-center text-heading-red">
                    We learned that every family&rsquo;s journey is touched by <span className="uppercase">many hands</span>
                  </h2>
                </ScrollSection>

                <ScrollSection
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                  className="w-full origin-top-left -rotate-2 self-stretch bg-bg-linen-dark p-l text-center"
                >
                  <p className="body-paragraph text-body-default">Here&rsquo;s how the ecosystem typically flows</p>
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
                  footer={
                    isLast && (
                      <ButtonTertiary onClick={scrollToIntro}>
                        Return to the beginning
                        <MaterialIcon name="refresh" />
                      </ButtonTertiary>
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

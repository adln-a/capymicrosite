import { useEffect, useRef, useState } from 'react';
import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import { ButtonPrimary } from './Navigation.jsx';
import { MaterialIcon } from './icons.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { NODE_GRAPHICS, CONNECTOR_GRAPHICS, CONNECTOR_DOTS } from './section8ChartData.js';
import {
  NODE_GRAPHICS as MOBILE_NODE_GRAPHICS,
  CONNECTOR_GRAPHICS as MOBILE_CONNECTOR_GRAPHICS,
  CONNECTOR_DOTS as MOBILE_CONNECTOR_DOTS,
} from './section8MobileChartData.js';
import bgWhite from '../assets/Desktop-BGWhite--Frame-8.svg';
import bgWhiteS from '../assets/s/S--BG-Frame8.svg';
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

/**
 * Same activeKey-driven dim/highlight logic as FlowChart, just reading
 * from section8MobileChartData.js (extracted from
 * Mobile-Stakeholder-Chart.svg) and its own 360.98x423.63 viewBox instead
 * -- a genuinely different chart layout/arrangement at this size, not a
 * scaled-down version of the desktop artwork. w-full h-auto (not a fixed
 * width/height like FlowChart's own 518x612) since this chart is meant to
 * fill/scale with its container as a background layer, not sit at one
 * fixed pixel size in a column next to the cards.
 */
function MobileFlowChart({ activeKey }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 360.98 423.63" fill="none" className="block h-auto w-full">
      {NODES.map((node) => {
        const isActive = activeKey === null || activeKey === node.key;
        const graphics = MOBILE_NODE_GRAPHICS[node.key];
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

      {MOBILE_CONNECTOR_GRAPHICS.map((connector, i) => {
        const isHighlighted = activeKey === null || activeKey === connector.from;
        const color = isHighlighted ? 'var(--color-black-500)' : 'var(--color-black-200)';
        return (
          <g key={i}>
            <path d={connector.line.d} fill="none" stroke={color} />
            <polygon points={connector.arrow.points} fill={color} />
          </g>
        );
      })}

      {MOBILE_CONNECTOR_DOTS.map((dot, i) => {
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
    // min-w-0 on both this root (a flex item of the min-w-0 text column
    // above) and the 480px card wrapper below -- each is itself a flex
    // item of a flex-col parent, and each one reintroduces its own
    // default min-width:auto floor unless explicitly zeroed. Per spec
    // min-width wins over max-width when they conflict, so max-w-full
    // alone on the card wrapper wasn't enough -- the implicit floor from
    // this OUTER level was still winning and forcing the card (and its
    // text) wider than the viewport.
    <div ref={innerRef} className="flex min-h-dvh w-full min-w-0 flex-col items-center justify-center gap-m py-page-margin-y">
      <div className="flex w-[480px] max-w-full min-w-0 flex-col items-start">
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

// Intro card ("many hands") + all 6 EnvelopeCards -- identical between
// the XL and mobile layouts (both already mobile-safe via the existing
// min-w-0/max-w-full cascade), so it's shared here rather than
// duplicated between the two branches in Section8() below. Only the
// OUTER arrangement (chart beside this column vs. chart behind it)
// actually differs by breakpoint.
function ContentColumn({ introRef, cardRefs, scrollToIntro }) {
  return (
    <>
      {/* Same cascading min-w-0 fix as EnvelopeCard below -- both this
          intro wrapper and the 400px card inside it are themselves
          flex items of their own flex-col parent, and each
          reintroduces the min-width:auto floor unless zeroed. */}
      <div ref={introRef} className="flex min-h-dvh w-full min-w-0 items-center justify-center py-page-margin-y">
        <div className="flex w-[400px] max-w-full min-w-0 flex-col items-center">
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
    </>
  );
}

export default function Section8() {
  // No dedicated M/L reference for this section -- S below sm (640px),
  // the existing XL-tuned side-by-side layout from sm up, same "reuse
  // the nearest larger tier" convention used everywhere else.
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  const [activeKey, setActiveKey] = useState(null);
  const introRef = useRef(null);
  const cardRefs = useRef(new Map());

  // isAtLeastSm in the dependency array (not just [] on mount): the
  // mobile and XL branches below render genuinely different JSX shapes
  // (chart-as-background-behind-a-stacked-column vs. chart-as-a-sticky-
  // side-column), so crossing the 640px breakpoint mid-session unmounts
  // the old intro/card DOM nodes and mounts fresh ones -- introRef.current
  // and cardRefs.current end up pointing at the NEW elements once React
  // finishes committing, but an effect that only ran once on initial
  // mount would still be observing the OLD (now-detached) nodes forever,
  // never re-attaching to the new ones. That's exactly the reported bug:
  // resizing across the breakpoint left the chart stuck un-dimmed until a
  // full reload re-ran this effect from scratch. Re-running the effect on
  // every branch change (disconnecting the stale observer, then
  // re-reading the refs and re-observing) keeps it correct across resizes
  // without needing a page reload.
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
  }, [isAtLeastSm]);

  const scrollToIntro = () => {
    introRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isAtLeastSm) {
    // Mobile: the chart itself becomes the sticky BACKGROUND (no
    // side-by-side column -- there's no room for one), with the intro +
    // cards stacked in a single column scrolling on top of it. Same
    // shared-gridArea overlap technique as the XL branch below, and the
    // exact same activeKey/IntersectionObserver logic drives the
    // dim/highlight interaction identically, since that logic only
    // depends on the intro/card refs' own viewport position, never on how
    // the chart happens to be laid out around them.
    //
    // Three stacked gridArea:1/1 layers, back to front: S--BG-Frame8.svg
    // (this tier's own decorative backdrop blob, analogous to bgWhite at
    // XL but a distinct asset/shape, not a reused/rescaled one), then the
    // chart, then the scrolling content column -- all three sit BEHIND
    // each other via plain DOM order (no z-index needed to separate them
    // from one another; z-10 on the content column below is only there to
    // outrank the two pointer-events-none sticky layers, matching the XL
    // branch's own z-0/z-10 split).
    return (
      <section id="section-8" className="relative w-full bg-bg-lightest-blue px-page-margin-x py-page-margin-y">
        <div className="relative grid w-full">
          <div
            className="pointer-events-none sticky top-0 z-0 flex h-dvh w-full items-center justify-center overflow-hidden"
            style={{ gridArea: '1 / 1' }}
          >
            <img src={bgWhiteS} alt="" aria-hidden="true" width={361} height={480} className="block" />
          </div>

          <div
            className="pointer-events-none sticky top-0 z-0 flex h-dvh w-full items-center justify-center overflow-hidden"
            style={{ gridArea: '1 / 1' }}
          >
            <MobileFlowChart activeKey={activeKey} />
          </div>

          <div className="relative z-10 flex w-full min-w-0 flex-col items-center" style={{ gridArea: '1 / 1' }}>
            <ContentColumn introRef={introRef} cardRefs={cardRefs} scrollToIntro={scrollToIntro} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="section-8" className="relative w-full bg-bg-lightest-blue px-page-margin-x py-page-margin-y">
      {/* content-cap: the site-wide desktop content cap (was an
          unconditional, one-off max-w-[1340px] mx-auto -- pre-dates the
          1140px policy and doesn't match it). Confirmed safe at 1140px:
          the flex-1 text column already shrinks the 480px cards via its own
          min-w-0/max-w-full, and even at the new, smaller cap still has
          ~478px available for them (1140 - 2*px-l - chart's 518px -
          gap-2xl's 64px, at xl's own token values) -- a 2px difference from
          their native 480px, imperceptible. */}
      <div className="relative grid w-full content-cap">
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

        {/* min-w-0 here too -- this row is a GRID item (shares gridArea:
            1/1 with the background above), and CSS Grid items get the
            exact same implicit min-width:auto floor flex items do. Every
            flex-level min-w-0 further down the tree (the text column,
            each card) was correctly added, but this OUTERMOST boundary
            was still missing it, so the row itself never actually
            shrank below its content's natural width -- the real reason
            text kept getting cropped past the viewport edge regardless
            of what got fixed inside it. */}
        <div
          className="relative z-10 flex w-full min-w-0 flex-1 flex-row items-start justify-center gap-2xl px-l"
          style={{ gridArea: '1 / 1' }}
        >
          {/* Sticky chart column: plain position:sticky, no scroll-jacking
              or pinned/tall-wrapper trick -- it stays put in the viewport
              for as long as the (much taller) right column keeps
              scrolling past it, which is all `sticky` needs to do natively.
              flex-shrink-0 keeps the 518px-wide chart at its full,
              legible size always -- it's a diagram with small embedded
              text labels, not something that should ever get squeezed. */}
          <div className="sticky top-0 z-10 flex h-dvh flex-shrink-0 items-center justify-center">
            <FlowChart activeKey={activeKey} />
          </div>

          {/* min-w-0 overrides the flex default of min-width:auto -- without
              it, this flex-1 column refused to shrink below its content's
              own natural minimum (even though every card inside already
              has max-w-full), which combined with the chart's fixed,
              non-shrinking 518px was what forced the whole row wider than
              the viewport and produced a horizontal scrollbar at ordinary
              desktop widths. min-w-0 is what actually lets this column (not
              the chart) absorb the squeeze. */}
          <div className="z-10 flex min-w-0 flex-1 flex-col items-center">
            <ContentColumn introRef={introRef} cardRefs={cardRefs} scrollToIntro={scrollToIntro} />
          </div>
        </div>
      </div>
    </section>
  );
}

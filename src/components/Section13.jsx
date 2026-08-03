import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import blueScribble from '../assets/Blue-Scribble.svg';
import bgRight from '../assets/Desktop-BG--Frame-13-Right.svg';
import bgBottomLeft from '../assets/Desktop-BG--Frame-13-BottomLeft.svg';

// H2 fades up first, then the pink box, then both background
// illustrations -- same staggered-delay convention as Section 1's
// pink/white box pair (0.18s steps), extended one more step for the
// backgrounds, which fade in together rather than separately staggered
// from each other.
const HEADING_DELAY = 0;
const PINK_BOX_DELAY = 0.18;
const BG_DELAY = 0.36;

function ParticipationHighlight({ children }) {
  // Same span-wrap technique as the other scribble highlights.
  // Blue-Scribble.svg (not Blue-Line-Scribble.svg -- confirmed by
  // rendering both: Blue-Scribble is the thick highlighter-swipe style
  // that matches the reference under PARTICIPATION, Blue-Line-Scribble is
  // a thin zigzag used elsewhere and doesn't match) is 89x23 natively --
  // kept at that native size (not stretched to PARTICIPATION's own much
  // wider rendered width).
  return (
    <span className="relative z-0 inline-block origin-top-left rotate-[-1deg] whitespace-nowrap">
      <img
        src={blueScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 max-w-none -translate-x-1/2"
        style={{ width: '89px', height: '23px', top: 'var(--scribble-offset-default)' }}
      />
      <span className="heading-2-accent relative">{children}</span>
    </span>
  );
}

export default function Section13() {
  return (
    <section
      id="section-13"
      className="relative flex h-dvh w-full items-start justify-between bg-bg-blue px-page-margin-x pt-3xl"
    >
      {/* Shared positioning context for the left column and the
          bottom-left illustration -- both need to align to the page
          margin's left edge (not the true viewport edge, unlike the
          right-side image below), and the illustration needs to anchor
          to the bottom of the full section height, not just the left
          column's own (much shorter) content height. */}
      <div className="relative h-full">
        <div className="flex w-[560px] max-w-full flex-col items-start justify-start gap-m">
          <ScrollSection
            transition={{ duration: 0.6, ease: 'easeOut', delay: HEADING_DELAY }}
            className="self-stretch"
          >
            {/* Even a plain nested <span> (no image, no Highlight
                component) still reads to VoiceOver as a separate "item"
                inside the heading -- confirmed via screen-reader testing
                on Section 8's identical case. Same fix as the scribble
                highlights: aria-hidden the visual run, sr-only carries the
                one flat string. */}
            <h2 className="heading-2 text-heading-inverted">
              <AccessibleHighlightText
                before="Capy Activity Hub would not be the right solution because it’s "
                highlight={<span className="heading-2-accent">not</span>}
                after=" a question about access."
              />
            </h2>
          </ScrollSection>

          <div className="relative self-stretch">
            <ScrollSection
              transition={{ duration: 0.6, ease: 'easeOut', delay: PINK_BOX_DELAY }}
              className="relative flex w-full origin-top-left rotate-1 items-center justify-center gap-xs bg-bg-pink px-[40px] py-[24px]"
            >
              <h2 className="heading-2 text-heading-red">
                <AccessibleHighlightText before="It’s about " highlight={<ParticipationHighlight>PARTICIPATION</ParticipationHighlight>} />
              </h2>
            </ScrollSection>

            {/* Rendered as its own independently-animated sibling rather
                than nested inside the card's ScrollSection -- a mix-blend-
                mode element whose ancestor has opacity/transform actively
                tweening (or even just statically present) renders with the
                wrong, un-blended flat color (same isolated-compositing-
                layer issue as Section 6's tape). This wrapper deliberately
                carries NO transform of its own -- a static rotate on a
                shared ancestor would ALSO wall the tape off from blending
                with whatever's behind/around the card, same isolation bug,
                just permanent instead of transient. So the card keeps its
                own rotate-1 directly on itself (it's the tape's SIBLING
                here, not its ancestor), and the tape instead carries the
                FULL composed rotation (originally -16deg nested inside a
                1deg card == -15deg standalone), with left/top being the
                card's own 1deg rotation applied to the original (494, 5)
                offset. */}
            <ScrollSection
              as="span"
              transition={{ duration: 0.6, ease: 'easeOut', delay: PINK_BOX_DELAY }}
              aria-hidden="true"
              className="pointer-events-none absolute origin-top-left rotate-[-15deg] bg-bg-purple mix-blend-multiply"
              style={{ width: '128px', height: '46px', left: '493.84px', top: '13.62px' }}
            />
          </div>
        </div>

        <ScrollSection
          as="img"
          src={bgBottomLeft}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: BG_DELAY }}
          // 367x250 natively, matching the reference's own proportions --
          // used at natural size, no override needed.
          style={{ width: '367px', height: '250px' }}
          className="pointer-events-none absolute bottom-0 left-0"
        />
      </div>

      {/* Right-side illustration: aligns to the TRUE viewport edge
          (right:0), deliberately escaping the px-page-margin-x constraint
          that the left column and bottom-left image respect -- hence
          position:absolute directly on the section rather than nesting
          inside the padded/relative wrapper above. */}
      <ScrollSection
        as="img"
        src={bgRight}
        alt=""
        aria-hidden="true"
        transition={{ duration: 0.6, ease: 'easeOut', delay: BG_DELAY }}
        className="pointer-events-none absolute right-0 top-0 h-full w-auto"
      />
    </section>
  );
}

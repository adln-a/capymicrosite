import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import blueScribble from '../assets/Blue-Scribble.svg';
import bgRight from '../assets/Desktop-BG--Frame-13-Right.svg';
import bgBottomLeft from '../assets/Desktop-BG--Frame-13-BottomLeft.svg';
import sImgFrame13 from '../assets/s/S--IMG-Frame13.svg';

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

// Shared between XL and S -- only the column's own width differs (a
// fixed 560px at XL, full-width at S), everything else (heading, pink
// box, tape) is identical.
function HeadingAndPinkBox({ widthClassName }) {
  return (
    <div className={`flex ${widthClassName} flex-col items-start justify-start gap-m`}>
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
          className="relative flex w-full origin-top-left rotate-1 items-center justify-center gap-xs bg-bg-pink px-l py-l"
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
            1deg card == -15deg standalone).

            Positioned via `right` (a fixed -61.84px overhang past the
            card's own right edge), not the original fixed `left:493.84px`
            -- that literal offset was tuned only for the card's old
            constant 560px width, and at any narrower width (S) it landed
            far past the card's actual right edge, off in empty space --
            which is exactly why the tape "disappeared" at S. Anchoring
            to the right edge instead keeps it correctly hanging off the
            corner regardless of the card's own width, at both tiers. */}
        <ScrollSection
          as="span"
          transition={{ duration: 0.6, ease: 'easeOut', delay: PINK_BOX_DELAY }}
          aria-hidden="true"
          className="pointer-events-none absolute origin-top-left rotate-[-15deg] bg-bg-purple mix-blend-multiply"
          style={{ width: '128px', height: '46px', right: '-61.84px', top: '13.62px' }}
        />
      </div>
    </div>
  );
}

export default function Section13() {
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');

  if (!isAtLeastSm) {
    // No h-dvh here (unlike sm+ below): the heading + pink box + full
    // Frame13 illustration stacked in normal flow runs taller than one
    // phone screen, so this section just hugs its own content height
    // instead of forcing/clipping to the viewport -- same fix as
    // Section 5/Section 3/Section 11 for the same reason. The two XL
    // background illustrations (bgRight/bgBottomLeft) are replaced
    // entirely by the one S--IMG-Frame13.svg image, stacked below the
    // text column in normal flow rather than absolutely positioned.
    return (
      <section
        id="section-13"
        className="relative flex w-full flex-col items-center justify-start bg-bg-blue px-page-margin-x pt-page-margin-y"
      >
        <HeadingAndPinkBox widthClassName="w-full" />

        {/* Full-bleed (100vw, breaking out of the page's own side
            margins) -- the asset's own native 393px width is a full
            device-width frame, not a margined column graphic, matching
            how every other full-bleed image on the site (Section 8's
            chart, Section 9's carousel) already breaks out the same way.
            Pulled up over the pink box (negative margin-top) with an
            explicit z-index above it, rather than just touching edges --
            the illustration sits in front of the box's lower portion. */}
        <ScrollSection
          as="img"
          src={sImgFrame13}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: BG_DELAY }}
          style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', marginTop: '-48px' }}
          className="pointer-events-none relative z-10 block h-auto"
        />
      </section>
    );
  }

  return (
    <section
      id="section-13"
      className="relative flex h-dvh w-full items-start justify-between bg-bg-blue px-page-margin-x"
    >
      {/* Shared positioning context for the left column and the
          bottom-left illustration -- the illustration needs to anchor to
          the bottom of the full section height, not just the left
          column's own (much shorter) content height.

          content-cap: the Figma source frame for this section's left
          content is 1140x608, centered within the reference canvas
          (confirmed against the frame's own margins, roughly equal
          left/right against the section background) -- same site-wide
          desktop cap as most other sections, centered the same way. This
          DOES shift the text/pink-box column rightward off the page
          margin at xl (previously flush-left) to match. pt-page-margin-y:
          the reference frame sits 96px below the section's own top edge
          (64px below xl, following the same token everywhere else), not
          flush against it -- this section was previously left with no
          top offset at all (items-start, no padding), which was flagged
          as never actually producing a deliberate vertical position; this
          is that position. */}
      <div className="relative h-full w-full content-cap pt-page-margin-y">
        <HeadingAndPinkBox widthClassName="w-[560px] max-w-full" />

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

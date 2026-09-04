import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import purpleHighlight from '../assets/Highlights/Purple-Highlight.svg';
import bgRight from '../assets/Desktop-BG--Frame-13-Right.svg';
import bgBottomLeft from '../assets/Desktop-BG--Frame-13-BottomLeft.svg';
import sImgFrame13 from '../assets/s/S--IMG-Frame13.svg';
import mCompiled from '../assets/m/M--BG--Frame13 Compiled.svg';

// H2 fades up first, then the pink box, then both background
// illustrations -- same staggered-delay convention as Section 1's
// pink/white box pair (0.18s steps), extended one more step for the
// backgrounds, which fade in together rather than separately staggered
// from each other.
const HEADING_DELAY = 0;
const PINK_BOX_DELAY = 0.18;
const BG_DELAY = 0.36;

function ParticipationHighlight({ children }) {
  // Purple-Highlight.svg (120x31, a compact highlighter mark, not a
  // full-width underline) replaces Blue-Scribble.svg -- sits just under
  // the baseline (top-full + a small downward-adjusted translate),
  // centered. h-full/w-auto (not w-full): this mark stays its own native
  // proportions instead of stretching to PARTICIPATION's own much wider
  // rendered width -- same treatment as Section 16's TOGETHER mark, tied
  // to the wrapper's own height (which tracks heading-2-accent's
  // responsive font-size) so it scales at every breakpoint without
  // getting stretched lengthwise.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={purpleHighlight}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 max-w-none -translate-x-1/2 translate-y-[calc(-33.333%+3px)]"
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
  // Only needed to tell M apart from L/XL -- M gets its own dedicated
  // background composition (own comment below), not S's stacked single
  // image or XL's two-image layout.
  const isAtLeastLg = useMediaQuery('(min-width: 992px)');

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
        // overflow-x-clip, not overflow-x-hidden: `hidden` on only one
        // axis makes the browser silently auto-pair the OTHER axis to
        // `auto` too (a real CSS spec quirk, not a typo) -- that turned
        // this section into its own nested vertical scroll container,
        // trapping ~24px of its own content behind an internal scrollbar
        // and causing exactly the jerky "tries to stick" handoff + sudden
        // scrollbar + clipped illustration reported on mobile. `clip`
        // achieves the same horizontal clipping without establishing a
        // scroll container, so it doesn't trigger that pairing at all.
        className="relative flex w-full flex-col items-center justify-start overflow-x-clip bg-bg-blue px-page-margin-x pt-page-margin-y"
      >
        <HeadingAndPinkBox widthClassName="w-full" />

        {/* Full-bleed (100vw, breaking out of the page's own side
            margins) -- the asset's own native 393px width is a full
            device-width frame, not a margined column graphic, matching
            how every other full-bleed image on the site (Section 8's
            chart, Section 9's carousel) already breaks out the same way.
            No margin-top -- sits directly below the pink box, no overlap. */}
        <ScrollSection
          as="img"
          src={sImgFrame13}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: BG_DELAY }}
          style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', marginTop: '0' }}
          className="pointer-events-none relative z-10 block h-auto"
        />
      </section>
    );
  }

  if (!isAtLeastLg) {
    // M: text column now centered at a max-width of 560px (was left-
    // aligned at a fixed 360px), and the three separately corner-
    // anchored illustrations (mBgRight/mBgLeft/mBgBottom, each an
    // absolutely-positioned overlay that had to be individually kept
    // clear of the text) are replaced by ONE compiled composition
    // (mCompiled) stacked BELOW the text in normal document flow --
    // same technique as S's own sImgFrame13 below, and for the same
    // reason: a normal-flow sibling can't overlap the text above it,
    // no matter how narrow the viewport or how much the heading wraps,
    // where the old absolutely-positioned pieces repeatedly did at high
    // zoom (same fix already applied site-wide to XL's own two-piece
    // overlay, see bgBottomLeft's history).
    //
    // No h-dvh here anymore either, for the same reason it isn't used
    // at S: stacked content can run taller than one viewport, so this
    // hugs its own content height instead of clipping to the viewport.
    return (
      <section
        id="section-13"
        // overflow-x-clip, not overflow-x-hidden -- see the S branch's
        // own comment for why: `hidden` on one axis alone silently
        // auto-pairs the other to `auto`, turning this into its own
        // nested scroll container.
        //
        // px-page-margin-x dropped from here (was on this section like
        // every other branch) and moved onto the text-only wrapper
        // below instead -- same fix Section 1 already uses for its own
        // full-bleed background image. The illustration needs to be a
        // padding-free sibling of that wrapper: as a DIRECT child of a
        // padded section, calc(50% - 50vw) margins compute against the
        // section's narrowed content-box width, not the true viewport,
        // and didn't reliably cancel the padding in practice. With no
        // padding on the section itself, the image can just be w-full,
        // no vw/calc breakout math needed at all.
        className="relative flex w-full flex-col items-center justify-start overflow-x-clip bg-bg-blue pt-page-margin-y"
      >
        <div className="w-full px-page-margin-x">
          <HeadingAndPinkBox widthClassName="w-full max-w-[560px] mx-auto" />
        </div>

        {/* w-full (not S's own 100vw/calc breakout below) -- this
            section carries no horizontal padding anymore (see the
            section's own comment above), so the image already spans
            the true viewport edge to edge without needing to cancel
            anything. */}
        <ScrollSection
          as="img"
          src={mCompiled}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: BG_DELAY }}
          className="pointer-events-none relative z-10 mt-xs block h-auto w-full"
        />
      </section>
    );
  }

  return (
    <section
      id="section-13"
      className="relative flex min-h-dvh w-full items-start justify-between bg-bg-blue px-page-margin-x"
    >
      {/* content-cap: the Figma source frame for this section's left
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
          is that position.

          h-full dropped: this div isn't the bottom-left illustration's
          positioning context anymore (see that illustration's own
          wrapper comment below) -- h-full never actually worked for that
          purpose. A percentage height only resolves against a parent
          with a DEFINITE height (a real fixed value); this section's own
          min-h-dvh is a floor, not a fixed height, which CSS explicitly
          treats as indefinite for percentage-height children -- so
          h-full silently fell back to this div's own content height
          (346px, just enough for the heading + pink box) instead of the
          section's real height, landing the illustration up near the
          heading instead of the section's true bottom. */}
      <div className="relative w-full content-cap pt-page-margin-y">
        <HeadingAndPinkBox widthClassName="w-[560px] max-w-full" />
      </div>

      {/* Bottom-left illustration's own positioning context -- a SEPARATE
          content-cap wrapper (not sharing the text column's div above),
          so it gets the exact same horizontal alignment as the heading/
          pink box (including content-cap's own xl+ centering, which a
          hand-picked left-[page-margin-x] value would miss) without
          reusing that div's own h-full (which is what was broken).
          inset-0 (not h-full) is what actually fixes the height: unlike
          a percentage height, top/right/bottom/left offsets on an
          absolutely positioned element resolve against the containing
          block's ACTUAL final size regardless of whether that size came
          from a definite height or content -- so this correctly stretches
          to the section's real height even though the section itself is
          only min-h-dvh. Confirmed via direct DOM measurement: left edge
          matches the heading's own left edge exactly, and the bottom
          edge lands exactly on the section's true bottom, at 0 gap. */}
      <div className="pointer-events-none absolute inset-0 w-full content-cap">
        <ScrollSection
          as="img"
          src={bgBottomLeft}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: BG_DELAY }}
          // 367x250 natively, matching the reference's own proportions --
          // used at natural size, no override needed.
          style={{ width: '367px', height: '250px' }}
          className="absolute bottom-0 left-0"
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

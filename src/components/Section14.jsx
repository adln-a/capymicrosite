import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import blueLineScribble from '../assets/Blue-Line-Scribble.svg';
import paperClipMetal2 from '../assets/Paper-Clip-Metal2.png';
import illustration from '../assets/Desktop-IMG-Frame-14.svg';
import sIllustration from '../assets/s/S--IMG-Frame14.svg';

// Cards fade up in sequence (alone card -> green box -> red note),
// then the illustration last -- same staggered-delay convention as
// Section 1's pink/white box pair (0.18s steps).
const ALONE_CARD_DELAY = 0;
const GREEN_BOX_DELAY = 0.18;
const RED_CARD_DELAY = 0.36;
const ILLUSTRATION_DELAY = 0.54;

const RULED_LINE_COUNT = 8;

function AloneHighlight({ children }) {
  // Same z-0/-z-10 span-wrap technique as Section 5's ScribbleHighlight
  // (same Blue-Line-Scribble.svg asset, 227x16 natively) -- w-full ties
  // the scribble's width to the wrapped text's own rendered width rather
  // than a fixed pixel value, so it can't drift if the text changes. No
  // -translate-y-1/2 (unlike Section 5's version): this one sits fully
  // below the text, same as ParticipationHighlight in Section 13.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap px-3xs">
      <img
        src={blueLineScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 h-auto w-full max-w-none origin-top -translate-x-1/2 rotate-[-5deg]"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

// topOffset differs by tier because the text it trails wraps to a
// different number of lines at each width -- XL's 96px = 72px (3 lines)
// + one gap-m (24px); S's 120px = 96px (4 lines, since the card is much
// narrower) + the same gap-m.
function RuledLines({ topOffset }) {
  // Same technique as Section 5's RuledLines: an absolutely-positioned,
  // non-flow overlay of evenly-gapped border-top lines, clipped by the
  // card's own overflow-hidden -- i.e. positioned to start right after
  // the paragraph, using the card's own text rhythm rather than a value
  // tuned by eye. opacity-50: this card's bg-bg-red is now
  // capy-orange-a11y (after the bg-red/orange merge), and the
  // border-pomegranate-500 lines read too loud against it at full
  // strength -- same subtlety treatment Section 16's own RuledLines
  // already uses (opacity-75 there), just a touch further down since
  // this background is a closer match to the line color.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 z-0 flex flex-col gap-m opacity-50"
      style={{ top: `${topOffset}px` }}
    >
      {Array.from({ length: RULED_LINE_COUNT }).map((_, i) => (
        <div key={i} className="h-0 self-stretch border-t border-pomegranate-500" />
      ))}
    </div>
  );
}

// left/top differ substantially between tiers (S: left:-115px top:16px,
// deliberately overflowing off the card's own left edge so only a
// partial row peeks out near the top, clipped by the card's own
// overflow-hidden; XL: left:24px top:128px, a full row lower in the
// card) -- not a fluid/formula scale, so each tier's own literal
// position is passed in rather than computed from one shared value.
function HoleRow({ left, top }) {
  // 19 square (not circular) holes -- this card's own punch-hole style,
  // distinct from the circular holes used in Section 1/2/5/7.
  return (
    <div aria-hidden="true" className="absolute flex flex-row items-center gap-s" style={{ left, top }}>
      {Array.from({ length: 19 }).map((_, i) => (
        <span key={i} className="h-4 w-4 rounded-[2px] bg-bg-pink" />
      ))}
    </div>
  );
}

export default function Section14() {
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');

  if (!isAtLeastSm) {
    // No h-dvh here (unlike sm+ below): all 3 cards stacked at 100%
    // width plus the illustration run taller than one phone screen, so
    // this section just hugs its own content height instead of forcing/
    // clipping to the viewport -- same fix as Section 5/3/11/13. The
    // side-by-side alone-card + green-box row also becomes a plain
    // vertical stack (no row wrapper) since both are full-width now,
    // there's nothing left for "side by side" to mean.
    return (
      <section
        id="section-14"
        className="relative flex w-full flex-col items-center justify-start gap-s bg-[#FFBFC3] px-page-margin-x pt-page-margin-y pb-xl"
      >
        <div className="relative w-full">
          <ScrollSection
            transition={{ duration: 0.6, ease: 'easeOut', delay: ALONE_CARD_DELAY }}
            className="flex w-full origin-top-left rotate-[-4deg] flex-col items-center justify-center gap-s rounded-medium bg-bg-white p-l"
          >
            <h2 className="heading-3-accent text-center text-heading-default">
              <AccessibleHighlightText highlight={<AloneHighlight>We can&rsquo;t do this alone</AloneHighlight>} />
            </h2>
          </ScrollSection>

          {/* Resized to 128x48 (was 130.89x37.98) and pushed further up
              (top:-40px, was -21.29px) so its bottom edge barely dips
              into the card's own padding instead of overlapping the
              heading text. */}
          <ScrollSection
            as="span"
            transition={{ duration: 0.6, ease: 'easeOut', delay: ALONE_CARD_DELAY }}
            aria-hidden="true"
            className="pointer-events-none absolute origin-top-left rotate-[19deg] bg-bg-yellow mix-blend-multiply"
            style={{ width: '128px', height: '48px', left: '12.25px', top: '-40px' }}
          />
        </div>

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: GREEN_BOX_DELAY }}
          className="relative flex w-full origin-top-left rotate-4 flex-col items-start justify-start gap-s rounded-medium bg-bg-bright-green p-l"
        >
          <h3 className="heading-3 self-stretch text-heading-inverted">
            <AccessibleHighlightText
              before="Real change happens when we become "
              highlight={<span className="heading-3-accent">part of the system</span>}
              after=", not separate from it."
            />
          </h3>
          {/* Resized smaller (64x64.63, was 92.93x93.85, height kept at
              the same native aspect ratio so the raster image isn't
              stretched) and centered on the card (left-1/2/
              -translate-x-1/2, self-adjusting to the card's own width)
              rather than a fixed left offset -- centers it over both the
              box and the text inside it, since the text is also
              self-stretch/full-width. top scaled by the same factor as
              width/height so it still hangs the same proportional amount
              above the card. */}
          <img
            src={paperClipMetal2}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 -translate-x-1/2"
            style={{ width: '64px', height: '64.63px', top: '-44px' }}
          />
        </ScrollSection>

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: RED_CARD_DELAY }}
          className="relative flex w-full flex-col items-center justify-start gap-m overflow-hidden rounded-medium bg-bg-red px-l pb-l pt-2xl"
        >
          <p className="body-paragraph relative z-10 self-stretch text-body-inverted">
            To create lasting impact, we need to work closely with families, social workers,
            donors, activity providers, and community leaders.
          </p>
          <RuledLines topOffset={120} />
          <HoleRow left="-115px" top="16px" />
        </ScrollSection>

        {/* Full-bleed (100vw), matching Section 13's own illustration --
            the S asset's native 369px width is a near-full device-width
            frame, not a margined column graphic. */}
        <ScrollSection
          as="img"
          src={sIllustration}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: ILLUSTRATION_DELAY }}
          style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
          className="pointer-events-none block h-auto"
        />
      </section>
    );
  }

  return (
    <section
      id="section-14"
      className="relative flex h-dvh w-full flex-col items-end justify-center bg-[#FFBFC3] px-page-margin-x"
    >
      {/* items-start: only the illustration below hugs the right edge
          (via its own self-end) -- the top row and red card stay
          left-aligned within this wrapper. content-cap: the site-wide
          desktop content cap, same as every other section's wrapper (was
          an unconditional max-w-[800px], a one-off number tuned to just
          fit the 715px illustration -- replaced for consistency). Its own
          margin-inline:auto here also overrides the section's own
          items-end (which right-aligns this wrapper by default, since
          auto margins take priority over align-items in flexbox) --
          centering the whole column instead of pinning it flush to the
          right page margin. */}
      <div className="relative flex w-full flex-col items-start justify-start gap-s content-cap">
        <div className="flex items-center justify-between self-stretch">
          <div className="relative w-fit">
            <ScrollSection
              transition={{ duration: 0.6, ease: 'easeOut', delay: ALONE_CARD_DELAY }}
              className="flex origin-top-left rotate-[-4deg] flex-col items-center justify-center gap-s rounded-medium bg-bg-white p-l"
            >
              {/* AloneHighlight's nested spans + absolutely-positioned
                  scribble image read to VoiceOver as a separate "item"
                  inside the heading, announced with spurious "level 1"
                  noise -- same fix as the other scribble highlights:
                  aria-hidden the visual run, sr-only carries the one flat
                  string. No `before`/`after` here since AloneHighlight's
                  own children ("We can't do this alone") is the entire
                  heading, not just part of a longer sentence. */}
              <h2 className="heading-3-accent text-center text-heading-default">
                <AccessibleHighlightText highlight={<AloneHighlight>We can&rsquo;t do this alone</AloneHighlight>} />
              </h2>
            </ScrollSection>

            {/* Rendered as its own independently-animated sibling rather
                than nested inside the card's ScrollSection -- a mix-blend-
                mode element whose ancestor has opacity/transform actively
                tweening (or even just statically present) renders with the
                wrong, un-blended flat color (same isolated-compositing-
                layer issue as Section 6's tape). IMPORTANT: this wrapper
                deliberately carries NO transform of its own -- a static
                rotate on a shared ancestor would ALSO wall the tape off
                from blending with whatever's behind/around the card, same
                isolation bug, just permanent instead of transient. So the
                card keeps its own rotate(-4deg) directly on itself (it's
                the tape's SIBLING here, not its ancestor, so that can't
                isolate the tape), and the tape instead carries the FULL
                composed rotation (originally 19deg nested inside a -4deg
                card == 15deg standalone), with left/top being the card's
                own -4deg rotation applied to the original (11, -30) offset
                -- reproducing the exact same on-screen position/
                orientation the nested version had. */}
            <ScrollSection
              as="span"
              transition={{ duration: 0.6, ease: 'easeOut', delay: ALONE_CARD_DELAY }}
              aria-hidden="true"
              className="pointer-events-none absolute origin-top-left rotate-[15deg] bg-bg-yellow mix-blend-multiply"
              style={{ width: '106px', height: '40px', left: '8.88px', top: '-30.69px' }}
            />
          </div>

          <ScrollSection
            transition={{ duration: 0.6, ease: 'easeOut', delay: GREEN_BOX_DELAY }}
            className="relative flex w-[540px] origin-top-left rotate-4 flex-col items-start justify-start gap-s rounded-medium bg-bg-bright-green p-l"
          >
            <h3 className="heading-3 self-stretch text-heading-inverted">
              <AccessibleHighlightText
                before="Real change happens when we become "
                highlight={<span className="heading-3-accent">part of the system</span>}
                after=", not separate from it."
              />
            </h3>
            <img
              src={paperClipMetal2}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{ width: '76px', height: '77px', left: '236px', top: '-53px' }}
            />
          </ScrollSection>
        </div>

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: RED_CARD_DELAY }}
          className="relative flex h-[160px] w-[640px] flex-col items-center justify-start gap-m overflow-hidden rounded-medium bg-bg-red px-l pb-l pt-l"
        >
          {/* relative z-10: without it, this text painted BEHIND RuledLines
              despite coming first in the DOM -- position:absolute elements
              (RuledLines, even at z-0) always paint after non-positioned
              in-flow siblings within the same stacking context, DOM order
              notwithstanding. That alone would only have mattered if the
              two visually overlapped, which they do here: RuledLines'
              top-[96px] is measured from the CARD's own top edge, but the
              text is additionally offset by the card's own pt-l (40px at
              xl) before it even starts, so the text's actual bottom edge
              (40 + 72 = 112px down) sits past where the first ruled line
              begins (96px down) -- a ~16px overlap, not just a
              theoretical stacking risk. */}
          <p className="body-paragraph relative z-10 self-stretch text-body-inverted">
            To create lasting impact, we need to work closely with families, social workers,
            donors, activity providers, and community leaders.
          </p>
          <RuledLines topOffset={96} />
          <HoleRow left="24px" top="128px" />
        </ScrollSection>

        <ScrollSection
          as="img"
          src={illustration}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: ILLUSTRATION_DELAY }}
          style={{ width: '715px', height: '440px', marginTop: '-140px' }}
          className="relative self-end"
        />
      </div>
    </section>
  );
}

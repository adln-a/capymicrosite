import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import blueLineScribble from '../assets/Blue-Line-Scribble.svg';
import paperClipMetal2 from '../assets/Paper-Clip-Metal2.png';
import illustration from '../assets/Desktop-IMG-Frame-14.svg';

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
    <span className="relative z-0 inline-block whitespace-nowrap px-[2px]">
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

function RuledLines() {
  // Same technique as Section 5's RuledLines: an absolutely-positioned,
  // non-flow overlay of evenly-gapped border-top lines, clipped by the
  // card's own overflow-hidden + fixed height. top-[96px] = the text
  // block's own height (72px, 3 lines at body-paragraph's 24px line
  // height) plus one gap-m (24px) -- i.e. positioned to start right
  // after the paragraph, using the card's own text rhythm rather than a
  // value tuned by eye. opacity-50: this card's bg-bg-red is now
  // capy-orange-a11y (after the bg-red/orange merge), and the
  // border-pomegranate-500 lines read too loud against it at full
  // strength -- same subtlety treatment Section 16's own RuledLines
  // already uses (opacity-75 there), just a touch further down since
  // this background is a closer match to the line color.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[96px] z-0 flex flex-col gap-m opacity-50"
    >
      {Array.from({ length: RULED_LINE_COUNT }).map((_, i) => (
        <div key={i} className="h-0 self-stretch border-t border-pomegranate-500" />
      ))}
    </div>
  );
}

function HoleRow() {
  // 19 square (not circular) holes -- this card's own punch-hole style,
  // distinct from the circular holes used in Section 1/2/5/7.
  return (
    <div
      aria-hidden="true"
      className="absolute flex flex-row items-center gap-s"
      style={{ left: '24px', top: '128px' }}
    >
      {Array.from({ length: 19 }).map((_, i) => (
        <span key={i} className="h-4 w-4 rounded-[2px] bg-bg-pink" />
      ))}
    </div>
  );
}

export default function Section14() {
  return (
    <section
      id="section-14"
      className="relative flex h-dvh w-full flex-col items-end justify-center bg-[#FFBFC3] px-page-margin-x py-3xl"
    >
      {/* items-start: only the illustration below hugs the right edge
          (via its own self-end) -- the top row and red card stay
          left-aligned within this wrapper. w-full (not a hardcoded pixel
          width) so this always exactly matches the section's own
          px-page-margin-x-derived content width, staying in sync if that
          token ever changes. */}
      <div className="relative flex w-full flex-col items-start justify-start gap-s">
        <div className="flex items-center justify-between self-stretch">
          <div className="relative w-fit">
            <ScrollSection
              transition={{ duration: 0.6, ease: 'easeOut', delay: ALONE_CARD_DELAY }}
              className="flex origin-top-left rotate-[-4deg] flex-col items-center justify-center gap-s rounded-medium bg-bg-white p-[40px]"
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
            className="relative flex w-[540px] origin-top-left rotate-4 flex-col items-start justify-start gap-s rounded-medium bg-bg-bright-green p-[40px]"
          >
            <h3 className="heading-3 self-stretch text-heading-inverted">
              Real change happens when we become part of the system, not separate from it.
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
          className="relative flex h-[160px] w-[640px] flex-col items-center justify-start gap-m overflow-hidden rounded-medium bg-bg-red px-[40px] pb-[40px] pt-[24px]"
        >
          <p className="body-paragraph self-stretch text-body-inverted">
            To create lasting impact, we need to work closely with families, social workers,
            donors, activity providers, and community leaders.
          </p>
          <RuledLines />
          <HoleRow />
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

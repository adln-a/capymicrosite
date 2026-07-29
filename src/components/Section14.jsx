import ScrollSection from './ScrollSection.jsx';
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
  // Same z-0/-z-10 span-wrap technique as ParticipationHighlight/
  // PeopleHighlight, but the "scribble" is a plain solid-color rotated
  // rect (Allports-300) rather than an SVG asset -- the raw export
  // clips an oversized rect through an overflow-hidden mask, but for a
  // flat fill that's visually identical to just sizing the rect to the
  // final 265x41 directly. Built this way (rather than copying the
  // export's plain position:absolute sibling) so the rect is guaranteed
  // to paint behind the text regardless of paint-order rules -- an
  // absolutely-positioned sibling with no z-index would otherwise paint
  // AFTER static text content, on top of it, not behind it.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap px-[2px]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 origin-top-left rotate-[-5deg] bg-allports-300"
        style={{ width: '265px', height: '41px', left: '0px', top: '45px' }}
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
  // value tuned by eye.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[96px] z-0 flex flex-col gap-m"
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
          <ScrollSection
            transition={{ duration: 0.6, ease: 'easeOut', delay: ALONE_CARD_DELAY }}
            className="flex w-[325px] flex-col items-start justify-start gap-xs"
          >
            <div className="relative flex origin-top-left rotate-[-4deg] flex-col items-center justify-center gap-s self-stretch rounded-medium bg-bg-white p-[40px]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute origin-top-left rotate-[19deg] bg-bg-yellow mix-blend-multiply"
                style={{ width: '109px', height: '32px', left: '11px', top: '-11px' }}
              />
              <h2 className="heading-3 text-center uppercase text-heading-default">
                <AloneHighlight>We can&rsquo;t do this alone</AloneHighlight>
              </h2>
            </div>
          </ScrollSection>

          <ScrollSection
            transition={{ duration: 0.6, ease: 'easeOut', delay: GREEN_BOX_DELAY }}
            className="relative flex w-[540px] origin-top-left rotate-4 flex-col items-start justify-start gap-s rounded-medium bg-bg-bright-green p-[40px]"
          >
            <h2 className="heading-3 self-stretch text-heading-inverted">
              Real change happens when we become part of the system, not separate from it.
            </h2>
            <img
              src={paperClipMetal2}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{ width: '76px', height: '77px', left: '236px', top: '-33px' }}
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

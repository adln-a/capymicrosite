import ScrollSection from './ScrollSection.jsx';

const CARD_SHADOW = 'shadow-[0_8px_16px_rgba(0,0,0,0.08)]';
// White box's ScrollSection starts its own whileInView animation this much
// after the pink box's, so the two are a staggered pair rather than one
// simultaneous fade.
const WHITE_BOX_DELAY = 0.18;

function PinkPunchHoles() {
  // Fixed-width column sized to exactly one hole's diameter (20px) — no
  // explicit column width was given in the export, just "fixed-width".
  return (
    <div
      aria-hidden="true"
      className="flex w-5 shrink-0 flex-col items-center justify-between self-stretch"
    >
      <span className="h-5 w-5 rounded-full bg-white-linen-200" />
      <div className="flex flex-col items-center gap-s">
        <span className="h-5 w-5 rounded-full bg-white-linen-200" />
        <span className="h-5 w-5 rounded-full bg-white-linen-200" />
      </div>
      <span className="h-5 w-5 rounded-full bg-white-linen-200" />
    </div>
  );
}

function WhitePunchHoles() {
  // 18 holes at 20px with 24px gaps = 768px, and 800px box width minus
  // px-s (16px) on each side = 768px too -- the 16px side inset isn't
  // given explicitly, but the math only works out exactly at that value,
  // so it's very likely what Figma actually used.
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 flex -translate-y-1/2 items-center justify-start gap-[24px] px-s"
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="h-5 w-5 shrink-0 rounded-full bg-bg-linen-dark" />
      ))}
    </div>
  );
}

function FourHighlight() {
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 -rotate-1 bg-bg-light-green"
        style={{ width: '137px', height: '23px' }}
      />
      <span className="relative">FOUR</span>
    </span>
  );
}

export default function Section1({ sectionRef }) {
  return (
    <section
      ref={sectionRef}
      id="section-1"
      className="relative flex min-h-[800px] items-center bg-white-linen-200 px-page-margin-x py-4xl"
      style={{ height: '100vh' }}
    >
      <div className="flex w-full flex-col items-center">
        {/* Pink box (heading). Animates in first -- this ScrollSection uses
            the wrapper's own default transition (no delay). */}
        <ScrollSection className="flex w-[800px] max-w-full min-h-[200px] flex-wrap items-center justify-center gap-s rounded-medium bg-bg-pink p-s origin-top-left rotate-1">
          <PinkPunchHoles />
          <h1 className="heading-1 flex-1 text-center text-heading-red">
            Children from low-income families in Singapore are over{' '}
            <FourHighlight /> times more likely to underperform in school
            compared to their wealthier peers*
          </h1>
        </ScrollSection>

        {/* White box (body) + the tape, staggered ~180ms after the pink
            box. The tape is a child of this same ScrollSection (not a
            separate animated element) so it animates in with the box it's
            visually attached to, on the same timing. Directly below the
            pink box -- no gap value was given between them, so the two sit
            flush; the slight visual overlap comes from their opposing
            1deg/-1deg rotations. */}
        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: WHITE_BOX_DELAY }}
          className={`relative w-[800px] max-w-full origin-top-left -rotate-1 rounded-medium bg-bg-white pt-[16px] pr-[40px] pb-[40px] pl-[40px] ${CARD_SHADOW}`}
        >
          <WhitePunchHoles />

          <span
            aria-hidden="true"
            className="absolute origin-top-left rotate-[10deg] bg-prelude-300 mix-blend-multiply"
            style={{ width: '107px', height: '38px', left: '751px', top: '-28px' }}
          />

          <div className="flex flex-col items-center gap-[24px]">
            <p className="body-paragraph text-center text-body-default">
              Not because they&rsquo;re any less capable, but because
              they&rsquo;re starting from further behind, with fewer chances to
              catch up.
            </p>
            <p className="body-paragraph text-center text-body-default">
              Without meaningful support, the gap widens. Poor grades lead to
              fewer opportunities. Fewer opportunities lead to lower-paying
              jobs. And the cycle of inequality continues, generation after
              generation.
            </p>
            <p className="caption text-center text-body-default">
              *Organisation for Economic Cooperation and Development (OECD)
              Report 2016
            </p>
          </div>
        </ScrollSection>
      </div>
    </section>
  );
}

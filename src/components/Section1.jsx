import ScrollSection from './ScrollSection.jsx';
import bgFrame1 from '../assets/Desktop-BG--Frame-1.svg';
import fourScribble from '../assets/Green-Scribble.svg';

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
      className="flex w-5 min-h-[200px] shrink-0 flex-col items-center justify-between self-stretch"
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
  // Normal flex-flow child now, not absolutely positioned -- it's the first
  // item in the same flex column as the paragraph text, so the box's own
  // top padding and the column's gap-[24px] space it out naturally. mx-[-40px]
  // exactly cancels the parent's pr-[40px]/pl-[40px], and w-full makes this
  // row 100% of the parent's (padding-inset) content width -- together they
  // pull it back out to the box's full 800px outer width, bleeding past the
  // padding on both sides while the paragraphs below stay padded normally.
  // 18 holes at 20px with 24px gaps = 768px, and 800px box width minus
  // px-s (16px) on each side = 768px too -- the 16px side inset isn't
  // given explicitly, but the math only works out exactly at that value,
  // so it's very likely what Figma actually used.
  return (
    <div
      aria-hidden="true"
      className="mx-[-40px] flex items-center justify-start gap-[24px] px-s"
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="h-5 w-5 shrink-0 rounded-full bg-bg-linen-dark" />
      ))}
    </div>
  );
}

function FourHighlight() {
  // Same stacking pattern as before: z-0 on this wrapping span gives it its
  // own stacking context, so -z-10 on the image is scoped safely within it
  // (rather than escaping to some ancestor context, as bit us with the nav
  // shape earlier).
  //
  // Sizing/position: w-full (not the image's own natural 138px width) ties
  // the scribble's width to the span's own width, which is set purely by
  // the "FOUR" text content (the image is absolute, so it can't influence
  // that width itself) -- so it can never overflow into "over"/"times" on
  // either side, and stays correctly sized if heading-1 changes size at a
  // different breakpoint. h-auto preserves the asset's own aspect ratio at
  // that width. top-full + a small upward translate sits it just below the
  // word with a slight overlap into the letters' bottoms, rather than
  // centered on the line (which is what covered the neighboring words
  // before).
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={fourScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 h-auto max-w-none -translate-x-1/2 -translate-y-1/2"
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
      className="relative flex min-h-[800px] items-center bg-white-linen-200 py-4xl"
      style={{ height: '100vh' }}
    >
      {/* Background image layer, sitting on top of the section's own
          bg-white-linen-200 color and behind everything else. As the
          section's first child with no z-index, it paints above the
          section's own background/border by default (children always
          paint above their parent's background) but below every later
          sibling here, since none of them set a competing negative
          z-index -- z-stacking is background color -> this image -> the
          pink/white boxes, purely from DOM order. */}
      <img
        src={bgFrame1}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />

      <div className="page-container relative flex w-full flex-col items-center">
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
          <span
            aria-hidden="true"
            className="absolute origin-top-left rotate-[10deg] bg-prelude-300 mix-blend-multiply"
            style={{ width: '107px', height: '38px', left: '710px', top: '-28px' }}
          />

          <div className="flex flex-col items-center gap-[24px]">
            <WhitePunchHoles />
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

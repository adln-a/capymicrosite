import ScrollSection from './ScrollSection.jsx';
import paperTearBg from '../assets/Paper-Tear-BG.png';
import blueLineScribble from '../assets/Blue-Line-Scribble.svg';
import illustration from '../assets/Desktop-IMG-Frame-5.svg';

function ScribbleHighlight({ children }) {
  // Same span-wrap technique as FourHighlight (Section 1) and
  // MatterHighlight (Section 2): z-0 on the wrapping span gives it its own
  // stacking context so the image's -z-10 stays scoped inside it. w-full
  // ties the scribble's width to the wrapped words' own rendered width
  // rather than the asset's native size, so it can't drift if that text
  // changes. Blue-Line-Scribble.svg is 227x16 natively -- exactly the
  // ~227x16 target, so no explicit size override is needed. whitespace-nowrap
  // keeps "enrichment opportunities" from breaking across lines, which is
  // fine since both words already land on the same line as each other.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={blueLineScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 h-auto w-full max-w-none -translate-x-1/2 -translate-y-1/2"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

function RuledLines() {
  // 7 evenly-spaced notebook-ruling lines behind the heading/holes -- z-0
  // is explicit but mostly academic here: as the box's first child, it
  // already paints behind its later siblings by plain DOM order, so no
  // negative z-index (and the escaping-stacking-context risk that comes
  // with one on a merely `relative` ancestor) is needed to sit it "behind"
  // the text.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[30px] z-0 flex flex-col gap-[40px]"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-0 self-stretch border-t border-pomegranate-500" />
      ))}
    </div>
  );
}

function HoleColumn() {
  // Top hole, middle pair (gap-s), bottom hole -- height-[220px] with
  // justify-between spaces the three groups out to the card's full height,
  // same idea as Section 2's HoleColumn but with this specific
  // top/pair/bottom split (matches Section 1's punch-hole pattern more
  // than Section 2's plain even stack).
  return (
    <div aria-hidden="true" className="flex h-[220px] flex-col items-start justify-between">
      <span className="h-5 w-5 rounded-full bg-bg-pink" />
      <div className="flex flex-col items-start gap-s">
        <span className="h-5 w-5 rounded-full bg-bg-pink" />
        <span className="h-5 w-5 rounded-full bg-bg-pink" />
      </div>
      <span className="h-5 w-5 rounded-full bg-bg-pink" />
    </div>
  );
}

export default function Section5() {
  return (
    <section
      id="section-5"
      className="relative flex w-full items-center justify-center bg-bg-pink px-page-margin-x py-page-margin-y"
    >
      <div className="flex w-[826px] flex-col items-center justify-start self-stretch">
        {/* Card group: plain, unanimated position:relative wrapper -- the
            paper-tear background and tape are absolutely positioned
            children of THIS group (not the red box), so they render
            statically alongside the box regardless of the box's own
            fade-in-up, which is scoped to the ScrollSection below instead
            of this whole group. */}
        <div className="relative flex flex-col items-start justify-start">
          <img
            src={paperTearBg}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute origin-top-left rotate-[-2deg]"
            style={{ width: '621px', height: '248px', left: '-57px', top: '37px' }}
          />

          <ScrollSection className="relative flex w-[800px] flex-row items-center justify-center gap-m rounded-medium bg-bg-red px-[24px] py-[40px]">
            <RuledLines />
            <HoleColumn />

            <div className="relative flex flex-1 flex-wrap content-center items-center justify-start gap-xs px-[24px]">
              <div className="flex flex-1 items-center justify-center">
                <h2 className="heading-2 text-heading-inverted">
                  {/* ScribbleHighlight's nested spans + absolutely-positioned
                      underline image (needed for the decorative effect) read
                      to VoiceOver as separate nested "items" inside the
                      heading, each announced at its own DOM depth ("level 1")
                      -- confusing noise despite the image itself already
                      being aria-hidden. aria-hidden here on the whole visual
                      run skips all of that; the plain sr-only span below is
                      the only thing assistive tech actually reads, same
                      aria-hidden-visible/sr-only-text pairing SpeechBubble.jsx
                      already uses for this exact problem. */}
                  <span aria-hidden="true">
                    How might we help low-income parents access AFFORDABLE{' '}
                    <ScribbleHighlight>enrichment opportunities</ScribbleHighlight> for their children
                    despite financial constraints and competing essential needs?
                  </span>
                  <span className="sr-only">
                    How might we help low-income parents access AFFORDABLE enrichment opportunities
                    for their children despite financial constraints and competing essential needs?
                  </span>
                </h2>
              </div>
            </div>
          </ScrollSection>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute origin-top-left rotate-6 bg-bg-light-blue mix-blend-multiply"
            style={{ width: '240px', height: '48px', left: '283px', top: '-35px' }}
          />
        </div>

        <ScrollSection
          as="img"
          src={illustration}
          alt=""
          aria-hidden="true"
          // -16px pulls the illustration up so its top edge overlaps the
          // box's bottom edge by exactly 16px, rather than sitting flush
          // against it (the default with no gap set on the flex-col
          // wrapper above).
          style={{ width: '718px', height: '319px', marginTop: '-16px' }}
          // relative (not just static default) matters here: the red box
          // is position:relative (needed for its own absolute children),
          // and positioned elements always paint after plain static
          // content within the same stacking context, regardless of DOM
          // order. Without this, the box painted on top of the
          // illustration even though it comes first in the markup.
          className="relative h-auto max-w-full"
        />
      </div>
    </section>
  );
}

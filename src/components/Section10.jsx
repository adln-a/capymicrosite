import ScrollSection from './ScrollSection.jsx';
import paperBorderTop from '../assets/Paper-Border-Top.png';
import purpleScribble from '../assets/Purple-Scribble.svg';
import illustration from '../assets/Desktop-IMG--Frame-10.svg';

// Same tile technique as Section 2 Scene 2's TopBorderImage (a
// background-image, not a plain <img>, so repeat-x is available, scaled
// from the source's own 760x55 aspect ratio rather than its native
// resolution) -- just a different fixed height (35px here vs 24px there),
// so the tile width is recomputed to match. The raw Figma export also
// listed a stray padding: 40px on this element, but that's a leftover
// image-placeholder artifact (not present in Section 2's real version of
// this technique) -- adding it would collapse this element's own 35px
// height, so it's not reproduced here.
const BORDER_TILE_HEIGHT = 35;
const BORDER_TILE_WIDTH = (760 / 55) * BORDER_TILE_HEIGHT;

const ILLUSTRATION_DELAY = 0.15;

function PerfectSolutionHighlight() {
  // Same span-wrap technique as the other scribble highlights. Purple-
  // Scribble.svg is 140x32 natively -- exactly the ~140x32 target, so no
  // explicit size override is needed.
  return (
    <span className="relative z-0 inline-block origin-top-left rotate-1 whitespace-nowrap">
      <img
        src={purpleScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 h-auto max-w-none"
        style={{ left: '58px', top: '32px' }}
      />
      <span className="relative">PERFECT SOLUTION</span>
    </span>
  );
}

export default function Section10() {
  return (
    <section
      id="section-10"
      className="relative flex h-dvh w-full flex-col items-center justify-center bg-bg-yellow px-page-margin-x"
    >
      <ScrollSection className="flex origin-top-left -rotate-1 flex-col items-start justify-start">
        <div
          aria-hidden="true"
          className="pointer-events-none"
          style={{
            width: '640px',
            height: `${BORDER_TILE_HEIGHT}px`,
            backgroundImage: `url(${paperBorderTop})`,
            backgroundSize: `${BORDER_TILE_WIDTH}px ${BORDER_TILE_HEIGHT}px`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left top',
          }}
        />

        <div className="flex w-[642px] flex-wrap content-center items-center justify-center bg-bg-white p-[40px]">
          <h2 className="heading-2 text-center text-heading-default">
            We didn&rsquo;t land on the <PerfectSolutionHighlight />
          </h2>
        </div>
      </ScrollSection>

      <ScrollSection
        as="img"
        src={illustration}
        alt=""
        aria-hidden="true"
        transition={{ duration: 0.6, ease: 'easeOut', delay: ILLUSTRATION_DELAY }}
        // relative + z-10: the text-box group above is plain static
        // positioning (no position/z-index of its own), so a positioned
        // element with an explicit z-index always paints above it
        // regardless of DOM order -- the opposite stacking need from
        // Section 5, where the box needed to win instead of the
        // illustration.
        style={{ width: '550px', height: '307px', marginTop: '-24px' }}
        className="relative z-10 h-auto max-w-full"
      />
    </section>
  );
}

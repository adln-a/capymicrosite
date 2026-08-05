import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
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

function PerfectSolutionHighlight({ children }) {
  // Same span-wrap technique as the other scribble highlights. Purple-
  // Scribble.svg is kept at its own native 140x32 (not stretched to the
  // wrapped words' rendered width) and centered under the full "PERFECT
  // SOLUTION" phrase via left-1/2/-translate-x-1/2, rather than the fixed
  // left:58px offset this used to have (which only lined up under part of
  // the phrase, not centered on it).
  return (
    <span className="relative z-0 inline-block origin-top-left rotate-1 whitespace-nowrap">
      <img
        src={purpleScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 max-w-none -translate-x-1/2"
        style={{ width: '140px', height: '32px', top: 'var(--scribble-offset-tight)' }}
      />
      <span className="heading-2-accent relative">{children}</span>
    </span>
  );
}

export default function Section10() {
  return (
    <section
      id="section-10"
      className="relative flex h-dvh w-full flex-col items-center justify-center bg-bg-yellow px-page-margin-x"
    >
      <ScrollSection className="flex w-full origin-top-left -rotate-1 flex-col items-start justify-start sm:w-auto">
        <div
          aria-hidden="true"
          className="pointer-events-none w-full sm:w-[640px]"
          style={{
            height: `${BORDER_TILE_HEIGHT}px`,
            backgroundImage: `url(${paperBorderTop})`,
            backgroundSize: `${BORDER_TILE_WIDTH}px ${BORDER_TILE_HEIGHT}px`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left top',
          }}
        />

        <div className="flex w-full flex-wrap content-center items-center justify-center bg-bg-white p-l sm:w-[642px]">
          <h2 className="heading-2 text-center text-heading-default">
            <AccessibleHighlightText
              before="We didn’t land on the "
              highlight={<PerfectSolutionHighlight>PERFECT SOLUTION</PerfectSolutionHighlight>}
            />
          </h2>
        </div>
      </ScrollSection>

      {/* Width goes fluid (100%) below sm instead of the fixed 550px --
          height stays auto (not a fixed px, not a dvh value of its own)
          so the illustration keeps its native aspect ratio as it scales;
          the section around it is already unconditionally h-dvh, and
          this row's own height simply flexes to whatever the now-wider
          heading + this image need, staying vertically centered within
          that dvh viewport via the section's justify-center. */}
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
        style={{ aspectRatio: '550 / 307', marginTop: '-24px' }}
        className="relative z-10 h-auto w-full sm:w-[550px]"
      />
    </section>
  );
}

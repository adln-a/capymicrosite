import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import paperBorderTop from '../assets/Paper-Border-Top.png';
import purpleScribble from '../assets/Purple-Scribble.svg';
import illustrationXl from '../assets/Desktop-IMG--Frame-10.svg';
import illustrationS from '../assets/s/S--IMG-Frame10.svg';

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
      className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-bg-yellow px-page-margin-x py-page-margin-y"
    >
      <ScrollSection className="flex w-full origin-top-left -rotate-1 flex-col items-start justify-start sm:w-auto">
        {/* sm:w-[560px] lg:w-[640px]: was a flat sm:w-[640px] covering
            the whole non-S range -- 560px is the M-specific text-box
            width asked for here, lg:w-[640px] explicitly restores the
            original L/XL value. */}
        <div
          aria-hidden="true"
          className="pointer-events-none w-full sm:w-[560px] lg:w-[640px]"
          style={{
            height: `${BORDER_TILE_HEIGHT}px`,
            backgroundImage: `url(${paperBorderTop})`,
            backgroundSize: `${BORDER_TILE_WIDTH}px ${BORDER_TILE_HEIGHT}px`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left top',
          }}
        />

        {/* sm:w-[562px] lg:w-[642px]: the white box is always 2px wider
            than the border-image strip directly above it (640/642 at
            L/XL) -- kept that same +2px relative offset at M's own
            560px rather than matching it exactly, so whatever that 2px
            is for (a deliberate small overhang past the border's own
            trim) still holds at this width too. */}
        <div className="flex w-full flex-wrap content-center items-center justify-center bg-bg-white p-l sm:w-[562px] lg:w-[642px]">
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
          that dvh viewport via the section's justify-center.
          sm:w-[480px] lg:w-[550px]: was a flat sm:w-[550px] -- 480px is
          the M-specific "capybara" (illustration) width asked for here,
          lg:w-[550px] explicitly restores the original L/XL value.

          <picture> swaps to the dedicated S export below sm (339.29x
          218.67 native -- a genuinely different composition/aspect ratio
          from the XL asset's 550x307, not just a smaller crop of the
          same art), same pattern as Section 1/2/3/5's own breakpoint-
          swapped backgrounds. block: <picture> has no default box
          behavior of its own (browsers treat it as an unstyled
          inline-level wrapper) -- without it, the img's own w-full
          resolves against nothing and the column collapses to the
          image's intrinsic size, same fix as Section 5's identical
          <picture> wrapper. aspect-[...] is now a responsive PAIR (S's
          own ratio below sm, XL's ratio from sm up) rather than one flat
          inline style, since the two source images don't share a ratio
          -- keeping the old fixed 550/307 style would have stretched
          the S asset to the wrong shape once it started rendering here. */}
      <picture className="relative z-10 block w-full sm:w-[480px] lg:w-[550px]">
        <source media="(min-width: 640px)" srcSet={illustrationXl} />
        <ScrollSection
          as="img"
          src={illustrationS}
          alt=""
          aria-hidden="true"
          transition={{ duration: 0.6, ease: 'easeOut', delay: ILLUSTRATION_DELAY }}
          // relative + z-10 (on <picture> above): the text-box group
          // above is plain static positioning (no position/z-index of
          // its own), so a positioned element with an explicit z-index
          // always paints above it regardless of DOM order -- the
          // opposite stacking need from Section 5, where the box needed
          // to win instead of the illustration.
          style={{ marginTop: '-24px' }}
          className="relative h-auto w-full aspect-[339.29/218.67] sm:aspect-[550/307]"
        />
      </picture>
    </section>
  );
}

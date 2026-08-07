import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import pinkRoundScribble from '../assets/Pink-Round-Scribble.svg';
import illustration from '../assets/Desktop-IMG-Frame-15.svg';
import sIllustration from '../assets/s/S--IMG-Frame15.svg';
import mIllustration from '../assets/m/M--BG-Frame 15.svg';

const ILLUSTRATION_DELAY = 0.18;

// Genuinely different assets per tier (not one image resized), each at
// its own native aspect ratio -- S's own dedicated Frame15 export, not
// the XL illustration shrunk down. Same for M's own 624x280 export.
const XL_ILLUSTRATION = { src: illustration, width: 1039, height: 280 };
const M_ILLUSTRATION = { src: mIllustration, width: 624, height: 280 };
const S_ILLUSTRATION = { src: sIllustration, width: 369, height: 303.29 };

function PeopleHighlight({ children, isAtLeastSm }) {
  // Same z-0/-z-10 span-wrap technique as the other scribble highlights,
  // but centered on the word (left-1/2/top-1/2 + -translate-x-1/2/-y-1/2)
  // rather than hugging its width -- Pink-Round-Scribble.svg is a full
  // encircling oval, not an underline, and its native 161x55 already
  // matches "PEOPLE" 's own rendered size at XL (heading-2-accent is 28px
  // there) closely enough that no extra sizing was needed. heading-2-
  // accent drops to 20px at S though (28*20/28... i.e. a 20/28 ratio),
  // and "PEOPLE" shrinks with it -- the same fixed 161x55 oval at that
  // smaller size bled noticeably past the word into the next line's "do"
  // once the heading went full-width and rewrapped. Scaled down by that
  // same 20/28 ratio for S (115x39) so the ring still hugs just the word.
  const scribbleSize = isAtLeastSm ? { width: 161, height: 55 } : { width: 115, height: 39 };
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={pinkRoundScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${scribbleSize.width}px`, height: `${scribbleSize.height}px` }}
      />
      <span className="heading-2-accent relative">{children}</span>
    </span>
  );
}

export default function Section15() {
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  // Only needed to tell M/L apart from each other and from XL -- the
  // heading width and the illustration diverge there (own comments
  // below).
  const isAtLeastLg = useMediaQuery('(min-width: 992px)');
  const isAtLeastXl = useMediaQuery('(min-width: 1200px)');
  const tier = !isAtLeastSm ? 's' : !isAtLeastLg ? 'm' : !isAtLeastXl ? 'l' : 'xl';
  // L reuses XL's own 1039x280 asset (no dedicated L export was given,
  // unlike S/M) -- just fluid + capped narrower (own className comment
  // below) instead of XL's fixed width.
  const illustrationData = tier === 'm' ? M_ILLUSTRATION : tier === 's' ? S_ILLUSTRATION : XL_ILLUSTRATION;

  return (
    <section
      id="section-15"
      className="relative flex h-dvh w-full flex-col items-center justify-center gap-2xl bg-bg-bright-green px-page-margin-x"
    >
      {/* Single heading, not the export's split "Products alone.../PEOPLE
          row/do." divs -- natural wrapping instead of a forced line break,
          same discipline as Section 7/11/13. w-full below sm (100% width,
          per direct instruction) so it wraps to the actual viewport
          instead of the export's own fixed 540px block. sm:w-[480px]
          lg:w-[540px] (was a flat sm:w-[540px]): 480px is the M-specific
          text-box width asked for here, lg:w-[540px] explicitly restores
          the original L/XL value. */}
      <ScrollSection>
        <h2 className="heading-2 w-full max-w-full text-center text-heading-inverted sm:w-[480px] lg:w-[540px]">
          <AccessibleHighlightText
            before="Products alone don’t solve problems. "
            highlight={<PeopleHighlight isAtLeastSm={isAtLeastSm}>PEOPLE</PeopleHighlight>}
            after=" do."
          />
        </h2>
      </ScrollSection>

      {/* XL keeps its fixed 1039px width (max-w-full only as a viewport
          safety cap, not the driving width). S instead needs the image to
          actually be fluid -- a fixed px width capped by max-w-full still
          never GROWS to fill a wider container, it only ever shrinks, so
          it read as "not full width" on any viewport wider than 369px.
          w-full + aspect-ratio (instead of a fixed height) keeps it
          undistorted while it scales with the actual container width. M
          gets its own dedicated 624x280 export (not XL's art resized),
          fluid the same way S is but capped at 640px ("100% width up to
          640px") via max-w-[640px] instead of S's uncapped max-w-full. L
          reuses XL's own art (own comment above illustrationData) but
          fluid + capped at 885px instead of XL's fixed 1039px. */}
      <ScrollSection
        as="img"
        src={illustrationData.src}
        alt=""
        aria-hidden="true"
        transition={{ duration: 0.6, ease: 'easeOut', delay: ILLUSTRATION_DELAY }}
        style={
          tier === 'xl'
            ? { width: `${XL_ILLUSTRATION.width}px`, height: `${XL_ILLUSTRATION.height}px` }
            : { aspectRatio: `${illustrationData.width} / ${illustrationData.height}` }
        }
        className={
          tier === 'xl'
            ? 'max-w-full'
            : tier === 'l'
              ? 'h-auto w-full max-w-[885px]'
              : tier === 'm'
                ? 'h-auto w-full max-w-[640px]'
                : 'h-auto w-full max-w-full'
        }
      />
    </section>
  );
}

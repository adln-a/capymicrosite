import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import pinkRoundScribble from '../assets/Pink-Round-Scribble.svg';
import illustration from '../assets/Desktop-IMG-Frame-15.svg';

const ILLUSTRATION_DELAY = 0.18;

function PeopleHighlight({ children }) {
  // Same z-0/-z-10 span-wrap technique as the other scribble highlights,
  // but centered on the word (left-1/2/top-1/2 + -translate-x-1/2/-y-1/2)
  // rather than hugging its width -- Pink-Round-Scribble.svg is a full
  // encircling oval, not an underline, and its native 161x55 already
  // matches "PEOPLE" 's own rendered size closely enough (taller than the
  // 36px line-height on purpose, so the ring visibly extends above/below
  // the letters, same as the reference) that no extra sizing is needed.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={pinkRoundScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: '161px', height: '55px' }}
      />
      <span className="heading-2-accent relative">{children}</span>
    </span>
  );
}

export default function Section15() {
  return (
    <section
      id="section-15"
      className="relative flex h-dvh w-full flex-col items-center justify-center gap-2xl bg-bg-bright-green px-page-margin-x"
    >
      {/* Single heading, not the export's split "Products alone.../PEOPLE
          row/do." divs -- natural wrapping instead of a forced line break,
          same discipline as Section 7/11/13. w-[540px] (the export's own
          heading-block width) constrains where it wraps; max-w-full keeps
          it safe if that's ever narrower than the viewport. */}
      <ScrollSection>
        <h2 className="heading-2 w-[540px] max-w-full text-center text-heading-inverted">
          <AccessibleHighlightText
            before="Products alone don’t solve problems. "
            highlight={<PeopleHighlight>PEOPLE</PeopleHighlight>}
            after=" do."
          />
        </h2>
      </ScrollSection>

      <ScrollSection
        as="img"
        src={illustration}
        alt=""
        aria-hidden="true"
        transition={{ duration: 0.6, ease: 'easeOut', delay: ILLUSTRATION_DELAY }}
        style={{ width: '1039px', height: '280px' }}
        className="max-w-full"
      />
    </section>
  );
}

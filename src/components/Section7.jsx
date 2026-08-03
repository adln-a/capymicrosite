import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import purpleScribble from '../assets/Purple-Scribble.svg';
import paperClipMetal from '../assets/Paper-Clip-Metal.png';
import blueEllipse from '../assets/Blue-Ellipse.svg';
import yellowBeneficiariesShape from '../assets/Yellow-Shape-Beneficiaries-Background.svg';

// Text boxes fade up in sequence first (heading, then the quote box,
// staggered the same 0.18s used for Section 1's pink/white box pair).
// Shapes used to wait for the quote box's own fade-up (0.6s duration) to
// fully FINISH before starting -- a 0.78s wait before anything even
// began appearing, which read as sluggish. They now start while the
// quote box is still mid-fade, and stagger among themselves faster too.
const HEADING_DELAY = 0;
const QUOTE_BOX_DELAY = 0.18;
const SHAPES_START = QUOTE_BOX_DELAY + 0.2;
const SHAPE_STAGGER_STEP = 0.08;

const SHAPE_TEXT_STYLE = {
  fontFamily: 'var(--font-space-grotesk)',
  fontWeight: 'var(--font-weight-space-grotesk-bold)',
  fontSize: '22px',
  lineHeight: '28px',
};

// Volunteers sits between Donors and Non-profits, overlapping both by the
// same amount -- a single shared value, so its left/right margins can
// never drift out of sync with each other.
const VOLUNTEERS_OVERLAP = '-10px';

function PeopleHighlight({ children }) {
  // Same span-wrap technique as FourHighlight/MatterHighlight/
  // ScribbleHighlight: z-0 on the wrapping span gives it its own stacking
  // context so the image's -z-10 stays scoped inside it. The earlier
  // hardcoded heading-1-desktop font-size override here was a mistake --
  // PEOPLE matches its surrounding heading-2 context like every other
  // highlight, so heading-2-accent (which already carries its own correct,
  // responsive font-size/line-height) is all that's needed. Purple-
  // Scribble.svg is 140x32 natively -- exactly the ~140x32 target, so no
  // explicit size override is needed.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={purpleScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 h-auto max-w-none"
        style={{ left: '-11px', top: 'var(--scribble-offset-default)' }}
      />
      <span className="heading-2-accent relative">{children}</span>
    </span>
  );
}

function HoleColumn() {
  // Top hole, middle pair (gap-s), bottom hole -- same top/pair/bottom
  // split as Section 5's HoleColumn, just recolored to bg-bg-linen-light
  // (not the linen-dark/white used for Section 1/2's white boxes) and
  // resized to this box's own 28x240 column.
  return (
    <div aria-hidden="true" className="flex h-[240px] w-[28px] flex-col items-start justify-between">
      <span className="h-5 w-5 rounded-full bg-bg-linen-light" />
      <div className="flex flex-col items-start gap-s">
        <span className="h-5 w-5 rounded-full bg-bg-linen-light" />
        <span className="h-5 w-5 rounded-full bg-bg-linen-light" />
      </div>
      <span className="h-5 w-5 rounded-full bg-bg-linen-light" />
    </div>
  );
}

// Overlap amounts (negative margins) are estimated from the reference
// image, not given as exact figures in the export or the spec -- the raw
// Figma export captures these shapes in plain flex flow with no overlap
// at all, so the negative-margin values here were tuned by eye against
// the reference screenshot rather than measured precisely.
const ROW_1 = [
  {
    key: 'donors',
    label: 'Donors and sponsors',
    className: 'origin-top-left -rotate-2 bg-bg-purple p-[40px] text-body-default',
  },
  {
    key: 'volunteers',
    label: 'Volunteers',
    className:
      'flex h-[160px] w-[160px] origin-top-left rotate-2 items-center justify-center rounded-full bg-bg-light-blue text-body-default',
    marginLeft: VOLUNTEERS_OVERLAP,
    marginRight: VOLUNTEERS_OVERLAP,
  },
  {
    key: 'nonprofits',
    label: 'Non-profits',
    className: 'relative origin-top-left rotate-2 p-[40px] text-body-inverted',
    marginLeft: '-8px',
    blob: {
      src: blueEllipse,
      width: 206,
      height: 110,
      left: -1,
      top: 0,
      rotate: -2,
    },
  },
];

const ROW_2 = [
  {
    key: 'ssa',
    label: 'Social Service Agencies',
    className: 'origin-top-left rotate-1 rounded-medium bg-bg-red p-[40px] text-body-inverted',
  },
  {
    key: 'social-workers',
    label: 'Social Workers',
    className: 'origin-top-left -rotate-3 rounded-full bg-bg-light-green p-[40px] text-body-default',
    marginLeft: '-32px',
  },
  {
    key: 'beneficiaries',
    label: 'Beneficiaries',
    // Yellow-Shape-Beneficiaries-Background.svg (232x83 native) replaces
    // the earlier plain rounded-full/bg-bg-yellow placeholder -- padding
    // is asymmetric (shorter vertically than the p-[40px] its siblings
    // use) to match this blob's own flatter, wider proportions rather
    // than the taller rounded-pill shapes next to it.
    className: 'relative origin-top-left rotate-1 px-[47px] py-[27px] text-body-default',
    marginLeft: '-24px',
    blob: {
      src: yellowBeneficiariesShape,
      width: 232,
      height: 83,
      left: 0,
      top: 0,
    },
  },
];

function Shape({ shape, index }) {
  return (
    <ScrollSection
      className={`relative flex-shrink-0 whitespace-nowrap ${shape.className}`}
      style={{ marginLeft: shape.marginLeft, marginRight: shape.marginRight, ...SHAPE_TEXT_STYLE }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: SHAPES_START + index * SHAPE_STAGGER_STEP }}
    >
      {shape.blob && (
        <img
          src={shape.blob.src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute origin-top-left"
          style={{
            width: `${shape.blob.width}px`,
            height: `${shape.blob.height}px`,
            left: `${shape.blob.left}px`,
            top: `${shape.blob.top}px`,
            transform: shape.blob.rotate ? `rotate(${shape.blob.rotate}deg)` : undefined,
          }}
        />
      )}
      <span className="relative">{shape.label}</span>
    </ScrollSection>
  );
}

export default function Section7() {
  return (
    <section
      id="section-7"
      className="relative flex w-full flex-col items-center justify-center bg-white-linen-100 px-page-margin-x py-page-margin-y"
    >
      <div className="relative flex w-[720px] flex-col items-start justify-start">
        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: HEADING_DELAY }}
          // z-10: both this box and the pink box below are position:relative
          // with no z-index, so without this the pink box (later in DOM)
          // would paint over this one's bottom edge at their -24px overlap.
          className="relative z-10 flex w-[576px] flex-wrap items-center justify-center gap-xs bg-bg-red px-[40px] py-[24px]"
        >
          <h2 className="heading-2 text-center text-heading-inverted">
            <AccessibleHighlightText
              before="Understanding the system meant starting with "
              highlight={<PeopleHighlight>PEOPLE</PeopleHighlight>}
            />
          </h2>
        </ScrollSection>

        {/* Rendered as its own independently-animated sibling rather than
            nested inside the heading box's ScrollSection -- a mix-blend-mode
            element whose ancestor has opacity/transform actively tweening
            renders with the wrong, un-blended flat color for a frame or two
            (same isolated-compositing-layer issue as Section 1/6's tapes).
            Same transition/delay as the heading box keeps them visually in
            sync; left/top are unchanged since the heading box itself has no
            static rotate, so this wrapper's top-left still matches the
            box's own. z-20: the heading box carries z-10 (to stay above the
            pink box below), which -- now that the tape is a DOM sibling
            instead of a child -- would otherwise also paint above this
            (unpositioned-by-default) tape and hide the ~60% of it that
            overlaps the box's own rectangle. */}
        <ScrollSection
          as="span"
          transition={{ duration: 0.6, ease: 'easeOut', delay: HEADING_DELAY }}
          aria-hidden="true"
          className="pointer-events-none absolute z-20 origin-top-left rotate-[-4deg] bg-bg-light-blue mix-blend-multiply"
          style={{ width: '107px', height: '40px', left: '521px', top: '-16px' }}
        />

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: QUOTE_BOX_DELAY }}
          // -24px overlaps this box's top edge with the heading box's
          // bottom edge (the default with no gap set between them is 0px).
          style={{ marginTop: '-24px' }}
          className="relative flex origin-top-left rotate-1 items-center justify-start gap-s self-stretch rounded-medium bg-bg-pink py-[40px] pl-[16px] pr-[40px]"
        >
          <HoleColumn />

          <div className="flex flex-1 flex-col items-start justify-start gap-s">
            <p className="body-paragraph text-body-default">
              Over two years, we sat down with families, non-profits, donors, and frontline
              workers.
            </p>
            <p className="body-paragraph text-body-default">
              We asked questions. We listened. We ran hands-on sessions with children to learn how
              they think, dream, and cope.
            </p>
            <h3
              className="text-heading-red"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontWeight: 'var(--font-weight-space-grotesk-bold)',
                fontSize: '22px',
                lineHeight: '28px',
              }}
            >
              Our goal wasn&rsquo;t to find quick fixes.
            </h3>
            <p className="body-paragraph text-body-default">
              It was to understand the quiet barriers, the ones not seen in reports or funding
              sheets.
            </p>
            <p className="body-paragraph text-body-default">
              The ones that start at home and echo in classrooms, care centres, and case files.
            </p>
          </div>

          <img
            src={paperClipMetal}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute origin-top-left rotate-[-91deg]"
            style={{ width: '107px', height: '70px', left: '-53px', top: '242px' }}
          />
        </ScrollSection>

        {/* No w-full here -- this cluster hugs its own content width
            rather than being constrained to the 720px wrapper above, so
            nowrap shape labels (Social Service Agencies, etc.) never get
            squeezed into wrapping by a parent that's narrower than the
            row actually needs. aria-hidden: purely decorative -- the
            quote box above already names every one of these groups
            ("families, non-profits, donors, and frontline workers") in
            real prose, so this colorful shape cluster is a visual flourish
            for sighted users, not additional content a screen reader
            needs to announce label-by-label. */}
        <div aria-hidden="true" className="flex flex-col items-center">
          <div className="flex items-end">
            {ROW_1.map((shape, i) => (
              <Shape key={shape.key} shape={shape} index={i} />
            ))}
          </div>
          <div className="flex items-center" style={{ marginTop: '-20px' }}>
            {ROW_2.map((shape, i) => (
              <Shape key={shape.key} shape={shape} index={ROW_1.length + i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

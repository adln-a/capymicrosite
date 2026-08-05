import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
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

// XL only -- S renders its own labels directly (see SLabel below), which
// sets font-size/line-height itself since those differ from XL's values.
const SHAPE_TEXT_STYLE = {
  fontFamily: 'var(--font-space-grotesk)',
  fontWeight: 'var(--font-weight-space-grotesk-bold)',
  fontSize: '22px',
  lineHeight: '28px',
};

// Volunteers sits between Donors and Non-profits, overlapping both by the
// same amount -- a single shared value, so its left/right margins can
// never drift out of sync with each other. XL only -- see XL_ROW_1 below.
const VOLUNTEERS_OVERLAP = '-10px';

// Light-blue decorative accent near the heading box's top-right corner,
// and the paperclip pinned to the quote box -- both purely decorative,
// absolutely positioned, and genuinely differently sized/placed between
// the S and XL Figma references (not just a fluid reflow of the same
// numbers), so each gets its own concrete value set rather than an
// attempted scaling formula. Numbers below are copied directly from each
// reference file, not estimated.
const TAPE_POSITION = {
  s: { width: '85px', height: '32px', right: '-59px', top: '-13px' },
  xl: { width: '107px', height: '40px', left: '521px', top: '-16px' },
};
const PAPERCLIP_POSITION = {
  s: { width: '95px', height: '62px', left: '-46px', top: '299px' },
  xl: { width: '107px', height: '70px', left: '-53px', top: '242px' },
};

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
  //
  // left-1/2 -translate-x-1/2 (was a fixed left:-11px): heading-2-accent's
  // own font-size is responsive (smaller at S, larger from xl up per its
  // own token), so "PEOPLE"'s actual rendered width changes across
  // breakpoints while the scribble's own width stays a constant 140px --
  // a fixed offset can only ever be centered at the ONE width it happened
  // to be tuned against (confirmed: -11px landed within 0.2px of centered
  // at xl, but sat 17px off-center at S's narrower rendered word). Self-
  // adjusting centering keeps it centered at any width instead.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={purpleScribble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -z-10 h-auto max-w-none -translate-x-1/2"
        style={{ top: 'var(--scribble-offset-default)' }}
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

// Shared per-shape visual truth: color/rotation/label/blob-asset. NO
// overlap margins here -- those are an XL-only negative-margin illusion
// for a continuous overlapping strip -- these are XL only.
const XL_ROW_1 = [
  {
    key: 'donors',
    label: 'Donors and sponsors',
    className: 'origin-top-left -rotate-2 bg-bg-purple p-l text-body-default',
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
    className: 'relative origin-top-left rotate-2 p-l text-body-inverted',
    marginLeft: '-8px',
    blob: { src: blueEllipse, width: 206, height: 110, left: -1, top: 0, rotate: -2 },
  },
];
const XL_ROW_2 = [
  {
    key: 'ssa',
    label: 'Social Service Agencies',
    className: 'origin-top-left rotate-1 rounded-medium bg-bg-red p-l text-body-inverted',
  },
  {
    key: 'social-workers',
    label: 'Social Workers',
    className: 'origin-top-left -rotate-3 rounded-full bg-bg-light-green p-l text-body-default',
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
    blob: { src: yellowBeneficiariesShape, width: 232, height: 83, left: 0, top: 0 },
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

// XL: the original two-row, overlapping-negative-margin strip.
function XlShapeCluster() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center">
      <div className="flex items-end">
        {XL_ROW_1.map((shape, i) => (
          <Shape key={shape.key} shape={shape} index={i} />
        ))}
      </div>
      <div className="flex items-center" style={{ marginTop: '-20px' }}>
        {XL_ROW_2.map((shape, i) => (
          <Shape key={shape.key} shape={shape} index={XL_ROW_1.length + i} />
        ))}
      </div>
    </div>
  );
}

// S: precise geometry read directly off the authoritative "Colourful
// Shapes S.svg" export -- replaces an earlier flexbox-row-stack
// approximation that turned out visibly off (wrong groupings/spacing) once
// checked against this file. 361x322 is that file's own reference frame
// (a 393px-wide phone's content width, after 16px page margins each side).
//
// Two pieces, not one: SShapesBackground renders the 6 colored shapes as
// ONE inline SVG using the EXACT rect/ellipse/path geometry copied
// verbatim from the reference (pixel-perfect, no reverse-engineered
// approximation), fill colors driven by the same design tokens already
// used for these exact colors elsewhere (confirmed hex-for-hex matches:
// #D6C2E4 purple, #C3E2F4 light-blue, #1E79AE blue, #E72307 red, #CFE7CD
// light-green, #FACB2A yellow). SLabel then overlays real, accessible
// text on top of each shape, positioned/rotated to match -- kept as live
// HTML text (not baked into the SVG as vector glyph paths, which the
// original export used) so it stays selectable/localizable/accessible,
// consistent with how every other heading/label in this codebase works.
const S_CANVAS = { width: 361, height: 322 };

// left/top/width/height are each shape's own bounding box (used to
// position and size its SLabel); rotateClass matches the shape's own
// rotation where the reference states one explicitly (donors/volunteers/
// social-workers, each a rect with a transform="rotate(...)"). ssa and
// beneficiaries are complex paths with rotation already baked into their
// absolute coordinates rather than a separate rotate() attribute -- 1deg
// for both is inferred (not read off an explicit value), matching the
// same two shapes' own confirmed XL rotation; a few degrees of drift on
// a decorative, aria-hidden label would be imperceptible regardless.
// nonprofits' ellipse rotation (-0.4deg in the source) is negligible,
// left unrotated.
//
// rotateClass, not a numeric degree applied via inline style: SLabel
// renders through ScrollSection (a framer-motion motion.div), which
// already animates opacity/y for its own fade-up and manages the
// element's `transform` CSS property itself from those motion values --
// a raw `transform: rotate(Ndeg)` passed via the style prop was silently
// dropped/overridden by framer-motion's own computed transform (visible
// as the tilted purple/green background shapes with dead-flat, unrotated
// text sitting on top of them). A Tailwind rotate class survives because
// it's a real class, not a competing inline style write to the same
// `transform` property framer-motion is managing -- same reason every
// OTHER static rotation on a ScrollSection in this codebase (e.g. the
// quote box's own rotate-1) already uses a class, never inline style.
const S_SHAPES = {
  donors: { left: 81.58, top: 6.84, width: 196, height: 56, rotateClass: '-rotate-2', textColor: 'text-body-default' },
  volunteers: {
    left: 55.05,
    top: 54.81,
    width: 140,
    height: 140,
    rotateClass: 'rotate-2',
    textColor: 'text-body-default',
  },
  nonprofits: {
    left: 168.98,
    top: 86.04,
    width: 159.64,
    height: 81.73,
    rotateClass: '',
    textColor: 'text-body-inverted',
  },
  ssa: { left: 72.65, top: 191.73, width: 215.7, height: 59.5, rotateClass: 'rotate-1', textColor: 'text-body-inverted' },
  'social-workers': {
    left: 42.98,
    top: 250.99,
    width: 146,
    height: 56,
    rotateClass: '-rotate-3',
    textColor: 'text-body-default',
  },
  beneficiaries: {
    left: 179.3,
    top: 239.4,
    width: 142.9,
    height: 85.2,
    rotateClass: 'rotate-1',
    textColor: 'text-body-default',
  },
};

function sCanvasPct(value, total) {
  return `${(value / total) * 100}%`;
}

// Each shape's own fill, copied verbatim (geometry unchanged) from the
// reference SVG -- same coordinates as before, just one shape per call
// now instead of six combined into one background SVG.
// No rotate() on the rects (donors/volunteers/social-workers), unlike the
// reference SVG's own combined version -- each shape's viewBox below (in
// SShape) is cropped to its own bounding box, and that box was measured
// as the shape's UNROTATED extent (its own plain x/y/width/height). If
// the rect rotates INSIDE the svg's own coordinate space (i.e. before the
// viewBox->viewport mapping), its rotated corners can extend past that
// crop window and get clipped -- exactly what caused Donors/Volunteers/
// Social Workers to render irregular/cut-off. The outer SShape
// container's own rotateClass (a CSS `rotate` applied AFTER the svg has
// already rendered) provides the ONLY rotation now, for both the
// background and the text together, and can never clip anything inside
// the svg since it acts on the already-rasterized result from outside.
// nonprofits' ellipse and ssa/beneficiaries' paths keep their original
// geometry unchanged -- their bounding boxes were measured directly off
// the ALREADY-rotated (or negligibly-rotated) shape, so they were never
// affected by this bug in the first place.
const S_SHAPE_FILLS = {
  donors: <rect x="81.582" y="6.83984" width="196" height="56" fill="var(--color-bg-purple)" />,
  volunteers: <rect x="55.0469" y="54.8066" width="140" height="140" rx="70" fill="var(--color-bg-light-blue)" />,
  nonprofits: <ellipse cx="248.799" cy="126.908" rx="79.8222" ry="40.8659" fill="var(--color-bg-blue)" />,
  ssa: (
    <path
      d="M73.2266 207.604C73.3808 198.769 80.6682 191.731 89.5034 191.886L272.476 195.079C281.311 195.234 288.348 202.521 288.194 211.356L287.775 235.353C287.621 244.188 280.333 251.225 271.498 251.071L88.5261 247.877C79.6909 247.723 72.6535 240.436 72.8078 231.6L73.2266 207.604Z"
      fill="var(--color-bg-red)"
    />
  ),
  'social-workers': <rect x="42.9824" y="250.991" width="146" height="56" rx="28" fill="var(--color-bg-light-green)" />,
  beneficiaries: (
    <path
      d="M286.427 252.949C293.466 245.994 301.442 243.099 308.018 246.123C319.29 251.307 322.173 271.925 314.456 292.174C306.739 312.422 291.344 324.635 280.07 319.451C277.007 318.042 274.565 315.491 272.785 312.119C265.747 319.074 257.771 321.971 251.196 318.947C248.133 317.538 245.691 314.988 243.911 311.617C236.873 318.571 228.898 321.467 222.323 318.444C219.26 317.035 216.817 314.485 215.037 311.113C207.999 318.067 200.024 320.962 193.45 317.939C182.177 312.754 179.294 292.136 187.011 271.888C194.728 251.639 210.123 239.427 221.396 244.611C224.459 246.019 226.901 248.569 228.681 251.94C235.719 244.986 243.695 242.092 250.269 245.116C253.333 246.524 255.774 249.074 257.554 252.444C264.592 245.49 272.567 242.595 279.142 245.619C282.206 247.027 284.647 249.578 286.427 252.949Z"
      fill="var(--color-bg-yellow)"
    />
  ),
};

// Background fill + label text now live inside ONE ScrollSection per
// shape (matching XL's own Shape() -- a blob img + text span nested in a
// single ScrollSection) so the whole colored shape fades up together as
// one unit, staggered per shape, instead of the color appearing
// instantly while only the text on top faded in (the earlier
// SShapesBackground+SLabel split's own gap from XL's actual behavior).
// The svg's viewBox is cropped to just THIS shape's own bounding box
// (left/top/width/height, in the ORIGINAL 361x322 coordinate space) --
// since the fill's own path/rect coordinates are still authored in that
// same full-canvas space, a tight viewBox crops straight to the right
// region with no extra math needed, scaled to fill this shape's own
// (percentage-sized) container.
function SShape({ id, index, children }) {
  const s = S_SHAPES[id];
  return (
    <ScrollSection
      transition={{ duration: 0.6, ease: 'easeOut', delay: SHAPES_START + index * SHAPE_STAGGER_STEP }}
      className={`absolute flex origin-top-left items-center justify-center whitespace-nowrap px-xs text-center text-[16px] leading-[24px] ${s.rotateClass} ${s.textColor}`}
      style={{
        left: sCanvasPct(s.left, S_CANVAS.width),
        top: sCanvasPct(s.top, S_CANVAS.height),
        width: sCanvasPct(s.width, S_CANVAS.width),
        height: sCanvasPct(s.height, S_CANVAS.height),
        fontFamily: 'var(--font-space-grotesk)',
        fontWeight: 'var(--font-weight-space-grotesk-bold)',
      }}
    >
      <svg
        aria-hidden="true"
        viewBox={`${s.left} ${s.top} ${s.width} ${s.height}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {S_SHAPE_FILLS[id]}
      </svg>
      <span className="relative">{children}</span>
    </ScrollSection>
  );
}

function SShapeCluster() {
  return (
    <div
      aria-hidden="true"
      // mx-auto: the outer wrapper is `items-start` (left-aligning
      // everything by default, since the heading/quote boxes need that
      // for their own self-stretch to make sense) -- this cluster is the
      // one child that should be CENTERED instead once its max-w-[361px]
      // cap engages on wider S viewports, matching the reference (a
      // centered composition, not flush-left).
      className="relative mx-auto w-full max-w-[361px]"
      style={{ aspectRatio: `${S_CANVAS.width} / ${S_CANVAS.height}` }}
    >
      <SShape id="donors" index={0}>
        Donors and sponsors
      </SShape>
      <SShape id="volunteers" index={1}>
        Volunteers
      </SShape>
      <SShape id="nonprofits" index={2}>
        Non-profits
      </SShape>
      <SShape id="ssa" index={3}>
        Social Service Agencies
      </SShape>
      <SShape id="social-workers" index={4}>
        Social Workers
      </SShape>
      <SShape id="beneficiaries" index={5}>
        Beneficiaries
      </SShape>
    </div>
  );
}

export default function Section7() {
  // No dedicated M/L reference for this section -- S below sm (640px),
  // the existing XL-tuned layout from sm up, same "reuse the nearest
  // larger tier" convention used everywhere else in this codebase.
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  const tape = isAtLeastSm ? TAPE_POSITION.xl : TAPE_POSITION.s;
  const paperclip = isAtLeastSm ? PAPERCLIP_POSITION.xl : PAPERCLIP_POSITION.s;

  return (
    <section
      id="section-7"
      className="relative flex w-full flex-col items-center justify-center bg-white-linen-100 px-page-margin-x py-page-margin-y"
    >
      <div className="relative flex w-full flex-col items-start justify-start sm:w-[720px]">
        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: HEADING_DELAY }}
          // z-10: both this box and the pink box below are position:relative
          // with no z-index, so without this the pink box (later in DOM)
          // would paint over this one's bottom edge at their -24px overlap.
          // w-full sm:w-[576px]: the S reference has this box at
          // align-self:stretch (100% of its own parent), not a fixed
          // width. py-m sm:py-l: same padding-token-swap fix as the plain
          // shapes above -- S wants 16px vertical padding (--spacing-m's
          // own base), not py-l's base 24px; px stays px-l unconditionally
          // since 24px already matches the S reference exactly there.
          className="relative z-10 flex w-full flex-wrap items-center justify-center gap-xs bg-bg-red px-l py-m sm:w-[576px] sm:py-l"
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
            overlaps the box's own rectangle.

            Position/size come from TAPE_POSITION (S vs XL) rather than one
            fixed value or a scaling formula -- this wrapper is positioned
            against the OUTER wrapper (the nearest positioned ancestor,
            since the heading box's own `relative` only scopes ITS OWN
            children, not this sibling), and since the outer wrapper and
            heading box happen to share the same width at S (both w-full
            there) but diverge from sm up (720 vs 576), the S variant
            anchors from the right edge (self-adjusting) while XL keeps
            its original left-anchored value (tuned against the fixed
            720px wrapper specifically). */}
        <ScrollSection
          as="span"
          transition={{ duration: 0.6, ease: 'easeOut', delay: HEADING_DELAY }}
          aria-hidden="true"
          className="pointer-events-none absolute z-20 origin-top-left rotate-[-4deg] bg-bg-light-blue mix-blend-multiply"
          style={tape}
        />

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: QUOTE_BOX_DELAY }}
          // -24px overlaps this box's top edge with the heading box's
          // bottom edge (the default with no gap set between them is 0px).
          style={{ marginTop: '-24px' }}
          className="relative flex origin-top-left rotate-1 items-center justify-start gap-s self-stretch rounded-medium bg-bg-pink py-l pl-s pr-l"
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

          {/* left/top come from PAPERCLIP_POSITION (S vs XL) -- genuinely
              different between the two references (S: -46/299, XL:
              -53/242), not a fluid scale of one number: the paperclip is
              anchored near a specific paragraph in the text column above,
              and that paragraph sits at a different vertical position at
              each tier since the narrower S column wraps its text across
              more lines. */}
          <img
            src={paperClipMetal}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute origin-top-left rotate-[-91deg]"
            style={paperclip}
          />
        </ScrollSection>

        {/* SShapeCluster (own comment above) is a self-contained,
            precisely-positioned canvas, own width/centering handled
            internally via its own mx-auto -- unlike XlShapeCluster, which
            stays hug-content/unwidthed, matching the already-approved
            existing desktop look (the outer wrapper is a fixed 720px
            there, and the cluster hugging its own narrower content,
            centered within just that hugged block rather than the full
            720px, is what's already shipped -- forcing it wider would
            shift the shapes and wasn't asked for). aria-hidden (on both
            cluster components): purely decorative -- the quote box above
            already names every one of these groups ("families, non-
            profits, donors, and frontline workers") in real prose, so
            this colorful shape cluster is a visual flourish for sighted
            users, not additional content a screen reader needs to
            announce label-by-label. */}
        {isAtLeastSm ? <XlShapeCluster /> : <SShapeCluster />}
      </div>
    </section>
  );
}

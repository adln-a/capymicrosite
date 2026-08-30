import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ButtonTertiary } from './Navigation.jsx';
import { MaterialIcon } from './icons.jsx';
import ArrowButton from './ArrowButton.jsx';
import TranscriptModal from './TranscriptModal.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import content from '../data/section12-content.json';

// Design-only fields (colors, shapes, rotations) -- these don't change per
// content edit. Actual text (assumption/reality/quote) and audioSrc live
// in section12-content.json instead, loaded via `content` above and
// merged in per-set below, so editing that file (by hand, or via the
// /admin editor's Save button while running `npm run dev`) changes what
// renders here without touching this component. trackColor is each set's
// own audio-player progress-fill color -- sampled directly from the
// reference images rather than guessed: every set but orange uses that
// hue's own -800 scale step (confirmed pixel-for-pixel against
// Pomegranate-800/Allports-800/Surf-Crest-800); orange's sample matched
// -700, not -800 (the true -800 is a much darker, muddier brown that
// doesn't appear anywhere in the reference), so it's the one intentional
// exception.
const SET_DESIGN = [
  {
    number: 1,
    shape: 'sticker',
    numberColorVar: 'var(--color-bg-red)',
    card2Bg: 'bg-bg-pink',
    card3Bg: 'bg-bg-red',
    trackColor: 'var(--color-pomegranate-800)',
  },
  {
    number: 2,
    shape: 'starburst',
    numberColorVar: 'var(--color-bg-blue)',
    card2Bg: 'bg-bg-light-blue',
    card3Bg: 'bg-bg-blue',
    trackColor: 'var(--color-allports-800)',
  },
  {
    number: 3,
    shape: 'square',
    numberColorVar: 'var(--color-bg-bright-green)',
    card2Bg: 'bg-bg-light-green',
    card3Bg: 'bg-bg-bright-green',
    trackColor: 'var(--color-surf-crest-800)',
  },
  {
    number: 4,
    shape: 'circle',
    numberColorVar: 'var(--color-bg-orange)',
    card2Bg: 'bg-capy-orange-200',
    card3Bg: 'bg-bg-orange',
    trackColor: 'var(--color-capy-orange-700)',
  },
];

function getSet(number) {
  const design = SET_DESIGN.find((s) => s.number === number);
  const text = content[String(number)] ?? {};
  return { ...design, assumption: text.assumption ?? '', reality: text.reality ?? '', quote: text.quote ?? '', transcript: text.transcript, audioSrc: text.audioSrc ?? '' };
}

// Card shells share the same shape/animation, just their content and
// number-badge shape/color differ. Final rotation matches the reference
// export exactly (card 1: -2deg, card 2: 0, card 3: +2deg). Rotation
// origin is center (not the export's own top-left) -- top-left pivoting
// keeps that one corner fixed while the opposite corner swings up/down,
// which read as visual misalignment against the neighboring cards; a
// center pivot tilts the card in place instead.
const FINAL_ROTATE = [-2, 0, 2];
// Starting "stacked deck" rotation before fanning out -- close together,
// suggesting a messy pile rather than the neat final fan.
const STACK_ROTATE = [5, -3, 8];
// All three cards start shifted left by roughly one card-slot (own width
// + gap, in percentage terms so it's robust to the actual computed card
// width) relative to their own final position, plus an extra slot per
// position further right in the row -- so they all originate from
// approximately the same spot to the left of card 1's own final slot,
// like a single deck, then deal out rightward to their natural flex
// positions instead of converging from both sides toward the center.
const DECK_OFFSET = -40;
const SLOT_PCT = -106;
const STACK_X_PCT = [DECK_OFFSET, DECK_OFFSET + SLOT_PCT, DECK_OFFSET + SLOT_PCT * 2]; // [-40, -146, -252]
const STACK_X = STACK_X_PCT.map((pct) => `${pct}%`);
// Quick, snappy stagger -- reads as cards being dealt one after another
// rather than a slow synchronized fade.
const DEAL_STAGGER = 0.07;
// Card 1 travels the shortest distance (-40%) and 0.2s reads as a
// perfectly snappy deal for it. Cards 2 and 3 travel much further
// (-146%, -252%) -- giving them the SAME duration means they'd have to
// move much faster to cover that ground in the same time, which reads
// as a jarring speed-up rather than a consistent "deal" motion. Holding
// acceleration constant instead of duration (distance = 1/2 * a * t^2,
// so t scales with sqrt(distance)) keeps every card's throw feeling
// like the same hand dealt it.
const DEAL_DURATIONS = STACK_X_PCT.map(
  (pct) => 0.2 * Math.sqrt(Math.abs(pct) / Math.abs(STACK_X_PCT[0])),
);

// Two hand-built shapes (no source SVG asset exists for these -- the raw
// Figma export only kept flattened rectangles, same loss seen on every
// other decorative shape in this project's exports). Both approximated
// by eye against the reference screenshots: the "sticker" as two
// overlapping ellipses (reads as a rounded blob with a soft waist, close
// to the reference's two-bump cloud silhouette), and the starburst as a
// true 8-point star polygon (computed, not eyeballed, so its points are
// evenly spaced).
const STARBURST_POINTS =
  '24.00,1.00 29.93,9.68 40.26,7.74 38.32,18.07 47.00,24.00 38.32,29.93 40.26,40.26 29.93,38.32 24.00,47.00 18.07,38.32 7.74,40.26 9.68,29.93 1.00,24.00 9.68,18.07 7.74,7.74 18.07,9.68';

function NumberShape({ shape, fill, size }) {
  if (shape === 'sticker') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <ellipse cx="24" cy="16" rx="16" ry="12" fill={fill} />
        <ellipse cx="24" cy="31" rx="19" ry="16" fill={fill} />
      </svg>
    );
  }
  if (shape === 'starburst') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <polygon points={STARBURST_POINTS} fill={fill} />
      </svg>
    );
  }
  if (shape === 'square') {
    // A fixed 10px radius, not the `rounded-medium` design token -- that
    // token (24px at desktop) is tuned for card-sized corners; at this
    // 40-48px badge scale it's close enough to half the box's own size
    // that it read as a circle instead of a rounded square.
    return (
      <div
        aria-hidden="true"
        style={{ width: `${size}px`, height: `${size}px`, backgroundColor: fill, borderRadius: '10px' }}
      />
    );
  }
  // circle
  return (
    <div
      aria-hidden="true"
      className="rounded-full"
      style={{ width: `${size}px`, height: `${size}px`, backgroundColor: fill }}
    />
  );
}

function NumberButton({ set, isActive, onClick, shouldReduceMotion, innerRef, id, panelId, asTab = true }) {
  const size = isActive ? 48 : 40;
  const fill = isActive ? set.numberColorVar : 'var(--color-black-200)';
  // Set 3's square rotates slightly when active (per spec); the other
  // shapes don't need an extra rotate since their own silhouette already
  // reads clearly without it.
  const rotate = isActive && set.shape === 'square' ? -2 : 0;

  // S renders every set's content at once (no swapping panel), so this
  // is no longer an ARIA APG "tab" (which requires exactly one visible
  // panel) -- it's a plain scroll-to-section anchor button instead, using
  // aria-current to mark whichever set is currently in view rather than
  // aria-selected/aria-controls, and no roving tabindex since there's no
  // longer a composite tablist widget to manage focus within.
  //
  // aria-hidden here (S/M only, asTab=false) hides it from SCREEN READERS
  // specifically -- announcing "Insight 1", "Insight 2"... on this row as
  // well as on each card itself (AssumptionCard's own sr-only prefix, own
  // comment) would be the same redundant-announcement problem the
  // timestamp fix solved. It stays keyboard-focusable (tabIndex: 0, same
  // as before) and mouse/touch-clickable regardless -- this must remain a
  // real, reachable keyboard shortcut for sighted keyboard users, who
  // still need it since S/M's content, while all in the DOM, is a long
  // scroll to Tab through sequentially otherwise. Only screen reader
  // announcement is suppressed, not the control itself.
  const tabProps = asTab
    ? { role: 'tab', id, 'aria-selected': isActive, 'aria-controls': panelId, tabIndex: isActive ? 0 : -1 }
    : { 'aria-current': isActive ? 'true' : undefined, tabIndex: 0, 'aria-hidden': true };

  return (
    <button
      ref={innerRef}
      type="button"
      {...tabProps}
      onClick={onClick}
      aria-label={`Insight ${set.number}`}
      className="relative flex cursor-pointer flex-col items-center justify-center p-xs transition-opacity duration-150 hover:opacity-80"
      style={{ width: '48px', height: '48px' }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: size / 48, rotate }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 22 }}
      >
        <NumberShape shape={set.shape} fill={fill} size={48} />
      </motion.div>
      {/* White on the inactive fill (black-200, #D1D1D1) only reaches
          1.53:1 -- badly fails WCAG AA regardless of text size. The
          inactive number switches to text-body-default (black-700)
          instead, which reaches 5.36:1 against that same light gray;
          active numbers keep white, since every active fill (the four
          brand colors) already clears 4.5:1 against white. */}
      <span
        className={`body-paragraph relative ${isActive ? 'text-heading-inverted' : 'text-body-default'}`}
        style={{ fontSize: '20px', lineHeight: '28px' }}
      >
        {set.number}
      </span>
    </button>
  );
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Spoken-language form of the same value, for screen readers -- "1:23"
// read literally by a screen reader is ambiguous ("one twenty-three"?
// "one colon twenty-three"?), so this is used for aria-label/aria-valuetext
// instead, while the visual "0:00"-style text stays as-is for sighted
// users. Same helper Section 4's TV audio player already uses, duplicated
// locally rather than imported since each section keeps its own small
// self-contained utilities in this codebase.
function formatTimeSpoken(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0 seconds';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const secondsPart = `${seconds} second${seconds === 1 ? '' : 's'}`;
  if (minutes === 0) return secondsPart;
  const minutesPart = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  return `${minutesPart} ${secondsPart}`;
}

// Static/inert visual -- unchanged from the original spec, used whenever
// a set has no audioSrc yet (edit section12-content.json, by hand or via
// the /admin editor, to add one). "0:10" / "1:02" and the ~68% fill are
// the literal placeholder numbers from every reference screenshot.
function InertAudioPlayer({ trackColor }) {
  const fillPct = 68;
  return (
    <div className="flex items-end justify-start gap-l self-stretch">
      <div className="flex flex-1 flex-col items-start justify-start gap-2xs">
        <div className="relative h-[8px] self-stretch bg-black-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-[8px]"
            style={{ width: `${fillPct}%`, backgroundColor: trackColor }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{ width: '20px', height: '20px', left: `calc(${fillPct}% - 10px)`, top: '-6px', backgroundColor: trackColor }}
          />
        </div>
        {/* Same aria-hidden-digits + sr-only-spoken-string split as
            Section 4's own readout -- see AudioPlayer's identical markup
            below for why an aria-label on the <p> itself isn't used
            (it overrides the accessible name but leaves the differently-
            worded visible text still in the DOM, so AT ends up
            announcing both). */}
        <div className="flex items-start justify-between self-stretch">
          <p className="body-paragraph text-body-inverted">
            <span aria-hidden="true">0:10</span>
            <span className="sr-only">Elapsed: {formatTimeSpoken(10)}</span>
          </p>
          <p className="body-paragraph text-body-inverted">
            <span aria-hidden="true">1:02</span>
            <span className="sr-only">Duration: {formatTimeSpoken(62)}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        aria-label="Play (no audio set for this quote yet)"
        className="flex h-[58px] w-[58px] flex-shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-black-0 text-body-default shadow-[0_8px_16px_rgba(0,0,0,0.08)] opacity-60"
        style={{ color: trackColor }}
      >
        <MaterialIcon name="play_arrow" fill size={32} />
      </button>
    </div>
  );
}

// Real playback, used once a set has an audioSrc. Drag-to-seek on the
// track (via Pointer Events + setPointerCapture, so the drag keeps
// tracking even if the cursor slips off the thin 8px track while
// moving) plus a live play/pause + elapsed/duration readout -- enough to
// freely scrub and test a dropped-in audio file without leaving the page.
function AudioPlayer({ trackColor, audioSrc }) {
  const audioRef = useRef(null);
  const trackRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fillPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  // Shared by pointerdown (the initial tap/click position) and every
  // pointermove while dragging -- both need the same "where on the track
  // did this happen" math.
  const timeFromPointer = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    return ratio * duration;
  };

  const handlePointerDown = (e) => {
    if (!duration) return;
    trackRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const t = timeFromPointer(e);
    audioRef.current.currentTime = t;
    // Set directly instead of waiting for the audio element's own
    // timeupdate event -- that keeps the thumb glued to the pointer
    // every frame rather than trailing behind at the audio element's own
    // (throttled, less frequent) update rate.
    setCurrentTime(t);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !duration) return;
    const t = timeFromPointer(e);
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    trackRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex items-end justify-start gap-l self-stretch">
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />
      <div className="flex flex-1 flex-col items-start justify-start gap-2xs">
        <div
          ref={trackRef}
          role="slider"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTimeSpoken(currentTime)} of ${formatTimeSpoken(duration)}`}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(e) => {
            const audio = audioRef.current;
            if (!audio) return;
            if (e.key === 'ArrowRight') audio.currentTime = Math.min(duration, currentTime + 5);
            if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, currentTime - 5);
          }}
          className="relative h-[8px] w-full cursor-pointer touch-none select-none self-stretch bg-black-0"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-[8px]"
            style={{ width: `${fillPct}%`, backgroundColor: trackColor }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{ width: '20px', height: '20px', left: `calc(${fillPct}% - 10px)`, top: '-6px', backgroundColor: trackColor }}
          />
        </div>
        {/* aria-hidden on the visible digits + a separate sr-only spoken
            string, rather than an aria-label on the <p> itself: aria-
            label overrides the element's ACCESSIBLE NAME, but doesn't
            remove the visible text node from the DOM -- screen readers'
            continuous/virtual-cursor reading picks up both, announcing
            "Elapsed: 34 seconds" (the label) immediately followed by
            "0:34" read digit-by-digit ("zero zero thirty four") from the
            still-present visible text. Splitting into two spans (one
            hidden from AT, one hidden visually) means exactly one of
            them is ever in the accessibility tree at a time -- same
            mechanism as Section 4's own readout. */}
        <div className="flex items-start justify-between self-stretch">
          <p className="body-paragraph text-body-inverted">
            <span aria-hidden="true">{formatTime(currentTime)}</span>
            <span className="sr-only">Elapsed: {formatTimeSpoken(currentTime)}</span>
          </p>
          <p className="body-paragraph text-body-inverted">
            <span aria-hidden="true">{formatTime(duration)}</span>
            <span className="sr-only">Duration: {formatTimeSpoken(duration)}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="flex h-[58px] w-[58px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-black-0 text-body-default shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-opacity duration-150 hover:opacity-80"
        style={{ color: trackColor }}
      >
        <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={32} />
      </button>
    </div>
  );
}

// XL swaps a single tabpanel's content on click, always already on-screen
// when it mounts, so its cards deal in immediately via plain initial+
// animate, sliding in from a stacked deck sitting far to the left
// (stackX, a big negative percentage). S instead mounts all four sets'
// cards at once up front in a long scrollable page and stacks them
// vertically at 100% width -- reusing that same large-x offset there is
// actively broken, not just visually wrong: whileInView's own
// IntersectionObserver checks the element's REAL on-screen position
// (initial transform included), and a card sitting ~1-2 viewport-widths
// off to the left never intersects the viewport at all, so it never
// fires and stays permanently invisible. That's why Reality/QuoteCard
// silently never appeared. revealOnScroll therefore uses a plain
// fade-up (y, no x) instead, matching ScrollSection's own convention
// used everywhere else on the site, with rotate held constant at its
// final tilt rather than animated in from the "messy stack" angle.
function dealMotionProps(shouldReduceMotion, revealOnScroll, stackX, stackRotate, finalRotate, duration, delay) {
  if (revealOnScroll) {
    const initial = shouldReduceMotion ? false : { y: 24, rotate: finalRotate, opacity: 0 };
    const target = { y: 0, rotate: finalRotate, opacity: 1 };
    const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut', delay };
    return { initial, whileInView: target, viewport: { once: true, amount: 0.3 }, transition };
  }
  const initial = shouldReduceMotion ? false : { x: stackX, rotate: stackRotate, opacity: 0 };
  const target = { x: 0, rotate: finalRotate, opacity: 1 };
  const transition = shouldReduceMotion ? { duration: 0 } : { duration, ease: 'easeOut', delay };
  return { initial, animate: target, transition };
}

// widthClassName: '' (S/XL, unchanged) lets the card size the way it
// always has -- 100% via the S column's own items-stretch, or an even
// flex-1 split in XL's row. M passes an explicit 'w-[480px] max-w-full
// mx-auto' instead (own callsite comment) -- flex-1 only affects the
// column's MAIN axis (height) there, an orthogonal property from width,
// so it doesn't fight this override; mx-auto is what actually centers
// the now-explicitly-sized card within the wider stretch-by-default
// column, same auto-margins-beat-align-items technique content-cap's
// own comment already relies on elsewhere in this file.
// showInsightPrefix (S/M's own callsite only, own comment there): adds an
// sr-only "Insight N: " ahead of the visible "We assumed" text -- S/M
// hides the number row from screen readers entirely (NumberButton's own
// comment), so without this, a screen reader user landing on this card
// would have no indication of which insight it belongs to at all. Purely
// additive to the accessible name (not a duplicate of anything already
// announced, unlike the timestamp fix), so it's a plain sr-only span
// ahead of the real text rather than an aria-hidden/sr-only split -- both
// pieces are meant to be heard together as one phrase. L/XL doesn't pass
// this (defaults to false/no prefix): its own tab is still reachable and
// already announces "Insight N" there, so adding it here too would
// reintroduce that same redundant-announcement problem.
function AssumptionCard({ set, shouldReduceMotion, revealOnScroll = false, widthClassName = '', showInsightPrefix = false }) {
  return (
    <motion.div
      {...dealMotionProps(shouldReduceMotion, revealOnScroll, STACK_X[0], STACK_ROTATE[0], FINAL_ROTATE[0], DEAL_DURATIONS[0], 0 * DEAL_STAGGER)}
      className={`relative z-[3] flex flex-1 flex-col items-start justify-start gap-s rounded-large bg-bg-white p-l ${widthClassName}`}
    >
      <p className="body-paragraph self-stretch text-body-default">
        {showInsightPrefix && <span className="sr-only">Insight {set.number}: </span>}
        We assumed
      </p>
      <p className="heading-3 self-stretch text-heading-default">{set.assumption}</p>
    </motion.div>
  );
}

function RealityCard({ set, shouldReduceMotion, revealOnScroll = false, widthClassName = '' }) {
  return (
    <motion.div
      {...dealMotionProps(shouldReduceMotion, revealOnScroll, STACK_X[1], STACK_ROTATE[1], FINAL_ROTATE[1], DEAL_DURATIONS[1], 1 * DEAL_STAGGER)}
      className={`relative z-[2] flex flex-1 flex-col items-start justify-start gap-s rounded-large p-l ${set.card2Bg} ${widthClassName}`}
    >
      <p className="body-paragraph self-stretch text-body-default">What really happened</p>
      <p className="heading-3 self-stretch text-heading-default">{set.reality}</p>
    </motion.div>
  );
}

function QuoteCard({ set, shouldReduceMotion, revealOnScroll = false, widthClassName = '' }) {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const transcriptButtonRef = useRef(null);

  return (
    <motion.div
      {...dealMotionProps(shouldReduceMotion, revealOnScroll, STACK_X[2], STACK_ROTATE[2], FINAL_ROTATE[2], DEAL_DURATIONS[2], 2 * DEAL_STAGGER)}
      className={`relative z-[1] flex flex-1 flex-col items-start justify-start gap-s rounded-large p-l ${set.card3Bg} ${widthClassName}`}
    >
      <p className="body-paragraph self-stretch text-body-inverted">What was said</p>
      <p className="heading-3 self-stretch text-heading-inverted">&ldquo;{set.quote}&rdquo;</p>

      <div className="mt-auto flex flex-col items-start justify-center gap-l self-stretch">
        {set.audioSrc ? (
          <AudioPlayer trackColor={set.trackColor} audioSrc={set.audioSrc} />
        ) : (
          <InertAudioPlayer trackColor={set.trackColor} />
        )}
        <ButtonTertiary inverted innerRef={transcriptButtonRef} onClick={() => setIsTranscriptOpen(true)}>
          <MaterialIcon name="description" />
          Read transcript
        </ButtonTertiary>
      </div>

      <TranscriptModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        subtitle={`“${set.quote}”`}
        transcript={set.transcript}
        triggerRef={transcriptButtonRef}
      />
    </motion.div>
  );
}

// ARIA APG Tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):
// the 1/2/3/4 row is a tablist, each number a tab, and the assumption/
// reality/quote trio together are a single tabpanel (one physical panel
// whose content swaps, rather than four pre-rendered panels toggled via
// `hidden` -- keeping the existing remount-per-set "deal" animation intact,
// which four-simultaneous-panels would conflict with).
const PANEL_ID = 'section12-panel';
const tabId = (number) => `section12-tab-${number}`;

// Height of the sticky number row at S -- 48px button + p-xs (8px) top/
// bottom padding on the row itself, rounded up a little for the row's
// own py breathing room. Used both as each set's scroll-margin-top (so a
// click-to-scroll doesn't land a set's top edge underneath the sticky
// nav) and as the IntersectionObserver's rootMargin top offset (so a set
// only counts as "current" once it's actually clear of the sticky nav,
// not merely technically past y=0).
//
// The site's own global header (the fixed hamburger-menu toggle) is ALSO
// fixed at the top of the viewport at every breakpoint, which would
// otherwise stack/overlap with this nav -- rather than offsetting this
// nav below it, Section12 hides that global toggle instead (via the
// `section12-nav-active` body class, see the effect below and its
// `.global-nav-toggle` CSS rule in index.css) whenever this section is in
// view, so this nav can just use top:0 and be the only fixed bar.
const S_STICKY_NAV_HEIGHT = 80;

export default function Section12() {
  const [activeSet, setActiveSet] = useState(1);
  const [isNavStuck, setIsNavStuck] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  // M reuses S's whole interaction wholesale -- sticky number nav,
  // scroll-spy, all four sets stacked and pre-rendered at once -- rather
  // than getting its own tabbed/paginated layout. isAtLeastLg is what
  // now actually decides "S-style behavior vs XL's tablist", not
  // isAtLeastSm; isAtLeastSm itself is unused for that purpose anymore
  // (only isM below reads it, to know whether the S-style branch it's
  // currently in is specifically M so it can apply M's own 480px card
  // width instead of S's full-width one).
  const isAtLeastLg = useMediaQuery('(min-width: 992px)');
  const isM = isAtLeastSm && !isAtLeastLg;
  const set = getSet(activeSet);
  const tabRefs = useRef({});
  const setSectionRefs = useRef({});
  const sectionRef = useRef(null);
  const navSentinelRef = useRef(null);

  // The shadow should only read as "this bar has detached from the page
  // and is now floating over content" once it's actually stuck -- while
  // it's still in normal flow at the very top of the section, a shadow
  // there just looks like an unexplained line under the numbers. No CSS
  // :stuck selector yet (too new to rely on), so this is the standard
  // sentinel trick instead: a zero-height marker placed immediately
  // before the sticky nav in normal flow. The moment it scrolls out from
  // under the viewport's top edge, the nav (pinned at the same y) must
  // have taken over that spot -- i.e. gone stuck.
  useEffect(() => {
    if (isAtLeastLg || !navSentinelRef.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsNavStuck(!entry.isIntersecting), { threshold: 0 });
    observer.observe(navSentinelRef.current);
    return () => observer.disconnect();
  }, [isAtLeastLg]);

  // Deliberately separate from activeSet itself, and only ever set by
  // these two handlers -- own comment on the live region further down
  // explains why the tablist's own clicks/arrow-keys don't also need to
  // touch this.
  const [announcement, setAnnouncement] = useState('');

  const goToPrev = () => {
    setActiveSet((s) => {
      const next = s === 1 ? 4 : s - 1;
      setAnnouncement(`Insight ${next} of ${SET_DESIGN.length}`);
      return next;
    });
  };
  const goToNext = () => {
    setActiveSet((s) => {
      const next = s === 4 ? 1 : s + 1;
      setAnnouncement(`Insight ${next} of ${SET_DESIGN.length}`);
      return next;
    });
  };

  // Toggles the body class that hides the global nav toggle (see the
  // S_STICKY_NAV_HEIGHT comment above) for as long as any part of this
  // section is in view -- not just while its sticky nav is technically
  // "stuck", since the two would still stack/overlap during the brief
  // window before it sticks. Cleans the class up on unmount too, so
  // navigating away mid-section (or a hot-reload) never leaves the
  // global nav permanently hidden.
  useEffect(() => {
    if (isAtLeastLg || !sectionRef.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle('section12-nav-active', entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      document.body.classList.remove('section12-nav-active');
    };
  }, [isAtLeastLg]);

  // S/M-only scroll-spy: whichever set's own wrapper is crossing the
  // band just below the sticky nav becomes "active" -- the standard
  // rootMargin trick (a negative top/bottom margin collapses the
  // observer's effective viewport to a thin horizontal band) rather than
  // picking whichever entry has the largest intersection ratio, which
  // gets noisy when a tall set and a short one are both partly visible
  // at once. Skips entirely at lg+, where activeSet is click-driven
  // instead (see goToPrev/goToNext and the tablist's onClick below);
  // re-runs whenever isAtLeastLg itself changes so a mid-session resize
  // across the breakpoint re-attaches to whichever set of DOM nodes is
  // current (same fix as Section 8's own resize bug).
  useEffect(() => {
    if (isAtLeastLg) return;
    const els = SET_DESIGN.map((design) => setSectionRefs.current[design.number]).filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSet(Number(entry.target.dataset.setNumber));
          }
        });
      },
      { rootMargin: `-${S_STICKY_NAV_HEIGHT}px 0px -70% 0px`, threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isAtLeastLg]);

  const scrollToSet = (number) => {
    setSectionRefs.current[number]?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  // "Automatic activation" model: moving focus with an arrow key also
  // switches the active tab/panel immediately, no separate Enter/Space
  // step needed -- the more common of the two patterns APG allows.
  const focusAndActivate = (number) => {
    setActiveSet(number);
    tabRefs.current[number]?.focus();
  };

  function handleTabListKeyDown(event) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        focusAndActivate(activeSet === 1 ? 4 : activeSet - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusAndActivate(activeSet === 4 ? 1 : activeSet + 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAndActivate(1);
        break;
      case 'End':
        event.preventDefault();
        focusAndActivate(4);
        break;
      default:
        break;
    }
  }

  if (!isAtLeastLg) {
    // S and M share this branch (isM only controls the card width
    // override passed to each card further down): no tabs, no arrows --
    // every set's 3-card group renders at once in a long scrollable page
    // instead of one swapped-in-place panel. The number row becomes a
    // sticky top-anchored nav -- click jumps to that set (scrollToSet),
    // and the scroll-spy effect above keeps whichever number is
    // highlighted in sync with actual scroll position, not the other way
    // around.
    return (
      <section ref={sectionRef} id="section-12" className="relative flex w-full flex-col items-center justify-start bg-white-linen-100">
        <div ref={navSentinelRef} aria-hidden="true" style={{ height: 0 }} />
        <div
          className={`sticky top-0 z-20 flex w-full items-center justify-center gap-2xl bg-white-linen-100 px-page-margin-x py-xs ${isNavStuck ? 'shadow-[0_4px_8px_rgba(0,0,0,0.06)]' : ''}`}
          style={{ height: `${S_STICKY_NAV_HEIGHT}px` }}
        >
          {SET_DESIGN.map((design) => (
            <NumberButton
              key={design.number}
              asTab={false}
              set={design}
              isActive={activeSet === design.number}
              onClick={() => scrollToSet(design.number)}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>

        <div className="flex w-full flex-col items-stretch justify-start gap-3xl px-page-margin-x py-page-margin-y">
          {SET_DESIGN.map((design) => {
            const setData = getSet(design.number);
            return (
              <div
                key={design.number}
                ref={(el) => {
                  setSectionRefs.current[design.number] = el;
                }}
                data-set-number={design.number}
                className="flex w-full content-cap flex-col items-stretch justify-start gap-m"
                style={{ scrollMarginTop: `${S_STICKY_NAV_HEIGHT}px` }}
              >
                {/* isM: M reuses S's whole stacked/scroll-spy layout
                    (own comment above) but caps each card at a fixed
                    480px instead of S's full content-cap width -- see
                    each card's own widthClassName comment. */}
                <AssumptionCard
                  set={setData}
                  shouldReduceMotion={shouldReduceMotion}
                  revealOnScroll
                  showInsightPrefix
                  widthClassName={isM ? 'w-[480px] max-w-full mx-auto' : ''}
                />
                <RealityCard
                  set={setData}
                  shouldReduceMotion={shouldReduceMotion}
                  revealOnScroll
                  widthClassName={isM ? 'w-[480px] max-w-full mx-auto' : ''}
                />
                <QuoteCard
                  set={setData}
                  shouldReduceMotion={shouldReduceMotion}
                  revealOnScroll
                  widthClassName={isM ? 'w-[480px] max-w-full mx-auto' : ''}
                />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      id="section-12"
      className="relative flex w-full flex-col items-center justify-start gap-xl bg-white-linen-100 px-page-margin-x py-page-margin-y"
    >
      <div role="tablist" aria-label="Insights" onKeyDown={handleTabListKeyDown} className="flex items-center justify-start gap-2xl">
        {SET_DESIGN.map((design) => (
          <NumberButton
            key={design.number}
            innerRef={(el) => {
              tabRefs.current[design.number] = el;
            }}
            id={tabId(design.number)}
            panelId={PANEL_ID}
            set={design}
            isActive={activeSet === design.number}
            onClick={() => setActiveSet(design.number)}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>

      {/* content-cap: without it, the three flex-1 cards below stretched
          to fill however wide the section itself happened to be at wide
          viewports (1425px+), each growing far wider than its actual text
          content needed. Its own margin-inline:auto is NOT redundant here
          despite the section's own items-center (it's flex-col): the
          pre-existing self-stretch class (now removed) set
          align-self:stretch on this item, which overrides the parent's
          items-center and left-aligns the box once max-w shrinks it below
          the available width instead of centering it -- auto margins take
          priority over any align-self/align-items in flexbox, so
          content-cap centers reliably regardless. */}
      <div className="relative flex w-full content-cap">
        {/* Tabpanel comes FIRST in DOM/tab order, ahead of the Next/Prev
            arrows below -- Tab order is: tablist (1/2/3/4, one stop via
            roving tabIndex) -> this panel's own focusable content (the
            audio player, "Read transcript") -> Next/Prev. Both arrows are
            `absolute`-positioned against this same relative wrapper, so
            moving them after the panel in the DOM doesn't move them
            on-screen at all, only their place in reading/Tab order. */}
        <div role="tabpanel" id={PANEL_ID} aria-labelledby={tabId(activeSet)} tabIndex={0} className="flex w-full items-stretch justify-center gap-m">
          {/* key={activeSet} forces all three cards to remount on every set
              change, re-triggering the stacked-deck entrance from scratch
              each time (rather than animating between two sets' worth of
              transform values, which would look like a slide, not a deal). */}
          <AssumptionCard key={`a-${activeSet}`} set={set} shouldReduceMotion={shouldReduceMotion} />
          <RealityCard key={`r-${activeSet}`} set={set} shouldReduceMotion={shouldReduceMotion} />
          <QuoteCard key={`q-${activeSet}`} set={set} shouldReduceMotion={shouldReduceMotion} />
        </div>

        {/* Not aria-hidden (see ArrowButton's own comment for why that was
            tried and reverted) -- these duplicate the tablist's own
            Left/Right arrow-key navigation for mouse/touch users, but are
            real, announced, focusable controls too, so a keyboard-only
            user has a direct way to move between sets from here, without
            shifting focus all the way back up to the tablist first. */}
        <ArrowButton
          direction="left"
          onClick={goToPrev}
          label="Previous set"
          size={48}
          iconSize={32}
          bg="bg-bg-linen-light"
          className="absolute top-1/2 z-10 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
          // calc(-1 * min(56px, var(--spacing-page-margin-x))) -- the
          // designed 56px offset, but clamped so it can never exceed the
          // page's CURRENT margin at any breakpoint. A flat -56px was
          // only ever safe back when the margin was a fixed 150px at
          // this tier (94px of slack); now that page-margin-x tops out
          // at 32px, an unclamped -56px pushes 24px past the true
          // viewport edge -- exactly the horizontal-overflow amount this
          // was causing.
          style={{ left: 'calc(-1 * min(56px, var(--spacing-page-margin-x)))' }}
        />
        <ArrowButton
          direction="right"
          onClick={goToNext}
          label="Next set"
          size={48}
          iconSize={32}
          bg="bg-bg-linen-light"
          className="absolute top-1/2 z-10 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
          style={{ right: 'calc(-1 * min(56px, var(--spacing-page-margin-x)))' }}
        />

        {/* Live region -- same reasoning as Section 9's own carousel arrows.
            The tablist above doesn't need this: clicking or arrow-keying a
            tab moves/keeps focus on that tab, and its own aria-selected/
            name change is what a screen reader announces there. These two
            arrows deliberately DON'T move focus off themselves (own comment
            above -- repeated presses shouldn't force re-navigating back to
            the tablist each time), so without this, activating them changed
            which set was showing with no spoken feedback at all. Only
            "Insight N of 4" (not the panel's full assumption/reality/quote
            text) -- unlike Section 9's one-image-per-slide carousel, a set
            here is three separate substantial pieces of content, and
            reading all of them aloud on every arrow press would be
            overwhelming; this gives positional confirmation and leaves the
            user free to Tab into the panel and read at their own pace,
            same as a sighted user glancing at the highlighted number first. */}
        <div aria-live="polite" aria-atomic="false" className="sr-only">
          {announcement}
        </div>
      </div>
    </section>
  );
}

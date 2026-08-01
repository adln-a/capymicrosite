import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ButtonTertiary } from './Navigation.jsx';
import { MaterialIcon } from './icons.jsx';
import ArrowButton from './ArrowButton.jsx';
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
  return { ...design, assumption: text.assumption ?? '', reality: text.reality ?? '', quote: text.quote ?? '', audioSrc: text.audioSrc ?? '' };
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

function NumberButton({ set, isActive, onClick, shouldReduceMotion }) {
  const size = isActive ? 48 : 40;
  const fill = isActive ? set.numberColorVar : 'var(--color-black-200)';
  // Set 3's square rotates slightly when active (per spec); the other
  // shapes don't need an extra rotate since their own silhouette already
  // reads clearly without it.
  const rotate = isActive && set.shape === 'square' ? -2 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Go to set ${set.number}`}
      className="relative flex flex-col items-center justify-center p-xs"
      style={{ width: '48px', height: '48px' }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: size / 48, rotate }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 22 }}
      >
        <NumberShape shape={set.shape} fill={fill} size={48} />
      </motion.div>
      <span className="body-paragraph relative text-heading-inverted" style={{ fontSize: '20px', lineHeight: '28px' }}>
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
        <div className="flex items-start justify-between self-stretch">
          <p className="body-paragraph text-body-inverted">0:10</p>
          <p className="body-paragraph text-body-inverted">1:02</p>
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
          aria-label="Seek audio position"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
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
        <div className="flex items-start justify-between self-stretch">
          <p className="body-paragraph text-body-inverted">{formatTime(currentTime)}</p>
          <p className="body-paragraph text-body-inverted">{formatTime(duration)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full bg-black-0 text-body-default shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
        style={{ color: trackColor }}
      >
        <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={32} />
      </button>
    </div>
  );
}

function AssumptionCard({ set, shouldReduceMotion }) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { x: STACK_X[0], rotate: STACK_ROTATE[0], opacity: 0 }}
      animate={{ x: 0, rotate: FINAL_ROTATE[0], opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: DEAL_DURATIONS[0], ease: 'easeOut', delay: 0 * DEAL_STAGGER }}
      className="relative z-[3] flex flex-1 flex-col items-start justify-start gap-s rounded-large bg-bg-white p-l"
    >
      <p className="body-paragraph self-stretch text-body-default">We assumed</p>
      <h3 className="heading-3 self-stretch text-heading-default">{set.assumption}</h3>
    </motion.div>
  );
}

function RealityCard({ set, shouldReduceMotion }) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { x: STACK_X[1], rotate: STACK_ROTATE[1], opacity: 0 }}
      animate={{ x: 0, rotate: FINAL_ROTATE[1], opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: DEAL_DURATIONS[1], ease: 'easeOut', delay: 1 * DEAL_STAGGER }}
      className={`relative z-[2] flex flex-1 flex-col items-start justify-start gap-s rounded-large p-l ${set.card2Bg}`}
    >
      <p className="body-paragraph self-stretch text-body-default">What really happened</p>
      <h3 className="heading-3 self-stretch text-heading-default">{set.reality}</h3>
    </motion.div>
  );
}

function QuoteCard({ set, shouldReduceMotion }) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { x: STACK_X[2], rotate: STACK_ROTATE[2], opacity: 0 }}
      animate={{ x: 0, rotate: FINAL_ROTATE[2], opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: DEAL_DURATIONS[2], ease: 'easeOut', delay: 2 * DEAL_STAGGER }}
      className={`relative z-[1] flex flex-1 flex-col items-start justify-start gap-s rounded-large p-l ${set.card3Bg}`}
    >
      <p className="body-paragraph self-stretch text-body-inverted">What was said</p>
      <h3 className="heading-3 self-stretch text-heading-inverted">&ldquo;{set.quote}&rdquo;</h3>

      <div className="mt-auto flex flex-col items-start justify-center gap-l self-stretch">
        {set.audioSrc ? (
          <AudioPlayer trackColor={set.trackColor} audioSrc={set.audioSrc} />
        ) : (
          <InertAudioPlayer trackColor={set.trackColor} />
        )}
        <ButtonTertiary inverted>
          <MaterialIcon name="description" />
          Read transcript
        </ButtonTertiary>
      </div>
    </motion.div>
  );
}

export default function Section12() {
  const [activeSet, setActiveSet] = useState(1);
  const shouldReduceMotion = useReducedMotion();
  const set = getSet(activeSet);

  const goToPrev = () => setActiveSet((s) => (s === 1 ? 4 : s - 1));
  const goToNext = () => setActiveSet((s) => (s === 4 ? 1 : s + 1));

  return (
    <section
      id="section-12"
      className="relative flex w-full flex-col items-center justify-start gap-xl bg-white-linen-100 px-page-margin-x py-page-margin-y"
    >
      <div className="flex items-center justify-start gap-2xl">
        {SET_DESIGN.map((design) => (
          <NumberButton
            key={design.number}
            set={design}
            isActive={activeSet === design.number}
            onClick={() => setActiveSet(design.number)}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>

      <div className="relative flex w-full items-stretch justify-center gap-m self-stretch">
        <ArrowButton
          direction="left"
          onClick={goToPrev}
          label="Previous set"
          size={48}
          iconSize={32}
          bg="bg-bg-linen-light"
          className="absolute top-1/2 z-10 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
          style={{ left: '-56px' }}
        />
        <ArrowButton
          direction="right"
          onClick={goToNext}
          label="Next set"
          size={48}
          iconSize={32}
          bg="bg-bg-linen-light"
          className="absolute top-1/2 z-10 -translate-y-1/2 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
          style={{ right: '-56px' }}
        />

        {/* key={activeSet} forces all three cards to remount on every set
            change, re-triggering the stacked-deck entrance from scratch
            each time (rather than animating between two sets' worth of
            transform values, which would look like a slide, not a deal). */}
        <AssumptionCard key={`a-${activeSet}`} set={set} shouldReduceMotion={shouldReduceMotion} />
        <RealityCard key={`r-${activeSet}`} set={set} shouldReduceMotion={shouldReduceMotion} />
        <QuoteCard key={`q-${activeSet}`} set={set} shouldReduceMotion={shouldReduceMotion} />
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ScrollSection from './ScrollSection.jsx';
import { ButtonSecondary, ButtonTertiary } from './Navigation.jsx';
import TranscriptModal from './TranscriptModal.jsx';
import { MaterialIcon } from './icons.jsx';
import antenna from '../assets/Antenna.svg';
import sandyAudioSrc from '../assets/Sandy-Final-Audio.mp3';
import joAudioSrc from '../assets/Jo-Audio-Final.mp3';

const TRANSCRIPT_LINE_COUNT = 9;
const SKIP_SECONDS = 5;

// Values are the exact numbers passed to audio.playbackRate -- labels are
// just how those same numbers are displayed (1 -> "1.0 x", matching the
// original static design), not a separate/rounded scale.
const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5 x' },
  { value: 1, label: '1.0 x' },
  { value: 1.25, label: '1.25 x' },
  { value: 1.5, label: '1.5 x' },
  { value: 2, label: '2.0 x' },
];

// The TV holds two stories, toggled by the Next/Prev button below --
// "1." not in the raw export/spec text originally, but confirmed against
// the reference image and kept here as part of each title, since this is
// a numbered sequence.
const STORIES = [
  {
    title: '1. Sandy, 39, Single mother',
    playerTitle: 'What Sandy said',
    audioSrc: sandyAudioSrc,
    paragraphs: [
      `Sandy is a single mother of two children living in Singapore. Due to the high cost of living in Singapore, Sandy avoids expensive outings to destinations like Sentosa or Gardens by the Bay.`,
      `Financial priorities are structured around essential needs, with food taking precedence over entertainment. While her children enjoy carnival games and bouncy castles, purchasing access can cost $50, which exceeds her budget; as a result, her children are often limited to watching. During school holidays, going to the cinema serves as the most cost-effective leisure activity. Sandy intentionally selects movies that provide broader value, aiming to teach her children self-regulation, appropriate social behavior, and the value of family affection.`,
      `She encourages them to focus on making progress relative to their own past efforts rather than competing with others, aiming to build their self-confidence to handle future challenges.`,
    ],
    // Real interview transcript (not the paraphrased card text above) --
    // lightly cleaned up from the raw recording (removed filler words
    // like "uh"/"um" and false starts) but otherwise Sandy's own words,
    // unparaphrased.
    transcript: `I'm a single mother. I have two children, so my daily life is a bit busy. In the morning I wake up, I cook, prepare the snack for my children, and then after that I will go to work. Then after work, come back, we do housework, go to bed about 10 to 10:30. That's all every day, the same.

In Singapore everything is expensive. If we want to go somewhere in Singapore, like Sentosa, it's expensive, Gardens by the Bay, so expensive. So that's the reason why we never really think that we want to go out. We don't dare to spend so much because of course we give priority to the food first, and entertainment is second.

They like to play at the carnival, all the carnival games. Then they've got the bouncy castle. You like the other one, but maybe no money to let you play. So expensive. They can only look. So expensive, I have to pay $50 in order to buy. I don't have enough money for all the games outside.

Sometimes, like during the school holidays, going to the movie is the cheapest compared to the rest. I want them to learn some skills from the movie. They learn something about how they behave well, how they react to certain situations when they really cannot control themselves. So I want it to be meaningful. I want them to realize that family love is more important.

I will encourage them and say that even though they are not compared to other children, they are not that high, but instead of comparing them to others, I would say that you should be better than yourself from yesterday. Then that's good already. You don't need to be better than any other people, just be better than yourself from yesterday. Then that's good already, you will do very well already. So we have to be confident in ourselves. Whatever thing we encounter, I will encourage them so they feel confident.`,
  },
  {
    title: '2. Jo, 8, P3 Student',
    playerTitle: 'What Jo said',
    audioSrc: joAudioSrc,
    paragraphs: [
      `Jo is a Primary 3 student in Singapore living in a single-parent household with a mother and sibling. Feeling restricted by a lack of financial resources and places to go, Jo expresses strong frustration regarding daily life, school, and student care.`,
      `Jo finds school tiring, boring, and overwhelming, and describes student care supervisors as strict, unsupportive, and disengaged.`,
    ],
    // Real interview transcript (not the paraphrased card text above) --
    // Jo's own words, unparaphrased.
    transcript: `Every single day no places, nowhere else to go. Because we are broke. I want to die. Yeah. School is hell. It's hell. It's dumb. We can do nothing. I'm sick of school cos it's annoying, tiring, and very boring.

All my friends hate student care, okay. It's because they are strict, first of all. Second of all they make our life hard. Third of all they don't care about us. They just watch their phones all day.`,
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Spoken-language form of the same value, for screen readers -- "1:23"
// read literally by a screen reader is ambiguous ("one twenty-three"?
// "one colon twenty-three"?), so this is used for aria-label/
// aria-valuetext instead, while the visual "0:00"-style text (above)
// stays as-is for sighted users.
function formatTimeSpoken(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0 seconds';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const secondsPart = `${seconds} second${seconds === 1 ? '' : 's'}`;
  if (minutes === 0) return secondsPart;
  const minutesPart = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  return `${minutesPart} ${secondsPart}`;
}

/**
 * Custom accessible slider (role="slider", not a native <input
 * type="range">) -- reuses the exact static visual already built (8px
 * track, 20x20 circular thumb) rather than fighting cross-browser
 * ::-webkit-slider-thumb/::-moz-range-thumb styling to match it. Fill
 * width and thumb position are both percentage-based (currentTime /
 * duration), not the static build's fixed 92px, so they track real
 * playback. Pointer dragging uses setPointerCapture so the drag keeps
 * tracking even if the pointer leaves the track's bounds -- no need for
 * window-level mousemove/mouseup listeners.
 */
function Scrubber({ currentTime, duration, onSeek }) {
  const trackRef = useRef(null);

  const seekFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track || !(duration > 0)) return;
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    onSeek(ratio * duration);
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromClientX(event.clientX);
  };

  const handlePointerMove = (event) => {
    if (event.buttons !== 1) return;
    seekFromClientX(event.clientX);
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        onSeek(clamp(currentTime + SKIP_SECONDS, 0, duration));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        onSeek(clamp(currentTime - SKIP_SECONDS, 0, duration));
        break;
      case 'Home':
        event.preventDefault();
        onSeek(0);
        break;
      case 'End':
        event.preventDefault();
        onSeek(duration);
        break;
      default:
        break;
    }
  };

  const pct = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Playback progress"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      aria-valuetext={formatTimeSpoken(currentTime)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className="relative h-[8px] cursor-pointer touch-none select-none self-stretch bg-black-0"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-[8px] bg-button-primary-orange"
        style={{ width: `${pct * 100}%` }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full bg-button-primary-orange"
        style={{ width: '20px', height: '20px', left: `calc(${pct * 100}% - 10px)`, top: '-6px' }}
      />
    </div>
  );
}

export default function Section4() {
  const shouldReduceMotion = useReducedMotion();
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [storyIndex, setStoryIndex] = useState(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const transcriptButtonRef = useRef(null);
  const activeHeadingRef = useRef(null);
  // Set right before toggling, consumed by the effect below once the new
  // story has actually rendered (and is no longer aria-hidden/invisible)
  // -- calling .focus() synchronously inside the click handler would hit
  // the OLD story's DOM, since React hasn't re-rendered with the new
  // storyIndex yet at that point. Guards against stealing focus on
  // initial mount too: it only ever becomes true from an explicit toggle.
  const pendingHeadingFocusRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, []);

  // Switching stories swaps the <audio> element's src to the other
  // story's track (below, via currentStory.audioSrc) -- the browser
  // resets its own playback position for the new resource automatically,
  // but our currentTime/duration/isPlaying state doesn't know that on its
  // own, so it's reset here explicitly. playbackRate is left alone: it's
  // a property of the element itself, not tied to which track is loaded,
  // so the user's chosen speed carries over between stories.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [storyIndex]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const skip = (deltaSeconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = clamp(audio.currentTime + deltaSeconds, 0, duration);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const seek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = clamp(time, 0, duration);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const cyclePlaybackRate = () => {
    const audio = audioRef.current;
    const currentIndex = SPEED_OPTIONS.findIndex((option) => option.value === playbackRate);
    const next = SPEED_OPTIONS[(currentIndex + 1) % SPEED_OPTIONS.length];
    setPlaybackRate(next.value);
    if (audio) audio.playbackRate = next.value;
  };

  const speedLabel = SPEED_OPTIONS.find((option) => option.value === playbackRate)?.label ?? '1.0 x';

  // Only two stories, so "next" and "prev" are the same action: flip
  // between index 0 and 1.
  const toggleStory = () => {
    pendingHeadingFocusRef.current = true;
    setStoryIndex((index) => (index === 0 ? 1 : 0));
  };
  const currentStory = STORIES[storyIndex];

  // Moves focus to the new story's own heading once it's actually the
  // active, visible one -- so a screen reader user lands right where the
  // new content starts, rather than staying on a button whose label just
  // silently changed to describe the OTHER story now.
  useEffect(() => {
    if (!pendingHeadingFocusRef.current) return;
    pendingHeadingFocusRef.current = false;
    activeHeadingRef.current?.focus();
  }, [storyIndex]);

  return (
    <section
      id="section-4"
      // Plain px-page-margin-x -- it now stays flat at 32px past md
      // forever (no separate xl override needed here anymore; the shared
      // token itself no longer forces a fixed jump at 1200px, precisely
      // so a section like this one can have its own content cap the
      // width instead -- see the TV's own max-w-[1140px] + mx-auto below,
      // which is what actually produces the growing margin from
      // ~1204px up (1140 + 2*32, where the TV first reaches its cap).
      className="relative flex w-full flex-col items-start justify-start gap-xs overflow-hidden bg-bg-red px-page-margin-x py-page-margin-y"
    >
      {/* Not visible -- the custom UI below is the actual interface. */}
      <audio ref={audioRef} src={currentStory.audioSrc} preload="metadata" className="hidden" />

      {/* Whole TV (antenna + frame + base) fades up together as one unit,
          rather than each piece separately -- it reads as a single
          object, not a sequence of parts. */}
      <ScrollSection className="flex w-full flex-col items-center justify-start gap-2xs">
        {/* 72x72 below sm (640px), 87x88 from sm up -- the only asset size
            that changes across the XS/S-M/L references; everything else
            in this TV stays the same 87x88 icon from S-M up through L. */}
        <img src={antenna} alt="" aria-hidden="true" className="h-[72px] w-[72px] sm:h-[88px] sm:w-[87px]" />

        {/* TV body: black frame. Stacked (flex-col, screen above audio
            panel) below lg (992px); side by side (flex-row) from lg up --
            per the XS/S-M references, which both show the audio panel as
            part of the same single stacked column rather than a separate
            side panel; only L introduces the two-column layout.

            The accent border around the screen only (not the audio panel
            -- confirmed against the reference image, the outline's rounded
            corner ends at the pink card's own edge) is also responsive:
            absent below sm (640px, XS has no border at all here), then
            bg-red from sm up -- the exact same red the section's own
            background uses (bg-bg-red below, same --color-bg-red token),
            so it reads as a visible ring against this TV's black interior
            without being a distinct accent color of its own. L matches
            this same bg-red treatment rather than the reference's own
            pomegranate-500 -- an explicit choice to keep L visually
            consistent with XL (which has no separate reference and never
            got its own accent color) instead of introducing a one-off
            color just for the 992-1200px range.

            Same "L follows XL" merge for the row layout/fill behavior:
            lg:w-full (matching self-stretch's own fill-available-width
            behavior at every narrower tier) and lg:flex-row both start at
            L (992px), same as the reference. The 1140px cap itself is the
            shared content-cap class, not something gated at lg: -- 1140px
            is a desktop-only (1200px+) number, so it shouldn't exist below
            that breakpoint at all (content-cap itself bakes in the xl:
            gating, same as everywhere else it's used). In practice this
            was already a no-op below ~1204px either way (w-full's own
            computed width there, viewport minus 2*32px padding, never
            actually reaches 1140px that early to be capped by it) -- but
            attaching the cap at the breakpoint it's actually FOR is the
            correct/honest way to express that, not something that should
            depend on a coincidence of the specific padding/viewport math
            happening to make the two breakpoints behave identically.
            content-cap's own margin-inline:auto centers the TV in the
            leftover space once the cap actually applies. */}
        <div className="relative flex flex-1 flex-col items-start justify-start self-stretch rounded-large bg-black-950 content-cap lg:w-full lg:flex-row">
          {/* flex-[740_740_0%] (not flex-1 + a fixed-width sibling) --
              screen and audio panel grow PROPORTIONALLY together at a
              constant 740:400 ratio as the TV's own width fluidly grows
              from 928px (at the 992px breakpoint start, minus 2*32px
              padding) up to its 1140px cap, rather than the audio panel
              staying rigid at a literal 400px while the screen alone
              absorbs the growth
              (which would drift the ratio from ~528:400 up to 740:400
              only once the cap is hit). flex-basis:0% means the 740/400
              weights are the ONLY thing determining the split -- each
              panel's own content width is ignored for sizing purposes,
              matching the classic proportional-flex pattern. */}
          <div className="flex flex-1 flex-col items-center justify-start gap-l self-stretch rounded-large p-xs outline-0 sm:p-s sm:outline sm:outline-4 sm:outline-bg-red lg:flex-[740_740_0%]">
            {/* grid + both stories stacked in the same cell (col/row-start-1),
                the inactive one `invisible` rather than unmounted -- this is
                what pins the screen's height to the TALLER of the two
                stories permanently, rather than shrinking/growing every
                time the button is clicked: a grid track sizes to the
                tallest item placed in it, including invisible ones (they
                still generate boxes and contribute to layout, just paint
                nothing and aren't focusable/reachable, which also keeps
                the hidden story's own Prev/Next button out of the tab
                order for free). */}
            <div className="grid flex-1 self-stretch overflow-hidden rounded-large bg-bg-pink p-s lg:p-l">
              {STORIES.map((story, index) => {
                const isActive = index === storyIndex;
                return (
                  // Not ScrollSection here -- this needs to fade/slide on
                  // STORYINDEX changes (a click), not on scrolling into
                  // view (the outer TV-frame ScrollSection above already
                  // covers that entrance). Both stories stay permanently
                  // mounted in the same grid cell from lg up (per the note
                  // above: this is what pins the cell's height to the
                  // taller of the two there, so the side-by-side audio
                  // panel doesn't jump around when toggling), but only the
                  // active one is ever opaque/interactive -- animate (not
                  // whileInView) drives that purely off isActive, with no
                  // scroll dependency and no entrance delay, so toggling
                  // feels immediate rather than laggy. Below lg the
                  // inactive story is display:none (hidden, not just
                  // invisible) instead -- Jo's story is much shorter than
                  // Sandy's, and pinning the stacked-layout height to
                  // whichever is taller left a large empty gap below the
                  // shorter one; removing the inactive story from the grid
                  // entirely below lg lets the box hug whichever story is
                  // actually showing. Trade-off: the toggle becomes an
                  // instant cut below lg instead of the smooth crossfade
                  // it still has from lg up, since display:none can't be
                  // transitioned. initial={false} skips animating on first
                  // mount (the very first paint should just show story 1
                  // already in place, not fade up a second time on top of
                  // the frame's own reveal).
                  <motion.div
                    key={story.title}
                    aria-hidden={!isActive}
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 24 }}
                    // opacity resolves in less than half the time y does --
                    // the incoming story reads as solid almost immediately
                    // while it's still finishing its slide up, rather than
                    // looking translucent for the whole 0.4s move.
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { opacity: { duration: 0.15, ease: 'easeOut' }, y: { duration: 0.4, ease: 'easeOut' } }
                    }
                    className={`col-start-1 row-start-1 flex-col items-start justify-start gap-m self-stretch ${
                      isActive ? 'flex' : 'pointer-events-none hidden lg:flex'
                    }`}
                  >
                    <h2
                      ref={isActive ? activeHeadingRef : null}
                      tabIndex={-1}
                      className="heading-2 self-stretch text-heading-red"
                    >
                      {story.title}
                    </h2>

                    <div className="flex flex-col items-start justify-start gap-s self-stretch">
                      {story.paragraphs.map((paragraph, i) => (
                        <p key={i} className="body-paragraph self-stretch text-body-default">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Audio player panel. Not its own fade-up -- it's part of the
              TV frame's single-unit fade above the panel doesn't animate
              separately. Full width below lg (part of the same stacked
              column as the screen there, no separate boxed panel); from
              lg up it's the 400-weighted side of the screen's
              flex-[740_740_0%] split above (lg:flex-[400_400_0%], not a
              fixed lg:w-[400px] -- see that comment for why the ratio
              needs to stay constant as the TV grows, not just land on
              400px once it hits its max width). lg:justify-between
              (rather than relying on gap-m alone) pushes the Next/Prev
              group down to the panel's own bottom edge at that width,
              matching the L reference's own layout -- below lg there's no
              extra vertical space to distribute this way in the first
              place, so gap-m is what actually governs the spacing there. */}
          <div className="flex w-full flex-col items-start justify-start gap-m self-stretch p-l lg:flex-[400_400_0%] lg:justify-between">
            <div className="flex flex-col items-start justify-center gap-m self-stretch">
              <h3 className="heading-3 self-stretch text-heading-inverted">{currentStory.playerTitle}</h3>

              <div className="flex flex-col gap-[2px] self-stretch">
                <Scrubber currentTime={currentTime} duration={duration} onSeek={seek} />
                <div className="flex items-start justify-between self-stretch">
                  <p className="body-paragraph text-body-inverted" aria-label={`Elapsed: ${formatTimeSpoken(currentTime)}`}>
                    {formatTime(currentTime)}
                  </p>
                  <p className="body-paragraph text-body-inverted" aria-label={`Duration: ${formatTimeSpoken(duration)}`}>
                    {formatTime(duration)}
                  </p>
                </div>
              </div>

              <div role="group" aria-label="Playback controls" className="flex items-center justify-between self-stretch">
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-pressed={isPlaying}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-button-primary-orange text-button-inverted transition-colors duration-150 hover:bg-capy-orange-500 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
                >
                  <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={32} />
                </button>
                <button
                  type="button"
                  onClick={() => skip(-SKIP_SECONDS)}
                  aria-label="Rewind 5 seconds"
                  className="cursor-pointer text-button-inverted transition-colors duration-150 hover:text-capy-orange-100"
                >
                  <MaterialIcon name="replay_5" size={40} />
                </button>
                <button
                  type="button"
                  onClick={() => skip(SKIP_SECONDS)}
                  aria-label="Fast-forward 5 seconds"
                  className="cursor-pointer text-button-inverted transition-colors duration-150 hover:text-capy-orange-100"
                >
                  <MaterialIcon name="forward_5" size={40} />
                </button>
                <button
                  type="button"
                  onClick={cyclePlaybackRate}
                  aria-label={`Playback speed, ${playbackRate}x, press to change`}
                  className="flex cursor-pointer flex-col items-center justify-start gap-[2px] p-2xs text-button-inverted transition-colors duration-150 hover:text-capy-orange-100"
                >
                  <span className="body-paragraph">{speedLabel}</span>
                  <span className="body-paragraph">Speed</span>
                </button>
              </div>

              <ButtonTertiary inverted innerRef={transcriptButtonRef} onClick={() => setIsTranscriptOpen(true)}>
                <MaterialIcon name="description" />
                Read transcript
              </ButtonTertiary>
            </div>

            {/* Story nav button lives here, after the audio player's own
                controls/transcript -- not back in the story-text column
                (its old spot) -- so a screen reader reaches it only once
                it's actually finished with this story's audio, not
                before. "Next"/"Prev" is now a single shared button (one
                DOM node, label swapping with storyIndex) rather than one
                per story with the inactive copy hidden, since there's no
                more per-story column for it to live inside.

                items-center centers the button (hug-width, so
                items-center is what actually moves it, not a width
                change) on both XS and S-M; lg:items-start reverts to the
                original left-aligned desktop treatment from 992px up. */}
            <div className="flex flex-col items-center justify-start gap-m self-stretch lg:items-start">
              {/* Decorative transcript-line bars: an L-only (992px+)
                  flourish -- absent from both the XS and S-M references,
                  which go straight from the Read-transcript button to the
                  Next/Prev button with nothing in between. */}
              <div className="hidden flex-col items-start justify-start gap-s self-stretch lg:flex">
                {Array.from({ length: TRANSCRIPT_LINE_COUNT }).map((_, i) => (
                  <span key={i} aria-hidden="true" className="h-1 self-stretch bg-white" />
                ))}
              </div>

              <ButtonSecondary
                inverted
                onClick={toggleStory}
                layout={!shouldReduceMotion}
                transition={{ layout: { duration: 0.3, ease: 'easeOut' } }}
                className="relative overflow-hidden"
              >
                {/* popLayout (not "wait"): "wait" keeps the exiting label
                    in normal flow until it's fully gone, so the button's
                    own layout-animated width doesn't have anything to
                    interpolate towards until that exit finishes -- it
                    just snaps the instant the swap happens. popLayout
                    pulls the exiting label out of flow (absolute)
                    immediately, so the entering label's natural size is
                    already what the button measures throughout the
                    whole transition, letting `layout` on the button
                    smoothly tween width the entire time instead of only
                    at the very end. Label itself is a plain opacity
                    crossfade, no vertical movement -- adding a y-slide on
                    top of the button's own simultaneous width tween read
                    as jumpy/uncoordinated; a subtle fade alone reads much
                    cleaner alongside it. overflow-hidden above just guards
                    against any sub-pixel overflow during the width tween. */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={storyIndex}
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
                    className="flex items-center gap-2xs whitespace-nowrap"
                  >
                    {storyIndex === 0 ? (
                      <>
                        Next: {STORIES[1].title}
                        <MaterialIcon name="chevron_right" />
                      </>
                    ) : (
                      <>
                        <MaterialIcon name="chevron_left" />
                        Prev: {STORIES[0].title}
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </ButtonSecondary>
            </div>
          </div>
        </div>

        {/* TV "stand" -- deliberately narrower than the TV body itself at
            every breakpoint (300px/480px/900px, per the XS/S-M/L
            references respectively), not a percentage of it: rounded-b
            uses the shared radius-medium token (16 base -> 20 at md/768
            -> 24 at xl/1200), which matches XS/S-M/L's own 16/20/20
            closely enough (its md threshold is 768px, not quite S-M's own
            640px start, but the same value either side of that gap) that
            hand-rolling a separate one-off breakpoint set wasn't worth
            the duplication. */}
        <div className="h-[16px] w-[300px] max-w-full rounded-b-medium bg-black-950 sm:w-[480px] lg:w-[900px]" />
      </ScrollSection>

      <TranscriptModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        subtitle={currentStory.playerTitle}
        transcript={currentStory.transcript}
        triggerRef={transcriptButtonRef}
      />
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import ScrollSection from './ScrollSection.jsx';
import { ButtonTertiary } from './Navigation.jsx';
import { MaterialIcon } from './icons.jsx';
import antenna from '../assets/Antenna.svg';
import sandyAudioSrc from '../assets/Sandy-Final-Audio.mp3';
import joAudioSrc from '../assets/Jo-Audio-Final.mp3';

const TRANSCRIPT_LINE_COUNT = 12;
const SKIP_SECONDS = 5;
// Story text starts fading up partway through the TV frame's own 0.6s
// fade (not after it fully finishes) -- a snappier cascade than waiting
// the whole duration out, since the frame is already mostly visible by
// this point.
const STORY_TEXT_DELAY = 0.3;

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
    title: '1. Beyond the Bouncy Castles',
    playerTitle: 'What Sandy said',
    audioSrc: sandyAudioSrc,
    paragraphs: [
      `Sandy watched her kids quietly sketch, wishing she could afford the art classes she didn’t have the money for, or a trip to Universal Studios. But as a single working mother in Singapore, every dollar counts. At local carnivals, her children would stare longingly at the bouncy castles, but at $50, she simply couldn’t justify the cost.`,
      `She reminded herself that food had to take priority over entertainment. Since big outings weren’t possible, during school holidays, she would treat the kids to the movies instead. Afterwards, she would use these stories to teach them valuable lessons about family love and good behavior. She couldn’t always afford luxuries like the bouncy castles, but Cindy built their confidence daily, telling them to simply “be better than yourself from yesterday”. Through it all, she made sure they thrived on love.`,
    ],
  },
  {
    title: '2. It’s Worse than School',
    playerTitle: 'What Jo said',
    audioSrc: joAudioSrc,
    paragraphs: [
      `Jo sat at his desk, wishing the clock would move faster. He didn’t like school, but student care was even worse. He hated the strict rules and how teachers ignored them to scroll on their phones while eating McDonald’s right in front of them. “I hate it!”`,
      `To escape, Jo’s mind wandered to his favourite hobbies: playing Roblox or Call of Duty. He’d even rather be studying Maths, his favourite subject, simply because he was so good at it. Anything was better than waiting in that room until 5:30 pm.`,
      `Jo survived the week by dreaming of the weekends. Even with household chores to do, he eagerly awaited his two precious hours of video games. It was his favorite part of the week, a brief window of happiness far away from his tiring daily routine.`,
    ],
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
      aria-label="Seek audio"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      aria-valuetext={formatTime(currentTime)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className="relative h-[8px] self-stretch bg-black-0"
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
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [storyIndex, setStoryIndex] = useState(0);

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
  const toggleStory = () => setStoryIndex((index) => (index === 0 ? 1 : 0));
  const currentStory = STORIES[storyIndex];

  return (
    <section
      id="section-4"
      className="relative flex w-full flex-col items-start justify-start gap-xs overflow-hidden bg-bg-red px-page-margin-x py-2xl"
    >
      {/* Not visible -- the custom UI below is the actual interface. */}
      <audio ref={audioRef} src={currentStory.audioSrc} preload="metadata" className="hidden" />

      {/* Whole TV (antenna + frame + base) fades up together as one unit,
          rather than each piece separately -- it reads as a single
          object, not a sequence of parts. */}
      <ScrollSection className="flex w-full flex-col items-center justify-start gap-2xs">
        <img src={antenna} alt="" aria-hidden="true" style={{ width: '87px', height: '88px' }} />

        {/* TV body: black frame. The pomegranate border wraps ONLY the
            screen (confirmed against the reference image -- the outline's
            rounded corner ends at the pink card's own edge, and the audio
            panel to its right is just the TV's own black bg showing
            through, no border of its own). The audio panel is a sibling
            of the outlined wrapper here, not nested inside it -- despite
            how the original spec text indented it, nesting them together
            under one flex-col wrapper would stack screen-above-panel
            instead of the side-by-side layout the reference actually
            shows. */}
        <div className="relative flex flex-1 flex-row items-start justify-start self-stretch rounded-[32px] bg-black-950">
          <div className="outline-pomegranate-500 flex flex-1 flex-col items-center justify-start gap-m self-stretch rounded-[32px] p-s outline outline-[4px]">
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
            <div className="grid flex-1 self-stretch overflow-hidden rounded-[32px] bg-bg-pink p-m">
              {STORIES.map((story, index) => {
                const isActive = index === storyIndex;
                return (
                  <ScrollSection
                    key={story.title}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: STORY_TEXT_DELAY }}
                    aria-hidden={!isActive}
                    className={`col-start-1 row-start-1 flex flex-col items-start justify-center gap-m self-stretch ${
                      isActive ? '' : 'invisible'
                    }`}
                  >
                    <h2 className="heading-2 self-stretch text-heading-red">{story.title}</h2>

                    <div className="flex flex-col items-end justify-start gap-s self-stretch">
                      {story.paragraphs.map((paragraph, i) => (
                        <p key={i} className="body-paragraph self-stretch text-body-default">
                          {paragraph}
                        </p>
                      ))}
                      <ButtonTertiary onClick={toggleStory}>
                        {index === 0 ? (
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
                      </ButtonTertiary>
                    </div>
                  </ScrollSection>
                );
              })}
            </div>
          </div>

          {/* Audio player panel. Not its own fade-up -- it's part of the
              TV frame's single-unit fade above the panel doesn't animate
              separately. */}
          <div className="flex w-[400px] flex-col items-start justify-between self-stretch p-m">
            <div className="flex flex-col items-start justify-center gap-m self-stretch">
              <h3 className="heading-3 self-stretch text-heading-inverted">{currentStory.playerTitle}</h3>

              <div className="flex flex-col gap-[2px] self-stretch">
                <Scrubber currentTime={currentTime} duration={duration} onSeek={seek} />
                <div className="flex items-start justify-between self-stretch">
                  <p className="body-paragraph text-body-inverted">{formatTime(currentTime)}</p>
                  <p className="body-paragraph text-body-inverted">{formatTime(duration)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between self-stretch">
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-pressed={isPlaying}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-button-primary-orange text-button-inverted shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
                >
                  <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={32} />
                </button>
                <button
                  type="button"
                  onClick={() => skip(-SKIP_SECONDS)}
                  aria-label="Rewind 5 seconds"
                  className="text-button-inverted"
                >
                  <MaterialIcon name="replay_5" size={40} />
                </button>
                <button
                  type="button"
                  onClick={() => skip(SKIP_SECONDS)}
                  aria-label="Fast-forward 5 seconds"
                  className="text-button-inverted"
                >
                  <MaterialIcon name="forward_5" size={40} />
                </button>
                <button
                  type="button"
                  onClick={cyclePlaybackRate}
                  aria-label={`Playback speed, ${playbackRate}x, press to change`}
                  className="flex flex-col items-center justify-start gap-[2px] p-2xs text-button-inverted"
                >
                  <span className="body-paragraph">{speedLabel}</span>
                  <span className="body-paragraph">Speed</span>
                </button>
              </div>

              <ButtonTertiary inverted>Read transcript</ButtonTertiary>
            </div>

            <div className="flex flex-col items-start justify-start gap-s self-stretch">
              {Array.from({ length: TRANSCRIPT_LINE_COUNT }).map((_, i) => (
                <span key={i} aria-hidden="true" className="h-1 self-stretch bg-white" />
              ))}
            </div>
          </div>
        </div>

        <div className="h-[16px] w-[900px] max-w-full rounded-bl-[24px] rounded-br-[24px] bg-black-950" />
      </ScrollSection>
    </section>
  );
}

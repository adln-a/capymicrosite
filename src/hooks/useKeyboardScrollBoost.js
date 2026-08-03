import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

// Default browser arrow-key scrolling moves the page by a small fixed
// amount (~40px in most browsers) -- a minor inconvenience on an ordinary
// keyboard, but a real cost multiplier for anyone using a switch device,
// eye-gaze keyboard, or other input where every keystroke takes real
// effort. This site also has several "pinned" scroll-driven sections
// (2, 8, 11, 16) that are 2-3x the viewport's own height so their
// animation has room to play out -- at the browser default, clearing just
// one of those could take 60+ individual arrow-key presses. Boosting each
// press to roughly a third of the viewport (Page Down/Space already move a
// full viewport and are left untouched) cuts that down several times over
// without making arrow-key scrolling feel like paging.
const JUMP_FRACTION = 0.3;

function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Boosts ArrowUp/ArrowDown's scroll distance site-wide. Skips entirely
 * when: the key was already handled by something else -- any component
 * that calls preventDefault() on its own ArrowUp/Down handling (e.g.
 * Section 4's audio scrubber, which reuses those keys as seek shortcuts)
 * runs first, since React's own delegated listeners fire before this
 * plain `document` listener during the bubble phase -- or focus is on a
 * text input/textarea/select/contenteditable, where arrow keys need their
 * native cursor-movement behavior instead.
 */
export default function useKeyboardScrollBoost() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      if (event.defaultPrevented) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      const distance = window.innerHeight * JUMP_FRACTION;
      window.scrollBy({
        top: event.key === 'ArrowDown' ? distance : -distance,
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shouldReduceMotion]);
}

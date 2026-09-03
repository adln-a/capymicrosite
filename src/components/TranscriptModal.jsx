import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CARD_SHADOW, CloseButton } from './Navigation.jsx';

// Real transcript content hasn't been written yet for any of the audio
// clips this opens for -- this is the same literal placeholder sentence
// (repeated) as the reference export, used as the default whenever a
// caller doesn't pass its own `transcript` text.
const PLACEHOLDER_SENTENCE = 'This is a placeholder text for the transcript. ';
const PLACEHOLDER_TRANSCRIPT = PLACEHOLDER_SENTENCE.repeat(19).trim();

/**
 * Full-page transcript reader, opened from a "Read transcript" button
 * elsewhere (Section 4's TV, Section 12's quote cards). Portaled to
 * document.body -- both call sites render this from inside <main>, and
 * `inert` (below) needs to disable the REST of the page (both <main>
 * and the separate <Navigation> sibling) without disabling the modal
 * itself, which a same-subtree inert toggle can't do.
 *
 * `triggerRef` is the specific "Read transcript" button that opened
 * this instance -- focus returns there on close, not just to some
 * generic anchor, since Section 4 and Section 12 each have their own
 * trigger and their own modal instance.
 */
export default function TranscriptModal({ isOpen, onClose, subtitle, transcript = PLACEHOLDER_TRANSCRIPT, triggerRef }) {
  const headingId = useId();
  const closeRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const transcriptRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  // Guards the focus-restore branch below against firing on a fresh mount
  // -- Section 12's QuoteCard remounts a brand-new TranscriptModal
  // instance (isOpen starting false) every time its own key changes
  // (activeSet), and without this guard that mount's own effect took the
  // `else` branch and yanked focus onto "Read transcript" even though the
  // modal was never opened this time around, stealing focus from whatever
  // the user had just clicked (e.g. Section 12's own Next/Prev arrows).
  const hasOpenedRef = useRef(false);

  // Focus the close button the instant this opens; hand focus back to
  // whatever button opened it once closed -- same pattern as the nav
  // panel's own open/close focus handling. Only ever restores focus on a
  // genuine open-then-close transition (hasOpenedRef only becomes true
  // once isOpen has actually been true), never on initial mount.
  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      closeRef.current?.focus();
    } else if (hasOpenedRef.current) {
      triggerRef?.current?.focus();
    }
  }, [isOpen, triggerRef]);

  // `#root` holds both <Navigation> and <main> (see main.jsx) -- inerting
  // it disables the entire rest of the page in one shot, including the
  // nav bar/hamburger toggle, which is a sibling of <main> and wouldn't
  // be covered by inerting <main> alone. Safe specifically because this
  // modal is portaled to document.body, outside of #root.
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return undefined;
    if (isOpen) {
      root.setAttribute('inert', '');
    } else {
      root.removeAttribute('inert');
    }
    return () => root.removeAttribute('inert');
  }, [isOpen]);

  // Four focusable stops in this dialog -- close button, heading,
  // subtitle, transcript body -- cycled in that order so each piece of
  // content gets its own Tab stop and is announced on its own, instead of
  // the close button's only alternative being one big tabIndex=0 wrapper
  // around all three (heading/subtitle/transcript together), which read
  // as a single group in one shot rather than three separate stops.
  // subtitleRef drops out of `stops` on its own (via the .filter(Boolean)
  // below) whenever no subtitle was passed, since its <h3> then never
  // renders and the ref never attaches.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      event.preventDefault();
      const stops = [closeRef.current, headingRef.current, subtitleRef.current, transcriptRef.current].filter(Boolean);
      if (stops.length === 0) return;
      const currentIndex = stops.indexOf(document.activeElement);
      const delta = event.shiftKey ? -1 : 1;
      const nextIndex = (currentIndex + delta + stops.length) % stops.length;
      stops[nextIndex]?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Swipe-navigation loop-back guard -- same gap as the nav panel's own
  // trap-end guard (see its comment in Navigation.jsx for the full
  // reasoning): the keydown trap above only catches a physical `Tab`
  // keypress, so VoiceOver's swipe-forward gesture past the transcript
  // body (the last of the three content stops) isn't caught by it at all.
  // An earlier onFocus-driven redirect confirmed working on VoiceOver but
  // not Android TalkBack (whose swipe cursor doesn't move real DOM focus,
  // only explicit double-tap activation does) -- and even on VoiceOver/
  // keyboard, redirecting instantly on focus meant the button's own
  // sr-only/focus:not-sr-only "become visible" state never had a chance
  // to actually show. Fixed the same way: a real onClick below, calling
  // the same close handler the visible Close button uses, so any AT's
  // swipe-then-activate (or a sighted keyboard user's Tab-then-Enter)
  // reaches it via a real click, not a focus event.

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-bg-linen-dark"
        >
          <CloseButton innerRef={closeRef} onClick={onClose} label="Close transcript" className="fixed right-page-margin-x top-l z-10" />

          <div className="h-full w-full overflow-y-auto px-page-margin-x py-2xl">
            {/* content-cap: without it, the transcript paragraph stretched
                to the full viewport width at wide screens, producing
                uncomfortably long reading lines -- same site-wide desktop
                cap as everywhere else. margin-inline:auto centers it fine
                here despite the parent not being a flex container -- it's
                a plain block box, and auto margins center block boxes
                regardless of the parent's own display type. */}
            <div className="flex w-full flex-col items-start justify-start gap-s content-cap">
              {/* tabIndex=0 on each of these three (rather than one
                  tabIndex=0 wrapper around all of them, the previous
                  approach): each becomes its own Tab stop -- see the
                  keydown handler's own comment above -- and focusing an
                  element inside a scrollable ancestor already brings it
                  into view natively, so the transcript body stays
                  reachable/scrollable via Tab without a dedicated
                  scroll-container stop. */}
              <h2 id={headingId} ref={headingRef} tabIndex={0} className="heading-2 self-stretch text-heading-default">
                Transcript
              </h2>
              {subtitle && (
                <h3 ref={subtitleRef} tabIndex={0} className="heading-3 self-stretch text-heading-default">
                  {subtitle}
                </h3>
              )}
              <p ref={transcriptRef} tabIndex={0} className="body-paragraph whitespace-pre-line self-stretch text-body-default">
                {transcript}
              </p>
              {/* Trap-end guard -- own comment further up, right after the
                  keydown Tab trap. Real text content, not empty -- an
                  empty, unlabeled focusable element is a known Safari/
                  VoiceOver gap where swipe can skip straight past it
                  without ever landing focus there, which would silently
                  defeat the guard. sr-only/focus:not-sr-only (matching the
                  page's own "Skip to content" link, App.jsx) so it's also
                  a real, visible button for sighted keyboard-only users
                  who tab to it. */}
              <button
                type="button"
                tabIndex={0}
                onClick={onClose}
                className={`sr-only focus:not-sr-only button-default focus:inline-flex focus:cursor-pointer focus:items-center focus:gap-2xs focus:rounded-large focus:bg-button-primary-orange focus:px-m focus:py-s focus:text-button-inverted ${CARD_SHADOW}`}
              >
                Close transcript
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CloseButton } from './Navigation.jsx';

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
  const contentRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Focus the close button the instant this opens; hand focus back to
  // whatever button opened it once closed -- same pattern as the nav
  // panel's own open/close focus handling.
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    } else {
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

  // Two focusable stops in this dialog -- the close button and the
  // scrollable content region (tabIndex=0 below) -- so keyboard users can
  // Tab into the transcript body itself (to scroll/read it with arrow
  // keys/Page Down, same as a screen reader's virtual cursor already
  // could) and then Tab again to loop back to the close button, instead
  // of Tab always snapping back to the close button and skipping the
  // content entirely.
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
      const stops = [closeRef.current, contentRef.current].filter(Boolean);
      if (stops.length === 0) return;
      const currentIndex = stops.indexOf(document.activeElement);
      const delta = event.shiftKey ? -1 : 1;
      const nextIndex = (currentIndex + delta + stops.length) % stops.length;
      stops[nextIndex]?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

          <div ref={contentRef} tabIndex={0} className="h-full w-full overflow-y-auto px-page-margin-x py-2xl">
            <div className="flex w-full flex-col items-start justify-start gap-s">
              <h2 id={headingId} className="heading-2 self-stretch text-heading-default">
                Transcript
              </h2>
              {subtitle && <h3 className="heading-3 self-stretch text-heading-default">{subtitle}</h3>}
              <p className="body-paragraph self-stretch text-body-default">{transcript}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

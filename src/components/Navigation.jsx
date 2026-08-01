import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import bgNavActive from '../assets/BG--Nav-Active.svg';
import desktopNav from '../assets/Desktop-Nav.svg';
import { DownloadIcon, MaterialIcon } from './icons.jsx';

const DOWNLOAD_LABEL = 'Download our design guide';

function DownloadButtonContent() {
  return (
    <>
      {DOWNLOAD_LABEL}
      <DownloadIcon />
    </>
  );
}

const CARD_SHADOW = 'shadow-[0_8px_16px_rgba(0,0,0,0.08)]';

// Active NavLink's own outline is invisible: its marker image is an
// absolutely-positioned descendant, and an element's outline always
// paints below its own positioned descendants regardless of the
// descendant's z-index (a CSS stacking rule, not something fixable by
// re-ordering the image). This redraws the same ring as a real ::after
// box instead -- z-20 puts it above both the marker (auto/0) and the
// label (z-10). No border-radius: the anchor itself has none (the green
// shape is a decorative image, not a CSS radius), and every other focus
// ring on the site is the browser's plain outline, which follows
// whatever radius the focused element actually has -- none here too.
const ACTIVE_LINK_FOCUS_RING =
  "focus-visible:outline-none after:pointer-events-none after:absolute after:inset-0 after:z-20 after:opacity-0 after:content-[''] focus-visible:after:opacity-100 after:outline after:outline-2 after:outline-offset-2 after:outline-primary-teal";

/**
 * Either nav item, active or default. Active treatment: BG--Nav-Active.svg
 * absolutely positioned behind the text, text at position:relative with
 * z-index to stay on top (see the layout-independence note below), and
 * aria-current="location" -- "location" rather than "page" because this is
 * a same-page scroll-position indicator (which section you've scrolled to),
 * not a link to a different page. Default treatment: plain nav-default
 * text, no shape, and no aria-current attribute at all (omitted entirely,
 * not set to a falsy value, since its mere presence signals "current" to
 * assistive tech regardless of value).
 *
 * The image is `absolute` (not a grid/flex participant), so it never
 * influences the <a>'s size -- the pill sizes to the label text plus its
 * padding only, regardless of the image's own dimensions. Centered behind
 * the text via the left/top-50%-plus-negative-translate trick, which needs
 * no knowledge of the image's size. `max-w-none` guards against Tailwind
 * preflight's `img { max-width: 100% }`, which would otherwise clamp the
 * image below its natural width against the (text-sized, and therefore
 * possibly narrower) containing block. `z-10` on the text is a plain
 * positive z-index against the image's default `auto` -- positive always
 * paints after auto within the same containing block, so this doesn't need
 * a negative-z-index-plus-stacking-context dance.
 *
 * activeMarkerSrc/activeColorClassName/defaultColorClassName default to the
 * header's own light-background treatment (solid pill + dark text); Footer
 * overrides all three to reuse this same active/default logic against its
 * dark green background with its own outline-scribble marker asset.
 */
export function NavLink({
  href,
  label,
  isActive,
  innerRef,
  className = '',
  activeMarkerSrc = bgNavActive,
  activeColorClassName = 'text-heading-default',
  defaultColorClassName = 'text-body-default',
}) {
  if (isActive) {
    return (
      <a
        ref={innerRef}
        href={href}
        aria-current="location"
        className={`nav-active relative inline-flex items-center p-xs ${activeColorClassName} ${className} ${ACTIVE_LINK_FOCUS_RING}`}
      >
        <img
          src={activeMarkerSrc}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-auto w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
        />
        <span className="relative z-10">{label}</span>
      </a>
    );
  }

  return (
    <a ref={innerRef} href={href} className={`nav-default inline-flex items-center p-xs ${defaultColorClassName} ${className}`}>
      {label}
    </a>
  );
}

export function DownloadButton({ innerRef, className = '' }) {
  return (
    <button
      ref={innerRef}
      type="button"
      className={`button-default inline-flex items-center gap-2xs rounded-large bg-button-primary-orange px-m py-s text-button-inverted ${CARD_SHADOW} ${className}`}
    >
      <DownloadButtonContent />
    </button>
  );
}

/**
 * Same padding/radius/font spec as DownloadButton above (button-default,
 * gap-2xs, rounded-large, px-m py-s), but bg-transparent with no shadow --
 * a ghost/tertiary button for secondary in-content actions (e.g. "Next:
 * ..." / "Read transcript" in Section 4) rather than the primary CTA.
 * `inverted` switches text color from orange (the default, for use on
 * light backgrounds) to white (for use on dark backgrounds).
 */
export function ButtonTertiary({ children, innerRef, className = '', inverted = false, type = 'button', ...props }) {
  return (
    <button
      ref={innerRef}
      type={type}
      className={`button-default inline-flex items-center gap-2xs rounded-large bg-transparent px-m py-s ${inverted ? 'text-button-inverted' : 'text-button-primary-orange'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Same padding/radius/font spec as ButtonTertiary above, plus a 1px
 * border in the same color as the text (border-button-primary-orange +
 * text-button-primary-orange by default, border-button-inverted +
 * text-button-inverted white on white when `inverted`) -- an outlined
 * secondary button, distinct from ButtonTertiary's borderless ghost
 * style.
 */
export function ButtonSecondary({ children, innerRef, className = '', inverted = false, type = 'button', ...props }) {
  return (
    <button
      ref={innerRef}
      type={type}
      className={`button-default inline-flex items-center gap-2xs rounded-large border bg-transparent px-m py-s ${
        inverted ? 'border-button-inverted text-button-inverted' : 'border-button-primary-orange text-button-primary-orange'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Invisible twin of the Download button, kept in the DOM purely so the
 * center pill stays visually centered in the bar (a "ghost" flex item
 * balancing the real button on the other side) — a Figma auto-layout trick,
 * not a real control. Built with the same padding/content as the real
 * button so its width naturally matches; the 259px Figma measurement is
 * additionally pinned as an explicit width so a few px of font-metric drift
 * (e.g. before Satoshi finishes loading) can't throw off the centering.
 */
function NavSpacer() {
  return (
    <div
      aria-hidden="true"
      className="button-default pointer-events-none inline-flex items-center gap-2xs rounded-large px-m py-s opacity-0"
      style={{ width: '259px' }}
    >
      <DownloadButtonContent />
    </div>
  );
}

export default function Navigation({ sentinelRef, mainRef, activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sentinelVisible, setSentinelVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const homeRef = useRef(null);
  const contactRef = useRef(null);
  const downloadRef = useRef(null);

  // Collapse trigger: a zero-height sentinel div (rendered by Section 1,
  // right at the top of its content) is the only thing this observer
  // watches -- not Section 1's own full height. Full bar shows while the
  // sentinel is visible; the instant it scrolls out of the viewport
  // (either direction), it flips to the toggle. Decoupling from Section 1's
  // own height means the collapse point no longer depends on how tall
  // Section 1 (or whatever precedes it) happens to be.
  useEffect(() => {
    const target = sentinelRef?.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(([entry]) => setSentinelVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [sentinelRef]);

  const close = useCallback(() => {
    setIsOpen(false);
    toggleRef.current?.focus();
  }, []);

  const handleToggleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Focus moves to the toggle button itself (now in its "close" state) the
  // instant the panel opens. A plain click already focuses the button in
  // most browsers, but Safari doesn't focus <button> on click by default, so
  // this effect makes the behavior consistent everywhere.
  useEffect(() => {
    if (isOpen) {
      toggleRef.current?.focus();
    }
  }, [isOpen]);

  // `inert` removes the rest of the page from both the accessibility tree
  // and the tab order in one go, so background content can't be reached
  // while the panel is open (covers spec item 8; aria-hidden alone would
  // only handle the accessibility-tree half).
  useEffect(() => {
    const node = mainRef?.current;
    if (!node) return undefined;
    if (isOpen) {
      node.setAttribute('inert', '');
    } else {
      node.removeAttribute('inert');
    }
    return () => node.removeAttribute('inert');
  }, [isOpen, mainRef]);

  // Manual focus trap. Tab order is: toggle (close) -> Home -> Contact us ->
  // Download. `inert` already keeps focus from leaving into page content,
  // but it doesn't make the trap loop -- that's what this does: only the
  // two boundary elements need explicit handling, since native Tab order
  // already moves correctly between the four elements in between.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== 'Tab') return;

      const first = toggleRef.current;
      const last = downloadRef.current;

      if (event.shiftKey && document.activeElement === first) {
        // Shift+Tab from the first stop loops back around to the last.
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        // Tab from the last stop loops back around to the first.
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Clicking anywhere outside the panel (and outside the toggle, which has
  // its own click handler) closes the panel the same way Escape does.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (panelRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      close();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, close]);

  // Mutually exclusive by construction, not by styling: full bar and toggle
  // are two branches of one conditional, so only one is ever in the DOM.
  // showFullBar also checks !isOpen (not just sentinelVisible) -- if the
  // user scrolls back up while the panel is still open, the panel (a fixed
  // inset-0 overlay) covers everything anyway, and the toggle needs to stay
  // mounted regardless of scroll position since it's the panel's own close
  // control and first focus-trap stop.
  const showFullBar = sentinelVisible && !isOpen;

  return (
    <div className="hidden xl:block">
      {showFullBar ? (
        // `absolute`, not `fixed` -- it needs to scroll away WITH Section 1's
        // content (not stay pinned to the viewport) as the user scrolls, and
        // only the collapsed toggle below should be `fixed`. With no
        // positioned/fixed ancestor between this and the document root, an
        // absolutely positioned element is placed relative to the page and
        // scrolls normally; only `position: fixed` would pin it in place.
        <div className="absolute inset-x-0 top-l z-30 h-14">
          <div className="relative flex h-full w-full items-center justify-between rounded-large px-page-margin-x">
            <NavSpacer />

            <nav aria-label="Primary">
              <ul
                className={`flex items-center gap-4xl rounded-large bg-bg-linen-light px-m py-xs ${CARD_SHADOW}`}
              >
                <li>
                  <NavLink href="#section-1" label="Home" isActive={activeSection === 'home'} />
                </li>
                <li>
                  <NavLink href="#contact" label="Contact us" isActive={activeSection === 'contact'} />
                </li>
              </ul>
            </nav>

            <DownloadButton />
          </div>
        </div>
      ) : (
        // Wrapped in the same px-page-margin-x inset as the full bar (rather
        // than a separate right-only margin) so the toggle's right edge
        // lines up with the Download button's right edge above it.
        <div className="fixed inset-x-0 top-l z-50 h-14">
          <div className="flex h-full w-full items-center justify-end px-page-margin-x">
            <button
              ref={toggleRef}
              type="button"
              onClick={handleToggleClick}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-button-primary-orange text-button-inverted shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            >
              {isOpen ? <MaterialIcon name="close" size={32} /> : <MaterialIcon name="menu" size={32} />}
            </button>
          </div>
        </div>
      )}

      {/* Hugs its own content (logo + links + button) rather than covering
          the full viewport, per the reference -- page content stays
          visible peeking below the shadow. That's safe precisely because
          `inert` (above) already pulls the rest of the page out of both
          the tab order and the accessibility tree the moment this is
          open; a sighted user can see it, but nothing below is reachable
          or announced, so it can't be mistaken for interactive content. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={shouldReduceMotion ? false : { y: '-100%' }}
            animate={{ y: 0 }}
            exit={shouldReduceMotion ? undefined : { y: '-100%' }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-x-0 top-0 z-40 flex items-end justify-center gap-xl bg-bg-linen-light px-page-margin-x py-xl shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
          >
            <img src={desktopNav} alt="" aria-hidden="true" className="pointer-events-none h-auto w-[198px] flex-shrink-0" />

            <div className="flex flex-col items-center justify-start gap-xl">
              <NavLink href="#section-1" label="Home" isActive={activeSection === 'home'} innerRef={homeRef} />
              <NavLink href="#contact" label="Contact us" isActive={activeSection === 'contact'} innerRef={contactRef} />
              <DownloadButton innerRef={downloadRef} />
            </div>

            {/* Invisible twin of the image, same trick as NavSpacer above --
                balances the image on the other side of the links column so
                justify-center on the row centers the LINKS on the panel's
                true center, rather than centering the image+links group as
                one block (which would push the links right of center by
                roughly half the image's own width). */}
            <div aria-hidden="true" className="pointer-events-none w-[198px] flex-shrink-0 opacity-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

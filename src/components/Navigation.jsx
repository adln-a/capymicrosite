import { useCallback, useEffect, useRef, useState } from 'react';
import bgNavActive from '../assets/BG--Nav-Active.svg';
import desktopNav from '../assets/Desktop-Nav.svg';
import { CloseIcon, DownloadIcon, HamburgerIcon } from './icons.jsx';

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
 */
function NavLink({ href, label, isActive, innerRef, className = '' }) {
  if (isActive) {
    return (
      <a
        ref={innerRef}
        href={href}
        aria-current="location"
        className={`nav-active relative inline-flex items-center p-xs text-heading-default ${className}`}
      >
        <img
          src={bgNavActive}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-auto w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
        />
        <span className="relative z-10">{label}</span>
      </a>
    );
  }

  return (
    <a ref={innerRef} href={href} className={`nav-default inline-flex items-center p-xs text-body-default ${className}`}>
      {label}
    </a>
  );
}

function DownloadButton({ innerRef, className = '' }) {
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

// Collapses the effective viewport (for intersection purposes only) down to
// a zero-height line at vertical center: -50% off the top and -50% off the
// bottom leaves nothing in between. A section only "intersects" this sliver
// while the viewport's own center line is somewhere inside it, so the
// active link switches exactly when a section crosses viewport-center --
// not the instant its top edge appears, and not tied to a specific pixel
// value that would need retuning if section heights change.
const SCROLLSPY_ROOT_MARGIN = '-50% 0px -50% 0px';

export default function Navigation({ heroRef, sentinelRef, contactSectionRef, mainRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sentinelVisible, setSentinelVisible] = useState(true);
  const [activeSection, setActiveSection] = useState('home');

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

  // Scrollspy: separate from the observer above (that one only cares
  // whether Section 1 is visible at all; this one tracks which section
  // currently owns the viewport's center, independent of the nav bar's own
  // collapse state). One observer watches every nav-linked section at once
  // -- entries only report the sections whose crossing state just changed,
  // so whichever one just started intersecting the centerline becomes
  // active.
  useEffect(() => {
    const sections = [
      { key: 'home', ref: heroRef },
      { key: 'contact', ref: contactSectionRef },
    ].filter((section) => section.ref?.current);

    if (sections.length === 0) return undefined;

    const keyByElement = new Map(sections.map((section) => [section.ref.current, section.key]));

    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.find((entry) => entry.isIntersecting);
        if (entered) {
          setActiveSection(keyByElement.get(entered.target));
        }
      },
      { rootMargin: SCROLLSPY_ROOT_MARGIN, threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section.ref.current));
    return () => observer.disconnect();
  }, [heroRef, contactSectionRef]);

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
              className="flex h-14 w-14 items-center justify-center rounded-full bg-button-primary-orange text-button-inverted"
            >
              {isOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          ref={panelRef}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-xl bg-bg-linen-light px-page-margin-x py-xl xl:gap-2xl"
        >
          <NavLink href="#section-1" label="Home" isActive={activeSection === 'home'} innerRef={homeRef} />
          <NavLink href="#contact" label="Contact us" isActive={activeSection === 'contact'} innerRef={contactRef} />
          <DownloadButton innerRef={downloadRef} />

          <img
            src={desktopNav}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-xl left-xl w-40"
          />
        </div>
      )}
    </div>
  );
}

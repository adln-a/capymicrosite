import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import bgNavActive from '../assets/BG--Nav-Active.svg';
import desktopNav from '../assets/Desktop-Nav.svg';
import { DownloadIcon, MaterialIcon } from './icons.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';

const DOWNLOAD_LABEL = 'Download our design guide';
// External link (a Google Drive share link via a shortener, not a file
// bundled into this repo) -- see DownloadButton's own comment below for
// why it opens in a new tab.
const DESIGN_GUIDE_URL = 'https://shorturl.at/C4lfv';

function DownloadButtonContent() {
  return (
    <>
      {DOWNLOAD_LABEL}
      <DownloadIcon />
    </>
  );
}

// Exported (not just a private constant) so any component can opt into this
// same drop shadow via className, rather than it being baked unconditionally
// into a specific button -- ButtonPrimary itself doesn't carry a shadow by
// default; DownloadButton (below) opts in explicitly since the nav bar's
// own design wants it, while other ButtonPrimary instances (e.g. Section 8's
// "Return to the beginning") don't.
export const CARD_SHADOW = 'shadow-[0_8px_16px_rgba(0,0,0,0.08)]';

/**
 * Plain circular close action -- 56px orange circle + 32px white X.
 * Reused by both the hamburger toggle's own "open" state (below) and
 * other dismissible surfaces (e.g. TranscriptModal), so there's exactly
 * one place defining what "the close button" looks like. `...rest`
 * covers the toggle's own extra need for `aria-expanded`, which a
 * plain standalone close action otherwise has no reason to carry.
 */
export function CloseButton({ onClick, innerRef, label = 'Close', className = '', ...rest }) {
  return (
    <button
      ref={innerRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-button-primary-orange text-button-inverted transition-colors duration-150 hover:bg-capy-orange-500 ${CARD_SHADOW} ${className}`}
      {...rest}
    >
      <MaterialIcon name="close" size={32} />
    </button>
  );
}

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
  activeColorClassName = 'text-heading-default hover:text-black-950',
  defaultColorClassName = 'text-body-default hover:text-black-950',
}) {
  if (isActive) {
    return (
      <a
        ref={innerRef}
        href={href}
        aria-current="location"
        className={`nav-active relative inline-flex cursor-pointer items-center p-xs transition-colors duration-150 ${activeColorClassName} ${className} ${ACTIVE_LINK_FOCUS_RING}`}
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
    <a ref={innerRef} href={href} className={`nav-default inline-flex cursor-pointer items-center p-xs transition-colors duration-150 ${defaultColorClassName} ${className}`}>
      {label}
    </a>
  );
}

/**
 * `inverted` swaps the primary button's own bg/text pairing: orange bg +
 * white text by default, white bg + orange text when true -- for use on
 * a background where the orange doesn't have enough contrast to sit
 * directly on (e.g. Section 8's "Return to the beginning" button, on
 * bg-bg-lightest-blue: capy-orange-a11y as plain text there only reaches
 * ~3.3:1, but as text on this button's own white surface it's back to a
 * clean 4.52:1, since the white pill isolates it from whatever's behind
 * the button). Hover darkens/tints the bg one step further in whichever
 * direction it already leans -- orange bg -> a more saturated orange
 * (capy-orange-500), white bg -> a faint orange tint (capy-orange-50) --
 * rather than changing the text color, since primary buttons' whole
 * visual weight IS their filled background.
 */
// Renders as a real <a> when `href` is passed (e.g. DownloadButton below)
// instead of a <button> -- this actually navigates the user away from the
// site, so it needs anchor semantics (Enter-to-follow, right-click "open
// in new tab", status-bar preview, etc.), not a button with a JS-driven
// navigation side effect.
export function ButtonPrimary({ children, innerRef, className = '', inverted = false, type = 'button', href, ...props }) {
  const sharedClassName = `button-default inline-flex cursor-pointer items-center gap-2xs rounded-large px-m py-s transition-colors duration-150 ${
    inverted
      ? 'bg-bg-white text-button-primary-orange hover:bg-capy-orange-50'
      : 'bg-button-primary-orange text-button-inverted hover:bg-capy-orange-500'
  } ${className}`;

  if (href) {
    return (
      <a ref={innerRef} href={href} className={sharedClassName} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button ref={innerRef} type={type} className={sharedClassName} {...props}>
      {children}
    </button>
  );
}

/**
 * Pre-configured ButtonPrimary carrying the fixed "Download" label + icon
 * and pointed at DESIGN_GUIDE_URL. target="_blank" + rel="noopener
 * noreferrer" because this is a real external link, not an in-app action:
 * noopener stops the opened tab from getting a `window.opener` handle
 * back to this site (the standard cross-origin-tab-nav hardening), and
 * noreferrer additionally withholds the Referer header from the request.
 */
export function DownloadButton({ innerRef, className = '', inverted = false }) {
  return (
    <ButtonPrimary
      innerRef={innerRef}
      className={`${CARD_SHADOW} ${className}`}
      inverted={inverted}
      href={DESIGN_GUIDE_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <DownloadButtonContent />
    </ButtonPrimary>
  );
}

/**
 * Same padding/radius/font spec as DownloadButton above (button-default,
 * gap-2xs, rounded-large, px-m py-s), but bg-transparent with no shadow --
 * a ghost/tertiary button for secondary in-content actions (e.g. "Next:
 * ..." / "Read transcript" in Section 4) rather than the primary CTA.
 * `inverted` switches text color from orange (the default, for use on
 * light backgrounds) to white (for use on dark backgrounds). Hover
 * shifts the text one step further in whichever direction it already
 * leans -- white -> capy-orange-100 (same shade the white nav links and
 * the audio player's white icon buttons hover to, for consistency),
 * orange -> capy-orange-500, same as ButtonSecondary/DownloadButton's
 * orange-side hover -- just applied to text only here since there's no
 * bg/border of its own to shift.
 */
export function ButtonTertiary({ children, innerRef, className = '', inverted = false, type = 'button', ...props }) {
  return (
    <button
      ref={innerRef}
      type={type}
      className={`button-default inline-flex cursor-pointer items-center gap-2xs rounded-large bg-transparent px-m py-s transition-colors duration-150 ${
        inverted ? 'text-button-inverted hover:text-capy-orange-100' : 'text-button-primary-orange hover:text-capy-orange-500'
      } ${className}`}
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
 * style. Hover shifts border + text together, same capy-orange-50/
 * capy-orange-500 pairing as the other two shared buttons.
 *
 * `layout` (opt-in, off by default) renders as motion.button with
 * Framer Motion's layout animation enabled -- for callers whose own
 * content changes size (e.g. Section 4's Next/Prev label swapping
 * between differently-long strings), this smoothly animates the
 * button's own width/height to match instead of snapping instantly.
 * Callers own the prefers-reduced-motion decision themselves (pass
 * `layout={!shouldReduceMotion}`), same as everywhere else in this
 * codebase that checks it explicitly rather than through a global
 * MotionConfig.
 */
export function ButtonSecondary({
  children,
  innerRef,
  className = '',
  inverted = false,
  type = 'button',
  layout = false,
  transition,
  ...props
}) {
  const Comp = layout ? motion.button : 'button';
  return (
    <Comp
      ref={innerRef}
      type={type}
      layout={layout || undefined}
      // Only a real prop on motion.button -- destructured out above so it
      // never leaks onto a plain <button> (an invalid DOM attribute,
      // React would warn) when layout is off.
      transition={layout ? transition : undefined}
      className={`button-default inline-flex cursor-pointer items-center gap-2xs rounded-large border bg-transparent px-m py-s transition-colors duration-150 ${
        inverted
          ? 'border-button-inverted text-button-inverted hover:border-capy-orange-50 hover:text-capy-orange-50'
          : 'border-button-primary-orange text-button-primary-orange hover:border-capy-orange-500 hover:text-capy-orange-500'
      } ${className}`}
      {...props}
    >
      {children}
    </Comp>
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

// L (992px, matches the `lg` breakpoint used elsewhere) and up -- L
// follows XL here, same as it does for the rest of the site's layout --
// keep the scroll-collapsing full bar; below that (S/M only) the nav
// defaults to the hamburger permanently, full stop -- no scroll involved
// at all, see isLargeScreen's use in showFullBar below.
const LARGE_SCREEN_QUERY = '(min-width: 992px)';

export default function Navigation({ sentinelRef, contentRef, skipLinkRef, activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sentinelVisible, setSentinelVisible] = useState(true);
  // S (<640px) gets its own full-screen panel layout below -- everything
  // M and up keeps the existing hug-content row unchanged.
  const isAtLeastSm = useMediaQuery('(min-width: 640px)');
  // Function initializer so the very first render (before any effect runs)
  // already reflects the real viewport instead of defaulting to one branch
  // and visibly flipping right after mount. `typeof window` guard is the
  // usual SSR/no-DOM safety net, even though this app is client-rendered.
  const [isLargeScreen, setIsLargeScreen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(LARGE_SCREEN_QUERY).matches,
  );
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

  // Keeps isLargeScreen in sync as the viewport crosses 992px in either
  // direction (window resize, device rotation, etc.) -- a MediaQueryList
  // 'change' listener rather than a 'resize' listener, so this only fires
  // right at the breakpoint crossing instead of on every pixel of drag.
  useEffect(() => {
    const mql = window.matchMedia(LARGE_SCREEN_QUERY);
    const handleChange = (event) => setIsLargeScreen(event.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

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
  //
  // contentRef (not mainRef, which this used to take): <main> and
  // <Footer> are separate siblings in App.jsx, so inerting <main> alone
  // left Footer fully reachable to VoiceOver/keyboard while the panel
  // was open -- confirmed live, Footer's own links and content were
  // still swipeable even though the panel was supposed to isolate
  // everything behind it. contentRef is a single wrapper App.jsx puts
  // around both, so one inert toggle here now actually covers both.
  //
  // skipLinkRef is inert'd the same way, for the same reason: it's a
  // separate sibling too (has to render before Navigation in the DOM, so
  // it's the page's very first tab stop when the panel is closed), and
  // was the last piece of "content behind the panel" still reachable.
  // That mattered more than it looks: swiping past the panel's last item
  // and running out of reachable content sends VoiceOver back to the
  // first reachable item on the page -- with the skip link still live,
  // that was this link, not the panel's own close button, no matter how
  // the panel's own internal trap was wired.
  useEffect(() => {
    const node = contentRef?.current;
    const skipLink = skipLinkRef?.current;
    if (isOpen) {
      node?.setAttribute('inert', '');
      skipLink?.setAttribute('inert', '');
    } else {
      node?.removeAttribute('inert');
      skipLink?.removeAttribute('inert');
    }
    return () => {
      node?.removeAttribute('inert');
      skipLink?.removeAttribute('inert');
    };
  }, [isOpen, contentRef, skipLinkRef]);

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

  // Swipe-navigation loop-back guard. The keydown trap above only catches
  // a physical `Tab` keypress -- VoiceOver's swipe-forward gesture moves
  // focus without ever dispatching a `Tab` keydown, so that trap alone
  // does nothing for swipe users (the originally reported bug). A first
  // attempt at fixing this listened for `focusout` on Download and
  // inspected `event.relatedTarget` to detect focus leaving the panel --
  // that turned out to be unreliable with real VoiceOver: Safari doesn't
  // consistently populate relatedTarget for AT-driven (as opposed to
  // pointer/keyboard-driven) focus changes, so the check silently never
  // fired. handleTrapEnd instead backs a real, focusable "guard" element
  // rendered immediately after Download in the DOM (below) -- whatever
  // moves focus there (Tab, swipe, anything), onFocus fires unconditionally
  // and redirects to the close button. No relatedTarget inspection, so
  // nothing to be unreliable about.
  const handleTrapEnd = useCallback(() => {
    toggleRef.current?.focus();
  }, []);

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
  // control and first focus-trap stop. isLargeScreen gates the whole thing
  // on top of that: below 992px (S/M only) this is false no matter what
  // sentinelVisible says, so those breakpoints always fall through to the
  // hamburger branch -- there's no scroll-triggered collapse to show off
  // there in the first place.
  const showFullBar = isLargeScreen && sentinelVisible && !isOpen;

  return (
    <div>
      {showFullBar ? (
        // `absolute`, not `fixed` -- it needs to scroll away WITH Section 1's
        // content (not stay pinned to the viewport) as the user scrolls, and
        // only the collapsed toggle below should be `fixed`. With no
        // positioned/fixed ancestor between this and the document root, an
        // absolutely positioned element is placed relative to the page and
        // scrolls normally; only `position: fixed` would pin it in place.
        <div className="absolute inset-x-0 top-l z-30 h-14 px-page-margin-x">
          {/* content-cap: the site-wide desktop content cap -- without it,
              this row's justify-between spread the nav-links pill and
              Download button all the way to the true page margins at wide
              viewports, same issue every other uncapped section had.
              Moved px-page-margin-x up to the outer div (was on this one)
              so the 1140px measurement matches every other section's own
              convention -- pure content width, excluding the page margin,
              rather than the margin eating into the 1140px itself.
              NavSpacer's own centering trick (see its comment) still
              works identically at any width, since it only depends on
              matching the Download button's own size, not the row's total
              width. */}
          <div className="relative flex h-full w-full items-center justify-between rounded-large content-cap">
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
        // Wrapped in the same px-page-margin-x inset AND the same
        // content-cap as the full bar (rather than a separate right-only
        // margin) so the toggle's right edge lines up with the Download
        // button's right edge above it -- without the matching cap here,
        // the two would agree below xl but diverge above it, since the
        // full bar's own row now centers within 1140px instead of running
        // edge-to-edge.
        // global-nav-toggle: a stable hook (not a styling class) for
        // Section 12's own S-tier sticky nav to hide this via a body-level
        // CSS rule (see index.css) while its own sticky number row is
        // engaged -- the two would otherwise stack/overlap at the top of
        // the viewport since both are `fixed`/`sticky` at y:0.
        <div className="global-nav-toggle fixed inset-x-0 top-l z-50 h-14 px-page-margin-x">
          <div className="flex h-full w-full items-center justify-end content-cap">
            {isOpen ? (
              <CloseButton innerRef={toggleRef} onClick={handleToggleClick} label="Close navigation" aria-expanded={isOpen} />
            ) : (
              <button
                ref={toggleRef}
                type="button"
                onClick={handleToggleClick}
                aria-expanded={isOpen}
                aria-label="Open navigation"
                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-button-primary-orange text-button-inverted transition-colors duration-150 hover:bg-capy-orange-500 shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
              >
                <MaterialIcon name="menu" size={32} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* M and up: hugs its own content (logo + links + button) rather
          than covering the full viewport, per the reference -- page
          content stays visible peeking below the shadow. That's safe
          precisely because `inert` (above) already pulls the rest of the
          page out of both the tab order and the accessibility tree the
          moment this is open; a sighted user can see it, but nothing
          below is reachable or announced, so it can't be mistaken for
          interactive content.

          S: a genuinely different layout, not just a narrower version of
          the same one -- full-screen (fixed inset-0, not inset-x-0/
          top-0-only) so nothing of the page is visible OR reachable
          behind it, matching `inert`'s already-existing accessibility
          isolation with real visual isolation too. The two NavLinks stack
          at 100% width (w-full justify-center passed into each, added on
          top of their own default content-sized styling); the Download
          button stays its own default content-hugging size instead --
          only the plain-text links needed the full-width tap target, and
          stretching the button's own filled pill to match read as an
          unintentionally oversized CTA rather than matching the links'
          own treatment on purpose. The logo moves out of the content
          flow entirely to sit pinned at the bottom-left corner (own
          comment on the image below) rather than beside the links. */}
      <AnimatePresence>
        {isOpen &&
          (isAtLeastSm ? (
            <motion.div
              ref={panelRef}
              initial={shouldReduceMotion ? false : { y: '-100%' }}
              animate={{ y: 0 }}
              exit={shouldReduceMotion ? undefined : { y: '-100%' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-x-0 top-0 z-40 bg-bg-linen-light px-page-margin-x py-xl shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            >
              {/* content-cap: same site-wide desktop cap as every section --
                  without it, this row's own justify-center just centers
                  within the full page-margin-to-page-margin width, which is
                  what the panel used to do directly. Moved flex/items-end/
                  justify-center/gap-xl down from the motion.div itself onto
                  this inner wrapper so the panel's own background/shadow
                  band still spans full-bleed edge-to-edge (matching the
                  comment above about hugging content height, not width),
                  while only the actual content row gets capped+centered. */}
              <div className="flex w-full items-end justify-center gap-xl content-cap">
                <img src={desktopNav} alt="" aria-hidden="true" className="pointer-events-none h-auto w-[198px] flex-shrink-0" />

                <div className="flex flex-col items-center justify-start gap-xl">
                  {/* Matches the desktop full bar's own <nav aria-label="Primary">
                      (above) -- the mobile panel had the same two links but no
                      landmark of its own, so a screen reader's landmark list
                      simply had nothing to jump to while this panel was open.
                      className="contents" keeps it invisible to the flex/gap
                      layout (DownloadButton stays a sibling at the same gap-xl
                      spacing as before) while still being a real semantic
                      wrapper in the accessibility tree. */}
                  <nav aria-label="Primary" className="contents">
                    <NavLink href="#section-1" label="Home" isActive={activeSection === 'home'} innerRef={homeRef} />
                    <NavLink href="#contact" label="Contact us" isActive={activeSection === 'contact'} innerRef={contactRef} />
                  </nav>
                  <DownloadButton innerRef={downloadRef} />
                  {/* Trap-end focus guard -- own comment on handleTrapEnd above.
                      sr-only (not aria-hidden): must stay in the accessibility
                      tree and real tab order to actually be reachable by
                      swipe/Tab, just visually invisible. Real text content,
                      not empty -- an empty, unlabeled focusable element is a
                      known Safari/VoiceOver gap where swipe can skip straight
                      past it without ever landing focus there, which would
                      silently defeat the whole guard. */}
                  <button type="button" tabIndex={0} onFocus={handleTrapEnd} className="sr-only">
                    Return to close button
                  </button>
                </div>

                {/* Invisible twin of the image, same trick as NavSpacer above --
                    balances the image on the other side of the links column so
                    justify-center on the row centers the LINKS on the panel's
                    true center, rather than centering the image+links group as
                    one block (which would push the links right of center by
                    roughly half the image's own width). */}
                <div aria-hidden="true" className="pointer-events-none w-[198px] flex-shrink-0 opacity-0" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              ref={panelRef}
              initial={shouldReduceMotion ? false : { y: '-100%' }}
              animate={{ y: 0 }}
              exit={shouldReduceMotion ? undefined : { y: '-100%' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-0 z-40 flex flex-col bg-bg-linen-light px-page-margin-x pt-xl shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            >
              <div className="flex w-full flex-1 flex-col items-center justify-center gap-xl">
                {/* Same landmark gap as the M+ panel above -- own comment there. */}
                <nav aria-label="Primary" className="contents">
                  <NavLink
                    href="#section-1"
                    label="Home"
                    isActive={activeSection === 'home'}
                    innerRef={homeRef}
                    className="w-full justify-center"
                  />
                  <NavLink
                    href="#contact"
                    label="Contact us"
                    isActive={activeSection === 'contact'}
                    innerRef={contactRef}
                    className="w-full justify-center"
                  />
                </nav>
                <DownloadButton innerRef={downloadRef} />
                {/* Trap-end focus guard -- own comment on handleTrapEnd above. */}
                <button type="button" tabIndex={0} onFocus={handleTrapEnd} className="sr-only">
                  Return to close button
                </button>
              </div>

              {/* Pinned to the panel's own bottom-left corner, out of the
                  centered links' flow entirely. left explicitly reads the
                  same --spacing-page-margin-x custom property the panel's
                  own px-page-margin-x padding resolves to (16px at S) --
                  NOT plain `left-0`, which resolves against this `fixed`
                  ancestor's BORDER edge rather than its padding edge (so
                  it landed flush with the true screen edge, ignoring the
                  16px padding entirely, when tried). This way the image
                  lines up with the same edge inset every other section
                  measures its own content from, via the same token,
                  rather than a hardcoded one-off px value. bottom-[32px]:
                  the specific offset asked for, distinct from
                  page-margin-y (a larger value here). */}
              <img
                src={desktopNav}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[32px] h-auto w-[198px]"
                style={{ left: 'var(--spacing-page-margin-x)' }}
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}

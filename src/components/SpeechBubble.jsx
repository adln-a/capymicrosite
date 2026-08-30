import { motion } from 'framer-motion';

/**
 * Rounded bubble box + a 24x24 triangular tail directly beneath it, aligned
 * to whichever edge tailSide names. The tail's own shape never flips --
 * per the reference, every tail (left or right) uses the same fixed
 * geometry (right angle at its own top-left, point at its own bottom-left);
 * tailSide only changes which edge of the row it's justified against.
 * Positioning (left/top) is the caller's job -- pass it via className/style
 * on the root, same pattern as the rest of Section 3's absolutely-positioned
 * children.
 *
 * bgColor/textColorValue are optional escape hatches for scroll-driven
 * color (Section 3 Scene 2 crossfades every bubble to black-950 rather
 * than picking a color from a fixed class). Plain motion.* elements accept
 * either a static string or a Framer Motion MotionValue in `style`
 * transparently, so callers that don't need animation can just leave these
 * undefined and get the original class-driven colors.
 *
 * srText is an optional escape hatch for when the visible `text` is itself
 * a purely-visual restatement of content read elsewhere (Section 3 Scene 2
 * swaps every bubble's visible text to the same "Am I enough?", which is
 * just an emphasis effect on a message a screen reader already heard once
 * in Scene 1, not new content). When provided, the visible text is
 * aria-hidden and srText is rendered instead via a visually-hidden
 * (sr-only) node, so assistive tech always gets exactly one stable
 * reading of the real message regardless of which visual state is
 * currently showing.
 *
 * onFocus is another optional escape hatch, for callers whose own visual
 * reveal is driven by something other than normal document flow (Section
 * 3 Scene 2 again: each bubble's opacity/position is scrubbed directly
 * off scroll position, not an IntersectionObserver, so a screen reader
 * user swiping through -- which doesn't generate real scroll events --
 * could have this bubble's text announced while it's still sitting at
 * opacity:0 on screen). When provided, it's wired to the sr-only text
 * node specifically (the ONLY thing actually in the accessibility tree
 * once srText is active, since the visible text is aria-hidden right
 * above it) via a real tabIndex={-1} + onFocus, not just the visible
 * text -- tabIndex={-1} keeps it out of the normal Tab sequence, but
 * still reachable by a screen reader's own swipe navigation, which is
 * what actually fires this.
 *
 * size accepts 'hug' (both dimensions auto), {width, height} (both
 * fixed), or {width} alone (fixed width, height still hugs content) --
 * the last form is for bubbles whose text swaps between strings of very
 * different length (like the Section 3 Scene 2 crossfade): without a
 * fixed width, the box would visibly resize when the text changes, since
 * a pure hug box's width is derived from its current text content.
 * width/height are used AS-IS as CSS length values (not treated as bare
 * numbers with 'px' appended) -- callers pass a complete string like
 * "200px" or a container-query-width value like "54.9cqw" (Section 3
 * scales its whole bubble layout this way so it shrinks proportionally
 * with its container instead of overflowing at narrow widths).
 *
 * Padding uses the shared --spacing-l token (p-l: 24px, 40px from the true
 * xl/1200px breakpoint up) rather than a hardcoded pixel value -- matches
 * the Figma exports directly (XS/M frames both show padding:24px on this
 * box; only the desktop/XL frame uses 40px), and stays correct automatically
 * if that token's own breakpoint or values ever change, rather than drifting
 * out of sync with a second, hand-copied breakpoint.
 */
export default function SpeechBubble({
  bg,
  textColor,
  text,
  tailSide,
  size = 'hug',
  className = '',
  style,
  bgColor,
  textColorValue,
  srText,
  onFocus,
}) {
  const hasFixedWidth = size !== 'hug';
  const hasFixedHeight = hasFixedWidth && size.height !== undefined;
  // This build's Tailwind setup doesn't generate fill-* utilities for the
  // custom --color-* tokens (confirmed empty computed fill), so the tail
  // reads the same underlying CSS custom property directly instead --
  // bg-black-950 -> --color-black-950, bg-bg-light-green ->
  // --color-bg-light-green, etc. Same source of truth as the bg class,
  // just consumed as a variable instead of a utility class. When an
  // animated bgColor is supplied, the tail follows that instead so it
  // always matches the box regardless of which mode is active.
  const staticFill = `var(--color-${bg.replace(/^bg-/, '')})`;

  return (
    <div className={`flex flex-col items-end ${className}`} style={style}>
      <motion.div
        className={`flex items-center justify-center rounded-small p-l ${bg}`}
        style={{
          ...(hasFixedWidth ? { width: size.width } : undefined),
          ...(hasFixedHeight ? { height: size.height } : undefined),
          backgroundColor: bgColor,
        }}
      >
        <motion.p
          aria-hidden={srText ? 'true' : undefined}
          className={`heading-3 text-center ${hasFixedWidth ? 'flex-1' : ''} ${textColor}`}
          style={{ color: textColorValue }}
        >
          {text}
        </motion.p>
        {srText && (
          <span className="sr-only" tabIndex={onFocus ? -1 : undefined} onFocus={onFocus}>
            {srText}
          </span>
        )}
      </motion.div>
      <div
        className={`flex w-full items-center px-l ${
          tailSide === 'left' ? 'justify-start' : 'justify-end'
        }`}
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <motion.path d="M0 24V0H24L0 24Z" style={{ fill: bgColor ?? staticFill }} />
        </svg>
      </div>
    </div>
  );
}

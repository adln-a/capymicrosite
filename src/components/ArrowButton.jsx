import { MaterialIcon } from './icons.jsx';

/**
 * Round prev/next icon button, shared across sections that page through a
 * set of items (Section 9's slide row, Section 12's assumption/reality/
 * quote sets). `size`/`iconSize`/`bg` are the only things that vary
 * between call sites -- Section 9 uses a 48px linen-dark circle with a
 * 32px icon (matching its own reference spec), Section 12 uses a smaller
 * 32px white circle with a 24px icon (matching its own).
 *
 * A real, focusable, labeled control -- NOT aria-hidden, even though both
 * call sites also expose the same functionality to AT users some other
 * way (Section 9's slides are all in the DOM in reading order regardless
 * of which is centered; Section 12's tablist already offers Left/Right
 * arrow-key navigation between sets). aria-hidden+focusable was tried and
 * reverted: browsers actively detect a focused element that's hidden from
 * the accessibility tree and forcibly blur it (Chrome logs "Blocked
 * aria-hidden on an element because its descendant retained focus"),
 * which broke keyboard use entirely -- focus visibly vanished the moment
 * this button was activated. There's no attribute combination that gets
 * both "hidden from screen readers" and "reliably keyboard-focusable" at
 * once, so this stays a normal accessible button; a screen reader user
 * hears one extra "Previous/Next slide, button" as the only cost.
 */
export default function ArrowButton({ direction, onClick, label, size = 32, iconSize = 24, bg = 'bg-bg-white', className = '', style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? (direction === 'left' ? 'Previous' : 'Next')}
      className={`flex flex-shrink-0 cursor-pointer items-center justify-center rounded-full p-xs text-body-default transition-colors duration-150 hover:text-button-primary-orange ${bg} ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
    >
      <MaterialIcon name={direction === 'left' ? 'chevron_left' : 'chevron_right'} size={iconSize} />
    </button>
  );
}

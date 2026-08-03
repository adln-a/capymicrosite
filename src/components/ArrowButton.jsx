import { MaterialIcon } from './icons.jsx';

/**
 * Round prev/next icon button, shared across sections that page through a
 * set of items (Section 9's slide row, Section 12's assumption/reality/
 * quote sets). `size`/`iconSize`/`bg` are the only things that vary
 * between call sites -- Section 9 uses a 48px linen-dark circle with a
 * 32px icon (matching its own reference spec), Section 12 uses a smaller
 * 32px white circle with a 24px icon (matching its own).
 *
 * `decorative` (opt-in, off by default so Section 9's usage is unchanged)
 * hides the button from screen readers and the keyboard Tab order --
 * aria-hidden alone would leave a focusable-but-unannounced stop, so
 * tabIndex=-1 goes with it. For Section 12 specifically, these arrows
 * duplicate exactly what the tablist's own Left/Right arrow-key navigation
 * already does, so they add no capability for keyboard/AT users, only
 * visual convenience for mouse/touch ones.
 */
export default function ArrowButton({
  direction,
  onClick,
  label,
  size = 32,
  iconSize = 24,
  bg = 'bg-bg-white',
  className = '',
  style,
  decorative = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? (direction === 'left' ? 'Previous' : 'Next')}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className={`flex flex-shrink-0 cursor-pointer items-center justify-center rounded-full p-xs text-body-default transition-colors duration-150 hover:text-button-primary-orange ${bg} ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
    >
      <MaterialIcon name={direction === 'left' ? 'chevron_left' : 'chevron_right'} size={iconSize} />
    </button>
  );
}

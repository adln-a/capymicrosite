import { MaterialIcon } from './icons.jsx';

/**
 * Round prev/next icon button, shared across sections that page through a
 * set of items (Section 9's slide row, Section 12's assumption/reality/
 * quote sets). `size`/`iconSize`/`bg` are the only things that vary
 * between call sites -- Section 9 uses a 48px linen-dark circle with a
 * 32px icon (matching its own reference spec), Section 12 uses a smaller
 * 32px white circle with a 24px icon (matching its own).
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
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? (direction === 'left' ? 'Previous' : 'Next')}
      className={`flex flex-shrink-0 items-center justify-center rounded-full p-xs text-body-default ${bg} ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
    >
      <MaterialIcon name={direction === 'left' ? 'chevron_left' : 'chevron_right'} size={iconSize} />
    </button>
  );
}
